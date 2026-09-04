"""Testes de automation.tools.state_store — persistencia e continuidade."""
from __future__ import annotations

from pathlib import Path

from automation.tools.state_store import ExecutionState, StateStore


def test_load_returns_none_when_no_state_file(tmp_path: Path) -> None:
    store = StateStore(tmp_path / "state.json", tmp_path / "history.jsonl")
    assert store.load() is None


def test_save_then_load_roundtrip(tmp_path: Path) -> None:
    store = StateStore(tmp_path / "state.json", tmp_path / "history.jsonl")
    state = ExecutionState(
        run_id="run-1",
        current_minitask="MT-001",
        completed_minitasks=["MT-000"],
        next_action="MT-002",
    )
    store.save(state)

    loaded = store.load()
    assert loaded is not None
    assert loaded.run_id == "run-1"
    assert loaded.current_minitask == "MT-001"
    assert loaded.completed_minitasks == ["MT-000"]
    assert loaded.next_action == "MT-002"


def test_save_appends_to_history_without_overwriting(tmp_path: Path) -> None:
    store = StateStore(tmp_path / "state.json", tmp_path / "history.jsonl")
    store.save(ExecutionState(run_id="run-1", next_action="MT-001"))
    store.save(ExecutionState(run_id="run-1", next_action="MT-002"))

    history = store.read_history()
    assert len(history) == 2
    assert history[0]["next_action"] == "MT-001"
    assert history[1]["next_action"] == "MT-002"


def test_append_event_does_not_touch_state_file(tmp_path: Path) -> None:
    store = StateStore(tmp_path / "state.json", tmp_path / "history.jsonl")
    store.append_event({"event": "custom", "detail": "algo aconteceu"})

    assert not store.state_file.exists()
    history = store.read_history()
    assert history[0]["event"] == "custom"


def test_load_handles_corrupted_json_gracefully(tmp_path: Path) -> None:
    state_file = tmp_path / "state.json"
    state_file.write_text("{isso nao e json valido", encoding="utf-8")
    store = StateStore(state_file, tmp_path / "history.jsonl")

    assert store.load() is None


def test_from_dict_ignores_unknown_fields(tmp_path: Path) -> None:
    data = {"run_id": "run-2", "next_action": "MT-003", "campo_desconhecido": "x"}
    state = ExecutionState.from_dict(data)
    assert state.run_id == "run-2"
    assert state.next_action == "MT-003"
