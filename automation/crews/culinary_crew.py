"""Crew Culinary: conecta os 6 agentes na ordem Analyzer -> Planner -> Developer ->
Tester -> Reviewer -> Documenter, usando as descricoes declarativas de
automation/config/tasks.yaml.

`build_culinary_crew()` monta a Crew (estrutural, sem chamada de rede).
`kickoff()` (chamada explicita pelo caller) e a unica operacao que faz
chamadas reais de LLM e exige OPENAI_API_KEY valido.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml
from crewai import Agent, Crew, Process, Task
from crewai.llm import LLM

from automation.agents.developer import build_developer
from automation.agents.documenter import build_documenter
from automation.agents.planner import build_planner
from automation.agents.project_analyzer import build_project_analyzer
from automation.agents.reviewer import build_reviewer
from automation.agents.tester import build_tester

TASKS_YAML_PATH = Path(__file__).resolve().parent.parent / "config" / "tasks.yaml"

# Ordem canonica do fluxo (chave em tasks.yaml -> agente correspondente).
FLOW_ORDER: tuple[str, ...] = (
    "analyze_project",
    "plan_next_minitask",
    "implement_minitask",
    "validate_minitask",
    "review_minitask",
    "document_minitask",
)


@lru_cache(maxsize=1)
def load_tasks_config() -> dict[str, dict[str, Any]]:
    with open(TASKS_YAML_PATH, encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def _agent_builders(llm: LLM | None) -> dict[str, Agent]:
    return {
        "project_analyzer": build_project_analyzer(llm=llm),
        "planner": build_planner(llm=llm),
        "developer": build_developer(llm=llm),
        "tester": build_tester(llm=llm),
        "reviewer": build_reviewer(llm=llm),
        "documenter": build_documenter(llm=llm),
    }


def build_culinary_crew(*, llm: LLM | None = None, verbose: bool = False) -> Crew:
    """Monta a Crew completa com as 6 tasks encadeadas via `context`.

    Cada Task recebe como `context` a(s) Task(s) anterior(es) na ordem
    FLOW_ORDER, para que a saida de uma etapa fique disponivel para a proxima
    (ex.: o Developer ve a minitask escolhida pelo Planner).
    """
    tasks_config = load_tasks_config()
    agents = _agent_builders(llm)

    tasks: dict[str, Task] = {}
    ordered_tasks: list[Task] = []
    for task_key in FLOW_ORDER:
        spec = tasks_config[task_key]
        agent_key = spec["agent"]
        previous_tasks = [tasks[k] for k in FLOW_ORDER[: FLOW_ORDER.index(task_key)]]

        task = Task(
            description=spec["description"],
            expected_output=spec["expected_output"],
            agent=agents[agent_key],
            context=previous_tasks or None,
        )
        tasks[task_key] = task
        ordered_tasks.append(task)

    return Crew(
        agents=list(agents.values()),
        tasks=ordered_tasks,
        process=Process.sequential,
        verbose=verbose,
    )
