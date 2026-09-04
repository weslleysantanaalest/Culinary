"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RecipeCard } from "@/components/recipe-card";
import type { RecipeDTO, RecipesPage } from "@/lib/notion/types";

/**
 * Galeria de receitas (Client Component) com carregamento progressivo de 6 em
 * 6 ("Carregar mais"). Recebe a primeira página via SSR (SEO) e continua
 * consumindo /api/recipes no cliente. Preserva ordenação por Ordem (feita no
 * service) e aplica busca/filtro ao resultado antes de paginar — ao mudar a
 * busca, volta para os primeiros 6 resultados.
 */

interface GaleriaReceitasProps {
  paginaInicial: RecipesPage;
  pageSize?: number;
  query?: string;
  filtros?: Record<string, string>;
  /** "all" busca todas as receitas do Notion, ignorando Publicado (decisão
   * editorial do catálogo público); "published" (padrão) mantém a regra
   * editorial para compatibilidade com outros usos deste componente. */
  scope?: "all" | "published";
}

type Status = "idle" | "loading" | "loadingMore" | "error";

export function GaleriaReceitas({
  paginaInicial,
  pageSize = 6,
  query,
  filtros,
  scope = "published",
}: GaleriaReceitasProps) {
  const [items, setItems] = useState<RecipeDTO[]>(paginaInicial.items);
  const [total, setTotal] = useState(paginaInicial.total);
  const [nextCursor, setNextCursor] = useState<string | null>(paginaInicial.nextCursor);
  const [hasMore, setHasMore] = useState(paginaInicial.hasMore);
  const [status, setStatus] = useState<Status>("idle");

  const botaoCarregarMaisRef = useRef<HTMLButtonElement>(null);
  const focoPendenteRef = useRef(false);

  // Evita refazer a 1ª página no primeiro render (já veio via SSR).
  const primeiraRenderizacao = useRef(true);
  const filtrosSerial = JSON.stringify(filtros ?? {});
  const buscaAtiva = Boolean(query && query.trim().length > 0);

  const buscarPagina = useCallback(
    async (cursor: string | null, modo: "reset" | "more") => {
      setStatus(modo === "reset" ? "loading" : "loadingMore");
      try {
        const params = new URLSearchParams({ limit: String(pageSize), scope });
        if (cursor) params.set("cursor", cursor);
        if (query) params.set("q", query);
        const resp = await fetch(`/api/recipes?${params.toString()}`, { cache: "no-store" });
        if (!resp.ok) throw new Error(`status ${resp.status}`);
        const pagina = (await resp.json()) as RecipesPage;
        setItems((atual) => (modo === "reset" ? pagina.items : [...atual, ...pagina.items]));
        setTotal(pagina.total);
        setNextCursor(pagina.nextCursor);
        setHasMore(pagina.hasMore);
        setStatus("idle");
      } catch {
        // Mantém os itens já carregados; sinaliza erro discreto.
        setStatus("error");
      }
    },
    [pageSize, query, scope],
  );

  // Reinicia para os primeiros `pageSize` resultados ao mudar busca/filtros.
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    setItems([]);
    setNextCursor(null);
    setHasMore(false);
    void buscarPagina(null, "reset");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filtrosSerial]);

  // Move o foco para o primeiro card recém-carregado após "Carregar mais",
  // preservando o contexto de navegação por teclado/leitor de tela.
  useEffect(() => {
    if (focoPendenteRef.current && status === "idle") {
      focoPendenteRef.current = false;
      botaoCarregarMaisRef.current?.focus();
    }
  }, [status]);

  const carregarMais = () => {
    if (status === "loadingMore" || !hasMore) return;
    focoPendenteRef.current = true;
    void buscarPagina(nextCursor, "more");
  };

  const vazio = total === 0 && items.length === 0 && status !== "loading";
  const restantes = Math.max(total - items.length, 0);
  const todasCarregadas = !hasMore && items.length > 0 && items.length >= total;

  if (vazio) {
    return (
      <div className="mx-auto max-w-xl border border-hairline bg-surface-container-lowest/95 p-12 text-center">
        <p className="text-lg text-secondary">
          {buscaAtiva
            ? "Nenhuma receita encontrada."
            : scope === "all"
              ? "Nenhuma receita cadastrada ainda."
              : "Nenhuma receita publicada ainda."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex w-full items-center justify-end">
        <p
          aria-live="polite"
          className="label-caps max-w-full text-right text-sm text-secondary break-words"
        >
          {items.length} de {total} {buscaAtiva ? "receitas encontradas" : "receitas"}
          {restantes > 0 && <span className="ml-2 text-secondary/70">({restantes} restantes)</span>}
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
        {items.map((receita) => (
          <RecipeCard key={receita.slug || `ordem-${receita.order}`} receita={receita} />
        ))}
      </div>

      {status === "error" && (
        <div className="mt-6 text-center">
          <p role="alert" className="mb-3 text-sm text-error">
            Não foi possível carregar mais receitas.
          </p>
          <button
            type="button"
            onClick={carregarMais}
            className="label-caps border border-hairline px-6 py-3 text-primary transition-colors hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {hasMore && status !== "error" && (
        <div className="mt-16 text-center">
          <button
            ref={botaoCarregarMaisRef}
            type="button"
            onClick={carregarMais}
            disabled={status === "loadingMore"}
            aria-busy={status === "loadingMore"}
            className="label-caps bg-primary px-10 py-5 text-on-primary transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loadingMore" ? "Carregando…" : "Carregar mais"}
          </button>
        </div>
      )}

      {todasCarregadas && status !== "error" && (
        <p aria-live="polite" className="label-caps mt-10 text-center text-sm text-secondary/70">
          Todas as receitas foram carregadas.
        </p>
      )}
    </div>
  );
}
