'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, User, Home, Dumbbell, CreditCard, Settings, HelpCircle } from 'lucide-react';
import { logout } from '@/services/authService';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  { label: 'Home', href: '/coach', icon: <Home /> },
  { label: 'Profile', href: '/coach/profile', icon: <User /> },
  { label: 'Workouts', href: '/coach/workouts', icon: <Dumbbell /> },
  { label: 'Payment', href: '/coach/payment', icon: <CreditCard /> },
  { label: 'Settings', href: '/coach/settings', icon: <Settings /> },
  { label: 'Help', href: '/coach/help', icon: <HelpCircle /> },
];

export default function AlunoSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
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

        {/* Menu */}
        <nav className="mt-6 space-y-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
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

      {/* Logout */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-400 cursor-pointer hover:text-red-600 w-full"
        >
          <LogOut />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}