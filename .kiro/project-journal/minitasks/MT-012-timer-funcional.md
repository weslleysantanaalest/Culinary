# MT-012 — Timer funcional no Modo Cozinhar (backlog futuro, item 1)

> **STATUS REVISADO EM MT-013-CORREÇÃO (2026-08-27): VALIDAÇÃO FUNCIONAL INCOMPLETA —
> recurso não comprovado no fluxo real.**
> Esta minitask validou o hook `useTimer` e sua integração no componente `ModoCozinhar`
> **apenas via testes unitários/componente isolados (Vitest + Testing Library)**. O
> responsável reprovou a entrega após gravação mostrando que o temporizador e o botão
> "Ouvir passo" não apareciam de forma acessível no fluxo real da aplicação. A causa raiz
> (falta de fidelidade estrutural ao protótipo Stitch no componente `ModoCozinhar`, que
> impedia timer/voz de ficarem visíveis do jeito esperado) foi corrigida em
> `MT-013-CORREÇÃO` (ver `.kiro/project-journal/minitasks/MT-013-CORRECAO-paridade-visual.md`),
> com evidência adicional de teste E2E Playwright real (navegador de verdade) e
> screenshots comparados ao Stitch. O registro abaixo é preservado sem alteração como
> histórico do que foi feito nesta minitask original.

- **Status**: concluída
- **Data/hora**: 2026-08-27 14:30 -03:00
- **Objetivo**: Implementar a contagem regressiva real do timer no Modo Cozinhar (RF-043), que estava registrado como pendência consciente na MT-010 ("botão presente visualmente, sem lógica de setInterval/estado de contagem").
- **Contexto**: Backlog original (MT-000 a MT-011) concluído. Todos os bloqueios ativos (`05-bloqueios.md`) são não-críticos e dependem de decisão/credencial externa — nenhum impede trabalho local seguro. Selecionada esta minitask do backlog futuro por ser pequena, local, testável e sem dependência externa.
- **Arquivos criados**:
  - `src/lib/use-timer.ts` — hook `useTimer(totalSegundos)`: contagem regressiva via `setInterval` de 1s, `iniciar`/`pausar`/`reiniciar`, reset automático do timer ao mudar `totalSegundos` (ex.: trocar de passo) usando o padrão oficial React "Adjusting state during render" (evita `useEffect` com `setState` síncrono, que o `eslint-plugin-react-hooks` mais recente rejeita como anti-padrão). Função auxiliar `formatarTempo` (segundos → "MM:SS").
  - `src/lib/use-timer.test.ts` — 8 testes com fake timers (`vi.useFakeTimers`): estado inicial parado, decremento por segundo, parada automática ao chegar a zero, pausar mantém o valor, reiniciar volta ao total original, não inicia quando já zerado, reset ao mudar `totalSegundos` entre renders, formatação MM:SS.
- **Arquivos alterados**:
  - `src/components/modo-cozinhar.tsx` — integração do hook: timer exibido formatado, botão alterna entre "Iniciar"/"Continuar" (quando pausado) e "Pausar" (quando em execução), desabilitado ao chegar a zero.
  - `src/components/modo-cozinhar.test.tsx` — 4 novos testes (timer exibido e formatado para passo com tempo estimado, ausência de timer para passo sem tempo, transição Iniciar→Pausar com decremento real usando fake timers, reset do timer ao navegar para outro passo). Total do arquivo: 11 testes (7 anteriores + 4 novos).
- **Bug de nomenclatura encontrado e corrigido durante a implementação**: nomeei inicialmente o hook como `usarTimer` (português, consistente com o resto do código). O ESLint (`react-hooks/rules-of-hooks`) rejeitou por exigir literalmente o prefixo `use` (convenção React, não traduzível) para reconhecer a função como Hook válido. Corrigido renomeando para `useTimer` (arquivo e função) — única concessão ao inglês nesta base de código, por ser convenção obrigatória do framework, não escolha de estilo.
- **Bug de padrão React encontrado e corrigido**: a primeira versão usava `useEffect(() => { setSegundosRestantes(totalSegundos); setEmExecucao(false); }, [totalSegundos])` para resetar o timer ao mudar de passo. O lint (`react-hooks/set-state-in-effect`) rejeitou como anti-padrão (causa render em cascata). Corrigido aplicando o padrão oficial documentado em react.dev "You Might Not Need An Effect": comparação de `totalSegundos` contra um estado `totalAnterior` diretamente no corpo da função, ajustando o estado durante a renderização em vez de após.
- **Comandos executados**:
  - `npx vitest run src/lib/use-timer.test.ts` → 8 passed (isolado).
  - `npx vitest run src/components/modo-cozinhar.test.tsx` → 1ª tentativa: 10 passed, 1 failed (erro meu no teste: assumi 3 segundos onde o mock tinha `tempoEstimadoMinutos: 3` = 3 minutos = "03:00", não "00:03"); corrigido o teste; 2ª tentativa: 11 passed.
  - `npm run lint` → 1ª tentativa: 8 erros (`react-hooks/rules-of-hooks`, nomenclatura); corrigido; 2ª tentativa: 1 erro (`react-hooks/set-state-in-effect`); corrigido; 3ª tentativa: exit 0, sem findings.
  - `npm test` → 48 passed (7 test files, incremento de 36 para 48 com os 12 novos testes: 8 do hook + 4 do componente).
  - `npm run build` → exit 0, 7 rotas mantidas.
  - `nohup npm run dev &` + `curl` em `/cozinhar/pasta-pomodoro-classica` → timer "10:00" confirmado no HTML renderizado (10 minutos do primeiro passo da receita).
- **Testes executados**: 12 novos (8 hook + 4 componente), suíte completa revalidada (48 testes).
- **Resultado**: sucesso, com 2 bugs reais de lint/convenção encontrados e corrigidos durante a implementação (documentados para não repetir).
- **Evidências**: outputs de lint/test/build citados; timer "10:00" confirmado via curl em ambiente real (dev server).
- **Pendências**: Web Speech API para "Ouvir Passo" (RF-044) ainda não implementada — próximo item natural do backlog futuro, mesma categoria de melhoria incremental local.
- **Próxima minitask**: nenhuma selecionada automaticamente ainda — aguardando decisão do responsável sobre priorização do restante do backlog futuro, ou nova instrução.
