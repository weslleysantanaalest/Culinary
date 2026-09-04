// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Testes de listarReceitas: carregamento progressivo de 6 em 6, preservação
 * da ordenação por Ordem, comportamento de busca (reinicia para os primeiros
 * N e filtra o total), garantia de que apenas imagens do manifesto aprovado
 * (nunca quarentena) são usadas, e o escopo de leitura (`somentePublicadas`)
 * que decide entre a regra editorial (Publicado=true) e o catálogo público
 * completo (todas as 85, decisão editorial explícita do usuário).
 *
 * O client Notion é mockado para simular exatamente 85 receitas, ordenadas
 * por Ordem, replicando o banco real "Caderno de Receitas — Livro 3 (1)" sem
 * depender de rede/token. Reflete a realidade real do Notion: apenas a
 * Ordem 1 tem Publicado=true; as demais 84 têm Publicado=false.
 */

vi.mock("@/lib/notion/env", () => ({
  getNotionConfig: () => ({ token: "fake-token", dataSourceId: "fake-id" }),
}));

function construirReceitaCrua(ordem: number, titulo: string, publicado: boolean) {
  const slug = `receita-${ordem}`;
  return {
    id: `page-${ordem}`,
    properties: {
      Receita: { title: [{ plain_text: titulo }] },
      Slug: { rich_text: [{ plain_text: slug }] },
      Publicado: { checkbox: publicado },
      Ingredientes: { rich_text: [{ plain_text: "" }] },
      "Modo de preparo": { rich_text: [{ plain_text: "" }] },
      Ordem: { number: ordem },
      Fonte: { url: null },
      "Atualizado em": { date: null },
    },
  };
}

const TOTAL_RECEITAS = 85;
const TITULOS: Record<number, string> = {
  1: "Pudim de coco queimado",
  85: "Torta assombrosa (Lucia Poteller)",
};
for (let i = 2; i <= 84; i++) TITULOS[i] = `Receita Genérica ${i}`;

const { queryDataSourceMock } = vi.hoisted(() => ({ queryDataSourceMock: vi.fn() }));

vi.mock("@/lib/notion/client", () => ({
  queryDataSource: queryDataSourceMock,
}));

beforeAll(() => {
  const receitasCruas = Array.from({ length: TOTAL_RECEITAS }, (_, i) => {
    const ordem = i + 1;
    // Reflete a realidade real do Notion: só a Ordem 1 está Publicado=true.
    return construirReceitaCrua(ordem, TITULOS[ordem], ordem === 1);
  });
  queryDataSourceMock.mockImplementation(async (params: { filterPublicado?: boolean }) => ({
    results: params?.filterPublicado
      ? receitasCruas.filter((p) => p.properties.Publicado.checkbox === true)
      : receitasCruas,
    has_more: false,
    next_cursor: null,
  }));
});

beforeEach(() => {
  vi.resetModules();
});

describe("listarReceitas — escopo de leitura (somentePublicadas)", () => {
  it("somentePublicadas=true (padrão) retorna só a receita com Publicado=true (1 de 85)", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const pagina = await listarReceitas({ limit: 6 });
    expect(pagina.total).toBe(1);
    expect(pagina.items).toHaveLength(1);
    expect(pagina.items[0].order).toBe(1);
  });

  it("somentePublicadas=false retorna as 85 receitas, ignorando Publicado", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const pagina = await listarReceitas({ limit: 6, somentePublicadas: false });
    expect(pagina.total).toBe(85);
    expect(pagina.items).toHaveLength(6);
    expect(pagina.items.map((r) => r.order)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("somentePublicadas=false nunca pede filtro Publicado ao Notion (nenhuma escrita, só leitura)", async () => {
    queryDataSourceMock.mockClear();
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    await listarReceitas({ limit: 6, somentePublicadas: false });
    for (const chamada of queryDataSourceMock.mock.calls) {
      const params = chamada[0] as { filterPublicado?: boolean };
      expect(params.filterPublicado).toBeFalsy();
    }
  });
});

describe("listarReceitas — carregamento progressivo de 6 em 6 (scope=all, 85 receitas)", () => {
  it("primeira renderização retorna exatamente 6 receitas de 85", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const pagina = await listarReceitas({ limit: 6, somentePublicadas: false });
    expect(pagina.items).toHaveLength(6);
    expect(pagina.total).toBe(85);
    expect(pagina.hasMore).toBe(true);
  });

  it("preserva a ordenação por Ordem nos 6 primeiros itens", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const pagina = await listarReceitas({ limit: 6, somentePublicadas: false });
    expect(pagina.items.map((r) => r.order)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("primeiro clique em 'Carregar mais' chega a 12 de 85", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const primeira = await listarReceitas({ limit: 6, somentePublicadas: false });
    const segunda = await listarReceitas({
      limit: 6,
      cursor: primeira.nextCursor,
      somentePublicadas: false,
    });
    const acumulado = [...primeira.items, ...segunda.items];
    expect(acumulado).toHaveLength(12);
    expect(acumulado.map((r) => r.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("nenhuma receita é duplicada ao longo de múltiplos carregamentos", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    let cursor: string | null = null;
    const ordens: number[] = [];
    for (let i = 0; i < 15; i++) {
      const pagina = await listarReceitas({ limit: 6, cursor, somentePublicadas: false });
      ordens.push(...pagina.items.map((r) => r.order as number));
      if (!pagina.hasMore) break;
      cursor = pagina.nextCursor;
    }
    expect(new Set(ordens).size).toBe(ordens.length);
  });

  it("cliques sucessivos chegam exatamente a 85 de 85 (último lote = 1)", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    let cursor: string | null = null;
    let acumulado = 0;
    let ultimaPagina;
    const progressao: number[] = [];
    for (let i = 0; i < 20; i++) {
      const pagina = await listarReceitas({ limit: 6, cursor, somentePublicadas: false });
      acumulado += pagina.items.length;
      progressao.push(acumulado);
      ultimaPagina = pagina;
      if (!pagina.hasMore) break;
      cursor = pagina.nextCursor;
    }
    expect(acumulado).toBe(85);
    expect(ultimaPagina?.hasMore).toBe(false);
    expect(ultimaPagina?.items).toHaveLength(1);
    expect(progressao).toEqual([6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 85]);
  });

  it("botão some (hasMore=false) exatamente quando os 85 itens foram carregados", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const pagina = await listarReceitas({ limit: 6, cursor: null, somentePublicadas: false });
    let cursor = pagina.nextCursor;
    let ultima = pagina;
    for (let i = 0; i < 14; i++) {
      ultima = await listarReceitas({ limit: 6, cursor, somentePublicadas: false });
      cursor = ultima.nextCursor;
    }
    expect(ultima.hasMore).toBe(false);
    expect(ultima.nextCursor).toBeNull();
  });

  it("busca filtra por título sobre as 85 e reinicia a contagem (total = total filtrado)", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const pagina = await listarReceitas({
      limit: 6,
      query: "pudim de coco queimado",
      somentePublicadas: false,
    });
    expect(pagina.total).toBe(1);
    expect(pagina.items).toHaveLength(1);
    expect(pagina.items[0].title).toBe("Pudim de coco queimado");
    expect(pagina.hasMore).toBe(false);
  });

  it("busca é insensível a acentos e maiúsculas/minúsculas", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const pagina = await listarReceitas({
      limit: 6,
      query: "TORTA ASSOMBROSA",
      somentePublicadas: false,
    });
    expect(pagina.total).toBe(1);
    expect(pagina.items[0].title).toBe("Torta assombrosa (Lucia Poteller)");
  });

  it("sem busca, retorna o total real de 85 (nunca 86)", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const pagina = await listarReceitas({ limit: 6, somentePublicadas: false });
    expect(pagina.total).toBe(85);
    expect(pagina.total).not.toBe(86);
  });

  it("última receita da progressão é a Ordem 85 (Torta assombrosa)", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    let cursor: string | null = null;
    let ultima;
    for (let i = 0; i < 15; i++) {
      const pagina = await listarReceitas({ limit: 6, cursor, somentePublicadas: false });
      ultima = pagina.items[pagina.items.length - 1];
      if (!pagina.hasMore) break;
      cursor = pagina.nextCursor;
    }
    expect(ultima?.order).toBe(85);
    expect(ultima?.title).toBe("Torta assombrosa (Lucia Poteller)");
  });
});

describe("listarReceitas — resolução de imagem via manifesto (nunca quarentena, nunca remota)", () => {
  const CAMINHO_MANIFESTO = path.join(process.cwd(), "data", "manifesto-imagens-site.csv");
  let manifestoOriginal: string;

  beforeAll(() => {
    manifestoOriginal = fs.readFileSync(CAMINHO_MANIFESTO, "utf8");
  });

  afterEach(() => {
    fs.writeFileSync(CAMINHO_MANIFESTO, manifestoOriginal);
  });

  it("receita Ordem 1 resolve para a imagem aprovada real do manifesto", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const pagina = await listarReceitas({ limit: 1, somentePublicadas: false });
    expect(pagina.items[0].image).toBe("/images/recipes/001-pudim-de-coco-queimado.webp");
  });

  it("receita sem imagem aprovada retorna image=null (placeholder no componente)", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const pagina = await listarReceitas({ limit: 6, cursor: null, somentePublicadas: false });
    const ordem2 = pagina.items.find((r) => r.order === 2);
    expect(ordem2?.image).toBeNull();
  });

  it("as 12 receitas aprovadas resolvem para imagem local; as demais 73 ficam null (placeholder)", async () => {
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const APROVADAS = new Set([1, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 16]);
    let cursor: string | null = null;
    const todos: { order: number | null; image: string | null }[] = [];
    for (let i = 0; i < 15; i++) {
      const pagina = await listarReceitas({ limit: 6, cursor, somentePublicadas: false });
      todos.push(...pagina.items.map((r) => ({ order: r.order, image: r.image })));
      if (!pagina.hasMore) break;
      cursor = pagina.nextCursor;
    }
    expect(todos).toHaveLength(85);
    const comImagem = todos.filter((r) => r.image !== null);
    const semImagem = todos.filter((r) => r.image === null);
    expect(comImagem).toHaveLength(12);
    expect(semImagem).toHaveLength(73);
    for (const r of comImagem) {
      expect(APROVADAS.has(r.order as number)).toBe(true);
      expect(r.image).toMatch(/^\/images\/recipes\//);
    }
  });

  it("nunca resolve para um caminho dentro de _nao_utilizar (quarentena)", async () => {
    fs.writeFileSync(
      CAMINHO_MANIFESTO,
      [
        "Ordem,ID,Receita,Slug,Caminho,Hash,Status,Motivo,Utilizada",
        "1,8,Pudim de coco queimado,pudim-de-coco-queimado,img/_nao_utilizar/versoes_rejeitadas/x/screen.png,abc,APROVADA,tentativa maliciosa,sim",
      ].join("\n"),
    );
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const pagina = await listarReceitas({ limit: 1, somentePublicadas: false });
    expect(pagina.items[0].image).toBeNull();
  });

  it("nunca resolve para uma URL remota (http/https) mesmo que o manifesto seja adulterado", async () => {
    fs.writeFileSync(
      CAMINHO_MANIFESTO,
      [
        "Ordem,ID,Receita,Slug,Caminho,Hash,Status,Motivo,Utilizada",
        "1,8,Pudim de coco queimado,pudim-de-coco-queimado,https://lh3.googleusercontent.com/x.jpg,abc,APROVADA,tentativa maliciosa,sim",
      ].join("\n"),
    );
    const { listarReceitas } = await import("@/lib/api/recipes-service");
    const pagina = await listarReceitas({ limit: 1, somentePublicadas: false });
    expect(pagina.items[0].image).toBeNull();
  });
});
