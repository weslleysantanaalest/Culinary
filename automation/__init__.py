"""Automação local do ciclo de desenvolvimento do Culinary.

Orquestra, via CrewAI, um pipeline de agentes (Analyzer -> Planner -> Developer ->
Tester -> Reviewer -> Documenter) que le o estado do projeto Next.js em
`.kiro/project-journal/`, seleciona a proxima minitask segura, implementa uma
mudanca pequena, valida com lint/test/build e documenta o resultado.

Este pacote NAO substitui o journal `.kiro/project-journal/`; ele o consome e
o atualiza como fonte de verdade compartilhada com o restante do fluxo humano/Kiro.
"""

__version__ = "0.1.0"
