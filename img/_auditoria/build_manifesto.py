#!/usr/bin/env python3
"""Gera img/_auditoria/manifesto-imagens-site.csv a partir do estado de auditoria
já consolidado (estado-atual.csv + hashes.csv), seguindo o contrato pedido:
Ordem,ID,Receita,Slug,Caminho,Hash,Status,Motivo,Utilizada.

Fonte de verdade dos slugs: quando a receita está aprovada, o slug é derivado
do nome de arquivo padronizado (ordem-3digitos-slug.webp); senão, gerado por
normalização do título (mesma função usada na sessão anterior para
slug_sugerido em receitas-sem-imagem.csv).
"""
import csv
import hashlib
import re
import unicodedata
from pathlib import Path

AUDITORIA = Path(__file__).resolve().parent  # este script já está em img/_auditoria
ESTADO = AUDITORIA / "estado-atual.csv"
HASHES = AUDITORIA / "hashes.csv"
MANIFESTO = AUDITORIA / "manifesto-imagens-site.csv"


def slugify(titulo: str) -> str:
    nfkd = unicodedata.normalize("NFKD", titulo)
    sem_acento = "".join(c for c in nfkd if not unicodedata.combining(c))
    minusculo = sem_acento.lower()
    somente_alnum = re.sub(r"[^a-z0-9]+", "-", minusculo)
    return somente_alnum.strip("-")


def carregar_hashes() -> dict[str, str]:
    mapa = {}
    with open(HASHES, encoding="utf-8") as f:
        leitor = csv.DictReader(f)
        for linha in leitor:
            caminho = linha["caminho"].strip().strip('"')
            mapa[caminho] = linha["sha256"].strip().strip('"')
    return mapa


def main():
    hashes = carregar_hashes()
    linhas_saida = []

    with open(ESTADO, encoding="utf-8") as f:
        leitor = csv.DictReader(f)
        for linha in leitor:
            ordem = int(linha["ordem"])
            id_ = linha["id"]
            receita = linha["receita"]
            status_bruto = linha["status"]
            arquivo = linha["arquivo_aprovado"].strip()
            motivo = linha["motivo"].strip()

            if status_bruto == "APROVADA" and arquivo:
                nome_arquivo = Path(arquivo).name
                slug = Path(nome_arquivo).stem.split("-", 1)[1] if "-" in Path(nome_arquivo).stem else slugify(receita)
                caminho_hash = arquivo if arquivo in hashes else f"img/{nome_arquivo}"
                hash_sha256 = hashes.get(caminho_hash, hashes.get(arquivo, ""))
                status = "APROVADA"
                utilizada = "sim"
                caminho = arquivo
            else:
                slug = slugify(receita)
                hash_sha256 = ""
                caminho = ""
                utilizada = "nao"
                if status_bruto == "REJEITADA_SEM_IMAGEM_APROVADA":
                    status = "REJEITADA"
                elif status_bruto == "SEM_IMAGEM":
                    status = "SEM_RECEITA_CORRESPONDENTE" if False else "SEM_IMAGEM"
                else:
                    status = status_bruto
                if not motivo:
                    motivo = "Nenhuma imagem gerada ainda para esta receita."

            linhas_saida.append({
                "Ordem": ordem,
                "ID": id_,
                "Receita": receita,
                "Slug": slug,
                "Caminho": caminho,
                "Hash": hash_sha256,
                "Status": status,
                "Motivo": motivo,
                "Utilizada": utilizada,
            })

    linhas_saida.sort(key=lambda l: l["Ordem"])

    with open(MANIFESTO, "w", encoding="utf-8", newline="") as f:
        escritor = csv.DictWriter(
            f,
            fieldnames=["Ordem", "ID", "Receita", "Slug", "Caminho", "Hash", "Status", "Motivo", "Utilizada"],
        )
        escritor.writeheader()
        escritor.writerows(linhas_saida)

    aprovadas = sum(1 for l in linhas_saida if l["Status"] == "APROVADA")
    print(f"Manifesto gerado: {len(linhas_saida)} linhas, {aprovadas} aprovadas.")


if __name__ == "__main__":
    main()
