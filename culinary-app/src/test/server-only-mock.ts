// Mock vazio de "server-only" para testes unitários (vitest/node).
// Fora do runtime do Next.js, o pacote real lança erro ao ser importado de um
// contexto "client"; em testes isso não é aplicável, então este módulo é um
// no-op. Usado apenas via alias em vitest.config.mts — nunca em build/produção.
export {};
