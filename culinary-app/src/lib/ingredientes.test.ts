import { describe, expect, it } from "vitest";
import { calcularMatches, separarPorCompletude } from "@/lib/ingredientes";
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
    { nome: "Sal", quantidade: "a gosto" },
  ],
  passos: [],
};

const receitaBoloMarmore: Receita = {
  id: "bolo-marmore",
  titulo: "Bolo de Mármore",
  categorias: ["SOBREMESA"],
  tempoPreparo: "45 MIN",
  dificuldade: "MÉDIO",
  imagemUrl: "https://example.com/bolo.jpg",
  ingredientes: [
    { nome: "Farinha de trigo", quantidade: "300 g" },
    { nome: "Ovos", quantidade: "3 unidades" },
    { nome: "Manteiga", quantidade: "150 g" },
    { nome: "Cacau em pó", quantidade: "30 g" },
    { nome: "Leite", quantidade: "100 ml" },
  ],
  passos: [],
};

const receitas = [receitaOvos, receitaBoloMarmore];

describe("calcularMatches", () => {
  it("retorna array vazio quando não há ingredientes informados", () => {
    expect(calcularMatches(receitas, [])).toEqual([]);
  });

  it("identifica receita com 100% dos ingredientes disponíveis (match exato)", () => {
    const resultados = calcularMatches(receitas, ["Ovos", "Manteiga", "Sal"]);
    const match = resultados.find((r) => r.receita.id === "ovos-mexidos-perfeitos");
    expect(match?.percentualDisponivel).toBe(1);
    expect(match?.ingredientesFaltantes).toEqual([]);
  });

  it("identifica ingredientes faltantes para match parcial", () => {
    const resultados = calcularMatches(receitas, ["Ovos", "Manteiga"]);
    const match = resultados.find((r) => r.receita.id === "bolo-marmore");
    expect(match?.ingredientesFaltantes).toEqual(
      expect.arrayContaining(["Farinha de trigo", "Cacau em pó", "Leite"]),
    );
    expect(match?.percentualDisponivel).toBeCloseTo(2 / 5);
  });

  it("não inclui receitas sem nenhum ingrediente disponível", () => {
    const resultados = calcularMatches(receitas, ["Camarão", "Coco"]);
    expect(resultados).toEqual([]);
  });

  it("faz correspondência parcial de texto (case/acento-insensitive)", () => {
    const resultados = calcularMatches(receitas, ["ovos", "MANTEIGA"]);
    const match = resultados.find((r) => r.receita.id === "ovos-mexidos-perfeitos");
    expect(match).toBeDefined();
  });

  it("ordena resultados por percentual disponível decrescente", () => {
    const resultados = calcularMatches(receitas, ["Ovos", "Manteiga", "Sal"]);
    expect(resultados[0].receita.id).toBe("ovos-mexidos-perfeitos");
  });
});

describe("separarPorCompletude", () => {
  it("separa receitas completas (100%) de parciais", () => {
    const resultados = calcularMatches(receitas, ["Ovos", "Manteiga", "Sal"]);
    const { completas, parciais } = separarPorCompletude(resultados);
    expect(completas.some((r) => r.receita.id === "ovos-mexidos-perfeitos")).toBe(true);
    expect(parciais.some((r) => r.receita.id === "bolo-marmore")).toBe(true);
  });
});
