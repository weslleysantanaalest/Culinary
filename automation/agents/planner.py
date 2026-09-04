"""Agente Planner."""
from __future__ import annotations

from crewai import Agent
from crewai.llm import LLM

from automation.agents._agent_factory import build_agent_from_config


def build_planner(*, llm: LLM | None = None) -> Agent:
    """Instancia o agente responsavel por escolher a proxima minitask."""
    return build_agent_from_config("planner", llm=llm)
