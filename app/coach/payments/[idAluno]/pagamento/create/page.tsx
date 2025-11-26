"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, Save, Info, AlertCircle } from "lucide-react";

interface Plano {
  name: string;
  price: number;
}

interface Aluno {
  id: string;
  user: { name: string };
  plano?: Plano;
}

export default function CreatePaymentPage() {
  const { idAluno } = useParams();
  const router = useRouter();
  
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    amount: "",
    due_date: "",
    status: "pendente"
  });

  useEffect(() => {
    const loadAluno = async () => {
      try {
        setLoading(true);
        const data = await fetchWithAuth(`alunos/${idAluno}`);
        setAluno(data);
        
        // --- LÓGICA DE SUGESTÃO ---
        // Se o aluno tem plano, preenche o valor automaticamente
        if (data.plano?.price) {
          setForm(f => ({ ...f, amount: data.plano.price.toString() }));
        }
      } catch (err) {
        console.error("Erro ao carregar aluno:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAluno();
  }, [idAluno]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchWithAuth('pagamentos', {
        method: 'POST',
        body: JSON.stringify({
          pagamento: {
            aluno_id: idAluno,
            amount: parseFloat(form.amount),
            due_date: form.due_date,
            status: form.status
          }
        })
      });
      alert("Pagamento criado com sucesso!");
      router.push(`/coach/payments/${idAluno}`);
    } catch (err: any) {
      alert("Erro ao criar pagamento: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="max-w-lg mx-auto p-6 text-neutral-800 bg-white rounded-xl shadow-sm border border-neutral-200 mt-8">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Novo Pagamento</h1>
      </div>

      {/* Card de Sugestão do Plano */}
      {aluno?.plano ? (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start gap-3 border border-blue-100">
          <Info className="shrink-0 mt-0.5 text-blue-700" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-bold mb-1">Sugestão de Plano:</p>
            <p>
              O aluno <strong>{aluno.user.name}</strong> possui o plano <strong>{aluno.plano.name}</strong> ativo.
              <br/>
              Valor sugerido: <strong>{formatMoney(aluno.plano.price)}</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-start gap-3 border border-gray-200 text-sm text-gray-600">
           <AlertCircle className="shrink-0 mt-0.5" size={20} />
           <p>Este aluno não possui um plano ativo. Insira o valor manualmente.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Valor (R$)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">R$</span>
            <input
              type="number"
              step="0.01"
              required
              className="w-full border border-neutral-300 p-2 pl-10 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0,00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Data de Vencimento</label>
          <input
            type="date"
            required
            className="w-full border border-neutral-300 p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
            value={form.due_date}
            onChange={e => setForm({ ...form, due_date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Status Inicial</label>
          <select
            className="w-full border border-neutral-300 p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-red-700 text-white py-3 rounded-lg font-bold hover:bg-red-800 transition-colors flex items-center justify-center gap-2 mt-4 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          {saving ? "Salvando..." : "Criar Pagamento"}
        </button>
      </form>
    </div>
  );
}