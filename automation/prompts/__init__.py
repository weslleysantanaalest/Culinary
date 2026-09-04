"""PromptTemplates (langchain_core.prompts) usados pelos agentes da Crew.

Cada template exige variaveis explicitas e falha (KeyError controlado) se uma
variavel obrigatoria estiver ausente, para impedir que um agente rode com
prompt incompleto.
"""
