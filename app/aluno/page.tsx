"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  Dumbbell, 
  Calendar, 
  CreditCard, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { parseISO, isWithinInterval } from "date-fns"; // Mantido apenas para lógica

interface DashboardData {
  student_name: string;
  status_financeiro: 'ativo' | 'vencido' | 'inativo';
  plano_nome: string;
  vencimento: string | null;
  active_block: { title: string; id: string } | null;
  current_week: { number: number; start_date: string; end_date: string; id: string } | null;
  next_workout: { id: string; name: string; day: string } | null;
  treinos_concluidos: number;
}

function ShortcutCard({ title, subtitle, icon, href, colorClass, router }: any) {
  return (
    <button
      onClick={() => router.push(href)}
      className={`flex items-center p-4 bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-all text-left group ${colorClass}`}
    >
      <div className="p-3 rounded-full bg-neutral-50 group-hover:bg-white transition-colors">
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="font-bold text-neutral-800">{title}</h3>
        <p className="text-xs text-neutral-500">{subtitle}</p>
      </div>
      <ArrowRight className="ml-auto text-neutral-300 group-hover:text-current transition-colors" size={20} />
    </button>
  );
}

export default function AlunoDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchWithAuth('student_dashboard');
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- CORREÇÃO DE DATA ---
  // Usamos toLocaleDateString com UTC para garantir que a data não volte 1 dia
  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não def.";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short', 
      timeZone: 'UTC' // Força o uso da data UTC (original)
    }).replace('.', ''); // Remove o ponto do mês abrev. (opcional)
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Carregando seu dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-red-600">Erro ao carregar dados.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-neutral-800">
      
      {/* Cabeçalho de Boas-vindas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Olá, {data.student_name.split(' ')[0]}!</h1>
          <p className="text-neutral-500">Pronto para o treino de hoje?</p>
        </div>
        
        {/* Status Financeiro */}
        <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
          data.status_financeiro === 'ativo' ? 'bg-green-100 text-green-700' : 
          data.status_financeiro === 'vencido' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {data.status_financeiro === 'ativo' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {data.status_financeiro === 'ativo' ? 'Mensalidade em dia' : 
           data.status_financeiro === 'vencido' ? 'Pagamento Pendente' : 'Sem Assinatura'}
        </div>
      </div>

      {/* 1. CARD DESTAQUE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda */}
        <div className="lg:col-span-2 space-y-6">
          
          {data.active_block ? (
            <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                <Dumbbell size={150} />
              </div>

              <div className="relative z-10">
                <p className="text-red-100 text-sm font-medium mb-1 uppercase tracking-wider">
                  {data.active_block.title}
                </p>
                
                {data.current_week ? (
                   <div className="mb-6">
                     <h2 className="text-3xl font-bold mb-2">Semana {data.current_week.number}</h2>
                     <p className="text-red-100 flex items-center gap-2">
                       <Calendar size={18} />
                       {formatDate(data.current_week.start_date)} - {formatDate(data.current_week.end_date)}
                     </p>
                   </div>
                ) : (
                   <h2 className="text-2xl font-bold mb-6">Nenhuma semana ativa hoje</h2>
                )}

                {data.next_workout ? (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-red-100 text-xs uppercase mb-1">Próxima Sessão</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold">{data.next_workout.name}</h3>
                        <p className="text-sm opacity-90">{formatDate(data.next_workout.day)}</p>
                      </div>
                      <button 
                        onClick={() => router.push(`/aluno/treinos/${data.next_workout!.id}`)}
                        className="bg-white text-red-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors"
                      >
                        Começar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p>Você completou todos os treinos agendados!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-neutral-100 p-8 rounded-2xl text-center border border-neutral-200">
               <p className="text-neutral-500">Seu coach ainda não definiu um bloco de treinos.</p>
            </div>
          )}
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <h3 className="font-bold text-neutral-700 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600"/>
                Resumo do Bloco
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
                    <span className="text-sm text-neutral-500">Treinos Realizados</span>
                    <span className="text-xl font-bold text-neutral-800">{data.treinos_concluidos}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-500">Plano Atual</span>
                    <span className="text-sm font-bold text-neutral-800 bg-neutral-100 px-2 py-1 rounded">{data.plano_nome}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. ATALHOS */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-neutral-800">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ShortcutCard 
            title="Ver Treinos" 
            subtitle="Seu programa completo" 
            icon={<Dumbbell size={24} />} 
            href="/aluno/treinos"
            colorClass="hover:border-red-500 text-red-700"
            router={router}
          />
          
          <ShortcutCard 
            title="Meu Coach" 
            subtitle="Contato e infos" 
            icon={<User size={24} />} 
            href="/aluno/coach"
            colorClass="hover:border-blue-500 text-blue-700"
            router={router}
          />

          <ShortcutCard 
            title="Financeiro" 
            subtitle="Pagamentos e plano" 
            icon={<CreditCard size={24} />} 
            href="/aluno/payment"
            colorClass="hover:border-green-500 text-green-700"
            router={router}
          />
        </div>
      </div>

    </div>
  );
}