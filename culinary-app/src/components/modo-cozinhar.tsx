"use client";

import { useEffect, useState } from "react";
import type { Receita } from "@/types";
import { formatarTempo, useTimer } from "@/lib/use-timer";
import { useFalarTexto } from "@/lib/use-falar-texto";
import { useUsuario } from "@/lib/usuario-context";

/**
 * Modo Cozinhar (RF-040 a RF-047), fiel à estrutura do protótipo
 * `modo_cozinhar_desktop/code.html`: sidebar de ingredientes (4/12) fixa +
 * card do passo (8/12) sobre fundo com blur, cantos retos e hairlines.
 *
 * Correção MT-014:
 * - Gate "Iniciar receita" (pré-início) que, no mesmo gesto do clique, abre
 *   o modo guiado e narra automaticamente o passo 1 (respeita a política de
 *   autoplay do navegador — a fala nasce como consequência direta do clique).
 * - Narração automática ao trocar de passo (próximo/anterior), sem
 *   sobreposição (`falar()` cancela a fala anterior).
 * - Único controle de voz: "Repetir instrução".
 * - Sem suporte a `speechSynthesis`: controle de voz oculto + aviso
 *   acessível; timer e navegação seguem funcionando.
 */
export function ModoCozinhar({ receita }: { receita: Receita }) {
  const [iniciado, setIniciado] = useState(false);
  const [passoAtualIndex, setPassoAtualIndex] = useState(0);
  const [ingredientesMarcados, setIngredientesMarcados] = useState<Set<string>>(new Set());
  const [passosConcluidos, setPassosConcluidos] = useState<Set<number>>(new Set());

  const totalPassos = receita.passos.length;
  const passoAtual = receita.passos[passoAtualIndex];
  const totalSegundosPasso = (passoAtual.tempoEstimadoMinutos ?? 5) * 60;
  const timer = useTimer(totalSegundosPasso);
  const voz = useFalarTexto();
  const { nome } = useUsuario();

  const falarVoz = voz.falar;
  const pararVoz = voz.parar;

  // Cancela a fala ao sair/desmontar o Modo Cozinhar.
  useEffect(() => {
    return () => {
      pararVoz();
    };
  }, [pararVoz]);

  /** Monta o texto falado do passo; no passo 1 inclui uma saudação curta. */
  function textoDoPasso(index: number, comSaudacao: boolean): string {
    const instrucao = receita.passos[index].instrucao;
    if (comSaudacao && index === 0) {
      const saudacao = nome ? `Olá ${nome}. Vamos começar. ` : "Vamos começar. ";
      return `${saudacao}Passo 1. ${instrucao}`;
    }
    return `Passo ${index + 1}. ${instrucao}`;
  }

  /** Consequência direta do clique em "Iniciar receita". */
  function iniciarReceita() {
    setIniciado(true);
    setPassoAtualIndex(0);
    setPassosConcluidos(new Set());
    // Narra o passo 1 dentro do mesmo gesto do usuário.
    falarVoz(textoDoPasso(0, true));
  }

  function alternarIngrediente(nomeIngrediente: string) {
    setIngredientesMarcados((atual) => {
      const novo = new Set(atual);
      if (novo.has(nomeIngrediente)) novo.delete(nomeIngrediente);
      else novo.add(nomeIngrediente);
      return novo;
    });
  }

  function irParaPasso(novoIndex: number) {
    if (novoIndex < 0 || novoIndex >= totalPassos) return;
    setPassosConcluidos((atual) => {
      // Ao avançar, marca o passo que estamos deixando como concluído.
      if (novoIndex > passoAtualIndex) return new Set(atual).add(passoAtualIndex);
      return atual;
    });
    setPassoAtualIndex(novoIndex);
    // Narração automática do novo passo (falar() já cancela a fala anterior).
    falarVoz(textoDoPasso(novoIndex, false));
  }

  /**
   * "Repetir instrução": relê o passo atual. Como `falar()` sempre cancela a
   * fala anterior antes de iniciar, o mesmo handler cobre os dois casos
   * (havia fala ativa ou não), sem nunca sobrepor duas falas.
   */
  function repetirInstrucao() {
    falarVoz(textoDoPasso(passoAtualIndex, false));
  }

  function encerrarPreparo() {
    timer.pausar();
    pararVoz();
    setIniciado(false);
    setPassoAtualIndex(0);
    setPassosConcluidos(new Set());
  }

  const ingredientesSidebar = (
    <aside className="border border-hairline bg-surface-container-lowest/95 p-8 backdrop-blur-md md:col-span-4 md:sticky md:top-[100px] md:self-start">
      <h2 className="mb-6 border-b border-hairline pb-4 text-2xl">Ingredientes</h2>
      <ul className="flex flex-col">
        {receita.ingredientes.map((ingrediente) => {
          const chave = `${receita.id}-${ingrediente.nome}`;
          const marcado = ingredientesMarcados.has(ingrediente.nome);
          return (
            <li
              key={ingrediente.nome}
              className="flex items-start gap-4 border-b border-hairline py-4 last:border-b-0"
            >
              <input
                type="checkbox"
                id={`ing-${chave}`}
                checked={marcado}
                onChange={() => alternarIngrediente(ingrediente.nome)}
                className="mt-1 cursor-pointer"
              />
              <label
                htmlFor={`ing-${chave}`}
                className={
                  marcado
                    ? "cursor-pointer select-none text-secondary line-through"
                    : "cursor-pointer select-none text-on-surface"
                }
              >
                {ingrediente.quantidade} de {ingrediente.nome}
              </label>
            </li>
          );
        })}
      </ul>
    </aside>
  );

  // ---------------------------------------------------------------------------
  // Pré-início: "Iniciar receita" (gate para o modo guiado).
  // ---------------------------------------------------------------------------
  if (!iniciado) {
    return (
      <div className="relative w-full">
        <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-gutter px-margin-mobile py-section-gap md:grid-cols-12 md:px-margin-desktop">
          {ingredientesSidebar}

          <section className="flex min-h-[600px] flex-col justify-center border border-hairline bg-surface-container-lowest/95 p-6 backdrop-blur-md md:col-span-8 md:p-12">
            <div className="mb-4 flex gap-2">
              {receita.categorias.map((categoria) => (
                <span
                  key={categoria}
                  className="label-caps bg-surface-fill px-3 py-1 text-secondary"
                >
                  {categoria}
                </span>
              ))}
            </div>

            <h1 className="font-display text-4xl text-on-surface md:text-6xl">{receita.titulo}</h1>

            <div className="label-caps mt-6 flex items-center border-t border-hairline pt-6 text-secondary">
              <span>{receita.tempoPreparo}</span>
              <span className="mx-3 h-3 w-px bg-hairline" />
              <span>{receita.dificuldade}</span>
              <span className="mx-3 h-3 w-px bg-hairline" />
              <span>{totalPassos} PASSOS</span>
            </div>

            <p className="mt-8 max-w-[60ch] text-lg leading-relaxed text-on-surface-variant">
              Modo guiado passo a passo com timer e leitura em voz alta. Ao iniciar, a primeira
              etapa será narrada automaticamente.
            </p>

            <div className="mt-10">
              <button
                type="button"
                onClick={iniciarReceita}
                className="label-caps inline-flex items-center justify-center gap-3 bg-primary px-10 py-5 text-on-primary transition-colors hover:bg-black"
              >
                <span className="material-symbols-outlined">skillet</span>
                Iniciar receita
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Modo guiado: "Cozinhando Agora".
  // ---------------------------------------------------------------------------
  return (
    <div
      className="relative w-full"
      data-voz-selecionada={voz.vozAtual ?? ""}
      data-voz-suportado={String(voz.suportado)}
    >
      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-gutter px-margin-mobile py-section-gap md:grid-cols-12 md:px-margin-desktop">
        {ingredientesSidebar}

        <section className="flex min-h-[600px] flex-col border border-hairline bg-surface-container-lowest/95 p-6 backdrop-blur-md md:col-span-8 md:p-12">
          <header className="mb-10 flex items-end justify-between border-b border-hairline pb-6">
            <div>
              <div className="mb-4 flex gap-2">
                <span className="label-caps bg-surface-container-low px-3 py-1 text-on-secondary-container">
                  PASSO {passoAtualIndex + 1} DE {totalPassos}
                </span>
                {passosConcluidos.has(passoAtualIndex) && (
                  <span className="label-caps flex items-center gap-1 bg-surface-fill px-3 py-1 text-secondary">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    CONCLUÍDO
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl text-on-surface md:text-5xl">{receita.titulo}</h1>
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="label-caps mb-1 text-secondary">TEMPO ATIVO</span>
              <span className="font-display text-[32px]">
                {passoAtual.tempoEstimadoMinutos ?? 5} MIN
              </span>
            </div>
          </header>

          <div className="flex flex-grow flex-col justify-center py-8 md:mx-auto md:max-w-[80%]">
            <p className="text-center text-lg leading-relaxed text-on-surface">
              {passoAtual.instrucao}
            </p>
          </div>

          {/* Painel do timer (visível e funcional) */}
          <div
            className="mb-8 flex flex-wrap items-center justify-center gap-4 border border-hairline bg-surface-container-low p-4"
            role="timer"
            aria-label="Temporizador do passo atual"
          >
            <span className="material-symbols-outlined text-primary">timer</span>
            <span className="font-display tabular-nums text-2xl text-primary">
              {formatarTempo(timer.segundosRestantes)}
            </span>
            {timer.emExecucao ? (
              <button
                type="button"
                onClick={timer.pausar}
                className="label-caps border border-primary px-4 py-2 text-primary transition-colors hover:bg-surface-container"
              >
                Pausar
              </button>
            ) : (
              <button
                type="button"
                onClick={timer.iniciar}
                disabled={timer.segundosRestantes === 0}
                className="label-caps border border-primary px-4 py-2 text-primary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
              >
                {timer.segundosRestantes === totalSegundosPasso ? "Iniciar" : "Continuar"}
              </button>
            )}
            <button
              type="button"
              onClick={() => timer.reiniciar()}
              className="label-caps border border-hairline px-4 py-2 text-secondary transition-colors hover:bg-surface-container hover:text-primary"
            >
              Reiniciar
            </button>
            {timer.segundosRestantes === 0 && (
              <span role="status" className="label-caps text-error">
                TEMPO ESGOTADO
              </span>
            )}
          </div>

          {/* Único controle de voz: Repetir instrução (ou aviso sem suporte) */}
          <footer className="mt-auto flex flex-col items-center justify-center gap-4 pt-6">
            {voz.suportado ? (
              <button
                type="button"
                onClick={repetirInstrucao}
                aria-label="Repetir instrução do passo atual em voz alta"
                className="label-caps flex w-full items-center justify-center gap-3 bg-primary-container px-10 py-5 text-on-primary transition-colors hover:bg-inverse-surface sm:w-auto"
              >
                <span className="material-symbols-outlined">volume_up</span>
                Repetir instrução
              </button>
            ) : (
              <p role="note" className="text-center text-sm text-secondary">
                Leitura em voz não disponível neste navegador. Você pode acompanhar o passo pelo
                texto acima.
              </p>
            )}
          </footer>

          {/* Navegação entre passos */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 border-t border-hairline pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() => irParaPasso(passoAtualIndex - 1)}
              disabled={passoAtualIndex === 0}
              className="label-caps flex flex-1 items-center justify-center border border-hairline px-6 py-4 text-primary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            >
              <span className="material-symbols-outlined mr-2">arrow_back</span>
              Passo anterior
            </button>

            <button
              type="button"
              onClick={() => irParaPasso(passoAtualIndex + 1)}
              disabled={passoAtualIndex === totalPassos - 1}
              className="label-caps flex flex-1 items-center justify-center bg-primary px-8 py-4 text-on-primary transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            >
              Próximo passo
              <span className="material-symbols-outlined ml-2">arrow_forward</span>
            </button>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={encerrarPreparo}
              className="label-caps text-secondary underline-offset-2 hover:text-error hover:underline"
            >
              Encerrar preparo
            </button>
          </div>

          {/* Indicadores de passo (step dots) */}
          <div className="mt-8 flex justify-center gap-3">
            {receita.passos.map((passo) => (
              <div
                key={passo.numero}
                className={
                  passo.numero - 1 === passoAtualIndex
                    ? "h-1 w-12 bg-primary"
                    : passosConcluidos.has(passo.numero - 1)
                      ? "h-1 w-12 bg-secondary"
                      : "h-1 w-12 bg-outline-variant/30"
                }
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
