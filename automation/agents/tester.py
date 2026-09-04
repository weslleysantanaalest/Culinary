"""Agente Tester."""
from __future__ import annotations

from crewai import Agent
from crewai.llm import LLM

from automation.agents._agent_factory import build_agent_from_config


def build_tester(*, llm: LLM | None = None) -> Agent:
    """Instancia o agente responsavel por executar lint/testes/build e coletar evidencia."""
    return build_agent_from_config("tester", llm=llm)
