import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuscaIngredientes } from "@/components/busca-ingredientes";
import type { Receita } from "@/types";

const receitaOvos: Receita = {
  id: "ovos-mexidos-perfeitos",
  titulo: "Ovos Mexidos Perfeitos",
  categorias: ["BÁSICO"],
  tempoPreparo: "5 MIN",
  dificuldade: "BÁSICO",
  imagemUrl: "https://example.com/ovos.jpg",
  ingredientes: [
    { nome: "Ovos", quantidade: "3 unidades" },
    { nome: "Manteiga", quantidade: "10 g" },
  ],
  passos: [],
};

describe("BuscaIngredientes", () => {
  it("renderiza os ingredientes iniciais da despensa mockada", () => {
    render(<BuscaIngredientes receitas={[receitaOvos]} />);
    expect(screen.getByText("Ovos")).toBeInTheDocument();
    expect(screen.getByText("Manteiga")).toBeInTheDocument();
  });

  it("mostra a receita como match exato quando todos os ingredientes estão na despensa", () => {
    render(<BuscaIngredientes receitas={[receitaOvos]} />);
    expect(screen.getByText("Ovos Mexidos Perfeitos")).toBeInTheDocument();
    expect(screen.getByText(/1 receita perfeita/)).toBeInTheDocument();
  });

  it("permite adicionar um novo ingrediente via input + Enter", async () => {
    const user = userEvent.setup();
    render(<BuscaIngredientes receitas={[receitaOvos]} />);

    const input = screen.getByLabelText("Adicionar ingrediente");
    await user.type(input, "Sal{Enter}");

    expect(screen.getByText("Sal")).toBeInTheDocument();
  });

  it("permite remover um ingrediente existente", async () => {
    const user = userEvent.setup();
    render(<BuscaIngredientes receitas={[receitaOvos]} />);

    const botaoRemover = screen.getByLabelText("Remover Ovos");
    await user.click(botaoRemover);

    expect(screen.queryByText("Ovos", { selector: "span.text-primary" })).not.toBeInTheDocument();
  });

  it("não adiciona ingrediente vazio", async () => {
    const user = userEvent.setup();
    render(<BuscaIngredientes receitas={[receitaOvos]} />);

    const input = screen.getByLabelText("Adicionar ingrediente");
    const contagemAntes = screen.getByText(/SEUS INGREDIENTES/).textContent;

    await user.type(input, "   {Enter}");

    const contagemDepois = screen.getByText(/SEUS INGREDIENTES/).textContent;
    expect(contagemDepois).toBe(contagemAntes);
  });
});
