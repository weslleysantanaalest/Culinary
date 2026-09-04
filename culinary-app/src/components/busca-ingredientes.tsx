"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { itensDespensaIniciais } from "@/data/despensa";
import { calcularMatches, separarPorCompletude } from "@/lib/ingredientes";
import type { Receita } from "@/types";

/**
 * Busca de receitas por ingredientes disponíveis (RF-030 a RF-034):
 * entrada de texto + chips removíveis + resultados segmentados em
 * "match exato" (100% dos ingredientes) e "match parcial" (faltam itens).
 */
export function BuscaIngredientes({ receitas }: { receitas: Receita[] }) {
  const [ingredientes, setIngredientes] = useState<string[]>(
    itensDespensaIniciais.map((item) => item.nome),
  );
  const [novoIngrediente, setNovoIngrediente] = useState("");

  const resultados = useMemo(() => calcularMatches(receitas, ingredientes), [receitas, ingredientes]);
  const { completas, parciais } = useMemo(() => separarPorCompletude(resultados), [resultados]);

  function adicionarIngrediente() {
    const valor = novoIngrediente.trim();
    if (valor.length === 0) return;
    setIngredientes((atual) => [...atual, valor]);
    setNovoIngrediente("");
  }

  function removerIngrediente(nome: string) {
    setIngredientes((atual) => atual.filter((item) => item !== nome));
  }

  return (
    <div className="grid w-full grid-cols-1 gap-gutter md:grid-cols-12">
      <section className="flex flex-col border border-hairline bg-surface-container-lowest md:col-span-5">
        <div className="border-b border-hairline p-8">
          <h1 className="font-display mb-4 text-4xl text-primary">O que tem na despensa?</h1>
          <p className="mb-8 text-lg text-secondary">
            Adicione ingredientes para descobrir receitas possíveis.
          </p>
          <div className="relative w-full">
            <input
              type="text"
              value={novoIngrediente}
              onChange={(event) => setNovoIngrediente(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  adicionarIngrediente();
                }
              }}
              placeholder="Ex: Tomate, Ovo, Farinha..."
              aria-label="Adicionar ingrediente"
              className="w-full border-0 border-b border-hairline bg-transparent py-4 text-lg text-primary placeholder-secondary transition-all focus:border-b-2 focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={adicionarIngrediente}
              aria-label="Confirmar ingrediente"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        <div className="flex-1 p-8">
          <h2 className="label-caps mb-4 text-secondary">SEUS INGREDIENTES ({ingredientes.length})</h2>
          <ul>
            {ingredientes.map((nome) => (
              <li
                key={nome}
                className="group flex items-center justify-between border-b border-hairline py-4"
              >
                <span className="text-primary">{nome}</span>
                <button
                  type="button"
                  onClick={() => removerIngrediente(nome)}
                  aria-label={`Remover ${nome}`}
                  className="text-secondary opacity-0 transition-opacity group-hover:opacity-100 hover:text-error"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col border border-hairline bg-surface-container-lowest md:col-span-7">
        <div className="flex items-end justify-between border-b border-hairline p-8">
          <div>
            <h2 className="font-display text-3xl text-primary">Resultados</h2>
            <p className="mt-1 text-secondary">
              {completas.length} receita{completas.length === 1 ? "" : "s"} perfeita
              {completas.length === 1 ? "" : "s"}, {parciais.length} precisando de mais itens.
            </p>
          </div>
        </div>

        <div className="space-y-12 p-8">
          <div>
            <h3 className="label-caps mb-6 border-b border-hairline pb-2 text-secondary">
              O QUE VOCÊ PODE COZINHAR (TODOS OS INGREDIENTES)
            </h3>
            {completas.length === 0 ? (
              <p className="text-secondary">Nenhuma receita com todos os ingredientes ainda.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {completas.map(({ receita }) => (
                  <Link
                    key={receita.id}
                    href={`/receitas/${receita.id}`}
                    className="group cursor-pointer"
                  >
                    <div className="relative mb-4 h-48 w-full overflow-hidden border border-hairline">
                      <Image
                        src={receita.imagemUrl}
                        alt={receita.titulo}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-all duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h4 className="mb-2 text-xl text-primary">{receita.titulo}</h4>
                    <div className="label-caps flex items-center space-x-2 text-secondary">
                      <span>{receita.tempoPreparo}</span>
                      <span className="text-hairline">|</span>
                      <span>{receita.dificuldade}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="label-caps mb-6 border-b border-hairline pb-2 text-secondary">
              QUASE LÁ (FALTAM INGREDIENTES)
            </h3>
            {parciais.length === 0 ? (
              <p className="text-secondary">Nenhuma receita parcial encontrada.</p>
            ) : (
              <div className="space-y-6">
                {parciais.slice(0, 10).map(({ receita, ingredientesFaltantes }) => (
                  <Link
                    key={receita.id}
                    href={`/receitas/${receita.id}`}
                    className="group flex border border-hairline transition-colors hover:bg-surface-container-low"
                  >
                    <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden border-r border-hairline">
                      <Image
                        src={receita.imagemUrl}
                        alt={receita.titulo}
                        fill
                        sizes="128px"
                        className="object-cover transition-all duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center p-6">
                      <h4 className="mb-2 text-xl text-primary">{receita.titulo}</h4>
                      <div className="label-caps mb-3 text-secondary">{receita.tempoPreparo}</div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="label-caps text-[10px] font-bold text-error">FALTA:</span>
                        {ingredientesFaltantes.map((nome) => (
                          <span
                            key={nome}
                            className="label-caps inline-block bg-surface-fill px-2 py-1 text-[10px] text-secondary"
                          >
                            {nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
