/**
 * Fundo fixo de página com foto de cozinha (estilo `bg-fixed-kitchen` dos
 * protótipos Stitch originais): imagem em `background-attachment: fixed`
 * cobrindo a viewport, com um overlay para legibilidade do conteúdo
 * sobreposto. Fotos locais em `public/backgrounds/`, self-hosted
 * (substituem a antiga referência a `lh3.googleusercontent.com` usada só
 * no Modo Cozinhar).
 *
 * O overlay é intencionalmente opaco (surface-container-lowest/85 + blur)
 * para que a foto funcione como textura discreta atrás do conteúdo, sem
 * competir com cards, texto e imagens de receitas — evita o problema de
 * "fundo pesado prejudicando a legibilidade" identificado na auditoria
 * visual da página Receitas.
 *
 * Usa `<picture>` para servir a variante vertical (mobile) ou widescreen
 * (desktop) conforme o breakpoint, replicando o comportamento de fundo
 * fixo presente em receitas_desktop/code.html, planejador_desktop/code.html
 * etc.
 */
export function PageBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <picture>
        <source media="(min-width: 768px)" srcSet="/backgrounds/cozinha-fundo-desktop.webp" />
        <img
          src="/backgrounds/cozinha-fundo-mobile.webp"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
      </picture>
      <div className="absolute inset-0 bg-surface-container-lowest/85 backdrop-blur-[3px]" />
    </div>
  );
}
