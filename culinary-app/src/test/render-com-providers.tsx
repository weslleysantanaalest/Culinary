import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { UsuarioProvider } from "@/lib/usuario-context";

/**
 * Renderiza um componente já envolvido pelos providers globais da
 * aplicação (`UsuarioProvider`). Use no lugar de `render()` diretamente
 * sempre que o componente testado (ou algum descendente) depender de
 * `useUsuario()`.
 */
export function renderComProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: UsuarioProvider, ...options });
}
