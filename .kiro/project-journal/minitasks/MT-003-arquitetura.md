# MT-003 — Definir arquitetura baseline e registrar versões

- **Status**: concluída
- **Data/hora**: 2026-08-27 11:35 -03:00
- **Objetivo**: Fixar as versões exatas do baseline técnico (Next.js/TS/Tailwind/testes) verificando disponibilidade real no registry npm antes de instalar, e registrar decisões técnicas (ADRs curtos).
- **Contexto**: Baseline arquitetural já autorizado pelo responsável (Next.js + TS + App Router + Tailwind + ESLint + testes + mocks). Esta minitask apenas resolve as versões exatas e registra riscos.
- **Arquivos analisados**: nenhum arquivo de código (consulta de rede/registry).
- **Arquivos criados**: nenhum novo (placeholder atualizado).
- **Arquivos alterados**: `.kiro/project-journal/02-arquitetura.md` (de placeholder para conteúdo completo).
- **Implementação realizada**: consulta ao registry npm via `curl`/`npm show` para next, react, react-dom, typescript, tailwindcss, eslint, eslint-config-next, vitest, @testing-library/react, @testing-library/jest-dom, jsdom, @vitejs/plugin-react. Pesquisa web complementar para validar maturidade do TypeScript 7.0 antes de decidir a versão do compilador.
- **Decisões técnicas** (5 ADRs registrados em `02-arquitetura.md`):
  1. TypeScript `^5.9.3` em vez do `latest` 7.0.2 — risco de incompatibilidade de API programática com Vitest/ESLint no TS 7.0 (native Go compiler, sem programmatic API completa ainda).
  2. Vitest em vez de Jest para testes unitários.
  3. Checklist de ingredientes por passo (não por receita) no Modo Cozinhar.
  4. Nome de marca unificado "CULINARY".
  5. Dataset único de receitas mockadas compartilhado entre todas as telas.
- **Comandos executados**:
  - `npm view next version` (timeout inicial, rede instável)
  - `curl -s -m 5 https://registry.npmjs.org/next/latest` → sucesso, `next@16.3.3`
  - `curl` em loop para react, react-dom, typescript, tailwindcss, eslint, eslint-config-next, vitest, @testing-library/react, @testing-library/jest-dom, jsdom, @vitejs/plugin-react → versões obtidas
  - `npm show typescript versions --json` filtrado para linha 5.x → `5.9.3` confirmado como última estável da série 5.
  - `node --version` / `npm --version` (já confirmados na MT-001: v26.5.0 / 11.17.0)
- **Testes executados**: N/A (nenhum código ainda).
- **Resultado**: sucesso.
- **Evidências**:
  - Output JSON do registry confirmando `next@16.3.3`, `react@19.2.8`, `typescript@7.0.2` (latest geral) e `5.9.3` (última da linha 5.x), `tailwindcss@4.3.3`, `eslint@10.9.1`, `vitest@4.1.11`, `@testing-library/react@16.3.2`, `@testing-library/jest-dom@7.0.1`, `jsdom@30.0.1`, `@vitejs/plugin-react@6.1.0`.
  - Resultados de busca web confirmando status de TypeScript 7.0 (estável desde jul/2026, mas sem API programática completa — fonte: nx.dev, Microsoft DevBlogs).
- **Pendências**: nenhuma bloqueante. Observação registrada sobre Node v26.5.0 não ser LTS ativo — não bloqueia desenvolvimento local, revisão recomendada antes de CI/produção.
- **Próxima minitask**: MT-004 — Inicializar projeto Next.js com TypeScript, Tailwind, ESLint.
