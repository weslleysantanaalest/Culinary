# Automação Culinary (LangChain + CrewAI)

Orquestrador local do ciclo de desenvolvimento do projeto Culinary: le contexto e
requisitos, inspeciona o projeto, escolhe a próxima minitask, planeja, implementa,
testa, revisa, documenta e persiste estado para continuar depois.

Este pacote **não substitui** `.kiro/project-journal/` — ele lê e escreve nesse
diretório como fonte de verdade compartilhada com o fluxo humano/Kiro.

## Ambiente

- Python 3.12 (venv em `venv/` na raiz do projeto — **não** commitar esta pasta).
- Dependências fixadas em `automation/requirements.txt` (gerado via `pip freeze`).

```bash
# Criar/recriar o venv (Python 3.12 via Homebrew: /usr/local/bin/python3.12)
/usr/local/bin/python3.12 -m venv venv
venv/bin/pip install -r automation/requirements.txt
```

### Por que Python 3.12 (não 3.9)

O ambiente tinha um `venv/` órfão criado com Python 3.9.6 (EOL) e `crewai==0.5.0`
(defasado ~3 anos). Foi recriado com Python 3.12, a última versão estável instalada
via Homebrew (`python@3.12`) compatível com o CrewAI atual.

### Por que `crewai==1.9.0` (não o `latest` 1.15.17)

A partir da série 1.10.x, o CrewAI passou a depender diretamente de `lancedb>=0.29.2`
para memória de agentes. O LanceDB, nessa faixa de versão, só publica wheel de macOS
para `arm64` (Apple Silicon) — esta máquina é `x86_64` (Intel Mac), sem wheel
disponível. `crewai==1.9.0` é a última versão da série 1.x sem essa dependência
direta, então foi a fixada. Reavaliar quando o LanceDB publicar wheel x86_64 ou o
CrewAI tornar essa dependência opcional.

## Smoke test dos imports

```bash
venv/bin/python -m pytest automation/tests/test_imports.py -v
```

Valida exatamente:

```python
from langchain_core.prompts import PromptTemplate
from crewai import Agent, Task, Crew
```

## Uso

```bash
# Monta o plano da Crew e mostra o estado, SEM chamar nenhum LLM (sem rede)
venv/bin/python -m automation.main --dry-run

# Executa a Crew de fato (kickoff real). Exige OPENAI_API_KEY no ambiente.
export OPENAI_API_KEY=sk-...
venv/bin/python -m automation.main --run
```

`--dry-run` é seguro para rodar em qualquer momento: monta os 6 agentes e as 6
tasks, mostra o estado persistido e a próxima ação, e não faz nenhuma chamada de
rede (usa uma `api_key` de placeholder que nunca é usada sem `--run`).

## Testes

```bash
venv/bin/python -m pytest automation/tests/ -v
```

27 testes cobrindo: imports (smoke test), prompts (variáveis obrigatórias e regras
epistêmicas Fato/Indício/Proposta/Decisão pendente/Bloqueio), persistência de estado
(roundtrip, histórico append-only, corrupção graciosa) e montagem estrutural da Crew
(ordem do fluxo, encadeamento de contexto entre tasks, permissões de delegação).

Os testes de Crew usam um `LLM` com `api_key` fake — validam apenas a **montagem**
(`Agent`/`Task`/`Crew` sendo instanciados corretamente), nunca fazem `kickoff()` nem
chamada de rede.

## Arquitetura

```
automation/
├── main.py                  # ponto de entrada (--dry-run / --run)
├── config/
│   ├── settings.py          # paths e config resolvidos do ambiente
│   ├── agents.yaml          # role/goal/backstory dos 6 agentes
│   └── tasks.yaml           # description/expected_output das 6 tasks do fluxo
├── prompts/                 # PromptTemplate (langchain_core.prompts) por etapa
│   ├── base.py              # regra epistêmica comum + validação de variáveis
│   ├── analysis.py          # analise do projeto + extração de requisitos
│   ├── development.py       # planejamento de minitask + implementação
│   ├── testing.py           # validação (lint/test/build)
│   ├── review.py            # revisão de diff + evidência
│   └── documentation.py     # registro de minitask + retomada de estado
├── agents/                  # crewai.Agent por papel (Analyzer..Documenter)
├── crews/
│   └── culinary_crew.py     # conecta os 6 agentes/tasks em Process.sequential
├── tools/                   # I/O puro, sem depender de LLM
│   ├── project_files.py     # leitura de arquivo restrita ao project_root
│   ├── command_runner.py    # execução de lint/test/build com allowlist
│   ├── evidence_collector.py# consolidação de evidência de uma minitask
│   ├── state_store.py       # current_state.json + execution_history.jsonl
│   └── notion_sync.py       # fila local de sincronização (fallback sem MCP)
├── state/
│   ├── current_state.json          # estado atual (sobrescrito a cada save)
│   └── execution_history.jsonl     # histórico append-only
└── tests/                   # pytest — ver seção Testes acima
```

## Fluxo da Crew

```
Project Analyzer -> Planner -> Developer -> Tester -> Reviewer -> Documenter
```

Cada `Task` recebe como `context` todas as tasks anteriores na cadeia (via
`crewai.Task(context=[...])`), para que a saída do Analyzer chegue ao Planner, a
escolha do Planner chegue ao Developer, e assim por diante.

Uma minitask só é considerada concluída quando: a implementação existe, os
critérios de aceite foram verificados, os testes aplicáveis rodaram, há evidência
registrada, o Reviewer aprovou e o Documenter persistiu o resultado. Se o Tester ou
Reviewer rejeitar, a minitask volta ao Developer — nunca é marcada como concluída
prematuramente.

## Persistência e continuidade

- `automation/state/current_state.json`: snapshot do estado atual (run_id, minitask
  atual, minitasks concluídas/pendentes, arquivos alterados, comandos executados,
  bloqueios, próxima ação).
- `automation/state/execution_history.jsonl`: histórico append-only de eventos —
  nunca é sobrescrito, apenas recebe novas linhas.
- `.kiro/project-journal/minitasks/MT-XXX-*.md`: documentação individual de cada
  minitask (mesmo padrão usado pelo restante do projeto).
- `.kiro/project-journal/notion-sync-queue.jsonl`: fila de itens pendentes de
  sincronização com o Notion — só é marcada como sincronizada após confirmação real
  via Notion MCP (nunca se declara "documentado no Notion" com base em escrita
  apenas local).

## Segurança

- `tools/command_runner.py` só executa comandos de uma allowlist (`npm`, `npx`,
  `node`, `python`, `pytest`, `ruff`, `pip`) e rejeita explicitamente padrões
  destrutivos (`rm -rf`, `git push`, `git reset --hard`, `--force`, fork bombs).
- `tools/project_files.py` restringe leitura de arquivo ao `project_root`.
- Não há criação de repositório remoto, push, deploy ou inserção de credenciais
  neste pacote — essas ações permanecem fora do escopo autorizado.
