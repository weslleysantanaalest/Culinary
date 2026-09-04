# MT-014 — Foto de fundo real do site + Planejador editável com navegação direta

- **Status**: concluída
- **Data/hora**: 2026-08-28 10:00–11:55 -03:00
- **Objetivo**: (1) Aplicar a foto de fundo de cozinha real (`stitch_culin_ria_minimalista_parallax/foto_de_fundosite/`) no site, replicando o padrão `bg-fixed-kitchen` presente nos protótipos originais; (2) tornar o Planejador editável (adicionar/remover receitas da semana) com navegação direta para a receita ao clicar.

## Parte 1 — Foto de fundo real

- **Fonte**: `stitch_culin_ria_minimalista_parallax/foto_de_fundosite/` continha duas variantes (`..._ultra_1/screen.png` 1376×768 widescreen, `..._ultra_2/screen.png` 768×1376 vertical) de foto de cozinha minimalista branca com vista para floresta — mesmo estilo já usado como fundo (`bg-fixed-kitchen`) em todos os `code.html` dos protótipos originais (via URL do Google, nunca hospedada localmente).
- **Decisão técnica**: self-hospedar as fotos (consistente com a decisão já tomada para fontes na MT-007) em vez de manter dependência de URL externa. Convertidas para WebP (`cwebp -q 75`), reduzindo de ~2.7MB para ~146KB combinados.
- **Arquivos criados**:
  - `public/backgrounds/cozinha-fundo-desktop.webp` (87.8 KB)
  - `public/backgrounds/cozinha-fundo-mobile.webp` (58.8 KB)
  - `src/components/page-background.tsx` — componente `PageBackground`: `<picture>` com `<source media="(min-width: 768px)">` para a variante desktop, `<img>` fallback mobile, overlay `bg-surface-container-lowest/70 backdrop-blur-sm` (replica o overlay de blur dos protótipos).
- **Arquivos alterados**:
  - `src/app/layout.tsx` — `PageBackground` renderizado uma única vez no layout raiz (`fixed inset-0 z-0`), com `children` envolvidos em `relative z-10` — aplica o fundo a todas as páginas do site (Receitas, Planejador, Lista, Cozinhar), não apenas ao Modo Cozinhar como antes.
  - `src/components/modo-cozinhar.tsx` — removido o fundo próprio (`background-image` com `receita.imagemUrl`, que mostrava a foto do prato, não da cozinha) — agora usa o fundo global consistente com as demais telas.

## Parte 2 — Planejador editável

- **Arquivos criados**:
  - `src/components/planejador-grid.tsx` — client component `PlanejadorGrid` com estado (`useState<PlanejamentoRefeicao[]>`): cada slot vazio tem um `<select>` transparente cobrindo toda a célula (clicável em qualquer ponto, acessível por teclado/leitor de tela) listando todas as receitas disponíveis; ao selecionar, adiciona a refeição ao estado local. Cada refeição planejada tem um botão "×" (aparece no hover da célula) para remover, e o card inteiro é um `<Link href="/receitas/[id]">` — clicar leva direto à página da receita.
  - `src/components/planejador-grid.test.tsx` — 6 testes (renderização, link correto, remover, adicionar, múltiplas adições, preservação de rótulo).
  - `e2e/planejador.spec.ts` — 2 testes E2E reais (Playwright): adicionar+remover em slot vazio; clicar em refeição planejada navega para a URL da receita correta.
- **Arquivos alterados**:
  - `src/app/planejador/page.tsx` — simplificado para delegar o grid renderizado ao novo `PlanejadorGrid` (Server Component só busca dados e passa como props; toda a interatividade fica isolada no client component).
- **Arquivos removidos**:
  - `src/components/meal-card.tsx` — código morto após a lógica de renderização de card ser absorvida pelo `PlanejadorGrid` (nenhuma outra referência encontrada via grep antes da remoção).

## Decisões técnicas

- Slots vazios usam `<select>` nativo (não um modal customizado) — decisão de simplicidade: acessível por padrão (teclado, leitores de tela), sem necessidade de gerenciar foco/escape/overlay de um modal customizado. Reversível se o usuário preferir um padrão de UI diferente (ex.: modal com busca).
- Botão de remover só aparece no hover da célula preenchida (`opacity-0 group-hover:opacity-100`) — consistente com o padrão de "descoberta progressiva" já usado em `BuscaIngredientes` (remover ingrediente da despensa).
- IDs de novos planejamentos gerados via `useId()` do React + data/período/receitaId — evita colisão sem precisar de backend/UUID.

## Comandos executados

- `cwebp -q 75 cozinha-fundo-desktop.png -o cozinha-fundo-desktop.webp` / idem mobile — sucesso, redução de ~94% no tamanho combinado.
- `npx vitest run src/components/planejador-grid.test.tsx` → 1ª tentativa: 5 failed (seletores ambíguos, múltiplos elementos com o mesmo texto por causa das `<option>` do select em cada célula vazia); corrigido usando `getByRole("link", { name: ... })` em vez de `getByText`; 2ª tentativa: 6 passed.
- `npm test` → 65 passed (9 test files, incremento de 59 para 65).
- `npm run lint` → exit 0, sem findings.
- `npm run build` → exit 0, 7 rotas mantidas.
- `npx playwright test --workers=2` → **26 passed** (suíte completa incluindo os 2 novos testes de Planejador, sem regressão nos 24 testes anteriores de Modo Cozinhar e screenshots).
- Screenshots reais capturados via Playwright confirmando visualmente o fundo aplicado em `/` e `/planejador`, e os slots vazios com "ADICIONAR" sempre visível.

## Resultado

- Fundo de cozinha real aplicado globalmente em todas as páginas, self-hospedado, responsivo (variante vertical para mobile via `<picture>`).
- Planejador com edição real: adicionar receita a qualquer slot vazio (dia × período), remover receita planejada, navegação direta à receita ao clicar — tudo confirmado por teste E2E real em navegador (não apenas teste de componente isolado).

- **Testes executados**: 6 novos testes de componente (`planejador-grid.test.tsx`) + 2 novos testes E2E (`planejador.spec.ts`) + suíte completa revalidada (65 Vitest + 26 Playwright).
- **Resultado dos testes**: todos passando, 0 falhas, 0 regressões.
- **Evidências**: outputs de comando citados acima; screenshots em `/tmp/receitas-com-fundo.png` e `/tmp/planejador-com-fundo.png` (não commitados, apenas para esta sessão de verificação).
- **Erros ou limitações**: nenhuma persistência real do planejamento editado (estado local do componente, perdido ao recarregar a página) — consistente com a decisão de dados mockados sem backend já registrada desde a MT-003; se persistência real for necessária, é um requisito novo a ser confirmado explicitamente pelo responsável.
- **Próximo passo recomendado**: nenhuma minitask adicional solicitada explicitamente; aguardar validação do responsável sobre o fundo aplicado e a edição do Planejador.
