"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Users, TrendingUp, Shield,
  ArrowRight, Activity, UserPlus,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalAlunos: 0, totalCoaches: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [alunosData, coachesData] = await Promise.all([
          fetchWithAuth("admin/alunos?limit=1").catch(() => ({ total: 0 })),
          fetchWithAuth("admin/coaches?limit=1").catch(() => ({ total: 0 })),
        ]);
        setStats({ totalAlunos: alunosData.total || 0, totalCoaches: coachesData.total || 0 });
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, link }: any) => (
    <div
      onClick={() => router.push(link)}
      className="bg-surface-elevated border border-line rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-36 relative overflow-hidden"
    >
      <div className="absolute top-[-10px] right-[-10px] p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 text-brand">
        <Icon size={100} />
      </div>
      <div className="flex items-center gap-3 z-10">
        <div className="p-2.5 rounded-xl bg-brand/10">
          <Icon size={22} className="text-brand" />
        </div>
        <span className="text-sm font-bold text-content-muted uppercase tracking-wide">{title}</span>
      </div>
      <div className="flex items-end justify-between z-10">
        <h3 className="text-4xl font-bold text-content-primary tracking-tight">{loading ? "-" : value}</h3>
        <div className="bg-surface-subtle p-2 rounded-full group-hover:bg-surface-page transition-colors border border-line">
          <ArrowRight size={18} className="text-content-muted group-hover:text-content-secondary" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-content-primary">Dashboard</h1>
          <p className="text-sm text-content-tertiary">Visão geral do sistema.</p>
        </div>
        <span className="px-3 py-1.5 bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-semantic-success-text animate-pulse" /> Sistema Online
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total de Alunos" value={stats.totalAlunos} icon={Users} link="/admin/students" />
        <StatCard title="Coaches Parceiros" value={stats.totalCoaches} icon={Shield} link="/admin/coaches" />
      </div>

      {/* Ações e Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Ações Rápidas */}
        <div className="bg-surface-elevated border border-line rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-content-primary mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-content-muted" /> Ações Rápidas
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/admin/students/create')}
              className="w-full text-left p-4 rounded-xl border border-line hover:bg-surface-subtle hover:border-brand/30 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-surface-subtle p-2 rounded-lg text-brand group-hover:bg-brand group-hover:text-content-on-brand transition-colors border border-line">
                  <UserPlus size={20} />
                </div>
                <div>
                  <span className="font-bold text-content-primary block text-sm">Novo Aluno</span>
                  <span className="text-xs text-content-tertiary">Cadastrar usuário na plataforma</span>
                </div>
              </div>
              <ArrowRight size={18} className="text-content-muted group-hover:text-brand transition-colors" />
            </button>

            <button
              onClick={() => router.push('/admin/coaches/create')}
              className="w-full text-left p-4 rounded-xl border border-line hover:bg-surface-subtle hover:border-brand/30 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-surface-subtle p-2 rounded-lg text-content-secondary group-hover:bg-brand group-hover:text-content-on-brand transition-colors border border-line">
                  <Shield size={20} />
                </div>
                <div>
                  <span className="font-bold text-content-primary block text-sm">Novo Coach</span>
                  <span className="text-xs text-content-tertiary">Adicionar parceiro profissional</span>
                </div>
              </div>
              <ArrowRight size={18} className="text-content-muted group-hover:text-brand transition-colors" />
            </button>
          </div>
        </div>

        {/* Banner Institucional */}
        <div className="bg-brand rounded-2xl p-8 text-content-on-brand relative overflow-hidden flex flex-col justify-center min-h-[250px]">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Painel Administrativo</h2>
            <p className="opacity-80 mb-6 max-w-sm text-sm leading-relaxed">
              Você tem controle total sobre usuários, permissões e acesso. Utilize as abas laterais para gestão detalhada.
            </p>
          </div>
          <Activity className="absolute -bottom-6 -right-6 opacity-10" size={180} />
        </div>
      </div>
    </div>
  );
}
