'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  User,
  Home,
  Dumbbell,
  CreditCard,
  Settings,
  HelpCircle,
  Users,
  ClipboardList,
  Upload,
} from 'lucide-react';
import { logout } from '@/services/authService';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  { label: 'Home',           href: '/coach',          icon: <Home size={18} /> },
  { label: 'Perfil',         href: '/coach/profile',  icon: <User size={18} /> },
  { label: 'Alunos',         href: '/coach/students', icon: <Users size={18} /> },
  { label: 'Treinos',        href: '/coach/treinos',  icon: <Dumbbell size={18} /> },
  { label: 'Pagamentos',     href: '/coach/payments', icon: <CreditCard size={18} /> },
  { label: 'Planos',         href: '/coach/plans',    icon: <ClipboardList size={18} /> },
  { label: 'Importar Treino',href: '/coach/import',   icon: <Upload size={18} /> },
  { label: 'Configurações',  href: '/coach/settings', icon: <Settings size={18} /> },
  { label: 'Ajuda',          href: '/coach/help',     icon: <HelpCircle size={18} /> },
];

export default function CoachSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="sidebar-hide-scroll w-64 h-screen bg-surface-sidebar text-content-sidebar flex flex-col justify-between">
      <div>
        <div className="text-center py-6 border-b border-line">
          {/* Logo branca — dark mode */}
          <Image
            src="/images/logo-the-grinders-2-removebg-preview.png"
            alt="Logo The Grinders"
            width={250}
            height={50}
            className="mx-auto hidden dark:block"
            priority
          />
          {/* Logo escura — light mode */}
          <Image
            src="/images/logo_the_grinders_dark-removebg-preview.png"
            alt="Logo The Grinders"
            width={250}
            height={50}
            className="mx-auto block dark:hidden"
            priority
          />
        </div>
        <nav className="mt-6 space-y-1 px-4">
          {navItems.map((item) => {
            const isHome = item.href === '/coach';
            const isActive = isHome
              ? pathname === item.href
              : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-brand text-content-on-brand'
                    : 'text-content-sidebar hover:bg-surface-sidebar-hover'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-content-tertiary cursor-pointer hover:text-brand transition-colors w-full text-sm"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
