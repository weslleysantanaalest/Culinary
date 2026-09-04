# Status de Conexão Notion MCP — Culinary

**Última verificação nesta sessão**: 2026-09-02

## Resultado

CONEXÃO VALIDADA (não bloqueada).

Evidência coletada nesta sessão (chamadas reais, não presumidas):

1. `API-retrieve-a-data-source` no ID `d89d6174-4f45-82ca-90cf-077afc5f8cf3`
   → sucesso. Título exato: "Caderno de Receitas — Livro 3 (1)".
   → parent database_id: `d82d6174-4f45-8338-946b-8197613c84c1`.
   → schema completo confirmado (Receita/title, Ordem/number, Slug/rich_text,
     Ingredientes/rich_text, Modo de preparo/rich_text, Fonte/url,
     Páginas originais/rich_text, Status da transcrição/select,
     Publicado/checkbox, Imagem/rich_text, ID/unique_id, Atualizado em/last_edited_time).

2. `API-query-data-source` (Ordem ascendente, page_size=5) → sucesso, Ordem 1-5 confirmada.
3. `API-query-data-source` (Ordem descendente, page_size=5) → sucesso, Ordem 81-85 confirmada.
4. `API-query-data-source` (page_size=100, todas propriedades, Ordem ascendente)
   → sucesso. `has_more=false`, `next_cursor=null`. **total=85**.
   → Ordem 1 = Pudim de coco queimado
   → Ordem 2 = Molho zabaglione
   → Ordem 3 = Champanhita
   → Ordem 84 = Torta de maçã (Vila)
   → Ordem 85 = Torta assombrosa (Lucia Poteller)
   → Todos batendo exatamente com a validação esperada.

5. Leitura de corpo de página via `API-retrieve-page-markdown` bem-sucedida para:
   - Ordem 2 — Molho zabaglione (`page_id d04d6174-4f45-82f9-9c3c-81c97e01519a`)
   - Ordem 4 — Glacê para bolo (`page_id a19d6174-4f45-832c-9644-817e92226dfc`)

## Origem do bloqueio relatado em sessão anterior

Uma sessão anterior (contexto diferente) relatou `404 object_not_found` ao tentar
acessar o mesmo data source/database. Esse bloqueio foi resolvido pelo usuário,
que adicionou a integração "Kiro MCP" diretamente como conexão da página
"Caderno de Receitas — Livro 3 (1)". A partir dessa correção, todas as chamadas de
leitura nesta sessão retornaram sucesso (ver evidência acima). Não há mais 404
reproduzido nesta sessão.

## Permissão de escrita

**Ainda não testada nesta sessão.** As chamadas executadas até agora foram todas
de leitura (`retrieve`, `query`). Antes de escrever no campo "Imagem" ou na seção
"Imagem do item" de qualquer página, será necessário testar `API-update-page` ou
`API-patch-page` e `API-update-page-markdown` em uma página de teste/baixo risco,
e registrar o resultado real aqui (sucesso ou 403/permissão insuficiente).

## Integração MCP

- Nome: Kiro MCP
- Integration ID: `375d6174-4f45-813f-ad52-0027c8354020`
- Conectada diretamente à página "Caderno de Receitas — Livro 3 (1)" (ação do usuário).

## Próxima ação relacionada ao Notion

Ao chegar na etapa de atualização do Notion (task #13), testar permissão de
escrita antes de tentar qualquer `update-page` real. Se retornar 403 ou erro de
permissão, gerar `img/_auditoria/atualizacoes-notion-pendentes.csv` em vez de
declarar qualquer atualização.
