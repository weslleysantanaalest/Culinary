/**
 * Ingrediente associado a uma receita (com quantidade) ou à despensa do
 * usuário (apenas nome). Ver RF-030 a RF-034 (Lista de Ingredientes).
 */
export interface IngredienteReceita {
  nome: string;
  quantidade: string;
}

/** Item simples da despensa do usuário — sem quantidade associada. */
export interface ItemDespensa {
  nome: string;
}
