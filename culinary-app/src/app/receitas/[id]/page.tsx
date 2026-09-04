import Image from "next/image";
import { notFound } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { ImagemEmPreparacao } from "@/components/imagem-em-preparacao";
import { buscarPorSlug } from "@/lib/api/recipes-service";

export const dynamic = "force-dynamic";

export default async function DetalheReceitaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // O segmento de rota é [id], mas o valor é o slug da receita no Notion.
  const { id: slug } = await params;
  const receita = await buscarPorSlug(slug);

  if (!receita) {
    notFound();
  }

  return (
    <>
      <NavBar ativo="/" />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-margin-mobile py-section-gap md:px-margin-desktop">
        <h1 className="font-display mb-6 text-5xl text-primary">{receita.title}</h1>

        {receita.source && (
          <div className="label-caps mb-10 flex items-center border-b border-hairline pb-6 text-secondary">
            <a href={receita.source} className="hover:text-primary hover:underline">
              Fonte
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          <div className="relative aspect-[4/3] w-full overflow-hidden border border-hairline md:col-span-7">
            {receita.image ? (
              <Image
                src={receita.image}
                alt={receita.title}
                fill
                sizes="(min-width: 768px) 58vw, 100vw"
                className="object-cover"
              />
            ) : (
              <ImagemEmPreparacao titulo={receita.title} aspecto="4/3" />
            )}
          </div>

          <aside className="border border-hairline p-8 md:col-span-5">
            <h2 className="label-caps mb-6 border-b border-hairline pb-4 text-secondary">
              INGREDIENTES
            </h2>
            <ul>
              {receita.ingredients.map((ingrediente, index) => (
                <li
                  key={`${index}-${ingrediente}`}
                  className="border-b border-hairline py-3 text-on-surface last:border-b-0"
                >
                  {ingrediente}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {receita.instructions.length > 0 && (
          <section className="mt-16">
            <h2 className="label-caps mb-6 border-b border-hairline pb-4 text-secondary">
              MODO DE PREPARO
            </h2>
            <ol className="flex flex-col gap-4">
              {receita.instructions.map((passo, index) => (
                <li key={`${index}-${passo}`} className="flex gap-4 text-on-surface">
                  <span className="font-display text-2xl text-primary">{index + 1}</span>
                  <span className="pt-1 leading-relaxed">{passo}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
