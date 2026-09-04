export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-outline-variant/20 bg-surface-container-lowest/90 px-margin-mobile py-gutter backdrop-blur-sm md:px-margin-desktop">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-4 md:flex-row">
        <span className="font-display text-lg text-on-surface-variant">CULINARY</span>
        <nav className="flex space-x-6">
          <a href="#" className="label-caps text-on-surface-variant hover:text-primary">
            Sobre
          </a>
          <a href="#" className="label-caps text-on-surface-variant hover:text-primary">
            Privacidade
          </a>
          <a href="#" className="label-caps text-on-surface-variant hover:text-primary">
            Termos
          </a>
        </nav>
        <span className="label-caps text-on-surface-variant">
          © 2024 CULINARY. ALL RIGHTS RESERVED.
        </span>
      </div>
    </footer>
  );
}
