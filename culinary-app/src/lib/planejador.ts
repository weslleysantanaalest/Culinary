import type { PeriodoRefeicao, PlanejamentoRefeicao } from "@/types";

export const DIAS_SEMANA = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"] as const;
export const PERIODOS: PeriodoRefeicao[] = ["CAFÉ", "ALMOÇO", "JANTAR"];

/**
 * Data de hoje em formato ISO (YYYY-MM-DD), no fuso local do navegador/servidor.
 * Usada como referência padrão do Planejador e para bloquear o Modo Cozinhar
 * em datas já passadas.
 */
export function getHojeIso(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Gera as 7 datas (ISO YYYY-MM-DD) da semana a partir de uma data de
 * referência, assumindo semana começando na segunda-feira. Usado pela
 * visão de grid semanal do Planejador (RF-021).
 */
export function getDatasDaSemana(dataReferenciaIso: string): string[] {
  const referencia = new Date(`${dataReferenciaIso}T00:00:00`);
  const diaSemanaJs = referencia.getDay(); // 0 = domingo
  const offsetParaSegunda = diaSemanaJs === 0 ? -6 : 1 - diaSemanaJs;

  const segunda = new Date(referencia);
  segunda.setDate(referencia.getDate() + offsetParaSegunda);

  return Array.from({ length: 7 }, (_, index) => {
    const dia = new Date(segunda);
    dia.setDate(segunda.getDate() + index);
    return dia.toISOString().slice(0, 10);
  });
}

/** Soma (ou subtrai, com valor negativo) `dias` a uma data ISO, retornando outra data ISO. */
export function adicionarDias(dataIso: string, dias: number): string {
  const data = new Date(`${dataIso}T00:00:00`);
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

/** Compara duas datas ISO (YYYY-MM-DD) como strings — funciona por ordenação lexicográfica. */
export function dataEhAnterior(dataIso: string, referenciaIso: string): boolean {
  return dataIso < referenciaIso;
}

/**
 * Formata o intervalo de uma semana (primeira e última data do array
 * retornado por `getDatasDaSemana`) como "24 - 30 DE AGOSTO, 2026".
 */
export function formatarIntervaloSemana(datasDaSemana: string[]): string {
  const MESES = [
    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO",
  ];
  const primeira = new Date(`${datasDaSemana[0]}T00:00:00`);
  const ultima = new Date(`${datasDaSemana[datasDaSemana.length - 1]}T00:00:00`);
  const diaInicio = String(primeira.getDate()).padStart(2, "0");
  const diaFim = String(ultima.getDate()).padStart(2, "0");
  const mes = MESES[ultima.getMonth()];
  const ano = ultima.getFullYear();

  if (primeira.getMonth() === ultima.getMonth()) {
    return `${diaInicio} - ${diaFim} DE ${mes}, ${ano}`;
  }
  const mesInicio = MESES[primeira.getMonth()];
  return `${diaInicio} DE ${mesInicio} - ${diaFim} DE ${mes}, ${ano}`;
}

/** Encontra o plano de refeição para uma data e período específicos, se existir. */
export function encontrarPlano(
  planos: PlanejamentoRefeicao[],
  data: string,
  periodo: PeriodoRefeicao,
): PlanejamentoRefeicao | undefined {
  return planos.find((plano) => plano.data === data && plano.periodo === periodo);
}

/** Formata uma data ISO (YYYY-MM-DD) para o dia do mês (ex.: "14"). */
export function formatarDiaDoMes(dataIso: string): string {
  return dataIso.slice(8, 10);
}
