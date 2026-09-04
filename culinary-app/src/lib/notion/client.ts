import "server-only";

import { getNotionConfig } from "./env";
import { QueryResponseSchema, type QueryResponse } from "./schema";

/**
 * Cliente Notion server-only. Usa `fetch` nativo (undici/Node 20+) contra a
 * REST API — sem @notionhq/client. A validação Zod (schema.ts) é a fronteira
 * de confiança. Erros nunca vazam corpo do Notion, token ou stack ao cliente.
 */

// Versão estável que introduziu data sources e o endpoint
// POST /v1/data_sources/{id}/query. Fixada como constante intencionalmente.
export const NOTION_VERSION = "2025-09-03";
const NOTION_API_BASE = "https://api.notion.com/v1";
const TIMEOUT_MS = 8000;

export type NotionErrorCode = "NOT_CONFIGURED" | "TIMEOUT" | "HTTP_ERROR" | "NETWORK";

export class NotionError extends Error {
  readonly code: NotionErrorCode;
  readonly status?: number;
  constructor(code: NotionErrorCode, status?: number) {
    super(code);
    this.name = "NotionError";
    this.code = code;
    this.status = status;
  }
}

export interface QueryDataSourceParams {
  pageSize: number;
  startCursor?: string;
  /** Aplica filtro Publicado = true no server. */
  filterPublicado?: boolean;
  /** Ordena por Ordem ascendente (paginação determinística). */
  sortByOrdem?: boolean;
}

/**
 * Consulta o data source com filtro/sort opcionais. Retorna a resposta CRUA já
 * validada estruturalmente (results ainda são páginas cruas para o mapper).
 * Lança NotionError em qualquer falha; o chamador traduz para resposta segura.
 */
export async function queryDataSource(params: QueryDataSourceParams): Promise<QueryResponse> {
  const config = getNotionConfig();
  if (!config) throw new NotionError("NOT_CONFIGURED");

  const body: Record<string, unknown> = { page_size: params.pageSize };
  if (params.startCursor) body.start_cursor = params.startCursor;
  if (params.filterPublicado) {
    body.filter = { property: "Publicado", checkbox: { equals: true } };
  }
  if (params.sortByOrdem) {
    body.sorts = [{ property: "Ordem", direction: "ascending" }];
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let resposta: Response;
  try {
    resposta = await fetch(`${NOTION_API_BASE}/data_sources/${config.dataSourceId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") {
      throw new NotionError("TIMEOUT");
    }
    throw new NotionError("NETWORK");
  } finally {
    clearTimeout(timeout);
  }

  if (!resposta.ok) {
    // Não propaga o corpo do Notion; só o status para log server-side.
    throw new NotionError("HTTP_ERROR", resposta.status);
  }

  const json = (await resposta.json().catch(() => null)) as unknown;
  return QueryResponseSchema.parse(json ?? {});
}
