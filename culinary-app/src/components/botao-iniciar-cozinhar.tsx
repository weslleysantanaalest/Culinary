"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { dataEhAnterior, getHojeIso } from "@/lib/planejador";

/**
 * Botão "Iniciar Modo Cozinhar" da página de detalhe da receita. Quando a
 * navegação vem de uma refeição planejada no Planejador (query string
 * `?data=YYYY-MM-DD`), verifica se essa data já passou; se sim, bloqueia o
 * início e exibe uma mensagem clara em vez de navegar para o Modo Cozinhar.
 */
export function BotaoIniciarCozinhar({ receitaId }: { receitaId: string }) {
  const searchParams = useSearchParams();
  const dataPlanejada = searchParams.get("data");
  const [mensagemBloqueio, setMensagemBloqueio] = useState<string | null>(null);

  const hoje = getHojeIso();
  const dataJaPassou = dataPlanejada !== null && dataEhAnterior(dataPlanejada, hoje);

  function aoClicar(event: React.MouseEvent<HTMLAnchorElement>) {
    if (dataJaPassou && dataPlanejada) {
      event.preventDefault();
      const dataFormatada = new Date(`${dataPlanejada}T00:00:00`).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      setMensagemBloqueio(
        `Esta refeição estava planejada para ${dataFormatada}, que já passou. Escolha uma nova data no Planejador ou inicie o preparo normalmente a partir da lista de Receitas.`,
      );
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Link
        href={`/cozinhar/${receitaId}`}
        onClick={aoClicar}
        aria-disabled={dataJaPassou}
        className="label-caps inline-block bg-primary px-10 py-5 text-on-primary transition-colors hover:bg-black"
      >
        INICIAR MODO COZINHAR
      </Link>
      {mensagemBloqueio && (
        <p role="alert" className="max-w-md text-center text-sm text-error">
          {mensagemBloqueio}
        </p>
      )}
    </div>
  );
}
