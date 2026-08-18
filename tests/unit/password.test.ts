import { describe, expect, it } from "vitest";
import {
  generateResetToken,
  hashPassword,
  hashResetToken,
  isResetTokenExpired,
  verifyPassword,
} from "@/lib/auth/password";

describe("hashPassword / verifyPassword", () => {
  it("hashes a password and verifies the correct value", async () => {
    const hash = await hashPassword("Senha123");
    expect(hash).not.toBe("Senha123");
    expect(await verifyPassword("Senha123", hash)).toBe(true);
  });

  it("rejects an incorrect password against the stored hash", async () => {
    const hash = await hashPassword("Senha123");
    expect(await verifyPassword("SenhaErrada123", hash)).toBe(false);
  });
});

describe("generateResetToken / hashResetToken", () => {
  it("generates a token whose hash matches hashResetToken(token)", () => {
    const { token, tokenHash } = generateResetToken();
    expect(hashResetToken(token)).toBe(tokenHash);
  });

  it("never stores the raw token as its own hash", () => {
    const { token, tokenHash } = generateResetToken();
    expect(tokenHash).not.toBe(token);
  });

  it("produces a token that is not yet expired", () => {
    const { expiresAt } = generateResetToken();
    expect(isResetTokenExpired(expiresAt)).toBe(false);
  });
});

describe("isResetTokenExpired", () => {
  it("returns true for a date in the past", () => {
    expect(isResetTokenExpired(new Date(Date.now() - 1000))).toBe(true);
  });

  it("returns false for a date in the future", () => {
    expect(isResetTokenExpired(new Date(Date.now() + 60_000))).toBe(false);
  });
});
