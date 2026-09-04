import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // ATENÇÃO — pattern temporário fora de fase.
    // As telas Modo Cozinhar (/cozinhar), Lista de Ingredientes (/lista) e
    // Planejador (/planejador) ainda leem da fixture de teste
    // `src/test/fixtures/receitas-mock.ts`, cujas `imagemUrl` apontam para
    // lh3.googleusercontent.com. Enquanto essas telas não migrarem para o
    // backend Notion/imagens locais, o next/image precisa deste remotePattern
    // para não lançar "Invalid src prop ... hostname not configured".
    // REMOVER quando cozinhar/lista/planejador saírem da fixture.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
