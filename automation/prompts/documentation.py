"""Templates para o Documenter: registro de minitask e retomada a partir do ultimo estado."""
from __future__ import annotations

from automation.prompts.base import build_prompt_template

MINITASK_DOCUMENTATION_TEMPLATE = build_prompt_template(
    template="""\
Voce e o Documenter da automacao do projeto Culinary. Registre SOMENTE o que
foi executado e comprovado nesta execucao — nunca o que foi planejado.

Minitask:
{minitask_atual}

Arquivos criados/alterados (do Developer):
{arquivos_alterados}

Comandos executados e resultado (do Tester):
{comandos_e_resultado}

Decisao do Reviewer:
{decisao_reviewer}

Evidencias disponiveis:
{evidencias_disponiveis}

Tarefa: produza o conteudo Markdown da minitask no formato:
Status (concluida/parcial/bloqueada), Data/hora, Objetivo, Arquivos criados,
Arquivos alterados, Resumo da implementacao, Decisoes tecnicas, Comandos
executados, Testes executados, Resultado, Evidencias, Pendencias, Proxima
minitask recomendada.

Se a decisao do Reviewer foi "REPROVADO", o Status deve ser "parcial" ou
"bloqueada", nunca "concluida".
""",
    required_variables=[
        "minitask_atual",
        "arquivos_alterados",
        "comandos_e_resultado",
        "decisao_reviewer",
        "evidencias_disponiveis",
    ],
)


RESUME_FROM_STATE_TEMPLATE = build_prompt_template(
    template="""\
Voce esta retomando a automacao do projeto Culinary a partir de um estado
persistido.

Estado anterior (JSON ou resumo):
{estado_anterior}

Proxima acao registrada no estado:
{proxima_acao}

Mudancas detectadas no projeto desde o ultimo estado (se houver):
{mudancas_detectadas}

Tarefa: confirme se a proxima_acao ainda e valida dado mudancas_detectadas.
Se o codigo ja satisfaz os criterios de aceite da proxima_acao, marque como
"ja satisfeita, replanejar" em vez de repetir o trabalho. Caso contrario,
confirme "retomar proxima_acao como esta".
""",
    required_variables=["estado_anterior", "proxima_acao", "mudancas_detectadas"],
)


def render_minitask_documentation(
    *,
    minitask_atual: str,
    arquivos_alterados: str,
    comandos_e_resultado: str,
    decisao_reviewer: str,
    evidencias_disponiveis: str,
) -> str:
    return MINITASK_DOCUMENTATION_TEMPLATE.format(
        minitask_atual=minitask_atual,
        arquivos_alterados=arquivos_alterados,
        comandos_e_resultado=comandos_e_resultado,
        decisao_reviewer=decisao_reviewer,
        evidencias_disponiveis=evidencias_disponiveis,
    )


def render_resume_from_state(
    *, estado_anterior: str, proxima_acao: str, mudancas_detectadas: str
) -> str:
    return RESUME_FROM_STATE_TEMPLATE.format(
        estado_anterior=estado_anterior,
        proxima_acao=proxima_acao,
        mudancas_detectadas=mudancas_detectadas,
    )
