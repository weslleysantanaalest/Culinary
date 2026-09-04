import type { PlanejamentoRefeicao } from "@/types";

/**
 * Mock de planejamentos de refeição para a semana de 24 a 30 de agosto de
 * 2026 (segunda a domingo contendo a data atual, 28/08/2026 = sexta-feira).
 * Referencia `receitaId` do dataset único em `src/data/receitas.ts` (ADR-005).
 */
export const planejamentosRefeicao: PlanejamentoRefeicao[] = [
  {
    id: "plan-seg-almoco",
    data: "2026-08-24",
    periodo: "ALMOÇO",
    receitaId: "salada-quinoa-vegetais-tahine",
  },
  {
    id: "plan-ter-cafe",
    data: "2026-08-25",
    periodo: "CAFÉ",
    horario: "08:00",
    receitaId: "pao-levain-abacate-ovo-poche",
    rotulo: "RÁPIDO",
  },
  {
    id: "plan-qua-jantar",
    data: "2026-08-26",
    periodo: "JANTAR",
    receitaId: "risoto-cogumelos",
    rotulo: "SOBRAS",
  },
  {
    id: "plan-sex-jantar",
    data: "2026-08-28",
    periodo: "JANTAR",
    horario: "19:30",
    receitaId: "salmao-grelhado-aspargos",
    rotulo: "HOJE",
  },
  {
    id: "plan-sab-cafe",
    data: "2026-08-29",
    periodo: "CAFÉ",
    receitaId: "panqueca-perfeita",
    rotulo: "ESPECIAL",
  },
  {
    id: "plan-sab-almoco",
    data: "2026-08-29",
    periodo: "ALMOÇO",
    receitaId: "salada-caprese",
  },
  {
    id: "plan-dom-jantar",
    data: "2026-08-30",
    periodo: "JANTAR",
    receitaId: "ramen-tradicional-tonkotsu",
  },
];
