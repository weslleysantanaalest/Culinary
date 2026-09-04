"""Agente Documenter."""
from __future__ import annotations

from crewai import Agent
from crewai.llm import LLM

from automation.agents._agent_factory import build_agent_from_config


def build_documenter(*, llm: LLM | None = None) -> Agent:
    """Instancia o agente responsavel por registrar fatos comprovados no journal."""
    return build_agent_from_config("documenter", llm=llm)
