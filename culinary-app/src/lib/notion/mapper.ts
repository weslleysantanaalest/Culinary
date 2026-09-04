import { RecipePageSchema, type RecipePage } from "./schema";
import { parseLista } from "./parse-texto";
import type { RecipeDTO } from "./types";

/**
 * Resultado intermediário do mapper: RecipeDTO parcial (sem `image`, resolvido
 * depois pelo service via manifesto central) mais os campos de identidade
 * (`order`, `slug`, `title`) usados por `resolveRecipeImage`.
 */
export interface MappedRecipe {
  dto: Omit<RecipeDTO, "image">;
  publicado: boolean;
}

/**
 * Valida uma página crua do Notion e mapeia para RecipeDTO. Retorna null se a
 * página não passa na validação estrutural mínima. O campo `image` fica como
 * "" no DTO parcial (o service resolve depois via manifesto); `publicado`/
 * slug vazio são decididos pelo chamador.
 */
export function notionPageToRecipe(pageCru: unknown): MappedRecipe | null {
  const parsed = RecipePageSchema.safeParse(pageCru);
  if (!parsed.success) return null;
  return fromValidated(parsed.data);
}

function fromValidated(page: RecipePage): MappedRecipe {
  const p = page.properties;
  const slug = p.Slug.trim();
  return {
    dto: {
      slug,
      title: p.Receita.trim(),
      ingredients: parseLista(p.Ingredientes),
      instructions: parseLista(p["Modo de preparo"]),
      source: p.Fonte,
      order: p.Ordem,
      updatedAt: p["Atualizado em"],
    },
    publicado: p.Publicado === true && slug.length > 0,
  };
}
