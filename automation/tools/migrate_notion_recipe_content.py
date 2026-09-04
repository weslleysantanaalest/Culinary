#!/usr/bin/env python3
"""Migrador de conteúdo corpo->propriedades das receitas no Notion (MT-019).

Lê o CORPO de cada página de receita (blocos), extrai as seções "Ingredientes"
e "Modo de preparo" e escreve o texto agregado nas propriedades homônimas
(`Ingredientes`, `Modo de preparo`) que hoje estão vazias.

Modos:
    --dry-run                    Classifica as 85 receitas e imprime o relatório
                                 (NÃO escreve nada no Notion).
    --recipe "<nome>" --apply    Migra uma receita específica, com readback.
    --apply-safe                 Migra em lote todas as SAFE_TO_MIGRATE, em
                                 pequenos lotes respeitando rate limit, com
                                 readback após cada escrita.

Segurança:
    - Token lido de culinary-app/.env.local (var NOTION_TOKEN) ou de os.environ.
      NUNCA é logado.
    - NUNCA imprime o conteúdo completo das receitas no terminal — apenas
      contagens e nomes de receitas com problema.
    - O corpo da página nunca é apagado; escreve apenas nas propriedades.

O núcleo do parser (`parse_sections`) é uma função pura, testada em
automation/tests/test_migrate_notion_recipe_content.py.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import unicodedata
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

# --------------------------------------------------------------------------- #
# Constantes de projeto
# --------------------------------------------------------------------------- #
PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_LOCAL = PROJECT_ROOT / "culinary-app" / ".env.local"
BACKUP_FILE = (
    PROJECT_ROOT / ".kiro" / "private-backups" / "notion-recipes-before-migration.json"
)

NOTION_VERSION = "2022-06-28"
NOTION_API = "https://api.notion.com/v1"

# Rótulos canônicos de seção (após normalização) -> chave interna.
SECTION_INGREDIENTES = "ingredientes"
SECTION_MODO_PREPARO = "modo_preparo"

# Variações aceitas (normalizadas) para cada seção.
INGREDIENTES_ALIASES = {"ingredientes", "ingrediente"}
MODO_PREPARO_ALIASES = {
    "modo de preparo",
    "modo do preparo",
    "modo de fazer",
    "preparo",
    "preparacao",
    "modo",
}

# Seções conhecidas que NÃO são conteúdo migrável (ignoradas com segurança).
IGNORABLE_SECTIONS = {"imagens originais", "imagem original", "imagens", "fonte", "notas"}

# Status de classificação.
STATUS_SAFE = "SAFE_TO_MIGRATE"
STATUS_ALREADY = "ALREADY_STRUCTURED"
STATUS_MANUAL = "MANUAL_REVIEW"
STATUS_ERROR = "ERROR"

# Rate limit: a API do Notion tolera ~3 req/s. Usamos folga.
RATE_LIMIT_SLEEP = 0.4
BATCH_SIZE = 10
BATCH_PAUSE = 1.0

# Limite de texto por propriedade rich_text no Notion (2000 chars por bloco).
NOTION_RICH_TEXT_LIMIT = 2000


# --------------------------------------------------------------------------- #
# Núcleo: função pura de parsing de seções
# --------------------------------------------------------------------------- #
@dataclass
class Block:
    """Bloco de texto normalizado, agnóstico à API do Notion.

    kind: "heading" para títulos de seção, "content" para linhas de conteúdo.
    text: texto puro já concatenado.
    """

    kind: str
    text: str


def _normalize_label(text: str) -> str:
    """Normaliza um rótulo de seção: minúsculas, sem acento, sem marcadores
    markdown (## / #), sem pontuação de borda e espaços colapsados."""
    t = text.strip()
    # remove marcadores markdown de heading no início
    while t.startswith("#"):
        t = t[1:]
    t = t.strip()
    # remove dois-pontos ao final ("Ingredientes:")
    t = t.rstrip(":").strip()
    # remove acentos
    t = "".join(
        c for c in unicodedata.normalize("NFKD", t) if not unicodedata.combining(c)
    )
    # minúsculas e colapsa espaços
    t = " ".join(t.lower().split())
    return t


def _classify_label(normalized: str) -> str | None:
    """Retorna a chave de seção interna para um rótulo normalizado, ou None."""
    if normalized in INGREDIENTES_ALIASES:
        return SECTION_INGREDIENTES
    if normalized in MODO_PREPARO_ALIASES:
        return SECTION_MODO_PREPARO
    return None


def parse_sections(blocks: list[Block]) -> dict[str, Any]:
    """Função PURA. Recebe blocos normalizados e retorna:

        {
          "ingredientes": str | None,   # conteúdo agregado (linhas por \n)
          "modo_preparo": str | None,
          "status": STATUS_*,
          "reasons": [str, ...],        # motivos quando MANUAL_REVIEW
        }

    Regras:
      - Deve existir EXATAMENTE uma seção Ingredientes e EXATAMENTE uma seção
        Modo de preparo, cada uma com conteúdo real -> SAFE_TO_MIGRATE.
      - Seção ausente, duplicada, vazia, ou ambígua -> MANUAL_REVIEW.
    """
    sections: dict[str, list[str]] = {}
    counts: dict[str, int] = {SECTION_INGREDIENTES: 0, SECTION_MODO_PREPARO: 0}
    current: str | None = None
    reasons: list[str] = []

    for block in blocks:
        if block.kind == "heading":
            key = _classify_label(_normalize_label(block.text))
            if key is not None:
                counts[key] += 1
                current = key
                # cada ocorrência acumula numa lista própria para detectar dup
                sections.setdefault(key, [])
            else:
                # heading de outra seção (ex: "Imagens originais") encerra a atual
                current = None
        elif block.kind == "content":
            text = block.text.strip()
            if current is not None and text:
                sections[current].append(text)

    # Detecta duplicidade
    if counts[SECTION_INGREDIENTES] > 1:
        reasons.append("seção Ingredientes duplicada")
    if counts[SECTION_MODO_PREPARO] > 1:
        reasons.append("seção Modo de preparo duplicada")

    # Detecta ausência
    if counts[SECTION_INGREDIENTES] == 0:
        reasons.append("seção Ingredientes ausente")
    if counts[SECTION_MODO_PREPARO] == 0:
        reasons.append("seção Modo de preparo ausente")

    ing_lines = sections.get(SECTION_INGREDIENTES, [])
    mod_lines = sections.get(SECTION_MODO_PREPARO, [])

    # Detecta conteúdo vazio (seção presente mas sem linhas)
    if counts[SECTION_INGREDIENTES] >= 1 and not ing_lines:
        reasons.append("seção Ingredientes sem conteúdo")
    if counts[SECTION_MODO_PREPARO] >= 1 and not mod_lines:
        reasons.append("seção Modo de preparo sem conteúdo")

    ingredientes = "\n".join(ing_lines) if ing_lines else None
    modo_preparo = "\n".join(mod_lines) if mod_lines else None

    if reasons:
        status = STATUS_MANUAL
    else:
        status = STATUS_SAFE

    return {
        "ingredientes": ingredientes,
        "modo_preparo": modo_preparo,
        "status": status,
        "reasons": reasons,
    }


# --------------------------------------------------------------------------- #
# Camada Notion (I/O)
# --------------------------------------------------------------------------- #
def load_token() -> str:
    """Lê NOTION_TOKEN de os.environ, senão de culinary-app/.env.local."""
    token = os.environ.get("NOTION_TOKEN")
    if token:
        return token.strip()
    if ENV_LOCAL.exists():
        for line in ENV_LOCAL.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("NOTION_TOKEN=") and not line.startswith("#"):
                return line.split("=", 1)[1].strip()
    raise SystemExit(
        "NOTION_TOKEN não encontrado (nem em os.environ nem em .env.local)."
    )


def _request(method: str, path: str, token: str, body: dict | None = None) -> dict:
    url = f"{NOTION_API}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Notion-Version", NOTION_VERSION)
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


def _page_id_from_url(url: str) -> str:
    """Extrai o id de página (32 hex) do final da URL."""
    tail = url.rstrip("/").split("/")[-1]
    # remove eventual sufixo depois de '?'
    tail = tail.split("?")[0]
    # o id é os últimos 32 chars hex
    hexchars = "".join(c for c in tail if c in "0123456789abcdef")
    return hexchars[-32:]


def _rich_text_of(block: dict) -> str:
    t = block.get("type", "")
    payload = block.get(t, {})
    rich = payload.get("rich_text", [])
    return "".join(x.get("plain_text", "") for x in rich)


def fetch_blocks(page_id: str, token: str) -> list[Block]:
    """Busca os filhos da página e converte para blocos normalizados.

    heading_1/2/3 -> Block(kind="heading"); demais tipos com texto ->
    Block(kind="content"). Segue paginação has_more.
    """
    normalized: list[Block] = []
    start_cursor: str | None = None
    while True:
        qs = "?page_size=100"
        if start_cursor:
            qs += f"&start_cursor={start_cursor}"
        data = _request("GET", f"/blocks/{page_id}/children{qs}", token)
        for b in data.get("results", []):
            btype = b.get("type", "")
            text = _rich_text_of(b)
            if btype in ("heading_1", "heading_2", "heading_3"):
                normalized.append(Block(kind="heading", text=text))
            elif text.strip():
                normalized.append(Block(kind="content", text=text))
        if data.get("has_more"):
            start_cursor = data.get("next_cursor")
            time.sleep(RATE_LIMIT_SLEEP)
        else:
            break
    return normalized


def _prop_plain_text(page: dict, prop_name: str) -> str:
    prop = page.get("properties", {}).get(prop_name, {})
    ptype = prop.get("type")
    if ptype in ("rich_text", "title"):
        return "".join(x.get("plain_text", "") for x in prop.get(ptype, []))
    return ""


def fetch_page(page_id: str, token: str) -> dict:
    return _request("GET", f"/pages/{page_id}", token)


def _chunk_rich_text(text: str) -> list[dict]:
    """Divide texto em blocos rich_text de <= 2000 chars (limite do Notion)."""
    chunks = []
    for i in range(0, len(text), NOTION_RICH_TEXT_LIMIT):
        piece = text[i : i + NOTION_RICH_TEXT_LIMIT]
        chunks.append({"type": "text", "text": {"content": piece}})
    return chunks or [{"type": "text", "text": {"content": ""}}]


def write_properties(
    page_id: str, token: str, ingredientes: str, modo_preparo: str
) -> dict:
    """Escreve as propriedades Ingredientes e Modo de preparo."""
    body = {
        "properties": {
            "Ingredientes": {"rich_text": _chunk_rich_text(ingredientes)},
            "Modo de preparo": {"rich_text": _chunk_rich_text(modo_preparo)},
        }
    }
    return _request("PATCH", f"/pages/{page_id}", token, body)


# --------------------------------------------------------------------------- #
# Orquestração
# --------------------------------------------------------------------------- #
@dataclass
class RecipeResult:
    receita: str
    page_id: str
    status: str
    has_ing: bool = False
    has_mod: bool = False
    dest_empty: bool = True  # propriedades de destino estão vazias?
    reasons: list[str] = field(default_factory=list)
    result_note: str = ""


def load_recipes() -> list[dict]:
    data = json.loads(BACKUP_FILE.read_text(encoding="utf-8"))
    return data["recipes"]


def classify_recipe(recipe: dict, token: str) -> RecipeResult:
    """Lê a página e classifica. NÃO escreve nada."""
    name = recipe["receita"]
    page_id = _page_id_from_url(recipe["url"])
    try:
        page = fetch_page(page_id, token)
        dest_ing = _prop_plain_text(page, "Ingredientes").strip()
        dest_mod = _prop_plain_text(page, "Modo de preparo").strip()
        dest_empty = not dest_ing and not dest_mod

        blocks = fetch_blocks(page_id, token)
        parsed = parse_sections(blocks)

        status = parsed["status"]
        # Se as propriedades de destino já têm conteúdo, é ALREADY_STRUCTURED.
        if not dest_empty:
            status = STATUS_ALREADY

        return RecipeResult(
            receita=name,
            page_id=page_id,
            status=status,
            has_ing=bool(parsed["ingredientes"]),
            has_mod=bool(parsed["modo_preparo"]),
            dest_empty=dest_empty,
            reasons=list(parsed["reasons"]),
        )
    except urllib.error.HTTPError as exc:
        return RecipeResult(
            receita=name,
            page_id=page_id,
            status=STATUS_ERROR,
            reasons=[f"HTTP {exc.code}"],
        )
    except Exception as exc:  # noqa: BLE001 - registrar tipo sem conteúdo
        return RecipeResult(
            receita=name,
            page_id=page_id,
            status=STATUS_ERROR,
            reasons=[type(exc).__name__],
        )


def audit_all(token: str) -> list[RecipeResult]:
    recipes = load_recipes()
    results: list[RecipeResult] = []
    for i, recipe in enumerate(recipes):
        results.append(classify_recipe(recipe, token))
        time.sleep(RATE_LIMIT_SLEEP)
        if (i + 1) % BATCH_SIZE == 0:
            time.sleep(BATCH_PAUSE)
    return results


# --------------------------------------------------------------------------- #
# Relatório
# --------------------------------------------------------------------------- #
def _truncate(text: str, width: int) -> str:
    return text if len(text) <= width else text[: width - 1] + "…"


def print_report(results: list[RecipeResult]) -> None:
    header = f"{'Receita':38} | {'Ingr':4} | {'Modo':4} | {'DestVazio':9} | Resultado"
    print(header)
    print("-" * len(header))
    for r in results:
        ing = "sim" if r.has_ing else "não"
        mod = "sim" if r.has_mod else "não"
        dest = "sim" if r.dest_empty else "NÃO"
        note = r.status
        if r.reasons:
            note += " (" + "; ".join(r.reasons) + ")"
        print(f"{_truncate(r.receita, 38):38} | {ing:4} | {mod:4} | {dest:9} | {note}")

    counts: dict[str, int] = {}
    for r in results:
        counts[r.status] = counts.get(r.status, 0) + 1
    print("\nContagens por categoria:")
    for status in (STATUS_SAFE, STATUS_ALREADY, STATUS_MANUAL, STATUS_ERROR):
        print(f"  {status:18}: {counts.get(status, 0)}")
    print(f"  {'TOTAL':18}: {len(results)}")


# --------------------------------------------------------------------------- #
# Aplicação (escrita)
# --------------------------------------------------------------------------- #
def _readback_ok(page_id: str, token: str, ingredientes: str, modo_preparo: str) -> bool:
    """Confirma via re-leitura que as propriedades foram gravadas.

    Compara início do texto (o Notion pode normalizar), tolerando truncamento
    por chunk. Retorna True se ambas as propriedades ficaram não vazias e o
    prefixo confere.
    """
    page = fetch_page(page_id, token)
    got_ing = _prop_plain_text(page, "Ingredientes").strip()
    got_mod = _prop_plain_text(page, "Modo de preparo").strip()
    if not got_ing or not got_mod:
        return False
    return got_ing.startswith(ingredientes[:50].strip()) and got_mod.startswith(
        modo_preparo[:50].strip()
    )


def apply_recipe(recipe: dict, token: str) -> str:
    """Migra uma receita específica com readback. Retorna nota de resultado."""
    name = recipe["receita"]
    page_id = _page_id_from_url(recipe["url"])
    page = fetch_page(page_id, token)
    dest_empty = not _prop_plain_text(page, "Ingredientes").strip() and not (
        _prop_plain_text(page, "Modo de preparo").strip()
    )
    if not dest_empty:
        return f"IGNORADA (já estruturada): {name}"

    blocks = fetch_blocks(page_id, token)
    parsed = parse_sections(blocks)
    if parsed["status"] != STATUS_SAFE:
        return f"BLOQUEADA (não é SAFE): {name} — {'; '.join(parsed['reasons'])}"

    write_properties(page_id, token, parsed["ingredientes"], parsed["modo_preparo"])
    time.sleep(RATE_LIMIT_SLEEP)
    ok = _readback_ok(page_id, token, parsed["ingredientes"], parsed["modo_preparo"])
    return f"{'OK' if ok else 'FALHA READBACK'}: {name}"


def apply_safe(token: str) -> None:
    """Migra em lote todas as SAFE_TO_MIGRATE, com readback após cada escrita."""
    recipes = load_recipes()
    migrated = 0
    skipped = 0
    failed = 0
    for i, recipe in enumerate(recipes):
        res = classify_recipe(recipe, token)
        if res.status != STATUS_SAFE:
            skipped += 1
        else:
            note = apply_recipe(recipe, token)
            if note.startswith("OK"):
                migrated += 1
            else:
                failed += 1
                print(note)  # só nomes com problema
        time.sleep(RATE_LIMIT_SLEEP)
        if (i + 1) % BATCH_SIZE == 0:
            time.sleep(BATCH_PAUSE)
    print("\nApply-safe concluído:")
    print(f"  migradas (OK): {migrated}")
    print(f"  puladas (não SAFE / já estruturada): {skipped}")
    print(f"  falhas: {failed}")


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Só audita/classifica.")
    parser.add_argument("--recipe", type=str, help="Nome exato da receita a migrar.")
    parser.add_argument("--apply", action="store_true", help="Aplica a migração.")
    parser.add_argument(
        "--apply-safe", action="store_true", help="Migra todas as SAFE_TO_MIGRATE."
    )
    args = parser.parse_args(argv)

    if not (args.dry_run or args.apply_safe or (args.recipe and args.apply)):
        parser.error(
            "Escolha um modo: --dry-run | --recipe '<nome>' --apply | --apply-safe"
        )

    token = load_token()

    if args.dry_run:
        results = audit_all(token)
        print_report(results)
        return 0

    if args.recipe and args.apply:
        recipes = load_recipes()
        match = [r for r in recipes if r["receita"] == args.recipe]
        if not match:
            print(f"Receita não encontrada: {args.recipe}")
            return 1
        print(apply_recipe(match[0], token))
        return 0

    if args.apply_safe:
        apply_safe(token)
        return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
