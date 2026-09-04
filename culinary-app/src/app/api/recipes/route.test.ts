// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

/**
 * Testes de GET /api/recipes: validação do parâmetro `scope` (all|published),
 * nunca confiando em texto livre — qualquer valor fora da lista aceita cai em
 * "published" (o default editorial seguro para consumidores existentes).
 */

const { listarReceitasMock } = vi.hoisted(() => ({ listarReceitasMock: vi.fn() }));

vi.mock("@/lib/api/recipes-service", () => ({
  listarReceitas: listarReceitasMock,
}));

async function chamar(url: string) {
  const { GET } = await import("@/app/api/recipes/route");
  const { NextRequest } = await import("next/server");
  const req = new NextRequest(new URL(url, "http://localhost"));
  return GET(req);
}

describe("GET /api/recipes — validação de scope", () => {
  it("scope=all mapeia para somentePublicadas: false", async () => {
    listarReceitasMock.mockResolvedValue({ items: [], total: 85, nextCursor: null, hasMore: false });
    await chamar("http://localhost/api/recipes?scope=all&limit=6");
    expect(listarReceitasMock).toHaveBeenCalledWith(
      expect.objectContaining({ somentePublicadas: false }),
    );
  });

  it("scope=published mapeia para somentePublicadas: true", async () => {
    listarReceitasMock.mockResolvedValue({ items: [], total: 1, nextCursor: null, hasMore: false });
    await chamar("http://localhost/api/recipes?scope=published&limit=6");
    expect(listarReceitasMock).toHaveBeenCalledWith(
      expect.objectContaining({ somentePublicadas: true }),
    );
  });

  it("sem scope (ausente) usa o default published (somentePublicadas: true)", async () => {
    listarReceitasMock.mockResolvedValue({ items: [], total: 1, nextCursor: null, hasMore: false });
    await chamar("http://localhost/api/recipes?limit=6");
    expect(listarReceitasMock).toHaveBeenCalledWith(
      expect.objectContaining({ somentePublicadas: true }),
    );
  });

  it("valor de scope inválido/arbitrário nunca é confiado — cai em published", async () => {
    listarReceitasMock.mockResolvedValue({ items: [], total: 1, nextCursor: null, hasMore: false });
    await chamar("http://localhost/api/recipes?scope=' OR 1=1&limit=6");
    expect(listarReceitasMock).toHaveBeenCalledWith(
      expect.objectContaining({ somentePublicadas: true }),
    );
  });

  it("scope=all retorna o total de 85 recebido do service (não altera o payload)", async () => {
    listarReceitasMock.mockResolvedValue({
      items: [],
      total: 85,
      nextCursor: null,
      hasMore: false,
    });
    const resp = await chamar("http://localhost/api/recipes?scope=all&limit=6");
    const json = await resp.json();
    expect(json.total).toBe(85);
  });
});
