"""Testes do parser puro de seções do migrador de receitas (MT-019).

Cobre: caso feliz, seção ausente, seção duplicada, conteúdo vazio, além de
variações seguras de rótulo e a função de normalização.
"""
from __future__ import annotations

from automation.tools.migrate_notion_recipe_content import (
    STATUS_MANUAL,
    STATUS_SAFE,
    Block,
    _normalize_label,
    parse_sections,
)


def _blocks(*pairs: tuple[str, str]) -> list[Block]:
    """Helper: pares (kind, text) -> lista de Block."""
    return [Block(kind=k, text=t) for k, t in pairs]


# --------------------------------------------------------------------------- #
# Caso feliz
# --------------------------------------------------------------------------- #
def test_caso_feliz():
    blocks = _blocks(
        ("heading", "Ingredientes"),
        ("content", "1 coco ralado"),
        ("content", "Açúcar"),
        ("heading", "Modo de preparo"),
        ("content", "Levar ao fogo"),
        ("content", "Assar"),
        ("heading", "Imagens originais"),
        ("content", "IMG_0883.HEIC"),
    )
    result = parse_sections(blocks)
    assert result["status"] == STATUS_SAFE
    assert result["ingredientes"] == "1 coco ralado\nAçúcar"
    assert result["modo_preparo"] == "Levar ao fogo\nAssar"
    assert result["reasons"] == []


def test_caso_feliz_variacoes_de_rotulo():
    # "## INGREDIENTES:" e "Modo de Fazer" com acento/caixa/marcador variados
    blocks = _blocks(
        ("heading", "## INGREDIENTES:"),
        ("content", "farinha"),
        ("heading", "Modo de Fazer"),
        ("content", "misturar tudo"),
    )
    result = parse_sections(blocks)
    assert result["status"] == STATUS_SAFE
    assert result["ingredientes"] == "farinha"
    assert result["modo_preparo"] == "misturar tudo"


# --------------------------------------------------------------------------- #
# Seção ausente
# --------------------------------------------------------------------------- #
def test_secao_modo_preparo_ausente():
    blocks = _blocks(
        ("heading", "Ingredientes"),
        ("content", "farinha"),
    )
    result = parse_sections(blocks)
    assert result["status"] == STATUS_MANUAL
    assert "seção Modo de preparo ausente" in result["reasons"]
    assert result["ingredientes"] == "farinha"
    assert result["modo_preparo"] is None


def test_secao_ingredientes_ausente():
    blocks = _blocks(
        ("heading", "Modo de preparo"),
        ("content", "misturar"),
    )
    result = parse_sections(blocks)
    assert result["status"] == STATUS_MANUAL
    assert "seção Ingredientes ausente" in result["reasons"]


def test_ambas_ausentes():
    blocks = _blocks(("content", "texto solto sem heading"))
    result = parse_sections(blocks)
    assert result["status"] == STATUS_MANUAL
    assert "seção Ingredientes ausente" in result["reasons"]
    assert "seção Modo de preparo ausente" in result["reasons"]


# --------------------------------------------------------------------------- #
# Seção duplicada
# --------------------------------------------------------------------------- #
def test_secao_ingredientes_duplicada():
    blocks = _blocks(
        ("heading", "Ingredientes"),
        ("content", "farinha"),
        ("heading", "Ingredientes"),
        ("content", "açúcar"),
        ("heading", "Modo de preparo"),
        ("content", "misturar"),
    )
    result = parse_sections(blocks)
    assert result["status"] == STATUS_MANUAL
    assert "seção Ingredientes duplicada" in result["reasons"]


def test_secao_modo_preparo_duplicada():
    blocks = _blocks(
        ("heading", "Ingredientes"),
        ("content", "farinha"),
        ("heading", "Modo de preparo"),
        ("content", "misturar"),
        ("heading", "Modo de preparo"),
        ("content", "assar"),
    )
    result = parse_sections(blocks)
    assert result["status"] == STATUS_MANUAL
    assert "seção Modo de preparo duplicada" in result["reasons"]


# --------------------------------------------------------------------------- #
# Conteúdo vazio
# --------------------------------------------------------------------------- #
def test_conteudo_vazio_ingredientes():
    blocks = _blocks(
        ("heading", "Ingredientes"),
        ("heading", "Modo de preparo"),
        ("content", "misturar"),
    )
    result = parse_sections(blocks)
    assert result["status"] == STATUS_MANUAL
    assert "seção Ingredientes sem conteúdo" in result["reasons"]


def test_conteudo_vazio_ambas():
    blocks = _blocks(
        ("heading", "Ingredientes"),
        ("heading", "Modo de preparo"),
    )
    result = parse_sections(blocks)
    assert result["status"] == STATUS_MANUAL
    assert "seção Ingredientes sem conteúdo" in result["reasons"]
    assert "seção Modo de preparo sem conteúdo" in result["reasons"]


def test_content_apenas_espacos_conta_como_vazio():
    blocks = _blocks(
        ("heading", "Ingredientes"),
        ("content", "   "),
        ("heading", "Modo de preparo"),
        ("content", "misturar"),
    )
    result = parse_sections(blocks)
    assert result["status"] == STATUS_MANUAL
    assert "seção Ingredientes sem conteúdo" in result["reasons"]


# --------------------------------------------------------------------------- #
# Normalização de rótulo
# --------------------------------------------------------------------------- #
def test_normalize_label():
    assert _normalize_label("## Ingredientes") == "ingredientes"
    assert _normalize_label("INGREDIENTES:") == "ingredientes"
    assert _normalize_label("  Modo de Preparo  ") == "modo de preparo"
    assert _normalize_label("Preparação") == "preparacao"
    assert _normalize_label("# Modo de Fazer") == "modo de fazer"
