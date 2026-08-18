import { beforeEach, describe, expect, it, vi } from "vitest";

// The real "next-auth" package pulls in next/server at import time, which
// isn't resolvable under Vitest (no live Next.js runtime). Only AuthError is
// needed here, so it's mocked with an equivalent class instead of importing
// the real package.
vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {
    type: string;
    constructor(type: string) {
      super(type);
      this.type = type;
    }
  },
}));
import { hashResetToken } from "@/lib/auth/password";
import { Prisma } from "@/lib/generated/prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/auth", () => ({
  signIn: vi.fn(),
}));

vi.mock("@/lib/mail/resend", () => ({
  sendPasswordResetEmail: vi.fn(),
}));

const { prisma } = await import("@/lib/prisma");
const { signIn } = await import("@/auth");
const { sendPasswordResetEmail } = await import("@/lib/mail/resend");
const { AuthError } = await import("next-auth");
const { registerUser, loginWithCredentials, requestPasswordReset, resetPassword } = await import(
  "@/server/actions/auth"
);

const validSignUp = {
  name: "Maria Silva",
  email: "maria@example.com",
  password: "Senha123",
  confirmPassword: "Senha123",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("registerUser", () => {
  it("rejects invalid input before touching the database", async () => {
    const result = await registerUser({ ...validSignUp, confirmPassword: "different" });

    expect(result.ok).toBe(false);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("blocks sign-up with an e-mail that already has an account", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "1" } as never);

    const result = await registerUser(validSignUp);

    expect(result).toEqual({
      ok: false,
      message: expect.stringContaining("já possui uma conta"),
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("creates the user with a hashed password (never plaintext) and signs them in immediately", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({} as never);
    vi.mocked(signIn).mockResolvedValue(undefined as never);

    const result = await registerUser(validSignUp);

    expect(result).toEqual({ ok: true });
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    const createArgs = vi.mocked(prisma.user.create).mock.calls[0]?.[0];
    expect(createArgs?.data.passwordHash).toBeDefined();
    expect(createArgs?.data.passwordHash).not.toBe(validSignUp.password);
    expect(signIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({ email: validSignUp.email, redirect: false })
    );
  });

  it("treats a concurrent duplicate e-mail (unique constraint) the same as the pre-check", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed on the fields: (`email`)", {
        code: "P2002",
        clientVersion: "test",
      })
    );

    const result = await registerUser(validSignUp);

    expect(result).toEqual({
      ok: false,
      message: expect.stringContaining("já possui uma conta"),
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it("returns a generic error if sign-in after registration fails", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({} as never);
    vi.mocked(signIn).mockRejectedValue(new AuthError("CallbackRouteError"));

    const result = await registerUser(validSignUp);

    expect(result.ok).toBe(false);
  });
});

describe("loginWithCredentials", () => {
  it("returns a generic error for wrong credentials, without saying which field failed", async () => {
    vi.mocked(signIn).mockRejectedValue(new AuthError("CredentialsSignin"));

    const result = await loginWithCredentials({
      email: "maria@example.com",
      password: "wrong",
    });

    expect(result).toEqual({ ok: false, message: "E-mail ou senha inválidos." });
  });

  it("signs in successfully with correct credentials and forwards rememberMe", async () => {
    vi.mocked(signIn).mockResolvedValue(undefined as never);

    const result = await loginWithCredentials({
      email: "maria@example.com",
      password: "Senha123",
      rememberMe: true,
    });

    expect(result).toEqual({ ok: true });
    expect(signIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({ rememberMe: "true" })
    );
  });
});

describe("requestPasswordReset", () => {
  it("returns the same neutral response for a non-existent e-mail", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await requestPasswordReset({ email: "ghost@example.com" });

    expect(result).toEqual({ ok: true });
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("does not send a reset e-mail for a Google-only account (no passwordHash)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "1",
      email: "google@example.com",
      passwordHash: null,
    } as never);

    const result = await requestPasswordReset({ email: "google@example.com" });

    expect(result).toEqual({ ok: true });
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("generates a token and sends the e-mail for an account with a password", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "1",
      email: "maria@example.com",
      passwordHash: "hash",
    } as never);
    vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({} as never);
    vi.mocked(sendPasswordResetEmail).mockResolvedValue({ ok: true });

    const result = await requestPasswordReset({ email: "maria@example.com" });

    expect(result).toEqual({ ok: true });
    expect(prisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "maria@example.com" })
    );
  });

  it("still returns ok even if sending the e-mail fails (logged, not exposed)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "1",
      email: "maria@example.com",
      passwordHash: "hash",
    } as never);
    vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({} as never);
    vi.mocked(sendPasswordResetEmail).mockResolvedValue({ ok: false });

    const result = await requestPasswordReset({ email: "maria@example.com" });

    expect(result).toEqual({ ok: true });
  });

  it("still returns the same neutral ok even if Resend throws instead of resolving", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "1",
      email: "maria@example.com",
      passwordHash: "hash",
    } as never);
    vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({} as never);
    vi.mocked(sendPasswordResetEmail).mockRejectedValue(new Error("network down"));

    const result = await requestPasswordReset({ email: "maria@example.com" });

    // A thrown error here (vs. the clean { ok: true } from the non-existent
    // and Google-only cases) would itself leak that this account exists and
    // has a password — the whole branch must be exception-safe.
    expect(result).toEqual({ ok: true });
  });
});

describe("resetPassword", () => {
  const token = "raw-token";

  it("rejects a token that does not exist", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(null);

    const result = await resetPassword({
      token,
      password: "NovaSenha123",
      confirmPassword: "NovaSenha123",
    });

    expect(result.ok).toBe(false);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects an expired token", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
      id: "1",
      tokenHash: hashResetToken(token),
      userId: "1",
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    } as never);

    const result = await resetPassword({
      token,
      password: "NovaSenha123",
      confirmPassword: "NovaSenha123",
    });

    expect(result.ok).toBe(false);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects an already used token", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
      id: "1",
      tokenHash: hashResetToken(token),
      userId: "1",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    } as never);

    const result = await resetPassword({
      token,
      password: "NovaSenha123",
      confirmPassword: "NovaSenha123",
    });

    expect(result.ok).toBe(false);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("updates the password and marks the token as used on success", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
      id: "1",
      tokenHash: hashResetToken(token),
      userId: "1",
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    } as never);
    vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}] as never);

    const result = await resetPassword({
      token,
      password: "NovaSenha123",
      confirmPassword: "NovaSenha123",
    });

    expect(result).toEqual({ ok: true });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
