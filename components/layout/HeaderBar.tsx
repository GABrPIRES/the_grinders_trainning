"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, User } from "lucide-react";
import Image from 'next/image';
import DarkModeToggle from './DarkModeToggle';
import NotificationsDropdown from './NotificationsDropdown';
import { useNotifications } from '@/hooks/useNotifications';

export default function HeaderBar() {
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("pt-BR", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }));
  }, []);

  const getPageTitle = (path: string) => {
    if (path.includes("/treinos")) return "Gestão de Treinos";
    if (path.includes("/students") || path.includes("/alunos")) return "Meus Alunos";
    if (path.includes("/payments") || path.includes("/financeiro")) return "Financeiro";
    if (path.includes("/profile")) return "Meu Perfil";
    if (path.includes("/settings")) return "Configurações";
    if (path === "/coach" || path === "/admin" || path === "/aluno") return "Dashboard";
    return "The Grinders";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-surface-sidebar border-b border-line px-6 py-3 shadow-sm transition-all md:pl-8 md:bg-surface-elevated">

      {/* Esquerda: logo (mobile) ou título/data (desktop) */}
      <div className="flex w-full justify-between">
        <div className="md:hidden">
          <Image
            src="/images/logos/logo_transparent.png"
            alt="Logo"
            width={120}
            height={40}
            priority
            className="hidden dark:block"
          />
          <Image
            src="/images/logos/logo_dark_transparent.png"
            alt="Logo"
            width={120}
            height={40}
            priority
            className="block dark:hidden"
          />
        </div>
        <div className="hidden md:flex flex-col items-start">
          <h1 className="text-xl font-bold text-content-primary leading-tight">
            {getPageTitle(pathname)}
          </h1>
          <p className="text-xs text-content-secondary capitalize">
            {currentDate}
          </p>
        </div>
        {/* Espaçador mobile */}
        <div className="md:hidden w-[120px]" />
      </div>

      {/* Direita: ações */}
      <div className="flex items-center gap-2 sm:gap-3">

        <DarkModeToggle />

        {/* Notificações */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative p-2 text-content-secondary hover:bg-surface-subtle rounded-full transition-colors"
            aria-label="Notificações"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-content-on-brand border border-surface-elevated">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationsDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              loading={loading}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>

        <div className="h-6 w-px bg-line hidden sm:block" />

        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-brand text-content-on-brand flex items-center justify-center border-2 border-surface-elevated shadow-sm">
          <User size={18} />
        </div>

      </div>
    </header>
  );
}
