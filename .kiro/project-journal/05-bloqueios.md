# 05 — Bloqueios e Decisões Pendentes

## Bloqueios ativos

### B-001: Notion MCP indisponível
- **Impacto**: não impede o desenvolvimento local (conforme regra 7 do protocolo).
- **Mitigação**: journal local em `.kiro/project-journal/` espelhando exatamente a estrutura de subpáginas planejada para o Notion.
- **Ação de retomada**: quando o MCP Notion estiver configurado, localizar/criar a página "Culinary — Desenvolvimento Contínuo pelo Kiro" e sincronizar cada arquivo deste diretório como subpágina correspondente.
- **Status**: aberto, não crítico.

### B-002: Repositório remoto / GitHub
- **Impacto**: nenhum no desenvolvimento local. Push/deploy explicitamente não autorizados ainda.
- **Ação de retomada**: aguardar autorização explícita do responsável para criar repositório remoto (conta/org, público/privado) antes de qualquer `git push` ou criação via API/CLI do GitHub.
- **Status**: aberto, não crítico, aguardando decisão humana futura.

### B-003: OPENAI_API_KEY ausente (automação LangChain/CrewAI)
- **Impacto**: não impede a construção/teste estrutural da automação (`automation/`). Impede apenas `Crew.kickoff()` real (chamada de LLM de verdade via `python -m automation.main --run`).
- **Mitigação**: todos os testes (27/27 passing) usam `LLM` com `api_key` fake, sem chamada de rede. `--dry-run` funciona sem a chave.
- **Ação de retomada**: quando uma `OPENAI_API_KEY` válida for fornecida (via variável de ambiente, nunca hardcoded), rodar `python -m automation.main --run` para validar o fluxo ponta a ponta com LLM real.
- **Status**: aberto, não crítico.

### B-004: Múltiplas páginas canônicas Notion mencionadas em diferentes instruções
- **Impacto**: não bloqueia trabalho local. Apenas observação para quando o Notion MCP estiver disponível.
- **Detalhe**: a instrução original citava a página "Culinary — Desenvolvimento Contínuo pelo Kiro"; uma instrução posterior (automação LangChain/CrewAI) cita uma estrutura diferente ("🚀 MY NOTION — WES", "APOIADOR DE TASK", "APOIO — Automatizar o Culinary com LangChain e CrewAI", "doc-Automatizar o Culinary com LangChain e CrewAI", "🧠 Aprendizados & Jargões Técnicos"). Ambas as estruturas foram preservadas no fallback local: a primeira em `.kiro/project-journal/` (00-05 + minitasks/), a segunda também documentada em `.kiro/project-journal/minitasks/MT-00X-automacao-*.md` e enfileirada em `notion-sync-queue.jsonl` com `parent_page` específico da segunda estrutura.
- **Ação de retomada**: quando o MCP Notion estiver disponível, pesquisar por título antes de criar qualquer página (evitar duplicatas), respeitando ambas as estruturas pedidas.
- **Status**: aberto, não crítico, apenas nota de reconciliação.

### B-005: Documentação solicitada na página "Culinary - Apoio" (Notion) — não realizada, apenas preparada
- **Impacto**: não bloqueia trabalho local. O usuário pediu explicitamente para documentar na página "Culinary - Apoio" com evidências. Sem o Notion MCP carregado nesta sessão, essa escrita real não pôde ocorrer.
- **Mitigação**: conteúdo completo da subpágina preparado em `.kiro/project-journal/notion-apoio-resumo.md` e enfileirado em `notion-sync-queue.jsonl` com `parent_page="Culinary - Apoio"` (título: "Resumo de Execução — App Culinary + Automação LangChain/CrewAI").
- **Ação de retomada**: quando o Notion MCP estiver disponível, localizar a página "Culinary - Apoio", pesquisar por título para evitar duplicata, criar a subpágina com o conteúdo já preparado, confirmar a escrita e chamar `NotionSyncQueue.mark_synced(title)`.
- **Status**: aberto, não crítico, comunicado explicitamente ao usuário (não declarado como concluído).

## Decisões pendentes (não bloqueiam, apenas registradas)

- Backend e banco de dados ainda não definidos — dados mockados localmente conforme arquitetura baseline autorizada. Será revisado quando/se houver requisito explícito de persistência real.
