"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Save, Loader2, CreditCard, 
  Clock, FileText, DollarSign, Trash2, AlertCircle 
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

export default function EditPlanPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [plan, setPlan] = useState({
    name: '',
    price: '',
    duration: '',
    description: ''
  });

  // Busca os dados do plano
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await fetchWithAuth(`planos/${id}`);
        setPlan({
          name: data.name,
          price: data.price,
          duration: data.duration,
          description: data.description || ''
        });
      } catch (err: any) {
        setError('Erro ao carregar o plano.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPlan({ ...plan, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await fetchWithAuth(`planos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
            plano: { // <--- MUDOU DE 'plan' PARA 'plano'
               ...plan,
               // Garanta que números sejam números se necessário, ou deixe o Rails tratar
               price: parseFloat(plan.price as string),
               duration: parseInt(plan.duration as string)
            } 
        }),
      });
      alert('Plano atualizado com sucesso!');
      router.push('/coach/plans');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar plano');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
        try {
            await fetchWithAuth(`planos/${id}`, { method: 'DELETE' });
            router.push('/coach/plans');
        } catch (err: any) {
            alert(err.message || 'Erro ao excluir.');
        }
    }
  }

  if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando dados...</div>;

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0 text-neutral-800">
      
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Editar Plano</h1>
              <p className="text-neutral-500 text-sm">Altere as informações deste pacote.</p>
            </div>
        </div>
        
        <button 
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2.5 rounded-xl transition-colors"
            title="Excluir Plano"
        >
            <Trash2 size={20} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
        
        {/* NOME */}
        <div>
           <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2">
              <CreditCard size={16}/> Nome do Plano
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
                <input 
                    type="number"
                    name="duration"
                    value={plan.duration}
                    onChange={handleChange}
                    placeholder="30"
                    className="w-full pl-4 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    required
                />
            </div>
        </div>

        {/* DESCRIÇÃO */}
        <div>
           <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2">
              <FileText size={16}/> Descrição / Benefícios
           </label>
           <textarea 
             name="description"
             value={plan.description}
             onChange={handleChange}
             placeholder="Descreva o que está incluso (ex: Avaliação de vídeos, suporte WhatsApp...)"
             className="w-full pl-4 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all h-32 resize-none"
           />
        </div>

        {/* BOTÃO SALVAR */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-red-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 w-full md:w-auto justify-center"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>

      </form>
    </div>
  );
}