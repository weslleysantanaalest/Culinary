"""Fila local de sincronizacao com o Notion (fallback enquanto o MCP nao existir).

Nunca declara uma sincronizacao que nao ocorreu: `mark_synced` so deve ser
chamado por quem efetivamente confirmou a escrita via Notion MCP.
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


@dataclass
class NotionSyncItem:
    title: str
    parent_page: str
    content: str
    evidence: str
    created_at: str
    synced: bool = False
    synced_at: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class NotionSyncQueue:
    """Fila append-only em JSONL de itens pendentes de sincronizacao com o Notion."""

    def __init__(self, queue_file: Path) -> None:
        self.queue_file = Path(queue_file)
        self.queue_file.parent.mkdir(parents=True, exist_ok=True)

    def enqueue(
        self, *, title: str, parent_page: str, content: str, evidence: str
    ) -> NotionSyncItem:
        item = NotionSyncItem(
            title=title,
            parent_page=parent_page,
            content=content,
            evidence=evidence,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        with self.queue_file.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(item.to_dict(), ensure_ascii=False) + "\n")
        return item

    def read_all(self) -> list[dict[str, Any]]:
        if not self.queue_file.exists():
            return []
        items = []
        for line in self.queue_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            items.append(json.loads(line))
        return items

    def pending(self) -> list[dict[str, Any]]:
        return [item for item in self.read_all() if not item.get("synced")]

    def mark_synced(self, title: str) -> bool:
        """Marca o(s) item(ns) com `title` como sincronizados, reescrevendo o arquivo.

        Retorna True se algum item foi atualizado. Deve ser chamado apenas
        depois de uma confirmacao real de escrita via Notion MCP.
        """
        items = self.read_all()
        updated = False
        now = datetime.now(timezone.utc).isoformat()
        for item in items:
            if item["title"] == title and not item.get("synced"):
                item["synced"] = True
                item["synced_at"] = now
                updated = True

        if updated:
            with self.queue_file.open("w", encoding="utf-8") as fh:
                for item in items:
                    fh.write(json.dumps(item, ensure_ascii=False) + "\n")
        return updated
