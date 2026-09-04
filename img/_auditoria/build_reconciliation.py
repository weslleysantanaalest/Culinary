#!/usr/bin/env python3
"""Reconciliation script: builds the 6 audit CSVs for the Culinary image project."""
import json, csv, hashlib, os, re, unicodedata

BASE = "/Users/weslleysantana/Projetos/Culinary"
AUD = os.path.join(BASE, "img", "_auditoria")

with open(os.path.join(AUD, "receitas-notion-85.json"), encoding="utf-8") as f:
    data = json.load(f)
receitas = data["receitas"]

def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")

# Approved (Ordem -> info)
aprovadas = {
    1: {"receita": "Pudim de coco queimado", "arquivo": "img/001-pudim-de-coco-queimado.webp", "motivo": "Coco tostado e calda confirmados na receita real."},
    10: {"receita": "Bolo de fubá (Clarice)", "arquivo": "img/010-bolo-de-fuba-clarice.webp", "motivo": "Cobertura tostada/marrom compatível com 'fubá queimado' da receita real (versão duplicadas/, não a versão restante/ com açúcar branco)."},
    13: {"receita": "Bolo de ameixas", "arquivo": "img/013-bolo-de-ameixas.webp", "motivo": "Ameixas visíveis e confirmadas como ingrediente."},
    14: {"receita": "Bolachinhas Quaker", "arquivo": "img/014-bolachinhas-quaker.webp", "motivo": "Textura de aveia compatível com ingrediente Aveia Quaker confirmado."},
    16: {"receita": "Sequilho de fubá", "arquivo": "img/016-sequilho-de-fuba.webp", "motivo": "Massa simples de fubá/araruta compatível."},
}

# Rejected with known recipe + reason (Ordem -> motivo)
rejeitadas = {
    2: "Molho zabaglione: guarnição (hortelã + pó de especiaria) não confirmada nos ingredientes (parcialmente ilegíveis).",
    3: "Champanhita: imagem mostra biscoitos champanhe crus/soltos, não o doce montado em camadas gelado descrito na receita.",
    4: "Glacê para bolo: receita confirma chocolate em pó, imagem mostra glacê branco sem qualquer traço de chocolate.",
    5: "Bolo Sarah: decoração moderna de chocolate (ganache, rosetas, raspas) não confirmada.",
    6: "Pão irlandês com pastel: formato sem espiral de rocambole (receita pede fatia revelando espiral).",
    7: "Pudim Francês: receita tem queijo ralado confirmado, imagem mostra pudim genérico de leite condensado sem queijo.",
    8: "Torta antiga (ambas versões): massa treliçada incompatível com bolo denso de chocolate/amêndoas em camadas coberto de nata.",
    12: "Waffles de chocolate: apresentados como waffles individuais com chantilly, não como pilha recheada e gelada.",
    15: "Bolo de mel e cacau: nozes/amêndoas decorativas no topo não confirmadas.",
    17: "Torta de Natal australiana: formato individual fechado tipo mince pie, não bolo assado inteiro com glacê.",
    18: "Torta chiffon de limão: aparência de cheesecake denso, não recheio leve e aerado (chiffon).",
    19: "Chocolate chiffon pie: recheio bege claro, não claramente marrom-chocolate como exigido.",
}

ordens_aprovadas = set(aprovadas.keys())
ordens_rejeitadas = set(rejeitadas.keys())
ordens_sem_imagem_alguma = [r["ordem"] for r in receitas if r["ordem"] not in ordens_aprovadas and r["ordem"] not in ordens_rejeitadas]

# 1. estado-atual.csv — status por Ordem
with open(os.path.join(AUD, "estado-atual.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["ordem", "id", "receita", "page_id", "status", "arquivo_aprovado", "motivo"])
    for r in receitas:
        o = r["ordem"]
        if o in aprovadas:
            status = "APROVADA"
            arquivo = aprovadas[o]["arquivo"]
            motivo = aprovadas[o]["motivo"]
        elif o in rejeitadas:
            status = "REJEITADA_SEM_IMAGEM_APROVADA"
            arquivo = ""
            motivo = rejeitadas[o]
        else:
            status = "SEM_IMAGEM"
            arquivo = ""
            motivo = "Nenhuma imagem gerada ainda para esta receita."
        w.writerow([o, r["id"], r["receita"], r["page_id"], status, arquivo, motivo])

# 2. imagens-aprovadas.csv
with open(os.path.join(AUD, "imagens-aprovadas.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["ordem", "id", "receita", "arquivo", "sha256", "motivo_aprovacao"])
    for o in sorted(aprovadas.keys()):
        info = aprovadas[o]
        path = os.path.join(BASE, info["arquivo"])
        h = hashlib.sha256(open(path, "rb").read()).hexdigest() if os.path.exists(path) else "ARQUIVO_NAO_ENCONTRADO"
        rec = next(r for r in receitas if r["ordem"] == o)
        w.writerow([o, rec["id"], rec["receita"], info["arquivo"], h, info["motivo"]])

# 3. imagens-rejeitadas.csv
with open(os.path.join(AUD, "imagens-rejeitadas.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["ordem", "id", "receita", "motivo_rejeicao", "localizacao_quarentena"])
    for o in sorted(rejeitadas.keys()):
        rec = next(r for r in receitas if r["ordem"] == o)
        w.writerow([o, rec["id"], rec["receita"], rejeitadas[o], "img/_nao_utilizar/versoes_rejeitadas/"])

# 4. receitas-sem-imagem.csv — fila oficial (rejeitadas + nunca geradas), ordenado por Ordem
with open(os.path.join(AUD, "receitas-sem-imagem.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["ordem", "id", "receita", "page_id", "slug_sugerido", "situacao"])
    fila = sorted(set(rejeitadas.keys()) | set(ordens_sem_imagem_alguma))
    for o in fila:
        rec = next(r for r in receitas if r["ordem"] == o)
        slug = slugify(rec["receita"])
        situacao = "REJEITADA_REGENERAR" if o in rejeitadas else "NUNCA_GERADA"
        w.writerow([o, rec["id"], rec["receita"], rec["page_id"], slug, situacao])

# 5. arquivos-sem-receita.csv — arquivos em quarentena que não pertencem a nenhuma das 85
outro_projeto_dir = os.path.join(BASE, "img", "_nao_utilizar", "outro_projeto")
with open(os.path.join(AUD, "arquivos-sem-receita.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["pasta", "motivo"])
    if os.path.isdir(outro_projeto_dir):
        for d in sorted(os.listdir(outro_projeto_dir)):
            full = os.path.join(outro_projeto_dir, d)
            if os.path.isdir(full):
                w.writerow([f"img/_nao_utilizar/outro_projeto/{d}", "Título não corresponde a nenhuma das 85 receitas do banco Notion."])

print("total_receitas:", len(receitas))
print("aprovadas:", len(aprovadas))
print("rejeitadas_com_receita_conhecida:", len(rejeitadas))
print("nunca_geradas:", len(ordens_sem_imagem_alguma))
print("fila_total_sem_imagem:", len(rejeitadas) + len(ordens_sem_imagem_alguma))
print("soma_check (aprovadas+fila):", len(aprovadas) + len(rejeitadas) + len(ordens_sem_imagem_alguma), "== 85?", len(aprovadas) + len(rejeitadas) + len(ordens_sem_imagem_alguma) == 85)
