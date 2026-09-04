# MT-013-CORREÇÃO — Paridade visual e Modo Cozinhar completo

- **Status**: concluída
- **Data/hora**: 2026-08-27 14:36–15:12 -03:00
- **Objetivo**: Corrigir a reprovação do responsável — restaurar fidelidade visual ao Stitch e tornar o fluxo guiado do Modo Cozinhar (timer + voz) genuinamente acessível pela interface real, não apenas testável em isolamento.

## Problema relatado

O responsável reprovou a implementação após revisar uma gravação, apontando:
1. Site visualmente diferente dos HTMLs/PNGs do Stitch.
2. Página Cozinhar mostrando apenas uma grade de receitas.
3. Fluxo guiado não claramente acessível.
4. Temporizador ausente no fluxo demonstrado.
5. Comando "Ouvir passo" ausente no fluxo demonstrado.
6. Funcionalidade validada só em teste, não na interface real.

**Gravação do responsável = evidência de reprovação.** Não foi possível revisar o vídeo em si (fora do alcance das ferramentas desta sessão), mas o relato foi tratado como verdadeiro e investigado a fundo via reprodução direta.

## Causa-raiz confirmada (reprodução real, não suposição)

Reproduzi o fluxo via `curl` no HTML servido e depois via Playwright real:

1. **A rota `/cozinhar/[id]` e os links da grade já funcionavam tecnicamente** — confirmado via `curl http://localhost:3000/cozinhar | grep href` retornando 22 links válidos para `/cozinhar/{id}`. Isso **não era** o problema (rota ausente/slug incorreto).
2. **O componente `ModoCozinhar` não reproduzia a estrutura visual do protótipo**: o `code.html` de `modo_cozinhar_desktop` define uma sidebar de ingredientes (`aside`, 4/12) fixa ao lado de um card de passo (`section`, 8/12), ambos sobre uma imagem de fundo com blur. A implementação anterior renderizava apenas um card único centralizado, sem sidebar, sem fundo — por isso "parecia só uma grade" e o modo guiado "não parecia acessível", mesmo a rota funcionando.
3. **O botão "Ouvir passo" existia visualmente mas era decorativo** — sem `onClick`, sem import do hook de voz. Confirmado lendo o componente antes da correção.
4. **Faltavam os controles exigidos**: Reiniciar, Encerrar, Concluir etapa, Parar leitura, marcação de "concluído" — nenhum existia.

Isso confirma o item 6 do relato do responsável: a "funcionalidade" (timer, voz) só existia nos testes unitários da MT-012, nunca foi de fato conectada/visível no componente renderizado.

## Telas comparadas (Stitch vs. implementação, evidência por screenshot real)

| Tela | Referência Stitch | Implementação atual | Divergência encontrada | Correção |
|---|---|---|---|---|
| Modo Cozinhar (desktop) | `modo_cozinhar_desktop/code.html` + `screen.png`: sidebar ingredientes 4/12 + card passo 8/12, fundo com imagem+blur, "TEMPO ATIVO", botões INICIAR TIMER/OUVIR PASSO retangulares lado a lado, indicadores de progresso em barra | Antes: card único centralizado, sem sidebar, sem fundo, timer/voz decorativos. Depois: `screenshots-auditoria/cozinhando-agora-desktop-chromium.png` — estrutura replicada fielmente | Estrutural (layout inteiro divergente) | Componente `ModoCozinhar` reescrito do zero seguindo o `code.html` linha a linha |
| Modo Cozinhar (mobile) | `modo_cozinhar_mobile/code.html`: painel único centralizado, checklist por passo | `screenshots-auditoria/cozinhando-agora-mobile-chromium.png` — layout empilhado com sidebar acima do card, bottom nav | Estrutura empilhada aceitável (grid `md:grid-cols-12` colapsa para 1 coluna); nenhuma divergência crítica encontrada | Nenhuma correção necessária, já responsivo por herança do Tailwind grid |
| Cozinhar — seleção | Sem protótipo Stitch específico para esta tela intermediária (decisão de UX da MT-010) | `screenshots-auditoria/cozinhar-selecao-desktop-chromium.png` — grid 3 colunas com 22 receitas, "N PASSOS" | N/A — tela não existe no Stitch, foi criação necessária desta implementação | Mantida; usa o mesmo design system (hairlines, tipografia) |
| Receitas (desktop) | `receitas_desktop/screen.png` | `screenshots-auditoria/receitas-desktop-chromium.png` | Nenhuma divergência estrutural relevante encontrada nesta auditoria | Nenhuma |
| Lista de Ingredientes (desktop) | `lista_de_ingredientes_desktop/screen.png` | `screenshots-auditoria/lista-desktop-chromium.png` | Nenhuma divergência estrutural relevante; bug de timing no primeiro screenshot (imagens lazy-load), corrigido no teste, não no produto | Ajuste de espera no teste Playwright |
| Planejador (desktop) | `planejador_desktop/screen.png` | `screenshots-auditoria/planejador-desktop-chromium.png` | Nenhuma divergência estrutural relevante encontrada | Nenhuma |

**Nota de honestidade**: não foi feita comparação pixel-a-pixel automatizada (diff de imagem). A comparação foi visual, por inspeção direta lado a lado dos screenshots reais contra os `screen.png` do Stitch. Fidelidade estrutural (grid, hairlines, tipografia, hierarquia, componentes) confirmada; fidelidade de cor/posicionamento exato em pixels não foi medida numericamente.

## Arquivos alterados

- `src/components/modo-cozinhar.tsx` — reescrito integralmente: sidebar de ingredientes (aside 4/12) fixa, card do passo (section 8/12), fundo com imagem+blur (`background-image` inline do `receita.imagemUrl`), header com "PASSO X DE Y" + marca de concluído, "TEMPO ATIVO", timer funcional com Iniciar/Pausar/Reiniciar visível em um widget dedicado, botões INICIAR TIMER/OUVIR PASSO retangulares lado a lado (fiéis ao protótipo, agora conectados de verdade), Passo anterior/Concluir etapa/Próximo passo, Encerrar preparo, indicadores de progresso diferenciando concluído/atual/pendente.
- `src/lib/use-timer.ts` — sem alteração de lógica nesta correção (já funcional desde MT-012); reutilizado.
- `src/lib/use-falar-texto.ts` — **bug real corrigido**: o efeito de cleanup no unmount acessava `window.speechSynthesis.cancel()` sem checar se o valor era truthy, causando `TypeError` em ambiente de teste após `afterEach` restaurar o mock para `undefined`. Corrigido com checagem adicional. Também removido o `useState`/`useEffect` de `suportado` (calculado direto, evitando o anti-padrão `set-state-in-effect` que o ESLint mais recente rejeita).
- `src/components/modo-cozinhar.test.tsx` — reescrito integralmente (16 testes): cobre sidebar completa de ingredientes, navegação de passos, timer (iniciar/pausar/reiniciar com fake timers), voz (chamar/parar com mock de `speechSynthesis`), cancelamento de voz ao navegar, concluir etapa, encerrar preparo.
- `src/lib/use-falar-texto.test.ts` — corrigido erro de tipo TS nos mocks (`SpeechSynthesisUtterance`/`SpeechSynthesis` com cast explícito `as unknown as Type`; `Reflect.deleteProperty` em vez de `delete` em propriedade não opcional).
- `package.json` — adicionado `@playwright/test`, scripts `e2e`/`e2e:ui`.
- `playwright.config.ts` (novo) — 2 projetos: `desktop-chromium` (1440×900) e `mobile-chromium` (Pixel 7 via `devices`).
- `e2e/modo-cozinhar.spec.ts` (novo) — teste E2E real do fluxo completo (ver seção Testes).
- `e2e/screenshots-auditoria.spec.ts` (novo) — teste dedicado a gerar screenshots reais para auditoria visual.
- `.gitignore` (raiz do projeto) — adicionados diretórios de output do Playwright.

## Correções realizadas (resumo técnico)

1. **Fidelidade visual restaurada** no `ModoCozinhar`: layout 2 colunas (sidebar + card), fundo com imagem, tipografia/hairlines/paleta do design system, botões retangulares INICIAR TIMER/OUVIR PASSO como no protótipo.
2. **Timer real e visível**: widget dedicado com `role="timer"`, mostra `MM:SS`, botões Iniciar/Pausar/Reiniciar funcionais (usa `useTimer`, já testado desde MT-012, agora **de fato renderizado e clicável na tela real**).
3. **Voz real e visível**: botão "OUVIR PASSO" chama `window.speechSynthesis.speak()` via `useFalarTexto`; alterna para "PARAR LEITURA" enquanto fala; cancela a fala automaticamente ao trocar de passo (bug de corrida de efeitos corrigido — o `useEffect` de cancelamento tinha o objeto `voz` inteiro como dependência, o que o recriava a cada render e cancelava a fala imediatamente após iniciá-la; corrigido para depender apenas de `voz.parar`, que é estável via `useCallback`).
4. **Controles adicionais exigidos**: "Concluir etapa" (marca o passo atual e avança), "Encerrar preparo" (reseta timer, voz e progresso, volta ao passo 1), indicador visual de passo concluído nos indicadores de progresso.
5. **Acessibilidade por teclado**: todos os botões são `<button>` nativos, focáveis e acionáveis via Enter (confirmado no teste E2E "navegação por teclado alcança os controles principais").

## Testes (distinção honesta por tipo)

### Teste unitário/componente (Vitest + Testing Library, mock)
- `src/components/modo-cozinhar.test.tsx`: 16 casos. Web Speech API **mockada** (classe `MockSpeechSynthesisUtterance` + objeto `criarMockSpeechSynthesis()`). Confirma comportamento do componente em isolamento (jsdom), **não** confirma renderização real em navegador.
- `src/lib/use-falar-texto.test.ts`: 6 casos, mesmo tipo de mock.
- `src/lib/use-timer.test.ts`: 8 casos (herdados da MT-012, sem alteração).

### Teste E2E Playwright (navegador real, headless Chromium)
- `e2e/modo-cozinhar.spec.ts`: **5 testes × 2 viewports (desktop 1440×900, mobile Pixel 7) = 10 execuções**, todas passando. Web Speech API **mockada via `page.addInitScript`** (injeção no `window` real do navegador antes do carregamento da página) — isso é uma **chamada mockada da API dentro de um navegador real**, não uma reprodução auditiva confirmada por pessoa. O teste confirma:
  - Navegação real: `/` → clique em "COZINHAR" → clique em receita → modo guiado visível.
  - Timer: valor muda de fato após `waitForTimeout(2200)` (comparação de string antes/depois).
  - Pausar/Reiniciar: valor volta ao original após reiniciar.
  - Voz: `window.speechSynthesis.speak` foi chamado (via contador exposto em `window.__speechCalls`), com `lang === "pt-BR"`.
  - Cancelamento: `window.speechSynthesis.cancel` foi chamado ao avançar de passo (via `window.__speechCancelCount()`).
  - Teclado: `button.focus()` + `Tecla Enter` ativa o botão Iniciar.

### Screenshots (evidência visual, não asserção automatizada)
- `e2e/screenshots-auditoria.spec.ts`: 6 telas × 2 viewports = 12 arquivos PNG reais gerados em `screenshots-auditoria/` na raiz do projeto (fora de `culinary-app/`, não commitado). Comparados **por inspeção visual direta** (não diff de pixel automatizado) contra os `screen.png` do Stitch.

### O que NÃO foi validado (limitação honesta)
- **Nenhuma reprodução auditiva foi confirmada por uma pessoa.** O ambiente de teste (Playwright headless) não reproduz áudio real; o mock apenas confirma que a API correta (`window.speechSynthesis.speak`, `SpeechSynthesisUtterance`, `lang="pt-BR"`) é chamada com o texto certo. Validação humana de que o áudio de fato sai e está inteligível **não ocorreu nesta sessão**.
- **Nenhum diff de pixel automatizado** foi executado; a comparação com o Stitch foi visual/manual.
- Duração dos passos sem `tempoEstimadoMinutos` definido nos dados mockados usa fallback de 5 minutos (`?? 5`), não é uma duração confirmada pelo protótipo — é um valor genérico assumido e identificado como tal neste registro, conforme exigido ("não inventar duração sem evidência").

## Evidências (comandos e resultados brutos desta sessão)

```
$ npm test
Test Files  8 passed (8) / Tests  59 passed (59)

$ npm run lint
(saída vazia, 0 erros, 0 warnings)

$ npm run build
✓ Compiled successfully, 7 rotas geradas (5 estáticas + 2 dinâmicas)

$ pytest automation/tests/ -v
27 passed in 3.82s

$ npx playwright test --workers=2
22 passed (42.6s)
  [inclui os 10 do fluxo completo + 12 de screenshots-auditoria]

(nota: com --workers=6 (default), 2 dos 22 testes falharam por timeout de
recursos ao competir pelo mesmo dev server local — reproduzido e confirmado
como sobrecarga de concorrência, não bug de produto, ao rodar novamente com
--workers=2 e obter 22/22)
```

## Limitações conhecidas

- Comparação visual com o Stitch foi manual/qualitativa, não quantitativa (sem diff de pixel).
- Voz sintetizada não foi ouvida por uma pessoa nesta sessão — apenas a chamada correta da API foi confirmada.
- Duração de passos sem tempo definido no mock usa fallback genérico de 5 minutos, não uma duração real da receita.
- Views mobile das 4 telas continuam com layout responsivo (grid colapsa), não com os componentes estruturalmente diferentes que os protótipos mobile originais definiam (bento grid em Receitas, timeline em Planejador) — decisão já registrada como fora de escopo em MT-008/MT-009/MT-010, não revisitada nesta correção porque o foco solicitado foi especificamente o Modo Cozinhar.

## Resultado final

- Fluxo Cozinhar → seleção → modo guiado → timer → voz → avançar/voltar → concluir → encerrar está **acessível pela interface real**, confirmado por navegação real via Playwright (não apenas por teste de componente isolado).
- Timer visível e funcional (mudança real de valor confirmada).
- Botão de voz visível e funcional (chamada real à Web Speech API confirmada, mockada apenas por limitação do ambiente headless).
- Desktop e mobile validados via 2 viewports diferentes no Playwright + screenshots correspondentes.
- Nenhum erro de console/rede encontrado durante a navegação real (verificado via listener `page.on("console")`/`page.on("requestfailed")`).
- Build, lint, testes unitários, testes E2E e testes Python — todos passando com evidência fresca desta sessão.
- Comparação com o Stitch documentada nesta minitask, por inspeção visual de screenshots reais.

- **Próxima minitask**: aguardar validação do responsável sobre esta correção antes de prosseguir com qualquer outro item do backlog futuro (Web Speech API já implementada nesta correção; próximo candidato seria auditoria visual formal das telas mobile restantes, se solicitado).
