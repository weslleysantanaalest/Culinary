import "server-only";

import { carregarManifestoImagens } from "@/lib/images/manifesto";

/** Cobertura de imagens aprovadas calculada do manifesto central. */
export interface CoberturaImagens {
  totalReceitas: number;
  comImagemValidada: number;
}

/**
 * Calcula quantas das receitas do manifesto têm imagem aprovada. Usado só no
 * painel de diagnóstico (modo dev) — nunca exposto na versão pública, e nunca
 * hardcoded: sempre lido do manifesto atual.
 */
export function calcularCoberturaImagens(): CoberturaImagens {
  const manifesto = carregarManifestoImagens();
  const comImagemValidada = manifesto.filter(
    (e) => e.status === "APROVADA" && e.utilizada,
  ).length;
  return { totalReceitas: manifesto.length, comImagemValidada };
}
