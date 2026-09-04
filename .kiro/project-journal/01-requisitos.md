# 01 — Requisitos Extraídos dos Protótipos

> Fonte: análise estática dos 8 arquivos `code.html` em `stitch_culin_ria_minimalista_parallax/` (MT-001) + `DESIGN.md`. Nenhum requisito foi inventado; tudo abaixo é observável no código/imagem dos protótipos.

## Identidade e navegação

- **RF-001**: Nome da marca a exibir: "CULINARY" (decisão de unificação registrada em MT-001; protótipo tem divergência CULINARY/CULINÁRIA).
- **RF-002**: Navegação principal com 4 destinos: Receitas, Planejador, Lista (de Ingredientes), Cozinhar (Modo Cozinhar).
  - Desktop: nav horizontal no topo, com ícones de busca/perfil/configurações.
  - Mobile: bottom nav bar fixa com ícone + label, item ativo destacado (scale-110, fill do ícone).
- **RF-003**: Tema visual único (claro/"light"), paleta neutra (charcoal `#262626`/`#111111` sobre branco `#FFFFFF`/`#FDF8F8`), sem modo escuro funcional (há classes `dark:` no protótipo mas não há toggle implementado).

## Tela: Receitas (Galeria)

- **RF-010**: Header/hero com título editorial ("A Arte da Culinária" / "Coleção") e texto de apoio.
- **RF-011**: Grid de cards de receita. Cada card contém: imagem (aspect-ratio fixo), 1+ tags/categoria (chips retangulares), título, tempo de preparo, nível de dificuldade (separados por pipe `|`).
- **RF-012** (desktop): grid uniforme responsivo (1/2/3 colunas conforme breakpoint) + botão "CARREGAR MAIS" (paginação/load more).
- **RF-013** (mobile): filtros de categoria em pills (TUDO, CAFÉ DA MANHÃ, PRINCIPAL, SOBREMESA) + grid bento assimétrico (1 destaque + cards menores).
- **RF-014**: Card deve ter estado hover com leve zoom da imagem (`scale-105`) — comportamento de interação, não apenas visual estático.

## Tela: Planejador (Meal Planner)

- **RF-020**: Visão semanal de refeições organizadas por dia da semana e por período (Café/Almoço/Jantar).
- **RF-021** (desktop): grid tabular (linhas = período de refeição, colunas = dias da semana + coluna de rótulo de horário), navegação Anterior/Próxima semana.
- **RF-022** (mobile): timeline vertical por dia, com marcador de horário, indicador de progresso (dot cheio = preenchido, vazio = disponível), botão "Adicionar Receita" em slot vazio.
- **RF-023**: Cada refeição planejada exibe: rótulo do período/tag (ex: RÁPIDO, ESPECIAL, SOBRAS, HOJE), nome da receita, tempo de preparo, e opcionalmente uma miniatura de imagem.
- **RF-024**: Ação de adicionar nova refeição ("+ NOVA REFEIÇÃO" no mobile / slot vazio clicável no desktop).

## Tela: Lista de Ingredientes ("O que tem na despensa?" / "Sua Despensa")

- **RF-030**: Campo de entrada de texto para adicionar ingredientes que o usuário possui, com botão "+" para confirmar.
- **RF-031**: Lista/chips dos ingredientes já adicionados, cada um removível (botão "×"/"close").
- **RF-032**: Ao buscar, resultado é segmentado em pelo menos 2 grupos:
  - Receitas que usam 100% dos ingredientes informados ("O QUE VOCÊ PODE COZINHAR" / match exato).
  - Receitas que faltam alguns itens ("QUASE LÁ" / "faltam poucos itens"), exibindo quais ingredientes estão faltando por receita.
- **RF-033** (desktop): layout 2 colunas (busca+lista à esquerda ~5/12, resultados à direita ~7/12) e botão "BUSCAR RECEITAS".
- **RF-034** (mobile): coluna única, chips de ingredientes no topo, cards de receita possível em lista vertical, seção final "Faltam Poucos Itens" com contagem de quantas receitas cada ingrediente faltante desbloquearia.

## Tela: Modo Cozinhar (Cooking Mode)

- **RF-040**: Modo passo-a-passo de uma receita específica, com indicador de progresso "PASSO X DE Y" e barra/indicadores visuais de progresso.
- **RF-041**: Checklist de ingredientes da receita (ou do passo atual), com checkbox que, ao marcar, aplica estilo "riscado" (strikethrough) + cor secundária no texto.
- **RF-042**: Texto de instrução do passo atual, exibido em destaque central.
- **RF-043**: Timer (temporizador) associável ao passo, com botão "Iniciar"/"INICIAR TIMER".
- **RF-044**: Ação de leitura em voz alta do passo ("OUVIR PASSO" / botão de áudio com ícone `volume_up`) — feature de acessibilidade/conveniência.
- **RF-045**: Navegação entre passos: "Anterior" / "Próximo" (mobile explícito com botões; desktop via indicadores de barra, sem botão anterior visível no protótipo desktop — divergência menor, tratar com navegação Anterior/Próximo em ambos por consistência).
- **RF-046** (desktop): layout 2 colunas — sidebar de ingredientes completos da receita (4/12) + painel do passo atual (8/12).
- **RF-047** (mobile): painel único centralizado, checklist mostra apenas os ingredientes do passo atual (não da receita completa) — divergência funcional real entre desktop (ingredientes da receita toda) e mobile (ingredientes do passo), a esclarecer/unificar na implementação (decisão: escopo por passo, mais útil ao cozinhar, será adotado em ambos os breakpoints).

## Modelo de dados implícito (a formalizar em MT-006)

Da leitura dos protótipos, as entidades de domínio observáveis são:

- **Receita**: id, título, imagem, categoria(s)/tag(s), tempo de preparo, dificuldade, lista de ingredientes (com quantidade), lista de passos (texto, tempo/timer opcional, ingredientes do passo).
- **Ingrediente**: nome, quantidade/unidade (quando associado a uma receita); nome simples (quando é item da despensa do usuário).
- **PlanejamentoRefeição**: data, período (café/almoço/jantar), horário, receita associada, rótulo opcional (ex: "sobras", "hoje").
- **PassoDeReceita**: número/ordem, instrução, tempo estimado, ingredientes necessários daquele passo.

## Requisitos não determinados pelos protótipos (fora de escopo até nova evidência)

- Autenticação/login real (há ícone de "person" mas sem tela de login nos protótipos).
- Persistência em backend/banco de dados (protótipos são estáticos; dados mockados definidos como baseline).
- Busca funcional (ícone de busca presente, sem modal ou página de busca implementada no protótipo).
- Internacionalização (todos os protótipos são pt-BR apesar do atributo `lang` inconsistente).

## Rastreabilidade

Cada requisito acima (RF-0XX) deve ser referenciado nas minitasks de implementação de tela (MT-007 a MT-010) para verificação de fidelidade visual.
