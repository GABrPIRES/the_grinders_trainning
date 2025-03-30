'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function HeaderBar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const title = pathname
    .split('/')
    .filter(Boolean)
    .pop()
    ?.toUpperCase() || 'DASHBOARD';

  return (
    <div className="w-full bg-neutral-800 text-white py-4 px-6 border-b-4 border-red-700 pl-16 sm:pl-16 md:pl-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm tracking-wider text-gray-400">{title}</h2>
        <p className="text-lg font-medium">
          Fala, {user?.name} 👋 Bora pra cima 💪
        </p>
        <p className="text-xs text-gray-400 italic">
          Treine com propósito, evolua com foco!
        </p>
      </div>
    </div>
  );
}

