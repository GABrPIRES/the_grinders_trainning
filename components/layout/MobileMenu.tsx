'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Dumbbell, User, Settings, Users,
  CreditCard, FileText, Upload, HelpCircle,
  MoreHorizontal, LogOut, X
} from 'lucide-react';
import { logout } from '@/services/authService';
import { useRouter } from 'next/navigation';

const MENUS = {
  coach: [
    { name: 'Home',      href: '/coach',          icon: Home },
    { name: 'Alunos',    href: '/coach/students', icon: Users },
    { name: 'Treinos',   href: '/coach/treinos',  icon: Dumbbell },
    { name: 'Planos',    href: '/coach/plans',    icon: FileText },
    { name: 'Financeiro',href: '/coach/payments', icon: CreditCard },
    { name: 'Importar',  href: '/coach/import',   icon: Upload },
    { name: 'Perfil',    href: '/coach/profile',  icon: User },
    { name: 'Config',    href: '/coach/settings', icon: Settings },
    { name: 'Ajuda',     href: '/coach/help',     icon: HelpCircle },
  ],
  aluno: [
    { name: 'Home',      href: '/aluno',          icon: Home },
    { name: 'Treinos',   href: '/aluno/treinos',  icon: Dumbbell },
    { name: 'Financeiro',href: '/aluno/payment',  icon: CreditCard },
    { name: 'Meu Coach', href: '/aluno/coach',    icon: Users },
    { name: 'Perfil',    href: '/aluno/profile',  icon: User },
    { name: 'Config',    href: '/aluno/settings', icon: Settings },
    { name: 'Ajuda',     href: '/aluno/help',     icon: HelpCircle },
  ],
  admin: [
    { name: 'Home',      href: '/admin',          icon: Home },
    { name: 'Coaches',   href: '/admin/coaches',  icon: Users },
    { name: 'Alunos',    href: '/admin/students', icon: Dumbbell },
    { name: 'Financeiro',href: '/admin/settings', icon: CreditCard },
    { name: 'Perfil',    href: '/admin/profile',  icon: User },
  ],
};

export default function MobileMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  let fullMenu: typeof MENUS.coach = [];
  if (pathname.startsWith('/coach'))      fullMenu = MENUS.coach;
  else if (pathname.startsWith('/aluno')) fullMenu = MENUS.aluno;
  else if (pathname.startsWith('/admin')) fullMenu = MENUS.admin;
  else return null;

  const mainItems = fullMenu.slice(0, 4);
  const moreItems = fullMenu.slice(4);
  const isActiveInMore = moreItems.some(item => pathname.startsWith(item.href));

  return (
    <>
      {/* Drawer — menu expandido */}
      {isMoreOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="fixed bottom-20 right-4 left-4 bg-surface-elevated rounded-xl border border-line p-4 z-50 md:hidden shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center mb-4 border-b border-line pb-2">
              <span className="text-sm font-semibold text-content-secondary">Mais opções</span>
              <button onClick={() => setIsMoreOpen(false)}>
                <X size={20} className="text-content-tertiary" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex flex-col items-center gap-1 ${active ? 'text-brand' : 'text-content-secondary'}`}
                  >
                    <div className={`p-3 rounded-full ${active ? 'bg-brand/20' : 'bg-surface-subtle'}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] text-center">{item.name}</span>
                  </Link>
                );
              })}

              {/* Logout */}
              <button
                onClick={() => { setIsMoreOpen(false); handleLogout(); }}
                className="flex flex-col items-center gap-1 text-brand"
              >
                <div className="p-3 rounded-full bg-brand/10 border border-brand/20">
                  <LogOut size={20} />
                </div>
                <span className="text-[10px] text-center">Sair</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Barra inferior fixa */}
      <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-surface-sidebar border-t border-line md:hidden safe-area-pb">
        <div className="grid h-full grid-cols-5 w-full">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href
              || (item.href !== '/coach' && item.href !== '/aluno' && item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex flex-col items-center justify-center px-1 group ${active ? 'text-brand' : 'text-content-sidebar'}`}
              >
                <Icon size={22} className={`mb-1 transition-colors group-active:scale-90 ${active ? 'text-brand' : 'group-hover:text-brand'}`} />
                <span className="text-[10px] font-medium truncate w-full text-center">{item.name}</span>
              </Link>
            );
          })}

          {/* Botão "Mais" */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`inline-flex flex-col items-center justify-center px-1 group ${isMoreOpen || isActiveInMore ? 'text-brand' : 'text-content-sidebar'}`}
          >
            <div className={`rounded-full p-0.5 ${(isMoreOpen || isActiveInMore) ? 'bg-brand/10' : ''}`}>
              <MoreHorizontal size={24} className="mb-1" />
            </div>
            <span className="text-[10px] font-medium">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}
