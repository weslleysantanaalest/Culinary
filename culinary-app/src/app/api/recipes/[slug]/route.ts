import { buscarPorSlug } from "@/lib/api/recipes-service";
import { jsonError, jsonOk, traduzErro } from "@/lib/api/responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * GET /api/recipes/[slug] — detalhe. Slug inválido -> 400. Não encontrado /
 * não publicado -> 404. Sucesso -> 200 RecipeDTO.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    if (!SLUG_VALIDO.test(slug)) {
      return jsonError("invalid_slug", 400);
    }
    const receita = await buscarPorSlug(slug);
    if (!receita) {
      return jsonError("not_found", 404);
    }
    return jsonOk(receita);
  } catch (erro) {
    return traduzErro(erro, "GET /api/recipes/[slug]");
  }
}
