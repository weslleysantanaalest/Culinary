# 03 — Backlog de Minitasks

## Fila original (concluída)

- [x] MT-000 — Criar estrutura `.kiro/project-journal/` e arquivos fixos
- [x] MT-001 — Inventariar protótipos HTML/CSS existentes
- [x] MT-002 — Extrair requisitos visíveis dos protótipos
- [x] MT-003 — Definir arquitetura baseline e registrar versões
- [x] MT-004 — Inicializar projeto Next.js (TS, Tailwind, ESLint)
- [x] MT-005 — Configurar testes unitários
- [x] MT-006 — Estrutura de pastas e tipos de domínio com mocks
- [x] MT-007 — Tela de Receitas (lista)
- [x] MT-008 — Tela de Planejador
- [x] MT-009 — Tela de Lista de Ingredientes
- [x] MT-010 — Tela Modo Cozinhar
- [x] MT-011 — Lint, build e testes finais

## Frente paralela: Automação LangChain + CrewAI (concluída, autorizada via steering)

- [x] MT-001 (automação) — Inventariar o projeto para a automação
- [x] MT-002 (automação) — Preparar ambiente Python (venv 3.12, crewai 1.9.0, langchain-core 1.6.0)
- [x] MT-003 (automação) — Criar persistência (state_store + execution_history)
- [x] MT-004 (automação) — Criar templates LangChain (PromptTemplate)
- [x] MT-005 (automação) — Criar agentes CrewAI (6 agentes)
- [x] MT-006 (automação) — Criar primeira Crew funcional (estrutural, sem OPENAI_API_KEY para kickoff real)

## Backlog futuro — status revisado após reprovação do responsável

- [~] MT-012 — Timer funcional no Modo Cozinhar — **STATUS REVISADO: VALIDAÇÃO FUNCIONAL INCOMPLETA** (recurso não comprovado no fluxo real; apenas testes unitários isolados existiam). Ver `MT-012-timer-funcional.md` (nota de revisão no topo) e `MT-013-CORRECAO-paridade-visual.md`.
- [x] MT-013-CORREÇÃO — Paridade visual ao Stitch + Modo Cozinhar completo (timer + voz acessíveis via UI real, validado por 22 testes Playwright E2E reais + 12 screenshots + auditoria visual documentada)

## Backlog futuro — pendente (identificado, não bloqueante, não solicitado explicitamente)

- [ ] Visão mobile estruturalmente fiel aos protótipos (bento grid Receitas, timeline Planejador) — mobile atual usa responsividade por colapso de grid, não os componentes distintos dos protótipos mobile originais.
- [ ] Diff de pixel automatizado entre screenshots reais e screen.png do Stitch (comparação atual é visual/manual).
- [ ] Validação humana real de áudio (ouvir a leitura de fato, não apenas confirmar a chamada mockada da API).
- [ ] Filtros de categoria na tela de Receitas (protótipo mobile).
- [ ] Formulário/estado editável para "+ Nova Refeição" no Planejador.
- [ ] MT-007 (automação) — Integrar automação ao desenvolvimento real do Culinary via `kickoff()` — bloqueado por ausência de `OPENAI_API_KEY` (categoria "não bloqueia todo o projeto").
- [ ] Sincronização de `.kiro/project-journal/minitasks/*.md` e `notion-sync-queue.jsonl` com o Notion, quando o MCP estiver disponível (13 itens pendentes na fila).

Atualizado em 2026-08-27 após correção MT-013 em resposta à reprovação do responsável.
