// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resolveRecipeImage, resolveRecipeImageDetalhado } from "@/lib/images/resolve-recipe-image";
import { _resetCacheManifesto } from "@/lib/images/manifesto";

/**
 * Testes de resolveRecipeImage: agora consulta o manifesto central (CSV) em
 * vez do filesystem de img/ diretamente. Cobre resolução por Ordem, ausência,
 * receita rejeitada/sem imagem, path traversal no valor do manifesto, e
 * garante nunca usar imagens de quarentena (o manifesto já as exclui, mas o
 * teste confirma o contrato: arquivo referenciado tem que existir no
 * diretório aprovado).
 */

const DIR_APROVADO = path.join(process.cwd(), "public", "images", "recipes");
const CAMINHO_MANIFESTO = path.join(process.cwd(), "data", "manifesto-imagens-site.csv");
const ARQUIVO_TESTE = "999-receita-de-teste-temporaria.webp";
const CAMINHO_ARQUIVO_TESTE = path.join(DIR_APROVADO, ARQUIVO_TESTE);

let manifestoOriginal: string;

beforeAll(() => {
  fs.mkdirSync(DIR_APROVADO, { recursive: true });
  fs.writeFileSync(CAMINHO_ARQUIVO_TESTE, "conteudo-fake-webp");
  manifestoOriginal = fs.readFileSync(CAMINHO_MANIFESTO, "utf8");
});

afterEach(() => {
  fs.writeFileSync(CAMINHO_MANIFESTO, manifestoOriginal);
  _resetCacheManifesto();
});

// Remove o arquivo fixture de public/ ao final da suíte, para não deixar
// resíduo de teste no diretório de imagens aprovadas do app.
afterAll(() => {
  try {
    fs.unlinkSync(CAMINHO_ARQUIVO_TESTE);
  } catch {
    // já removido ou nunca criado; nada a fazer.
  }
});

function escreverManifesto(linhas: string[]) {
  const cabecalho = "Ordem,ID,Receita,Slug,Caminho,Hash,Status,Motivo,Utilizada";
  fs.writeFileSync(CAMINHO_MANIFESTO, [cabecalho, ...linhas].join("\n") + "\n");
  _resetCacheManifesto();
}

describe("resolveRecipeImage", () => {
  beforeEach(() => {
    _resetCacheManifesto();
  });

  it("resolve pela Ordem quando a entrada está APROVADA e o arquivo existe", () => {
    escreverManifesto([
      `900,1,Receita Teste,receita-teste,img/${ARQUIVO_TESTE},abc123,APROVADA,ok,sim`,
    ]);
    expect(resolveRecipeImage({ order: 900, slug: "receita-teste", title: "Receita Teste" })).toBe(
      `/images/recipes/${ARQUIVO_TESTE}`,
    );
  });

  it("retorna null quando a receita não está no manifesto", () => {
    escreverManifesto([]);
    expect(resolveRecipeImage({ order: 12345, slug: "inexistente", title: "X" })).toBeNull();
  });

  it("retorna null quando a entrada está REJEITADA", () => {
    escreverManifesto(["901,2,Receita Rejeitada,receita-rejeitada,,,REJEITADA,motivo,nao"]);
    expect(resolveRecipeImage({ order: 901, slug: "receita-rejeitada", title: "X" })).toBeNull();
  });

  it("retorna null quando a entrada está SEM_IMAGEM", () => {
    escreverManifesto(["902,3,Receita Sem Imagem,receita-sem-imagem,,,SEM_IMAGEM,motivo,nao"]);
    expect(resolveRecipeImage({ order: 902, slug: "receita-sem-imagem", title: "X" })).toBeNull();
  });

  it("retorna null quando aprovada no manifesto mas o arquivo não existe em disco", () => {
    escreverManifesto([
      "903,4,Receita Fantasma,receita-fantasma,img/000-nao-existe.webp,abc,APROVADA,ok,sim",
    ]);
    expect(resolveRecipeImage({ order: 903, slug: "receita-fantasma", title: "X" })).toBeNull();
  });

  it("rejeita path traversal no campo Caminho do manifesto", () => {
    escreverManifesto([
      "904,5,Receita Maliciosa,receita-maliciosa,../../etc/passwd,abc,APROVADA,ok,sim",
    ]);
    expect(resolveRecipeImage({ order: 904, slug: "receita-maliciosa", title: "X" })).toBeNull();
  });

  it("nunca resolve uma imagem para a receita errada (isolamento por Ordem)", () => {
    escreverManifesto([
      `905,6,Receita A,receita-a,img/${ARQUIVO_TESTE},abc,APROVADA,ok,sim`,
      "906,7,Receita B,receita-b,,,SEM_IMAGEM,motivo,nao",
    ]);
    expect(resolveRecipeImage({ order: 905, slug: "receita-a", title: "Receita A" })).toBe(
      `/images/recipes/${ARQUIVO_TESTE}`,
    );
    expect(resolveRecipeImage({ order: 906, slug: "receita-b", title: "Receita B" })).toBeNull();
  });

  it("resolve as 12 receitas aprovadas reais do manifesto de produção", () => {
    _resetCacheManifesto();
    fs.writeFileSync(CAMINHO_MANIFESTO, manifestoOriginal);
    _resetCacheManifesto();
    const aprovadasPorOrdem: Record<number, string> = {
      1: "001-pudim-de-coco-queimado.webp",
      3: "003-champanhita.webp",
      4: "004-glace-para-bolo.webp",
      5: "005-bolo-sarah.webp",
      6: "006-pao-irlandes-com-pastel.webp",
      7: "007-pudim-frances.webp",
      9: "009-pudim-de-ameixas-e-claras-sugi.webp",
      10: "010-bolo-de-fuba-clarice.webp",
      11: "011-gelatina-com-salada-de-frutas.webp",
      13: "013-bolo-de-ameixas.webp",
      14: "014-bolachinhas-quaker.webp",
      16: "016-sequilho-de-fuba.webp",
    };
    for (const [ordem, arquivo] of Object.entries(aprovadasPorOrdem)) {
      expect(resolveRecipeImage({ order: Number(ordem), slug: null, title: null })).toBe(
        `/images/recipes/${arquivo}`,
      );
    }
  });
});

describe("resolveRecipeImageDetalhado", () => {
  it("informa o motivo de ausência para o relatório de cobertura", () => {
    escreverManifesto(["910,8,Receita Sem Imagem,receita-x,,,SEM_IMAGEM,Nenhuma imagem ainda.,nao"]);
    const resultado = resolveRecipeImageDetalhado({ order: 910, slug: "receita-x", title: "X" });
    expect(resultado.url).toBeNull();
    expect(resultado.ausente).toBe(true);
    expect(resultado.motivo).toBe("Nenhuma imagem ainda.");
  });

  it("ausente=false e url preenchida quando aprovada", () => {
    escreverManifesto([
      `911,9,Receita OK,receita-ok,img/${ARQUIVO_TESTE},abc,APROVADA,ok,sim`,
    ]);
    const resultado = resolveRecipeImageDetalhado({ order: 911, slug: "receita-ok", title: "X" });
    expect(resultado.ausente).toBe(false);
    expect(resultado.url).toBe(`/images/recipes/${ARQUIVO_TESTE}`);
  });
});
