"""Configuracao central da automacao.

Le variaveis de ambiente com fail-fast: se uma chave de LLM obrigatoria para
rodar a Crew de verdade nao estiver presente, os modulos que dependem de LLM
devem falhar de forma explicita ao serem usados (nao ao importar o pacote).
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

AUTOMATION_ROOT = Path(__file__).resolve().parent.parent
PROJECT_ROOT = AUTOMATION_ROOT.parent
JOURNAL_DIR = PROJECT_ROOT / ".kiro" / "project-journal"
STATE_DIR = AUTOMATION_ROOT / "state"
STATE_FILE = STATE_DIR / "current_state.json"
HISTORY_FILE = STATE_DIR / "execution_history.jsonl"
NOTION_SYNC_QUEUE_FILE = JOURNAL_DIR / "notion-sync-queue.jsonl"

# Comandos de validacao do projeto Next.js alvo (app em app_nextjs/culinary-app).
NEXT_APP_DIR_ENV = "CULINARY_NEXT_APP_DIR"
DEFAULT_NEXT_APP_DIRNAME = "culinary-app"


@dataclass(frozen=True)
class Settings:
    """Configuracao resolvida a partir do ambiente, com defaults explicitos."""

    project_root: Path = PROJECT_ROOT
    journal_dir: Path = JOURNAL_DIR
    state_dir: Path = STATE_DIR
    state_file: Path = STATE_FILE
    history_file: Path = HISTORY_FILE
    notion_sync_queue_file: Path = NOTION_SYNC_QUEUE_FILE
    next_app_dir: Path = field(
        default_factory=lambda: PROJECT_ROOT
        / os.environ.get(NEXT_APP_DIR_ENV, DEFAULT_NEXT_APP_DIRNAME)
    )
    openai_model: str = field(
        default_factory=lambda: os.environ.get("CULINARY_LLM_MODEL", "gpt-4o-mini")
    )
    llm_api_key_present: bool = field(
        default_factory=lambda: bool(os.environ.get("OPENAI_API_KEY"))
    )
    max_minitasks_per_run: int = field(
        default_factory=lambda: int(os.environ.get("CULINARY_MAX_MINITASKS", "1"))
    )

    def ensure_dirs(self) -> None:
        self.state_dir.mkdir(parents=True, exist_ok=True)
        self.journal_dir.mkdir(parents=True, exist_ok=True)
        (self.journal_dir / "minitasks").mkdir(parents=True, exist_ok=True)


def get_settings() -> Settings:
    """Ponto unico de acesso as configuracoes (facilita mock em testes)."""
    return Settings()
