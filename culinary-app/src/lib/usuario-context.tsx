"use client";

import { createContext, useCallback, useContext, useState, useSyncExternalStore } from "react";

const CHAVE_LOCAL_STORAGE = "culinary:nomeUsuario";
const EVENTO_NOME = "culinary:nome-alterado";

interface UsuarioContextValor {
  nome: string | null;
  carregado: boolean;
  definirNome: (nome: string) => void;
  solicitarNovoNome: () => void;
}

const UsuarioContext = createContext<UsuarioContextValor | null>(null);

function lerNomeSalvo(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    return window.localStorage.getItem(CHAVE_LOCAL_STORAGE);
  } catch {
    return null;
  }
}

/** Assina mudanças no nome salvo (evento próprio + `storage` entre abas). */
function assinarNome(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENTO_NOME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENTO_NOME, callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * Provedor global do nome do usuário (saudação personalizada em todo o
 * site e no Modo Cozinhar). Persiste em `localStorage`.
 *
 * A leitura do `localStorage` usa `useSyncExternalStore` com snapshot de
 * servidor `null`/`carregado=false`, garantindo que a primeira renderização
 * no cliente seja idêntica à do servidor (sem mismatch de hidratação para
 * usuários que já têm nome salvo) sem depender de `setState` em efeito.
 *
 * `solicitarNovoNome` limpa o nome exibido (sem apagar do storage até
 * confirmar um novo), fazendo o popup de boas-vindas reaparecer.
 */
export function UsuarioProvider({ children }: { children: React.ReactNode }) {
  const nomeSalvo = useSyncExternalStore(assinarNome, lerNomeSalvo, () => null);
  const carregado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  // Espelho em memória do nome definido nesta sessão: garante exibição
  // imediata mesmo quando o localStorage está indisponível (modo privado,
  // ambientes de teste). Inicia `null` em servidor e cliente (hydration-safe).
  const [nomeMemoria, setNomeMemoria] = useState<string | null>(null);
  const [popupForcado, setPopupForcado] = useState(false);

  const definirNome = useCallback((novoNome: string) => {
    const nomeLimpo = novoNome.trim();
    if (nomeLimpo.length === 0) return;
    try {
      window.localStorage.setItem(CHAVE_LOCAL_STORAGE, nomeLimpo);
    } catch {
      // Armazenamento indisponível (ex.: modo privado restritivo).
    }
    setNomeMemoria(nomeLimpo);
    setPopupForcado(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(EVENTO_NOME));
    }
  }, []);

  const solicitarNovoNome = useCallback(() => {
    setPopupForcado(true);
  }, []);

  const nomeExibido = popupForcado ? null : (nomeMemoria ?? nomeSalvo);

  return (
    <UsuarioContext.Provider
      value={{ nome: nomeExibido, carregado, definirNome, solicitarNovoNome }}
    >
      {children}
    </UsuarioContext.Provider>
  );
}

export function useUsuario(): UsuarioContextValor {
  const contexto = useContext(UsuarioContext);
  if (!contexto) {
    throw new Error("useUsuario deve ser usado dentro de um UsuarioProvider");
  }
  return contexto;
}
