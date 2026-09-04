#!/usr/bin/env python3
"""Gera img/_auditoria/receitas-sem-imagem-no-site.csv a partir do manifesto
central, com as colunas exigidas: Ordem,ID,Receita,Slug,Motivo,Imagem esperada.
"""
import csv
from pathlib import Path

AUDITORIA = Path(__file__).resolve().parent
MANIFESTO = AUDITORIA / "manifesto-imagens-site.csv"
SAIDA = AUDITORIA / "receitas-sem-imagem-no-site.csv"


def imagem_esperada(ordem: int, slug: str) -> str:
    return f"{ordem:03d}-{slug}.webp"


def main():
    linhas_saida = []
    with open(MANIFESTO, encoding="utf-8") as f:
        leitor = csv.DictReader(f)
        for linha in leitor:
            if linha["Status"] == "APROVADA" and linha["Utilizada"] == "sim":
                continue
            ordem = int(linha["Ordem"])
            linhas_saida.append({
                "Ordem": ordem,
                "ID": linha["ID"],
                "Receita": linha["Receita"],
                "Slug": linha["Slug"],
                "Motivo": linha["Motivo"],
                "Imagem esperada": imagem_esperada(ordem, linha["Slug"]),
            })

    linhas_saida.sort(key=lambda l: l["Ordem"])

    with open(SAIDA, "w", encoding="utf-8", newline="") as f:
        escritor = csv.DictWriter(
            f, fieldnames=["Ordem", "ID", "Receita", "Slug", "Motivo", "Imagem esperada"]
        )
        escritor.writeheader()
        escritor.writerows(linhas_saida)

    print(f"Gerado: {len(linhas_saida)} receitas sem imagem aprovada.")


if __name__ == "__main__":
    main()
