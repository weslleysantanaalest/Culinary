"use client";

import Link from "next/link";
import { useUsuario } from "@/lib/usuario-context";

/**
 * Navegação principal (RF-002): 4 destinos — Receitas, Planejador, Lista,
 * Cozinhar. Desktop: barra horizontal fixa no topo. Mobile: bottom nav bar.
 * `ativo` destaca o item correspondente à rota atual.
 *
 * Exibe "cozinheiro(NOME)" de forma minimalista quando o usuário já
 * informou o nome no popup de boas-vindas. Não há ícone de perfil/login —
 * o site não tem essa funcionalidade.
 */

const ITENS_NAV = [
  { href: "/", label: "RECEITAS", icone: "restaurant_menu" },
  { href: "/planejador", label: "PLANEJADOR", icone: "calendar_today" },
  { href: "/lista", label: "LISTA", icone: "format_list_bulleted" },
  { href: "/cozinhar", label: "COZINHAR", icone: "skillet" },
] as const;

export function NavBar({ ativo }: { ativo: string }) {
  const { nome, carregado, solicitarNovoNome } = useUsuario();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-hairline bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-margin-mobile py-4 md:px-margin-desktop">
          <Link href="/" className="font-display shrink-0 text-2xl tracking-tighter text-primary">
            CULINARY
          </Link>

          <nav className="hidden items-center gap-4 md:flex lg:gap-6">
            {ITENS_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  ativo === item.href
                    ? "label-caps whitespace-nowrap border-b-2 border-primary pb-1 text-primary"
                    : "label-caps whitespace-nowrap text-secondary transition-colors duration-300 hover:text-primary"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3 text-primary lg:space-x-6">
            {carregado && nome && (
              <button
                type="button"
                onClick={solicitarNovoNome}
                className="label-caps hidden whitespace-nowrap text-secondary transition-colors hover:text-primary lg:inline"
                aria-label="Alterar nome do cozinheiro"
              >
                Cozinheiro <span className="text-primary">{nome}</span>
              </button>
            )}
            <span
              className="material-symbols-outlined cursor-pointer hover:opacity-70"
              aria-label="Buscar"
            >
              search
            </span>
          </div>
        </div>
      </header>

      <nav
        className="fixed bottom-0 z-50 flex h-16 w-full items-center justify-around border-t border-hairline bg-surface/90 px-4 backdrop-blur-lg md:hidden"
        aria-label="Navegação principal"
      >
        {ITENS_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              ativo === item.href
                ? "flex flex-col items-center justify-center text-primary"
                : "flex flex-col items-center justify-center text-secondary opacity-60"
            }
          >
            <span className="material-symbols-outlined mb-1">{item.icone}</span>
            <span className="label-caps text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
