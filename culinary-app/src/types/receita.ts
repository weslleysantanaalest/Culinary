import type { IngredienteReceita } from "./ingrediente";
import type { PassoDeReceita } from "./passo-de-receita";

export type Dificuldade = "FÁCIL" | "MUITO FÁCIL" | "MÉDIO" | "DIFÍCIL" | "BÁSICO";

/**
 * Entidade central do domínio. Ver RF-010 a RF-014 (galeria de Receitas).
 *
 * `id` é estável e compartilhado entre todas as telas (Receitas, Planejador,
 * Lista de Ingredientes, Modo Cozinhar) — decisão ADR-005 do
 * .kiro/project-journal/02-arquitetura.md, que unifica o dataset mockado
 * que nos protótipos originais estava fragmentado por tela.
 */
export interface Receita {
  id: string;
  titulo: string;
  categorias: string[];
  tempoPreparo: string;
  dificuldade: Dificuldade;
  imagemUrl: string;
  ingredientes: IngredienteReceita[];
  passos: PassoDeReceita[];
}
