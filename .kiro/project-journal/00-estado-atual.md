# 00 — Estado Atual

> Fallback local do Notion (página canônica "Culinary — Desenvolvimento Contínuo pelo Kiro").
> Sincronizar para o Notion quando o MCP estiver disponível. Não apagar após sincronização.

## Última atualização
2026-09-01 13:16 -03:00 — MT-019 (migração corpo→propriedades + publicação da piloto) concluída. Ver `minitasks/MT-019-migracao-corpo-propriedades.md`. 85/85 receitas classificadas SAFE_TO_MIGRATE (verificado 2x), piloto "Pudim de coco queimado" migrada e publicada com sucesso (dados reais confirmados na API e na tela). **Achado crítico**: Modo Cozinhar não está conectado às receitas reais do Notion — itens 12-15 da validação (narração/timer/Repetir instrução com dados reais) não são alcançáveis pela interface até decisão do responsável. 84 receitas restantes aguardam nova autorização para migração em lote.

2026-09-01 12:43 -03:00 — MT-018 (integração real Notion + WebP + voz corrigida) concluída, PASS_COMPLETO do Verificador. Ver `minitasks/MT-018-integracao-notion-webp-voz.md`. Backend Notion-backed real criado (sem token real ainda — ação pendente do responsável). Bloqueio de dados: 0/85 receitas publicadas, slugs vazios. Voz corrigida (bug do "google" eliminado).

2026-09-01 10:18 -03:00 — MT-015 (correção visual + narração automática do Modo Cozinhar) concluída, PASS do Verificador. Ver `minitasks/MT-015-narracao-automatica-modo-cozinhar.md`. Causa-raiz das 4 falhas Playwright: hydration mismatch em `nav-bar.tsx` (corrigido), não bug de voz. Pendência: validação auditiva humana (item 12) e débito técnico visual documentado.

2026-08-27 14:23 -03:00 — Backlog original (MT-000 a MT-011) concluído.

## Status do Notion MCP
INDISPONÍVEL nesta sessão (nenhuma ferramenta de Notion presente na lista de tools). Verificação será repetida no início de cada nova sessão e antes do encerramento de cada turno, conforme protocolo.

## Estado da aplicação Next.js (`culinary-app/`)

- 7 rotas funcionais: `/` (Receitas), `/planejador`, `/lista`, `/cozinhar` (índice), `/cozinhar/[id]` (Modo Cozinhar), `/receitas/[id]` (detalhe), `/_not-found`.
- 22 receitas mockadas em dataset único (`src/data/receitas.ts`), com tipos de domínio completos (`Receita`, `IngredienteReceita`, `PassoDeReceita`, `PlanejamentoRefeicao`, `ItemDespensa`).
- 36 testes unitários/componente (Vitest + Testing Library), todos passando.
- Lint (ESLint via `eslint-config-next`) e build (Next.js 16.3.3 + Turbopack) limpos, 0 erros/warnings.
- Bug real de infraestrutura diagnosticado e contornado: `next/font/google` quebrava build por bug conhecido do Turbopack (issue `vercel/next.js#92671`); resolvido com `@fontsource/eb-garamond` + `@fontsource/manrope` (self-hosted).

## Estado da automação Python (`automation/`)

- LangChain (`langchain-core==1.6.0`) + CrewAI (`crewai==1.9.0`, pinado por incompatibilidade de plataforma do `lancedb` em versões mais recentes) instalados em venv Python 3.12.
- 6 agentes (Analyzer, Planner, Developer, Tester, Reviewer, Documenter) + Crew sequencial funcional (estrutural, testada sem chamada de rede).
- 27 testes, todos passando.
- `kickoff()` real não executado nesta sessão — bloqueado por `OPENAI_API_KEY` ausente (não crítico, categoria "credencial ausente" do protocolo).

## Estrutura de protótipos encontrada (fonte original, preservada intacta)

```
stitch_culin_ria_minimalista_parallax/
├── receitas_desktop/        (code.html + screen.png)
├── receitas_mobile/         (code.html + screen.png)
├── planejador_desktop/      (code.html + screen.png)
├── planejador_mobile/       (code.html + screen.png)
├── lista_de_ingredientes_desktop/  (code.html + screen.png)
├── lista_de_ingredientes_mobile/   (code.html + screen.png)
├── modo_cozinhar_desktop/   (code.html + screen.png)
├── modo_cozinhar_mobile/    (code.html + screen.png)
└── digital_culinary_atelier/
    └── DESIGN.md
```

8 telas de protótipo (4 fluxos × 2 breakpoints) + 1 documento de design.

## Decisões já autorizadas pelo responsável (não reabrir)

1. Projeto correto: `/Users/weslleysantana/Projetos/Culinary` (resolvido "Culinay" vs "Culinary").
2. Ausência de backend/framework/testes não é bloqueio — é o ponto de partida esperado.
3. Arquitetura baseline autorizada: Next.js + TypeScript + App Router + Tailwind CSS + ESLint + testes unitários + dados mockados, sem inventar integrações externas.
4. Não criar repositório remoto, não fazer push, não fazer deploy sem autorização específica futura.
5. Execução contínua de múltiplas minitasks no mesmo turno, sem parar para apresentar handoff a cada uma.
6. Journal local em `.kiro/project-journal/` como fallback enquanto Notion MCP não existir nesta sessão.

## Divergências registradas

- Pedido original citava caminho `weslleysantana/projeto/Culinay` (singular, sem barra inicial, nome "Culinay"). Caminho real confirmado pelo responsável: `/Users/weslleysantana/Projetos/Culinary`. Resolvido, não é mais divergência ativa.
