import Image from "next/image";
import Link from "next/link";
import { ImagemEmPreparacao } from "@/components/imagem-em-preparacao";
import type { RecipeDTO } from "@/lib/notion/types";

/**
 * Card de receita da galeria (RF-011). Consome o RecipeDTO da API: título,
 * imagem local (ou fallback "Imagem em preparação" quando `image === null`) e
 * link por slug. Campos não fornecidos pela fonte (categorias, tempo,
 * dificuldade) não são exibidos nesta fase.
 *
 * Quando `slug` está vazio (receita ainda sem slug preenchido no Notion —
 * comum nas receitas que nunca foram publicadas editorialmente), o card é
 * renderizado sem link em vez de apontar para uma rota inválida
 * (`/receitas/`). A receita continua visível no catálogo (scope=all não
 * esconde receitas por falta de slug ou imagem).
 */
export function RecipeCard({ receita }: { receita: RecipeDTO }) {
  const temSlug = receita.slug.trim().length > 0;

  const conteudo = (
    <>
      <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-hairline">
        {receita.image ? (
          <Image
            src={receita.image}
            alt={receita.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <ImagemEmPreparacao titulo={receita.title} aspecto="4/5" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="font-display flex-1 text-2xl text-primary">{receita.title}</h2>
      </div>
    </>
  );

  if (!temSlug) {
    return (
      <div className="flex flex-col border border-hairline bg-surface-container-lowest/95">
        {conteudo}
      </div>
    );
  }

  return (
    <Link
      href={`/receitas/${receita.slug}`}
      className="group flex flex-col border border-hairline bg-surface-container-lowest/95 transition-all duration-300 hover:-translate-y-1"
    >
      {conteudo}
    </Link>
  );
}
