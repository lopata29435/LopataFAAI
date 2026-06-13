import type { NextAuthConfig } from "next-auth";
import ZITADEL from "next-auth/providers/zitadel";

/**
 * Base config (no DB imports). The full config (with the DB-backed jwt
 * callback) lives in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    ZITADEL({
      issuer: process.env.ZITADEL_ISSUER,
      clientId: process.env.ZITADEL_CLIENT_ID ?? "",
      clientSecret: process.env.ZITADEL_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    session({ session, token }) {
      const t = token as Record<string, unknown>;
      if (session.user) {
        const u = session.user as unknown as Record<string, unknown>;
        u.sub = t.oidcSub;
        u.userId = t.userId;
      }
      return session;
    },
  },
};
