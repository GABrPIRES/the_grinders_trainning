'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { PlusCircle, ArrowLeft } from 'lucide-react';

interface Pagamento {
  id: string;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: 'pendente' | 'pago' | 'atrasado';
}

// Supondo que você também queira mostrar o nome do aluno
interface Aluno {
  user: { name: string; };
}

export default function PaymentHistoryPage() {
  const [history, setHistory] = useState<Pagamento[]>([]);
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { idAluno } = useParams();

  useEffect(() => {
    if (!idAluno) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Busca o histórico e os dados do aluno em paralelo
        const [historyData, alunoData] = await Promise.all([
          fetchWithAuth(`pagamentos?aluno_id=${idAluno}`),
          fetchWithAuth(`alunos/${idAluno}`)
        ]);
        setHistory(historyData);
        setAluno(alunoData);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [idAluno]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto text-neutral-800">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <button onClick={() => router.push('/coach/payments')} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
            <ArrowLeft size={16} />
            Voltar para a lista
          </button>
          <h1 className="text-2xl font-bold">
            Histórico de Pagamentos{aluno ? `: ${aluno.user.name}` : ''}
          </h1>
        </div>
        <button 
          onClick={() => router.push(`/coach/payments/${idAluno}/pagamento/create`)}
          className="bg-red-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-800 flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Novo Pagamento
        </button>
      </div>

      {loading ? <p>Carregando histórico...</p> : (
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full table-auto text-sm">
            <thead className="sticky top-0 bg-gray-100">
              <tr className="text-left">
                <th className="p-2 font-semibold">Vencimento</th>
                <th className="p-2 font-semibold">Valor</th>
                <th className="p-2 font-semibold">Status</th>
                <th className="p-2 font-semibold">Data Pag.</th>
                <th className="p-2 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map(p => (
                <tr 
                  key={p.id} 
                  onClick={() => router.push(`/coach/payments/${idAluno}/pagamento/${p.id}`)}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-2">{new Date(p.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                  <td className="p-2">R$ {p.amount.toFixed(2).replace('.', ',')}</td>
                  <td className={`p-2 font-semibold ${p.status === 'pago' ? 'text-green-600' : 'text-orange-500'}`}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</td>
                  <td className="p-2">{p.paid_at ? new Date(p.paid_at).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</td>
                  <td className="p-2 text-center text-blue-600 hover:underline">
                    Ver / Editar
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-neutral-500">Nenhum pagamento registrado para este aluno.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};