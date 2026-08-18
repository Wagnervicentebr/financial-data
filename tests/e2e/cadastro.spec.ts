import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createTestUser, deleteTestUserByEmail, DEFAULT_TEST_PASSWORD } from "./helpers/auth";

test.describe("Cadastro", () => {
  test("cria a conta e dá acesso imediato ao painel, sem confirmação de e-mail", async ({
    page,
  }) => {
    const email = `e2e-signup-${randomUUID()}@example.com`;

    try {
      await page.goto("/cadastro");

      await page.getByLabel("Nome").fill("Pessoa Nova");
      await page.getByLabel("E-mail").fill(email);
      await page.getByLabel("Senha", { exact: true }).fill(DEFAULT_TEST_PASSWORD);
      await page.getByLabel("Confirmar senha").fill(DEFAULT_TEST_PASSWORD);
      await page.getByRole("button", { name: "Criar conta" }).click();

      await page.waitForURL("/");
      await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
    } finally {
      await deleteTestUserByEmail(email);
    }
  });

  test("bloqueia cadastro com um e-mail que já possui conta", async ({ page }) => {
    const existing = await createTestUser();

    try {
      await page.goto("/cadastro");

      await page.getByLabel("Nome").fill("Outra Pessoa");
      await page.getByLabel("E-mail").fill(existing.email);
      await page.getByLabel("Senha", { exact: true }).fill(DEFAULT_TEST_PASSWORD);
      await page.getByLabel("Confirmar senha").fill(DEFAULT_TEST_PASSWORD);
      await page.getByRole("button", { name: "Criar conta" }).click();

      await expect(
        page.getByRole("alert").filter({ hasText: "já possui uma conta" })
      ).toBeVisible();
      await expect(page).toHaveURL("/cadastro");
    } finally {
      await deleteTestUserByEmail(existing.email);
    }
  });
});
