// `export {}` forces this file to be treated as a module so the blocks below
// augment next-auth's real types instead of replacing the whole ambient module.
export {};

// Session-duration claim used by the "remember me" flow (requisito 9 do PRD):
// carried on User -> JWT at sign-in, then surfaced on Session for middleware.ts.
declare module "next-auth" {
  interface Session {
    expiresAt?: number;
  }

  interface User {
    rememberMe?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    expiresAt?: number;
  }
}
