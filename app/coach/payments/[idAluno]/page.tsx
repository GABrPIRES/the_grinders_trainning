"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  ArrowLeft, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  CreditCard,
  Calendar,
  MoreHorizontal
} from "lucide-react";

interface Plano {
  name: string;
  price: number;
}

interface Aluno {
  id: string;
  user: { name: string };
  plano?: Plano; 
}

interface Pagamento {
  id: string;
  amount: number;
  status: "pendente" | "pago" | "atrasado";
  due_date: string;
  paid_at: string | null;
}

export default function StudentPaymentsPage() {
  const { idAluno } = useParams();
  const router = useRouter();
  
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [alunoData, pagamentosData] = await Promise.all([
          fetchWithAuth(`alunos/${idAluno}`),
          fetchWithAuth(`pagamentos?aluno_id=${idAluno}`)
        ]);
        setAluno(alunoData);
        setPagamentos(pagamentosData || []);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [idAluno]);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const getStatusBadge = (status: string, paid_at?: string | null) => {
      switch (status) {
          case 'pago':
              return (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle size={14} className="mr-1" /> Pago {paid_at ? `em ${formatDate(paid_at)}` : ''}
                  </span>
              );
          case 'pendente':
              return (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock size={14} className="mr-1" /> Pendente
                  </span>
              );
          case 'atrasado':
              return (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertCircle size={14} className="mr-1" /> Atrasado
                  </span>
              );
          default:
              return null;
      }
  };

  if (loading) return <div className="p-8 text-center text-neutral-500">Carregando financeiro...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 text-neutral-800 pb-20 md:pb-0">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
            </button>
            <div>
            <h1 className="text-2xl font-bold">Histórico Financeiro</h1>
            {aluno && <p className="text-neutral-500 text-sm">Aluno: {aluno.user.name}</p>}
            </div>
        </div>
      </div>

      {/* CARD DO PLANO (Adapta-se ao Mobile) */}
      {aluno?.plano ? (
        <div className="bg-white border border-red-100 rounded-xl shadow-sm p-5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div> {/* Detalhe visual */}
          <div className="flex items-center gap-4 pl-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-full hidden sm:block">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Plano Atual</p>
              <h2 className="text-xl font-bold text-neutral-900">{aluno.plano.name}</h2>
            </div>
          </div>
          <div className="w-full sm:w-auto text-left sm:text-right border-t sm:border-t-0 sm:border-l border-neutral-100 pt-3 sm:pt-0 sm:pl-6 pl-3">
             <p className="text-xs text-neutral-500 mb-1">Mensalidade</p>
             <p className="text-2xl font-bold text-neutral-800">{formatMoney(aluno.plano.price)}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6 text-center text-gray-500 text-sm">
          Este aluno não possui um plano ativo no momento.
        </div>
      )}

      {/* TÍTULO E BOTÃO DE NOVO PAGAMENTO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-lg font-bold text-neutral-800">Pagamentos</h2>
        <button
          onClick={() => router.push(`/coach/payments/${idAluno}/pagamento/create`)}
          className="w-full sm:w-auto bg-red-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-black transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> Novo Pagamento
        </button>
      </div>

      {/* LISTA DE PAGAMENTOS */}
      {pagamentos.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-neutral-200 text-center flex flex-col items-center">
            <Calendar className="text-neutral-300 mb-3" size={40} />
            <p className="text-neutral-500">Nenhum pagamento registrado.</p>
        </div>
      ) : (
        <>
            {/* --- MOBILE (CARDS) --- */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
                {pagamentos.map((pgto) => (
                    <div 
                        key={pgto.id}
                        onClick={() => router.push(`/coach/payments/${idAluno}/pagamento/${pgto.id}`)}
                        className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm active:scale-[0.98] transition-transform relative"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">Vencimento</p>
                                <p className="font-bold text-neutral-900 text-lg">{formatDate(pgto.due_date)}</p>
                            </div>
                            <p className="font-bold text-neutral-800 text-lg">{formatMoney(pgto.amount)}</p>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-neutral-50">
                            {getStatusBadge(pgto.status, pgto.paid_at)}
                            <MoreHorizontal size={20} className="text-neutral-300" />
                        </div>
                    </div>
                ))}
            </div>

            {/* --- DESKTOP (TABELA) --- */}
            <div className="hidden md:block bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Vencimento</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                    {pagamentos.map((pgto) => (
                        <tr key={pgto.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">
                            {formatDate(pgto.due_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                            {formatMoney(pgto.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(pgto.status, pgto.paid_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                            onClick={() => router.push(`/coach/payments/${idAluno}/pagamento/${pgto.id}`)}
                            className="text-neutral-400 hover:text-indigo-600 p-2 hover:bg-neutral-100 rounded-full transition-colors"
                            >
                                <MoreHorizontal size={20} />
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
      )}
    </div>
  );
}