"""Testes estruturais da Crew: instanciacao, ordem do fluxo, encadeamento de contexto.

Usa um LLM com api_key fake (sem chamada de rede) — estes testes validam
apenas a MONTAGEM da Crew, nunca `kickoff()`.
"""
from __future__ import annotations

from crewai.llm import LLM

from automation.crews.culinary_crew import FLOW_ORDER, build_culinary_crew, load_tasks_config


def _fake_llm() -> LLM:
    return LLM(model="gpt-4o-mini", api_key="sk-test-fake-not-a-real-key")


def test_flow_order_matches_tasks_yaml_keys() -> None:
    config = load_tasks_config()
    assert set(FLOW_ORDER) == set(config.keys())


def test_build_culinary_crew_has_six_agents_and_tasks() -> None:
    crew = build_culinary_crew(llm=_fake_llm())
    assert len(crew.agents) == 6
    assert len(crew.tasks) == 6


def test_crew_tasks_follow_flow_order_by_agent_role() -> None:
    crew = build_culinary_crew(llm=_fake_llm())
    expected_roles = [
        "Project Analyzer",
        "Planner",
        "Developer",
        "Tester",
        "Reviewer",
        "Documenter",
    ]
    actual_roles = [task.agent.role for task in crew.tasks]
    assert actual_roles == expected_roles


def test_each_task_has_context_from_previous_tasks() -> None:
    crew = build_culinary_crew(llm=_fake_llm())
    tasks = crew.tasks

    assert tasks[0].context is None
    for index in range(1, len(tasks)):
        assert tasks[index].context is not None
        assert len(tasks[index].context) == index


def test_crew_uses_sequential_process() -> None:
    from crewai import Process

    crew = build_culinary_crew(llm=_fake_llm())
    assert crew.process == Process.sequential


def test_reviewer_agent_allows_delegation_back_to_developer() -> None:
    crew = build_culinary_crew(llm=_fake_llm())
    reviewer = next(a for a in crew.agents if a.role == "Reviewer")
    assert reviewer.allow_delegation is True


def test_developer_agent_does_not_allow_delegation() -> None:
    crew = build_culinary_crew(llm=_fake_llm())
    developer = next(a for a in crew.agents if a.role == "Developer")
    assert developer.allow_delegation is False
