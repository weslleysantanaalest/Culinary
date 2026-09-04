# MT-004 — Inicializar projeto Next.js com TypeScript, Tailwind, ESLint

- **Status**: concluída
- **Data/hora**: 2026-08-27 16:23 -03:00
- **Objetivo**: Criar a aplicação Next.js baseline (App Router, TypeScript, Tailwind, ESLint) conforme arquitetura definida na MT-003, com fidelidade às versões ali escolhidas.
- **Contexto**: `create-next-app` rejeitou o nome "Culinary" (maiúscula proibida em nome de pacote npm) ao tentar criar na raiz do projeto. Resolvido criando em subdiretório `culinary-app/` — decisão já prevista em `automation/config/settings.py` (`DEFAULT_NEXT_APP_DIRNAME = "culinary-app"`) antes mesmo desta minitask, agora confirmada como estrutura real.
- **Arquivos analisados**: nenhum (scaffold novo).
- **Arquivos criados**: projeto completo em `culinary-app/` via `create-next-app@16.3.3` — `package.json`, `tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`, `src/app/{layout.tsx,page.tsx,globals.css}`, `public/*.svg`, `.gitignore`, `README.md`.
- **Arquivos alterados**:
  - `culinary-app/package.json`: `typescript` fixado em `5.9.3` (era `^5`), conforme ADR-001 da MT-003.
  - `culinary-app/next.config.ts`: adicionado `turbopack.root` para eliminar warning de lockfile órfão fora do escopo do projeto (`/Users/weslleysantana/package-lock.json`, não relacionado a este projeto — não foi tocado).
- **Arquivos removidos**: `culinary-app/CLAUDE.md`, `culinary-app/AGENTS.md` (gerados automaticamente pelo scaffold do create-next-app, não relevantes a este fluxo Kiro).
- **Implementação realizada**:
  1. `npx create-next-app@16.3.3 culinary-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --skip-install --no-git`
  2. Ajuste de versão do TypeScript no `package.json`.
  3. `npm install` (359 pacotes, 0 vulnerabilidades).
  4. Ajuste de `next.config.ts` (turbopack.root).
  5. `git init` na raiz do projeto Culinary (autorizado explicitamente pelo protocolo — apenas local, sem remoto/push) + rename da branch padrão para `main`.
- **Decisões técnicas**:
  - App em subdiretório `culinary-app/` (não na raiz) — raiz do projeto acomoda tanto o app Next.js quanto a automação Python (`automation/`) e os protótipos originais, sem forçar um nome de pacote inválido.
  - Nenhum commit criado nesta minitask (git inicializado, mas sem staging/commit — aguardando pedido explícito, conforme guardrail de git).
- **Comandos executados**:
  - `npx --yes create-next-app@16.3.3 culinary-app [...]` → sucesso
  - `npm install` (dentro de `culinary-app/`) → 359 packages added, 0 vulnerabilities
  - `npm run lint` → exit 0, sem erros/warnings
  - `npm run build` → exit 0, build Turbopack completo, 2 rotas estáticas geradas (`/` e `/_not-found`)
  - `git init` + `git branch -m main`
- **Testes executados**: nenhum teste unitário ainda (reservado para MT-005). Validação via lint + build.
- **Resultado**: sucesso.
- **Evidências**:
  - `npm run lint` → saída vazia (sem findings), exit code 0.
  - `npm run build` → `✓ Compiled successfully`, `✓ Generating static pages using 5 workers (4/4)`, rotas `/` e `/_not-found` geradas como estáticas.
  - `git branch --show-current` → `main`.
- **Pendências**: nenhuma bloqueante.
- **Próxima minitask**: MT-005 — Configurar testes unitários (Vitest + Testing Library).
