import { test, expect, type Page } from "@playwright/test";
import { pularPopupBoasVindas } from "./helpers";

test.beforeEach(async ({ page }) => {
  await pularPopupBoasVindas(page);
});

/**
 * Fluxo E2E obrigatório (correção MT-014): Cozinhar -> selecionar receita ->
 * "Iniciar receita" -> modo guiado -> narração automática do passo 1 ->
 * "Repetir instrução" -> avançar (narração automática do novo passo) ->
 * timer -> sair (cancelamento da fala) -> sem erros de console.
 *
 * A Web Speech API é MOCKADA via `page.addInitScript` porque não há
 * síntese de voz real em ambiente headless. O mock comprova o comportamento
 * técnico (chamadas de speak/cancel, lang pt-BR), NÃO a naturalidade da voz
 * — essa distinção fica explícita na documentação da minitask e depende de
 * validação auditiva humana no macOS.
 */
async function mockarWebSpeechAPI(page: Page) {
  await page.addInitScript(() => {
    const chamadas: { texto: string; lang: string; rate: number; pitch: number }[] = [];
    (window as unknown as { __speechCalls: typeof chamadas }).__speechCalls = chamadas;
    let cancelCount = 0;
    (window as unknown as { __speechCancelCount: () => number }).__speechCancelCount = () =>
      cancelCount;

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

    const vozes = [
      { name: "Luciana", lang: "pt-BR", localService: true, default: true, voiceURI: "Luciana" },
    ];

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: MockUtterance,
      writable: true,
    });

    Object.defineProperty(window, "speechSynthesis", {
      value: {
        cancel: () => {
          cancelCount += 1;
        },
        speak: (utterance: MockUtterance) => {
          chamadas.push({
            texto: utterance.text,
            lang: utterance.lang,
            rate: utterance.rate,
            pitch: utterance.pitch,
          });
          utterance.onstart?.();
        },
        getVoices: () => vozes,
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      writable: true,
    });
  });
}

type ChamadaVoz = { texto: string; lang: string; rate: number; pitch: number };

function lerChamadas(page: Page) {
  return page.evaluate(
    () => (window as unknown as { __speechCalls: ChamadaVoz[] }).__speechCalls,
  );
}

function lerCancelCount(page: Page) {
  return page.evaluate(() =>
    (window as unknown as { __speechCancelCount: () => number }).__speechCancelCount(),
  );
}

test.describe("MT-014 — Fluxo completo do Modo Cozinhar com narração automática", () => {
  test("percorre o cenário obrigatório de ponta a ponta sem erros de console", async ({ page }) => {
    const errosConsole: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errosConsole.push(msg.text());
    });
    page.on("pageerror", (err) => errosConsole.push(err.message));

    await mockarWebSpeechAPI(page);

    // 1. Abrir o site.
    await page.goto("/");

    // 2. Entrar em Cozinhar.
    await page.getByRole("link", { name: "COZINHAR" }).first().click();
    await expect(page.getByRole("heading", { name: "Modo Cozinhar" })).toBeVisible();

    // 3. Selecionar uma receita.
    await page.getByRole("link", { name: /Massa Fresca Clássica/i }).click();

    // 4. Clicar em "Iniciar receita" (o passo ainda não deve estar visível antes disso).
    await expect(page.getByText(/PASSO 1 DE/)).toHaveCount(0);
    await page.getByRole("button", { name: /iniciar receita/i }).click();

    // 5. Confirmar abertura do modo guiado.
    await expect(page.getByText(/PASSO 1 DE/)).toBeVisible();

    // 6. Confirmar que a primeira etapa está visível.
    await expect(page.getByRole("heading", { name: "Massa Fresca Clássica" })).toBeVisible();
    await expect(
      page.getByText("Disponha a farinha em monte e faça um buraco no centro."),
    ).toBeVisible();

    // 7 + 8. Confirmar chamada automática de speak() com lang pt-BR.
    let chamadas = await lerChamadas(page);
    expect(chamadas.length).toBeGreaterThanOrEqual(1);
    expect(chamadas[0].lang).toBe("pt-BR");
    expect(chamadas[0].rate).toBe(0.9);
    expect(chamadas[0].pitch).toBe(1.0);
    expect(chamadas[0].texto).toContain("Disponha a farinha em monte");

    // 9. Confirmar presença de "Repetir instrução".
    await expect(page.getByRole("button", { name: /repetir instrução/i })).toBeVisible();

    // 10. Confirmar ausência dos antigos controles de voz.
    await expect(page.getByRole("button", { name: /ouvir passo/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /parar leitura/i })).toHaveCount(0);

    // 11 + 12 + 13. Repetir instrução: cancela e fala de novo.
    const cancelAntesRepetir = await lerCancelCount(page);
    const chamadasAntesRepetir = (await lerChamadas(page)).length;
    await page.getByRole("button", { name: /repetir instrução/i }).click();

    expect(await lerCancelCount(page)).toBeGreaterThan(cancelAntesRepetir);
    chamadas = await lerChamadas(page);
    expect(chamadas.length).toBe(chamadasAntesRepetir + 1);
    expect(chamadas.at(-1)?.texto).toContain("Disponha a farinha em monte");

    // 14. Avançar para o próximo passo.
    const cancelAntesAvancar = await lerCancelCount(page);
    await page.getByRole("button", { name: /próximo passo/i }).click();
    await expect(page.getByText(/PASSO 2 DE/)).toBeVisible();

    // 15. Confirmar cancelamento da fala anterior.
    expect(await lerCancelCount(page)).toBeGreaterThan(cancelAntesAvancar);

    // 16. Confirmar narração automática do novo passo.
    chamadas = await lerChamadas(page);
    expect(chamadas.at(-1)?.texto).toContain("Adicione os ovos");

    // 17. Testar o timer (iniciar -> tempo muda -> pausar).
    const timerRegion = page.getByRole("timer");
    await expect(timerRegion).toBeVisible();
    const tempoAntes = await timerRegion.locator("span.tabular-nums").textContent();
    await page.getByRole("button", { name: "Iniciar", exact: true }).click();
    await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();
    await page.waitForTimeout(2200);
    const tempoDepois = await timerRegion.locator("span.tabular-nums").textContent();
    expect(tempoDepois).not.toBe(tempoAntes);
    await page.getByRole("button", { name: "Pausar" }).click();

    // 18 + 19. Sair do modo Cozinhar e confirmar cancelamento da fala.
    const cancelAntesSair = await lerCancelCount(page);
    await page.getByRole("button", { name: /encerrar preparo/i }).click();
    await expect(page.getByRole("button", { name: /iniciar receita/i })).toBeVisible();
    expect(await lerCancelCount(page)).toBeGreaterThan(cancelAntesSair);

    // 20. Confirmar ausência de erros no console.
    expect(errosConsole).toEqual([]);
  });

  test("sem suporte a speechSynthesis, oculta a voz mas mantém timer e navegação", async ({
    page,
  }) => {
    // Força ambiente sem Web Speech API.
    await page.addInitScript(() => {
      Object.defineProperty(window, "speechSynthesis", { value: undefined, writable: true });
    });
    const errosConsole: string[] = [];
    page.on("pageerror", (err) => errosConsole.push(err.message));

    await page.goto("/cozinhar/massa-fresca-classica");
    await page.getByRole("button", { name: /iniciar receita/i }).click();

    await expect(page.getByRole("button", { name: /repetir instrução/i })).toHaveCount(0);
    await expect(page.getByText(/leitura em voz não disponível/i)).toBeVisible();
    await expect(page.getByRole("timer")).toBeVisible();
    await page.getByRole("button", { name: /próximo passo/i }).click();
    await expect(page.getByText(/PASSO 2 DE/)).toBeVisible();
    expect(errosConsole).toEqual([]);
  });

  test("sidebar de ingredientes permanece visível durante a navegação entre passos", async ({
    page,
  }) => {
    await mockarWebSpeechAPI(page);
    await page.goto("/cozinhar/pasta-pomodoro-classica");
    await page.getByRole("button", { name: /iniciar receita/i }).click();

    await expect(page.getByRole("heading", { name: "Ingredientes" })).toBeVisible();
    await page.getByRole("button", { name: /próximo passo/i }).click();
    await expect(page.getByRole("heading", { name: "Ingredientes" })).toBeVisible();
  });

  test("navegação por teclado alcança e aciona o botão Iniciar do timer", async ({ page }) => {
    await mockarWebSpeechAPI(page);
    await page.goto("/cozinhar/pasta-pomodoro-classica");
    await page.getByRole("button", { name: /iniciar receita/i }).click();

    const botaoIniciar = page.getByRole("button", { name: "Iniciar", exact: true });
    await botaoIniciar.scrollIntoViewIfNeeded();
    await botaoIniciar.focus();
    await expect(botaoIniciar).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();
  });
});
