"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseTimerResultado {
  segundosRestantes: number;
  emExecucao: boolean;
  iniciar: () => void;
  pausar: () => void;
  reiniciar: (novoTotalSegundos?: number) => void;
}

/**
 * Timer de contagem regressiva (RF-043). `totalSegundos` é o tempo inicial;
 * muda automaticamente e reinicia parado quando `totalSegundos` muda (ex.:
 * ao trocar de passo no Modo Cozinhar).
 */
export function useTimer(totalSegundos: number): UseTimerResultado {
  const [segundosRestantes, setSegundosRestantes] = useState(totalSegundos);
  const [emExecucao, setEmExecucao] = useState(false);
  const [totalAnterior, setTotalAnterior] = useState(totalSegundos);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Padrão "Adjusting state during render" (https://react.dev/learn/you-might-not-need-an-effect):
  // ao invés de um useEffect que dispara setState após o render (causando um
  // render extra em cascata), ajustamos o estado diretamente durante a
  // renderização quando detectamos que `totalSegundos` mudou (ex.: usuário
  // navegou para outro passo do Modo Cozinhar).
  if (totalSegundos !== totalAnterior) {
    setTotalAnterior(totalSegundos);
    setSegundosRestantes(totalSegundos);
    setEmExecucao(false);
  }

  useEffect(() => {
    if (!emExecucao) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSegundosRestantes((atual) => {
        if (atual <= 1) {
          setEmExecucao(false);
          return 0;
        }
        return atual - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [emExecucao]);

  const iniciar = useCallback(() => {
    if (segundosRestantes > 0) {
      setEmExecucao(true);
    }
  }, [segundosRestantes]);

  const pausar = useCallback(() => {
    setEmExecucao(false);
  }, []);

  const reiniciar = useCallback(
    (novoTotalSegundos?: number) => {
      setEmExecucao(false);
      setSegundosRestantes(novoTotalSegundos ?? totalSegundos);
    },
    [totalSegundos],
  );

  return { segundosRestantes, emExecucao, iniciar, pausar, reiniciar };
}

export function formatarTempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = segundos % 60;
  return `${String(minutos).padStart(2, "0")}:${String(segundosRestantes).padStart(2, "0")}`;
}
