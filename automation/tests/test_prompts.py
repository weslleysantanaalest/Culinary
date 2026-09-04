"""Testes dos PromptTemplates: variaveis obrigatorias e regras epistemicas."""
from __future__ import annotations

import pytest

from automation.prompts.analysis import render_project_analysis, render_requirement_extraction
from automation.prompts.base import EPISTEMIC_RULES, PromptVariableError, build_prompt_template
from automation.prompts.development import render_implementation, render_minitask_planning
from automation.prompts.documentation import (
    render_minitask_documentation,
    render_resume_from_state,
)
from automation.prompts.review import render_review
from automation.prompts.testing import render_validation


def test_build_prompt_template_rejects_missing_variable_in_template() -> None:
    with pytest.raises(PromptVariableError):
        build_prompt_template(
            template="Isso nao usa a variavel declarada.",
            required_variables=["variavel_obrigatoria"],
        )


def test_build_prompt_template_prepends_epistemic_rules_by_default() -> None:
    template = build_prompt_template(
        template="Use {x} aqui.",
        required_variables=["x"],
    )
    rendered = template.format(x="valor")
    assert "Fato:" in rendered
    assert "Proposta:" in rendered
    assert "valor" in rendered


def test_epistemic_rules_cover_all_five_categories() -> None:
    for category in ("Fato", "Indicio", "Proposta", "Decisao pendente", "Bloqueio"):
        assert category in EPISTEMIC_RULES


def test_render_project_analysis_requires_all_variables() -> None:
    output = render_project_analysis(
        contexto_projeto="Culinary é um app de receitas.",
        arquivos_relevantes="stitch_culin_ria_minimalista_parallax/receitas_desktop/code.html",
        estado_anterior="Nenhuma minitask concluida ainda.",
    )
    assert "Culinary é um app de receitas." in output
    assert "receitas_desktop/code.html" in output


def test_render_requirement_extraction() -> None:
    output = render_requirement_extraction(
        arquivos_relevantes="code.html com grid de receitas",
        requisitos_confirmados="RF-001 a RF-047 ja extraidos",
    )
    assert "RF-001 a RF-047" in output


def test_render_minitask_planning() -> None:
    output = render_minitask_planning(
        objetivo_geral="Transformar prototipos em app Next.js",
        requisitos_confirmados="RF-010 a RF-014 (tela Receitas)",
        backlog_atual="MT-007 pendente",
        estado_anterior="MT-006 concluida",
        bloqueios_conhecidos="nenhum",
    )
    assert "MT-007 pendente" in output


def test_render_implementation() -> None:
    output = render_implementation(
        minitask_atual="MT-007: implementar tela de Receitas",
        criterios_aceite="grid renderiza 6 cards mockados",
        arquivos_relevantes="src/app/receitas/page.tsx (novo)",
        convencoes_repositorio="Tailwind v4, App Router, Server Components por padrao",
    )
    assert "MT-007" in output
    assert "Tailwind v4" in output


def test_render_validation() -> None:
    output = render_validation(
        mudanca_resumo="Criada pagina /receitas",
        criterios_aceite="build sem erros",
        comandos_disponiveis="npm run build",
        evidencias_disponiveis="nenhuma ainda",
    )
    assert "npm run build" in output


def test_render_review() -> None:
    output = render_review(
        diff_arquivos="src/app/receitas/page.tsx criado",
        criterios_aceite="grid com 6 cards",
        evidencia_tester="build OK, exit 0",
    )
    assert "APROVADO" in output
    assert "REPROVADO" in output


def test_render_minitask_documentation() -> None:
    output = render_minitask_documentation(
        minitask_atual="MT-007",
        arquivos_alterados="src/app/receitas/page.tsx",
        comandos_e_resultado="npm run build -> exit 0",
        decisao_reviewer="APROVADO",
        evidencias_disponiveis="log de build anexado",
    )
    assert "concluida" in output or "parcial" in output or "bloqueada" in output


def test_render_resume_from_state() -> None:
    output = render_resume_from_state(
        estado_anterior='{"next_action": "MT-008"}',
        proxima_acao="MT-008",
        mudancas_detectadas="nenhuma",
    )
    assert "MT-008" in output
