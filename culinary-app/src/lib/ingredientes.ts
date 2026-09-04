import type { Receita } from "@/types";

export interface ResultadoMatch {
  receita: Receita;
  ingredientesFaltantes: string[];
  percentualDisponivel: number;
}

/**
 * Normaliza um nome de ingrediente para comparação (minúsculas, sem
 * acentos, sem espaços extras) — permite que "Ovos" case com "ovos" e
 * "farinha de trigo" com "Farinha de Trigo tipo 00" via correspondência
 * parcial (RF-032).
 */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function ingredienteDisponivel(nomeIngredienteReceita: string, disponiveis: string[]): boolean {
  const normalizado = normalizar(nomeIngredienteReceita);
  return disponiveis.some((item) => {
    const itemNormalizado = normalizar(item);
    return normalizado.includes(itemNormalizado) || itemNormalizado.includes(normalizado);
  });
}

/**
 * Calcula, para cada receita, quais ingredientes estão disponíveis na lista
 * informada pelo usuário e quais faltam (RF-032). Retorna apenas receitas
 * com pelo menos 1 ingrediente disponível, ordenadas por percentual
 * disponível decrescente.
 */
export function calcularMatches(receitas: Receita[], ingredientesDisponiveis: string[]): ResultadoMatch[] {
  if (ingredientesDisponiveis.length === 0) {
    return [];
  }

  const resultados = receitas.map((receita) => {
    const ingredientesFaltantes = receita.ingredientes
      .filter((ingrediente) => !ingredienteDisponivel(ingrediente.nome, ingredientesDisponiveis))
      .map((ingrediente) => ingrediente.nome);

    const totalIngredientes = receita.ingredientes.length;
    const disponiveisCount = totalIngredientes - ingredientesFaltantes.length;
    const percentualDisponivel = totalIngredientes === 0 ? 0 : disponiveisCount / totalIngredientes;

    return { receita, ingredientesFaltantes, percentualDisponivel };
  });

  return resultados
    .filter((resultado) => resultado.percentualDisponivel > 0)
    .sort((a, b) => b.percentualDisponivel - a.percentualDisponivel);
}

export function separarPorCompletude(resultados: ResultadoMatch[]): {
  completas: ResultadoMatch[];
  parciais: ResultadoMatch[];
} {
  return {
    completas: resultados.filter((resultado) => resultado.percentualDisponivel === 1),
    parciais: resultados.filter((resultado) => resultado.percentualDisponivel < 1),
  };
}
