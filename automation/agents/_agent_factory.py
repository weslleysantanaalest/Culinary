"""Utilitarios compartilhados para instanciar os agentes a partir de agents.yaml."""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml
from crewai import Agent
from crewai.llm import LLM

AGENTS_YAML_PATH = Path(__file__).resolve().parent.parent / "config" / "agents.yaml"


@lru_cache(maxsize=1)
def load_agents_config() -> dict[str, dict[str, Any]]:
    """Le automation/config/agents.yaml uma unica vez (cacheado)."""
    with open(AGENTS_YAML_PATH, encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def resolve_llm(model: str | None = None, *, api_key: str | None = None) -> LLM:
    """Resolve o LLM a ser usado pelos agentes.

    Se OPENAI_API_KEY nao estiver no ambiente e nenhum api_key for passado,
    usa uma chave de placeholder para permitir instanciacao/testes estruturais
    sem chamada de rede (a chamada real de rede so ocorre em `Crew.kickoff()`).
    """
    resolved_model = model or os.environ.get("CULINARY_LLM_MODEL", "gpt-4o-mini")
    resolved_key = api_key or os.environ.get("OPENAI_API_KEY") or "sk-placeholder-no-network-call"
    return LLM(model=resolved_model, api_key=resolved_key)


def build_agent_from_config(agent_key: str, *, llm: LLM | None = None) -> Agent:
    """Instancia um crewai.Agent a partir da entrada `agent_key` em agents.yaml."""
    config = load_agents_config()
    if agent_key not in config:
        raise KeyError(
            f"Agente '{agent_key}' nao encontrado em agents.yaml. "
            f"Chaves disponiveis: {sorted(config.keys())}"
        )

    spec = config[agent_key]
    return Agent(
        role=spec["role"],
        goal=spec["goal"],
        backstory=spec["backstory"],
        allow_delegation=spec.get("allow_delegation", False),
        llm=llm or resolve_llm(),
    )
