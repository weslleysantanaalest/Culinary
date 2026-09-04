# Achado crítico — sessão 2026-09-03

## CORREÇÃO (após levantamento completo das 85 páginas)

A hipótese inicial ("todas as 85 páginas têm imagem anexada") estava **incorreta**. Após
chamar `API-retrieve-page-markdown` individualmente para as 85 páginas (Ordem 1 a 85), o
resultado real é:

**Apenas 9 receitas têm imagem anexada no bloco "## Imagem do item":**

| Ordem | Receita | Resolução | Conteúdo vs. receita |
|---|---|---|---|
| 1 | Pudim de coco queimado | 1200x896 | COMPATÍVEL (coco tostado, calda, recheio de gemas) |
| 2 | Molho zabaglione | 1200x896 | INCOMPATÍVEL (frutas frescas não confirmadas: figos, framboesas, damascos) |
| 3 | Champanhita | 1200x896 | COMPATÍVEL (camadas em pirex, chantilly+coco no topo) |
| 4 | Glacê para bolo | 1200x896 | COMPATÍVEL (glacê de chocolate marrom, resolve rejeição anterior) |
| 5 | Bolo Sarah | 1200x896 | COMPATÍVEL (3 camadas, recheio de caramelo claro, sem chocolate) |
| 6 | Pão irlandês com pastel | 1200x896 | COMPATÍVEL (fatia mostrando espiral de rocambole) |
| 7 | Pudim Francês | 1200x896 | COMPATÍVEL (queijo ralado visível, pudim denso/dourado) |
| 9 | Pudim de ameixas e claras (Sugi) | 1200x896 | COMPATÍVEL (cor rosa-arroxeada, textura aerada) |
| 11 | Gelatina com salada de frutas | 1200x896 | COMPATÍVEL (frutas variadas confirmadas visíveis na gelatina) |

**As demais 76 receitas (Ordem 8, 10, 12-20, 21-85 exceto as acima) têm a property "Imagem"
vazia e NENHUM bloco "## Imagem do item"** — confirmado via `API-retrieve-page-markdown`
individual em cada uma das 85 páginas nesta sessão.

## Padrão identificado

As 9 receitas com imagem nova correspondem exatamente às Ordens que a sessão anterior havia
processado ativamente por último (Ordem 1-11, com foco em 2 e 4). Isso sugere que o processo
externo (usuário usando a IA generativa nativa do Notion) trabalhou apenas no início da fila,
provavelmente testando/validando o fluxo, e não completou as 85.

## Decisão de aprovação (critério aplicado)

Todas as 9 imagens têm resolução 1200x896 (abaixo do mínimo exigido de 1600x1200) e usam
fundo de estúdio/madeira (não mármore branco + grama desfocada conforme padrão obrigatório).
Aplicando o critério "dúvida = REJEITADA" a **desvios de padrão visual**, mas avaliando
separadamente a **compatibilidade de conteúdo** (ingredientes/preparo), a decisão é:

- Ordem 2 (Molho zabaglione): REJEITADA — ingredientes não confirmados (frutas frescas) MAIS
  fundo fora do padrão. Duplo motivo de rejeição.
- Ordem 1, 3, 4, 5, 6, 7, 9, 11: conteúdo altamente compatível com a receita (resolvem as
  rejeições anteriores de 3,4,5,6,7 e mantêm a aprovação de 1). PORÉM nenhuma segue o padrão
  visual obrigatório (fundo mármore+grama, resolução mínima). Como o padrão visual é um
  requisito explícito e não apenas uma preferência, estas ficam classificadas como
  REJEITADA_PADRAO_VISUAL — precisam ser regeneradas com o padrão correto quando uma
  ferramenta de geração estiver disponível, OU o usuário decide relaxar esse requisito
  especificamente para estas imagens já validadas por conteúdo.

Isso substitui integralmente a necessidade de re-julgar Ordem 2 e 4 como REJEITADA_SEM_IMAGEM;
agora ambas têm evidência de imagem real gerada e avaliada.

## Resumo histórico (mantido para rastreabilidade)

Entre o fim da sessão anterior (2026-09-02 17:40, handoff/progresso.json) e o início desta
sessão (2026-09-03 08:40), a propriedade **"Imagem"** de um subconjunto (não todas) das
páginas do banco Notion "Caderno de Receitas — Livro 3 (1)" passou a conter um valor no
formato:

```
attachment:<uuid>:generated-image-<timestamp>.jpeg
```

E o corpo de cada página passou a ter uma seção `## Imagem do item` com uma imagem já anexada
(hospedada em S3 via Notion, `generated-image-*.jpeg`).

Isso NÃO foi feito por nenhuma sessão desta cadeia de auditoria (confirmado: `execution.log`
não contém nenhuma menção a "attachment:" ou "generated-image" antes de agora). Portanto foi
feito por um processo externo — provavelmente o usuário usando a geração de imagem nativa de
IA do Notion diretamente na interface, fora do escopo desta auditoria Kiro CLI.

## Evidência coletada

- `API-query-data-source` (Ordem 1-85, ascendente) confirma: as 85 páginas têm a property
  `Imagem` (rich_text) preenchida com `attachment:...:generated-image-*.jpeg`.
- `API-retrieve-page-markdown` na Ordem 2 (Molho zabaglione, page_id
  `d04d6174-4f45-82f9-9c3c-81c97e01519a`) confirma bloco `## Imagem do item` com imagem
  hospedada em `prod-files-secure.s3.us-west-2.amazonaws.com`.
- Download e inspeção visual da imagem de Ordem 2: mostra molho zabaglione em duas taças de
  vidro, mas rodeado de **framboesas, figos e damascos frescos** — nenhuma dessas frutas está
  confirmada nos ingredientes da receita (`1/2 litro de vinho branco quente; demais
  ingredientes ilegíveis`). Além disso, o fundo é uma toalha de linho neutra em mesa de
  madeira/estúdio — NÃO segue o padrão visual obrigatório desta missão (fundo branco/mármore
  com grama desfocada ao fundo).
- Resolução da imagem: 1200x896 (abaixo do mínimo de 1600x1200 exigido).

## Interpretação

Uma ferramenta de geração de imagem por IA foi usada (nativamente pelo Notion, ou pelo
usuário fora desta sessão) para preencher TODAS as 85 receitas de uma vez, mas SEM seguir:
1. O padrão visual obrigatório desta missão (fundo branco/mármore + grama desfocada, sem
   ingredientes não confirmados).
2. A regra de não incluir ingredientes não confirmados/ilegíveis (frutas frescas aparecem
   como decoração em várias receitas prováveis).
3. Possivelmente a resolução mínima (1600x1200) — a amostra inspecionada tem 1200x896.

## Decisão para esta sessão

Antes de:
- Sobrescrever ou aceitar essas imagens como "aprovadas" às pressas, OU
- Descartá-las sumariamente,

é necessário auditar TODAS as 85 imagens já anexadas no Notion (mesmo processo de
inspeção rigorosa já usado nesta cadeia: ler receita real, comparar ingredientes/preparo,
julgar compatibilidade E aderência ao padrão visual). Isso substitui a necessidade de gerar
prompts (`prompts-pendentes.jsonl`) caso as imagens já geradas sejam aprovadas na inspeção —
mas cada uma precisa passar pelo mesmo crivo rigoroso já characterizado no `execution.log`
(REJEITADA em caso de dúvida).

Isto é tratado como NOVO CHECKPOINT: as imagens já materializadas em `img/*.webp` (Ordem 1,
10, 13, 14, 16) permanecem válidas (aprovadas por conteúdo, mesmo antes de esta descoberta).
As demais 80 precisam de nova rodada de inspeção usando as imagens do Notion como candidatas,
antes de decidir se precisam ser regeneradas.

## Bloqueio adicional descoberto: property "Publicado"

Das 85 receitas, apenas **Ordem 1 (Pudim de coco queimado)** tem `Publicado=true`. As
demais 84 — incluindo as 11 outras aprovadas nesta auditoria (3,4,5,6,7,9,10,11,13,14,16) —
têm `Publicado=false`. O código do app (`recipes-service.ts`, `buscarPublicados()`) filtra
estritamente por `Publicado=true`, então mesmo com a property "Imagem" corretamente
preenchida, essas 11 receitas NÃO aparecerão no site até que `Publicado` seja marcado como
`true`. Isso é uma decisão de conteúdo/editorial (não faz parte do escopo desta missão de
imagens), então não foi alterada nesta sessão sem confirmação explícita do usuário — mas é
um bloqueio real para o resultado visível do trabalho. Registrado para decisão do usuário.

## Próxima ação (concluída nesta sessão)

Baixar e inspecionar sistematicamente as 85 imagens anexadas no Notion (via
`API-retrieve-page-markdown` + download do S3 signed URL), comparando cada uma com:
- ingredientes/modo de preparo reais da página,
- padrão visual obrigatório (fundo branco/mármore + grama discreta desfocada, sem
  ingredientes não confirmados, proporção 4:3, resolução mínima 1600x1200).

Classificar cada uma como APROVADA ou REJEITADA (dúvida = REJEITADA), registrar motivo,
hash, e mover rejeitadas para quarentena. Atualizar CSVs e recalcular a fila oficial.
