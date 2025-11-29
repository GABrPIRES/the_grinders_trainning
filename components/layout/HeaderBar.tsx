"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, User, Calendar } from "lucide-react";

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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b border-neutral-200 px-6 py-3 shadow-sm transition-all pl-16 md:pl-8">
      
      {/* Lado Esquerdo: Título da Página */}
      <div className="flex flex-col justify-center">
        <h1 className="text-lg md:text-xl font-bold text-neutral-800 leading-tight">
          {getPageTitle(pathname)}
        </h1>
        {/* Data ou subtítulo discreto */}
        <p className="text-xs text-neutral-500 hidden sm:block capitalize">
          {currentDate}
        </p>
      </div>

      {/* Lado Direito: Ações */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Barra de Busca Rápida (Desktop) */}
        <div className="hidden md:flex items-center bg-neutral-50 rounded-full px-3 py-1.5 border border-neutral-200">
           <Search size={16} className="text-neutral-400 mr-2"/>
           <input 
             type="text" 
             placeholder="Busca rápida..." 
             className="bg-transparent text-sm outline-none text-neutral-700 w-32 focus:w-48 transition-all"
           />
        </div>

        {/* Notificações */}
        <button className="relative p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors">
          <Bell size={20} />
          {/* Bolinha vermelha de notificação */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 border border-white"></span>
        </button>

        <div className="h-6 w-px bg-neutral-200 hidden sm:block"></div>

        {/* Mini Perfil */}
        <div className="flex items-center gap-3">
           <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-neutral-800 leading-none">Minha Conta</p>
              <p className="text-xs text-neutral-500 leading-none mt-1">Coach</p>
           </div>
           <div className="h-9 w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center border-2 border-white shadow-sm">
              <User size={18} />
           </div>
        </div>

      </div>
    </header>
  );
}