# MT-006 — Estrutura de pastas e tipos de domínio com mocks

- **Status**: concluída
- **Data/hora**: 2026-08-27 13:44 -03:00
- **Objetivo**: Criar os tipos de domínio (Receita, Ingrediente, PlanejamentoRefeição, PassoDeReceita) e o dataset mockado único, unificando os dados fragmentados entre os 8 protótipos (ADR-005 da MT-003).
- **Contexto**: Requisitos RF-001 a RF-047 (MT-002) e arquitetura/ADRs (MT-003) já definidos. Vitest configurado (MT-005).
- **Arquivos analisados**: `.kiro/project-journal/01-requisitos.md`, `.kiro/project-journal/02-arquitetura.md`, os 8 `code.html` (para extrair nomes/tempos/dificuldades reais de cada receita citada).
- **Arquivos criados**:
  - `src/types/receita.ts` — `Receita`, `Dificuldade`.
  - `src/types/ingrediente.ts` — `IngredienteReceita`, `ItemDespensa`.
  - `src/types/passo-de-receita.ts` — `PassoDeReceita` (ingredientes por passo, ADR-003).
  - `src/types/planejamento-refeicao.ts` — `PlanejamentoRefeicao`, `PeriodoRefeicao`.
  - `src/types/index.ts` — re-export centralizado.
  - `src/data/receitas.ts` — dataset único com 22 receitas (as citadas em receitas_desktop/mobile + planejador_desktop/mobile + lista_de_ingredientes_desktop/mobile + modo_cozinhar_desktop/mobile), cada uma com `id` estável, ingredientes com quantidade e passos com ingredientes próprios. Funções `getReceitas()` e `getReceitaPorId(id)`.
  - `src/data/despensa.ts` — `itensDespensaIniciais` (mock do estado inicial da despensa do usuário, RF-030).
  - `src/data/planejamentos.ts` — `planejamentosRefeicao` (8 planos mockados, referenciando `receitaId` do dataset único).
  - `src/data/receitas.test.ts` — 11 testes (ids únicos, estrutura mínima válida, numeração sequencial de passos, helpers, integridade referencial planejamento→receita, validação de período).
- **Arquivos alterados**: nenhum arquivo pré-existente.
- **Implementação realizada**:
  1. Modelagem dos 4 tipos de domínio com comentários rastreando aos RF-0XX e ADRs correspondentes.
  2. Consolidação de 22 receitas em um único arquivo, incluindo `salmao-grelhado-aspargos` (citada no protótipo `planejador_desktop` mas ausente da galeria de Receitas) — adicionada ao dataset para preservar integridade referencial.
  3. Testes garantindo que a integridade referencial (`planejamentosRefeicao[].receitaId` → `receitas[].id`) é válida e permanecerá válida em mudanças futuras (regressão pega automaticamente).
- **Decisões técnicas**:
  - Dataset único em `src/data/receitas.ts` (não por tela) — implementa ADR-005 diretamente.
  - `PassoDeReceita.ingredientes` própria por passo (não herdada da receita) — implementa ADR-003 diretamente, com teste indireto (todo passo tem sua própria lista, ainda que vazia quando não aplicável).
  - Alias de import `@/data/*`, `@/types` já configurado via `tsconfig.json`/`vitest.config.mts` (paths existentes desde MT-004/005).
- **Comandos executados**:
  - `npm test` (`vitest run`) → 2 test files, 11 testes, todos passed.
  - `npm run lint` → exit 0, sem findings.
  - `npm run build` → exit 0, build completo mantido.
- **Testes executados**: `src/data/receitas.test.ts` (11 casos) + `src/test/setup-sanity.test.tsx` (2 casos, já existentes) = 13 testes no total desta execução.
- **Resultado**: sucesso.
- **Evidências**:
  - `npm test` → `Test Files  2 passed (2)` / `Tests  11 passed (11)`.
  - `npm run build` → `✓ Compiled successfully`, TypeScript sem erros (tipos de domínio validados pelo compilador).
- **Pendências**: nenhuma bloqueante.
- **Próxima minitask**: MT-007 — Implementar layout base e tela de Receitas (lista) fiel ao protótipo.
