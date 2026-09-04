import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GaleriaReceitas } from "@/components/galeria-receitas";
import type { RecipeDTO, RecipesPage } from "@/lib/notion/types";

/**
 * Testes de componente da galeria: contador com aria-live, botão "Carregar
 * mais" acessível (teclado, aria-busy, foco), desaparecimento ao final,
 * mensagem "Todas as receitas foram carregadas.", e reinício da busca.
 */

function criarReceita(order: number): RecipeDTO {
  return {
    slug: `receita-${order}`,
    title: `Receita ${order}`,
    ingredients: [],
    instructions: [],
    image: null,
    source: null,
    order,
    updatedAt: null,
  };
}

function paginaCom(items: RecipeDTO[], total: number, hasMore: boolean, nextCursor: string | null): RecipesPage {
  return { items, total, hasMore, nextCursor };
}

describe("GaleriaReceitas", () => {
  it("renderiza exatamente 6 receitas na primeira exibição com contador '6 de 85 receitas'", () => {
    const inicial = paginaCom(
      Array.from({ length: 6 }, (_, i) => criarReceita(i + 1)),
      85,
      true,
      "cursor-1",
    );
    render(<GaleriaReceitas paginaInicial={inicial} pageSize={6} />);

    expect(screen.getAllByRole("link")).toHaveLength(6);
    expect(screen.getByText(/6 de 85 receitas/)).toBeInTheDocument();
  });

  it("contador possui aria-live=polite", () => {
    const inicial = paginaCom([criarReceita(1)], 85, true, "cursor-1");
    render(<GaleriaReceitas paginaInicial={inicial} pageSize={6} />);
    const contador = screen.getByText(/de 85 receitas/);
    expect(contador).toHaveAttribute("aria-live", "polite");
  });

  it("clique em 'Carregar mais' carrega mais 6 (total acumulado 12) e não duplica", async () => {
    const inicial = paginaCom(
      Array.from({ length: 6 }, (_, i) => criarReceita(i + 1)),
      85,
      true,
      "cursor-1",
    );
    const segundaPagina = paginaCom(
      Array.from({ length: 6 }, (_, i) => criarReceita(i + 7)),
      85,
      true,
      "cursor-2",
    );
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => segundaPagina,
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<GaleriaReceitas paginaInicial={inicial} pageSize={6} />);

    const botao = screen.getByRole("button", { name: /carregar mais/i });
    await user.click(botao);

    await waitFor(() => {
      expect(screen.getByText(/12 de 85 receitas/)).toBeInTheDocument();
    });

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(12);
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("botão 'Carregar mais' funciona por teclado (Enter)", async () => {
    const inicial = paginaCom([criarReceita(1)], 85, true, "cursor-1");
    const segundaPagina = paginaCom([criarReceita(2)], 85, false, null);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => segundaPagina,
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<GaleriaReceitas paginaInicial={inicial} pageSize={6} />);

    const botao = screen.getByRole("button", { name: /carregar mais/i });
    botao.focus();
    expect(botao).toHaveFocus();
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText(/2 de 85 receitas/)).toBeInTheDocument();
    });
  });

  it("mostra 'Carregando…' com aria-busy durante o carregamento", async () => {
    const inicial = paginaCom([criarReceita(1)], 85, true, "cursor-1");
    let resolver: (v: unknown) => void = () => {};
    global.fetch = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolver = resolve;
      }),
    ) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<GaleriaReceitas paginaInicial={inicial} pageSize={6} />);

    const botao = screen.getByRole("button", { name: /carregar mais/i });
    await user.click(botao);

    expect(screen.getByRole("button", { name: /carregando/i })).toHaveAttribute(
      "aria-busy",
      "true",
    );

    resolver({ ok: true, json: async () => paginaCom([criarReceita(2)], 85, false, null) });
  });

  it("botão desaparece e mostra 'Todas as receitas foram carregadas.' quando chega a 85 de 85", async () => {
    const inicial = paginaCom([criarReceita(1)], 85, true, "cursor-1");
    const ultimaPagina = paginaCom(
      Array.from({ length: 84 }, (_, i) => criarReceita(i + 2)),
      85,
      false,
      null,
    );
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ultimaPagina,
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<GaleriaReceitas paginaInicial={inicial} pageSize={6} />);

    const botao = screen.getByRole("button", { name: /carregar mais/i });
    await user.click(botao);

    await waitFor(() => {
      expect(screen.getByText(/85 de 85 receitas/)).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /carregar mais/i })).not.toBeInTheDocument();
    expect(screen.getByText("Todas as receitas foram carregadas.")).toBeInTheDocument();
  });

  it("com busca ativa, o contador mostra 'receitas encontradas' usando o total filtrado", () => {
    const inicial = paginaCom([criarReceita(1)], 3, false, null);
    render(<GaleriaReceitas paginaInicial={inicial} pageSize={6} query="bolo" />);
    expect(screen.getByText(/1 de 3 receitas encontradas/)).toBeInTheDocument();
  });

  it("mostra quantidade restante calculada (total filtrado - total exibido)", () => {
    const inicial = paginaCom(
      Array.from({ length: 6 }, (_, i) => criarReceita(i + 1)),
      85,
      true,
      "cursor-1",
    );
    render(<GaleriaReceitas paginaInicial={inicial} pageSize={6} />);
    expect(screen.getByText(/79 restantes/)).toBeInTheDocument();
  });

  it("com scope='all', o fetch de 'Carregar mais' envia scope=all na querystring", async () => {
    const inicial = paginaCom(
      Array.from({ length: 6 }, (_, i) => criarReceita(i + 1)),
      85,
      true,
      "cursor-1",
    );
    const segundaPagina = paginaCom(
      Array.from({ length: 6 }, (_, i) => criarReceita(i + 7)),
      85,
      true,
      "cursor-2",
    );
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => segundaPagina,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<GaleriaReceitas paginaInicial={inicial} pageSize={6} scope="all" />);
    await user.click(screen.getByRole("button", { name: /carregar mais/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const urlChamada = String(fetchMock.mock.calls[0][0]);
    expect(urlChamada).toContain("scope=all");
  });

  it("progressão completa com scope='all' chega a 85 de 85 e mostra a mensagem final", async () => {
    const inicial = paginaCom([criarReceita(1)], 85, true, "cursor-1");
    const ultimaPagina = paginaCom(
      Array.from({ length: 84 }, (_, i) => criarReceita(i + 2)),
      85,
      false,
      null,
    );
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ultimaPagina,
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<GaleriaReceitas paginaInicial={inicial} pageSize={6} scope="all" />);
    await user.click(screen.getByRole("button", { name: /carregar mais/i }));

    await waitFor(() => {
      expect(screen.getByText(/85 de 85 receitas/)).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /carregar mais/i })).not.toBeInTheDocument();
    expect(screen.getByText("Todas as receitas foram carregadas.")).toBeInTheDocument();
  });

  it("a grade usa classes responsivas (1 coluna mobile, 2 tablet, 3 desktop) sem largura fixa em px", () => {
    const inicial = paginaCom(
      Array.from({ length: 6 }, (_, i) => criarReceita(i + 1)),
      85,
      true,
      "cursor-1",
    );
    const { container } = render(<GaleriaReceitas paginaInicial={inicial} pageSize={6} />);
    const grid = container.querySelector(".grid");
    expect(grid).toBeTruthy();
    expect(grid?.className).toContain("grid-cols-1");
    expect(grid?.className).toContain("md:grid-cols-2");
    expect(grid?.className).toContain("lg:grid-cols-3");
    // Nenhuma largura fixa em pixels que impeça os cards de encolher.
    expect(grid?.className).not.toMatch(/w-\[\d+px\]/);
  });

  it("o contador não usa largura fixa que force overflow em telas estreitas", () => {
    const inicial = paginaCom([criarReceita(1)], 85, true, "cursor-1");
    const { container } = render(<GaleriaReceitas paginaInicial={inicial} pageSize={6} />);
    const contadorWrapper = container.querySelector(".mb-4");
    expect(contadorWrapper?.className).not.toMatch(/w-\[\d+px\]/);
  });
});
