"""Agente Project Analyzer."""
from __future__ import annotations

from crewai import Agent
from crewai.llm import LLM

from automation.agents._agent_factory import build_agent_from_config


def build_project_analyzer(*, llm: LLM | None = None) -> Agent:
    """Instancia o agente responsavel por analisar protototipos, codigo e journal."""
    return build_agent_from_config("project_analyzer", llm=llm)
