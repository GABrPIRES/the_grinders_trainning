"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Loader2, CreditCard, 
  Clock, FileText, DollarSign, AlertCircle, Package 
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

export default function CreatePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [plan, setPlan] = useState({
    name: '',
    price: '',
    duration: '', // em dias
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPlan({ ...plan, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await fetchWithAuth('planos', {
        method: 'POST',
        body: JSON.stringify({ 
            plano: {
                ...plan,
                price: parseFloat(plan.price),
                duration: parseInt(plan.duration)
            }
        }),
      });
      alert('Plano criado com sucesso!');
      router.push('/coach/plans');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar plano. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0 text-neutral-800">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Novo Plano</h1>
          <p className="text-neutral-500 text-sm">Crie um pacote de consultoria para seus alunos.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
        
        {/* NOME DO PLANO */}
        <div>
           <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2">
              <Package size={16}/> Nome do Pacote
           </label>
           <input 
             name="name"
             value={plan.name}
             onChange={handleChange}
             placeholder="Ex: Consultoria Mensal, Trimestral..."
             className="w-full pl-4 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
             required
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PREÇO */}
            <div>
                <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2">
                    <DollarSign size={16}/> Preço (R$)
                </label>
                <input 
                    type="number"
                    name="price"
                    value={plan.price}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="0,00"
                    className="w-full pl-4 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    required
                />
            </div>

            {/* DURAÇÃO */}
            <div>
                <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2">
                    <Clock size={16}/> Duração (Dias)
                </label>
                <div className="relative">
                    <input 
                        type="number"
                        name="duration"
                        value={plan.duration}
                        onChange={handleChange}
                        placeholder="30"
                        className="w-full pl-4 pr-12 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">dias</span>
                </div>
            </div>
        </div>

        {/* DESCRIÇÃO */}
        <div>
           <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2">
              <FileText size={16}/> O que está incluso?
           </label>
           <textarea 
             name="description"
             value={plan.description}
             onChange={handleChange}
             placeholder="Descreva os benefícios: Suporte 24h, Análise de vídeos, Ajustes semanais..."
             className="w-full pl-4 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all h-32 resize-none"
           />
        </div>

        {/* BOTÃO SALVAR */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 w-full md:w-auto justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Salvando..." : "Criar Plano"}
          </button>
        </div>

      </form>
    </div>
  );
}