'use client';

import MobileMenu from './MobileMenu'; // Certifique-se que o caminho está correto

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  // Removemos useState e useEffect porque não existe mais "abrir/fechar" menu.
  // Agora é: Ou é Mobile (Barra Inferior) ou é Desktop (Barra Lateral).

  return (
    <>
      {/* 1. Sidebar Desktop 
        - hidden: Escondido por padrão (Mobile).
        - md:flex: Flexível e visível apenas em telas médias pra cima.
        - fixed: Preso na esquerda.
      */}
      <aside
        className="
          hidden md:flex 
          fixed top-0 left-0 z-50 h-full w-64 
          flex-col 
          bg-neutral-900 text-white 
          border-r border-neutral-800 
          overflow-y-auto overflow-x-hidden
        "
      >
        {/* Aqui renderiza os links que você já tem (CoachNavbar, AdminNavbar, etc) */}
        {children}
      </aside>

      {/* 2. Menu Mobile (Barra Inferior)
        - Renderizamos o componente que criamos antes.
        - Ele já possui a classe 'md:hidden' interna, então some no Desktop.
      */}
      <MobileMenu />
    </>
  );
}