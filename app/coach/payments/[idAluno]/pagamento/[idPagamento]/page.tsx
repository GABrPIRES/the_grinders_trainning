"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { ArrowLeft, Trash2, Save, CheckCircle2, Loader2 } from 'lucide-react';

interface Pagamento {
  id: string;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: 'pendente' | 'pago' | 'atrasado';
  aluno: { user: { name: string } };
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-lg mx-auto">
      <div className="h-8 bg-surface-subtle rounded w-48"></div>
      <div className="bg-surface-elevated border border-line rounded-xl p-6 space-y-4">
        <div className="h-5 bg-surface-subtle rounded w-32"></div>
        <div className="h-10 bg-surface-subtle rounded"></div>
        <div className="h-10 bg-surface-subtle rounded"></div>
        <div className="h-10 bg-surface-subtle rounded"></div>
      </div>
    </div>
  );
}

export default function EditPaymentPage() {
  const router = useRouter();
  const { idAluno, idPagamento } = useParams();
  const { showToast, ToastEl } = useToast();
  const { showConfirm, ConfirmEl } = useConfirm();

  const [payment, setPayment] = useState<Pagamento | null>(null);
  const [formData, setFormData] = useState({ amount: '', due_date: '' });
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createNext, setCreateNext] = useState(true);

  const inputClass = "w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary text-sm";

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
      if (data.paid_at) setPaymentDate(new Date(data.paid_at).toISOString().split('T')[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayment(); }, [idPagamento]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchWithAuth(`pagamentos/${idPagamento}`, {
        method: 'PATCH',
        body: JSON.stringify({ pagamento: { amount: parseFloat(formData.amount), due_date: formData.due_date } }),
      });
      router.push(`/coach/payments/${idAluno}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await fetchWithAuth(`pagamentos/${idPagamento}?create_next=${createNext}`, {
        method: 'PATCH',
        body: JSON.stringify({ pagamento: { status: 'pago', paid_at: paymentDate } }),
      });
      router.push(`/coach/payments/${idAluno}`);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleUnmarkAsPaid = async () => {
    const ok = await showConfirm({ message: 'Tem certeza que deseja desconciliar este pagamento? Ele voltará ao status "pendente".', confirmLabel: 'Desconciliar', danger: true });
    if (!ok) return;
    try {
      await fetchWithAuth(`pagamentos/${idPagamento}`, {
        method: 'PATCH',
        body: JSON.stringify({ pagamento: { status: 'pendente', paid_at: null } }),
      });
      fetchPayment();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async () => {
    if (payment?.status === 'pago') {
      showToast('Desconcilie o pagamento antes de excluí-lo.', "warning");
      return;
    }
    const ok = await showConfirm({ message: 'Tem certeza que deseja excluir este pagamento?', confirmLabel: 'Excluir', danger: true });
    if (!ok) return;
    try {
      await fetchWithAuth(`pagamentos/${idPagamento}`, { method: 'DELETE' });
      router.push(`/coach/payments/${idAluno}`);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <div className="max-w-lg mx-auto p-4 md:p-6 pb-24 text-content-primary"><Skeleton /></div>;
  if (error || !payment) return (
    <div className="max-w-lg mx-auto p-6 text-content-primary">
      <p className="text-semantic-error-text">{error || 'Pagamento não encontrado.'}</p>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6 pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-content-primary">Detalhes do Pagamento</h1>
          <p className="text-sm text-content-tertiary">Aluno: <span className="font-bold text-content-secondary">{payment.aluno.user.name}</span></p>
        </div>
      </div>

      {payment.status === 'pago' ? (
        /* View: pago */
        <div className="bg-surface-elevated border border-line rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-semantic-success-text mb-2">
            <CheckCircle2 size={20} />
            <span className="font-bold text-lg">Pago</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-line pb-3">
              <span className="text-content-tertiary font-bold">Valor</span>
              <span className="font-bold text-content-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}
              </span>
            </div>
            <div className="flex justify-between border-b border-line pb-3">
              <span className="text-content-tertiary font-bold">Vencimento</span>
              <span className="font-bold text-content-primary">{new Date(payment.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-tertiary font-bold">Pago em</span>
              <span className="font-bold text-semantic-success-text">
                {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'}
              </span>
            </div>
          </div>
          <button
            onClick={handleUnmarkAsPaid}
            className="w-full mt-4 bg-semantic-warning-bg border border-semantic-warning-border text-semantic-warning-text py-2.5 rounded-xl font-bold hover:opacity-80 transition-opacity"
          >
            Desconciliar Pagamento
          </button>
        </div>
      ) : (
        /* View: pendente / atrasado */
        <div className="space-y-4">
          <form onSubmit={handleUpdate} className="bg-surface-elevated border border-line rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-content-primary mb-2">Dados do Pagamento</h2>
            <div>
              <label className="block text-xs font-bold text-content-muted uppercase mb-1">Valor (R$)</label>
              <input
                type="number" step="0.01" required
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-content-muted uppercase mb-1">Data de Vencimento</label>
              <input
                type="date" required
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={saving} className="w-full bg-brand text-content-on-brand py-2.5 rounded-xl font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>

          {/* Conciliação */}
          <div className="bg-surface-elevated border border-line rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-content-primary">Conciliação</h2>
            <div>
              <label className="block text-xs font-bold text-content-muted uppercase mb-1">Data do Pagamento</label>
              <input
                type="date"
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-content-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={createNext}
                onChange={e => setCreateNext(e.target.checked)}
                className="w-4 h-4 accent-brand"
              />
              Criar cobrança do próximo mês?
            </label>
            <button
              type="button"
              onClick={handleMarkAsPaid}
              className="w-full bg-semantic-success-bg border border-semantic-success-border text-semantic-success-text py-2.5 rounded-xl font-bold hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} /> Conciliar (Marcar como Pago)
            </button>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="w-full text-semantic-error-text hover:bg-semantic-error-bg flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors font-bold text-sm border border-transparent hover:border-semantic-error-border"
          >
            <Trash2 size={15} /> Excluir Este Pagamento
          </button>
        </div>
      )}
      {ToastEl}
      {ConfirmEl}
    </div>
  );
}
