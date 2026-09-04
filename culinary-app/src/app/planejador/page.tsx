import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { PlanejadorGrid } from "@/components/planejador-grid";
import { getReceitas } from "@/test/fixtures/receitas-mock";
import { planejamentosRefeicao } from "@/data/planejamentos";
import { getHojeIso } from "@/lib/planejador";

export default function PlanejadorPage() {
  const receitas = getReceitas();

  return (
    <>
      <NavBar ativo="/planejador" />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-margin-mobile py-section-gap md:px-margin-desktop">
        <PlanejadorGrid
          dataReferenciaInicial={getHojeIso()}
          planejamentosIniciais={planejamentosRefeicao}
          receitas={receitas}
        />
      </main>

      <Footer />
    </>
  );
}
