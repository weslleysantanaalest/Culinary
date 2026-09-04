export type PeriodoRefeicao = "CAFÉ" | "ALMOÇO" | "JANTAR";

/**
 * Uma refeição planejada em um dia/período específico. Ver RF-020 a RF-024
 * (Planejador).
 */
export interface PlanejamentoRefeicao {
  id: string;
  data: string; // ISO 8601 (YYYY-MM-DD)
  periodo: PeriodoRefeicao;
  horario?: string; // HH:mm, quando aplicável (visão de agenda mobile)
  receitaId: string;
  rotulo?: string; // ex.: "RÁPIDO", "ESPECIAL", "SOBRAS", "HOJE"
}
