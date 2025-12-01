"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  Users, TrendingUp, Shield, 
  ArrowRight, Activity, UserPlus 
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalCoaches: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Buscamos apenas 1 registro para pegar o 'total' do cabeçalho/json da resposta
        // Isso economiza dados e garante a contagem correta do banco
        const [alunosData, coachesData] = await Promise.all([
          fetchWithAuth("admin/alunos?limit=1").catch(() => ({ total: 0 })), 
          fetchWithAuth("admin/coaches?limit=1").catch(() => ({ total: 0 }))
        ]);
        
        setStats({
          totalAlunos: alunosData.total || 0,
          totalCoaches: coachesData.total || 0,
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, link }: any) => (
    <div 
      onClick={() => router.push(link)}
      className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-36 relative overflow-hidden"
    >
        {/* Ícone de Fundo Decorativo */}
        <div className={`absolute top-[-10px] right-[-10px] p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 ${colorClass.replace("bg-", "text-")}`}>
            <Icon size={100} />
        </div>
        
        {/* Ícone e Título */}
        <div className="flex items-center gap-3 z-10">
            <div className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
                <Icon size={22} className={colorClass.replace("bg-", "text-")} />
            </div>
            <span className="text-sm font-bold text-neutral-500 uppercase tracking-wide">{title}</span>
        </div>

        {/* Valor e Seta */}
        <div className="flex items-end justify-between z-10">
            <h3 className="text-4xl font-extrabold text-neutral-900 tracking-tight">{loading ? "-" : value}</h3>
            <div className="bg-neutral-50 p-2 rounded-full group-hover:bg-neutral-100 transition-colors border border-transparent group-hover:border-neutral-200">
                <ArrowRight size={18} className="text-neutral-400 group-hover:text-neutral-600"/>
            </div>
        </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-0 text-neutral-800">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-500">Visão geral do sistema.</p>
        </div>
        <div>
             <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Sistema Online
             </span>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Total de Alunos" 
          value={stats.totalAlunos} 
          icon={Users} 
          colorClass="bg-blue-600 text-blue-600" 
          link="/admin/students"
        />
        <StatCard 
          title="Coaches Parceiros" 
          value={stats.totalCoaches} 
          icon={Shield} 
          colorClass="bg-neutral-900 text-neutral-900" 
          link="/admin/coaches"
        />
      </div>

      {/* SECÇÃO DE AÇÕES E STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* Card de Ações Rápidas */}
         <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm h-full">
            <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-neutral-400"/> Ações Rápidas
            </h2>
            <div className="space-y-4">
               <button 
                 onClick={() => router.push('/admin/students/create')} 
                 className="w-full text-left p-4 rounded-xl border border-neutral-100 hover:bg-neutral-50 hover:border-neutral-200 transition-all flex items-center justify-between group"
               >
                  <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <UserPlus size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-neutral-800 block">Novo Aluno</span>
                        <span className="text-xs text-neutral-500">Cadastrar usuário na plataforma</span>
                      </div>
                  </div>
                  <ArrowRight size={18} className="text-neutral-300 group-hover:text-blue-600 transition-colors"/>
               </button>

               <button 
                 onClick={() => router.push('/admin/coaches/create')} 
                 className="w-full text-left p-4 rounded-xl border border-neutral-100 hover:bg-neutral-50 hover:border-neutral-200 transition-all flex items-center justify-between group"
               >
                  <div className="flex items-center gap-3">
                      <div className="bg-neutral-100 p-2 rounded-lg text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                        <Shield size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-neutral-800 block">Novo Coach</span>
                        <span className="text-xs text-neutral-500">Adicionar parceiro profissional</span>
                      </div>
                  </div>
                  <ArrowRight size={18} className="text-neutral-300 group-hover:text-neutral-900 transition-colors"/>
               </button>
            </div>
         </div>

         {/* Card Institucional / Status */}
         <div className="bg-red-700 rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-center min-h-[250px]">
            <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">Painel Administrativo</h2>
                <p className="text-neutral-400 mb-6 max-w-sm text-sm leading-relaxed">
                    Você tem controle total sobre usuários, permissões e acesso. Utilize as abas laterais para gestão detalhada.
                </p>
                <div className="flex gap-3">
                    <button className="text-xs font-bold text-white border border-neutral-600 px-4 py-2 rounded-lg hover:bg-white hover:text-neutral-900 transition-all">
                        Logs do Sistema
                    </button>
                </div>
            </div>
            {/* Elemento decorativo de fundo */}
            <Activity className="absolute -bottom-6 -right-6 text-neutral-800 opacity-20" size={180} />
         </div>
      </div>

    </div>
  );
}