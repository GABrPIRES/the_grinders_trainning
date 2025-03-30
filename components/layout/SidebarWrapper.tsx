'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o menu ao trocar de página
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Botão hamburguer (mobile only) */}
      <button
        className="fixed top-4 left-4 z-[60] bg-black text-white p-2 rounded-md md:hidden shadow-md"
        onClick={() => setOpen(!open)}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Fundo escuro ao abrir no mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar com transição */}
      <aside
        className={`
          fixed z-50 top-0 left-0 h-full w-64 bg-black text-white
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:block
        `}
      >
        {children}
      </aside>
    </>
  );
}


