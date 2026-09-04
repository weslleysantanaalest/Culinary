# MT-001 — Inventariar protótipos HTML/CSS existentes

- **Status**: concluída
- **Data/hora**: 2026-08-27 11:24 -03:00
- **Objetivo**: Ler e catalogar todos os protótipos estáticos em `stitch_culin_ria_minimalista_parallax/` para servir de evidência técnica principal (fonte de verdade visual).
- **Contexto**: Nenhum requisito formal existe além dos próprios protótipos + `DESIGN.md`. Código é a evidência técnica primária conforme protocolo.
- **Arquivos analisados** (8 `code.html` + 8 `screen.png` + 1 `DESIGN.md`):
  - `receitas_desktop/code.html` + `screen.png`
  - `receitas_mobile/code.html` + `screen.png`
  - `planejador_desktop/code.html` + `screen.png`
  - `planejador_mobile/code.html` + `screen.png`
  - `lista_de_ingredientes_desktop/code.html` + `screen.png`
  - `lista_de_ingredientes_mobile/code.html` + `screen.png`
  - `modo_cozinhar_desktop/code.html` + `screen.png`
  - `modo_cozinhar_mobile/code.html` + `screen.png`
  - `digital_culinary_atelier/DESIGN.md`
- **Arquivos criados**: nenhum.
- **Arquivos alterados**: nenhum.
- **Implementação realizada**: leitura integral de cada `code.html` (Tailwind via CDN, config inline idêntica em todos) + inspeção visual de cada `screen.png`.

## Inventário técnico

Todos os protótipos usam Tailwind CSS via CDN (`cdn.tailwindcss.com`) com config JS inline replicada em cada arquivo (mesmos tokens de cor, spacing, fontSize, fontFamily — consistente com `DESIGN.md`). Fontes: **EB Garamond** (headlines/display) + **Manrope** (body/labels) + Material Symbols Outlined (ícones).

| Tela | Desktop | Mobile |
|---|---|---|
| Receitas | Nav superior fixa, header hero (glass-card), grid uniforme 3 colunas de cards 4:5, botão "CARREGAR MAIS" | Nav com scroll-hide, filtros de categoria, grid bento assimétrico (1 card grande 8-col + 4 cards 4-col), bottom nav |
| Planejador | Tabela semanal (grid 8 colunas: horário + 7 dias) com células de refeição por período (Café/Almoço/Jantar) | Timeline vertical por dia com dots, slots com horário fixo, botão "Adicionar Receita" tracejado |
| Lista de Ingredientes | Layout 2 colunas (5/7): busca+lista à esquerda, resultados (match exato + parcial) à direita | Coluna única: chips de ingredientes ativos, cards de receitas possíveis, lista "faltam poucos itens" |
| Modo Cozinhar | Grid 12 colunas: sidebar de ingredientes (checklist, 4-col) + card de passo (8-col) com indicadores de progresso em barras | Painel único centralizado (glass-panel), progresso em barra fina no topo, checklist de ingredientes do passo, timer, botões Anterior/Próximo |

## Divergências entre desktop e mobile (registradas, não resolvidas nesta minitask)

1. **Nome da marca inconsistente**: "CULINARY" (desktop, sem acento) vs "CULINÁRIA" (mobile, com acento) — varia entre os próprios arquivos desktop também (`receitas_desktop` usa "CULINARY", mas todos os `<title>` mobile usam "CULINÁRIA").
2. **Grid de Receitas**: desktop usa grid uniforme 3 colunas; mobile usa layout bento assimétrico com 1 card grande + filtros de categoria (TUDO/CAFÉ DA MANHÃ/PRINCIPAL/SOBREMESA) que não existem no desktop.
3. **Planejador**: desktop é uma tabela grid (visão semanal tradicional); mobile é uma agenda/timeline vertical (visão por dia). Estruturalmente são componentes diferentes, não apenas responsivos.
4. **Idioma do atributo `lang`**: alguns arquivos usam `lang="en"` (receitas_desktop, planejador_desktop, lista_de_ingredientes_desktop) mesmo com conteúdo 100% em português; outros usam `lang="pt-BR"` corretamente.
5. **Dados mockados divergem entre telas**: receitas citadas no Planejador (ex: "Risoto de Cogumelos" como sobras) e na Lista de Ingredientes não têm IDs compartilhados nem consistência total de nomes com a tela de Receitas — são mocks independentes por protótipo, não um dataset único.

## Decisões técnicas
- Nenhuma decisão de arquitetura tomada nesta minitask (reservado para MT-003).
- Tratamento das divergências: unificar nome da marca e criar dataset único de receitas mockadas na MT-006, com "CULINARY" como nome canônico (usado no `<a>` de logo em 5 dos 8 arquivos) — decisão reversível.

- **Comandos executados**: nenhum.
- **Testes executados**: N/A.
- **Resultado**: sucesso — inventário completo, nenhum protótipo ilegível ou corrompido.
- **Evidências**: conteúdo integral de cada `code.html` lido via ferramenta de leitura; screenshots visualizados via ferramenta de imagem (receitas, planejador, lista de ingredientes, modo cozinhar — desktop e mobile).
- **Pendências**: nenhuma bloqueante. Divergências acima serão resolvidas nas próximas minitasks (MT-002 requisitos, MT-006 dataset).
- **Próxima minitask**: MT-002 — Extrair requisitos visíveis dos protótipos.
