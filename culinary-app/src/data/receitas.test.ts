import { describe, expect, it } from "vitest";
import { getReceitaPorId, getReceitas, receitas } from "@/test/fixtures/receitas-mock";
import { planejamentosRefeicao } from "@/data/planejamentos";
import { itensDespensaIniciais } from "@/data/despensa";

describe("dataset de receitas", () => {
  it("possui ids únicos entre todas as receitas", () => {
    const ids = receitas.map((receita) => receita.id);
    const idsUnicos = new Set(ids);
    expect(idsUnicos.size).toBe(ids.length);
  });

  it("toda receita tem ao menos um ingrediente e um passo", () => {
    for (const receita of receitas) {
      expect(receita.ingredientes.length).toBeGreaterThan(0);
      expect(receita.passos.length).toBeGreaterThan(0);
    }
  });

  it("os passos de cada receita estão numerados sequencialmente a partir de 1", () => {
    for (const receita of receitas) {
      const numeros = receita.passos.map((passo) => passo.numero);
      expect(numeros).toEqual(receita.passos.map((_, index) => index + 1));
    }
  });

  it("getReceitas retorna o dataset completo", () => {
    expect(getReceitas()).toHaveLength(receitas.length);
  });

  it("getReceitaPorId encontra uma receita existente", () => {
    const receita = getReceitaPorId("pao-fermentacao-natural");
    expect(receita).toBeDefined();
    expect(receita?.titulo).toBe("Pão de Fermentação Natural");
  });

  it("getReceitaPorId retorna undefined para id inexistente", () => {
    expect(getReceitaPorId("id-que-nao-existe")).toBeUndefined();
  });
});

describe("integridade referencial entre datasets mockados", () => {
  it("todo receitaId em planejamentosRefeicao existe no dataset de receitas", () => {
    const idsValidos = new Set(receitas.map((receita) => receita.id));
    for (const plano of planejamentosRefeicao) {
      expect(idsValidos.has(plano.receitaId)).toBe(true);
    }
  });

  it("todo plano de refeição tem um período válido", () => {
    const periodosValidos = new Set(["CAFÉ", "ALMOÇO", "JANTAR"]);
    for (const plano of planejamentosRefeicao) {
      expect(periodosValidos.has(plano.periodo)).toBe(true);
    }
  });
});

describe("dataset de despensa", () => {
  it("possui itens iniciais com nome não vazio", () => {
    expect(itensDespensaIniciais.length).toBeGreaterThan(0);
    for (const item of itensDespensaIniciais) {
      expect(item.nome.trim().length).toBeGreaterThan(0);
    }
  });
});
