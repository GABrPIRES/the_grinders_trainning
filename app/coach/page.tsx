"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, Users, CreditCard, ClipboardList, UserPlus, Upload, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Interface para os dados do dashboard
interface DashboardData {
  total_revenue_current_month: number;
  active_students_count: number;
  overdue_payments_count: number;
  revenue_chart_data: { date: string; total: number }[];
}

// Componente para os cards de estatísticas
function StatCard({ title, value, icon, colorClass }: { title: string; value: string | number; icon: React.ReactNode; colorClass: string }) {
  return (
    <div className={`p-6 bg-white rounded-lg shadow border-l-4 ${colorClass}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="text-3xl font-bold text-neutral-800">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

// Componente para os atalhos
function ShortcutCard({ title, href, icon, router }: { title: string; href: string; icon: React.ReactNode; router: any }) {
  return (
    <button
      onClick={() => router.push(href)}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer text-center"
    >
      {icon}
      <p className="mt-2 text-sm font-semibold text-neutral-700">{title}</p>
    </button>
  );
}

export default function CoachDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardData = await fetchWithAuth('coach_dashboard');
        setData(dashboardData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <p className="p-6">Carregando dashboard...</p>;
  }
  if (error) {
    return <p className="p-6 text-red-600">Erro ao carregar dados: {error}</p>;
  }
  if (!data) {
    return <p className="p-6">Nenhum dado encontrado.</p>;
  }

  // Formata o valor do faturamento para Reais (BRL)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 1. Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Faturamento (Mês)"
          value={formatCurrency(data.total_revenue_current_month)}
          icon={<DollarSign className="h-10 w-10 text-green-500" />}
          colorClass="border-green-500"
        />
        <StatCard
          title="Alunos Ativos"
          value={data.active_students_count}
          icon={<Users className="h-10 w-10 text-blue-500" />}
          colorClass="border-blue-500"
        />
        <StatCard
          title="Pagamentos Atrasados"
          value={data.overdue_payments_count}
          icon={<AlertCircle className="h-10 w-10 text-red-500" />}
          colorClass="border-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Gráfico de Faturamento */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-neutral-800">Faturamento (Últimos 30 dias)</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.revenue_chart_data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Total']} />
                <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Atalhos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-neutral-800">Atalhos</h2>
          <div className="grid grid-cols-2 gap-4">
            <ShortcutCard title="Gerenciar Alunos" href="/coach/students" icon={<Users className="h-8 w-8 text-neutral-600" />} router={router} />
            <ShortcutCard title="Adicionar Aluno" href="/coach/students/create" icon={<UserPlus className="h-8 w-8 text-neutral-600" />} router={router} />
            <ShortcutCard title="Gerenciar Planos" href="/coach/plans" icon={<ClipboardList className="h-8 w-8 text-neutral-600" />} router={router} />
            <ShortcutCard title="Ver Pagamentos" href="/coach/payments" icon={<CreditCard className="h-8 w-8 text-neutral-600" />} router={router} />
            <ShortcutCard title="Importar Treinos" href="/coach/import" icon={<Upload className="h-8 w-8 text-neutral-600" />} router={router} />
          </div>
        </div>
      </div>
    </div>
  );
}