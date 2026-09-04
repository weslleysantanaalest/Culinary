"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import type { PeriodoRefeicao, PlanejamentoRefeicao, Receita } from "@/types";
import {
  DIAS_SEMANA,
  PERIODOS,
  adicionarDias,
  encontrarPlano,
  formatarDiaDoMes,
  formatarIntervaloSemana,
  getDatasDaSemana,
} from "@/lib/planejador";

/**
 * Grid semanal do Planejador com edição real (RF-024) e navegação entre
 * semanas: cada slot vazio tem um seletor para adicionar uma receita; cada
 * refeição planejada tem um botão de remover e, ao clicar no card, navega
 * direto para a página da receita (`/receitas/[id]`). Os botões
 * "Anterior"/"Próxima" avançam ou retrocedem 7 dias a partir da data de
 * referência atual, mantida em estado local.
 */
export function PlanejadorGrid({
  dataReferenciaInicial,
  planejamentosIniciais,
  receitas,
}: {
  dataReferenciaInicial: string;
  planejamentosIniciais: PlanejamentoRefeicao[];
  receitas: Receita[];
}) {
  const [dataReferencia, setDataReferencia] = useState(dataReferenciaInicial);
  const [planejamentos, setPlanejamentos] = useState<PlanejamentoRefeicao[]>(planejamentosIniciais);
  const datasDaSemana = getDatasDaSemana(dataReferencia);
  const receitasPorId = useMemo(() => new Map(receitas.map((r) => [r.id, r])), [receitas]);
  const idBase = useId();

  function irParaSemanaAnterior() {
    setDataReferencia((atual) => adicionarDias(atual, -7));
  }

  function irParaProximaSemana() {
    setDataReferencia((atual) => adicionarDias(atual, 7));
  }

  function adicionarReceita(data: string, periodo: PeriodoRefeicao, receitaId: string) {
    if (!receitaId) return;
    setPlanejamentos((atual) => [
      ...atual,
      {
        id: `${idBase}-${data}-${periodo}-${receitaId}`,
        data,
        periodo,
        receitaId,
      },
    ]);
  }

  function removerReceita(planoId: string) {
    setPlanejamentos((atual) => atual.filter((plano) => plano.id !== planoId));
  }

  return (
    <>
      <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display mb-2 text-5xl text-primary">Semana Atual</h1>
          <p className="label-caps tracking-widest text-secondary">
            {formatarIntervaloSemana(datasDaSemana)}
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={irParaSemanaAnterior}
            className="label-caps border border-primary px-8 py-3 text-primary transition-colors hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined mr-2 align-middle text-[18px]">
              chevron_left
            </span>
            Anterior
          </button>
          <button
            type="button"
            onClick={irParaProximaSemana}
            className="label-caps border border-primary px-8 py-3 text-primary transition-colors hover:bg-surface-container-low"
          >
            Próxima
            <span className="material-symbols-outlined ml-2 align-middle text-[18px]">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-outline-variant bg-surface-container-lowest/90">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-8 border-b border-outline-variant bg-surface-container-low/50">
            <div className="flex items-center justify-center border-r border-outline-variant p-4">
              <span className="material-symbols-outlined text-on-surface-variant">schedule</span>
            </div>
            {datasDaSemana.map((data, index) => (
              <div
                key={data}
                className="label-caps border-r border-outline-variant p-4 text-center text-primary last:border-r-0"
              >
                {DIAS_SEMANA[index]}
                <br />
                <span className="text-[14px] font-normal text-secondary">
                  {formatarDiaDoMes(data)}
                </span>
              </div>
            ))}
          </div>

          {PERIODOS.map((periodo) => (
            <div key={periodo} className="grid grid-cols-8 border-b border-outline-variant last:border-b-0">
              <div className="label-caps flex items-center justify-center border-r border-outline-variant bg-surface-container-low/50 p-4 text-secondary">
                {periodo}
              </div>
              {datasDaSemana.map((data) => {
                const plano = encontrarPlano(planejamentos, data, periodo);
                const receita = plano ? receitasPorId.get(plano.receitaId) : undefined;

                return (
                  <div
                    key={`${periodo}-${data}`}
                    className="group relative min-h-[140px] border-r border-outline-variant p-2 last:border-r-0"
                  >
                    {plano && receita ? (
                      <div className="relative h-full">
                        <Link
                          href={`/receitas/${receita.id}?data=${plano.data}`}
                          className="flex h-full flex-col justify-between border border-hairline bg-surface-container-lowest p-3 transition-shadow hover:shadow-md"
                        >
                          <div>
                            {plano.rotulo && (
                              <p className="label-caps mb-1 text-[10px] text-secondary">
                                {plano.rotulo}
                              </p>
                            )}
                            <p className="font-display text-lg leading-tight text-primary">
                              {receita.titulo}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-[12px] text-secondary">
                            <span className="material-symbols-outlined mr-1 text-[14px]">timer</span>
                            {receita.tempoPreparo}
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            removerReceita(plano.id);
                          }}
                          aria-label={`Remover ${receita.titulo} de ${DIAS_SEMANA[datasDaSemana.indexOf(data)]} ${periodo}`}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-surface-container-lowest text-secondary opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ) : (
                      <div className="relative flex h-full flex-col items-center justify-center gap-1 border border-dashed border-outline-variant text-secondary transition-colors hover:border-primary hover:text-primary">
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        <span className="label-caps text-[10px]">Adicionar</span>
                        <select
                          value=""
                          onChange={(event) => adicionarReceita(data, periodo, event.target.value)}
                          aria-label={`Adicionar receita para ${DIAS_SEMANA[datasDaSemana.indexOf(data)]} ${periodo}`}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        >
                          <option value="" disabled>
                            Selecione uma receita
                          </option>
                          {receitas.map((receitaOpcao) => (
                            <option key={receitaOpcao.id} value={receitaOpcao.id}>
                              {receitaOpcao.titulo}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
