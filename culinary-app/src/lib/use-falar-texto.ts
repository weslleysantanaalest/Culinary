"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseFalarTextoResultado {
  /** false em SSR, navegadores sem `speechSynthesis` e jsdom sem mock. */
  suportado: boolean;
  /** true enquanto uma fala está em andamento. */
  falando: boolean;
  /** Nome da voz atualmente selecionada (para registro/QA); null se nenhuma. */
  vozAtual: string | null;
  /** Cancela qualquer fala anterior e narra `texto` (sem sobreposição). */
  falar: (texto: string) => void;
  /** Cancela a fala em andamento. */
  parar: () => void;
}

/**
 * Vozes pt-BR de boa qualidade conhecidas em macOS / Chrome / Edge / iOS.
 * Ordem = preferência de desempate dentro do nível 3 da cadeia de filtros.
 * NÃO inclui o termo genérico "google" (era o que fazia uma voz remota vencer
 * uma voz local na heurística antiga).
 */
const VOZES_PREFERENCIAIS = [
  "Luciana",
  "Francisca",
  "Fernanda",
  "Thalita",
  "Brenda",
  "Giovanna",
  "Leila",
  "Yara",
  "Manuela",
  "Camila",
  "Vitória",
  "Helena",
];

/** Normaliza o idioma da voz: "pt_BR" -> "pt-br". */
function normLang(voz: SpeechSynthesisVoice): string {
  return voz.lang.toLowerCase().replace("_", "-");
}

/**
 * Se `filtrado` deixa ao menos uma voz, adota o subconjunto; senão mantém o
 * conjunto anterior. É o que garante o fallback em cada nível.
 */
function refinar(
  anterior: SpeechSynthesisVoice[],
  filtrado: SpeechSynthesisVoice[],
): SpeechSynthesisVoice[] {
  return filtrado.length > 0 ? filtrado : anterior;
}

/**
 * Escolhe a melhor voz por uma CADEIA DE FILTROS SEQUENCIAIS (não por pesos).
 * Cada nível só opera dentro do conjunto que o nível anterior aprovou, de modo
 * que um critério inferior NUNCA supera um superior — a hierarquia é estrutural
 * e o bug antigo (voz remota "Google" vencendo uma voz local pt-BR) fica
 * impossível por construção.
 *
 * Ordem de prioridade (MT-014):
 *  1. lang pt-BR exato
 *  2. voz local instalada (localService)
 *  3. nome em VOZES_PREFERENCIAIS
 *  4. voz local em pt (qualquer variante)  — emerge quando não há pt-BR
 *  5. outra voz em pt                       — ramo pt genérico
 *  6. fallback: primeira voz do navegador
 */
function escolherMelhorVoz(vozes: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!vozes || vozes.length === 0) return null;

  let conjunto = vozes;

  // NÍVEL 1 — pt-BR exato.
  const ptBR = conjunto.filter((v) => normLang(v).startsWith("pt-br"));
  if (ptBR.length > 0) {
    conjunto = ptBR;
  } else {
    // NÍVEL 5 — sem pt-BR, tenta pt genérico (qualquer variante).
    const ptQualquer = vozes.filter((v) => normLang(v).startsWith("pt"));
    conjunto = refinar(vozes, ptQualquer);
  }

  // NÍVEL 2 / 4 — dentro do conjunto atual, prioriza voz local instalada.
  const locais = conjunto.filter((v) => v.localService === true);
  conjunto = refinar(conjunto, locais);

  // NÍVEL 3 — dentro do conjunto atual, prioriza nome preferido.
  const preferidas = conjunto.filter((v) =>
    VOZES_PREFERENCIAIS.some((p) => v.name.toLowerCase().includes(p.toLowerCase())),
  );
  conjunto = refinar(conjunto, preferidas);

  // NÍVEL 6 — se nunca houve voz pt, o conjunto continua sendo o universo e
  // retornamos a primeira (voz padrão do navegador).
  return conjunto[0];
}

/**
 * Leitura em voz alta via Web Speech API nativa (sem serviço externo).
 * O chamador deve esconder/desabilitar o controle de voz quando
 * `suportado` for false, em vez de deixar `falar` falhar silenciosamente.
 */
export function useFalarTexto(): UseFalarTextoResultado {
  const [falando, setFalando] = useState(false);
  const [vozAtual, setVozAtual] = useState<string | null>(null);
  const vozRef = useRef<SpeechSynthesisVoice | null>(null);
  const suportado =
    typeof window !== "undefined" &&
    !!window.speechSynthesis &&
    typeof window.speechSynthesis.speak === "function";

  // Carrega as vozes de forma assíncrona: em vários navegadores
  // `getVoices()` só é populado após o evento `voiceschanged` disparar.
  useEffect(() => {
    if (!suportado) return;
    const synth = window.speechSynthesis;
    if (typeof synth.getVoices !== "function") return;

    function carregarVozes() {
      const escolhida = escolherMelhorVoz(synth.getVoices());
      vozRef.current = escolhida;
      setVozAtual(escolhida?.name ?? null);
    }

    carregarVozes();
    // `addEventListener` pode não existir em mocks/navegadores antigos.
    synth.addEventListener?.("voiceschanged", carregarVozes);
    return () => synth.removeEventListener?.("voiceschanged", carregarVozes);
  }, [suportado]);

  const falar = useCallback((texto: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;

    // Nunca sobrepor falas: cancela qualquer utterance anterior.
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const escolhida =
      vozRef.current ??
      (typeof synth.getVoices === "function" ? escolherMelhorVoz(synth.getVoices()) : null);
    if (escolhida) utterance.voice = escolhida;

    utterance.onstart = () => setFalando(true);
    utterance.onend = () => setFalando(false);
    utterance.onerror = () => setFalando(false);

    synth.speak(utterance);
  }, []);

  const parar = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setFalando(false);
  }, []);

  // Cancela a fala ao desmontar o componente (ex.: sair do Modo Cozinhar).
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { suportado, falando, vozAtual, falar, parar };
}
