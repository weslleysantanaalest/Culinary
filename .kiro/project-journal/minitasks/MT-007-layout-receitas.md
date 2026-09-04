# MT-007 — Implementar layout base e tela de Receitas (lista) fiel ao protótipo

- **Status**: concluída
- **Data/hora**: 2026-08-27 14:10 -03:00
- **Objetivo**: Implementar o layout raiz (nav + footer, RF-002) com os design tokens do `DESIGN.md` portados para Tailwind v4, e a tela de Receitas (galeria, RF-010 a RF-014) fiel ao protótipo `receitas_desktop`.
- **Contexto**: Tipos e mocks já disponíveis (MT-006). Requisitos RF-010 a RF-014 e RF-002 (MT-002). Design system (paleta, tipografia, spacing) documentado em `DESIGN.md` e replicado em `02-arquitetura.md`.

## Arquivos criados
- `src/components/nav-bar.tsx` — navegação principal (desktop horizontal + bottom nav mobile), 4 destinos (Receitas/Planejador/Lista/Cozinhar), item ativo destacado via prop `ativo`.
- `src/components/footer.tsx` — footer com marca, links (Sobre/Privacidade/Termos) e copyright.
- `src/components/recipe-card.tsx` — card de receita (imagem 4:5, tags, título, tempo/dificuldade separados por pipe), link para `/receitas/[id]` (rota ainda não implementada — reservada para minitask futura de detalhe de receita, fora do escopo desta MT).
- `src/app/page.tsx` (substituído) — página de Receitas: header hero com título editorial + texto de apoio, grid responsivo 1/2/3 colunas, botão "CARREGAR MAIS".

## Arquivos alterados
- `src/app/globals.css` — reescrito com tokens `@theme` (Tailwind v4): paleta completa (primary/secondary/surface/outline/error), spacing (unit/gutter/margin/section-gap), fontes display/body.
- `src/app/layout.tsx` — reescrito: `lang="pt-BR"`, metadata do app, fontes via `@fontsource` (ver bug abaixo).
- `next.config.ts` — adicionado `images.remotePatterns` para `lh3.googleusercontent.com` (imagens mockadas usam essa origem).
- `package.json` — adicionadas dependências `material-symbols`, `@fontsource/eb-garamond`, `@fontsource/manrope`.

## Bug real encontrado e contornado (não é decisão de preferência)

**Problema**: `next/font/google` (EB Garamond + Manrope) quebrava `npm run build` com `Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'`.

**Investigação**:
1. Confirmado que não é problema de rede (Google Fonts respondendo HTTP 200 via curl/ping durante a falha).
2. Confirmado que `@vercel/turbopack-next` realmente não existe em `node_modules` (dependência interna esperada, ausente).
3. `rm -rf .next` + rebuild — não resolveu (primeira tentativa de mitigação, falhou).
4. Tentativa de build sem Turbopack (`--no-turbopack`) — não existe essa flag no Next 16.3.3; Turbopack é obrigatório para build nesta versão (segunda tentativa, também sem sucesso, confirmando que não há workaround de flag).
5. Pesquisa web confirmou: bug conhecido e documentado — GitHub issue `vercel/next.js#92671` ("next/font/google fails to build on 16.2.3 — Turbopack font resolution broken"), fechada como duplicada de `#91653`, sem fix disponível na versão instalada (16.3.3).

**Mudança de estratégia** (conforme regra de não repetir a mesma linha de ataque após 2 falhas): abandonado `next/font/google`, adotado `@fontsource/eb-garamond` e `@fontsource/manrope` — pacotes npm que fornecem CSS `@font-face` com arquivos woff2 estáticos por peso, sem depender da resolução remota do Turbopack. Imports diretos em `layout.tsx` (`400.css`/`500.css` para EB Garamond, `400.css`/`600.css` para Manrope).

**Resultado**: build volta a passar. Ganho adicional: fontes ficam 100% self-hosted (sem requisição a `fonts.googleapis.com` em runtime), mais alinhado à política de "zero requisição externa não declarada" do projeto.

## Bug secundário (menor) também corrigido nesta minitask

- ESLint reportava `@next/next/no-page-custom-font` para o `<link>` de Material Symbols no `<head>` do layout. Corrigido substituindo por `import "material-symbols/outlined.css"` no `globals.css` (pacote npm oficial recomendado pela comunidade para self-host de Material Symbols em projetos Next.js/Vite).

- **Comandos executados**:
  - `npm run build` (falha inicial, 2 tentativas de mitigação falhas, terceira com troca de estratégia bem-sucedida)
  - `curl`/`ping` para confirmar saúde de rede durante a investigação
  - `npm install material-symbols` → sucesso
  - `npm install @fontsource/eb-garamond @fontsource/manrope` (2 tentativas com timeout de rede, 3ª com timeout maior → sucesso)
  - `rm -rf .next && npm run build` → sucesso após a correção
  - `npm run lint` → exit 0, 0 warnings (antes: 1 warning)
  - `npm test` → 11 passed (sem regressão)
  - `nohup npm run dev &` + `curl http://localhost:3000/` → HTTP 200, conteúdo renderizado (título hero + primeiro card de receita confirmados via grep) + processo finalizado após validação
- **Testes executados**: suíte Vitest completa (11 casos, sem alteração — esta minitask não adicionou novos testes de componente, reservado para MT-011 ou minitask dedicada).
- **Resultado**: sucesso, com bug real de infraestrutura documentado e contornado com evidência.
- **Evidências**:
  - `npm run build` → `✓ Compiled successfully`, 2 rotas estáticas.
  - `npm run lint` → saída vazia, exit 0.
  - `curl -s -o /tmp/page.html http://localhost:3000/` → HTTP 200, `grep` confirma "A Arte da Culinária" e "Pão de Fermentação Natural" presentes no HTML renderizado.
- **Pendências**:
  - Rota `/receitas/[id]` (detalhe de receita) referenciada pelo `RecipeCard` ainda não existe — não bloqueia esta minitask (RF-010 a RF-014 cobrem apenas a galeria), mas é um link quebrado até ser implementada. Registrar como item de backlog futuro.
  - Filtros de categoria e grid bento assimétrico do protótipo mobile (RF-013) não implementados nesta minitask — reservados para ajuste responsivo futuro ou minitask dedicada, já que MT-007 cobriu a fidelidade desktop conforme escopo original ("layout base e tela de Receitas fiel ao protótipo").
- **Próxima minitask**: MT-008 — Implementar tela de Planejador.
