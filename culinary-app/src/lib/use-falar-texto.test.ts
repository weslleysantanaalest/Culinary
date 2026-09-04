import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFalarTexto } from "@/lib/use-falar-texto";

class MockSpeechSynthesisUtterance {
  text: string;
  lang = "";
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: MockVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

interface MockVoice {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  voiceURI: string;
}

function voz(name: string, lang: string, localService = true): MockVoice {
  return { name, lang, localService, default: false, voiceURI: name };
}

function criarMockSpeechSynthesis(vozes: MockVoice[] = []) {
  const listeners: Record<string, Array<() => void>> = {};
  return {
    cancel: vi.fn(),
    speak: vi.fn((utterance: MockSpeechSynthesisUtterance) => {
      utterance.onstart?.();
    }),
    getVoices: vi.fn(() => vozes),
    addEventListener: vi.fn((evento: string, cb: () => void) => {
      (listeners[evento] ??= []).push(cb);
    }),
    removeEventListener: vi.fn(),
    __dispararVoiceschanged: () => (listeners["voiceschanged"] ?? []).forEach((cb) => cb()),
  };
}

function instalarMock(mock: ReturnType<typeof criarMockSpeechSynthesis>) {
  (globalThis as typeof globalThis & { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
    MockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance;
  (globalThis as typeof globalThis & { speechSynthesis: unknown }).speechSynthesis =
    mock as unknown as SpeechSynthesis;
}

describe("useFalarTexto", () => {
  const originalSpeechSynthesis = (globalThis as typeof globalThis & { speechSynthesis?: unknown })
    .speechSynthesis;
  const originalUtterance = (
    globalThis as typeof globalThis & { SpeechSynthesisUtterance?: unknown }
  ).SpeechSynthesisUtterance;

  beforeEach(() => {
    instalarMock(criarMockSpeechSynthesis());
  });

  afterEach(() => {
    (globalThis as typeof globalThis & { speechSynthesis?: unknown }).speechSynthesis =
      originalSpeechSynthesis;
    (globalThis as typeof globalThis & { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance =
      originalUtterance;
  });

  it("reporta suportado=true quando speechSynthesis existe no ambiente", async () => {
    const { result } = renderHook(() => useFalarTexto());
    await waitFor(() => expect(result.current.suportado).toBe(true));
  });

  it("chama speechSynthesis.speak com lang pt-BR, rate 0.9, pitch 1.0 e volume 1.0", async () => {
    const mock = criarMockSpeechSynthesis();
    instalarMock(mock);
    const { result } = renderHook(() => useFalarTexto());
    await waitFor(() => expect(result.current.suportado).toBe(true));

    act(() => {
      result.current.falar("Aqueça o azeite em fogo médio.");
    });

    expect(mock.speak).toHaveBeenCalledTimes(1);
    const utterance = mock.speak.mock.calls[0][0] as MockSpeechSynthesisUtterance;
    expect(utterance.lang).toBe("pt-BR");
    expect(utterance.rate).toBe(0.9);
    expect(utterance.pitch).toBe(1.0);
    expect(utterance.volume).toBe(1.0);
  });

  it("prioriza voz pt-BR local percebida como feminina sobre outras", async () => {
    const mock = criarMockSpeechSynthesis([
      voz("Daniel", "en-GB", true),
      voz("Google US English", "en-US", false),
      voz("Luciana", "pt-BR", true),
      voz("Felipe", "pt-BR", true),
    ]);
    instalarMock(mock);

    const { result } = renderHook(() => useFalarTexto());
    await waitFor(() => expect(result.current.vozAtual).toBe("Luciana"));
  });

  it("prefere pt-BR exato a outra variante de português", async () => {
    const mock = criarMockSpeechSynthesis([
      voz("Joana", "pt-PT", true),
      voz("Fernanda", "pt-BR", true),
    ]);
    instalarMock(mock);

    const { result } = renderHook(() => useFalarTexto());
    await waitFor(() => expect(result.current.vozAtual).toBe("Fernanda"));
  });

  it("reage ao evento voiceschanged e (re)seleciona a voz quando a lista chega depois", async () => {
    const mock = criarMockSpeechSynthesis([]);
    instalarMock(mock);

    const { result } = renderHook(() => useFalarTexto());
    await waitFor(() => expect(result.current.suportado).toBe(true));
    expect(result.current.vozAtual).toBeNull();

    // Simula o carregamento assíncrono das vozes do sistema.
    mock.getVoices.mockReturnValue([voz("Maria", "pt-BR", true)]);
    act(() => {
      mock.__dispararVoiceschanged();
    });

    await waitFor(() => expect(result.current.vozAtual).toBe("Maria"));
  });

  it("marca falando=true quando a fala inicia", async () => {
    const { result } = renderHook(() => useFalarTexto());
    await waitFor(() => expect(result.current.suportado).toBe(true));

    act(() => {
      result.current.falar("Instrução de teste.");
    });

    await waitFor(() => expect(result.current.falando).toBe(true));
  });

  it("cancela a fala em andamento ao chamar parar()", async () => {
    const mock = criarMockSpeechSynthesis();
    instalarMock(mock);
    const { result } = renderHook(() => useFalarTexto());
    await waitFor(() => expect(result.current.suportado).toBe(true));

    act(() => {
      result.current.falar("Instrução de teste.");
    });
    await waitFor(() => expect(result.current.falando).toBe(true));

    act(() => {
      result.current.parar();
    });

    expect(mock.cancel).toHaveBeenCalled();
    expect(result.current.falando).toBe(false);
  });

  it("cancela a fala anterior antes de iniciar uma nova (sem sobreposição)", async () => {
    const mock = criarMockSpeechSynthesis();
    instalarMock(mock);
    const { result } = renderHook(() => useFalarTexto());
    await waitFor(() => expect(result.current.suportado).toBe(true));

    act(() => {
      result.current.falar("Primeira instrução.");
    });
    act(() => {
      result.current.falar("Segunda instrução.");
    });

    expect(mock.cancel).toHaveBeenCalled();
    expect(mock.speak).toHaveBeenCalledTimes(2);
  });

  it("reporta suportado=false quando speechSynthesis não existe no ambiente", async () => {
    Reflect.deleteProperty(globalThis, "speechSynthesis");

    const { result } = renderHook(() => useFalarTexto());
    await waitFor(() => expect(result.current.suportado).toBe(false));

    act(() => {
      result.current.falar("Não deveria fazer nada.");
    });

    expect(result.current.falando).toBe(false);
    expect(result.current.vozAtual).toBeNull();
  });
});
