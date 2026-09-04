/**
 * Leitura lazy da configuração do Notion. Retorna null quando o token ou o
 * data source não estão configurados (ausentes, vazios ou com o placeholder
 * "adicione_localmente" do .env.example). Nunca lê env no top-level de módulo,
 * para não quebrar import em teste/CI sem token.
 */

const PLACEHOLDERS = new Set(["", "adicione_localmente"]);

export interface NotionConfig {
  token: string;
  dataSourceId: string;
}

function limpar(valor: string | undefined): string | null {
  if (valor === undefined) return null;
  const t = valor.trim();
  if (PLACEHOLDERS.has(t)) return null;
  return t;
}

export function getNotionConfig(): NotionConfig | null {
  const token = limpar(process.env.NOTION_TOKEN);
  const dataSourceId = limpar(process.env.NOTION_DATA_SOURCE_ID);
  if (!token || !dataSourceId) return null;
  return { token, dataSourceId };
}
