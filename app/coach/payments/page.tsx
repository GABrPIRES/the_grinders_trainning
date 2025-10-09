'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash, Banknote, KeyRound, Filter, Search, X } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

// --- Tipos ---
interface PagamentoResumo {
  id?: string;
  aluno_id?: string;
  amount?: number;
  valor?: number;
  due_date?: string | null;
  vencimento?: string | null;
  status?: string | null;
  [key: string]: any;
}

interface User {
  id: string;
  name: string;
  email?: string;
  status?: 'ativo' | 'inativo' | string | null;
  [key: string]: any;
}

interface Plano {
  nome?: string | null;
  [key: string]: any;
}

interface Aluno {
  id: string;
  user: User;
  status?: 'ativo' | 'inativo' | string | null;
  pagamento?: PagamentoResumo | null;
  next_payment?: PagamentoResumo | null;
  next_payment_due_date?: string | null;
  next_payment_amount?: number | null;
  next_payment_status?: string | null;
  proximo_pagamento?: PagamentoResumo | null;
  plano?: Plano | null;
  [key: string]: any;
}

interface PaymentMethod {
  id: string;
  method_type: 'pix' | 'bank_account';
  details: any;
}

// --- Funções utilitárias ---
const normalizeDateInput = (value?: string | null) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00`;
  }
  return value;
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const normalized = normalizeDateInput(value);
  if (!normalized) return '-';
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatCurrency = (value?: number | null) => {
  if ((value == null) || Number.isNaN(value)) return '-';
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const getStatusColor = (status?: string | null) => {
  if (status === 'ativo') return 'text-green-600';
  if (status === 'inativo') return 'text-red-600';
  return 'text-neutral-500';
};

const getPaymentStatusColor = (status?: string | null) => {
  if (status === 'pago') return 'text-green-600';
  if (status === 'pendente') return 'text-orange-500';
  if (status === 'atrasado') return 'text-red-600 animate-pulse';
  return 'text-neutral-500';
};

const derivePaymentInfo = (aluno: Aluno) => {
  const paymentCandidates: PagamentoResumo[] = [];
  if (aluno.pagamento) paymentCandidates.push(aluno.pagamento);
  if (aluno.next_payment) paymentCandidates.push(aluno.next_payment);
  if (aluno.proximo_pagamento) paymentCandidates.push(aluno.proximo_pagamento);

  const dueDate =
    aluno.pagamento?.vencimento ??
    aluno.pagamento?.due_date ??
    aluno.next_payment_due_date ??
    aluno.next_payment?.due_date ??
    aluno.proximo_pagamento?.due_date ??
    aluno.proximo_vencimento ??
    null;

  let amount: number | null = null;
  for (const candidate of paymentCandidates) {
    if (!candidate) continue;
    const value = candidate.amount ?? candidate.valor ?? candidate.total ?? candidate.price;
    if (value != null) {
      const numericValue = Number(value);
      if (!Number.isNaN(numericValue)) {
        amount = numericValue;
        break;
      }
    }
  }

  const normalizedDueDate = normalizeDateInput(dueDate);
  const dueDateObj = normalizedDueDate ? new Date(normalizedDueDate) : null;
  const today = new Date();
  const status = aluno.user?.status ?? aluno.status ?? null;

  let paymentState: 'em-dia' | 'atrasado' | 'sem-data' = 'sem-data';
  if (dueDateObj && !Number.isNaN(dueDateObj.getTime())) {
    const dueDateOnly = new Date(dueDateObj.getUTCFullYear(), dueDateObj.getUTCMonth(), dueDateObj.getUTCDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    paymentState = dueDateOnly < todayOnly ? 'atrasado' : 'em-dia';
  }

  return { dueDate, amount, status, paymentState };
};

// --- Componente Principal ---
export default function CoachPaymentsPage() {
  const router = useRouter();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all');
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [pixForm, setPixForm] = useState({ key_type: 'cpf', key: '' });
  const [bankForm, setBankForm] = useState({ bank_name: '', agency: '', account_number: '', holder_name: '' });

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [methodsData, alunosResponse] = await Promise.all([
        fetchWithAuth('payment_methods'),
        fetchWithAuth('alunos'),
      ]);
      setPaymentMethods(methodsData);
      setAlunos(alunosResponse.alunos || alunosResponse || []);
    } catch (err: any) {
      setError('Erro ao carregar dados da página.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: 'all' | 'ativo' | 'inativo') => {
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

  const filteredAlunos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return alunos.filter(aluno => {
      const { dueDate, status } = derivePaymentInfo(aluno);
      const formattedDueDate = normalizeDateInput(dueDate);
      const dueDateObj = formattedDueDate ? new Date(formattedDueDate) : null;

      if (normalizedSearch) {
        const name = aluno.user?.name?.toLowerCase() ?? '';
        const email = aluno.user?.email?.toLowerCase() ?? '';
        if (!name.includes(normalizedSearch) && !email.includes(normalizedSearch)) return false;
      }

      if (statusFilter !== 'all' && (status ?? 'inativo') !== statusFilter) return false;

      if (dueDateFrom) {
        const from = new Date(dueDateFrom);
        if (!dueDateObj || dueDateObj < from) return false;
      }

      if (dueDateTo) {
        const to = new Date(dueDateTo);
        to.setHours(23, 59, 59, 999);
        if (!dueDateObj || dueDateObj > to) return false;
      }

      return true;
    });
  }, [alunos, dueDateFrom, dueDateTo, search, statusFilter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredAlunos.length / limit)),
    [filteredAlunos.length, limit],
  );

  const paginatedAlunos = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredAlunos.slice(start, end);
  }, [filteredAlunos, limit, page]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const pixKeys = paymentMethods.filter(p => p.method_type === 'pix');
  const bankAccount = paymentMethods.find(p => p.method_type === 'bank_account');
  const isFirstPageLoading = loading && alunos.length === 0 && page === 1;

  return (
    <div className="max-w-6xl mx-auto space-y-12 p-6">
      {isFirstPageLoading ? (
        <p className="text-neutral-800">Carregando...</p>
      ) : (
        <>
          {/* --- Minhas Informações de Recebimento --- */}
          <section className="bg-white p-6 shadow rounded-md text-neutral-800">
            <h1 className="text-2xl font-bold mb-4 border-b pb-4">Minhas Informações de Recebimento</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* PIX */}
              <div>
                <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                  <KeyRound size={20} /> Chaves PIX
                </h2>
                {pixKeys.length > 0 ? (
                  <ul className="space-y-3">
                    {pixKeys.map(pix => (
                      <li
                        key={pix.id}
                        className="border p-3 rounded-md flex justify-between items-center bg-gray-50"
                      >
                        <div>
                          <p className="font-medium">{pix.details.key}</p>
                          <p className="text-sm text-neutral-500">
                            Tipo: {pix.details.key_type?.toUpperCase()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteMethod(pix.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500">Nenhuma chave PIX cadastrada.</p>
                )}

                {pixKeys.length < 2 && (
                  <form onSubmit={handleAddPix} className="mt-6 p-4 border-t">
                    <h3 className="font-medium mb-2">Adicionar Nova Chave PIX</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <select
                        value={pixForm.key_type}
                        onChange={e => setPixForm({ ...pixForm, key_type: e.target.value })}
                        className="border p-2 rounded"
                      >
                        <option value="cpf">CPF/CNPJ</option>
                        <option value="email">E-mail</option>
                        <option value="phone">Telefone</option>
                        <option value="random">Aleatória</option>
                      </select>
                      <input
                        type="text"
                        value={pixForm.key}
                        onChange={e => setPixForm({ ...pixForm, key: e.target.value })}
                        placeholder="Sua chave PIX"
                        className="flex-1 border p-2 rounded"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
                      >
                        Adicionar
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Conta bancária */}
              <div>
                <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                  <Banknote size={20} /> Conta Bancária
                </h2>
                {bankAccount ? (
                  <div className="border p-4 rounded-md bg-gray-50 space-y-1">
                    <div className="flex justify-between items-start">
                      <p>
                        <strong>Titular:</strong> {bankAccount.details.holder_name}
                      </p>
                      <button
                        onClick={() => handleDeleteMethod(bankAccount.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                    <p>
                      <strong>Banco:</strong> {bankAccount.details.bank_name}
                    </p>
                    <p>
                      <strong>Agência:</strong> {bankAccount.details.agency}
                    </p>
                    <p>
                      <strong>Conta:</strong> {bankAccount.details.account_number}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAddBank} className="space-y-4 p-4 border-t">
                    <h3 className="font-medium mb-2">Adicionar Conta Bancária</h3>
                    <input
                      type="text"
                      value={bankForm.holder_name}
                      onChange={e => setBankForm({ ...bankForm, holder_name: e.target.value })}
                      placeholder="Nome do Titular"
                      className="w-full border p-2 rounded"
                      required
                    />
                    <input
                      type="text"
                      value={bankForm.bank_name}
                      onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })}
                      placeholder="Nome do Banco"
                      className="w-full border p-2 rounded"
                      required
                    />
                    <input
                      type="text"
                      value={bankForm.agency}
                      onChange={e => setBankForm({ ...bankForm, agency: e.target.value })}
                      placeholder="Agência"
                      className="w-full border p-2 rounded"
                      required
                    />
                    <input
                      type="text"
                      value={bankForm.account_number}
                      onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })}
                      placeholder="Número da Conta com dígito"
                      className="w-full border p-2 rounded"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
                    >
                      Adicionar Conta
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* --- Pagamentos dos Alunos --- */}
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
                    onChange={e => handleStatusFilterChange(e.target.value as 'all' | 'ativo' | 'inativo')}
                    className="border border-neutral-300 rounded px-3 py-2"
                  >
                    <option value="all">Todos os status</option>
                    <option value="ativo">Ativos</option>
                    <option value="inativo">Inativos</option>
                  </select>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-neutral-50 p-4 rounded">
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">
                      Vencimento a partir de
                    </label>
                    <input
                      type="date"
                      value={dueDateFrom}
                      onChange={e => handleDateChange('from', e.target.value)}
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">
                      Vencimento até
                    </label>
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
                {paginatedAlunos.length > 0 ? (
                  paginatedAlunos.map(aluno => {
                    const { dueDate, amount, status, paymentState } = derivePaymentInfo(aluno);
                    const planName = aluno.plano?.nome ?? aluno.plano?.name ?? null;
                    const formattedAmount = amount != null ? formatCurrency(amount) : '-';
                    const subscriptionStatus = status ?? 'inativo';
                    const formattedStatus =
                      subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1);
                    const paymentStateLabel =
                      paymentState === 'atrasado'
                        ? 'Pagamento atrasado'
                        : paymentState === 'em-dia'
                        ? 'Pagamento em dia'
                        : 'Sem data de pagamento';

                    return (
                      <div
                        key={aluno.id}
                        onClick={() => router.push(`/coach/payments/${aluno.id}`)}
                        className="border p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-lg">{aluno.user?.name}</p>
                          <p className="text-sm text-neutral-600">
                            Próximo Vencimento: {formatDate(dueDate)}
                          </p>
                          {planName && (
                            <p className="text-xs text-neutral-500">Plano: {planName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formattedAmount}</p>
                          <p
                            className={`${getPaymentStatusColor(
                              paymentState === 'atrasado'
                                ? 'atrasado'
                                : paymentState === 'em-dia'
                                ? 'pago'
                                : undefined
                            )} text-sm font-bold`}
                          >
                            {paymentStateLabel}
                          </p>
                          <p
                            className={`${getStatusColor(
                              subscriptionStatus
                            )} text-xs font-semibold mt-1`}
                          >
                            Status: {formattedStatus}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-neutral-500">Nenhum aluno cadastrado.</p>
                )}
              </div>
            )}

            {/* Paginação */}
            <div className="flex justify-between items-center mt-6 text-sm text-neutral-500">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Anterior
              </button>
              <span>
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => (p < totalPages ? p + 1 : p))}
                disabled={page >= totalPages || loading}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

