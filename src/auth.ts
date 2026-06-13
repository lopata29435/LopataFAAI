import NextAuth from "next-auth";
import ZITADEL from "next-auth/providers/zitadel";

/**
 * Auth.js v5 with ZITADEL (OIDC). Inert until the ZITADEL app is wired and
 * AUTH_ENABLED=true — endpoints exist but nothing enforces login otherwise.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    ZITADEL({
      issuer: process.env.ZITADEL_ISSUER,
      clientId: process.env.ZITADEL_CLIENT_ID ?? "",
      clientSecret: process.env.ZITADEL_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    jwt({ token, profile }) {
      if (profile?.sub) token.oidcSub = profile.sub as string;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.oidcSub) {
        (session.user as { sub?: string }).sub = token.oidcSub as string;
      }
      return session;
    },
  },
});
