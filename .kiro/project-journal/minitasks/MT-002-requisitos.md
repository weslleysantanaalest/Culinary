# MT-002 — Extrair requisitos visíveis dos protótipos

- **Status**: concluída
- **Data/hora**: 2026-08-27 11:26 -03:00
- **Objetivo**: Consolidar requisitos funcionais observáveis a partir dos protótipos analisados na MT-001, sem inventar nenhum requisito não evidenciado no código/imagem.
- **Contexto**: Único material-fonte disponível são os 8 `code.html`/`screen.png` + `DESIGN.md`. Requisitos escritos como RF-0XX para rastreabilidade nas próximas minitasks de implementação.
- **Arquivos analisados**: os mesmos 8 `code.html` já lidos na MT-001 (reuso da evidência, sem nova leitura).
- **Arquivos criados**: nenhum novo (atualização de placeholder).
- **Arquivos alterados**: `.kiro/project-journal/01-requisitos.md` (de placeholder para conteúdo completo).
- **Implementação realizada**: documento de requisitos com 4 blocos de telas (Receitas, Planejador, Lista de Ingredientes, Modo Cozinhar) + modelo de dados implícito + lista de requisitos explicitamente fora de escopo (auth, backend real, busca funcional, i18n).
- **Decisões técnicas**:
  - Nome de marca unificado como "CULINARY" (já registrado em MT-001).
  - Modo Cozinhar: checklist de ingredientes por passo (comportamento do mobile) adotado em ambos os breakpoints, por ser mais útil durante o cozinhar do que a lista completa da receita (comportamento do desktop). Decisão reversível.
  - Navegação Anterior/Próximo no Modo Cozinhar será exibida em ambos os breakpoints (o protótipo desktop só mostrava indicadores de barra sem botão "Anterior" explícito).
- **Comandos executados**: nenhum.
- **Testes executados**: N/A (documentação).
- **Resultado**: sucesso.
- **Evidências**: arquivo `.kiro/project-journal/01-requisitos.md` criado com 47 requisitos funcionais numerados (RF-001 a RF-047) diretamente rastreáveis ao código-fonte dos protótipos.
- **Pendências**: nenhuma bloqueante.
- **Próxima minitask**: MT-003 — Definir arquitetura baseline e registrar versões.
