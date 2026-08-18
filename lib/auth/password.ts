import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const RESET_TOKEN_TTL_MINUTES = 60;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export type ResetToken = {
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

// The raw token goes in the e-mail link; only its hash is persisted, so a
// database read alone never yields a usable reset link (PRD requisito 20).
export function generateResetToken(): ResetToken {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  return { token, tokenHash: hashResetToken(token), expiresAt };
}

// SHA-256 (not bcrypt) on purpose: the token already has 256 bits of entropy
// from randomBytes, and a deterministic digest lets the lookup query match
// on tokenHash directly instead of bcrypt-comparing every stored token.
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isResetTokenExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() < Date.now();
}
