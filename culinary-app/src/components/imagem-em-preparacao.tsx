/**
 * Fallback visual quando uma receita não tem imagem local resolvida
 * (`image === null`). Bloco CSS puro — sem next/image e sem foto fictícia —
 * mantendo o aspect-ratio do contexto (card 4/5, detalhe 4/3) para não
 * quebrar o layout do grid.
 */
export function ImagemEmPreparacao({
  titulo,
  className,
  aspecto = "4/5",
}: {
  titulo: string;
  className?: string;
  aspecto?: "4/5" | "4/3";
}) {
  const aspectoClasse = aspecto === "4/3" ? "aspect-[4/3]" : "aspect-[4/5]";
  return (
    <div
      role="img"
      aria-label={`Imagem pendente para ${titulo}`}
      className={`flex ${aspectoClasse} w-full flex-col items-center justify-center gap-3 bg-surface-fill text-secondary ${className ?? ""}`}
    >
      <span className="material-symbols-outlined text-5xl" aria-hidden="true">
        skillet
      </span>
      <span className="label-caps">Imagem em preparação</span>
    </div>
  );
}
