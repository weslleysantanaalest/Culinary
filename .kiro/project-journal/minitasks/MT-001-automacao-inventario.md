# MT-001 (automação) — Inventariar o projeto para a automação LangChain/CrewAI

- **Status**: concluída
- **Data/hora**: 2026-08-27 14:20 -03:00 (aprox., baseado em timestamps de arquivo)
- **Objetivo**: Levantar fatos, indícios e lacunas do estado do projeto Culinary antes de construir a automação (venv, dependências, estrutura já existente).
- **Contexto**: Nova frente de trabalho autorizada pelo responsável — automação local do ciclo de desenvolvimento via LangChain + CrewAI, dentro do mesmo projeto `/Users/weslleysantana/Projetos/Culinary`.

## Fatos
- Projeto raiz: `/Users/weslleysantana/Projetos/Culinary`. Confirmado via `ls`.
- Protótipos estáticos em `stitch_culin_ria_minimalista_parallax/` (8 telas + DESIGN.md) — já inventariados na MT-001 da frente Next.js (`.kiro/project-journal/minitasks/MT-001-inventario-prototipos.md`).
- Journal `.kiro/project-journal/` já existente com `00` a `05` + `minitasks/` (criado na frente Next.js).
- Já existia um `venv/` na raiz do projeto, criado em 2026-08-27 14:45 (antes desta sessão de automação), com Python 3.9.6 e `crewai==0.5.0` + `langchain==0.1.0` instalados. Confirmado via `cat venv/pyvenv.cfg` e `pip list`.
- Não havia `requirements.txt`/`pyproject.toml` associado a esse `venv/` — órfão, sem declaração de intenção.
- Git não inicializado no projeto (confirmado na MT-001 da frente Next.js).
- Python 3.12.13 disponível via Homebrew em `/usr/local/bin/python3.12` (`brew list` mostra `python@3.12`).
- Máquina é `x86_64` (Intel Mac), macOS 26.5.1 — confirmado via `uname -m` e `sw_vers`.

## Indícios
- O `venv/` com Python 3.9 + crewai 0.5.0 sugere uma tentativa anterior (de outra sessão/agente) de montar esta mesma automação, abandonada antes de registrar requirements ou completar o smoke test.

## Lacunas
- Não há registro anterior desta iniciativa em `.kiro/project-journal/` antes desta minitask.
- Não há `OPENAI_API_KEY` no ambiente (verificado nas minitasks seguintes) — bloqueia execução real da Crew (`kickoff()`), não bloqueia construção/testes estruturais.

- **Arquivos analisados**: `venv/pyvenv.cfg`, saída de `pip list` do venv antigo, estrutura de `stitch_culin_ria_minimalista_parallax/`, `.kiro/project-journal/`.
- **Arquivos criados/alterados nesta minitask**: nenhum (apenas inspeção).
- **Comandos executados**:
  - `ls` / `read Directory` em `/Users/weslleysantana/Projetos/Culinary`
  - `cat venv/pyvenv.cfg`
  - `venv/bin/python3 --version`
  - `venv/bin/pip list`
  - `which python3`, `python3 --version`, `python3 -m pip --version`
  - `ls /usr/local/bin/python3* /opt/homebrew/bin/python3*`
  - `brew list | grep -i python`
  - `uname -m`, `sw_vers`
- **Testes executados**: N/A (inventário).
- **Resultado**: sucesso — decisão tomada de recriar o venv com Python 3.12 (ver MT-002).
- **Evidências**: outputs de todos os comandos acima, citados nesta minitask.
- **Pendências**: nenhuma bloqueante.
- **Próxima minitask**: MT-002 (automação) — Preparar ambiente Python (recriar venv, instalar LangChain+CrewAI, smoke test).
