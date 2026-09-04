import type { NextRequest } from "next/server";
import { listarReceitas } from "@/lib/api/recipes-service";
import { jsonOk, traduzErro } from "@/lib/api/responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCOPES_VALIDOS = ["all", "published"] as const;
type Scope = (typeof SCOPES_VALIDOS)[number];

/** Valor inválido/ausente -> "published" (mantém o comportamento editorial
 * padrão para consumidores que não enviam o parâmetro explicitamente). */
function parseScope(bruto: string | null): Scope {
  return bruto === "all" ? "all" : "published";
}

/**
 * GET /api/recipes?limit=6&cursor=...&q=...&scope=all|published
 *
 * - limit: clamp 1..24 (inválido -> default 6).
 * - cursor: opaco por offset (malformado -> offset 0).
 * - scope=published (padrão): usa apenas receitas com Publicado=true no
 *   Notion — regra editorial preservada para consumidores existentes.
 * - scope=all: usa todas as receitas do banco, ignorando Publicado — usado
 *   pelo catálogo público por decisão editorial explícita. Nunca escreve no
 *   Notion; qualquer valor de "scope" fora da lista aceita cai em "published"
 *   (nunca confia em texto livre não validado).
 *
 * Catálogo vazio é resposta legítima (200), não erro.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");
    const query = searchParams.get("q");
    const scope = parseScope(searchParams.get("scope"));
    const limit = limitParam !== null ? Number(limitParam) : undefined;

    const pagina = await listarReceitas({
      limit,
      cursor,
      query,
      somentePublicadas: scope === "published",
    });
    return jsonOk(pagina);
  } catch (erro) {
    return traduzErro(erro, "GET /api/recipes");
  }
}
