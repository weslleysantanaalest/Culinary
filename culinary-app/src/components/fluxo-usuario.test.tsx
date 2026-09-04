import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavBar } from "@/components/nav-bar";
import { PopupBoasVindas } from "@/components/popup-boas-vindas";
import { renderComProviders } from "@/test/render-com-providers";

function TelaComPopup() {
  return (
    <>
      <NavBar ativo="/" />
      <PopupBoasVindas />
    </>
  );
}

describe("Fluxo de nome do usuário (NavBar + Popup)", () => {
  it("exibe o popup de boas-vindas quando não há nome salvo", () => {
    renderComProviders(<TelaComPopup />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Bem-vindo ao Culinary")).toBeInTheDocument();
  });

  it("ao confirmar o nome, mostra 'Cozinheiro NOME' no NavBar e fecha o popup", async () => {
    const user = userEvent.setup();
    renderComProviders(<TelaComPopup />);

    await user.type(screen.getByLabelText("Seu nome"), "Ana");
    await user.click(screen.getByRole("button", { name: /continuar/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const botaoNome = screen.getByRole("button", { name: /alterar nome do cozinheiro/i });
    expect(botaoNome).toHaveTextContent("Cozinheiro");
    expect(botaoNome).toHaveTextContent("Ana");
  });

  it("clicar no nome no NavBar reabre o popup de boas-vindas", async () => {
    const user = userEvent.setup();
    renderComProviders(<TelaComPopup />);

    await user.type(screen.getByLabelText("Seu nome"), "Ana");
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /alterar nome do cozinheiro/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
