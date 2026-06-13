import NextAuth from "next-auth";
import { and, eq, isNull } from "drizzle-orm";
import { authConfig } from "./auth.config";
import { getDb, schema } from "@/db";

/**
 * Map a ZITADEL identity to a row in our users table. For the single-user
 * phase this links the seeded user to the OIDC subject; otherwise creates one.
 */
async function ensureUser(
  issuer: string,
  sub: string,
  email?: string | null,
  name?: string | null,
): Promise<string> {
  const db = getDb();

  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(and(eq(schema.users.oidcIssuer, issuer), eq(schema.users.oidcSub, sub)))
    .limit(1);
  if (existing) return existing.id;

  const [unlinked] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(isNull(schema.users.oidcSub))
    .orderBy(schema.users.createdAt)
    .limit(1);
  if (unlinked) {
    await db
      .update(schema.users)
      .set({ oidcIssuer: issuer, oidcSub: sub, email: email ?? null })
      .where(eq(schema.users.id, unlinked.id));
    return unlinked.id;
  }

  const [created] = await db
    .insert(schema.users)
    .values({ name: name ?? "Пользователь", email: email ?? null, oidcIssuer: issuer, oidcSub: sub })
    .returning({ id: schema.users.id });
  return created.id;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, profile }) {
      if (profile?.sub) {
        const t = token as Record<string, unknown>;
        t.oidcSub = profile.sub;
        try {
          t.userId = await ensureUser(
            process.env.ZITADEL_ISSUER ?? "",
            profile.sub,
            (profile.email as string | undefined) ?? null,
            (profile.name as string | undefined) ?? null,
          );
        } catch {
          // never block login on a transient DB error
        }
      }
      return token;
    },
  },
});
