'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash, Banknote, KeyRound, Filter, Search, X,
  Plus, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle, Clock, Share2, Copy, Check,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

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
  status?: string | null;
  [key: string]: any;
}

interface Aluno {
  id: string;
  user: User;
  status?: string | null;
  pagamento?: PagamentoResumo | null;
  next_payment?: PagamentoResumo | null;
  next_payment_due_date?: string | null;
  next_payment_amount?: number | null;
  proximo_pagamento?: PagamentoResumo | null;
  plano?: { nome?: string | null; name?: string | null } | null;
  [key: string]: any;
}

interface PaymentMethod {
  id: string;
  method_type: 'pix' | 'bank_account';
  details: any;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const normalizeDateInput = (value?: string | null) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00`;
  return value;
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const normalized = normalizeDateInput(value);
  if (!normalized) return '—';
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatCurrency = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const derivePaymentInfo = (aluno: Aluno) => {
  const paymentCandidates: PagamentoResumo[] = [];
  if (aluno.pagamento) paymentCandidates.push(aluno.pagamento);
  if (aluno.next_payment) paymentCandidates.push(aluno.next_payment);
  if (aluno.proximo_pagamento) paymentCandidates.push(aluno.proximo_pagamento);

  const dueDate =
    aluno.pagamento?.vencimento ?? aluno.pagamento?.due_date ??
    aluno.next_payment_due_date ?? aluno.next_payment?.due_date ??
    aluno.proximo_pagamento?.due_date ?? aluno.proximo_vencimento ?? null;

  let amount: number | null = null;
  for (const c of paymentCandidates) {
    if (!c) continue;
    const v = c.amount ?? c.valor ?? c.total ?? c.price;
    if (v != null) { const n = Number(v); if (!Number.isNaN(n)) { amount = n; break; } }
  }

  const dueDateObj = normalizeDateInput(dueDate) ? new Date(normalizeDateInput(dueDate)!) : null;
  const today = new Date();
  const status = aluno.user?.status ?? aluno.status ?? null;

  let paymentState: 'em-dia' | 'atrasado' | 'sem-data' = 'sem-data';
  if (dueDateObj && !Number.isNaN(dueDateObj.getTime())) {
    const d = new Date(dueDateObj.getUTCFullYear(), dueDateObj.getUTCMonth(), dueDateObj.getUTCDate());
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    paymentState = d < t ? 'atrasado' : 'em-dia';
  }

  return { dueDate, amount, status, paymentState };
};

const getInitials = (name: string) =>
  name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'AL';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PaymentsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-surface-elevated border border-line rounded-2xl p-6 space-y-4">
        <div className="h-5 bg-surface-subtle rounded w-48"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-14 bg-surface-subtle rounded-lg"></div>
            ))}
          </div>
          <div className="h-32 bg-surface-subtle rounded-xl"></div>
        </div>
      </div>
      <div className="bg-surface-elevated border border-line rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-line h-16 bg-surface-page"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-line last:border-0">
            <div className="w-9 h-9 rounded-full bg-surface-subtle"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-subtle rounded w-36"></div>
              <div className="h-3 bg-surface-subtle rounded w-24"></div>
            </div>
            <div className="h-4 bg-surface-subtle rounded w-20 hidden md:block"></div>
            <div className="h-6 bg-surface-subtle rounded-full w-16 hidden md:block"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Badge helpers ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string | null }) {
  if (status === 'ativo' || status === 'pago')
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border">Ativo</span>;
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border">Inativo</span>;
}

function PaymentStateBadge({ state }: { state: string }) {
  if (state === 'em-dia')
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border"><CheckCircle2 size={12} /> Em dia</span>;
  if (state === 'atrasado')
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border"><AlertCircle size={12} /> Atrasado</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-subtle text-content-muted border border-line"><Clock size={12} /> Sem dados</span>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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
  const [copied, setCopied] = useState(false);

  const [pixForm, setPixForm] = useState({ key_type: 'cpf', key: '' });
  const [bankForm, setBankForm] = useState({ bank_name: '', agency: '', account_number: '', holder_name: '' });

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [methodsData, alunosResponse] = await Promise.all([
        fetchWithAuth('payment_methods'),
        fetchWithAuth('alunos?limit=1000'),
      ]);
      setPaymentMethods(methodsData);
      setAlunos(alunosResponse.alunos || alunosResponse || []);
    } catch (err: any) {
      setError('Erro ao carregar dados da página.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPageData(); }, [fetchPageData]);

  const handleAddPix = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('payment_methods', { method: 'POST', body: JSON.stringify({ payment_method: { method_type: 'pix', details: pixForm } }) });
      setPixForm({ key_type: 'cpf', key: '' });
      fetchPageData();
    } catch (err: any) { alert(err.message); }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('payment_methods', { method: 'POST', body: JSON.stringify({ payment_method: { method_type: 'bank_account', details: bankForm } }) });
      setBankForm({ bank_name: '', agency: '', account_number: '', holder_name: '' });
      fetchPageData();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteMethod = async (id: string) => {
    if (!window.confirm('Tem certeza?')) return;
    try { await fetchWithAuth(`payment_methods/${id}`, { method: 'DELETE' }); fetchPageData(); }
    catch (err: any) { alert(err.message); }
  };

  const filteredAlunos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alunos.filter(aluno => {
      const { dueDate, status } = derivePaymentInfo(aluno);
      const dueDateObj = normalizeDateInput(dueDate) ? new Date(normalizeDateInput(dueDate)!) : null;
      if (q && !aluno.user?.name?.toLowerCase().includes(q) && !aluno.user?.email?.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && (status ?? 'inativo') !== statusFilter) return false;
      if (dueDateFrom && (!dueDateObj || dueDateObj < new Date(dueDateFrom))) return false;
      if (dueDateTo) { const to = new Date(dueDateTo); to.setHours(23, 59, 59, 999); if (!dueDateObj || dueDateObj > to) return false; }
      return true;
    });
  }, [alunos, dueDateFrom, dueDateTo, search, statusFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredAlunos.length / limit)), [filteredAlunos.length, limit]);
  const paginatedAlunos = useMemo(() => filteredAlunos.slice((page - 1) * limit, page * limit), [filteredAlunos, page, limit]);
  useEffect(() => { if (page > totalPages) setPage(1); }, [page, totalPages]);

  const pixKeys = paymentMethods.filter(p => p.method_type === 'pix');
  const bankAccount = paymentMethods.find(p => p.method_type === 'bank_account');

  const inputClass = "w-full px-3 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all text-content-primary bg-surface-app placeholder:text-content-tertiary text-sm";

  if (loading && alunos.length === 0) return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-6 text-content-primary">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Financeiro</h1>
        <p className="text-sm text-content-tertiary mt-0.5">Gerencie recebimentos e mensalidades.</p>
      </div>
      <PaymentsSkeleton />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Financeiro</h1>
        <p className="text-sm text-content-tertiary mt-0.5">Gerencie recebimentos e mensalidades.</p>
      </div>

      {error && (
        <div className="bg-semantic-error-bg border border-semantic-error-border text-semantic-error-text p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Seção 1: Dados de Recebimento */}
      <section className="bg-surface-elevated border border-line rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-page">
          <h2 className="text-base font-bold text-content-primary">Dados de Recebimento</h2>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* PIX */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-content-primary flex items-center gap-2">
                <KeyRound size={16} className="text-semantic-success-text" /> Chaves PIX
              </h3>
              <span className="text-xs bg-surface-subtle px-2 py-1 rounded-full text-content-muted font-bold">{pixKeys.length}/2</span>
            </div>

            <div className="space-y-3 mb-4">
              {pixKeys.map(pix => (
                <div key={pix.id} className="border border-line p-3 rounded-lg flex justify-between items-center bg-surface-subtle group hover:border-semantic-error-border transition-colors">
                  <div>
                    <p className="font-mono font-bold text-content-primary">{pix.details.key}</p>
                    <p className="text-[10px] text-content-muted uppercase font-bold tracking-wider">{pix.details.key_type}</p>
                  </div>
                  <button onClick={() => handleDeleteMethod(pix.id)} className="text-content-muted hover:text-semantic-error-text p-2 rounded-lg transition-colors">
                    <Trash size={15} />
                  </button>
                </div>
              ))}
              {pixKeys.length === 0 && <p className="text-sm text-content-muted">Nenhuma chave cadastrada.</p>}
            </div>

            {pixKeys.length < 2 && (
              <form onSubmit={handleAddPix} className="bg-surface-subtle p-4 rounded-xl border border-line">
                <p className="text-xs font-bold text-content-muted uppercase mb-3">Nova Chave</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select value={pixForm.key_type} onChange={e => setPixForm({ ...pixForm, key_type: e.target.value })} className="border border-line-input p-2 rounded-lg text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none">
                    <option value="cpf">CPF/CNPJ</option>
                    <option value="email">Email</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Aleatória</option>
                  </select>
                  <input type="text" value={pixForm.key} onChange={e => setPixForm({ ...pixForm, key: e.target.value })} placeholder="Chave..." className={`flex-1 ${inputClass}`} required />
                  <button type="submit" className="bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border px-4 py-2 rounded-lg text-sm font-bold hover:opacity-80 transition-opacity">Add</button>
                </div>
              </form>
            )}
          </div>

          {/* Banco */}
          <div>
            <h3 className="font-bold text-content-primary flex items-center gap-2 mb-4">
              <Banknote size={16} className="text-semantic-info-text" /> Conta Bancária
            </h3>

            {bankAccount ? (
              <div className="border border-semantic-info-border bg-semantic-info-bg p-5 rounded-xl relative">
                <button onClick={() => handleDeleteMethod(bankAccount.id)} className="absolute top-4 right-4 text-content-muted hover:text-semantic-error-text transition-colors">
                  <Trash size={15} />
                </button>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] text-semantic-info-text font-bold uppercase mb-0.5">Banco</p>
                    <p className="font-bold text-content-primary">{bankAccount.details.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-semantic-info-text font-bold uppercase mb-0.5">Agência</p>
                    <p className="font-bold text-content-primary">{bankAccount.details.agency}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-semantic-info-text font-bold uppercase mb-0.5">Conta</p>
                    <p className="font-mono font-bold text-content-primary text-lg tracking-tight">{bankAccount.details.account_number}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-semantic-info-border">
                    <p className="text-[10px] text-semantic-info-text font-bold uppercase mb-0.5">Titular</p>
                    <p className="font-medium text-content-secondary">{bankAccount.details.holder_name}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddBank} className="bg-surface-subtle p-4 rounded-xl border border-line space-y-3">
                <p className="text-xs font-bold text-content-muted uppercase">Configurar Conta</p>
                <input type="text" value={bankForm.holder_name} onChange={e => setBankForm({ ...bankForm, holder_name: e.target.value })} placeholder="Nome do Titular" className={inputClass} required />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={bankForm.bank_name} onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })} placeholder="Banco" className={inputClass} required />
                  <input type="text" value={bankForm.agency} onChange={e => setBankForm({ ...bankForm, agency: e.target.value })} placeholder="Agência" className={inputClass} required />
                </div>
                <input type="text" value={bankForm.account_number} onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })} placeholder="Conta com dígito" className={inputClass} required />
                <button type="submit" className="w-full bg-semantic-info-bg border border-semantic-info-border text-semantic-info-text px-4 py-2 rounded-lg text-sm font-bold hover:opacity-80 transition-opacity flex items-center justify-center gap-2">
                  <Plus size={15} /> Salvar Conta
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Seção 2: Lista de Alunos */}
      <section className="bg-surface-elevated border border-line rounded-2xl shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-5 border-b border-line flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-page">
          <h2 className="font-bold text-lg text-content-primary">Status dos Alunos</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={15} />
              <input
                type="text" placeholder="Buscar aluno..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2.5 border border-line-input rounded-lg text-sm focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary placeholder:text-content-tertiary w-full"
              />
            </div>
            <button
              onClick={() => setShowFilters(p => !p)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold transition-colors ${showFilters ? 'bg-surface-subtle border-line text-content-primary' : 'bg-surface-elevated border-line text-content-secondary hover:bg-surface-subtle'}`}
            >
              <Filter size={15} /> Filtros
            </button>
          </div>
        </div>

        {/* Filtros expansíveis */}
        {showFilters && (
          <div className="p-4 bg-surface-page border-b border-line grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase mb-1">Status</label>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }} className={inputClass}>
                <option value="all">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase mb-1">Vencimento De</label>
              <input type="date" value={dueDateFrom} onChange={e => { setDueDateFrom(e.target.value); setPage(1); }} className={inputClass} />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-content-muted uppercase mb-1">Até</label>
                <input type="date" value={dueDateTo} onChange={e => { setDueDateTo(e.target.value); setPage(1); }} className={inputClass} />
              </div>
              <button onClick={() => { setSearch(''); setStatusFilter('all'); setDueDateFrom(''); setDueDateTo(''); setPage(1); }} className="p-2.5 text-content-muted hover:text-semantic-error-text bg-surface-elevated border border-line rounded-lg transition-colors">
                <X size={17} />
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        {paginatedAlunos.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Search size={40} className="text-content-muted mb-4" />
            <p className="font-bold text-content-secondary">Nenhum aluno encontrado.</p>
            <p className="text-sm text-content-muted">Tente ajustar os filtros.</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-line">
              {paginatedAlunos.map(aluno => {
                const { dueDate, amount, status, paymentState } = derivePaymentInfo(aluno);
                const planName = aluno.plano?.nome ?? aluno.plano?.name ?? null;
                return (
                  <div
                    key={aluno.id}
                    onClick={() => router.push(`/coach/payments/${aluno.id}`)}
                    className="p-4 active:bg-surface-subtle transition-colors relative overflow-hidden cursor-pointer"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${paymentState === 'atrasado' ? 'bg-semantic-error-text' : paymentState === 'em-dia' ? 'bg-semantic-success-text' : 'bg-line'}`} />
                    <div className="flex justify-between items-start mb-2 pl-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-content-primary text-surface-app flex items-center justify-center font-bold text-xs">
                          {getInitials(aluno.user.name)}
                        </div>
                        <div>
                          <p className="font-bold text-content-primary text-sm">{aluno.user.name}</p>
                          <p className="text-xs text-content-tertiary">{planName || 'Sem Plano'}</p>
                        </div>
                      </div>
                      <StatusBadge status={status} />
                    </div>
                    <div className="flex justify-between items-center pl-3 pt-2 border-t border-line mt-2">
                      <p className="text-xs text-content-muted">Venc: <span className="font-bold text-content-secondary">{formatDate(dueDate)}</span></p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-content-primary text-sm">{amount != null ? formatCurrency(amount) : '—'}</span>
                        <ChevronRight size={15} className="text-content-muted" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-page border-b border-line">
                    <th className="px-6 py-3 text-xs font-bold text-content-tertiary uppercase tracking-wide">Aluno</th>
                    <th className="px-6 py-3 text-xs font-bold text-content-tertiary uppercase tracking-wide">Plano</th>
                    <th className="px-6 py-3 text-xs font-bold text-content-tertiary uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3 text-xs font-bold text-content-tertiary uppercase tracking-wide">Próx. Vencimento</th>
                    <th className="px-6 py-3 text-xs font-bold text-content-tertiary uppercase tracking-wide text-right">Valor</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {paginatedAlunos.map(aluno => {
                    const { dueDate, amount, status, paymentState } = derivePaymentInfo(aluno);
                    const planName = aluno.plano?.nome ?? aluno.plano?.name ?? null;
                    return (
                      <tr key={aluno.id} onClick={() => router.push(`/coach/payments/${aluno.id}`)} className="hover:bg-surface-page transition-colors cursor-pointer group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-content-primary text-surface-app flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {getInitials(aluno.user.name)}
                            </div>
                            <span className="font-bold text-content-primary group-hover:text-brand transition-colors text-sm">{aluno.user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-content-tertiary">{planName || '—'}</td>
                        <td className="px-6 py-4"><StatusBadge status={status} /></td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-content-secondary font-mono">{formatDate(dueDate)}</span>
                          {paymentState === 'atrasado' && <span className="ml-2 w-2 h-2 rounded-full bg-semantic-error-text inline-block" />}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-content-primary">{amount != null ? formatCurrency(amount) : '—'}</td>
                        <td className="px-6 py-4 text-right text-content-muted group-hover:text-content-secondary">
                          <ChevronRight size={17} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Paginação */}
        <div className="p-4 border-t border-line flex items-center justify-between bg-surface-page">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-line rounded-lg hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-bold text-content-secondary">Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => p < totalPages ? p + 1 : p)} disabled={page >= totalPages} className="p-2 border border-line rounded-lg hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
