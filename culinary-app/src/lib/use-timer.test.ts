import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatarTempo, useTimer } from "@/lib/use-timer";

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("inicia com o total de segundos informado, parado", () => {
    const { result } = renderHook(() => useTimer(300));
    expect(result.current.segundosRestantes).toBe(300);
    expect(result.current.emExecucao).toBe(false);
  });

  it("decrementa 1 segundo por vez após iniciar", () => {
    const { result } = renderHook(() => useTimer(10));

    act(() => {
      result.current.iniciar();
    });
    expect(result.current.emExecucao).toBe(true);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.segundosRestantes).toBe(7);
  });

  it("para automaticamente ao chegar a zero", () => {
    const { result } = renderHook(() => useTimer(3));

    act(() => {
      result.current.iniciar();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.segundosRestantes).toBe(0);
    expect(result.current.emExecucao).toBe(false);
  });

  it("pausa a contagem quando pausar() é chamado", () => {
    const { result } = renderHook(() => useTimer(10));

    act(() => {
      result.current.iniciar();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      result.current.pausar();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.segundosRestantes).toBe(8);
    expect(result.current.emExecucao).toBe(false);
  });

  it("reinicia para o total original quando reiniciar() é chamado sem argumento", () => {
    const { result } = renderHook(() => useTimer(10));

    act(() => {
      result.current.iniciar();
    });
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    act(() => {
      result.current.reiniciar();
    });

    expect(result.current.segundosRestantes).toBe(10);
    expect(result.current.emExecucao).toBe(false);
  });

  it("não inicia quando segundosRestantes já é zero", () => {
    const { result } = renderHook(() => useTimer(1));

    act(() => {
      result.current.iniciar();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // chegou a zero e parou
    act(() => {
      result.current.iniciar();
    });

    expect(result.current.emExecucao).toBe(false);
  });

  it("reseta ao mudar totalSegundos (ex.: trocar de passo)", () => {
    const { result, rerender } = renderHook(({ total }) => useTimer(total), {
      initialProps: { total: 10 },
    });

    act(() => {
      result.current.iniciar();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    rerender({ total: 20 });

    expect(result.current.segundosRestantes).toBe(20);
    expect(result.current.emExecucao).toBe(false);
  });
});

describe("formatarTempo", () => {
  it("formata segundos como MM:SS", () => {
    expect(formatarTempo(300)).toBe("05:00");
    expect(formatarTempo(65)).toBe("01:05");
    expect(formatarTempo(5)).toBe("00:05");
    expect(formatarTempo(0)).toBe("00:00");
  });
});
