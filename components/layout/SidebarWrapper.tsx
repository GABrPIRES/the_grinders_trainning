'use client';

import MobileMenu from './MobileMenu';

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Sidebar Desktop — fixo na esquerda, só em md+ */}
      <aside
        className="
          hidden md:flex
          fixed top-0 left-0 z-50 h-full w-64
          flex-col
          bg-surface-sidebar text-content-sidebar
          border-r border-line
          overflow-y-auto overflow-x-hidden
        "
      >
        {children}
      </aside>

      {/* Menu Mobile — barra inferior, some no desktop */}
      <MobileMenu />
    </>
  );
}
