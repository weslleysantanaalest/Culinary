# 02 — Arquitetura e Decisões Técnicas

## Contexto

Baseline autorizado pelo responsável do projeto (sem necessidade de nova aprovação): Next.js + TypeScript + App Router + Tailwind CSS + ESLint + testes unitários + dados mockados, arquitetura preparada para backend futuro sem inventar integrações externas.

## Versões escolhidas (verificadas via npm registry em 2026-08-27)

| Pacote | Versão escolhida | `latest` no registry | Justificativa |
|---|---|---|---|
| Next.js | `^16.3.3` | 16.3.3 | Última estável; App Router maduro; suporta compilador TS nativo opcionalmente. |
| React / React DOM | `^19.2.8` | 19.2.8 | Versão exigida pelo Next.js 16.x. |
| TypeScript | `^5.9.3` | (latest geral: 7.0.2) | **Decisão deliberada de NÃO usar TS 7.0** apesar de ser o `latest`. TS 7.0 (compilador nativo em Go) é estável desde jul/2026, mas ainda não expõe a API programática completa do compilador — ferramentas como Vitest/Vite e `typescript-eslint` dependem dela e podem quebrar (confirmado em fontes: nx.dev "TypeScript 7.0 provides a faster native compiler, but it does not yet ship a programmatic API"). TS 5.9.3 é a última da série 5.x, estável, com suporte total do ecossistema de testes. Reavaliar quando o ecossistema (Vitest/ESLint) publicar suporte oficial a TS 7. |
| Tailwind CSS | `^4.3.3` | 4.3.3 | Versão major atual: motor Oxide, `@theme` CSS-first. Protótipos usam Tailwind v3 via CDN com config JS — será portado para tokens Tailwind v4 (ver seção Design Tokens). |
| ESLint | `^10.9.1` (via `eslint-config-next@16.3.3`) | 10.9.1 | Acompanha a versão do Next.js. |
| Vitest | `^4.1.11` | 4.1.11 | Escolhido sobre Jest: nativo ESM, mais rápido, integração direta com Vite/Next via `@vitejs/plugin-react`, sem necessidade de Babel/ts-jest. |
| @testing-library/react | `^16.3.2` | 16.3.2 | Padrão de mercado para testes de componentes React. |
| @testing-library/jest-dom | `^7.0.1` | 7.0.1 | Matchers de DOM para asserts em testes. |
| jsdom | `^30.0.1` | 30.0.1 | Ambiente DOM para Vitest. |
| @vitejs/plugin-react | `^6.1.0` | 6.1.0 | Suporte JSX/Fast Refresh no ambiente de teste Vitest. |

**Node.js**: v26.5.0 já disponível no ambiente (confirmado em MT-001). Não é LTS atual (LTS ativo é a linha 22.x/24.x), mas é a versão já instalada no ambiente de desenvolvimento — não será trocada nesta minitask por não ser bloqueio funcional. Registrado como observação para revisão futura de CI/produção.

## Estrutura do projeto

- **Roteamento**: Next.js App Router (`src/app/`), Server Components por padrão, Client Components (`"use client"`) apenas onde há interatividade (checkboxes, inputs, timers).
- **Estilo**: Tailwind CSS v4, tokens de design (`cores`, `spacing`, `fontFamily`, `fontSize`) portados do `DESIGN.md` para `@theme` no CSS global, preservando fidelidade visual dos protótipos.
- **Dados**: mocks locais em TypeScript (`src/lib/mocks/` ou `src/data/`), tipados via `src/types/` — sem backend, sem banco de dados, sem chamadas de rede. Estrutura pensada para permitir substituição futura por camada de API sem mudar os componentes de UI (funções de acesso a dados isoladas, ex: `getReceitas()`).
- **Testes**: Vitest + Testing Library, testes unitários de componentes e de lógica de domínio (ex: cálculo de match de ingredientes).
- **Lint**: ESLint com config oficial do Next.js (`eslint-config-next`), regras de import/order e TypeScript recomendadas.

## Decisões técnicas (mini-ADRs)

### ADR-001: TypeScript 5.9 em vez de 7.0
- **Contexto**: `npm view typescript version` retorna 7.0.2 como latest.
- **Decisão**: fixar `^5.9.3`.
- **Consequência**: perde-se o ganho de performance do compilador nativo Go, mas garante compatibilidade total com Vitest, ESLint e o ecossistema de tooling atual. Reversível — upgrade trivial quando o ecossistema acompanhar.

### ADR-002: Vitest em vez de Jest
- **Contexto**: protocolo pede "testes unitários (Vitest/Jest + Testing Library)", ambos aceitáveis.
- **Decisão**: Vitest.
- **Consequência**: setup mais simples com Next.js (ESM nativo, sem necessidade de `ts-jest`/Babel transforms), performance superior. Reversível.

### ADR-003: Checklist de ingredientes por passo no Modo Cozinhar (não por receita completa)
- Já registrado em MT-002 (RF-047). Reafirmado aqui como decisão de arquitetura de dados: `PassoDeReceita` carrega sua própria lista de ingredientes necessários, em vez de todos herdarem a lista completa da receita.

### ADR-004: Nome de marca unificado "CULINARY"
- Já registrado em MT-001/MT-002.

### ADR-005: Dataset único de receitas mockadas
- Os protótipos usam dados de receita inconsistentes entre telas (ver MT-001, divergência 5). Decisão: criar um único arquivo de mock (`src/data/receitas.ts`) com todas as receitas citadas nos protótipos, consolidadas com um `id` estável, e todas as telas (Receitas, Planejador, Lista de Ingredientes, Modo Cozinhar) referenciam esse mesmo dataset. Reversível.

## Riscos e mitigações

- **Risco**: Tailwind v4 tem sintaxe de configuração diferente da v3 usada nos protótipos (JS config vs `@theme` CSS). Mitigação: mapear manualmente cada token do `DESIGN.md`/config JS para `@theme` no `globals.css`, validando visualmente com os `screen.png` como referência.
- **Risco**: TypeScript 7.0 pode se tornar padrão de fato antes da maturação do ecossistema de testes. Mitigação: ADR-001 documentado, fácil de revisar.
- **Risco**: divergências entre protótipos desktop/mobile podem gerar inconsistência se não unificadas antes da implementação. Mitigação: MT-006 cria dataset e tipos únicos antes de qualquer tela ser implementada.
