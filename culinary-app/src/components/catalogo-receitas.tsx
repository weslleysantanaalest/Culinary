"use client";

import { useState } from "react";
import { BuscaReceitas } from "@/components/busca-receitas";
import { GaleriaReceitas } from "@/components/galeria-receitas";
import type { RecipesPage } from "@/lib/notion/types";

/**
 * Une busca + galeria: mantém a query em estado local e a repassa à galeria,
 * que reinicia o carregamento para os primeiros 6 resultados sempre que a
 * busca muda (comportamento implementado dentro de GaleriaReceitas).
 */
export function CatalogoReceitas({ paginaInicial }: { paginaInicial: RecipesPage }) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex w-full flex-col items-center">
      <BuscaReceitas onBuscar={setQuery} />
      <GaleriaReceitas paginaInicial={paginaInicial} pageSize={6} query={query} scope="all" />
    </div>
  );
}
