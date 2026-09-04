import { z } from "zod";

/**
 * Schemas Zod defensivos das páginas do Notion. Validamos só as properties que
 * usamos, com `.catch()`/`.default()` para nunca explodir por propriedade
 * faltante, renomeada ou com shape inesperado — a fronteira de confiança real
 * é aqui.
 */

/** rich_text[] / title[] -> string plana ("" se vazio/ausente). */
const richTextItem = z.object({ plain_text: z.string().catch("") });
const richTextArray = z.array(richTextItem).catch([]);

function plainFromArray(itens: Array<{ plain_text: string }>): string {
  return itens
    .map((i) => i.plain_text)
    .join("")
    .trim();
}

/** title property -> string. */
const titleProp = z
  .object({ title: richTextArray })
  .transform((p) => plainFromArray(p.title))
  .catch("");

/** rich_text property -> string. */
const textProp = z
  .object({ rich_text: richTextArray })
  .transform((p) => plainFromArray(p.rich_text))
  .catch("");

/** checkbox property -> boolean. */
const checkboxProp = z
  .object({ checkbox: z.boolean().catch(false) })
  .transform((p) => p.checkbox)
  .catch(false);

/** number property -> number | null. */
const numberProp = z
  .object({ number: z.number().nullable().catch(null) })
  .transform((p) => p.number)
  .catch(null);

/** url property -> string | null. */
const urlProp = z
  .object({ url: z.string().nullable().catch(null) })
  .transform((p) => p.url)
  .catch(null);

/** date property -> ISO string | null (usa `start`). */
const dateProp = z
  .object({ date: z.object({ start: z.string().catch("") }).nullable().catch(null) })
  .transform((p) => (p.date && p.date.start ? p.date.start : null))
  .catch(null);

/**
 * Página de receita do Notion. Cada property é opcional/tolerante: se faltar,
 * o `.catch()`/`.default()` garante um valor seguro em vez de erro.
 */
export const RecipePageSchema = z.object({
  id: z.string().catch(""),
  properties: z
    .object({
      Receita: titleProp.optional().default(""),
      Slug: textProp.optional().default(""),
      Publicado: checkboxProp.optional().default(false),
      Ingredientes: textProp.optional().default(""),
      "Modo de preparo": textProp.optional().default(""),
      Ordem: numberProp.optional().default(null),
      Fonte: urlProp.optional().default(null),
      "Atualizado em": dateProp.optional().default(null),
    })
    .catch({
      Receita: "",
      Slug: "",
      Publicado: false,
      Ingredientes: "",
      "Modo de preparo": "",
      Ordem: null,
      Fonte: null,
      "Atualizado em": null,
    }),
});

export type RecipePage = z.infer<typeof RecipePageSchema>;

/** Resposta crua do endpoint /v1/data_sources/{id}/query. */
export const QueryResponseSchema = z.object({
  results: z.array(z.unknown()).catch([]),
  has_more: z.boolean().catch(false),
  next_cursor: z.string().nullable().catch(null),
});

export type QueryResponse = z.infer<typeof QueryResponseSchema>;
