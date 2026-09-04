/**
 * Contrato público da API de receitas (DTO em inglês, separado do tipo de
 * domínio `Receita` pt-BR). O Notion não fornece tempoPreparo, dificuldade,
 * categorias nem passos estruturados; por isso o DTO expõe só o que existe na
 * fonte, e o front adapta ao que cada tela precisa.
 */
export interface RecipeDTO {
  slug: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  /** URL pública (/images/recipes/...) só se o arquivo existe; senão null. */
  image: string | null;
  source: string | null;
  order: number | null;
  updatedAt: string | null;
}

/** Envelope de listagem paginada de /api/recipes. */
export interface RecipesPage {
  items: RecipeDTO[];
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
}
