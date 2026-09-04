import { describe, expect, it } from "vitest";
import {
  adicionarDias,
  dataEhAnterior,
  encontrarPlano,
  formatarDiaDoMes,
  formatarIntervaloSemana,
  getDatasDaSemana,
  getHojeIso,
} from "@/lib/planejador";
import type { PlanejamentoRefeicao } from "@/types";

describe("getDatasDaSemana", () => {
  it("retorna 7 datas começando na segunda-feira, quando a referência é uma segunda", () => {
    // 2024-10-14 é uma segunda-feira.
    const datas = getDatasDaSemana("2024-10-14");
    expect(datas).toHaveLength(7);
    expect(datas[0]).toBe("2024-10-14");
    expect(datas[6]).toBe("2024-10-20");
  });

  it("retorna a segunda-feira da mesma semana quando a referência é um domingo", () => {
    // 2024-10-20 é domingo da mesma semana que 2024-10-14.
    const datas = getDatasDaSemana("2024-10-20");
    expect(datas[0]).toBe("2024-10-14");
    expect(datas[6]).toBe("2024-10-20");
  });

  it("retorna a segunda-feira da mesma semana quando a referência é uma quarta", () => {
    // 2024-10-16 é quarta-feira.
    const datas = getDatasDaSemana("2024-10-16");
    expect(datas[0]).toBe("2024-10-14");
    expect(datas[6]).toBe("2024-10-20");
  });
});

describe("encontrarPlano", () => {
  const planos: PlanejamentoRefeicao[] = [
    { id: "p1", data: "2024-10-14", periodo: "ALMOÇO", receitaId: "r1" },
    { id: "p2", data: "2024-10-15", periodo: "CAFÉ", receitaId: "r2" },
  ];

  it("encontra um plano existente por data e período", () => {
    const plano = encontrarPlano(planos, "2024-10-14", "ALMOÇO");
    expect(plano?.id).toBe("p1");
  });

  it("retorna undefined quando não há plano para a combinação", () => {
    expect(encontrarPlano(planos, "2024-10-14", "JANTAR")).toBeUndefined();
  });
});

describe("formatarDiaDoMes", () => {
  it("extrai o dia do mês de uma data ISO", () => {
    expect(formatarDiaDoMes("2024-10-14")).toBe("14");
    expect(formatarDiaDoMes("2024-11-03")).toBe("03");
  });
});

describe("adicionarDias", () => {
  it("soma dias a uma data ISO", () => {
    expect(adicionarDias("2026-08-24", 7)).toBe("2026-08-31");
  });

  it("subtrai dias (valor negativo) de uma data ISO", () => {
    expect(adicionarDias("2026-08-24", -7)).toBe("2026-08-17");
  });

  it("atravessa a virada de mês corretamente", () => {
    expect(adicionarDias("2026-08-28", 7)).toBe("2026-09-04");
  });
});

describe("dataEhAnterior", () => {
  it("retorna true quando a data é anterior à referência", () => {
    expect(dataEhAnterior("2026-08-27", "2026-08-28")).toBe(true);
  });

  it("retorna false quando a data é igual à referência", () => {
    expect(dataEhAnterior("2026-08-28", "2026-08-28")).toBe(false);
  });

  it("retorna false quando a data é posterior à referência", () => {
    expect(dataEhAnterior("2026-08-29", "2026-08-28")).toBe(false);
  });
});

describe("formatarIntervaloSemana", () => {
  it("formata um intervalo dentro do mesmo mês", () => {
    const datas = getDatasDaSemana("2026-08-24");
    expect(formatarIntervaloSemana(datas)).toBe("24 - 30 DE AGOSTO, 2026");
  });

  it("formata um intervalo que atravessa dois meses", () => {
    const datas = getDatasDaSemana("2026-08-31");
    expect(formatarIntervaloSemana(datas)).toBe("31 DE AGOSTO - 06 DE SETEMBRO, 2026");
  });
});

describe("getHojeIso", () => {
  it("retorna uma data no formato ISO YYYY-MM-DD", () => {
    const hoje = getHojeIso();
    expect(hoje).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("corresponde à data real do sistema no momento do teste", () => {
    const esperado = new Date().toISOString().slice(0, 10);
    expect(getHojeIso()).toBe(esperado);
  });
});
