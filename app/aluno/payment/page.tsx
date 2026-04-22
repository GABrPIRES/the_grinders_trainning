"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import {
  CreditCard, Calendar, CheckCircle, Clock, AlertCircle,
  Copy, Check, Landmark, QrCode, Wallet
} from "lucide-react";

interface PaymentMethodDetails {
  key?: string;
  key_type?: string;
  bank_name?: string;
  agency?: string;
  account_number?: string;
  holder_name?: string;
}

interface PaymentMethod {
  id: string;
  method_type: 'pix' | 'bank_account';
  details: PaymentMethodDetails;
}

interface Plano {
  name: string;
  price: number;
}

interface Assinatura {
  id: string;
  status: string;
  plano: Plano;
}

interface Pagamento {
  id: string;
  amount: number;
  status: "pendente" | "pago" | "atrasado";
  due_date: string;
  paid_at: string | null;
}

function PaymentSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 animate-pulse space-y-8 pb-24 md:pb-6">
      <div className="space-y-2">
        <div className="h-8 bg-surface-subtle rounded-lg w-36"></div>
        <div className="h-4 bg-surface-subtle rounded w-64"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-surface-subtle rounded-2xl"></div>
        <div className="space-y-4">
          <div className="h-6 bg-surface-subtle rounded w-48"></div>
          <div className="h-32 bg-surface-subtle rounded-xl"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-6 bg-surface-subtle rounded w-48"></div>
        <div className="h-48 bg-surface-subtle rounded-xl"></div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    pago: {
      cls: 'bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border',
      icon: <CheckCircle size={12} className="mr-1" />,
      label: 'Pago',
    },
    pendente: {
      cls: 'bg-semantic-warning-bg text-semantic-warning-text border border-semantic-warning-border',
      icon: <Clock size={12} className="mr-1" />,
      label: 'Pendente',
    },
    atrasado: {
      cls: 'bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border',
      icon: <AlertCircle size={12} className="mr-1" />,
      label: 'Atrasado',
    },
  };
  const badge = map[status];
  if (!badge) return null;
  return (
    <span className={`flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>
      {badge.icon} {badge.label}
    </span>
  );
}

export default function AlunoPaymentPage() {
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [coachMethods, setCoachMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assinaturaData, pagamentosData, coachData] = await Promise.all([
          fetchWithAuth('minha_assinatura'),
          fetchWithAuth('pagamentos'),
          fetchWithAuth('meu_coach'),
        ]);
        setAssinatura(assinaturaData);
        setPagamentos(Array.isArray(pagamentosData) ? pagamentosData : []);
        if (coachData && Array.isArray(coachData.payment_methods)) {
          setCoachMethods(coachData.payment_methods);
        } else if (coachData?.personal?.payment_methods) {
          setCoachMethods(coachData.personal.payment_methods);
        }
      } catch (err: any) {
        console.error("Erro ao carregar financeiro:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const pixMethods = coachMethods.filter(m => m.method_type === 'pix');
  const bankMethods = coachMethods.filter(m => m.method_type === 'bank_account');

  if (loading) return <PaymentSkeleton />;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 pb-24 md:pb-6 text-content-primary">

      <div>
        <h1 className="text-3xl font-bold text-content-primary">Financeiro</h1>
        <p className="text-sm text-content-tertiary mt-1">Acompanhe seu plano e realize pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Assinatura — hero card */}
        <div className="bg-gradient-to-br from-red-900 to-red-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[250px]">
          <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={120} /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <CreditCard size={24} className="text-white" />
              </div>
              <h2 className="text-lg font-bold">Assinatura Ativa</h2>
            </div>
            {assinatura ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-red-200 font-bold uppercase tracking-wide mb-1">Plano</p>
                  <p className="text-2xl font-bold">{assinatura.plano?.name || "Personalizado"}</p>
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-4">
                  <div>
                    <p className="text-xs text-red-200 font-bold uppercase tracking-wide mb-1">Valor Mensal</p>
                    <p className="text-2xl font-bold">{formatMoney(assinatura.plano?.price || 0)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${assinatura.status === 'ativo' ? 'bg-white/20 text-white border border-white/30' : 'bg-white/10 text-white/70'}`}>
                    {assinatura.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-red-200">
                <p className="font-medium">Você não possui uma assinatura ativa.</p>
                <p className="text-sm mt-1 opacity-70">Entre em contato com seu coach para ativar um plano.</p>
              </div>
            )}
          </div>
        </div>

        {/* Formas de Pagamento */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
            <Wallet size={20} className="text-semantic-success-text" /> Dados para Pagamento
          </h2>

          {pixMethods.length > 0 && (
            <div className="bg-surface-elevated rounded-xl shadow-sm border border-line p-5">
              <div className="flex items-center gap-2 mb-4 text-content-secondary font-bold border-b border-line pb-2">
                <QrCode size={18} /> Chaves PIX
              </div>
              <div className="space-y-3">
                {pixMethods.map((pix) => (
                  <div key={pix.id} className="bg-surface-subtle border border-line rounded-lg p-3 flex items-center justify-between group hover:border-semantic-success-border transition-colors">
                    <div className="overflow-hidden mr-2">
                      <p className="text-[10px] text-content-muted font-bold uppercase">
                        {pix.details.key_type === 'random' ? 'Chave Aleatória' : pix.details.key_type}
                      </p>
                      <p className="font-mono text-sm text-content-primary font-medium truncate select-all">
                        {pix.details.key}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(pix.details.key || "", pix.id)}
                      className="p-2 bg-surface-elevated rounded-lg border border-line hover:text-semantic-success-text text-content-tertiary transition-all shadow-sm active:scale-95"
                      aria-label="Copiar chave PIX"
                    >
                      {copiedId === pix.id ? <Check size={18} className="text-semantic-success-text" /> : <Copy size={18} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bankMethods.length > 0 && (
            <div className="bg-surface-elevated rounded-xl shadow-sm border border-line p-5">
              <div className="flex items-center gap-2 mb-4 text-content-secondary font-bold border-b border-line pb-2">
                <Landmark size={18} /> Transferência Bancária
              </div>
              <div className="space-y-4">
                {bankMethods.map((bank) => (
                  <div key={bank.id} className="text-sm bg-surface-subtle p-3 rounded-lg border border-line">
                    <div className="flex justify-between mb-1">
                      <span className="text-content-muted text-xs font-bold uppercase">Banco</span>
                      <span className="font-bold text-content-primary">{bank.details.bank_name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-1">
                      <div>
                        <span className="text-content-muted text-xs font-bold uppercase block">Agência</span>
                        <span className="text-content-primary">{bank.details.agency}</span>
                      </div>
                      <div>
                        <span className="text-content-muted text-xs font-bold uppercase block">Conta</span>
                        <span className="text-content-primary font-mono">{bank.details.account_number}</span>
                      </div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-line">
                      <span className="text-content-muted text-xs font-bold uppercase block">Titular</span>
                      <span className="text-content-primary">{bank.details.holder_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {coachMethods.length === 0 && (
            <div className="bg-surface-elevated p-8 rounded-xl border border-line text-center shadow-sm flex flex-col items-center">
              <AlertCircle size={40} className="text-content-muted mb-3" />
              <p className="font-bold text-content-primary mb-1">Sem dados de pagamento</p>
              <p className="text-sm text-content-tertiary">Seu coach ainda não cadastrou formas de pagamento.</p>
            </div>
          )}
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      <div>
        <h2 className="text-xl font-bold text-content-primary mb-4 flex items-center gap-2">
          <Clock size={20} className="text-brand" /> Histórico de Cobranças
        </h2>

        {pagamentos.length > 0 ? (
          <>
            {/* Mobile — cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {pagamentos.map((pgto) => (
                <div key={pgto.id} className="bg-surface-elevated p-4 rounded-xl border border-line shadow-sm active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] text-content-muted font-bold uppercase mb-0.5">Vencimento</p>
                      <p className="font-bold text-content-primary text-lg">{formatDate(pgto.due_date)}</p>
                    </div>
                    <p className="font-bold text-content-primary text-lg">{formatMoney(pgto.amount)}</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-line">
                    <StatusBadge status={pgto.status} />
                    <span className="text-xs text-content-muted">
                      {pgto.paid_at ? `Pago em ${formatDate(pgto.paid_at)}` : "Aguardando"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop — tabela */}
            <div className="hidden md:block bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-surface-page border-b border-line">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-content-tertiary uppercase tracking-wide">Vencimento</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-content-tertiary uppercase tracking-wide">Valor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-content-tertiary uppercase tracking-wide">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-content-tertiary uppercase tracking-wide">Data Pagamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {pagamentos.map((pgto) => (
                    <tr key={pgto.id} className="hover:bg-surface-page transition-colors">
                      <td className="px-6 py-4 text-sm text-content-primary font-medium">{formatDate(pgto.due_date)}</td>
                      <td className="px-6 py-4 text-sm text-content-secondary">{formatMoney(pgto.amount)}</td>
                      <td className="px-6 py-4"><StatusBadge status={pgto.status} /></td>
                      <td className="px-6 py-4 text-sm text-content-tertiary">{pgto.paid_at ? formatDate(pgto.paid_at) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="bg-surface-elevated border border-line rounded-xl shadow-sm p-12 text-center flex flex-col items-center">
            <Calendar size={48} className="text-content-muted mb-4" />
            <h3 className="text-lg font-bold text-content-primary mb-1">Nenhum pagamento</h3>
            <p className="text-sm text-content-tertiary">Nenhum registro de cobrança encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
