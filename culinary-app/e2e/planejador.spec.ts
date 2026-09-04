import { test, expect } from "@playwright/test";
import { pularPopupBoasVindas } from "./helpers";

test.beforeEach(async ({ page }) => {
  await pularPopupBoasVindas(page);
});

test.describe("Planejador editável", () => {
  test("adiciona uma receita a um slot vazio, depois remove", async ({ page }) => {
    await page.goto("/planejador");

    const seletor = page.getByLabel("Adicionar receita para QUA CAFÉ");
    await seletor.scrollIntoViewIfNeeded();
    await seletor.selectOption({ label: "Ovos Mexidos Perfeitos" });

    const link = page.getByRole("link", { name: /ovos mexidos perfeitos/i });
    await expect(link).toBeVisible();

    const botaoRemover = page.getByRole("button", { name: /remover ovos mexidos perfeitos/i });
    await botaoRemover.click();

    await expect(link).not.toBeVisible();
  });

  test("clicar em uma refeição já planejada navega direto para a página da receita", async ({
    page,
  }) => {
    await page.goto("/planejador");

    await page.getByRole("link", { name: /salmão grelhado com aspargos/i }).click();

    await expect(page).toHaveURL(/\/receitas\/salmao-grelhado-aspargos/);
    await expect(page.getByRole("heading", { name: "Salmão Grelhado com Aspargos" })).toBeVisible();
  });
});
