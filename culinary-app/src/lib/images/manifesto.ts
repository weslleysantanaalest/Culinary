import "server-only";

import fs from "node:fs";
import path from "node:path";

/**
 * Leitor do manifesto central de imagens (fonte de verdade única para a
 * relação receita -> imagem aprovada). Gerado pela auditoria em
 * `img/_auditoria/manifesto-imagens-site.csv` e sincronizado para
 * `data/manifesto-imagens-site.csv` dentro do app (server-only, não exposto
 * em `public/`). Nunca lançar: manifesto ausente/corrompido -> lista vazia
 * (nenhuma receita resolve imagem, mas o site continua funcionando com
 * placeholder).
 */

export interface EntradaManifesto {
  ordem: number;
  id: string;
  receita: string;
  slug: string;
  caminho: string;
  hash: string;
  status: "APROVADA" | "REJEITADA" | "SEM_IMAGEM" | string;
  motivo: string;
  utilizada: boolean;
}

const CAMINHO_MANIFESTO = path.join(process.cwd(), "data", "manifesto-imagens-site.csv");
const TTL_MS = 60_000;

let cache: { valor: EntradaManifesto[]; expira: number } | null = null;

/** Parser de CSV simples e tolerante a campos entre aspas com vírgulas internas. */
function parseCsv(conteudo: string): string[][] {
  const linhas: string[][] = [];
  let campo = "";
  let linhaAtual: string[] = [];
  let dentroDeAspas = false;

  for (let i = 0; i < conteudo.length; i++) {
    const c = conteudo[i];
    const proximo = conteudo[i + 1];

    if (dentroDeAspas) {
      if (c === '"' && proximo === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        dentroDeAspas = false;
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') {
      dentroDeAspas = true;
    } else if (c === ",") {
      linhaAtual.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && proximo === "\n") continue;
      linhaAtual.push(campo);
      campo = "";
      if (linhaAtual.some((v) => v.length > 0) || linhaAtual.length > 1) {
        linhas.push(linhaAtual);
      }
      linhaAtual = [];
    } else {
      campo += c;
    }
  }
  if (campo.length > 0 || linhaAtual.length > 0) {
    linhaAtual.push(campo);
    linhas.push(linhaAtual);
  }
  return linhas;
}

function carregarDoDisco(): EntradaManifesto[] {
  let conteudo: string;
  try {
    conteudo = fs.readFileSync(CAMINHO_MANIFESTO, "utf8");
  } catch {
    console.warn("[manifesto-imagens] arquivo não encontrado:", CAMINHO_MANIFESTO);
    return [];
  }

  const linhas = parseCsv(conteudo);
  if (linhas.length === 0) return [];

  const cabecalho = linhas[0].map((h) => h.trim());
  const idx = (nome: string) => cabecalho.indexOf(nome);

  const iOrdem = idx("Ordem");
  const iId = idx("ID");
  const iReceita = idx("Receita");
  const iSlug = idx("Slug");
  const iCaminho = idx("Caminho");
  const iHash = idx("Hash");
  const iStatus = idx("Status");
  const iMotivo = idx("Motivo");
  const iUtilizada = idx("Utilizada");

  const entradas: EntradaManifesto[] = [];
  for (let i = 1; i < linhas.length; i++) {
    const l = linhas[i];
    if (l.length < cabecalho.length) continue;
    const ordem = Number(l[iOrdem]);
    if (!Number.isFinite(ordem)) continue;
    entradas.push({
      ordem,
      id: l[iId] ?? "",
      receita: l[iReceita] ?? "",
      slug: l[iSlug] ?? "",
      caminho: l[iCaminho] ?? "",
      hash: l[iHash] ?? "",
      status: (l[iStatus] ?? "SEM_IMAGEM") as EntradaManifesto["status"],
      motivo: l[iMotivo] ?? "",
      utilizada: (l[iUtilizada] ?? "").trim().toLowerCase() === "sim",
    });
  }
  return entradas;
}

/** Retorna todas as entradas do manifesto, com cache best-effort de 60s. */
export function carregarManifestoImagens(): EntradaManifesto[] {
  const agora = Date.now();
  if (cache && cache.expira > agora) return cache.valor;
  const valor = carregarDoDisco();
  cache = { valor, expira: agora + TTL_MS };
  return valor;
}

/** Uso em teste: limpa o cache entre casos. */
export function _resetCacheManifesto(): void {
  cache = null;
}
