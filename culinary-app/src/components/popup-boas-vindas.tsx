"use client";

import { useState } from "react";
import { useUsuario } from "@/lib/usuario-context";

/**
 * Popup de boas-vindas exibido na primeira visita (quando não há nome
 * salvo em localStorage). Pergunta o nome da pessoa; ao confirmar, salva
 * via `useUsuario().definirNome` e o popup deixa de aparecer nesta e nas
 * próximas visitas (mesmo navegador).
 */
export function PopupBoasVindas() {
  const { nome, carregado, definirNome } = useUsuario();
  const [valor, setValor] = useState("");

  const deveExibir = carregado && nome === null;

  function confirmar() {
    if (valor.trim().length === 0) return;
    definirNome(valor);
  }

  if (!deveExibir) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-boas-vindas-titulo"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-on-background/30 px-margin-mobile"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/40 bg-surface-container-lowest/70 p-10 text-center shadow-2xl backdrop-blur-xl">
        <p className="label-caps mb-6 text-secondary">CULINARY</p>
        <h2 id="popup-boas-vindas-titulo" className="font-display mb-8 text-2xl text-primary">
          Bem-vindo ao Culinary
        </h2>
        <p className="mb-6 text-base text-secondary">Qual o seu nome?</p>
        <input
          type="text"
          value={valor}
          onChange={(event) => setValor(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              confirmar();
            }
          }}
          placeholder="Seu nome"
          aria-label="Seu nome"
          autoFocus
          className="mb-6 w-full rounded-lg border-0 border-b border-hairline bg-white/30 px-4 py-3 text-center text-lg text-primary placeholder-secondary focus:border-b-2 focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={confirmar}
          className="label-caps w-full rounded-lg bg-primary px-8 py-4 text-on-primary transition-colors hover:bg-black"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
