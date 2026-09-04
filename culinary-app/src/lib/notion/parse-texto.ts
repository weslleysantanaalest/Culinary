/**
 * Parsers tolerantes de texto livre do Notion. Puramente por linha, sem
 * heurística frágil. Contrato de segurança: NUNCA lançam; entrada não-string
 * (null/undefined/número) resulta em [].
 */

const PREFIXO_BULLET = /^[-*•]\s*/;
const PREFIXO_NUMERO = /^\d+[.)]\s*/;

/**
 * Converte texto livre em lista de strings: quebra por linha, remove
 * bullets/numeração de prefixo, faz trim e descarta linhas vazias.
 */
export function parseLista(texto: unknown): string[] {
  if (typeof texto !== "string") return [];
  return texto
    .split(/\r?\n/)
    .map((linha) => linha.trim().replace(PREFIXO_BULLET, "").replace(PREFIXO_NUMERO, "").trim())
    .filter((linha) => linha.length > 0);
}
