'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trash, Banknote, KeyRound, Filter, Search, X, 
  Wallet, Plus, ChevronLeft, ChevronRight, 
  CheckCircle2, AlertCircle, Clock, MoreHorizontal, User 
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

// --- Tipos (Mantidos) ---
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

// --- Helpers Visuais (Premium) ---
const getInitials = (name: string) => name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "AL";

const getStatusBadge = (status?: string | null) => {
  if (status === 'ativo') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Ativo</span>;
  if (status === 'inativo') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Inativo</span>;
  return <span className="text-neutral-400 text-xs">-</span>;
};

const getPaymentStatusBadge = (paymentState: string) => {
  if (paymentState === 'em-dia') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><CheckCircle2 size={12}/> Em dia</span>;
  if (paymentState === 'atrasado') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><AlertCircle size={12}/> Atrasado</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">Sem dados</span>;
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
        // AJUSTE CRÍTICO: Pede 1000 alunos para garantir que o filtro no frontend funcione em todos
        fetchWithAuth('alunos?limit=1000'), 
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

  // Handlers (Mantidos)
  const handleSearchChange = (value: string) => { setSearch(value); setPage(1); };
  const handleStatusFilterChange = (value: 'all' | 'ativo' | 'inativo') => { setStatusFilter(value); setPage(1); };
  const handleDateChange = (type: 'from' | 'to', value: string) => { 
    if (type === 'from') setDueDateFrom(value); 
    if (type === 'to') setDueDateTo(value); 
    setPage(1); 
  };
  const handleResetFilters = () => { setSearch(''); setStatusFilter('all'); setDueDateFrom(''); setDueDateTo(''); setPage(1); };

  const handleAddPix = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('payment_methods', { method: 'POST', body: JSON.stringify({ payment_method: { method_type: 'pix', details: pixForm } }) });
      alert('Chave PIX adicionada!');
      setPixForm({ key_type: 'cpf', key: '' });
      fetchPageData();
    } catch (err: any) { alert(err.message); }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('payment_methods', { method: 'POST', body: JSON.stringify({ payment_method: { method_type: 'bank_account', details: bankForm } }) });
      alert('Conta bancária adicionada!');
      setBankForm({ bank_name: '', agency: '', account_number: '', holder_name: '' });
      fetchPageData();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteMethod = async (id: string) => {
    if (window.confirm('Tem certeza?')) {
      try {
        await fetchWithAuth(`payment_methods/${id}`, { method: 'DELETE' });
        fetchPageData();
      } catch (err: any) { alert(err.message); }
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

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredAlunos.length / limit)), [filteredAlunos.length, limit]);
  const paginatedAlunos = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredAlunos.slice(start, end);
  }, [filteredAlunos, limit, page]);

  useEffect(() => { if (page > totalPages) setPage(1); }, [page, totalPages]);

  const pixKeys = paymentMethods.filter(p => p.method_type === 'pix');
  const bankAccount = paymentMethods.find(p => p.method_type === 'bank_account');
  const isFirstPageLoading = loading && alunos.length === 0 && page === 1;

  // --- VISUAL PREMIUM ---
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-0 text-neutral-800">
      
      {/* HEADER */}
      <div className="flex items-center gap-3">
         <div>
            <h1 className="text-2xl font-bold text-neutral-900">Financeiro</h1>
            <p className="text-neutral-500 text-sm">Gerencie recebimentos e mensalidades.</p>
         </div>
      </div>

      {isFirstPageLoading ? (
        <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando financeiro...</div>
      ) : (
        <>
          {/* SEÇÃO 1: CONFIGURAÇÃO DE RECEBIMENTO */}
          <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2 border-b border-neutral-100 pb-2">
               Dados de Recebimento
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* PIX */}
              <div>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-neutral-800 flex items-center gap-2"><KeyRound size={18} className="text-green-600"/> Chaves PIX</h3>
                   <span className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-500 font-medium">{pixKeys.length}/2</span>
                </div>

                <div className="space-y-3 mb-4">
                    {pixKeys.map(pix => (
                      <div key={pix.id} className="border border-neutral-200 p-3 rounded-lg flex justify-between items-center bg-neutral-50 group hover:border-red-200 transition-colors">
                        <div>
                          <p className="font-mono font-medium text-neutral-900">{pix.details.key}</p>
                          <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">{pix.details.key_type}</p>
                        </div>
                        <button onClick={() => handleDeleteMethod(pix.id)} className="text-neutral-300 hover:text-red-600 p-2 rounded-full transition-colors">
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                    
                    {pixKeys.length === 0 && <p className="text-sm text-neutral-400 italic">Nenhuma chave cadastrada.</p>}
                </div>

                {pixKeys.length < 2 && (
                  <form onSubmit={handleAddPix} className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/60">
                    <p className="text-xs font-bold text-neutral-500 uppercase mb-3">Nova Chave</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select value={pixForm.key_type} onChange={e => setPixForm({ ...pixForm, key_type: e.target.value })} className="border border-neutral-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-600 outline-none">
                        <option value="cpf">CPF/CNPJ</option>
                        <option value="email">Email</option>
                        <option value="phone">Telefone</option>
                        <option value="random">Aleatória</option>
                      </select>
                      <input type="text" value={pixForm.key} onChange={e => setPixForm({ ...pixForm, key: e.target.value })} placeholder="Chave..." className="flex-1 border border-neutral-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-600 outline-none" required />
                      <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-800 transition-colors">Add</button>
                    </div>
                  </form>
                )}
              </div>

              {/* BANCO */}
              <div>
                <h3 className="font-bold text-neutral-800 flex items-center gap-2 mb-4"><Banknote size={18} className="text-blue-600"/> Conta Bancária</h3>
                
                {bankAccount ? (
                  <div className="border border-blue-100 bg-blue-50/30 p-5 rounded-xl relative group">
                    <button onClick={() => handleDeleteMethod(bankAccount.id)} className="absolute top-4 right-4 text-neutral-300 hover:text-red-600 transition-colors">
                        <Trash size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                       <div>
                          <p className="text-[10px] text-blue-400 font-bold uppercase mb-0.5">Banco</p>
                          <p className="font-semibold text-neutral-800">{bankAccount.details.bank_name}</p>
                       </div>
                       <div>
                          <p className="text-[10px] text-blue-400 font-bold uppercase mb-0.5">Agência</p>
                          <p className="font-semibold text-neutral-800">{bankAccount.details.agency}</p>
                       </div>
                       <div className="col-span-2">
                          <p className="text-[10px] text-blue-400 font-bold uppercase mb-0.5">Conta</p>
                          <p className="font-mono font-semibold text-neutral-800 text-lg tracking-tight">{bankAccount.details.account_number}</p>
                       </div>
                       <div className="col-span-2 pt-2 border-t border-blue-100/50">
                          <p className="text-[10px] text-blue-400 font-bold uppercase mb-0.5">Titular</p>
                          <p className="font-medium text-neutral-700">{bankAccount.details.holder_name}</p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAddBank} className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/60 space-y-3">
                    <p className="text-xs font-bold text-neutral-500 uppercase">Configurar Conta</p>
                    <input type="text" value={bankForm.holder_name} onChange={e => setBankForm({ ...bankForm, holder_name: e.target.value })} placeholder="Nome do Titular" className="w-full border border-neutral-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" required />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={bankForm.bank_name} onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })} placeholder="Banco" className="w-full border border-neutral-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" required />
                        <input type="text" value={bankForm.agency} onChange={e => setBankForm({ ...bankForm, agency: e.target.value })} placeholder="Agência" className="w-full border border-neutral-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" required />
                    </div>
                    <input type="text" value={bankForm.account_number} onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })} placeholder="Conta com dígito" className="w-full border border-neutral-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" required />
                    <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                       <Plus size={16}/> Salvar Conta
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* SEÇÃO 2: LISTA DE ALUNOS */}
          <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-5 border-b border-neutral-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-neutral-50/30">
               <h2 className="font-bold text-lg text-neutral-800">Status dos Alunos</h2>
               
               <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                     <input 
                        type="text" placeholder="Buscar aluno..." 
                        value={search} onChange={e => handleSearchChange(e.target.value)} 
                        className="pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900 outline-none w-full"
                     />
                  </div>
                  <button onClick={() => setShowFilters(prev => !prev)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-neutral-100 border-neutral-300 text-neutral-900' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
                     <Filter size={16} /> Filtros
                  </button>
               </div>
            </div>

            {/* Filtros Expansíveis */}
            {showFilters && (
                <div className="p-4 bg-neutral-50 border-b border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Status</label>
                    <select value={statusFilter} onChange={e => handleStatusFilterChange(e.target.value as any)} className="w-full border p-2 rounded-lg text-sm">
                        <option value="all">Todos</option>
                        <option value="ativo">Ativos</option>
                        <option value="inativo">Inativos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Vencimento De</label>
                    <input type="date" value={dueDateFrom} onChange={e => handleDateChange('from', e.target.value)} className="w-full border p-2 rounded-lg text-sm" />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Até</label>
                        <input type="date" value={dueDateTo} onChange={e => handleDateChange('to', e.target.value)} className="w-full border p-2 rounded-lg text-sm" />
                    </div>
                    <button onClick={handleResetFilters} className="p-2.5 text-neutral-400 hover:text-red-600 bg-white border border-neutral-200 rounded-lg transition-colors" title="Limpar"><X size={18}/></button>
                  </div>
                </div>
            )}

            {/* Lista (Mobile Cards / Desktop Table) */}
            {loading && alunos.length > 0 ? (
              <p className="p-8 text-center text-neutral-500">Atualizando...</p>
            ) : (
              <>
                {paginatedAlunos.length > 0 ? (
                  <>
                    {/* MOBILE CARDS */}
                    <div className="md:hidden divide-y divide-neutral-100">
                      {paginatedAlunos.map(aluno => {
                          const { dueDate, amount, status, paymentState } = derivePaymentInfo(aluno);
                          const planName = aluno.plano?.nome ?? aluno.plano?.name ?? null;
                          const formattedAmount = amount != null ? formatCurrency(amount) : '-';
                          const paymentStateLabel = paymentState === 'atrasado' ? 'Pagamento atrasado' : paymentState === 'em-dia' ? 'Em dia' : 'Sem dados';

                          return (
                              <div 
                                  key={aluno.id} 
                                  onClick={() => router.push(`/coach/payments/${aluno.id}`)}
                                  className="p-4 active:bg-neutral-50 transition-colors relative overflow-hidden"
                              >
                                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${paymentState === 'atrasado' ? 'bg-red-500' : 'bg-transparent'}`}></div>
                                  <div className="flex justify-between items-start mb-2 pl-2">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold text-xs">
                                              {getInitials(aluno.user.name)}
                                          </div>
                                          <div>
                                              <p className="font-bold text-neutral-900 text-sm">{aluno.user.name}</p>
                                              <p className="text-xs text-neutral-500">{planName || "Sem Plano"}</p>
                                          </div>
                                      </div>
                                      {getStatusBadge(status)}
                                  </div>
                                  <div className="flex justify-between items-center pl-2 pt-2 border-t border-neutral-50 mt-2">
                                      <div className="text-xs text-neutral-500">
                                          Venc: <span className="font-medium text-neutral-800">{formatDate(dueDate)}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <span className="font-bold text-neutral-900">{formattedAmount}</span>
                                          <ChevronRight size={16} className="text-neutral-300"/>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                    </div>

                    {/* DESKTOP TABLE */}
                    <table className="w-full text-left hidden md:table">
                        <thead className="bg-neutral-50 text-xs text-neutral-500 font-bold uppercase border-b border-neutral-100">
                            <tr>
                                <th className="px-6 py-4">Aluno</th>
                                <th className="px-6 py-4">Plano</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Próx. Vencimento</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {paginatedAlunos.map(aluno => {
                                const { dueDate, amount, status, paymentState } = derivePaymentInfo(aluno);
                                const planName = aluno.plano?.nome ?? aluno.plano?.name ?? null;
                                const formattedAmount = amount != null ? formatCurrency(amount) : '-';
                                const paymentStateLabel = paymentState === 'atrasado' ? 'Pagamento atrasado' : paymentState === 'em-dia' ? 'Em dia' : 'Sem dados';

                                return (
                                    <tr 
                                        key={aluno.id} 
                                        onClick={() => router.push(`/coach/payments/${aluno.id}`)}
                                        className="hover:bg-neutral-50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold text-xs border border-neutral-200 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    {getInitials(aluno.user.name)}
                                                </div>
                                                <span className="font-bold text-neutral-900 text-sm">{aluno.user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">{planName || "-"}</td>
                                        <td className="px-6 py-4">{getStatusBadge(status)}</td>
                                        <td className="px-6 py-4 text-sm font-mono text-neutral-600">
                                            {formatDate(dueDate)}
                                            {paymentState === 'atrasado' && <span className="ml-2 w-2 h-2 rounded-full bg-red-500 inline-block" title="Atrasado"></span>}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-neutral-900">{formattedAmount}</td>
                                        <td className="px-6 py-4 text-right text-neutral-300 group-hover:text-neutral-500">
                                            <ChevronRight size={18} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                  </>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center">
                     <Search size={48} className="text-neutral-200 mb-4"/>
                     <p className="text-neutral-500 font-medium">Nenhum aluno encontrado.</p>
                     <p className="text-neutral-400 text-sm">Tente ajustar os filtros de busca.</p>
                  </div>
                )}
              </>
            )}

            {/* Paginação */}
            <div className="p-4 border-t border-neutral-200 flex items-center justify-between bg-neutral-50">
               <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} className="p-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors shadow-sm"><ChevronLeft size={16}/></button>
               <span className="text-sm font-medium text-neutral-600">Página {page} de {totalPages}</span>
               <button onClick={() => setPage(p => (p < totalPages ? p + 1 : p))} disabled={page >= totalPages || loading} className="p-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors shadow-sm"><ChevronRight size={16}/></button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}