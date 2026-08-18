import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/lib/validations/auth";

describe("signUpSchema", () => {
  const validInput = {
    name: "Maria Silva",
    email: "maria@example.com",
    password: "Senha123",
    confirmPassword: "Senha123",
  };

  it("accepts a valid sign-up payload", () => {
    expect(signUpSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects an invalid e-mail", () => {
    const result = signUpSchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a weak password (too short, no uppercase/number)", () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      password: "abc",
      confirmPassword: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched password confirmation", () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      confirmPassword: "Outrasenha123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("confirmPassword");
    }
  });
});

describe("loginSchema", () => {
  it("accepts a valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "maria@example.com",
      password: "qualquer-senha",
    });
    expect(result.success).toBe(true);
  });

  it("defaults rememberMe to false when omitted", () => {
    const result = loginSchema.safeParse({
      email: "maria@example.com",
      password: "qualquer-senha",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rememberMe).toBe(false);
    }
  });

  it("rejects an invalid e-mail", () => {
    const result = loginSchema.safeParse({
      email: "invalido",
      password: "qualquer-senha",
    });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts a valid e-mail", () => {
    expect(forgotPasswordSchema.safeParse({ email: "maria@example.com" }).success).toBe(
      true
    );
  });

  it("rejects an invalid e-mail", () => {
    expect(forgotPasswordSchema.safeParse({ email: "invalido" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts a valid reset payload", () => {
    const result = resetPasswordSchema.safeParse({
      token: "opaque-token",
      password: "NovaSenha123",
      confirmPassword: "NovaSenha123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a weak password", () => {
    const result = resetPasswordSchema.safeParse({
      token: "opaque-token",
      password: "fraca",
      confirmPassword: "fraca",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched password confirmation", () => {
    const result = resetPasswordSchema.safeParse({
      token: "opaque-token",
      password: "NovaSenha123",
      confirmPassword: "OutraSenha123",
    });
    expect(result.success).toBe(false);
  });
});
