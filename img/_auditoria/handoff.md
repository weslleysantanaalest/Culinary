# Handoff — Auditoria de Imagens Culinary

**Sessão**: 2026-09-03 08:40 → 09:50 (America/Sao_Paulo)
**Status**: Missão EM ANDAMENTO — não concluída. Bloqueio ativo por falta de ferramenta de geração de imagem.

## Resumo executivo

- Total de receitas no Notion: **85** (confirmado, CONEXÃO VALIDADA).
- Imagens aprovadas: **12** (Ordem 1, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 16).
- Receitas sem imagem aprovada (fila oficial): **73**.
- Checagem: 12 + 73 = 85 ✓.
- Property "Imagem" e bloco "Imagem do item" escritos e verificados consistentes no Notion
  para as 12 aprovadas.
- **Bloqueio principal**: nenhuma ferramenta de geração de imagem (texto→imagem) disponível
  nesta sessão Kiro CLI. As 73 receitas restantes não podem ser geradas até essa ferramenta
  estar disponível.
- **Achado editorial não resolvido**: 84/85 receitas têm `Publicado=false` no Notion (só
  Ordem 1 é `true`). O site não exibirá as demais 11 aprovadas nesta sessão até publicação
  manual — decisão do usuário, fora do escopo desta missão de imagens.

## O que foi descoberto nesta sessão (achado crítico)

Entre o fim da sessão anterior (02/09 17:40) e o início desta (03/09 08:40), um processo
**externo a esta cadeia de auditoria** — provavelmente o usuário usando a IA generativa
nativa de imagem do Notion diretamente na interface — gerou e anexou imagens a **9 das 85**
páginas (Ordem 1, 2, 3, 4, 5, 6, 7, 9, 11). A hipótese inicial desta sessão ("todas as 85 têm
imagem") estava errada; foi corrigida após levantamento individual de cada uma das 85
páginas via `API-retrieve-page-markdown`.

Dessas 9 imagens novas:
- **Ordem 2 (Molho zabaglione)**: REJEITADA. Contém frutas frescas (figos, framboesas,
  damascos) não confirmadas nos ingredientes, além de fundo fora do padrão visual.
- **Ordem 1, 3, 4, 5, 6, 7, 9, 11**: conteúdo excelente, resolvem exatamente os motivos de
  rejeição anteriores (Ordem 3 agora mostra o doce montado em camadas; Ordem 4 mostra glacê
  de chocolate; Ordem 5 mostra bolo sem decoração de chocolate; Ordem 6 mostra a espiral do
  rocambole; Ordem 7 mostra queijo ralado). Todas aprovadas por conteúdo, com a mesma
  pendência de padrão visual/resolução já documentada para as 5 aprovações anteriores desta
  auditoria (Ordem 1, 10, 13, 14, 16) — nenhuma das 12 aprovadas atinge estritamente o padrão
  de fundo mármore branco + grama desfocada, nem a resolução mínima de 1600×1200.

Detalhes completos, evidência e raciocínio: `img/_auditoria/ACHADO-CRITICO-2026-09-03.md`.

## Estado dos arquivos de auditoria

| Arquivo | Estado |
|---|---|
| `img/_auditoria/estado-atual.csv` | 85 linhas, atualizado com as 12 aprovações |
| `img/_auditoria/imagens-aprovadas.csv` | 12 linhas (5 da sessão anterior + 7 desta sessão) |
| `img/_auditoria/imagens-rejeitadas.csv` | 12 linhas com coluna `situacao_atual` indicando quais foram resolvidas |
| `img/_auditoria/hashes.csv` | Atualizado com os hashes SHA-256 das 12 imagens finais |
| `img/_auditoria/receitas-sem-imagem.csv` | 73 linhas — fila oficial atual |
| `img/_auditoria/prompts-pendentes.jsonl` | 73 linhas, sincronizado com a fila |
| `img/_auditoria/progresso.json` | Números recalculados e achado crítico documentado |
| `img/_auditoria/ACHADO-CRITICO-2026-09-03.md` | Investigação completa do achado desta sessão |
| `img/_auditoria/execution.log` | Log append-only de toda a sessão |

## Imagens aprovadas (12) — arquivo e localização

Todas em `img/*.webp` (raiz do repo) E sincronizadas em
`culinary-app/public/images/recipes/*.webp` (para o app):

| Ordem | Receita | Arquivo |
|---|---|---|
| 1 | Pudim de coco queimado | `001-pudim-de-coco-queimado.webp` |
| 3 | Champanhita | `003-champanhita.webp` |
| 4 | Glacê para bolo | `004-glace-para-bolo.webp` |
| 5 | Bolo Sarah | `005-bolo-sarah.webp` |
| 6 | Pão irlandês com pastel | `006-pao-irlandes-com-pastel.webp` |
| 7 | Pudim Francês | `007-pudim-frances.webp` |
| 9 | Pudim de ameixas e claras (Sugi) | `009-pudim-de-ameixas-e-claras-sugi.webp` |
| 10 | Bolo de fubá (Clarice) | `010-bolo-de-fuba-clarice.webp` |
| 11 | Gelatina com salada de frutas | `011-gelatina-com-salada-de-frutas.webp` |
| 13 | Bolo de ameixas | `013-bolo-de-ameixas.webp` |
| 14 | Bolachinhas Quaker | `014-bolachinhas-quaker.webp` |
| 16 | Sequilho de fubá | `016-sequilho-de-fuba.webp` |

## Integração no projeto (task #8)

- `culinary-app/src/lib/images/resolve-recipe-image.ts` já estava corretamente implementada
  (defesa dupla contra path traversal). Não precisou de correção de lógica.
- Criado `culinary-app/public/images/recipes/` (não existia) e sincronizadas as 12 imagens.
- Criado `culinary-app/src/lib/images/resolve-recipe-image.test.ts` (11 casos de teste).
- Resolvido bloqueio de infraestrutura: `server-only` quebrava testes fora do runtime
  Next.js — adicionado alias em `vitest.config.mts` para `src/test/server-only-mock.ts`.
- Suite completa: **12 arquivos, 99 testes, todos passando**.
- Build de produção (`next build`) passa sem erros.
- Componentes `RecipeCard` e página de detalhe já usam `ImagemEmPreparacao` como placeholder
  neutro quando `image === null` — não precisou de mudança.

## Atualização no Notion (task #9)

**Permissão de escrita CONFIRMADA** nesta sessão (testada em página de baixo risco antes de
aplicar às demais).

Para as 12 receitas aprovadas:
1. Property "Imagem" (rich_text) escrita com o nome de arquivo padronizado via
   `API-patch-page` (integração `notion-token`).
2. Upload de cada arquivo `.webp` via `notion-create-file-upload` (integração `notion-oauth`)
   + POST multipart direto para a signed URL.
3. Bloco "## Imagem do item" criado/substituído no corpo de cada página via
   `notion-update-page` (`replace_content`), usando `<image src="file-upload://...">`.
4. **Lição aprendida**: uploads feitos pela integração `notion-oauth` só podem ser
   referenciados por ferramentas da mesma integração (`notion-update-page`), não por
   `notion-token::API-update-page-markdown`. Usar a integração errada resulta em bloco de
   imagem vazio (`![]()`).
5. Corrigidos 3 casos de duplicação de bloco (Ordem 1, 14, 16) causados por chamadas
   paralelas que competiram no mesmo bloco de inserção — corrigidos com `replace_content`
   completo da página.
6. Verificação final: `API-query-data-source` + `API-retrieve-page-markdown` confirmam as
   12 receitas com property "Imagem" e bloco "Imagem do item" consistentes (mesma imagem).

Nenhuma escrita foi feita nas 73 receitas sem imagem aprovada (aguardando ferramenta de
geração — não há nome de arquivo válido para escrever ainda).

## Bloqueio ativo — geração de imagem

Confirmado nesta sessão (retestado): **nenhuma ferramenta de geração de imagem (texto→imagem)
está disponível neste ambiente Kiro CLI**. `tool_search` não retornou nenhuma ferramenta
relevante. As 73 receitas da fila oficial (`receitas-sem-imagem.csv`) têm prompts prontos em
`img/_auditoria/prompts-pendentes.jsonl`, construídos com ingredientes e modo de preparo reais
extraídos do Notion, seguindo o padrão visual obrigatório e as correções específicas para as
receitas anteriormente rejeitadas.

## Achado editorial pendente de decisão do usuário

Das 85 receitas, **apenas Ordem 1 tem `Publicado=true`**. As demais 84 — incluindo as 11
outras aprovadas nesta sessão (3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 16) — têm `Publicado=false`.
O código do app (`recipes-service.ts`, função `buscarPublicados()`) filtra estritamente por
`Publicado=true`, então essas 11 receitas com imagem e dados corretos **não aparecerão no
site** até que o usuário decida marcar `Publicado=true`. Isso é uma decisão de conteúdo/
editorial fora do escopo desta missão de imagens — não foi alterada sem confirmação explícita
do usuário.

## Próximos passos (para a próxima sessão)

1. **Prioridade alta**: obter acesso a uma ferramenta de geração de imagem (nesta sessão CLI
   futura, ou via navegador manual usando a IA generativa nativa do Notion, como já ocorreu
   com as 9 imagens desta sessão) para processar as 73 receitas restantes em blocos de 10,
   seguindo `receitas-sem-imagem.csv` e os prompts em `prompts-pendentes.jsonl`.
2. Ao gerar novas imagens: inspecionar visualmente cada uma contra o padrão obrigatório
   (fundo mármore branco + grama desfocada, resolução mínima 1600×1200, proporção 4:3, sem
   ingredientes não confirmados) antes de aprovar. Em caso de dúvida, rejeitar.
2b. **Considerar regenerar as 12 já aprovadas** com o padrão visual correto quando a
    ferramenta estiver disponível — elas foram aprovadas por conteúdo mas todas têm a mesma
    pendência de fundo/resolução fora do padrão.
3. Decidir com o usuário se as 11 receitas aprovadas com `Publicado=false` devem ser
   publicadas (ação editorial separada da geração de imagens).
4. Continuar seguindo Ordem numérica ao processar a fila; atualizar CSVs e checkpoints
   (`progresso.json`, `execution.log`) após cada bloco de 10.
5. Repetir o fluxo de escrita no Notion (property Imagem + bloco "Imagem do item") para cada
   nova receita aprovada, seguindo exatamente o procedimento documentado na seção anterior
   (atenção à integração correta para uploads).

## Segurança e reversibilidade

- Nenhum comando destrutivo foi executado (sem `git reset`, `git clean`, exclusão definitiva).
- Nenhuma imagem rejeitada foi excluída — permanecem em `img/_nao_utilizar/`.
- Todas as escritas no Notion foram em páginas específicas de receitas aprovadas, com
  evidência de conteúdo verificada antes da escrita.
- `git status` no início da sessão: sem commits, apenas arquivos untracked — inalterado
  nesta sessão (nenhum commit foi criado).
