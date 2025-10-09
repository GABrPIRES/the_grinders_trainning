'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash, Banknote, KeyRound, Filter, Search, X } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

// --- Tipos para os dados da API ---
interface Pagamento {
  id: string;
  aluno_id: string;
  amount: number;
  due_date: string;
  status: 'pendente' | 'pago' | 'atrasado';
}
interface User {
  id: string;
  name: string;
  status?: 'ativo' | 'desativado';
}
interface Aluno {
  id: string;
  user: User;
  status?: 'ativo' | 'desativado';
  next_payment: Pagamento | null;
}
interface PaymentMethod { id: string; method_type: 'pix' | 'bank_account'; details: any; }

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatCurrency = (value?: number | null) => {
  if (!value && value !== 0) return '-';
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const getStatusColor = (status?: string | null) => {
  if (status === 'ativo') return 'text-green-600';
  if (status === 'desativado') return 'text-red-600';
  return 'text-neutral-500';
};

const getPaymentStatusColor = (status?: string | null) => {
  if (status === 'pago') return 'text-green-600';
  if (status === 'pendente') return 'text-orange-500';
  if (status === 'atrasado') return 'text-red-600 animate-pulse';
  return 'text-neutral-500';
};

// --- Componente Principal da Página ---
export default function CoachPaymentsPage() {
  const router = useRouter();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Paginação ---
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // --- Busca e filtros ---
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'desativado'>('all');
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Formulários para adicionar métodos de pagamento
  const [pixForm, setPixForm] = useState({ key_type: 'cpf', key: '' });
  const [bankForm, setBankForm] = useState({ bank_name: '', agency: '', account_number: '', holder_name: '' });

  const fetchPageData = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (dueDateFrom) params.set('due_date_from', dueDateFrom);
      if (dueDateTo) params.set('due_date_to', dueDateTo);

      const [methodsData, alunosResponse] = await Promise.all([
        fetchWithAuth('payment_methods'),
        fetchWithAuth(`alunos?${params}`),
      ]);

      setPaymentMethods(methodsData);
      setAlunos(alunosResponse.alunos || alunosResponse);
      setTotal(alunosResponse.total ?? alunosResponse.alunos?.length ?? 0);
    } catch (err: any) {
      setError('Erro ao carregar dados da página.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, statusFilter, dueDateFrom, dueDateTo]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: 'all' | 'ativo' | 'desativado') => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') setDueDateFrom(value);
    if (type === 'to') setDueDateTo(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDueDateFrom('');
    setDueDateTo('');
    setPage(1);
  };

  const handleAddPix = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('payment_methods', {
        method: 'POST',
        body: JSON.stringify({ payment_method: { method_type: 'pix', details: pixForm } }),
      });
      alert('Chave PIX adicionada!');
      setPixForm({ key_type: 'cpf', key: '' });
      fetchPageData();
    } catch (err: any) {
      alert(err.message);
    }
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
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta forma de pagamento?')) {
      try {
        await fetchWithAuth(`payment_methods/${id}`, { method: 'DELETE' });
        alert('Removido com sucesso!');
        fetchPageData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const pixKeys = paymentMethods.filter(p => p.method_type === 'pix');
  const bankAccount = paymentMethods.find(p => p.method_type === 'bank_account');

  const isFirstPageLoading = loading && alunos.length === 0 && page === 1;

  return (
    <div className="max-w-6xl mx-auto space-y-12 p-6">
      {isFirstPageLoading ? (
        <p className="text-neutral-800">Carregando...</p>
      ) : (
        <>
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
                      <select value={pixForm.key_type} onChange={e => setPixForm({ ...pixForm, key_type: e.target.value })} className="border p-2 rounded">
                        <option value="cpf">CPF/CNPJ</option>
                        <option value="email">E-mail</option>
                        <option value="phone">Telefone</option>
                        <option value="random">Aleatória</option>
                      </select>
                      <input type="text" value={pixForm.key} onChange={e => setPixForm({ ...pixForm, key: e.target.value })} placeholder="Sua chave PIX" className="flex-1 border p-2 rounded" required />
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
                    <input type="text" value={bankForm.holder_name} onChange={e => setBankForm({ ...bankForm, holder_name: e.target.value })} placeholder="Nome do Titular" className="w-full border p-2 rounded" required />
                    <input type="text" value={bankForm.bank_name} onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })} placeholder="Nome do Banco" className="w-full border p-2 rounded" required />
                    <input type="text" value={bankForm.agency} onChange={e => setBankForm({ ...bankForm, agency: e.target.value })} placeholder="Agência" className="w-full border p-2 rounded" required />
                    <input type="text" value={bankForm.account_number} onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })} placeholder="Número da Conta com dígito" className="w-full border p-2 rounded" required />
                    <button type="submit" className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800">Adicionar Conta</button>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* Seção de Pagamentos dos Alunos */}
          <section className="bg-white p-6 shadow rounded-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b pb-4">
              <h1 className="text-2xl font-bold text-neutral-800">Pagamentos dos Alunos</h1>
              <button
                onClick={() => setShowFilters(prev => !prev)}
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
              >
                <Filter size={16} /> {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </button>
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <div className="space-y-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nome"
                    value={search}
                    onChange={e => handleSearchChange(e.target.value)}
                    className="w-full border border-neutral-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={e => handleStatusFilterChange(e.target.value as 'all' | 'ativo' | 'desativado')}
                    className="border border-neutral-300 rounded px-3 py-2"
                  >
                    <option value="all">Todos os status</option>
                    <option value="ativo">Ativos</option>
                    <option value="desativado">Desativados</option>
                  </select>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-neutral-50 p-4 rounded">
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">Vencimento a partir de</label>
                    <input
                      type="date"
                      value={dueDateFrom}
                      onChange={e => handleDateChange('from', e.target.value)}
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">Vencimento até</label>
                    <input
                      type="date"
                      value={dueDateTo}
                      onChange={e => handleDateChange('to', e.target.value)}
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-end justify-end">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
                    >
                      <X size={16} /> Limpar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>

            {loading && alunos.length > 0 ? (
              <p className="text-sm">Atualizando lista...</p>
            ) : (
              <div className="space-y-3">
                {alunos.length > 0 ? alunos.map(aluno => {
                  const nextPayment = aluno.next_payment;
                  const subscriptionStatus = aluno.status ?? aluno.user?.status ?? null;

                  return (
                    <div
                      key={aluno.id}
                      onClick={() => router.push(`/coach/payments/${aluno.id}`)}
                      className="border p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-lg">{aluno.user?.name}</p>
                        <p className="text-sm text-neutral-600">
                          Próximo Vencimento: {formatDate(nextPayment?.due_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(nextPayment?.amount ?? null)}</p>
                        <p className={`${getPaymentStatusColor(nextPayment?.status)} text-sm font-bold`}>
                          {nextPayment?.status ? nextPayment.status.charAt(0).toUpperCase() + nextPayment.status.slice(1) : 'Sem cobrança'}
                        </p>
                        <p className={`${getStatusColor(subscriptionStatus)} text-xs font-semibold mt-1`}>
                          {subscriptionStatus ? `Status: ${subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}` : 'Status: -'}
                        </p>
                      </div>
                    </div>
                  );
                }) : <p className="text-neutral-500">Nenhum aluno cadastrado.</p>}
              </div>
            )}

            {/* Controles de Paginação */}
            <div className="flex justify-between items-center mt-6 text-sm text-neutral-500">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
                Anterior
              </button>
              <span>Página {page} de {totalPages}</span>
              <button onClick={() => setPage(p => (p < totalPages ? p + 1 : p))} disabled={page >= totalPages || loading} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
                Próxima
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}