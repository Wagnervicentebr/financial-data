import { expect, test } from "@playwright/test";
import {
  createTestUser,
  decodeSessionCookie,
  deleteTestUserByEmail,
  getSessionCookieValue,
  loginViaUi,
} from "./helpers/auth";

const GENERIC_ERROR = "E-mail ou senha inválidos.";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

test.describe("Login", () => {
  test("entra com e-mail e senha corretos", async ({ page }) => {
    const user = await createTestUser();

    try {
      await loginViaUi(page, user);
      await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
    } finally {
      await deleteTestUserByEmail(user.email);
    }
  });

  test("mostra a mesma mensagem genérica para senha errada e para e-mail inexistente", async ({
    page,
  }) => {
    const user = await createTestUser();

    try {
      await page.goto("/login");
      await page.getByLabel("E-mail").fill(user.email);
      await page.getByLabel("Senha").fill("SenhaErrada123");
      await page.getByRole("button", { name: "Entrar", exact: true }).click();

      await expect(page.getByRole("alert").filter({ hasText: GENERIC_ERROR })).toBeVisible();
      await expect(page).toHaveURL("/login");

      await page.getByLabel("E-mail").fill("ninguem-cadastrado@example.com");
      await page.getByLabel("Senha").fill("QualquerSenha123");
      await page.getByRole("button", { name: "Entrar", exact: true }).click();

      await expect(page.getByRole("alert").filter({ hasText: GENERIC_ERROR })).toBeVisible();
      await expect(page).toHaveURL("/login");
    } finally {
      await deleteTestUserByEmail(user.email);
    }
  });

  test("'lembrar de mim' mantém uma sessão bem mais longa que a padrão", async ({ browser }) => {
    const standardUser = await createTestUser();
    const rememberedUser = await createTestUser();

    const standardContext = await browser.newContext();
    const rememberedContext = await browser.newContext();

    try {
      const standardPage = await standardContext.newPage();
      await loginViaUi(standardPage, standardUser, { rememberMe: false });
      const standardPayload = await decodeSessionCookie(
        await getSessionCookieValue(standardContext)
      );

      const rememberedPage = await rememberedContext.newPage();
      await loginViaUi(rememberedPage, rememberedUser, { rememberMe: true });
      const rememberedPayload = await decodeSessionCookie(
        await getSessionCookieValue(rememberedContext)
      );

      expect(standardPayload?.expiresAt).toBeDefined();
      expect(rememberedPayload?.expiresAt).toBeDefined();

      const now = Date.now();
      const standardDurationDays = (standardPayload!.expiresAt! - now) / ONE_DAY_MS;
      const rememberedDurationDays = (rememberedPayload!.expiresAt! - now) / ONE_DAY_MS;

      // Standard session: ~1 day. "Lembrar de mim": ~30 days (techspec,
      // "Sessão 'lembrar-me' via claim customizada"). Wide tolerance windows
      // avoid flakiness from clock drift between the app and the test runner.
      expect(standardDurationDays).toBeGreaterThan(0.9);
      expect(standardDurationDays).toBeLessThan(1.1);
      expect(rememberedDurationDays).toBeGreaterThan(29);
      expect(rememberedDurationDays).toBeLessThan(31);
      expect(rememberedDurationDays).toBeGreaterThan(standardDurationDays);
    } finally {
      await standardContext.close();
      await rememberedContext.close();
      await deleteTestUserByEmail(standardUser.email);
      await deleteTestUserByEmail(rememberedUser.email);
    }
  });
});
