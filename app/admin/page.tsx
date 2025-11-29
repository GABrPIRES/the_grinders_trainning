"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  Users, Dumbbell, TrendingUp, Shield, 
  ArrowRight, Activity 
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalCoaches: 0,
    totalExercicios: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Buscamos as listas para contar (ou use um endpoint de dashboard se tiver)
        const [alunos, coaches, exercicios] = await Promise.all([
          fetchWithAuth("admin/alunos").catch(() => []), 
          fetchWithAuth("admin/coaches").catch(() => []),
          fetchWithAuth("exercises").catch(() => []) // Ajuste a rota se for diferente
        ]);
        
        setStats({
          totalAlunos: Array.isArray(alunos) ? alunos.length : alunos?.alunos?.length || 0,
          totalCoaches: Array.isArray(coaches) ? coaches.length : 0,
          totalExercicios: Array.isArray(exercicios) ? exercicios.length : 0
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
      className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
          <Icon size={24} className={colorClass.replace("bg-", "text-")} />
        </div>
        <div className="bg-neutral-100 p-1.5 rounded-full group-hover:bg-neutral-200 transition-colors">
           <ArrowRight size={16} className="text-neutral-400 group-hover:text-neutral-600"/>
        </div>
      </div>
      <h3 className="text-3xl font-bold text-neutral-900 mb-1">{loading ? "-" : value}</h3>
      <p className="text-sm text-neutral-500 font-medium">{title}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-0 text-neutral-800">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Visão Geral</h1>
        <p className="text-neutral-500">Bem-vindo ao painel administrativo do The Grinders.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Alunos Ativos" 
          value={stats.totalAlunos} 
          icon={Users} 
          colorClass="bg-blue-600 text-blue-600" 
          link="/admin/students"
        />
        <StatCard 
          title="Coaches Parceiros" 
          value={stats.totalCoaches} 
          icon={Shield} 
          colorClass="bg-red-600 text-red-600" 
          link="/admin/coaches"
        />
      </div>

      {/* QUICK ACTIONS / SEÇÕES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-8 text-white">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
               <Activity size={24} className="text-red-500"/> Status do Sistema
            </h2>
            <p className="text-neutral-400 mb-6 text-sm">Todas as APIs e serviços estão operando normalmente.</p>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Online
               </span>
               <span className="px-3 py-1 bg-white/10 text-white border border-white/20 rounded-full text-xs font-bold">v1.0.0</span>
            </div>
         </div>

         <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
               <button onClick={() => router.push('/admin/exercises/new')} className="w-full text-left p-4 rounded-xl border border-neutral-100 hover:bg-neutral-50 hover:border-neutral-200 transition-all flex items-center justify-between group">
                  <span className="font-semibold text-neutral-700 group-hover:text-red-700">Cadastrar Novo Exercício</span>
                  <Dumbbell size={18} className="text-neutral-300 group-hover:text-red-700"/>
               </button>
               <button onClick={() => router.push('/admin/coaches/new')} className="w-full text-left p-4 rounded-xl border border-neutral-100 hover:bg-neutral-50 hover:border-neutral-200 transition-all flex items-center justify-between group">
                  <span className="font-semibold text-neutral-700 group-hover:text-red-700">Adicionar Novo Coach</span>
                  <Shield size={18} className="text-neutral-300 group-hover:text-red-700"/>
               </button>
            </div>
         </div>
      </div>

    </div>
  );
}