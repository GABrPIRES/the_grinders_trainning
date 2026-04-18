'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  User,
  Users,
  GraduationCap,
  Settings,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/authService';
import Image from 'next/image';

const navItems = [
  { label: 'Home',          href: '/admin',          icon: <Home size={18} /> },
  { label: 'Perfil',        href: '/admin/profile',  icon: <User size={18} /> },
  { label: 'Coaches',       href: '/admin/coaches',  icon: <Users size={18} /> },
  { label: 'Alunos',        href: '/admin/students', icon: <GraduationCap size={18} /> },
  { label: 'Configurações', href: '/admin/settings', icon: <Settings size={18} /> },
];

export default function AdminSidebar() {
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
            const isHome = item.href === '/admin';
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
