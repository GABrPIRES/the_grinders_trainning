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
  { label: 'Home', href: '/admin', icon: <Home size={18} /> },
  { label: 'Profile', href: '/admin/profile', icon: <User size={18} /> },
  { label: 'Coachs', href: '/admin/coachs', icon: <Users size={18} /> },
  { label: 'Estudents', href: '/admin/estudents', icon: <GraduationCap size={18} /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings size={18} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="w-64 h-screen bg-black text-white flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="text-center py-6 border-b border-gray-700">
                    <Image
                        src="/images/logo-the-grinders-2.png"
                        alt="Logo The Grinders"
                        width={250}
                        height={50}
                        className="mx-auto"
                        priority
                    />
                </div>

        {/* Navegação */}
        <nav className="mt-6 space-y-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition font-medium ${
                  isActive
                    ? 'bg-red-700 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
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
