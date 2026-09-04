# MT-019 — Migração corpo→propriedades e publicação da receita piloto

- **Status**: PASS_COMPLETO para tudo que dependia de código e dados. **Gap de escopo real identificado e não corrigido sem nova autorização** (ver seção "Achado crítico").
- **Data/hora**: 2026-09-01 13:00–13:16 -03:00
- **Responsável pela execução**: Kiro (backup manual + subagente para auditoria/parser + validação ponta a ponta pelo orquestrador)

## Objetivo

Corrigir a estrutura de dados da base "Caderno de Receitas — Livro 3 (1)": copiar o conteúdo real do corpo das páginas (seções `## Ingredientes` e `## Modo de preparo`) para as propriedades estruturadas homônimas, sem apagar o corpo original, e publicar a receita piloto "Pudim de coco queimado" após validação completa.

## Total auditado

**85 receitas**, todas com o mesmo padrão: propriedades `Ingredientes`, `Modo de preparo`, `Slug` e `Imagem` vazias nas propriedades estruturadas, mas com conteúdo real no corpo da página sob os títulos `## Ingredientes` e `## Modo de preparo`.

## Etapa 1 — Backup

Backup local criado em `/Users/weslleysantana/Projetos/Culinary/.kiro/private-backups/notion-recipes-before-migration.json` (85 receitas, metadados de propriedades — id da página, receita, slug/publicado/ingredientes/modo de preparo atuais, status da transcrição, data de coleta). Diretório adicionado ao `.gitignore` do projeto.

## Etapa 2 — Parser e ferramenta de migração

Criado `/Users/weslleysantana/Projetos/Culinary/automation/tools/migrate_notion_recipe_content.py` (522 linhas):
- Núcleo: `parse_sections()`, função **pura**, testada isoladamente — recebe blocos normalizados e classifica em `SAFE_TO_MIGRATE`, `ALREADY_STRUCTURED`, `MANUAL_REVIEW` ou `ERROR`.
- Camada de I/O: leitura via API REST do Notion (`GET /pages/{id}`, `GET /blocks/{id}/children` com paginação), escrita via `PATCH /pages/{id}` com chunking automático para o limite de 2000 caracteres por bloco `rich_text`.
- Três modos: `--dry-run` (só classifica), `--recipe "<nome>" --apply` (migra uma receita com readback), `--apply-safe` (lote, com readback por escrita, respeitando rate limit).
- Segurança: token lido de `culinary-app/.env.local` ou `os.environ`, nunca logado; nenhum conteúdo integral de receita impresso no terminal (só contagens e nomes com problema); nunca sobrescreve propriedade de destino já preenchida.

Testes em `/Users/weslleysantana/Projetos/Culinary/automation/tests/test_migrate_notion_recipe_content.py`: **11 testes** cobrindo caso feliz, variações de rótulo, seção ausente (cada uma e ambas), seção duplicada (cada uma), conteúdo vazio, e normalização — todos passando.

## Etapa 3 — Dry-run das 85 receitas (evidência fresca, verificada duas vezes)

Rodado pelo subagente e **re-executado de forma independente pelo orquestrador** contra os dados reais do Notion:

| Categoria | Contagem |
|---|---|
| **SAFE_TO_MIGRATE** | **85** |
| ALREADY_STRUCTURED | 0 |
| MANUAL_REVIEW | 0 |
| ERROR | 0 |
| **TOTAL** | **85** |

Todas as 85 receitas têm exatamente uma seção `Ingredientes` e uma `Modo de preparo`, ambas com conteúdo real, sem ambiguidade, sem duplicação, com destino vazio confirmado. Nenhuma escrita ocorreu nesta etapa.

## Etapa 4 — Receita piloto: migração corpo→propriedades

Executado `--recipe "Pudim de coco queimado" --apply` → `OK` (readback automático confirmou).

**Validação manual adicional (releitura completa da página via Notion)**:
- `Ingredientes` gravado: 7 itens reais ("1 coco ralado", "Açúcar — quantidade ilegível", etc.), idêntico ao corpo.
- `Modo de preparo` gravado: 3 passos reais, idêntico ao corpo.
- **Corpo original preservado intacto** — `## Ingredientes`, `## Modo de preparo`, `## Imagens originais` inalterados.
- `Status da transcrição` — inalterado (`Transcrita`).
- `Fonte`, `Ordem`, `Páginas originais`, `Receita` — inalterados.
- `Publicado`/`Slug` — ainda vazios nesta etapa (correto; são a Etapa 5).

## Etapa 5 — Slug e publicação da piloto

Atualizado via `notion-update-page`: `Slug = "pudim-de-coco-queimado"`, `Publicado = true`. Releitura confirmou os dois valores exatos e nenhuma outra propriedade alterada. **Esta publicação é real e permanente**, conforme instruído.

## Etapa 6 — Validação ponta a ponta (evidência fresca, servidor real reiniciado)

| # | Critério | Resultado |
|---|----------|-----------|
| 1 | `/api/health` confirma conexão | ✅ `{"status":"ok","notionConfigured":true}` |
| 2 | `/api/recipes?limit=6` retorna a receita publicada | ✅ `total:1`, 1 item |
| 3 | Ingredientes vêm da propriedade estruturada | ✅ 7 itens reais no campo `ingredients` da API |
| 4 | Modo de preparo vem da propriedade estruturada | ✅ 3 passos reais no campo `instructions` |
| 5 | Slug correto | ✅ `"slug":"pudim-de-coco-queimado"` |
| 6 | Nenhuma receita fictícia aparece | ✅ só a piloto no catálogo |
| 7 | Nenhuma URL do Stitch aparece | ✅ `"image":null` |
| 8 | Contador `1 de 1 receita` | ✅ confirmado via Playwright real: **"1 de 1 receitas"** |
| 9 | "Carregar mais" não aparece | ✅ confirmado via Playwright real: **0 ocorrências** |
| 10 | Detalhe abre pelo slug | ✅ `/receitas/pudim-de-coco-queimado` → HTTP 200 |
| 11 | "Imagem em preparação" aparece | ✅ confirmado no HTML da galeria e do detalhe |
| 12 | Modo Cozinhar usa passos reais | ⚠️ **NÃO ALCANÇÁVEL — ver Achado Crítico abaixo** |
| 13 | "Iniciar receita" inicia narração | ⚠️ **NÃO ALCANÇÁVEL — mesma causa** |
| 14 | Existe somente "Repetir instrução" | N/A (não alcançável) |
| 15 | Timer funciona | N/A (não alcançável) |
| 16 | Nenhum segredo no navegador/logs | ✅ `NOTION_TOKEN` confirmado só em `src/lib/notion/` (server-only) |

## 🔴 Achado crítico — Modo Cozinhar desconectado das receitas reais do Notion

A página de detalhe Notion-backed (`src/app/receitas/[id]/page.tsx`) **não contém nenhum link ou botão para o Modo Cozinhar**. Isso é consequência de uma decisão de escopo já tomada na MT-018: ao migrar a galeria/detalhe para o backend Notion, o Implementador removeu o componente `BotaoIniciarCozinhar` (que levava a `/cozinhar/[id]`) porque essa rota ainda depende do shape de dados rico da fixture antiga (passos com tempo estimado, ingredientes por passo) — que o Notion não fornece hoje.

**Consequência prática**: mesmo com a receita "Pudim de coco queimado" publicada e com dados reais, **não existe caminho pela interface** para abrir o Modo Cozinhar guiado, testar a narração automática ou o timer usando os dados reais desta receita. A rota `/cozinhar/[id]` continua isolada, servindo apenas as receitas da fixture de teste (`massa-fresca-classica`, `pasta-pomodoro-classica`, etc.).

Isso **não é um bug introduzido por esta migração** — é o resultado esperado da decisão de escopo anterior, mas os itens 12-15 desta minitask especificamente pediam essa validação, e ela não pode ser feita sem uma nova decisão: conectar o Modo Cozinhar ao backend Notion (o que exigiria estender o schema do Notion com dados de passo estruturados, ou adaptar o Modo Cozinhar para funcionar com o formato simples de `instructions: string[]`) é trabalho novo, fora do escopo autorizado nesta minitask, e não foi feito.

## Testes e evidência (fresca, desta sessão, verificada de forma independente pelo orquestrador)

```
$ pytest automation/tests/test_migrate_notion_recipe_content.py -v  → 11/11 passed
$ python -m automation.tools.migrate_notion_recipe_content --dry-run → 85 SAFE, 0 erros (verificado 2x)
$ python -m automation.tools.migrate_notion_recipe_content --recipe "Pudim de coco queimado" --apply → OK

$ npm run lint   → limpo, exit 0
$ npm run build  → sucesso, rotas /api/health, /api/recipes, /api/recipes/[slug] (ƒ), /, /receitas/[id] (ƒ)
$ npm test       → 88/88 passed (11 arquivos)
$ pytest automation/tests/ → 38/38 passed (27 anteriores + 11 novos do migrador)
$ npx playwright test --workers=2 → 30/32 passed
  → 2 falhas pré-existentes em e2e/planejador.spec.ts (fixture de data expirada,
    documentado desde MT-015), não relacionadas a esta minitask.

$ curl /api/health → 200 {"status":"ok","notionConfigured":true}
$ curl /api/recipes?limit=6 → 200, total:1, item real "pudim-de-coco-queimado"
$ Playwright real: contador "1 de 1 receitas" confirmado, "Carregar mais receitas" = 0 ocorrências
```

## Segurança

- `NOTION_TOKEN` confirmado presente apenas em `culinary-app/src/lib/notion/` (server-only) — grep em todo `src/` excluindo esse diretório retorna zero.
- Nenhum conteúdo de receita ou token impresso em logs, terminal ou neste relatório.
- Backup local (`private-backups/`) contém apenas metadados de propriedades, não o corpo completo das páginas.

## Migração das demais 84 receitas — NÃO EXECUTADA

Conforme instrução explícita ("Não publique as outras 84 receitas sem uma nova autorização explícita" e a Etapa 7 exigir aprovação da piloto + fluxo ponta a ponta antes de escalar), a migração em lote (`--apply-safe`) **não foi executada**. Todas as 84 receitas restantes permanecem com `Publicado=false` e propriedades vazias, exatamente como estavam.

## Learning loop

Reconfirmada a disciplina de não aceitar números "redondos demais" (85/85 SAFE_TO_MIGRATE) sem verificação independente — o orquestrador releu o parser linha a linha e re-executou o dry-run pessoalmente antes de prosseguir para qualquer escrita real. A escrita na piloto só ocorreu após confirmação de que os critérios de conteúdo (Etapa "antes de alterar, confirme...") eram atendidos.

## Próxima ação

1. **Decisão do responsável sobre o Achado Crítico**: como conectar o Modo Cozinhar ao backend Notion — schema estendido com passos estruturados, ou adaptação do Modo Cozinhar para o formato simples `instructions: string[]`. Nenhuma ação tomada sem essa decisão.
2. Migrar as demais 84 receitas com `--apply-safe` (aguardando nova autorização explícita).
3. Decidir sobre a publicação em massa das receitas migradas (a migração de dados é separada da decisão editorial de publicação, conforme já estabelecido).
