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
  Shield,
} from 'lucide-react';
import { logout } from '@/services/authService';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  { label: 'Home', href: '/aluno', icon: <Home size={18} /> },
  { label: 'Meus Treinos', href: '/aluno/treinos', icon: <Dumbbell size={18} /> },
  { label: 'Meu Coach', href: '/aluno/coach', icon: <Shield size={18} /> },
  { label: 'Pagamentos', href: '/aluno/payment', icon: <CreditCard size={18} /> },
  { label: 'Meu Perfil', href: '/aluno/profile', icon: <User size={18} /> },
  { label: 'Configurações', href: '/aluno/settings', icon: <Settings size={18} /> },
  { label: 'Ajuda', href: '/aluno/help', icon: <HelpCircle size={18} /> },
];

export default function AlunoSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="sidebar-hide-scroll w-64 h-screen bg-black text-white flex flex-col justify-between">
      <div>
        <div className="text-center py-6 border-b border-gray-700">
            <Image
                src="/images/logo-the-grinders-2-removebg-preview.png"
                alt="Logo The Grinders"
                width={250}
                height={50}
                className="mx-auto"
                priority
            />
        </div>
        <nav className="mt-6 space-y-2 px-4">
          {navItems.map((item) => {
            // --- AQUI ESTÁ A CORREÇÃO ---
            // Para a Home, checamos a igualdade exata. Para os outros, usamos startsWith.
            const isActive = item.href === '/aluno' 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition font-medium ${
                  isActive ? 'bg-red-700 text-white' : 'hover:bg-gray-800 text-gray-300'
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
          className="flex items-center gap-3 text-gray-400 cursor-pointer hover:text-red-600 w-full"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}