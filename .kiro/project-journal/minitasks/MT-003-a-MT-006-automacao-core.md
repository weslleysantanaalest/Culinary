# MT-003 a MT-006 (automação) — Persistência, Prompts LangChain, Agentes CrewAI, Crew funcional

Consolidado em um único registro porque as quatro minitasks foram implementadas e
validadas na mesma sequência de execução, com evidência conjunta (suíte de testes
única). Cada uma é rastreável por seus arquivos/testes específicos abaixo.

## MT-003 — Criar persistência

- **Status**: concluída
- **Objetivo**: Armazenamento de estado (`current_state.json`) + histórico append-only (`execution_history.jsonl`) + retomada.
- **Arquivos criados**: `automation/tools/state_store.py` (`ExecutionState`, `StateStore`).
- **Decisão técnica**: `ExecutionState.from_dict` ignora campos desconhecidos (forward-compatible), e `StateStore.load()` retorna `None` em vez de lançar exceção quando o JSON está corrompido — retomada nunca quebra por estado ilegível, apenas trata como "sem estado anterior".
- **Bug encontrado e corrigido**: `AUTOMATION_ROOT`/`PROJECT_ROOT` em `automation/config/settings.py` estavam com o número de `.parent` errado (calculavam `automation/config/` como raiz da automação em vez de `automation/`), o que fazia `current_state.json` ser escrito em `automation/config/state/` em vez de `automation/state/`. Corrigido e revalidado com `get_settings()` imprimindo os paths corretos.
- **Testes**: `automation/tests/test_state_store.py` — 6 testes (roundtrip, histórico não sobrescreve, JSON corrompido tratado, campos desconhecidos ignorados).
- **Evidência**: `pytest automation/tests/test_state_store.py -v` → 6 passed.

## MT-004 — Criar templates LangChain

- **Status**: concluída
- **Objetivo**: `PromptTemplate` (`langchain_core.prompts`) padronizando instruções de cada agente, com variáveis explícitas e separação Fato/Indício/Proposta/Decisão pendente/Bloqueio.
- **Arquivos criados**:
  - `automation/prompts/base.py` — `EPISTEMIC_RULES` + `build_prompt_template()` (valida que toda variável declarada existe no template, e vice-versa; levanta `PromptVariableError` se não).
  - `automation/prompts/analysis.py` — análise do projeto + extração de requisitos.
  - `automation/prompts/development.py` — planejamento de minitask + implementação.
  - `automation/prompts/testing.py` — validação (lint/test/build).
  - `automation/prompts/review.py` — revisão de diff/evidência.
  - `automation/prompts/documentation.py` — registro de minitask + retomada a partir do estado.
- **Decisão técnica**: todo `PromptTemplate` criado via `build_prompt_template()` recebe automaticamente o bloco `EPISTEMIC_RULES` prependado, para impedir (por design, não por convenção) que um agente omita a separação Fato/Proposta.
- **Testes**: `automation/tests/test_prompts.py` — 12 testes, incluindo rejeição de template com variável faltante e verificação de que as 5 categorias epistêmicas estão presentes.
- **Evidência**: `pytest automation/tests/test_prompts.py -v` → 12 passed.

## MT-005 — Criar agentes CrewAI

- **Status**: concluída
- **Objetivo**: Implementar os 6 agentes (`crewai.Agent`) com responsabilidades definidas e validar instanciação.
- **Arquivos criados**:
  - `automation/config/agents.yaml` — role/goal/backstory/allow_delegation de cada agente.
  - `automation/agents/_agent_factory.py` — carrega `agents.yaml` (cacheado) e resolve o `LLM` (permite injeção de LLM fake para testes sem chamada de rede).
  - `automation/agents/{project_analyzer,planner,developer,tester,reviewer,documenter}.py` — uma função `build_*()` por agente.
- **Decisão técnica**: `crewai.Agent()` tenta resolver um LLM na instanciação (não apenas na execução) e falha sem `OPENAI_API_KEY` — confirmado empiricamente antes de escrever o código, conforme exigido. Solução: `resolve_llm()` usa uma `api_key` de placeholder (`sk-placeholder-no-network-call`) quando não há chave real no ambiente, permitindo instanciar e testar a estrutura sem rede; a chamada de rede real só ocorre em `Crew.kickoff()`.
- **API verificada antes do uso**: `Agent.model_fields`, `Task.model_fields`, `Crew.model_fields` inspecionados via `crewai==1.9.0` instalado, confirmando que `role`, `goal`, `backstory`, `allow_delegation`, `llm`, `description`, `expected_output`, `agent`, `context`, `agents`, `tasks`, `process` existem nesta versão antes de usá-los no código.
- **Testes**: cobertos indiretamente por `test_crew.py` (que instancia todos os 6 agentes via `build_culinary_crew`).
- **Evidência**: `venv/bin/python -c "from crewai import Agent; ..."` confirmando comportamento de falha sem API key, e sucesso com `api_key` explícito.

## MT-006 — Criar primeira Crew funcional

- **Status**: concluída (estrutural) / parcial (execução real com `kickoff()` não validada — ver Pendências)
- **Objetivo**: Conectar análise, planejamento, desenvolvimento, teste, revisão e documentação em uma única `Crew`, e capturar evidência de montagem.
- **Arquivos criados**:
  - `automation/crews/culinary_crew.py` — `build_culinary_crew()`, monta os 6 `Task`s na ordem `FLOW_ORDER` (`analyze_project -> plan_next_minitask -> implement_minitask -> validate_minitask -> review_minitask -> document_minitask`), cada `Task` recebendo como `context` todas as tasks anteriores.
  - `automation/config/tasks.yaml` — description/expected_output de cada task.
  - `automation/main.py` — CLI com `--dry-run` (monta a Crew e mostra o plano, sem chamada de rede) e `--run` (executa `kickoff()` real, exige `OPENAI_API_KEY`).
- **Decisão técnica**: `Process.sequential` (não hierárquico) — o fluxo é uma cadeia linear fixa definida pelo protocolo, não requer um agente gerente decidindo dinamicamente a ordem.
- **Testes**: `automation/tests/test_crew.py` — 7 testes (6 agentes/6 tasks instanciados, ordem de papéis correta, encadeamento de contexto, `Process.sequential`, permissões de delegação do Reviewer vs Developer).
- **Evidência**:
  - `venv/bin/python -m automation.main --dry-run` → executa com exit 0, imprime plano dos 6 passos, persiste `automation/state/current_state.json`.
  - `pytest automation/tests/test_crew.py -v` → 7 passed.
- **Pendências**: `kickoff()` real (execução de fato via LLM) não foi disparado nesta sessão porque `OPENAI_API_KEY` não está definido no ambiente — isso é um bloqueio de credencial (categoria explicitamente listada como "não bloqueia todo o projeto" no protocolo). A automação está pronta estruturalmente; falta a chave para rodar ponta a ponta com LLM real.
- **Próxima minitask**: MT-007 (automação) — Integrar ao desenvolvimento do Culinary: selecionar uma melhoria real. Bloqueado para execução via `kickoff()` real até `OPENAI_API_KEY` estar disponível; pode prosseguir localmente (sem LLM) com uma minitask simples do projeto Next.js em paralelo (ver frente principal de desenvolvimento).

## Evidência consolidada desta seção

```
$ pytest automation/tests/ -v
27 passed in 2.45s (após correção do bug de path: revalidado, ainda 27 passed)
```
