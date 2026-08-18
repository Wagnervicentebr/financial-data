import { expect, test } from "@playwright/test";
import {
  createExpiredResetToken,
  createTestUser,
  createValidResetToken,
  deleteTestUserByEmail,
  loginViaUi,
} from "./helpers/auth";

const NEW_PASSWORD = "NovaSenha123";

test.describe("Recuperação de senha", () => {
  test("fluxo completo: solicitar link, redefinir e entrar com a nova senha", async ({ page }) => {
    const user = await createTestUser();

    try {
      await page.goto("/esqueci-senha");
      await page.getByLabel("E-mail").fill(user.email);
      await page.getByRole("button", { name: "Enviar link" }).click();

      // Mensagem neutra: não revela se o e-mail existe na base (requisito 18).
      const confirmation = page.getByRole("status");
      await expect(confirmation).toContainText("Verifique seu e-mail");

      const token = await createValidResetToken(user.id);
      await page.goto(`/redefinir-senha?token=${token}`);

      await page.getByLabel("Nova senha", { exact: true }).fill(NEW_PASSWORD);
      await page.getByLabel("Confirmar nova senha").fill(NEW_PASSWORD);
      await page.getByRole("button", { name: "Redefinir senha" }).click();

      const success = page.getByRole("status");
      await expect(success).toContainText("Senha alterada");

      await page.waitForURL("/login", { timeout: 10_000 });

      await loginViaUi(page, { email: user.email, password: NEW_PASSWORD });
      await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
    } finally {
      await deleteTestUserByEmail(user.email);
    }
  });

  test("rejeita um token de redefinição expirado", async ({ page }) => {
    const user = await createTestUser();

    try {
      const expiredToken = await createExpiredResetToken(user.id);
      await page.goto(`/redefinir-senha?token=${expiredToken}`);

      await page.getByLabel("Nova senha", { exact: true }).fill(NEW_PASSWORD);
      await page.getByLabel("Confirmar nova senha").fill(NEW_PASSWORD);
      await page.getByRole("button", { name: "Redefinir senha" }).click();

      const invalidCard = page.getByRole("alert").filter({ hasText: "Link inválido" });
      await expect(invalidCard).toContainText("Link inválido");
      await expect(invalidCard).toContainText("expirou");
    } finally {
      await deleteTestUserByEmail(user.email);
    }
  });
});
