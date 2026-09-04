"""Leitura de arquivos do projeto (protótipos, codigo, journal) para os agentes.

Escopo restrito ao PROJECT_ROOT para impedir leitura fora do projeto Culinary.
"""
from __future__ import annotations

from pathlib import Path


class OutsideProjectError(ValueError):
    """Levantado quando o caminho solicitado esta fora do project_root."""


def read_text_file(path: Path, *, project_root: Path, max_chars: int = 20_000) -> str:
    """Le um arquivo de texto dentro de project_root, truncando se muito grande."""
    resolved = path.resolve()
    root_resolved = project_root.resolve()
    if root_resolved not in resolved.parents and resolved != root_resolved:
        raise OutsideProjectError(f"Caminho '{resolved}' esta fora de '{root_resolved}'.")

    if not resolved.exists():
        raise FileNotFoundError(str(resolved))

    content = resolved.read_text(encoding="utf-8", errors="replace")
    if len(content) > max_chars:
        return content[:max_chars] + f"\n... [truncado, {len(content) - max_chars} chars omitidos]"
    return content


def list_files(directory: Path, *, project_root: Path, pattern: str = "**/*") -> list[Path]:
    """Lista arquivos dentro de project_root/directory que casam com `pattern`."""
    resolved = directory.resolve()
    root_resolved = project_root.resolve()
    if root_resolved not in resolved.parents and resolved != root_resolved:
        raise OutsideProjectError(f"Caminho '{resolved}' esta fora de '{root_resolved}'.")

    if not resolved.exists():
        return []
    return sorted(p for p in resolved.glob(pattern) if p.is_file())
