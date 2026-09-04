"""Templates para Planner e Developer: planejamento de minitask e implementacao."""
from __future__ import annotations

from automation.prompts.base import build_prompt_template

MINITASK_PLANNING_TEMPLATE = build_prompt_template(
    template="""\
Voce e o Planner da automacao do projeto Culinary.

Objetivo geral:
{objetivo_geral}

Requisitos confirmados disponiveis:
{requisitos_confirmados}

Backlog atual:
{backlog_atual}

Estado anterior (ultima minitask concluida e pendencias):
{estado_anterior}

Bloqueios conhecidos:
{bloqueios_conhecidos}

Tarefa: escolha a PROXIMA minitask, unica, pequena e segura. Ela deve:
- Ser executavel sem depender de decisao humana ou credencial ausente.
- Ter criterios de aceite verificaveis por teste, lint, build ou evidencia de arquivo.
- Nao repetir trabalho ja concluido em estado_anterior.

Formato de saida: id da minitask, objetivo em uma frase, criterios de aceite
(lista), arquivos provavelmente afetados.
""",
    required_variables=[
        "objetivo_geral",
        "requisitos_confirmados",
        "backlog_atual",
        "estado_anterior",
        "bloqueios_conhecidos",
    ],
)


IMPLEMENTATION_TEMPLATE = build_prompt_template(
    template="""\
Voce e o Developer da automacao do projeto Culinary.

Minitask atual:
{minitask_atual}

Criterios de aceite:
{criterios_aceite}

Arquivos relevantes (conteudo ou caminho):
{arquivos_relevantes}

Convencoes do repositorio a seguir:
{convencoes_repositorio}

Tarefa: implemente a menor mudanca possivel que satisfaca os criterios de
aceite, preservando o comportamento existente. Nao execute nenhuma acao
destrutiva ou externa (push, deploy, delete em massa) sem autorizacao
explicita registrada em decisao_pendente.

Formato de saida: lista de arquivos criados/alterados, com uma linha de
justificativa por arquivo referenciando o criterio de aceite atendido.
""",
    required_variables=[
        "minitask_atual",
        "criterios_aceite",
        "arquivos_relevantes",
        "convencoes_repositorio",
    ],
)


def render_minitask_planning(
    *,
    objetivo_geral: str,
    requisitos_confirmados: str,
    backlog_atual: str,
    estado_anterior: str,
    bloqueios_conhecidos: str,
) -> str:
    return MINITASK_PLANNING_TEMPLATE.format(
        objetivo_geral=objetivo_geral,
        requisitos_confirmados=requisitos_confirmados,
        backlog_atual=backlog_atual,
        estado_anterior=estado_anterior,
        bloqueios_conhecidos=bloqueios_conhecidos,
    )


def render_implementation(
    *,
    minitask_atual: str,
    criterios_aceite: str,
    arquivos_relevantes: str,
    convencoes_repositorio: str,
) -> str:
    return IMPLEMENTATION_TEMPLATE.format(
        minitask_atual=minitask_atual,
        criterios_aceite=criterios_aceite,
        arquivos_relevantes=arquivos_relevantes,
        convencoes_repositorio=convencoes_repositorio,
    )
