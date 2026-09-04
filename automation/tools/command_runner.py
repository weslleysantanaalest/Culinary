"""Execucao de comandos de validacao (lint/test/build) com captura de evidencia bruta.

Regra de seguranca: so executa comandos de uma allowlist explicita — o
Developer/Tester nao podem injetar comandos arbitrarios (ex.: rm -rf, git push).
"""
from __future__ import annotations

import shlex
import subprocess
from dataclasses import asdict, dataclass
from pathlib import Path

ALLOWED_COMMANDS: frozenset[str] = frozenset(
    {
        "npm",
        "npx",
        "node",
        "python",
        "python3",
        "pytest",
        "ruff",
        "pip",
    }
)

DENYLIST_SUBSTRINGS: tuple[str, ...] = (
    "rm -rf",
    "git push",
    "git reset --hard",
    "git clean -f",
    "--force",
    ":(){ :",
)


class DisallowedCommandError(ValueError):
    """Levantado quando o comando solicitado nao esta na allowlist ou bate no denylist."""


@dataclass
class CommandResult:
    command: str
    exit_code: int
    stdout: str
    stderr: str
    cwd: str

    def to_dict(self) -> dict:
        return asdict(self)

    @property
    def succeeded(self) -> bool:
        return self.exit_code == 0


def run_validation_command(
    command: str, *, cwd: Path, timeout_seconds: int = 300
) -> CommandResult:
    """Executa um comando de validacao (lint/test/build) e retorna evidencia bruta.

    Levanta DisallowedCommandError sem executar nada se o comando nao estiver
    na allowlist ou contiver um padrao do denylist — falha explicita e auditavel.
    """
    lowered = command.lower()
    for banned in DENYLIST_SUBSTRINGS:
        if banned in lowered:
            raise DisallowedCommandError(f"Comando contem padrao proibido: '{banned}'")

    tokens = shlex.split(command)
    if not tokens:
        raise DisallowedCommandError("Comando vazio.")

    binary = tokens[0]
    if binary not in ALLOWED_COMMANDS:
        raise DisallowedCommandError(
            f"Comando '{binary}' nao esta na allowlist {sorted(ALLOWED_COMMANDS)}."
        )

    completed = subprocess.run(
        tokens,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        timeout=timeout_seconds,
        check=False,
    )
    return CommandResult(
        command=command,
        exit_code=completed.returncode,
        stdout=completed.stdout,
        stderr=completed.stderr,
        cwd=str(cwd),
    )
