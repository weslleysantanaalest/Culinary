// @vitest-environment node
import { describe, expect, it } from "vitest";
import { calcularCoberturaImagens } from "@/lib/images/cobertura";

describe("calcularCoberturaImagens", () => {
  it("calcula a partir do manifesto real (nunca hardcoded)", () => {
    const cobertura = calcularCoberturaImagens();
    expect(cobertura.totalReceitas).toBe(85);
    expect(cobertura.comImagemValidada).toBe(12);
    expect(cobertura.comImagemValidada).toBeLessThanOrEqual(cobertura.totalReceitas);
  });
});
