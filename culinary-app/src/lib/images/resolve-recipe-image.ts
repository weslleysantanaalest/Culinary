import "server-only";

import fs from "node:fs";
import path from "node:path";
import { carregarManifestoImagens, type EntradaManifesto } from "./manifesto";

/**
 * Resolve a imagem aprovada de uma receita consultando exclusivamente o
 * manifesto central (`img/_auditoria/manifesto-imagens-site.csv`, sincronizado
 * em `data/manifesto-imagens-site.csv`) — nunca o filesystem de `img/`
 * diretamente e nunca por semelhança de nome de pasta/arquivo.
 *
 * Contrato:
 * - Recebe Ordem, ID, slug e título da receita.
 * - Casa a entrada do manifesto por Ordem (identificador mais estável e
 *   único); Ordem é obrigatória no Notion e é a chave primária da auditoria.
 * - Só retorna uma URL quando a entrada tiver Status === "APROVADA" E o
 *   arquivo referenciado realmente existir em `public/images/recipes/`
 *   (defesa dupla contra path traversal, preservada da versão anterior).
 * - Nunca usa uma imagem de outra receita, nem imagens de `_nao_utilizar/`
 *   ou `_auditoria/` (o manifesto já as exclui por construção).
 * - Ausência de imagem aprovada -> retorna null (o caller usa placeholder).
 */

// Aceita apenas <slug-seguro>.webp (minúsculas, dígitos e hifens).
const SAFE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/;

const DIR_APROVADO = path.join(process.cwd(), "public", "images", "recipes");

export interface RecipeParaResolverImagem {
  order: number | null;
  id?: string | null;
  slug?: string | null;
  title?: string | null;
}

/** Resultado de ausência/conflito, para alimentar o relatório de cobertura. */
export interface ResultadoResolucaoImagem {
  url: string | null;
  ausente: boolean;
  motivo?: string;
}

function nomeArquivoValido(caminho: string): string | null {
  const nome = path.basename(caminho.trim());
  if (!SAFE.test(nome)) return null;

  const caminhoResolvido = path.resolve(DIR_APROVADO, nome);
  if (
    caminhoResolvido !== path.join(DIR_APROVADO, nome) ||
    !caminhoResolvido.startsWith(DIR_APROVADO + path.sep)
  ) {
    return null;
  }

  try {
    const stat = fs.statSync(caminhoResolvido);
    if (!stat.isFile()) return null;
  } catch {
    return null;
  }

  return nome;
}

function encontrarEntrada(
  manifesto: EntradaManifesto[],
  recipe: RecipeParaResolverImagem,
): EntradaManifesto | undefined {
  // Ordem é a chave primária: única, obrigatória e não ambígua. Nunca
  // associamos por nome de pasta ou por semelhança de título.
  if (recipe.order !== null && recipe.order !== undefined) {
    const porOrdem = manifesto.find((e) => e.ordem === recipe.order);
    if (porOrdem) return porOrdem;
  }
  // Fallback defensivo por slug (só quando Ordem não foi informada).
  if (recipe.slug) {
    const porSlug = manifesto.find((e) => e.slug === recipe.slug);
    if (porSlug) return porSlug;
  }
  return undefined;
}

/**
 * Resolve a URL pública da imagem aprovada de uma receita, ou null.
 * Versão com diagnóstico completo (ausência/motivo) para o relatório de
 * cobertura administrativo.
 */
export function resolveRecipeImageDetalhado(
  recipe: RecipeParaResolverImagem,
): ResultadoResolucaoImagem {
  const manifesto = carregarManifestoImagens();
  const entrada = encontrarEntrada(manifesto, recipe);

  if (!entrada) {
    console.warn(
      `[resolve-recipe-image] receita sem entrada no manifesto (order=${recipe.order}, slug=${recipe.slug ?? ""})`,
    );
    return { url: null, ausente: true, motivo: "Receita não encontrada no manifesto." };
  }

  if (entrada.status !== "APROVADA" || !entrada.utilizada || !entrada.caminho) {
    return {
      url: null,
      ausente: true,
      motivo: entrada.motivo || "Nenhuma imagem aprovada para esta receita.",
    };
  }

  const nome = nomeArquivoValido(entrada.caminho);
  if (!nome) {
    console.warn(
      `[resolve-recipe-image] caminho aprovado no manifesto não resolve a um arquivo válido: "${entrada.caminho}" (order=${entrada.ordem})`,
    );
    return { url: null, ausente: true, motivo: "Arquivo aprovado não encontrado em disco." };
  }

  return { url: `/images/recipes/${nome}`, ausente: false };
}

/**
 * Assinatura simples (compatível com o restante do app): retorna somente a
 * URL ou null. Use `resolveRecipeImageDetalhado` quando precisar do motivo de
 * ausência para diagnóstico/relatório.
 */
export function resolveRecipeImage(recipe: RecipeParaResolverImagem): string | null {
  return resolveRecipeImageDetalhado(recipe).url;
}
