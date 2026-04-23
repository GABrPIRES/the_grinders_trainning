"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import {
  ArrowLeft, Plus, CheckCircle2, Clock, AlertCircle,
  CreditCard, Calendar, ChevronRight, MoreHorizontal,
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StudentPaymentSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-surface-subtle rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-6 bg-surface-subtle rounded w-48"></div>
          <div className="h-4 bg-surface-subtle rounded w-32"></div>
        </div>
      </div>
      <div className="bg-surface-elevated border border-line rounded-xl p-5 h-24"></div>
      <div className="bg-surface-elevated border border-line rounded-xl overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-line last:border-0">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-subtle rounded w-24"></div>
              <div className="h-3 bg-surface-subtle rounded w-16"></div>
            </div>
            <div className="h-6 bg-surface-subtle rounded-full w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function StatusBadge({ status, paid_at }: { status: string; paid_at?: string | null }) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  if (status === 'pago')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border">
        <CheckCircle2 size={12} /> Pago {paid_at ? `em ${fmt(paid_at)}` : ''}
      </span>
    );
  if (status === 'pendente')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-semantic-warning-bg text-semantic-warning-text border border-semantic-warning-border">
        <Clock size={12} /> Pendente
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border">
      <AlertCircle size={12} /> Atrasado
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentPaymentsPage() {
  const { idAluno } = useParams();
  const router = useRouter();

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [alunoData, pagamentosData] = await Promise.all([
          fetchWithAuth(`alunos/${idAluno}`),
          fetchWithAuth(`pagamentos?aluno_id=${idAluno}`),
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

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  if (loading) return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24 md:pb-6 text-content-primary">
      <StudentPaymentSkeleton />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24 md:pb-6 text-content-primary">

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-content-primary">Histórico Financeiro</h1>
            {aluno && <p className="text-sm text-content-tertiary">Aluno: <span className="font-bold text-content-secondary">{aluno.user.name}</span></p>}
          </div>
        </div>
      </div>

      {/* Card do plano */}
      {aluno?.plano ? (
        <div className="bg-surface-elevated border border-line rounded-xl shadow-sm p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />
          <div className="flex items-center gap-4 pl-3">
            <div className="p-3 bg-surface-subtle text-brand rounded-full hidden sm:flex">
              <CreditCard size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-brand uppercase tracking-wide mb-1">Plano Atual</p>
              <h2 className="text-xl font-bold text-content-primary">{aluno.plano.name}</h2>
            </div>
          </div>
          <div className="w-full sm:w-auto text-left sm:text-right border-t sm:border-t-0 sm:border-l border-line pt-3 sm:pt-0 sm:pl-6 pl-3">
            <p className="text-xs text-content-muted mb-1">Mensalidade</p>
            <p className="text-2xl font-bold text-content-primary">{formatMoney(aluno.plano.price)}</p>
          </div>
        </div>
      ) : (
        <div className="bg-surface-subtle border border-line p-4 rounded-xl mb-6 text-center text-sm text-content-tertiary">
          Este aluno não possui um plano ativo no momento.
        </div>
      )}

      {/* Novo pagamento */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-lg font-bold text-content-primary">Pagamentos</h2>
        <button
          onClick={() => router.push(`/coach/payments/${idAluno}/pagamento/create`)}
          className="w-full sm:w-auto bg-brand text-content-on-brand px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors font-bold shadow-sm"
        >
          <Plus size={17} /> Novo Pagamento
        </button>
      </div>

      {/* Lista */}
      {pagamentos.length === 0 ? (
        <div className="bg-surface-elevated border border-line p-12 rounded-xl text-center flex flex-col items-center shadow-sm">
          <Calendar className="text-content-muted mb-3" size={40} />
          <p className="font-bold text-content-secondary">Nenhum pagamento registrado.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {pagamentos.map(pgto => (
              <div
                key={pgto.id}
                onClick={() => router.push(`/coach/payments/${idAluno}/pagamento/${pgto.id}`)}
                className="bg-surface-elevated p-4 rounded-xl border border-line shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-content-muted mb-1">Vencimento</p>
                    <p className="font-bold text-content-primary text-lg">{formatDate(pgto.due_date)}</p>
                  </div>
                  <p className="font-bold text-content-primary text-lg">{formatMoney(pgto.amount)}</p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-line">
                  <StatusBadge status={pgto.status} paid_at={pgto.paid_at} />
                  <MoreHorizontal size={18} className="text-content-muted" />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-page border-b border-line">
                  <th className="px-6 py-3 text-left text-xs font-bold text-content-tertiary uppercase tracking-wide">Vencimento</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-content-tertiary uppercase tracking-wide">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-content-tertiary uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-content-tertiary uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pagamentos.map(pgto => (
                  <tr key={pgto.id} className="hover:bg-surface-page transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-content-primary">{formatDate(pgto.due_date)}</td>
                    <td className="px-6 py-4 text-sm text-content-secondary">{formatMoney(pgto.amount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={pgto.status} paid_at={pgto.paid_at} /></td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/coach/payments/${idAluno}/pagamento/${pgto.id}`)}
                        className="text-content-muted hover:text-brand p-2 hover:bg-surface-subtle rounded-lg transition-colors"
                      >
                        <ChevronRight size={18} />
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
