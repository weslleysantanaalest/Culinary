import { NextResponse } from "next/server";
import { NotionError } from "@/lib/notion/client";

/**
 * Envelopes de resposta seguros. Nunca expõem corpo do Notion, token ou stack.
 * O detalhe fica só no log server-side.
 */

export function jsonOk<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 200 });
}

export function jsonError(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status });
}

/**
 * Traduz uma exceção interna para uma resposta HTTP segura e loga o detalhe.
 * NOT_CONFIGURED/TIMEOUT/NETWORK -> 503 unavailable; demais -> 500 internal.
 */
export function traduzErro(erro: unknown, contexto: string): NextResponse {
  const correlationId = crypto.randomUUID();
  if (erro instanceof NotionError) {
    console.error(
      `[api] ${contexto} correlationId=${correlationId} notionError=${erro.code}` +
        (erro.status ? ` status=${erro.status}` : ""),
    );
    if (erro.code === "NOT_CONFIGURED" || erro.code === "TIMEOUT" || erro.code === "NETWORK") {
      return jsonError("unavailable", 503);
    }
    return jsonError("internal_error", 500);
  }
  console.error(`[api] ${contexto} correlationId=${correlationId} erro inesperado`);
  return jsonError("internal_error", 500);
}
