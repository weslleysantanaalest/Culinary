"""Persistencia de estado da automacao: current_state.json + execution_history.jsonl.

Este modulo NAO depende de LangChain/CrewAI — e I/O de arquivo puro, para poder
ser testado sem qualquer chamada de rede ou LLM.
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class ExecutionState:
    """Estado persistente minimo exigido pelo protocolo de continuidade."""

    run_id: str
    current_minitask: str | None = None
    completed_minitasks: list[str] = field(default_factory=list)
    pending_minitasks: list[str] = field(default_factory=list)
    changed_files: list[str] = field(default_factory=list)
    commands_executed: list[str] = field(default_factory=list)
    tests_and_results: list[dict[str, Any]] = field(default_factory=list)
    evidence: list[str] = field(default_factory=list)
    blockers: list[str] = field(default_factory=list)
    next_action: str | None = None
    updated_at: str = field(default_factory=_utcnow_iso)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "ExecutionState":
        known_fields = {f for f in cls.__dataclass_fields__}
        filtered = {k: v for k, v in data.items() if k in known_fields}
        return cls(**filtered)


class StateStore:
    """Le/escreve o estado atual e faz append no historico execution_history.jsonl."""

    def __init__(self, state_file: Path, history_file: Path) -> None:
        self.state_file = Path(state_file)
        self.history_file = Path(history_file)
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        self.history_file.parent.mkdir(parents=True, exist_ok=True)

    def load(self) -> ExecutionState | None:
        """Retorna o estado persistido, ou None se nao existir/estiver corrompido."""
        if not self.state_file.exists():
            return None
        try:
            raw = json.loads(self.state_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return None
        return ExecutionState.from_dict(raw)

    def save(self, state: ExecutionState) -> None:
        """Persiste o estado atual (sobrescreve) e registra um evento no historico."""
        state.updated_at = _utcnow_iso()
        self.state_file.write_text(
            json.dumps(state.to_dict(), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        self._append_history(
            {
                "event": "state_saved",
                "run_id": state.run_id,
                "current_minitask": state.current_minitask,
                "next_action": state.next_action,
                "timestamp": state.updated_at,
            }
        )

    def append_event(self, event: dict[str, Any]) -> None:
        """Adiciona um evento arbitrario ao historico append-only (sem sobrescrever)."""
        event = {**event, "timestamp": event.get("timestamp", _utcnow_iso())}
        self._append_history(event)

    def _append_history(self, event: dict[str, Any]) -> None:
        with self.history_file.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(event, ensure_ascii=False) + "\n")

    def read_history(self) -> list[dict[str, Any]]:
        """Le todos os eventos do historico (para testes/inspecao); arquivo pode nao existir."""
        if not self.history_file.exists():
            return []
        events = []
        for line in self.history_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            events.append(json.loads(line))
        return events
