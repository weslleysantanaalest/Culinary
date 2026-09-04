"""Agente Reviewer."""
from __future__ import annotations

from crewai import Agent
from crewai.llm import LLM

from automation.agents._agent_factory import build_agent_from_config


def build_reviewer(*, llm: LLM | None = None) -> Agent:
    """Instancia o agente independente responsavel por revisar diff e evidencias."""
    return build_agent_from_config("reviewer", llm=llm)
