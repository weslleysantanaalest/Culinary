import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { BuscaIngredientes } from "@/components/busca-ingredientes";
import { getReceitas } from "@/test/fixtures/receitas-mock";

export default function ListaIngredientesPage() {
  const receitas = getReceitas();

  return (
    <>
      <NavBar ativo="/lista" />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-margin-mobile py-section-gap md:px-margin-desktop">
        <BuscaIngredientes receitas={receitas} />
      </main>

      <Footer />
    </>
  );
}
