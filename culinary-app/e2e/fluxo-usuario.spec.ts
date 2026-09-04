import { test, expect } from "@playwright/test";

test.describe("Popup de boas-vindas e nome do cozinheiro", () => {
  test("exibe o popup na primeira visita e permite informar o nome", async ({ page }) => {
    await page.goto("/");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByText("Bem-vindo ao Culinary")).toBeVisible();

    await page.getByLabel("Seu nome").fill("Maria");
    await page.getByRole("button", { name: /continuar/i }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("button", { name: /alterar nome do cozinheiro/i })).toContainText(
      "Maria",
    );
  });

  test("o nome permanece após recarregar a página (persistência)", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Seu nome").fill("João");
    await page.getByRole("button", { name: /continuar/i }).click();

    await page.reload();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByRole("button", { name: /alterar nome do cozinheiro/i })).toContainText(
      "João",
    );
  });

  test("clicar no nome no NavBar reabre o popup para trocar o nome", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Seu nome").fill("Carlos");
    await page.getByRole("button", { name: /continuar/i }).click();

    await page.getByRole("button", { name: /alterar nome do cozinheiro/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByLabel("Seu nome").fill("Beatriz");
    await page.getByRole("button", { name: /continuar/i }).click();

    await expect(page.getByRole("button", { name: /alterar nome do cozinheiro/i })).toContainText(
      "Beatriz",
    );
  });
});
