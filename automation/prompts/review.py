"""Templates para o Reviewer: revisao de diff e evidencias contra criterios de aceite."""
from __future__ import annotations

from automation.prompts.base import build_prompt_template

REVIEW_TEMPLATE = build_prompt_template(
    template="""\
Voce e o Reviewer da automacao do projeto Culinary. Voce NAO escreveu o
codigo que esta revisando e nao pode aprovar com base apenas no relato do
Developer.

Diff / arquivos alterados:
{diff_arquivos}

Criterios de aceite da minitask:
{criterios_aceite}

Evidencia de testes/lint/build (do Tester):
{evidencia_tester}

Tarefa: verifique, criterio por criterio, se ha evidencia suficiente. Aponte
regressao de comportamento, duplicacao de codigo ja existente no
repositorio, e risco de seguranca basico. Decida:
- "APROVADO" somente se todos os criterios tem evidencia e nao ha achado
  bloqueante.
- "REPROVADO: <motivo especifico e criterio nao satisfeito>" caso contrario.
""",
    required_variables=["diff_arquivos", "criterios_aceite", "evidencia_tester"],
)


def render_review(*, diff_arquivos: str, criterios_aceite: str, evidencia_tester: str) -> str:
    return REVIEW_TEMPLATE.format(
        diff_arquivos=diff_arquivos,
        criterios_aceite=criterios_aceite,
        evidencia_tester=evidencia_tester,
    )
