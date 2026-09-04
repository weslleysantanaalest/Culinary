"""Infra comum para os PromptTemplates da automacao.

Define o vocabulario obrigatorio (Fato / Indicio / Proposta / Decisao
pendente / Bloqueio) que todo prompt de agente deve reforcar, e uma funcao
de validacao que impede a criacao de um PromptTemplate sem as variaveis
minimas exigidas para aquele papel.
"""
from __future__ import annotations

from langchain_core.prompts import PromptTemplate

EPISTEMIC_RULES = """\
Ao redigir sua resposta, separe explicitamente:
- Fato: algo observado diretamente no codigo, no journal ou na saida de um comando executado.
- Indicio: algo sugerido pela evidencia mas nao confirmado (ex.: padrao repetido, comentario).
- Proposta: uma sugestao sua de acao ou mudanca, ainda nao decidida.
- Decisao pendente: algo que precisa de decisao humana ou de outro agente antes de prosseguir.
- Bloqueio: algo que impede a minitask atual de avancar agora.

NUNCA apresente uma Proposta como se fosse um Fato ou um requisito confirmado.
Se nao houver evidencia para uma secao, escreva "Nenhum(a) identificado(a)."
"""


class PromptVariableError(ValueError):
    """Levantado quando um PromptTemplate e construido sem variavel obrigatoria."""


def build_prompt_template(
    template: str,
    required_variables: list[str],
    *,
    prepend_epistemic_rules: bool = True,
) -> PromptTemplate:
    """Constroi um PromptTemplate validando que todas as variaveis citadas
    no `template` estao em `required_variables` (e vice-versa), evitando
    prompts incompletos silenciosos.
    """
    full_template = f"{EPISTEMIC_RULES}\n\n{template}" if prepend_epistemic_rules else template

    prompt = PromptTemplate(
        template=full_template,
        input_variables=required_variables,
        validate_template=True,
    )

    missing_in_template = set(required_variables) - set(prompt.input_variables)
    if missing_in_template:
        raise PromptVariableError(
            f"Variaveis declaradas mas ausentes do template: {missing_in_template}"
        )

    return prompt
