import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUserByEmail, loginViaUi } from "./helpers/auth";

test("demo item: create, view, edit and delete", async ({ page }) => {
  const title = `Item E2E ${Date.now()}`;
  const updatedTitle = `${title} (editado)`;

  // "/" is behind auth (proxy.ts) since the authentication feature landed —
  // an anonymous visit now redirects to /login before the panel ever renders.
  const user = await createTestUser();
  try {
    await loginViaUi(page, user);

    // Create
    await page.getByRole("button", { name: "Novo item" }).click();
    await page.getByLabel("Título").fill(title);
    await page.getByRole("button", { name: "Criar" }).click();

    const row = page.getByRole("row", { name: new RegExp(title) });
    await expect(row).toBeVisible();

    // Edit
    await row.getByRole("button", { name: `Editar ${title}` }).click();
    const titleInput = page.getByLabel("Título");
    await titleInput.fill(updatedTitle);
    await page.getByRole("button", { name: "Salvar" }).click();

    const updatedRow = page.getByRole("row", { name: new RegExp(updatedTitle) });
    await expect(updatedRow).toBeVisible();

    // Delete
    await updatedRow.getByRole("button", { name: `Excluir ${updatedTitle}` }).click();
    await expect(updatedRow).not.toBeVisible();
  } finally {
    await deleteTestUserByEmail(user.email);
  }
});
