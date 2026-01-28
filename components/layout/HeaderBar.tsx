"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, User, Calendar } from "lucide-react";
import Image from 'next/image';

export default function HeaderBar() {
  const pathname = usePathname();

  // Função simples para mostrar onde o usuário está
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
    // 'sticky top-0' mantém a barra fixa no topo enquanto a página rola
    // 'pl-14' no mobile garante que o texto não fique embaixo do botão preto do menu
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b border-neutral-200 px-6 py-3 shadow-sm transition-all md:pl-8">
      
      {/* Lado Esquerdo: Título da Página */}
      <div className="flex w-full justify-between">
        {/* Logo: Aparece no mobile (sm), some no desktop (md+) */}
        <div className="md:hidden">
          <Image 
            src="/images/logo_the_grinders_dark-removebg-preview.png" 
            alt="Logo" 
            width={120} 
            height={40} 
            priority 
          />
        </div>

        {/* Título e Data: Aparecem só no desktop (md+) e centralizados */}
        <div className="hidden md:flex flex-col items-start">
          <h1 className="text-xl font-bold text-neutral-800 leading-tight">
            {getPageTitle(pathname)}
          </h1>
          <p className="text-xs text-neutral-500 capitalize">
            {currentDate}
          </p>
        </div>

        {/* Div vazia no mobile para empurrar a logo para a esquerda via justify-between */}
        <div className="md:hidden w-[120px]"></div>
      </div>

      {/* Lado Direito: Ações */}
      <div className="flex items-center gap-3 sm:gap-5">

        {/* Notificações */}
        <button className="relative p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors">
          <Bell size={20} />
          {/* Bolinha vermelha de notificação */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 border border-white"></span>
        </button>

        <div className="h-6 w-px bg-neutral-200 hidden sm:block"></div>

        {/* Mini Perfil */}
        <div className="flex items-center gap-3">
           <div className="h-9 w-9 rounded-full bg-red-700 text-white flex items-center justify-center border-2 border-white shadow-sm">
              <User size={18} />
           </div>
        </div>

      </div>
    </header>
  );
}