import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderComProviders } from "@/test/render-com-providers";
import userEvent from "@testing-library/user-event";
import { ModoCozinhar } from "@/components/modo-cozinhar";
import type { Receita } from "@/types";

class MockSpeechSynthesisUtterance {
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

function criarMockSpeechSynthesis() {
  return {
    cancel: vi.fn(),
    speak: vi.fn((utterance: MockSpeechSynthesisUtterance) => {
      utterance.onstart?.();
    }),
    getVoices: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

const receitaTeste: Receita = {
  id: "receita-teste",
  titulo: "Receita de Teste",
  categorias: ["TESTE"],
  tempoPreparo: "10 MIN",
  dificuldade: "FÁCIL",
  imagemUrl: "https://example.com/teste.jpg",
  ingredientes: [
    { nome: "Ingrediente Base", quantidade: "1 unidade" },
    { nome: "Água", quantidade: "200 ml" },
  ],
  passos: [
    {
      numero: 1,
      instrucao: "Primeiro passo da receita de teste.",
      tempoEstimadoMinutos: 5,
      ingredientes: [{ nome: "Água", quantidade: "200 ml" }],
    },
    {
      numero: 2,
      instrucao: "Segundo passo da receita de teste.",
      tempoEstimadoMinutos: 3,
      ingredientes: [{ nome: "Sal", quantidade: "1 pitada" }],
    },
    {
      numero: 3,
      instrucao: "Terceiro e último passo.",
      ingredientes: [],
    },
  ],
};

function setupSpeechSynthesisMock() {
  (globalThis as typeof globalThis & { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
    MockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance;
  const mock = criarMockSpeechSynthesis();
  (globalThis as typeof globalThis & { speechSynthesis: unknown }).speechSynthesis =
    mock as unknown as SpeechSynthesis;
  return mock;
}

/** Renderiza e inicia a receita (clicando em "Iniciar receita"). */
async function renderizarIniciado(user: ReturnType<typeof userEvent.setup>) {
  renderComProviders(<ModoCozinhar receita={receitaTeste} />);
  await user.click(screen.getByRole("button", { name: /iniciar receita/i }));
}

describe("ModoCozinhar — pré-início (gate Iniciar receita)", () => {
  it("mostra a tela de pré-início com o botão Iniciar receita, sem exibir o passo", () => {
    setupSpeechSynthesisMock();
    renderComProviders(<ModoCozinhar receita={receitaTeste} />);

    expect(screen.getByRole("button", { name: /iniciar receita/i })).toBeInTheDocument();
    expect(screen.queryByText("PASSO 1 DE 3")).not.toBeInTheDocument();
    // A sidebar de ingredientes já aparece no pré-início.
    expect(screen.getByText("Ingredientes")).toBeInTheDocument();
    expect(screen.getByText(/1 unidade de Ingrediente Base/)).toBeInTheDocument();
  });

  it("ao clicar em Iniciar receita, abre o modo guiado e narra automaticamente o passo 1", async () => {
    const mock = setupSpeechSynthesisMock();
    const user = userEvent.setup();
    await renderizarIniciado(user);

    expect(screen.getByText("PASSO 1 DE 3")).toBeInTheDocument();
    expect(screen.getByText("Primeiro passo da receita de teste.")).toBeInTheDocument();

    // Narração automática do passo 1 dentro do gesto do clique.
    expect(mock.speak).toHaveBeenCalledTimes(1);
    const utterance = mock.speak.mock.calls[0][0] as MockSpeechSynthesisUtterance;
    expect(utterance.lang).toBe("pt-BR");
    expect(utterance.rate).toBe(0.9);
    expect(utterance.pitch).toBe(1.0);
    expect(utterance.text).toContain("Primeiro passo da receita de teste.");
  });
});

describe("ModoCozinhar — modo guiado", () => {
  it("exibe a sidebar com todos os ingredientes da receita", async () => {
    setupSpeechSynthesisMock();
    const user = userEvent.setup();
    await renderizarIniciado(user);

    expect(screen.getByText("Ingredientes")).toBeInTheDocument();
    expect(screen.getByText(/1 unidade de Ingrediente Base/)).toBeInTheDocument();
    expect(screen.getByText(/200 ml de Água/)).toBeInTheDocument();
  });

  it('o botão "Passo anterior" está desabilitado no primeiro passo', async () => {
    setupSpeechSynthesisMock();
    const user = userEvent.setup();
    await renderizarIniciado(user);
    expect(screen.getByRole("button", { name: /passo anterior/i })).toBeDisabled();
  });

  it("avança para o próximo passo e narra automaticamente o novo passo", async () => {
    const mock = setupSpeechSynthesisMock();
    const user = userEvent.setup();
    await renderizarIniciado(user);

    await user.click(screen.getByRole("button", { name: /próximo passo/i }));

    expect(screen.getByText("PASSO 2 DE 3")).toBeInTheDocument();
    expect(screen.getByText("Segundo passo da receita de teste.")).toBeInTheDocument();
    // 1ª fala = início; 2ª fala = passo 2 narrado automaticamente.
    expect(mock.speak).toHaveBeenCalledTimes(2);
    const segunda = mock.speak.mock.calls[1][0] as MockSpeechSynthesisUtterance;
    expect(segunda.text).toContain("Segundo passo da receita de teste.");
    // Cancela a fala anterior ao trocar de passo (sem sobreposição).
    expect(mock.cancel).toHaveBeenCalled();
  });

  it("volta para o passo anterior e narra o passo automaticamente", async () => {
    const mock = setupSpeechSynthesisMock();
    const user = userEvent.setup();
    await renderizarIniciado(user);

    await user.click(screen.getByRole("button", { name: /próximo passo/i }));
    await user.click(screen.getByRole("button", { name: /passo anterior/i }));

    expect(screen.getByText("PASSO 1 DE 3")).toBeInTheDocument();
    // início + próximo + anterior = 3 falas.
    expect(mock.speak).toHaveBeenCalledTimes(3);
  });

  it('o botão "Próximo passo" está desabilitado no último passo', async () => {
    setupSpeechSynthesisMock();
    const user = userEvent.setup();
    await renderizarIniciado(user);

    await user.click(screen.getByRole("button", { name: /próximo passo/i }));
    await user.click(screen.getByRole("button", { name: /próximo passo/i }));

    expect(screen.getByText("PASSO 3 DE 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /próximo passo/i })).toBeDisabled();
  });

  it("marca um ingrediente da sidebar como concluído ao clicar no checkbox", async () => {
    setupSpeechSynthesisMock();
    const user = userEvent.setup();
    await renderizarIniciado(user);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).not.toBeChecked();
    await user.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
  });

  it("exibe o timer formatado e o botão Iniciar para o passo atual", async () => {
    setupSpeechSynthesisMock();
    const user = userEvent.setup();
    await renderizarIniciado(user);
    expect(screen.getByText("05:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Iniciar$/ })).toBeInTheDocument();
  });

  it("troca de Iniciar para Pausar ao clicar em Iniciar, e o tempo decresce", async () => {
    setupSpeechSynthesisMock();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();
    renderComProviders(<ModoCozinhar receita={receitaTeste} />);
    await user.click(screen.getByRole("button", { name: /iniciar receita/i }));

    await user.click(screen.getByRole("button", { name: /^Iniciar$/ }));
    expect(screen.getByRole("button", { name: /pausar/i })).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(3000);
    expect(screen.getByText("04:57")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("reinicia o timer ao clicar em Reiniciar", async () => {
    setupSpeechSynthesisMock();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();
    renderComProviders(<ModoCozinhar receita={receitaTeste} />);
    await user.click(screen.getByRole("button", { name: /iniciar receita/i }));

    await user.click(screen.getByRole("button", { name: /^Iniciar$/ }));
    await vi.advanceTimersByTimeAsync(3000);
    await user.click(screen.getByRole("button", { name: /reiniciar/i }));

    expect(screen.getByText("05:00")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('existe um único controle de voz "Repetir instrução" (sem Ouvir passo / Parar leitura)', async () => {
    setupSpeechSynthesisMock();
    const user = userEvent.setup();
    await renderizarIniciado(user);

    expect(screen.getByRole("button", { name: /repetir instrução/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ouvir passo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /parar leitura/i })).not.toBeInTheDocument();
  });

  it('"Repetir instrução" relê o passo atual cancelando a fala anterior', async () => {
    const mock = setupSpeechSynthesisMock();
    const user = userEvent.setup();
    await renderizarIniciado(user);

    const chamadasIniciais = mock.speak.mock.calls.length;
    await user.click(screen.getByRole("button", { name: /repetir instrução/i }));

    expect(mock.speak).toHaveBeenCalledTimes(chamadasIniciais + 1);
    expect(mock.cancel).toHaveBeenCalled();
    const ultima = mock.speak.mock.calls.at(-1)?.[0] as MockSpeechSynthesisUtterance;
    expect(ultima.text).toContain("Primeiro passo da receita de teste.");
  });

  it("reseta o timer para o valor do novo passo ao navegar", async () => {
    setupSpeechSynthesisMock();
    const user = userEvent.setup();
    await renderizarIniciado(user);

    await user.click(screen.getByRole("button", { name: /próximo passo/i }));
    expect(screen.getByText("03:00")).toBeInTheDocument();
  });

  it("cancela a fala e volta ao pré-início ao clicar em Encerrar preparo", async () => {
    const mock = setupSpeechSynthesisMock();
    const user = userEvent.setup();
    await renderizarIniciado(user);

    await user.click(screen.getByRole("button", { name: /próximo passo/i }));
    await user.click(screen.getByRole("button", { name: /encerrar preparo/i }));

    expect(mock.cancel).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /iniciar receita/i })).toBeInTheDocument();
    expect(screen.queryByText("PASSO 2 DE 3")).not.toBeInTheDocument();
  });
});

describe("ModoCozinhar — sem suporte a speechSynthesis", () => {
  it("oculta Repetir instrução e mostra aviso acessível, mantendo timer e navegação", async () => {
    // Ambiente sem speechSynthesis.
    Reflect.deleteProperty(globalThis, "speechSynthesis");
    const user = userEvent.setup();
    renderComProviders(<ModoCozinhar receita={receitaTeste} />);

    await user.click(screen.getByRole("button", { name: /iniciar receita/i }));

    expect(screen.queryByRole("button", { name: /repetir instrução/i })).not.toBeInTheDocument();
    expect(screen.getByText(/leitura em voz não disponível/i)).toBeInTheDocument();
    // Timer e navegação continuam presentes.
    expect(screen.getByRole("timer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /próximo passo/i })).toBeInTheDocument();
  });
});
