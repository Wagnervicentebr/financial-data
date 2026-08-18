import type { NextAuthConfig } from "next-auth";

const DAY_IN_SECONDS = 24 * 60 * 60;
export const STANDARD_SESSION_DAYS = 1;
export const REMEMBER_ME_SESSION_DAYS = 30;

// Config compartilhada entre auth.ts (Node runtime: Prisma + bcrypt) e
// middleware.ts (Edge runtime). Fica sem `providers`/adapter porque o
// Prisma Adapter e o bcryptjs usados pelo CredentialsProvider dependem de
// APIs Node que o Edge Runtime não suporta — o middleware só precisa
// decodificar o JWT da sessão, não fazer authorize/DB lookup.
export const authConfig = {
  session: {
    strategy: "jwt",
    // Teto do cookie; a duração real da sessão é a claim `expiresAt`
    // calculada no callback `jwt` de auth.ts (ver Decisões Principais na techspec).
    maxAge: REMEMBER_ME_SESSION_DAYS * DAY_IN_SECONDS,
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const rememberMe = user.rememberMe === true;
        const days = rememberMe ? REMEMBER_ME_SESSION_DAYS : STANDARD_SESSION_DAYS;
        token.expiresAt = Date.now() + days * DAY_IN_SECONDS * 1000;
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.expiresAt === "number") {
        session.expiresAt = token.expiresAt;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
