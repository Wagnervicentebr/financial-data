"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import {
  generateResetToken,
  hashPassword,
  hashResetToken,
  isResetTokenExpired,
} from "@/lib/auth/password";
import { Prisma } from "@/lib/generated/prisma/client";
import { sendPasswordResetEmail } from "@/lib/mail/resend";
import { prisma } from "@/lib/prisma";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/lib/validations/auth";

export type ActionResult = { ok: true } | { ok: false; message: string };

const GENERIC_LOGIN_ERROR = "E-mail ou senha inválidos.";
const GENERIC_SERVER_ERROR = "Não foi possível concluir a operação. Tente novamente em instantes.";
const INVALID_OR_EXPIRED_TOKEN_ERROR =
  "Este link de redefinição é inválido ou expirou. Solicite um novo link.";
const RESET_PASSWORD_PATH = "/redefinir-senha";

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function registerUser(input: unknown): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { ok: false, message: "Este e-mail já possui uma conta. Tente entrar." };
  }

  const passwordHash = await hashPassword(password);
  try {
    await prisma.user.create({ data: { name, email, passwordHash } });
  } catch (error) {
    // Two concurrent sign-ups for the same e-mail can both pass the
    // findUnique check above; the unique constraint on User.email is the
    // real guard, so a P2002 here means "e-mail already taken", not a
    // generic server error.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "Este e-mail já possui uma conta. Tente entrar." };
    }
    throw error;
  }

  try {
    // Signs the person in right after registration — no e-mail confirmation
    // step, per PRD requisito 4.
    await signIn("credentials", {
      email,
      password,
      rememberMe: "false",
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: GENERIC_SERVER_ERROR };
    }
    throw error;
  }

  return { ok: true };
}

export async function loginWithCredentials(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? GENERIC_LOGIN_ERROR };
  }

  const { email, password, rememberMe } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
      rememberMe: String(rememberMe),
      redirect: false,
    });
  } catch (error) {
    // Same message regardless of whether the e-mail or the password was
    // wrong, so failed attempts can't be used to discover existing accounts
    // (PRD requisito 10).
    if (error instanceof AuthError) {
      return { ok: false, message: GENERIC_LOGIN_ERROR };
    }
    throw error;
  }

  return { ok: true };
}

export async function requestPasswordReset(input: unknown): Promise<{ ok: true }> {
  const parsed = forgotPasswordSchema.safeParse(input);

  if (parsed.success) {
    try {
      const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

      // Google-only accounts have no passwordHash and can't go through
      // password reset (PRD requisito 23).
      if (user?.passwordHash) {
        const { token, tokenHash, expiresAt } = generateResetToken();

        await prisma.passwordResetToken.create({
          data: { tokenHash, userId: user.id, expiresAt },
        });

        const resetUrl = `${getSiteUrl()}${RESET_PASSWORD_PATH}?token=${token}`;
        const { ok } = await sendPasswordResetEmail({ to: user.email, resetUrl });
        if (!ok) {
          console.error(`[auth] failed to send password reset e-mail to user ${user.id}`);
        }
      }
    } catch (error) {
      // Never let a DB/Resend failure escape as a thrown error here: besides
      // exposing technical detail, an exception only on the
      // "account exists with a password" path would itself leak that fact
      // to whoever is watching the response (PRD requisito 18).
      console.error("[auth] requestPasswordReset failed", error);
    }
  }

  // Always the same neutral response — never reveals whether the e-mail
  // exists in the database (PRD requisito 18).
  return { ok: true };
}

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { token, password } = parsed.data;
  const tokenHash = hashResetToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || isResetTokenExpired(resetToken.expiresAt)) {
    return { ok: false, message: INVALID_OR_EXPIRED_TOKEN_ERROR };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true };
}
