// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Auditoria automatizada das fontes de imagem usadas pela página Receitas
 * (catálogo): garante que os componentes do caminho de renderização do
 * catálogo (RecipeCard, GaleriaReceitas, CatalogoReceitas, resolve-recipe-image,
 * manifesto) nunca referenciam imagens remotas, de exemplo/quarentena ou
 * pratos genéricos — apenas o manifesto local aprovado.
 *
 * Escopo deliberadamente restrito ao caminho do catálogo público. Telas
 * fora de escopo desta tarefa (lista, planejador, modo cozinhar) usam
 * `receitas-mock.ts` com imagens remotas do Google Fotos por decisão
 * documentada em sessões anteriores — não fazem parte do catálogo /receitas
 * e não devem ser confundidas com ele nesta auditoria.
 */

const ARQUIVOS_CATALOGO = [
  "src/components/recipe-card.tsx",
  "src/components/galeria-receitas.tsx",
  "src/components/catalogo-receitas.tsx",
  "src/components/busca-receitas.tsx",
  "src/components/imagem-em-preparacao.tsx",
  "src/app/page.tsx",
  "src/lib/images/resolve-recipe-image.ts",
  "src/lib/images/manifesto.ts",
  "src/lib/api/recipes-service.ts",
  "src/app/api/recipes/route.ts",
];

const PADROES_PROIBIDOS = [
  /https?:\/\//i,
  /lh3\.googleusercontent\.com/i,
  /unsplash/i,
  /pexels/i,
  /picsum/i,
  /_nao_utilizar/i,
  /stitch_culin/i,
];

function lerArquivo(relativo: string): string {
  const caminho = path.join(process.cwd(), relativo);
  return fs.readFileSync(caminho, "utf8");
}

describe("Auditoria de fontes de imagem — catálogo de receitas", () => {
  it.each(ARQUIVOS_CATALOGO)("%s não contém referência remota, de exemplo ou de quarentena", (relativo) => {
    const conteudo = lerArquivo(relativo);
    for (const padrao of PADROES_PROIBIDOS) {
      // resolve-recipe-image.ts é o único lugar do catálogo autorizado a
      // *citar* `_nao_utilizar` em comentário/documentação — é o guardião
      // que bloqueia esse diretório; o teste dedicado "resolve-recipe-image.test.ts"
      // confirma o bloqueio em tempo de execução.
      if (relativo.endsWith("resolve-recipe-image.ts") && padrao.source.includes("nao_utilizar")) {
        continue;
      }
      expect(conteudo).not.toMatch(padrao);
    }
  });

  it("o manifesto de imagens não referencia _nao_utilizar nem _auditoria", () => {
    const conteudo = lerArquivo("data/manifesto-imagens-site.csv");
    expect(conteudo).not.toMatch(/_nao_utilizar/i);
    expect(conteudo).not.toMatch(/_auditoria/i);
  });

  it("todos os arquivos aprovados no manifesto existem em public/images/recipes", () => {
    const conteudo = lerArquivo("data/manifesto-imagens-site.csv");
    const linhas = conteudo.split("\n").slice(1).filter(Boolean);
    const dirAprovado = path.join(process.cwd(), "public", "images", "recipes");
    let checadas = 0;
    for (const linha of linhas) {
      const campos = linha.split(",");
      const status = campos[6];
      const caminho = campos[4];
      if (status === "APROVADA" && caminho) {
        const nome = path.basename(caminho.trim());
        const caminhoCompleto = path.join(dirAprovado, nome);
        expect(fs.existsSync(caminhoCompleto)).toBe(true);
        checadas++;
      }
    }
    expect(checadas).toBeGreaterThan(0);
  });

  it("nenhum arquivo em public/images/recipes é órfão de teste (999-*)", () => {
    const dirAprovado = path.join(process.cwd(), "public", "images", "recipes");
    const arquivos = fs.existsSync(dirAprovado) ? fs.readdirSync(dirAprovado) : [];
    const orfaosDeTeste = arquivos.filter((a) => a.startsWith("999-"));
    expect(orfaosDeTeste).toEqual([]);
  });
});
