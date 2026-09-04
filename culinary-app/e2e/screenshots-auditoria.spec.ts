import { test, type Page } from "@playwright/test";
import { pularPopupBoasVindas } from "./helpers";

test.beforeEach(async ({ page }) => {
  await pularPopupBoasVindas(page);
});

async function mockarWebSpeechAPI(page: Page) {
  await page.addInitScript(() => {
    class MockUtterance {
      text: string;
      lang = "";
      rate = 1;
      pitch = 1;
      volume = 1;
      voice: unknown = null;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: MockUtterance,
      writable: true,
    });
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        cancel: () => {},
        speak: (u: MockUtterance) => u.onstart?.(),
        getVoices: () => [
          { name: "Luciana", lang: "pt-BR", localService: true, default: true, voiceURI: "Luciana" },
        ],
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      writable: true,
    });
  });
}

/**
 * Gera screenshots reais da implementação atual para comparação manual
 * com os screen.png do Stitch (stitch_culin_ria_minimalista_parallax/).
 * Não é um teste de asserção — apenas captura evidência visual (MT-014).
 */
test.describe("Screenshots para auditoria visual (MT-014)", () => {
  test("Receitas", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: `../screenshots-auditoria/receitas-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });

  test("Lista de Ingredientes", async ({ page }, testInfo) => {
    await page.goto("/lista");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `../screenshots-auditoria/lista-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });

  test("Planejador", async ({ page }, testInfo) => {
    await page.goto("/planejador");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: `../screenshots-auditoria/planejador-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });

  test("Cozinhar - seleção de receitas", async ({ page }, testInfo) => {
    await page.goto("/cozinhar");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: `../screenshots-auditoria/cozinhar-selecao-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });

  test("Cozinhar - pré-início com botão Iniciar receita", async ({ page }, testInfo) => {
    await mockarWebSpeechAPI(page);
    await page.goto("/cozinhar/massa-fresca-classica");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /iniciar receita/i }).waitFor();
    await page.screenshot({
      path: `../screenshots-auditoria/cozinhar-inicio-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });

  test("Cozinhando Agora - passo 1 com timer e Repetir instrução", async ({ page }, testInfo) => {
    await mockarWebSpeechAPI(page);
    await page.goto("/cozinhar/massa-fresca-classica");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /iniciar receita/i }).click();
    await page.getByRole("button", { name: /repetir instrução/i }).waitFor();
    await page.screenshot({
      path: `../screenshots-auditoria/cozinhando-agora-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });

  test("Cozinhando Agora - passo 2 após avançar", async ({ page }, testInfo) => {
    await mockarWebSpeechAPI(page);
    await page.goto("/cozinhar/massa-fresca-classica");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /iniciar receita/i }).click();
    await page.getByRole("button", { name: /próximo passo/i }).click();
    await page.getByText(/PASSO 2 DE/).waitFor();
    await page.screenshot({
      path: `../screenshots-auditoria/cozinhando-agora-passo2-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});
