"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { CreditCard, Calendar, CheckCircle, Clock, AlertCircle, DollarSign } from "lucide-react";

// Interfaces
interface Plano {
  name: string;
  price: number;
  duration: number;
}

interface Assinatura {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Busca dados em paralelo
        const [assinaturaData, pagamentosData] = await Promise.all([
          fetchWithAuth('minha_assinatura'), // Endpoint que já existia
          fetchWithAuth('pagamentos')        // Novo endpoint ajustado
        ]);

        setAssinatura(assinaturaData);
        // A API retorna um array de pagamentos
        setPagamentos(Array.isArray(pagamentosData) ? pagamentosData : []);
        
      } catch (err: any) {
        console.error("Erro ao carregar financeiro:", err);
        setError("Não foi possível carregar suas informações financeiras.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    // Ajuste de fuso simples para exibição
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  if (loading) return <div className="p-8 text-center">Carregando financeiro...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800 space-y-8">
      <h1 className="text-3xl font-bold text-neutral-900">Minha Assinatura e Pagamentos</h1>

      {/* Cartão da Assinatura Atual */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="text-red-700" size={28} />
          <h2 className="text-xl font-bold">Plano Atual</h2>
        </div>

        {assinatura ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-neutral-500">Plano</p>
              <p className="text-lg font-semibold">{assinatura.plano?.name || "Personalizado"}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Valor</p>
              <p className="text-lg font-semibold text-green-600">
                {formatMoney(assinatura.plano?.price || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                assinatura.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {assinatura.status.toUpperCase()}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-neutral-500">Você não possui uma assinatura ativa no momento.</p>
        )}
      </div>

      {/* Histórico de Pagamentos */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock size={24} className="text-neutral-600" />
          Histórico de Pagamentos
        </h3>
        
        {pagamentos.length > 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Vencimento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Data Pagamento</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {pagamentos.map((pgto) => (
                  <tr key={pgto.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {formatDate(pgto.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {formatMoney(pgto.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pgto.status === 'pago' && (
                        <span className="flex items-center text-green-600 text-sm font-medium">
                          <CheckCircle size={16} className="mr-1" /> Pago
                        </span>
                      )}
                      {pgto.status === 'pendente' && (
                        <span className="flex items-center text-yellow-600 text-sm font-medium">
                          <Clock size={16} className="mr-1" /> Pendente
                        </span>
                      )}
                      {pgto.status === 'atrasado' && (
                        <span className="flex items-center text-red-600 text-sm font-medium">
                          <AlertCircle size={16} className="mr-1" /> Atrasado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {pgto.paid_at ? formatDate(pgto.paid_at) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-neutral-50 rounded-lg border border-neutral-200 text-center text-neutral-500">
            Nenhum registro de pagamento encontrado.
          </div>
        )}
      </div>
    </div>
  );
}