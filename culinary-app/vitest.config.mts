import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      // server-only lança erro fora do runtime do Next.js; em testes unitários
      // (vitest/node), o módulo real não é necessário — apenas o efeito de
      // marcação em build. Mapear para um módulo vazio permite testar
      // unidades server-only sem acoplar o teste ao bundler do Next.
      "server-only": path.resolve(import.meta.dirname, "./src/test/server-only-mock.ts"),
    },
  },
});
