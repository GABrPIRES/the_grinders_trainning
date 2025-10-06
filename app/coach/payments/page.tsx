'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash, Banknote, KeyRound, Edit, PlusCircle, X } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

// --- Tipos para os dados da API ---
interface User { id: string; name: string; }
interface Aluno { id: string; user: User; }
interface Pagamento {
  id: string;
  aluno_id: string;
  aluno?: Aluno;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: 'pendente' | 'pago' | 'atrasado';
}
interface PaymentMethod { id: string; method_type: 'pix' | 'bank_account'; details: any; }

// --- Componente Principal da Página ---
export default function CoachPaymentsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter(); // Inicialize o router

  // Formulários para adicionar métodos de pagamento
  const [pixForm, setPixForm] = useState({ key_type: 'cpf', key: '' });
  const [bankForm, setBankForm] = useState({ bank_name: '', agency: '', account_number: '', holder_name: '' });


  const fetchPageData = async () => {
    setLoading(true);
    try {
      const [methodsData, alunosData] = await Promise.all([
        fetchWithAuth('payment_methods'),
        fetchWithAuth('alunos')
      ]);
      setPaymentMethods(methodsData);
      setAlunos(alunosData);
    } catch (err: any) {
      setError('Erro ao carregar dados da página.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPageData(); }, []);
  
  const handleAddPix = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('payment_methods', {
        method: 'POST',
        body: JSON.stringify({ payment_method: { method_type: 'pix', details: pixForm } }),
      });
      alert('Chave PIX adicionada!');
      setPixForm({ key_type: 'cpf', key: '' });
      fetchPageData(); // Recarrega todos os dados da página
    } catch (err: any) { alert(err.message); }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('payment_methods', {
        method: 'POST',
        body: JSON.stringify({ payment_method: { method_type: 'bank_account', details: bankForm } }),
      });
      alert('Conta bancária adicionada!');
      setBankForm({ bank_name: '', agency: '', account_number: '', holder_name: '' });
      fetchPageData();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteMethod = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta forma de pagamento?')) {
      try {
        await fetchWithAuth(`payment_methods/${id}`, { method: 'DELETE' });
        alert('Removido com sucesso!');
        fetchPageData();
      } catch (err: any) { alert(err.message); }
    }
  };


  const pixKeys = paymentMethods.filter(p => p.method_type === 'pix');
  const bankAccount = paymentMethods.find(p => p.method_type === 'bank_account');

  if (loading) return <p className="text-neutral-800 p-6">Carregando...</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 p-6">
      {/* Seção Minhas Informações de Recebimento */}
      <section className="bg-white p-6 shadow rounded-md text-neutral-800">
        <h1 className="text-2xl font-bold mb-4 border-b pb-4">Minhas Informações de Recebimento</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna PIX */}
          <div>
            <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2"><KeyRound size={20} /> Chaves PIX</h2>
            {pixKeys.length > 0 ? (
              <ul className="space-y-3">
                {pixKeys.map(pix => (
                  <li key={pix.id} className="border p-3 rounded-md flex justify-between items-center bg-gray-50">
                    <div>
                      <p className="font-medium">{pix.details.key}</p>
                      <p className="text-sm text-neutral-500">Tipo: {pix.details.key_type?.toUpperCase()}</p>
                    </div>
                    <button onClick={() => handleDeleteMethod(pix.id)} className="text-red-500 hover:text-red-700"><Trash size={18} /></button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-neutral-500">Nenhuma chave PIX cadastrada.</p>}
            
            {pixKeys.length < 2 && (
              <form onSubmit={handleAddPix} className="mt-6 p-4 border-t">
                <h3 className="font-medium mb-2">Adicionar Nova Chave PIX</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <select value={pixForm.key_type} onChange={e => setPixForm({...pixForm, key_type: e.target.value})} className="border p-2 rounded">
                    <option value="cpf">CPF/CNPJ</option><option value="email">E-mail</option><option value="phone">Telefone</option><option value="random">Aleatória</option>
                  </select>
                  <input type="text" value={pixForm.key} onChange={e => setPixForm({...pixForm, key: e.target.value})} placeholder="Sua chave PIX" className="flex-1 border p-2 rounded" required />
                  <button type="submit" className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800">Adicionar</button>
                </div>
              </form>
            )}
          </div>

          {/* Coluna Conta Bancária */}
          <div>
            <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2"><Banknote size={20} /> Conta Bancária</h2>
            {bankAccount ? (
              <div className="border p-4 rounded-md bg-gray-50 space-y-1">
                <div className="flex justify-between items-start">
                  <p><strong>Titular:</strong> {bankAccount.details.holder_name}</p>
                  <button onClick={() => handleDeleteMethod(bankAccount.id)} className="text-red-500 hover:text-red-700"><Trash size={18} /></button>
                </div>
                <p><strong>Banco:</strong> {bankAccount.details.bank_name}</p>
                <p><strong>Agência:</strong> {bankAccount.details.agency}</p>
                <p><strong>Conta:</strong> {bankAccount.details.account_number}</p>
              </div>
            ) : (
              <form onSubmit={handleAddBank} className="space-y-4 p-4 border-t">
                 <h3 className="font-medium mb-2">Adicionar Conta Bancária</h3>
                 <input type="text" value={bankForm.holder_name} onChange={e => setBankForm({...bankForm, holder_name: e.target.value})} placeholder="Nome do Titular" className="w-full border p-2 rounded" required />
                 <input type="text" value={bankForm.bank_name} onChange={e => setBankForm({...bankForm, bank_name: e.target.value})} placeholder="Nome do Banco" className="w-full border p-2 rounded" required />
                 <input type="text" value={bankForm.agency} onChange={e => setBankForm({...bankForm, agency: e.target.value})} placeholder="Agência" className="w-full border p-2 rounded" required />
                 <input type="text" value={bankForm.account_number} onChange={e => setBankForm({...bankForm, account_number: e.target.value})} placeholder="Número da Conta com dígito" className="w-full border p-2 rounded" required />
                 <button type="submit" className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800">Adicionar Conta</button>
              </form>
            )}
          </div>
        </div>
      </section>
      
      {/* Seção de Pagamentos dos Alunos */}
      <section className="bg-white p-6 shadow rounded-md">
        <h1 className="text-2xl font-bold text-neutral-800 mb-4 border-b pb-4">Pagamentos dos Alunos</h1>
        {error && <p className="text-red-600">{error}</p>}
        <div className="space-y-3">
          {alunos.length > 0 ? alunos.map(aluno => (
            <div 
              key={aluno.id} 
              onClick={() => router.push(`/coach/payments/${aluno.id}`)}
              className="border p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-bold text-lg">{aluno.user.name}</p>
                {/* Lógica para exibir próximo pagamento será adicionada aqui */}
                <p className="text-sm text-neutral-600">Próximo Vencimento: -</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">-</p>
                <p className="text-sm font-bold text-gray-500">Status: -</p>
              </div>
            </div>
          )) : <p className="text-neutral-500">Nenhum aluno cadastrado para gerenciar pagamentos.</p>}
        </div>
      </section>
    </div>
  );
}