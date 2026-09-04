"""Smoke test dos imports exigidos: langchain_core.prompts.PromptTemplate e crewai."""
from __future__ import annotations


def test_langchain_core_prompt_template_importable() -> None:
    from langchain_core.prompts import PromptTemplate

    assert PromptTemplate is not None


def test_crewai_core_classes_importable() -> None:
    from crewai import Agent, Crew, Task

    assert Agent is not None
    assert Task is not None
    assert Crew is not None


def test_both_libraries_load_together_smoke_message(capsys) -> None:
    """Reproduz literalmente o smoke test exigido pelo protocolo."""
    from langchain_core.prompts import PromptTemplate  # noqa: F401
    from crewai import Agent, Task, Crew  # noqa: F401

    print("✅ Ambas as bibliotecas foram carregadas com sucesso no venv!")
    captured = capsys.readouterr()
    assert "✅ Ambas as bibliotecas foram carregadas com sucesso no venv!" in captured.out
