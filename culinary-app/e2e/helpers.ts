import type { Page } from "@playwright/test";

/**
 * Pré-popula o localStorage com um nome de usuário antes da primeira
 * navegação, para que o popup de boas-vindas não apareça e intercepte
 * cliques durante os testes E2E que não são especificamente sobre o
 * próprio fluxo de nome/popup (ver `fluxo-usuario.spec.ts` para os testes
 * dedicados a esse fluxo).
 */
export async function pularPopupBoasVindas(page: Page, nome = "Teste"): Promise<void> {
  await page.addInitScript((nomeParaSalvar) => {
    window.localStorage.setItem("culinary:nomeUsuario", nomeParaSalvar);
  }, nome);
}
