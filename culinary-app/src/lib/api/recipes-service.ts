import "server-only";

import { queryDataSource } from "@/lib/notion/client";
import { getNotionConfig } from "@/lib/notion/env";
import { notionPageToRecipe, type MappedRecipe } from "@/lib/notion/mapper";
import { resolveRecipeImage } from "@/lib/images/resolve-recipe-image";
import { getTotalPublicado } from "./total-cache";
import type { RecipeDTO, RecipesPage } from "@/lib/notion/types";

/**
 * Camada de orquestração das receitas: consome o client Notion, valida/mapeia,
 * resolve imagem local, e serve paginação por offset com cursor opaco.
 */

const DEFAULT_LIMIT = 6;
const MIN_LIMIT = 1;
const MAX_LIMIT = 24;
// Página interna do Notion ao paginar até alcançar o offset desejado.
const NOTION_PAGE_SIZE = 100;

export function clampLimit(bruto: number | undefined): number {
  if (bruto === undefined || Number.isNaN(bruto)) return DEFAULT_LIMIT;
  const inteiro = Math.floor(bruto);
  if (inteiro < MIN_LIMIT) return MIN_LIMIT;
  if (inteiro > MAX_LIMIT) return MAX_LIMIT;
  return inteiro;
}

/** Cursor opaco baseado em offset. Malformado/ausente -> offset 0. */
export function decodeCursor(cursor: string | null | undefined): number {
  if (!cursor) return 0;
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf8");
    const obj = JSON.parse(json) as { offset?: unknown };
    const offset = typeof obj.offset === "number" ? Math.floor(obj.offset) : 0;
    return offset >= 0 ? offset : 0;
  } catch {
    return 0;
  }
}

export function encodeCursor(offset: number): string {
  return Buffer.from(JSON.stringify({ offset }), "utf8").toString("base64url");
}

function finalize(m: MappedRecipe): RecipeDTO {
  const image = resolveRecipeImage({
    order: m.dto.order,
    slug: m.dto.slug,
    title: m.dto.title,
  });
  return { ...m.dto, image };
}

/**
 * Busca todas as páginas publicadas (Publicado=true && slug!=""), ordenadas por
 * Ordem. Paginação interna do Notion. Retorna a lista completa de mapeados
 * publicados — a fatia por offset é feita pelo chamador.
 */
async function buscarPublicados(): Promise<MappedRecipe[]> {
  const publicados: MappedRecipe[] = [];
  let cursor: string | undefined;
  // Guarda de segurança contra loop (limite de 10k do Notion / 100 por página).
  for (let i = 0; i < 100; i++) {
    const resp = await queryDataSource({
      pageSize: NOTION_PAGE_SIZE,
      startCursor: cursor,
      filterPublicado: true,
      sortByOrdem: true,
    });
    for (const cru of resp.results) {
      const mapeado = notionPageToRecipe(cru);
      if (mapeado && mapeado.publicado) publicados.push(mapeado);
    }
    if (!resp.has_more || !resp.next_cursor) break;
    cursor = resp.next_cursor;
  }
  return publicados;
}

/**
 * Busca TODAS as receitas do banco (sem filtrar por Publicado), ordenadas por
 * Ordem. Usada pelo catálogo público por decisão editorial explícita do
 * usuário: o site deve exibir as 85 receitas independentemente do valor de
 * "Publicado" no Notion. Nunca escreve no Notion; o campo `publicado` de cada
 * MappedRecipe é preservado (via notionPageToRecipe) para uso editorial
 * futuro, mesmo não sendo usado como filtro aqui.
 */
async function buscarTodas(): Promise<MappedRecipe[]> {
  const todas: MappedRecipe[] = [];
  let cursor: string | undefined;
  // Guarda de segurança contra loop (limite de 10k do Notion / 100 por página).
  for (let i = 0; i < 100; i++) {
    const resp = await queryDataSource({
      pageSize: NOTION_PAGE_SIZE,
      startCursor: cursor,
      sortByOrdem: true,
    });
    for (const cru of resp.results) {
      const mapeado = notionPageToRecipe(cru);
      if (mapeado) todas.push(mapeado);
    }
    if (!resp.has_more || !resp.next_cursor) break;
    cursor = resp.next_cursor;
  }
  return todas;
}

/** Normaliza texto para comparação de busca: minúsculas e sem acentos. */
function normalizarBusca(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Lista paginada de receitas. Sem token configurado -> catálogo vazio (HTTP 200
 * no chamador, nunca erro). Nunca lança por catálogo vazio legítimo.
 *
 * Quando `query` é informado, filtra por título (busca textual, sem acento,
 * case-insensitive) ANTES de paginar — o carregamento de 6 em 6 (via
 * limit/cursor) se aplica ao resultado já filtrado, preservando a ordenação
 * por Ordem. `total` reflete a contagem filtrada.
 *
 * `somentePublicadas` (default `true`) controla o escopo de leitura:
 * - `true` (padrão, compatível com chamadores existentes): usa apenas as
 *   receitas com Publicado=true no Notion.
 * - `false`: usa TODAS as receitas do banco, ordenadas por Ordem, ignorando o
 *   valor de Publicado — decisão editorial explícita para o catálogo público
 *   mostrar as 85 receitas. Nunca escreve no Notion; o campo `publicado` de
 *   cada receita retornada é preservado no MappedRecipe para uso editorial
 *   futuro (não é removido, apenas não usado como filtro neste modo).
 */
export async function listarReceitas(params: {
  limit?: number;
  cursor?: string | null;
  query?: string | null;
  somentePublicadas?: boolean;
}): Promise<RecipesPage> {
  if (getNotionConfig() === null) {
    return { items: [], total: 0, nextCursor: null, hasMore: false };
  }

  const limit = clampLimit(params.limit);
  const offset = decodeCursor(params.cursor);
  const queryNormalizada = params.query?.trim() ? normalizarBusca(params.query.trim()) : null;
  const somentePublicadas = params.somentePublicadas ?? true;

  const base = somentePublicadas ? await buscarPublicados() : await buscarTodas();
  const filtrados = queryNormalizada
    ? base.filter((m) => normalizarBusca(m.dto.title).includes(queryNormalizada))
    : base;

  const total = queryNormalizada
    ? filtrados.length
    : somentePublicadas
      ? await getTotalPublicado(async () => base.length)
      : base.length;

  const fatia = filtrados.slice(offset, offset + limit);
  const items = fatia.map(finalize);
  const proximoOffset = offset + limit;
  const hasMore = proximoOffset < filtrados.length;

  return {
    items,
    total,
    nextCursor: hasMore ? encodeCursor(proximoOffset) : null,
    hasMore,
  };
}

/**
 * Busca uma receita publicada por slug. Slug duplicado -> menor Ordem
 * (determinístico). Não configurado / não encontrado -> null.
 */
export async function buscarPorSlug(slug: string): Promise<RecipeDTO | null> {
  if (getNotionConfig() === null) return null;

  const publicados = await buscarPublicados();
  const candidatos = publicados.filter((m) => m.dto.slug === slug);
  if (candidatos.length === 0) return null;

  if (candidatos.length > 1) {
    console.warn(`[recipes-service] slug duplicado no Notion: "${slug}" (${candidatos.length})`);
  }
  // buscarPublicados já vem ordenado por Ordem asc; o primeiro é o de menor Ordem.
  return finalize(candidatos[0]);
}
