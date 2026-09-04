import Image from "next/image";
import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { getReceitas } from "@/test/fixtures/receitas-mock";

export default function CozinharIndexPage() {
  const receitas = getReceitas();

  return (
    <>
      <NavBar ativo="/cozinhar" />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-margin-mobile py-section-gap md:px-margin-desktop">
        <header className="mb-16 text-center">
          <h1 className="font-display mb-4 text-5xl text-primary">Modo Cozinhar</h1>
          <p className="text-lg text-secondary">
            Escolha uma receita para começar o passo a passo guiado.
          </p>
        </header>

        <div className="grid w-full grid-cols-1 gap-gutter md:grid-cols-3">
          {receitas.map((receita) => (
            <Link
              key={receita.id}
              href={`/cozinhar/${receita.id}`}
              className="group flex flex-col border border-hairline bg-surface-container-lowest"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-hairline">
                <Image
                  src={receita.imagemUrl}
                  alt={receita.titulo}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h2 className="font-display text-xl text-primary">{receita.titulo}</h2>
                <p className="label-caps mt-2 text-secondary">
                  {receita.passos.length} PASSOS
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
