import "server-only";

/**
 * Cache best-effort do total de receitas publicadas (sem Redis). TTL curto:
 * em serverless o cache é por-instância, aceitável para não recontar a cada
 * clique de paginação.
 */

const TTL_MS = 60_000;

let cache: { value: number; expires: number } | null = null;

export async function getTotalPublicado(fetcher: () => Promise<number>): Promise<number> {
  const agora = Date.now();
  if (cache && cache.expires > agora) return cache.value;
  const value = await fetcher();
  cache = { value, expires: agora + TTL_MS };
  return value;
}

/** Uso em teste: limpa o cache entre casos. */
export function _resetTotalCache(): void {
  cache = null;
}
