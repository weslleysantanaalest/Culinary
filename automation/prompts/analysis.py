"""Templates para o Project Analyzer: analise do projeto e extracao de requisitos."""
from __future__ import annotations

from langchain_core.prompts import PromptTemplate

from automation.prompts.base import build_prompt_template

PROJECT_ANALYSIS_TEMPLATE = build_prompt_template(
    template="""\
Voce e o Project Analyzer da automacao do projeto Culinary.

Contexto do projeto:
{contexto_projeto}

Arquivos relevantes inspecionados:
{arquivos_relevantes}

Estado anterior conhecido (journal):
{estado_anterior}

Tarefa: produza um resumo factual do estado atual do projeto, cobrindo:
1. Stack e estrutura detectada.
2. Telas/funcionalidades ja implementadas versus apenas prototipadas.
3. Divergencias entre protótipos, codigo e journal.
4. Lacunas de informacao que impedem avancar com seguranca.

Nao proponha solucao nesta etapa. Apenas descreva o que existe.
""",
    required_variables=["contexto_projeto", "arquivos_relevantes", "estado_anterior"],
)


REQUIREMENT_EXTRACTION_TEMPLATE = build_prompt_template(
    template="""\
Voce e o Project Analyzer extraindo requisitos observaveis.

Fonte de evidencia (protótipos/codigo):
{arquivos_relevantes}

Requisitos ja confirmados anteriormente (nao repita, apenas referencie por id):
{requisitos_confirmados}

Tarefa: liste apenas requisitos que sao diretamente observaveis na fonte de
evidencia acima. Numere cada requisito novo como RF-XXX (continuando a partir
do maior numero em requisitos_confirmados). Para cada requisito, cite o
arquivo/trecho que o evidencia.

Se um comportamento parecer necessario mas nao estiver na evidencia, liste-o
em uma secao separada "Possiveis requisitos nao confirmados" — nunca misture
com a lista de requisitos confirmados.
""",
    required_variables=["arquivos_relevantes", "requisitos_confirmados"],
)


def render_project_analysis(
    *, contexto_projeto: str, arquivos_relevantes: str, estado_anterior: str
) -> str:
    return PROJECT_ANALYSIS_TEMPLATE.format(
        contexto_projeto=contexto_projeto,
        arquivos_relevantes=arquivos_relevantes,
        estado_anterior=estado_anterior,
    )


def render_requirement_extraction(
    *, arquivos_relevantes: str, requisitos_confirmados: str
) -> str:
    return REQUIREMENT_EXTRACTION_TEMPLATE.format(
        arquivos_relevantes=arquivos_relevantes,
        requisitos_confirmados=requisitos_confirmados,
    )
