"use client";

import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import Image from 'next/image';
import DarkModeToggle from './DarkModeToggle';

export default function HeaderBar() {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.includes("/treinos")) return "Gestão de Treinos";
    if (path.includes("/students") || path.includes("/alunos")) return "Meus Alunos";
    if (path.includes("/payments") || path.includes("/financeiro")) return "Financeiro";
    if (path.includes("/profile")) return "Meu Perfil";
    if (path.includes("/settings")) return "Configurações";
    if (path === "/coach" || path === "/admin" || path === "/aluno") return "Dashboard";
    return "The Grinders";
  };

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-surface-elevated border-b border-line px-6 py-3 shadow-sm transition-all md:pl-8">

      {/* Esquerda: logo (mobile) ou título/data (desktop) */}
      <div className="flex w-full justify-between">
        <div className="md:hidden">
          <Image
            src="/images/logo_the_grinders_dark-removebg-preview.png"
            alt="Logo"
            width={120}
            height={40}
            priority
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
        <button className="relative p-2 text-content-secondary hover:bg-surface-subtle rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand border-2 border-surface-elevated" />
        </button>

        <div className="h-6 w-px bg-line hidden sm:block" />

        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-brand text-content-on-brand flex items-center justify-center border-2 border-surface-elevated shadow-sm">
          <User size={18} />
        </div>

      </div>
    </header>
  );
}
