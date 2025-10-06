'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Banknote, KeyRound, Copy } from 'lucide-react';

interface PaymentMethod {
  id: string;
  method_type: 'pix' | 'bank_account';
  details: any;
}

interface Assinatura {
  status: 'ativo' | 'expirado' | 'cancelado';
  end_date: string;
  plano: {
    name: string;
    price: number;
  };
}

interface CoachData {
  payment_methods: PaymentMethod[];
}

export default function AlunoPaymentPage() {
  const [coachInfo, setCoachInfo] = useState<CoachData | null>(null);
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coachData, assinaturaData] = await Promise.all([
          fetchWithAuth('meu_coach'),
          fetchWithAuth('minha_assinatura').catch(() => null) // Não quebra se não houver assinatura
        ]);
        setCoachInfo(coachData);
        setAssinatura(assinaturaData);
      } catch (err) {
        setError('Não foi possível carregar as informações de pagamento.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copiado para a área de transferência!');
    });
  };

  const pixKeys = coachInfo?.payment_methods.filter(p => p.method_type === 'pix') || [];
  const bankAccount = coachInfo?.payment_methods.find(p => p.method_type === 'bank_account');

  const getStatusInfo = () => {
    if (!assinatura) return { text: 'Nenhum plano ativo', color: 'text-gray-500' };
    switch (assinatura.status) {
      case 'ativo':
        return { text: `Ativo - Vence em ${new Date(assinatura.end_date).toLocaleDateString('pt-BR')}`, color: 'text-green-600' };
      case 'expirado':
        return { text: 'Expirado', color: 'text-red-600' };
      case 'cancelado':
        return { text: 'Cancelado', color: 'text-yellow-600' };
      default:
        return { text: 'Status desconhecido', color: 'text-gray-500' };
    }
  };
  const statusInfo = getStatusInfo();

  if (loading) return <p className="text-neutral-800">Carregando...</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow rounded-md text-neutral-800 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4 border-b pb-4">Pagamento da Assinatura</h1>
        {error && <p className="text-red-600">{error}</p>}
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Status da sua Assinatura</h2>
        <div className="border rounded-lg p-4 bg-gray-50">
          <p><strong>Plano:</strong> {assinatura?.plano.name || 'Nenhum'}</p>
          <p><strong>Valor:</strong> R$ {assinatura ? assinatura.plano.price.toFixed(2).replace('.', ',') : '0,00'}</p>
          <p><strong>Status:</strong> <span className={`font-bold ${statusInfo.color}`}>{statusInfo.text}</span></p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2"><KeyRound size={20} /> Pagar com PIX</h2>
        {pixKeys.length > 0 ? (
          <ul className="space-y-3">
            {pixKeys.map(pix => (
              <li key={pix.id} className="border p-3 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">{pix.details.key}</p>
                  <p className="text-sm text-neutral-500">Tipo: {pix.details.key_type?.toUpperCase()}</p>
                </div>
                <button onClick={() => copyToClipboard(pix.details.key)} className="p-2 text-blue-600 hover:text-blue-800" aria-label="Copiar chave PIX">
                  <Copy size={18} />
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-neutral-500">Seu coach não cadastrou chaves PIX.</p>}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2"><Banknote size={20} /> Pagar com Transferência Bancária</h2>
        {bankAccount ? (
          <div className="border p-4 rounded-md bg-gray-50 space-y-2">
            <p><strong>Titular:</strong> {bankAccount.details.holder_name}</p>
            <p><strong>Banco:</strong> {bankAccount.details.bank_name}</p>
            <p><strong>Agência:</strong> {bankAccount.details.agency}</p>
            <p><strong>Conta:</strong> {bankAccount.details.account_number}</p>
          </div>
        ) : <p className="text-sm text-neutral-500">Seu coach não cadastrou uma conta bancária.</p>}
      </section>
    </div>
  );
}