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
  Calendar
} from "lucide-react";

interface Plano {
  name: string;
  price: number;
}

interface Aluno {
  id: string;
  user: { name: string };
  plano?: Plano; // Agora virá preenchido da API
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
        // Busca dados do aluno e seus pagamentos
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

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 text-neutral-800">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          {aluno && <p className="text-neutral-500">Aluno: {aluno.user.name}</p>}
        </div>
      </div>

      {/* Card de Informações do Plano */}
      {aluno?.plano ? (
        <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Plano Atual</p>
              <h2 className="text-xl font-bold text-neutral-800">{aluno.plano.name}</h2>
            </div>
          </div>
          <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
             <p className="text-sm text-neutral-500">Mensalidade</p>
             <p className="text-2xl font-bold text-green-600">{formatMoney(aluno.plano.price)}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6 text-center text-gray-500">
          Este aluno não possui um plano ativo no momento.
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Histórico de Pagamentos</h2>
        <button
          onClick={() => router.push(`/coach/payments/${idAluno}/pagamento/create`)}
          className="bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-800 transition-colors font-medium"
        >
          <Plus size={18} /> Novo Pagamento
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {pagamentos.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <Calendar className="mx-auto h-10 w-10 text-neutral-300 mb-3" />
            <p>Nenhum pagamento registrado.</p>
          </div>
        ) : (
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
                    {pgto.status === 'pago' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={14} className="mr-1" /> Pago
                      </span>
                    )}
                    {pgto.status === 'pendente' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock size={14} className="mr-1" /> Pendente
                      </span>
                    )}
                    {pgto.status === 'atrasado' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle size={14} className="mr-1" /> Atrasado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => router.push(`/coach/payments/${idAluno}/pagamento/${pgto.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}