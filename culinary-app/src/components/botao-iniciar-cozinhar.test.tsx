import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BotaoIniciarCozinhar } from "@/components/botao-iniciar-cozinhar";

const { mockSearchParams } = vi.hoisted(() => ({
  mockSearchParams: { value: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams.value,
}));

describe("BotaoIniciarCozinhar", () => {
  it("navega normalmente quando não há data planejada na query string", async () => {
    mockSearchParams.value = new URLSearchParams();
    const user = userEvent.setup();
    render(<BotaoIniciarCozinhar receitaId="pasta-pomodoro-classica" />);

    const link = screen.getByRole("link", { name: /iniciar modo cozinhar/i });
    expect(link).toHaveAttribute("href", "/cozinhar/pasta-pomodoro-classica");

    await user.click(link);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("navega normalmente quando a data planejada é hoje ou futura", async () => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const amanhaIso = amanha.toISOString().slice(0, 10);

    mockSearchParams.value = new URLSearchParams({ data: amanhaIso });
    const user = userEvent.setup();
    render(<BotaoIniciarCozinhar receitaId="pasta-pomodoro-classica" />);

    const link = screen.getByRole("link", { name: /iniciar modo cozinhar/i });
    await user.click(link);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("bloqueia e exibe mensagem quando a data planejada já passou", async () => {
    mockSearchParams.value = new URLSearchParams({ data: "2020-01-01" });
    const user = userEvent.setup();
    render(<BotaoIniciarCozinhar receitaId="pasta-pomodoro-classica" />);

    const link = screen.getByRole("link", { name: /iniciar modo cozinhar/i });
    await user.click(link);

    const alerta = screen.getByRole("alert");
    expect(alerta).toBeInTheDocument();
    expect(alerta.textContent).toMatch(/já passou/i);
    expect(alerta.textContent).toMatch(/janeiro de 2020/i);
  });
});
