"""Ponto de entrada da automacao Culinary.

Uso:
    python -m automation.main --dry-run      # monta a Crew e mostra o plano, sem chamar LLM
    python -m automation.main --run          # executa kickoff() real (exige OPENAI_API_KEY)

Sem --run, este modulo nunca faz chamada de rede: apenas monta a Crew, le o
estado persistido e imprime o que seria executado.
"""
from __future__ import annotations

import argparse
import sys
import uuid

from automation.config.settings import get_settings
from automation.crews.culinary_crew import build_culinary_crew
from automation.tools.state_store import ExecutionState, StateStore


def _load_or_create_state(store: StateStore) -> ExecutionState:
    state = store.load()
    if state is not None:
        return state
    return ExecutionState(run_id=str(uuid.uuid4()), next_action="analyze_project")


def run_dry_run() -> int:
    """Monta a Crew e o estado, imprime o plano, nao faz chamada de rede."""
    settings = get_settings()
    settings.ensure_dirs()

    store = StateStore(settings.state_file, settings.history_file)
    state = _load_or_create_state(store)

    crew = build_culinary_crew()

    print(f"Run ID: {state.run_id}")
    print(f"Proxima acao registrada: {state.next_action or 'nenhuma (inicio)'}")
    print(f"Minitasks concluidas: {state.completed_minitasks or 'nenhuma'}")
    print(f"Bloqueios conhecidos: {state.blockers or 'nenhum'}")
    print()
    print("Plano da Crew (sequencial):")
    for task in crew.tasks:
        print(f"  - [{task.agent.role}] {task.description.strip().splitlines()[0]}")

    store.save(state)
    return 0


def run_real(*, api_key_required: bool = True) -> int:
    """Executa a Crew de fato (crew.kickoff()). Requer OPENAI_API_KEY valido."""
    import os

    if api_key_required and not os.environ.get("OPENAI_API_KEY"):
        print(
            "Bloqueio: OPENAI_API_KEY nao esta definido no ambiente. "
            "Defina a variavel antes de rodar com --run.",
            file=sys.stderr,
        )
        return 2

    settings = get_settings()
    settings.ensure_dirs()
    store = StateStore(settings.state_file, settings.history_file)
    state = _load_or_create_state(store)

    crew = build_culinary_crew(verbose=True)
    result = crew.kickoff(
        inputs={
            "journal_dir": str(settings.journal_dir),
            "project_root": str(settings.project_root),
        }
    )

    store.append_event({"event": "crew_kickoff_completed", "run_id": state.run_id})
    print(result)
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Automacao Culinary (LangChain + CrewAI)")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--dry-run", action="store_true", help="Monta o plano sem chamar LLM.")
    group.add_argument("--run", action="store_true", help="Executa a Crew de fato (kickoff).")
    args = parser.parse_args(argv)

    if args.dry_run:
        return run_dry_run()
    return run_real()


if __name__ == "__main__":
    raise SystemExit(main())
