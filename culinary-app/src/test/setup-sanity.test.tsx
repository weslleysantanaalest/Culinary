import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

function Hello({ name }: { name: string }) {
  return <p>Olá, {name}!</p>;
}

describe("infra de testes (Vitest + Testing Library)", () => {
  it("renderiza um componente React e encontra texto via screen", () => {
    render(<Hello name="Culinary" />);
    expect(screen.getByText("Olá, Culinary!")).toBeInTheDocument();
  });

  it("suporta matchers do jest-dom (toBeInTheDocument)", () => {
    render(<Hello name="Teste" />);
    const paragraph = screen.getByText(/teste/i);
    expect(paragraph).toBeInTheDocument();
    expect(paragraph.tagName).toBe("P");
  });
});
