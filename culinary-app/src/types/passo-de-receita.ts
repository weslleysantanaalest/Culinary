import type { IngredienteReceita } from "./ingrediente";

/**
 * Um passo do modo de preparo de uma receita.
 *
 * Decisão (ADR-003, .kiro/project-journal/02-arquitetura.md): cada passo
 * carrega sua própria lista de ingredientes necessários (não herda a lista
 * completa da receita), tanto no desktop quanto no mobile. Ver RF-041,
 * RF-047.
 */
export interface PassoDeReceita {
  numero: number;
  instrucao: string;
  tempoEstimadoMinutos?: number;
  ingredientes: IngredienteReceita[];
}
