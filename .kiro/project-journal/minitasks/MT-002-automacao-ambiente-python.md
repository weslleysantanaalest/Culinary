# MT-002 (automação) — Preparar ambiente Python

- **Status**: concluída
- **Data/hora**: 2026-08-27 14:50 -03:00 (aprox.)
- **Objetivo**: Recriar o ambiente virtual Python com uma versão compatível com o LangChain/CrewAI atuais, instalar as bibliotecas e validar com o smoke test de imports exigido.
- **Contexto**: `venv/` existente usava Python 3.9.6 (EOL) e `crewai==0.5.0` (defasado ~3 anos, sem requirements.txt associado — órfão). Decisão: recriar.

## Fato
- `venv/` antigo removido e recriado com `/usr/local/bin/python3.12` (Python 3.12.13 confirmado via `venv/bin/python --version`).
- Tentativa de instalar `crewai` (`latest`, resolvido para 1.15.17 na ocasião) + `langchain-core==1.6.0` falhou por dependência transitiva `lancedb<0.30.1,>=0.29.2` sem wheel para macOS `x86_64` (só publica `macosx_11_0_arm64`). Confirmado consultando `https://pypi.org/pypi/lancedb/0.29.2/json`.
- Verificado que `crewai` só passou a depender diretamente de `lancedb` a partir da série `1.10.x`; `1.9.0` não tem essa dependência direta (confirmado consultando metadata de várias versões via PyPI JSON API).
- Instalação de `crewai==1.9.0` + `langchain-core==1.6.0` concluída com sucesso (falha anterior era timeout de rede pontual em `mcp~=1.23.1`, resolvida com retry).
- Smoke test executado com os imports exatos exigidos:
  ```python
  from langchain_core.prompts import PromptTemplate
  from crewai import Agent, Task, Crew
  print("✅ Ambas as bibliotecas foram carregadas com sucesso no venv!")
  ```
  Saída obtida: `✅ Ambas as bibliotecas foram carregadas com sucesso no venv!` (exit code 0).
- `pytest==9.1.1` instalado adicionalmente para a suíte de testes.
- `automation/requirements.txt` gerado via `pip freeze` (140+ pacotes, incluindo `crewai==1.9.0`, `langchain-core==1.6.0`, `chromadb==1.1.1`, `PyYAML==6.0.3`, `pytest==9.1.1`).

## Decisão técnica (ADR)
- **TypeScript-like ADR para Python**: `crewai==1.9.0` em vez do `latest` (1.15.17) — motivo: incompatibilidade de plataforma do `lancedb` (dependência obrigatória a partir de crewai 1.10.x) com macOS x86_64. Documentado em `automation/README.md`, seção "Por que crewai==1.9.0".
- Python 3.12 (via Homebrew) em vez de manter 3.9 do sistema — motivo: 3.9 é EOL e abaixo do mínimo recomendado pelo ecossistema CrewAI/LangChain atual.

- **Arquivos criados**: `automation/requirements.txt`.
- **Arquivos alterados**: `venv/` inteiro recriado (não versionado, fora do escopo de arquivos de código).
- **Comandos executados**:
  - `rm -rf venv && /usr/local/bin/python3.12 -m venv venv`
  - `venv/bin/pip install --upgrade pip -q`
  - `venv/bin/pip install "langchain-core==1.6.0" "crewai==1.15.17" -q` (falhou: lancedb sem wheel x86_64)
  - `curl https://pypi.org/pypi/lancedb/0.29.2/json` (confirmação de plataformas suportadas)
  - `curl https://pypi.org/pypi/crewai/{1.10.0,1.9.0,1.8.0,...}/json` (bisection para achar última versão sem lancedb direto)
  - `venv/bin/pip install --timeout 60 --retries 5 "langchain-core==1.6.0" "crewai==1.9.0"` (sucesso)
  - `venv/bin/python automation/_smoke_test_imports.py` (temporário, depois substituído por `automation/tests/test_imports.py`)
  - `venv/bin/pip freeze > automation/requirements.txt`
- **Testes executados**: smoke test manual (script temporário) + posteriormente `pytest automation/tests/test_imports.py` (3 testes, todos PASSED).
- **Resultado**: sucesso, com evidência de execução real (exit code 0, mensagem exata impressa).
- **Evidências**: saída do comando de smoke test citada acima; saída completa de `pip freeze`; outputs das consultas PyPI JSON.
- **Pendências**: `OPENAI_API_KEY` não definido no ambiente — bloqueia apenas `kickoff()` real da Crew (ver MT-006/MT-007), não bloqueia testes estruturais.
- **Próxima minitask**: MT-003 (automação) — Criar persistência (state_store + execution_history).
