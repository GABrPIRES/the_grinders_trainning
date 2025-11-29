"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { 
  CreditCard, Calendar, CheckCircle, Clock, AlertCircle, 
  DollarSign, Copy, Check, Landmark, QrCode, Wallet 
} from "lucide-react";

// --- INTERFACES (Baseadas no seu código do Coach) ---

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
        // Buscamos assinatura, pagamentos E dados do coach
        const [assinaturaData, pagamentosData, coachData] = await Promise.all([
          fetchWithAuth('minha_assinatura'),
          fetchWithAuth('pagamentos'),
          fetchWithAuth('meu_coach') 
        ]);
        
        setAssinatura(assinaturaData);
        setPagamentos(Array.isArray(pagamentosData) ? pagamentosData : []);
        
        // AQUI ESTÁ O AJUSTE:
        // Assumimos que o endpoint 'meu_coach' retorna um objeto que contém 'payment_methods'
        // OU que existe um endpoint específico se 'meu_coach' não trouxer. 
        // Baseado na lógica, o coachData deve trazer essa lista.
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

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const getStatusBadge = (status: string) => {
      switch (status) {
          case 'pago': return <span className="flex items-center text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs font-bold border border-green-200"><CheckCircle size={12} className="mr-1"/> Pago</span>;
          case 'pendente': return <span className="flex items-center text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full text-xs font-bold border border-yellow-200"><Clock size={12} className="mr-1"/> Pendente</span>;
          case 'atrasado': return <span className="flex items-center text-red-700 bg-red-100 px-2 py-0.5 rounded-full text-xs font-bold border border-red-200"><AlertCircle size={12} className="mr-1"/> Atrasado</span>;
          default: return null;
      }
  };

  // Separa os métodos para renderizar organizado
  const pixMethods = coachMethods.filter(m => m.method_type === 'pix');
  const bankMethods = coachMethods.filter(m => m.method_type === 'bank_account');

  if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando financeiro...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 md:pb-0 text-neutral-800">
      
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Financeiro</h1>
        <p className="text-neutral-500 text-sm">Acompanhe seu plano e realize pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUNA 1: ASSINATURA (Esquerda) */}
        <div className="bg-gradient-to-br from-red-900 to-red-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col justify-between h-full min-h-[250px]">
            <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={120} /></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm"><CreditCard size={24} className="text-white" /></div>
                    <h2 className="text-lg font-bold">Assinatura Ativa</h2>
                </div>
                {assinatura ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-neutral-400 uppercase font-bold mb-1">Plano</p>
                            <p className="text-2xl font-bold">{assinatura.plano?.name || "Personalizado"}</p>
                        </div>
                        <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-4">
                            <div>
                                <p className="text-xs text-neutral-400 uppercase font-bold mb-1">Valor Mensal</p>
                                <p className="text-2xl font-bold text-white">{formatMoney(assinatura.plano?.price || 0)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${assinatura.status === 'ativo' ? 'bg-green-500/20 text-white border border-green-500/30' : 'bg-neutral-600'}`}>{assinatura.status.toUpperCase()}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-neutral-300">
                        <p>Você não possui uma assinatura ativa no momento.</p>
                        <p className="text-sm mt-1 opacity-70">Entre em contato com seu coach para ativar um plano.</p>
                    </div>
                )}
            </div>
        </div>

        {/* COLUNA 2: FORMAS DE PAGAMENTO DO COACH (Direita) */}
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                <Wallet size={20} className="text-green-600" /> Dados para Pagamento
            </h2>
            
            {/* Lista de PIX */}
            {pixMethods.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
                    <div className="flex items-center gap-2 mb-4 text-neutral-700 font-semibold border-b border-neutral-50 pb-2">
                        <QrCode size={18} /> Chaves PIX
                    </div>
                    <div className="space-y-3">
                        {pixMethods.map((pix) => (
                            <div key={pix.id} className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 flex items-center justify-between group hover:border-green-200 transition-colors">
                                <div className="overflow-hidden mr-2">
                                    <p className="text-[10px] text-neutral-400 uppercase font-bold">
                                        {pix.details.key_type === 'random' ? 'Chave Aleatória' : pix.details.key_type}
                                    </p>
                                    <p className="font-mono text-sm text-neutral-900 font-medium truncate select-all">
                                        {pix.details.key}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(pix.details.key || "", pix.id)} 
                                    className="p-2 bg-white rounded-md border border-neutral-200 hover:text-green-600 text-neutral-500 transition-all shadow-sm active:scale-95"
                                    title="Copiar Chave"
                                >
                                    {copiedId === pix.id ? <Check size={18} className="text-green-600"/> : <Copy size={18}/>}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lista de Bancos */}
            {bankMethods.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
                    <div className="flex items-center gap-2 mb-4 text-neutral-700 font-semibold border-b border-neutral-50 pb-2">
                        <Landmark size={18} /> Transferência Bancária
                    </div>
                    <div className="space-y-4">
                        {bankMethods.map((bank) => (
                            <div key={bank.id} className="text-sm bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                                <div className="flex justify-between mb-1">
                                    <span className="text-neutral-500 text-xs uppercase font-bold">Banco</span>
                                    <span className="font-semibold text-neutral-900">{bank.details.bank_name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-1">
                                    <div>
                                        <span className="text-neutral-500 text-xs uppercase font-bold block">Agência</span>
                                        <span className="text-neutral-800">{bank.details.agency}</span>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500 text-xs uppercase font-bold block">Conta</span>
                                        <span className="text-neutral-800 font-mono">{bank.details.account_number}</span>
                                    </div>
                                </div>
                                <div className="pt-2 mt-2 border-t border-neutral-200/50">
                                    <span className="text-neutral-500 text-xs uppercase font-bold block">Titular</span>
                                    <span className="text-neutral-800">{bank.details.holder_name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {coachMethods.length === 0 && (
                <div className="bg-white p-6 rounded-xl border border-neutral-200 text-center shadow-sm">
                    <AlertCircle size={32} className="mx-auto text-neutral-300 mb-2"/>
                    <p className="text-neutral-500 text-sm">Seu coach ainda não cadastrou formas de pagamento.</p>
                </div>
            )}
        </div>
      </div>

      {/* HISTÓRICO DE PAGAMENTOS */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-800">
          <Clock size={20} className="text-red-700" /> Histórico de Cobranças
        </h3>
        
        {pagamentos.length > 0 ? (
          <>
            {/* MOBILE CARDS (Grid) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
               {pagamentos.map((pgto) => (
                  <div key={pgto.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-3">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[10px] text-neutral-500 uppercase font-bold mb-0.5">Vencimento</p>
                           <p className="font-bold text-neutral-900 text-lg">{formatDate(pgto.due_date)}</p>
                        </div>
                        <p className="font-bold text-neutral-800 text-lg">{formatMoney(pgto.amount)}</p>
                     </div>
                     <div className="flex justify-between items-center pt-3 border-t border-neutral-50">
                        {getStatusBadge(pgto.status)}
                        <span className="text-xs text-neutral-400">{pgto.paid_at ? `Pago em ${formatDate(pgto.paid_at)}` : "Aguardando"}</span>
                     </div>
                  </div>
               ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                    <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Vencimento</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Data Pagamento</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                    {pagamentos.map((pgto) => (
                    <tr key={pgto.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">{formatDate(pgto.due_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-600">{formatMoney(pgto.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(pgto.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{pgto.paid_at ? formatDate(pgto.paid_at) : '-'}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </>
        ) : (
          <div className="p-8 bg-neutral-50 rounded-xl border border-neutral-200 text-center flex flex-col items-center">
            <Calendar className="text-neutral-300 mb-3" size={40}/>
            <p className="text-neutral-500">Nenhum registro de pagamento encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}