"""Templates para o Tester: validacao de lint/testes/build."""
from __future__ import annotations

from automation.prompts.base import build_prompt_template

VALIDATION_TEMPLATE = build_prompt_template(
    template="""\
Voce e o Tester da automacao do projeto Culinary.

Mudanca a validar (resumo do Developer):
{mudanca_resumo}

Criterios de aceite a verificar:
{criterios_aceite}

Comandos disponiveis para validacao (lint/test/build):
{comandos_disponiveis}

Evidencias ja coletadas nesta execucao (stdout/stderr/exit code):
{evidencias_disponiveis}

Tarefa: para cada criterio de aceite, determine se ha evidencia de comando
executado que o comprove. NAO infira sucesso sem uma evidencia de execucao
associada. Se faltar evidencia para um criterio, marque-o como
"sem evidencia" e liste o comando que precisa ser executado para gera-la.

Formato de saida: tabela criterio -> evidencia (comando + exit code) ou
"sem evidencia" + comando pendente.
""",
    required_variables=[
        "mudanca_resumo",
        "criterios_aceite",
        "comandos_disponiveis",
        "evidencias_disponiveis",
    ],
)


def render_validation(
    *,
    mudanca_resumo: str,
    criterios_aceite: str,
    comandos_disponiveis: str,
    evidencias_disponiveis: str,
) -> str:
    return VALIDATION_TEMPLATE.format(
        mudanca_resumo=mudanca_resumo,
        criterios_aceite=criterios_aceite,
        comandos_disponiveis=comandos_disponiveis,
        evidencias_disponiveis=evidencias_disponiveis,
    )
