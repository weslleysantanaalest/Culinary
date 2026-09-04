/**
 * Painel administrativo discreto com a cobertura de imagens aprovadas
 * (calculada do manifesto, nunca hardcoded). Não é o contador de exibição da
 * galeria — é uma métrica de diagnóstico separada. Renderizado apenas fora de
 * produção (NODE_ENV !== "production"); nunca aparece no site público.
 */
export function PainelCoberturaImagens({
  totalReceitas,
  comImagemValidada,
}: {
  totalReceitas: number;
  comImagemValidada: number;
}) {
  return (
    <p className="label-caps mb-4 text-right text-xs text-secondary/60" data-testid="cobertura-imagens">
      [dev] {comImagemValidada} de {totalReceitas} receitas com imagem validada
    </p>
  );
}
