import { notFound } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { ModoCozinhar } from "@/components/modo-cozinhar";
import { getReceitaPorId } from "@/test/fixtures/receitas-mock";

export default async function CozinharReceitaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receita = getReceitaPorId(id);

  if (!receita) {
    notFound();
  }

  return (
    <>
      <NavBar ativo="/cozinhar" />

      <main className="flex flex-1 items-center justify-center px-margin-mobile py-section-gap md:px-margin-desktop">
        <ModoCozinhar receita={receita} />
      </main>

      <Footer />
    </>
  );
}
