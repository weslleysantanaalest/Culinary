import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecipeCard } from "@/components/recipe-card";
import type { RecipeDTO } from "@/lib/notion/types";

describe("RecipeCard", () => {
  it("mostra a imagem quando receita.image está preenchida", () => {
    const receita: RecipeDTO = {
      slug: "bolo-de-ameixas",
      title: "Bolo de ameixas",
      ingredients: [],
      instructions: [],
      image: "/images/recipes/013-bolo-de-ameixas.webp",
      source: null,
      order: 13,
      updatedAt: null,
    };
    render(<RecipeCard receita={receita} />);
    const img = screen.getByRole("img", { name: "Bolo de ameixas" });
    expect(img).toHaveAttribute("src", expect.stringContaining("013-bolo-de-ameixas"));
  });

  it("mostra placeholder com texto 'Imagem pendente para [nome]' quando image é null", () => {
    const receita: RecipeDTO = {
      slug: "receita-sem-imagem",
      title: "Receita Sem Imagem",
      ingredients: [],
      instructions: [],
      image: null,
      source: null,
      order: 20,
      updatedAt: null,
    };
    render(<RecipeCard receita={receita} />);
    expect(
      screen.getByRole("img", { name: "Imagem pendente para Receita Sem Imagem" }),
    ).toBeInTheDocument();
  });

  it("nunca usa caminho de _nao_utilizar mesmo que informado por engano no DTO", () => {
    const receita: RecipeDTO = {
      slug: "receita-x",
      title: "Receita X",
      ingredients: [],
      instructions: [],
      image: null, // resolveRecipeImage já garante isso nunca aponta para quarentena
      source: null,
      order: 2,
      updatedAt: null,
    };
    render(<RecipeCard receita={receita} />);
    expect(screen.queryByRole("img", { name: /nao_utilizar/i })).not.toBeInTheDocument();
  });

  it("gera link /receitas/{slug} quando a receita tem slug preenchido", () => {
    const receita: RecipeDTO = {
      slug: "molho-zabaglione",
      title: "Molho zabaglione",
      ingredients: [],
      instructions: [],
      image: null,
      source: null,
      order: 2,
      updatedAt: null,
    };
    render(<RecipeCard receita={receita} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/receitas/molho-zabaglione");
  });

  it("não renderiza link (evita rota inválida) quando a receita não tem slug preenchido no Notion", () => {
    const receita: RecipeDTO = {
      slug: "",
      title: "Receita Sem Slug",
      ingredients: [],
      instructions: [],
      image: null,
      source: null,
      order: 40,
      updatedAt: null,
    };
    render(<RecipeCard receita={receita} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    // A receita continua visível (título e placeholder), apenas sem link clicável.
    expect(screen.getByText("Receita Sem Slug")).toBeInTheDocument();
  });

  it("usa object-cover na imagem para não deformar a foto em qualquer largura de coluna", () => {
    const receita: RecipeDTO = {
      slug: "bolo-de-ameixas",
      title: "Bolo de ameixas",
      ingredients: [],
      instructions: [],
      image: "/images/recipes/013-bolo-de-ameixas.webp",
      source: null,
      order: 13,
      updatedAt: null,
    };
    render(<RecipeCard receita={receita} />);
    const img = screen.getByRole("img", { name: "Bolo de ameixas" });
    expect(img.className).toContain("object-cover");
  });

  it("imagem e placeholder usam a mesma proporção 4/5 na área de mídia do card", () => {
    const base = {
      slug: "x",
      ingredients: [],
      instructions: [],
      source: null,
      order: 1,
      updatedAt: null,
    };
    const { container: comImagem } = render(
      <RecipeCard receita={{ ...base, title: "Com imagem", image: "/images/recipes/013-bolo-de-ameixas.webp" }} />,
    );
    const { container: semImagem } = render(
      <RecipeCard receita={{ ...base, title: "Sem imagem", image: null }} />,
    );
    expect(comImagem.querySelector(".aspect-\\[4\\/5\\]")).toBeTruthy();
    expect(semImagem.querySelector(".aspect-\\[4\\/5\\]")).toBeTruthy();
  });

  it("nunca renderiza uma imagem com URL remota (http/https) na página Receitas", () => {
    const receita: RecipeDTO = {
      slug: "bolo-de-ameixas",
      title: "Bolo de ameixas",
      ingredients: [],
      instructions: [],
      image: "/images/recipes/013-bolo-de-ameixas.webp",
      source: null,
      order: 13,
      updatedAt: null,
    };
    render(<RecipeCard receita={receita} />);
    const img = screen.getByRole("img", { name: "Bolo de ameixas" });
    const src = img.getAttribute("src") ?? "";
    expect(src).not.toMatch(/^https?:\/\//);
    expect(src).not.toContain("googleusercontent");
    expect(src).not.toContain("unsplash");
    expect(src).not.toContain("pexels");
  });
});
