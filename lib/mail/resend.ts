import { Resend } from "resend";

// Resend's own test sender works in development without a verified domain;
// production deployments should override with a verified domain via env.
const DEFAULT_FROM_EMAIL = "Financial Dashboard <onboarding@resend.dev>";

// Built lazily (not at module scope): the `Resend` constructor throws
// synchronously when the API key is missing, which would otherwise crash
// this whole module on import — breaking registerUser/loginWithCredentials
// too, even though neither one touches Resend. Deferring construction keeps
// the failure scoped to an actual send attempt, where requestPasswordReset
// already catches it and returns its neutral response.
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}): Promise<{ ok: boolean }> {
  const { to, resetUrl } = params;

  const { error } = await getResendClient().emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
    to,
    subject: "Redefinição de senha",
    html: `
      <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
      <p><a href="${resetUrl}">Clique aqui para criar uma nova senha</a>.</p>
      <p>Este link é válido por tempo limitado. Se você não solicitou essa alteração, ignore este e-mail.</p>
    `,
  });

  if (error) {
    console.error("[resend] failed to send password reset email", error);
    return { ok: false };
  }

  return { ok: true };
}
