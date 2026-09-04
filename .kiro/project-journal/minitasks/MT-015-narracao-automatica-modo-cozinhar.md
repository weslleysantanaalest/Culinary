# MT-015 — Correção visual e narração automática do Modo Cozinhar

> Nota de numeração: o pedido original citava "MT-014", mas esse número já está ocupado
> por `MT-014-fundo-real-planejador-editavel.md` (28/08). Esta minitask foi registrada como
> **MT-015** para não sobrescrever o histórico. O código/testes internos (nomes de arquivo,
> `describe` do Playwright) ainda referenciam "MT-014" por terem sido escritos antes desta
> reconciliação — não foram renomeados nesta correção para não introduzir diffs não solicitados.

- **Status**: CONCLUÍDA
- **Data/hora**: 2026-09-01 09:58–10:18 -03:00
- **Responsável pela execução**: Kiro (cadeia de 5 agentes especializados, coordenação direta sem nesting)
- **Origem**: pedido `#maestro` com página "Culinary - apoio" (Notion), "ARQUITETURA E REGRAS — Caderno de Receitas", HTMLs/PNGs do Stitch, `digital_culinary_atelier/DESIGN.md`, gravação de reprovação visual do responsável.

## Objetivo

1. Aproximar a interface das referências originais do Stitch.
2. Corrigir o fluxo completo do Modo Cozinhar.
3. Melhorar a naturalidade da síntese de voz.
4. Iniciar automaticamente a narração ao clicar em "Iniciar receita".
5. Manter apenas um controle de voz ("Repetir instrução").
6. Validar tudo pelo fluxo real usando Playwright.

## Cadeia de agentes utilizada

Cadeia reduzida, coordenação direta pelo orquestrador (sem nesting de subagentes), na ordem obrigatória pedida:

| # | Agente | Papel real usado (roster KiroCrew) | Resultado |
|---|--------|-------------------------------------|-----------|
| 1 | Auditor Visual | `qa-browser-analyst` | Matriz de divergências Stitch/DESIGN.md vs código (14 itens, priorizados) |
| 2 | Especialista em Voz e Acessibilidade | `implementation-planner` | Confirmou conformidade da voz + **achou a causa-raiz real** das 4 falhas Playwright (hydration mismatch, não bug de voz) |
| 3 | Implementador Frontend | `project-implementer` | 3 edições cirúrgicas (nav-bar, recipe-card, modo-cozinhar) |
| 4 | QA Playwright | `qa-reproducer` → **bloqueado por hook de role restrita**, execução assumida pelo orquestrador | Suite real executada, evidência fresca coletada |
| 5 | Verificador Independente | `project-verifier` | Veredito **PASS** com tabela de 12 critérios |

**Nota sobre o Agente 4**: o subagente `qa-reproducer` tentou executar os testes via `shell` e via `spawn_run` e ambos os caminhos foram bloqueados por hook de segurança do seu papel restrito (read-only). Em vez de fabricar um veredito sem evidência fresca — o que violaria a lição já registrada ("nunca declarar certificação sem prova E2E fresca") — o agente recusou corretamente e devolveu o bloqueio. O orquestrador (que tem `shell` autorizado) assumiu a execução real dos comandos para não perder a evidência fresca exigida pelo protocolo.

## Causa-raiz confirmada (achado principal do Agente 2)

O último run do Playwright (`e2e-results/.last-run.json`, 31/08) mostrava **4 testes falhando**. A hipótese inicial (bug na seleção/carregamento assíncrono de voz) foi **descartada** pelo Especialista em Voz com evidência: os testes 3 e 4 do mesmo arquivo (que também mockam voz e disparam narração) **passavam**, eliminando qualquer race condition de voz como causa.

A causa real: `src/components/nav-bar.tsx` renderizava o botão "Cozinheiro {nome}" condicionalmente com `{nome && (...)}`. Como `nome` vem de `useSyncExternalStore` lendo `localStorage`, o snapshot de **servidor** é sempre `null` mas o snapshot de **cliente** já pode vir populado (produção: usuário recorrente; teste E2E: helper `pularPopupBoasVindas` grava o nome via `addInitScript` antes do load) — divergindo entre SSR e o primeiro paint do cliente. Isso disparava `Hydration failed` no console e, em modo dev, o overlay "Recoverable Error" do Next.js, que **interceptava cliques reais** nos testes.

**Isto era um bug de produção real**, não um artefato de teste: qualquer usuário que já tivesse informado o nome (visita recorrente) sofreria o mesmo erro de hidratação.

## Arquivos alterados (Implementador, Agente 3)

1. `culinary-app/src/components/nav-bar.tsx`
   - `const { nome, solicitarNovoNome }` → `const { nome, carregado, solicitarNovoNome }`
   - `{nome && (` → `{carregado && nome && (` — gate no valor `carregado` (falso em servidor e no primeiro paint do cliente) elimina a divergência de hidratação.
   - `space-x-8` → `space-x-6` no `<nav>` desktop (alinha aos 24px do token de gutter do design system).
2. `culinary-app/src/components/recipe-card.tsx`
   - Removido `hover:shadow-xl` (DESIGN.md proíbe explicitamente drop shadow: "avoids traditional drop shadows"). Mantido `hover:-translate-y-1` como feedback de hover sem sombra.
3. `culinary-app/src/components/modo-cozinhar.tsx`
   - "TEMPO ATIVO": `text-2xl` (24px) → `text-[32px]` (headline-lg, fiel ao protótipo `modo_cozinhar_desktop/code.html`), mantendo `font-display` (EB Garamond).

`src/lib/use-falar-texto.ts` e a lógica de voz em `modo-cozinhar.tsx` **não foram alterados** — o Especialista em Voz confirmou que já atendiam a todos os requisitos funcionais.

## Seleção da voz (confirmação, não alteração)

Implementação existente em `use-falar-texto.ts`, confirmada conforme:
1. Prioridade: idioma pt-BR exato > voz local instalada > voz mais natural (heurística por nome: google/luciana/francisca/natural/premium/enhanced/neural/siri) > percebida como feminina/madura (heurística por nome) > fallback outro pt > fallback padrão do navegador.
2. Carregamento assíncrono via `getVoices()` no mount + `addEventListener("voiceschanged", ...)` com cleanup.
3. Não depende de nome fixo de uma única voz — sempre pontua o conjunto disponível.
4. Parâmetros: `lang="pt-BR"`, `rate=0.9`, `pitch=1.0`, `volume=1.0`.

**Declaração honesta (conforme exigido)**: a Web Speech API não expõe metadados confiáveis de idade/gênero. A implementação prioriza uma voz *percebida* como feminina, madura e natural por heurística de nome — a confirmação real do timbre depende de validação auditiva humana, **não realizada nesta sessão** (ver seção Pendências).

## Fluxo implementado (confirmado por Playwright real)

```
Selecionar receita → clicar "Iniciar receita" → abre "Cozinhando Agora"
  → narra automaticamente o passo 1 (dentro do mesmo gesto de clique)
  → avançar/voltar passo → cancela fala anterior + narra novo passo automaticamente
  → "Repetir instrução" → cancela fala ativa (se houver) + relê o passo atual
  → "Encerrar preparo" → speechSynthesis.cancel() + timer pausado + volta ao passo 1
```

Único controle de voz: **"Repetir instrução"** (ícone `volume_up`, `aria-label` claro, acessível por teclado). Sem "Ouvir passo", "Parar leitura" ou seletor de voz. Sem suporte a `speechSynthesis`: botão oculto, mensagem `role="note"` acessível, timer e navegação continuam funcionando, sem erro de console.

## Testes e evidência (fresca, desta sessão)

```
$ npx playwright test e2e/modo-cozinhar.spec.ts --workers=2
8 passed (20.1s)
  → as 4 combinações antes falhas (desktop+mobile × "fluxo completo sem erros de
    console" + "sem suporte a speechSynthesis") agora PASSAM.

$ npm run lint            → limpo, exit 0
$ npm run build           → sucesso, 7 rotas geradas
$ npm test (Vitest)       → 88/88 passed (11 arquivos)
$ npx playwright test --workers=2 (suíte completa)
30/32 passed
  → 2 falhas em e2e/planejador.spec.ts: PRÉ-EXISTENTES, fora de escopo.
    Causa: src/data/planejamentos.ts tem datas fixas de 24-30/08/2026
    ("HOJE" hardcoded em 28/08/2026); data atual é 01/09/2026 — a semana
    mockada expirou e o link "Salmão Grelhado com Aspargos" não renderiza
    mais no Planejador. Não relacionado a voz/narração/timer/visual do
    Modo Cozinhar. Não corrigido nesta minitask (fora do pedido original).

$ pytest automation/tests/  → 27/27 passed
```

### Screenshots (evidência visual fresca, 16 arquivos, timestamp 2026-09-01 10:13)

Gerados via `e2e/screenshots-auditoria.spec.ts`, desktop + mobile, em
`/Users/weslleysantana/Projetos/Culinary/screenshots-auditoria/`:
`receitas-*`, `lista-*`, `planejador-*`, `cozinhar-selecao-*`, `cozinhar-inicio-*`,
`cozinhando-agora-*`, `cozinhando-agora-passo2-*` (7 telas × 2 viewports).

Inspeção visual confirmou: layout sidebar+card fiel ao protótipo, "TEMPO ATIVO" em 32px,
único botão "REPETIR INSTRUÇÃO" visível, sem elementos de voz duplicados, "COZINHEIRO TESTE"
renderiza corretamente na nav sem erro de hidratação.

## Auditoria visual — itens NÃO corrigidos nesta minitask (débito técnico documentado)

O Auditor Visual identificou 14 divergências; apenas as de maior impacto e menor risco foram
corrigidas nesta correção (shadow proibida, tamanho do timer, espaçamento da nav — ver seção
"Arquivos alterados"). Os itens abaixo exigem decisão de produto e ficam como pendência para
iteração futura, não bloqueiam esta minitask:

- Redesign do rodapé de ações do Modo Cozinhar (protótipo tem 2 botões INICIAR TIMER/OUVIR PASSO;
  app tem painel de timer + navegação separados — mudança intencional da correção anterior MT-013).
- `<h1>` do passo mostra o nome do prato, não o título/resumo da etapa atual (protótipo destaca a etapa).
- Layout mobile: sidebar de ingredientes empilhada vs. ingredientes como bloco interno do card no protótipo.
- Conflito de tokens de cor entre `DESIGN.md` (`#262626`/`#737373`) e os `code.html` do Stitch (`#111111`/`#5e5e5e`) — o app segue o DESIGN.md; decisão de fonte de verdade única pendente.
- Wordmark "CULINARY" (desktop) vs "CULINÁRIA" (mobile do protótipo) — inconsistência nas próprias referências, não resolvida.
- Barra de progresso fina no topo do card (presente no protótipo mobile, ausente no app — só há step-dots no rodapé).

## Pendências

- **VALIDAÇÃO TÉCNICA APROVADA. VALIDAÇÃO AUDITIVA HUMANA PENDENTE.** O mock do Playwright comprova apenas a chamada correta da API (`speak`/`cancel`, `lang=pt-BR`, `rate=0.9`). A naturalidade real do áudio (voz percebida como feminina/madura/natural) não foi ouvida por uma pessoa nesta sessão. Ação de retomada: abrir `http://localhost:3000/cozinhar/massa-fresca-classica` em um navegador real do macOS, clicar "Iniciar receita", ouvir a narração, testar "Repetir instrução" e registrar o nome real da voz + navegador/versão + confirmação de que uma pessoa validou.
- Débito técnico visual listado na seção anterior — decisão de produto pendente antes de agendar.
- Os 2 fails de `planejador.spec.ts` (fixture de data expirada) ficam registrados como item de manutenção separado, não relacionado a esta minitask.
- Arquivos em `src/components/`, `src/lib/`, `src/data/` estão **untracked** no git (só existe `Initial commit`) — o Verificador não conseguiu comparar diff contra baseline commitada. Recomenda-se commitar o estado atual para auditabilidade de diffs futuros (decisão do responsável, não executada aqui).

## Learning loop

Lição já registrada e aplicada nesta sessão: "nunca declarar um runtime/teste certificado sem prova E2E fresca". O agente `qa-reproducer` (Agente 4) aplicou essa lição corretamente ao recusar fabricar veredito sem execução real, delegando a execução ao orquestrador em vez de reportar êxito não verificado.

## Resultado final — Verificador Independente (Agente 5)

**Veredito: PASS.**

| # | Critério | Veredito |
|---|----------|----------|
| 1 | Site mais fiel ao Stitch | PASS (com débito documentado) |
| 2 | "Iniciar receita" abre modo guiado | PASS |
| 3 | 1ª etapa narrada automaticamente | PASS |
| 4 | Novos passos narrados automaticamente | PASS |
| 5 | Somente botão "Repetir instrução" existe | PASS |
| 6 | Falas não se sobrepõem | PASS |
| 7 | Timer visível e funcional | PASS |
| 8 | Desktop e mobile validados | PASS |
| 9 | Playwright comprova o fluxo | PASS |
| 10 | Testes/lint/build passam (c/ exceção pré-existente documentada) | PASS |
| 11 | Screenshots gerados | PASS |
| 12 | Validação auditiva humana | PENDENTE (documentado, não é falha) |

## Sincronização Notion

Notion MCP não foi verificado como disponível nesta sessão de forma explícita para escrita. Registrado no journal local conforme protocolo de fallback (`00-estado-atual.md` / `05-bloqueios.md`). Ação de retomada: quando o MCP Notion estiver disponível, localizar a página "Culinary - apoio" e criar/atualizar a subpágina correspondente a esta minitask com este conteúdo, sem sobrescrever histórico existente.

## Próxima ação

1. Responsável realizar a validação auditiva humana pendente (item 12) e registrar o resultado.
2. Decidir sobre os itens de débito técnico visual (rodapé, layout mobile, cores, wordmark, barra de progresso) — se entram em backlog e com qual prioridade.
3. Opcional: commitar `src/components/`, `src/lib/`, `src/data/` para restabelecer baseline de diff auditável.
4. Opcional: corrigir a fixture de datas expiradas em `src/data/planejamentos.ts` (fora do escopo desta minitask, mas bloqueia 2 testes E2E do Planejador).
