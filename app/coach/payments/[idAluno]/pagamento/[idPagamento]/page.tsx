'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { ArrowLeft, Trash, Save } from 'lucide-react';

interface Pagamento {
  id: string;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: 'pendente' | 'pago' | 'atrasado';
  aluno: { user: { name: string } };
}

export default function EditPaymentPage() {
  const router = useRouter();
  const { idAluno, idPagamento } = useParams();
  
  const [payment, setPayment] = useState<Pagamento | null>(null);
  const [formData, setFormData] = useState({ amount: '', due_date: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createNext, setCreateNext] = useState(true); // Estado para o checkbox de recorrência

  const fetchPayment = async () => {
    if (!idPagamento) return;
    setLoading(true);
    try {
      const data = await fetchWithAuth(`pagamentos/${idPagamento}`);
      setPayment(data);
      setFormData({
        amount: data.amount.toString(),
        due_date: new Date(data.due_date).toISOString().split('T')[0],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [idPagamento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth(`pagamentos/${idPagamento}`, {
        method: 'PATCH',
        body: JSON.stringify({
          pagamento: {
            amount: parseFloat(formData.amount),
            due_date: formData.due_date,
          },
        }),
      });
      alert('Pagamento atualizado com sucesso!');
      router.push(`/coach/payments/${idAluno}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      // CORREÇÃO: Não enviamos mais o 'paid_at', a API cuida disso.
      await fetchWithAuth(`pagamentos/${idPagamento}?create_next=${createNext}`, {
        method: 'PATCH',
        body: JSON.stringify({ pagamento: { status: 'pago' } }),
      });
      alert('Pagamento conciliado com sucesso! ' + (createNext ? 'A próxima cobrança foi gerada.' : ''));
      router.push(`/coach/payments/${idAluno}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUnmarkAsPaid = async () => {
    if (window.confirm('Tem certeza que deseja desconciliar este pagamento? Ele voltará ao status "pendente".')) {
      try {
        await fetchWithAuth(`pagamentos/${idPagamento}`, {
          method: 'PATCH',
          body: JSON.stringify({ pagamento: { status: 'pendente', paid_at: null } }),
        });
        alert('Pagamento revertido para "pendente".');
        fetchPayment(); // Recarrega os dados da página atual para mostrar o formulário novamente
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDelete = async () => {
    if (payment?.status === 'pago') {
      alert('Você precisa desconciliar o pagamento antes de poder excluí-lo.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este pagamento? A ação não pode ser desfeita.')) {
      try {
        await fetchWithAuth(`pagamentos/${idPagamento}`, { method: 'DELETE' });
        alert('Pagamento excluído com sucesso!');
        router.push(`/coach/payments/${idAluno}`);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  if (loading) return <p className="p-6">Carregando...</p>;
  if (error || !payment) return <p className="text-red-600 p-6">{error || "Pagamento não encontrado."}</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md">
      <div className="border-b pb-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} />
          Voltar para o histórico
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Detalhes do Pagamento</h1>
        <p className="text-neutral-600">Aluno: {payment.aluno.user.name}</p>
      </div>

      {payment.status === 'pago' ? (
        <div className="space-y-4">
          <p><strong>Status:</strong> <span className="text-green-600 font-bold">Pago</span></p>
          <p><strong>Valor:</strong> R$ {payment.amount.toFixed(2).replace('.', ',')}</p>
          <p><strong>Vencimento:</strong> {new Date(payment.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
          <p><strong>Pago em:</strong> {new Date(payment.paid_at!).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
          <button onClick={handleUnmarkAsPaid} className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 mt-4">
            Desconciliar Pagamento
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-neutral-700">Valor (R$)</label>
            <input id="amount" type="number" name="amount" step="0.01" value={formData.amount} onChange={handleChange} className="mt-1 w-full border p-2 rounded text-neutral-600" required />
          </div>
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-neutral-700">Data de Vencimento</label>
            <input id="due_date" type="date" name="due_date" value={formData.due_date} onChange={handleChange} className="mt-1 w-full border p-2 rounded text-neutral-600" required />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
            <Save size={16} /> Salvar Alterações
          </button>

          <hr className="my-4"/>

          <div className="bg-gray-50 p-4 rounded-md space-y-3">
            <h3 className="text-lg font-semibold text-center text-neutral-700">Ações de Conciliação</h3>
            <div className="flex items-center">
              <input 
                id="createNext"
                type="checkbox"
                checked={createNext}
                onChange={(e) => setCreateNext(e.target.checked)}
                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="createNext" className="ml-2 block text-sm text-neutral-700">
                Criar a cobrança do próximo mês automaticamente?
              </label>
            </div>
            <button type="button" onClick={handleMarkAsPaid} className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
              Conciliar (Marcar como Pago)
            </button>
          </div>

          <button type="button" onClick={handleDelete} className="w-full text-red-600 hover:text-red-800 flex items-center justify-center gap-2 py-2 mt-4">
            <Trash size={16} /> Excluir Este Pagamento
          </button>
        </form>
      )}
    </div>
  );
}