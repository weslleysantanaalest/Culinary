"use client";

import { useState } from "react";

/**
 * Campo de busca por título de receita. Client Component simples: mantém o
 * texto digitado e notifica o pai (que repassa à galeria) via callback — sem
 * navegação de URL, para manter a UX de "digitar e ver os primeiros 6
 * resultados filtrados" sem reload de página.
 */
export function BuscaReceitas({ onBuscar }: { onBuscar: (query: string) => void }) {
  const [valor, setValor] = useState("");

  return (
    <div className="mb-8 w-full max-w-md">
      <label htmlFor="busca-receitas" className="sr-only">
        Buscar receitas por título
      </label>
      <input
        id="busca-receitas"
        type="search"
        placeholder="Buscar receitas por título…"
        value={valor}
        onChange={(e) => {
          setValor(e.target.value);
          onBuscar(e.target.value);
        }}
        className="label-caps w-full border border-hairline bg-surface-container-lowest/95 px-4 py-3 text-primary placeholder:text-secondary/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
    </div>
  );
}
