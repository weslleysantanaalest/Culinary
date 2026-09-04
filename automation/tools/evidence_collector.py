"""Consolidacao de evidencias de uma minitask (comandos, arquivos, resultado)."""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any

from automation.tools.command_runner import CommandResult


@dataclass
class MinitaskEvidence:
    """Evidencia bruta coletada durante a execucao de uma minitask.

    Nao possui campo de "sucesso geral" implicito: `all_commands_succeeded`
    e calculado, nunca declarado manualmente, para impedir "sucesso" sem
    evidencia real de execucao.
    """

    minitask_id: str
    created_files: list[str] = field(default_factory=list)
    modified_files: list[str] = field(default_factory=list)
    command_results: list[CommandResult] = field(default_factory=list)

    @property
    def all_commands_succeeded(self) -> bool:
        if not self.command_results:
            return False
        return all(result.succeeded for result in self.command_results)

    @property
    def has_any_evidence(self) -> bool:
        return bool(self.created_files or self.modified_files or self.command_results)

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["all_commands_succeeded"] = self.all_commands_succeeded
        data["has_any_evidence"] = self.has_any_evidence
        return data

    def summarize(self) -> str:
        """Resumo textual curto, usado no registro de journal/documenter."""
        lines = [f"Minitask: {self.minitask_id}"]
        if self.created_files:
            lines.append(f"Arquivos criados: {', '.join(self.created_files)}")
        if self.modified_files:
            lines.append(f"Arquivos alterados: {', '.join(self.modified_files)}")
        for result in self.command_results:
            status = "OK" if result.succeeded else f"FALHOU (exit={result.exit_code})"
            lines.append(f"Comando: {result.command} -> {status}")
        lines.append(
            "Status agregado: "
            + ("todas as validacoes passaram" if self.all_commands_succeeded else "sem evidencia suficiente de sucesso")
        )
        return "\n".join(lines)
