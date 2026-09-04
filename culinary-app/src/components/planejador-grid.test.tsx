import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlanejadorGrid } from "@/components/planejador-grid";
import type { PlanejamentoRefeicao, Receita } from "@/types";

const receitaOvos: Receita = {
  id: "ovos-mexidos-perfeitos",
  titulo: "Ovos Mexidos Perfeitos",
  categorias: ["BÁSICO"],
  tempoPreparo: "5 MIN",
  dificuldade: "BÁSICO",
  imagemUrl: "https://example.com/ovos.jpg",
  ingredientes: [{ nome: "Ovos", quantidade: "3 unidades" }],
  passos: [{ numero: 1, instrucao: "Bata os ovos.", ingredientes: [] }],
};

const receitaBolo: Receita = {
  id: "bolo-simples-caneca",
  titulo: "Bolo Simples de Caneca",
  categorias: ["SOBREMESA"],
  tempoPreparo: "15 MIN",
  dificuldade: "FÁCIL",
  imagemUrl: "https://example.com/bolo.jpg",
  ingredientes: [{ nome: "Farinha", quantidade: "4 colheres" }],
  passos: [{ numero: 1, instrucao: "Misture tudo.", ingredientes: [] }],
};

const receitas = [receitaOvos, receitaBolo];

// 2026-08-24 é segunda-feira (semana real contendo 28/08/2026).
const DATA_REFERENCIA = "2026-08-24";

describe("PlanejadorGrid", () => {
  it("renderiza uma refeição planejada existente com título e tempo", () => {
    const planejamentos: PlanejamentoRefeicao[] = [
      { id: "p1", data: "2026-08-24", periodo: "ALMOÇO", receitaId: "ovos-mexidos-perfeitos" },
    ];
    render(
      <PlanejadorGrid
        dataReferenciaInicial={DATA_REFERENCIA}
        planejamentosIniciais={planejamentos}
        receitas={receitas}
      />,
    );

    expect(screen.getByRole("link", { name: /ovos mexidos perfeitos/i })).toBeInTheDocument();
    expect(screen.getByText("5 MIN")).toBeInTheDocument();
  });

  it("o card de refeição planejada é um link direto para a página da receita", () => {
    const planejamentos: PlanejamentoRefeicao[] = [
      { id: "p1", data: "2026-08-24", periodo: "ALMOÇO", receitaId: "ovos-mexidos-perfeitos" },
    ];
    render(
      <PlanejadorGrid
        dataReferenciaInicial={DATA_REFERENCIA}
        planejamentosIniciais={planejamentos}
        receitas={receitas}
      />,
    );

    const link = screen.getByRole("link", { name: /ovos mexidos perfeitos/i });
    expect(link).toHaveAttribute("href", "/receitas/ovos-mexidos-perfeitos?data=2026-08-24");
  });

  it("remove uma refeição planejada ao clicar no botão de remover", async () => {
    const user = userEvent.setup();
    const planejamentos: PlanejamentoRefeicao[] = [
      { id: "p1", data: "2026-08-24", periodo: "ALMOÇO", receitaId: "ovos-mexidos-perfeitos" },
    ];
    render(
      <PlanejadorGrid
        dataReferenciaInicial={DATA_REFERENCIA}
        planejamentosIniciais={planejamentos}
        receitas={receitas}
      />,
    );

    expect(screen.getByRole("link", { name: /ovos mexidos perfeitos/i })).toBeInTheDocument();

    const botaoRemover = screen.getByRole("button", {
      name: /remover ovos mexidos perfeitos/i,
    });
    await user.click(botaoRemover);

    expect(screen.queryByRole("link", { name: /ovos mexidos perfeitos/i })).not.toBeInTheDocument();
  });

  it("adiciona uma receita a um slot vazio via seletor", async () => {
    const user = userEvent.setup();
    render(
      <PlanejadorGrid
        dataReferenciaInicial={DATA_REFERENCIA}
        planejamentosIniciais={[]}
        receitas={receitas}
      />,
    );

    expect(screen.queryByRole("link", { name: /ovos mexidos perfeitos/i })).not.toBeInTheDocument();

    const seletor = screen.getByLabelText("Adicionar receita para SEG ALMOÇO");
    await user.selectOptions(seletor, "ovos-mexidos-perfeitos");

    expect(screen.getByRole("link", { name: /ovos mexidos perfeitos/i })).toBeInTheDocument();
  });

  it("permite adicionar múltiplas refeições em slots diferentes", async () => {
    const user = userEvent.setup();
    render(
      <PlanejadorGrid
        dataReferenciaInicial={DATA_REFERENCIA}
        planejamentosIniciais={[]}
        receitas={receitas}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText("Adicionar receita para SEG ALMOÇO"),
      "ovos-mexidos-perfeitos",
    );
    await user.selectOptions(
      screen.getByLabelText("Adicionar receita para SEG JANTAR"),
      "bolo-simples-caneca",
    );

    expect(screen.getByRole("link", { name: /ovos mexidos perfeitos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /bolo simples de caneca/i })).toBeInTheDocument();
  });

  it("preserva o rótulo (ex.: SOBRAS, HOJE) de refeições já planejadas", () => {
    const planejamentos: PlanejamentoRefeicao[] = [
      {
        id: "p1",
        data: "2026-08-24",
        periodo: "ALMOÇO",
        receitaId: "ovos-mexidos-perfeitos",
        rotulo: "SOBRAS",
      },
    ];
    render(
      <PlanejadorGrid
        dataReferenciaInicial={DATA_REFERENCIA}
        planejamentosIniciais={planejamentos}
        receitas={receitas}
      />,
    );

    expect(screen.getByText("SOBRAS")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ovos mexidos perfeitos/i })).toBeInTheDocument();
  });

  it("exibe o intervalo da semana corrente formatado", () => {
    render(
      <PlanejadorGrid
        dataReferenciaInicial={DATA_REFERENCIA}
        planejamentosIniciais={[]}
        receitas={receitas}
      />,
    );

    expect(screen.getByText("24 - 30 DE AGOSTO, 2026")).toBeInTheDocument();
  });

  it("avança para a próxima semana ao clicar em Próxima", async () => {
    const user = userEvent.setup();
    const planejamentos: PlanejamentoRefeicao[] = [
      { id: "p1", data: "2026-08-24", periodo: "ALMOÇO", receitaId: "ovos-mexidos-perfeitos" },
      { id: "p2", data: "2026-08-31", periodo: "ALMOÇO", receitaId: "bolo-simples-caneca" },
    ];
    render(
      <PlanejadorGrid
        dataReferenciaInicial={DATA_REFERENCIA}
        planejamentosIniciais={planejamentos}
        receitas={receitas}
      />,
    );

    expect(screen.getByRole("link", { name: /ovos mexidos perfeitos/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /bolo simples de caneca/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /próxima/i }));

    expect(screen.getByText("31 DE AGOSTO - 06 DE SETEMBRO, 2026")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ovos mexidos perfeitos/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /bolo simples de caneca/i })).toBeInTheDocument();
  });

  it("retrocede para a semana anterior ao clicar em Anterior", async () => {
    const user = userEvent.setup();
    render(
      <PlanejadorGrid
        dataReferenciaInicial={DATA_REFERENCIA}
        planejamentosIniciais={[]}
        receitas={receitas}
      />,
    );

    await user.click(screen.getByRole("button", { name: /anterior/i }));

    expect(screen.getByText("17 - 23 DE AGOSTO, 2026")).toBeInTheDocument();
  });

  it("voltar e depois avançar retorna à semana original", async () => {
    const user = userEvent.setup();
    render(
      <PlanejadorGrid
        dataReferenciaInicial={DATA_REFERENCIA}
        planejamentosIniciais={[]}
        receitas={receitas}
      />,
    );

    await user.click(screen.getByRole("button", { name: /anterior/i }));
    await user.click(screen.getByRole("button", { name: /próxima/i }));

    expect(screen.getByText("24 - 30 DE AGOSTO, 2026")).toBeInTheDocument();
  });
});
