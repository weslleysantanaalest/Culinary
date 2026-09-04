# MT-005 — Configurar testes unitários (Vitest + Testing Library)

- **Status**: concluída
- **Data/hora**: 2026-08-27 13:37 -03:00
- **Objetivo**: Configurar Vitest + Testing Library em `culinary-app/` nas versões já verificadas na MT-003, com um teste de sanidade validando a infraestrutura de ponta a ponta.
- **Contexto**: Baseline definido na MT-003 (Vitest sobre Jest — ADR-002). App Next.js já inicializado na MT-004.
- **Arquivos analisados**: `culinary-app/tsconfig.json`, `culinary-app/package.json` (antes da alteração).
- **Arquivos criados**:
  - `culinary-app/vitest.config.mts` (config Vitest: ambiente jsdom, globals, alias `@/`, setup file).
  - `culinary-app/vitest.setup.ts` (importa matchers do `@testing-library/jest-dom/vitest`).
  - `culinary-app/src/test/setup-sanity.test.tsx` (2 testes: renderização de componente React via Testing Library + matcher `toBeInTheDocument`).
- **Arquivos alterados**: `culinary-app/package.json` — adicionadas devDependencies (`vitest@4.1.11`, `@testing-library/react@16.3.2`, `@testing-library/jest-dom@7.0.1`, `jsdom@30.0.1`, `@vitejs/plugin-react@6.1.0`, `@vitest/coverage-v8@4.1.11`) e scripts (`test`, `test:watch`, `test:coverage`).
- **Implementação realizada**:
  1. `npm install --save-dev` das 6 dependências de teste (retry necessário por timeout de rede pontual do cliente npm — rede confirmada saudável via curl/ping durante o timeout).
  2. Criação de `vitest.config.mts` (extensão `.mts`, não `.ts`, para eliminar warning de ESM-em-CommonJS do config loader nativo do Vite).
  3. Uso de `import.meta.dirname` em vez de `__dirname` no config (ESM nativo, sem warning).
  4. Teste de sanidade criado, executado, movido de `src/app/` (não deveria ficar junto às rotas) para `src/test/`.
- **Decisões técnicas**:
  - `vitest.config.mts` em vez de `.ts`: resolve dois warnings do config loader nativo do Vite (ESM/CommonJS e `__dirname`) sem alterar `"type"` no `package.json` (que afetaria outros arquivos do projeto Next.js).
  - Teste de sanidade permanece no repositório como smoke test de infraestrutura (não é código descartável) em `src/test/setup-sanity.test.tsx`.
- **Comandos executados**:
  - `npm install --save-dev --fetch-timeout=120000 --fetch-retries=8 --fetch-retry-mintimeout=5000 vitest@4.1.11 @testing-library/react@16.3.2 @testing-library/jest-dom@7.0.1 jsdom@30.0.1 @vitejs/plugin-react@6.1.0 @vitest/coverage-v8@4.1.11` → sucesso (104 packages added, 0 vulnerabilities) após 2 tentativas com timeout de rede.
  - `npm test` (`vitest run`) → 2 passed, sem warnings.
  - `npm run lint` → exit 0, sem findings.
  - `npm run build` → exit 0, build completo mantido após adição dos arquivos de teste.
- **Testes executados**: `setup-sanity.test.tsx` (2 casos: render + matcher jest-dom).
- **Resultado**: sucesso.
- **Evidências**:
  - `npm test` → `Test Files  1 passed (1)` / `Tests  2 passed (2)`, sem warnings de config.
  - `npm run lint` → saída vazia, exit 0.
  - `npm run build` → `✓ Compiled successfully`, 2 rotas estáticas geradas.
- **Pendências**: nenhuma bloqueante.
- **Próxima minitask**: MT-006 — Criar estrutura de pastas e tipos de domínio (Receita, Ingrediente, PlanejamentoRefeição, PassoDeReceita) com mocks.
