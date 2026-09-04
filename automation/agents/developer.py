"""Agente Developer."""
from __future__ import annotations

from crewai import Agent
from crewai.llm import LLM

from automation.agents._agent_factory import build_agent_from_config


def build_developer(*, llm: LLM | None = None) -> Agent:
    """Instancia o agente responsavel por implementar exatamente uma minitask."""
    return build_agent_from_config("developer", llm=llm)
