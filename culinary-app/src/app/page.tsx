import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { CatalogoReceitas } from "@/components/catalogo-receitas";
import { PainelCoberturaImagens } from "@/components/painel-cobertura-imagens";
import { listarReceitas } from "@/lib/api/recipes-service";
import { calcularCoberturaImagens } from "@/lib/images/cobertura";

// A galeria depende de dados dinâmicos do Notion (degrada para vazio sem token).
export const dynamic = "force-dynamic";

export default async function ReceitasPage() {
  const paginaInicial = await listarReceitas({ limit: 6, somentePublicadas: false });
  const cobertura = process.env.NODE_ENV !== "production" ? calcularCoberturaImagens() : null;

  return (
    <>
      <NavBar ativo="/" />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center px-margin-mobile py-section-gap md:px-margin-desktop">
        <header className="mx-auto mb-16 max-w-2xl border border-hairline bg-surface-container-lowest/95 p-12 text-center">
          <h1 className="font-display mb-6 text-5xl text-primary md:text-6xl">
            A Arte da Culinária
          </h1>
          <p className="text-lg text-secondary">
            Explore nossa coleção de receitas, criadas para transformar ingredientes
            simples em experiências gastronômicas inesquecíveis.
          </p>
        </header>

        <div className="w-full">
          {cobertura && (
            <PainelCoberturaImagens
              totalReceitas={cobertura.totalReceitas}
              comImagemValidada={cobertura.comImagemValidada}
            />
          )}
          <CatalogoReceitas paginaInicial={paginaInicial} />
        </div>
      </main>

      <Footer />
    </>
  );
}
