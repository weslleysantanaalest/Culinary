import type { Metadata } from "next";
import "@fontsource/eb-garamond/400.css";
import "@fontsource/eb-garamond/500.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "./globals.css";
import { PageBackground } from "@/components/page-background";
import { UsuarioProvider } from "@/lib/usuario-context";
import { PopupBoasVindas } from "@/components/popup-boas-vindas";

export const metadata: Metadata = {
  title: "Culinary",
  description: "A Arte da Culinária — receitas, planejador, lista de ingredientes e modo cozinhar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="relative flex min-h-full flex-col">
        <UsuarioProvider>
          <PageBackground />
          <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
          <PopupBoasVindas />
        </UsuarioProvider>
      </body>
    </html>
  );
}
