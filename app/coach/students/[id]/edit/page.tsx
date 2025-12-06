"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, Save, Loader2, Lock, User, Mail, Phone, CreditCard } from "lucide-react";

interface Plan {
  id: string;
  name: string;
}

export default function EditStudentAccountPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
    plano_id: "" // Novo campo
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Carrega dados do aluno E lista de planos em paralelo
        const [studentData, plansData] = await Promise.all([
            fetchWithAuth(`alunos/${id}`),
            fetchWithAuth('planos')
        ]);

        setForm(prev => ({
          ...prev,
          name: studentData.user.name || "",
          email: studentData.user.email || "",
          phone_number: studentData.phone_number || "",
          plano_id: studentData.current_plano_id || "", // Usa o campo novo que criamos na API
          password: "", 
          password_confirmation: ""
        }));

        setPlans(Array.isArray(plansData) ? plansData : []);

      } catch (error) {
        console.error("Erro ao carregar dados", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (form.password && form.password !== form.password_confirmation) {
        alert("As senhas não coincidem.");
        setSaving(false);
        return;
    }

    try {
      await fetchWithAuth(`alunos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ 
            aluno: {
                name: form.name,
                email: form.email,
                phone_number: form.phone_number,
                password: form.password,
                password_confirmation: form.password_confirmation,
                plano_id: form.plano_id // Envia o ID do plano selecionado
            } 
        }),
      });
      alert("Conta do aluno atualizada!");
      router.push(`/coach/students/${id}`);
    } catch (error: any) {
      alert("Erro ao atualizar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando formulário...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 text-neutral-800">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Editar Conta do Aluno</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-neutral-200 shadow-sm space-y-6">
        
        {/* Dados Pessoais */}
        <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-700 border-b pb-2">
                <User size={20} /> Informações Básicas
            </h2>
            <div>
                <label className="block text-sm font-medium mb-1 text-neutral-600">Nome Completo</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full border border-neutral-300 p-3 rounded-lg outline-none focus:border-red-600" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Mail size={14}/> Email</label>
                    <input name="email" value={form.email} onChange={handleChange} className="w-full border border-neutral-300 p-3 rounded-lg outline-none focus:border-red-600" required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Phone size={14}/> Telefone</label>
                    <input name="phone_number" value={form.phone_number} onChange={handleChange} className="w-full border border-neutral-300 p-3 rounded-lg outline-none focus:border-red-600" />
                </div>
            </div>
        </div>

        {/* Assinatura (NOVO) */}
        <div className="pt-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-700 border-b pb-2 mb-4">
                <CreditCard size={20} /> Plano & Assinatura
            </h2>
            <div>
                <label className="block text-sm font-medium mb-1 text-neutral-600">Plano Atual</label>
                <select 
                    name="plano_id" 
                    value={form.plano_id} 
                    onChange={handleChange} 
                    className="w-full border border-neutral-300 p-3 rounded-lg outline-none focus:border-red-600 bg-white"
                >
                    <option value="">Sem plano ativo</option>
                    {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>{plan.name}</option>
                    ))}
                </select>
                <p className="text-xs text-neutral-400 mt-1">Ao alterar o plano, uma nova assinatura será criada iniciando hoje.</p>
            </div>
        </div>

        {/* Alterar Senha */}
        <div className="pt-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-700 border-b pb-2 mb-4">
                <Lock size={20} /> Segurança
            </h2>
            <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded mb-4 border border-yellow-100">
                Preencha abaixo apenas se quiser alterar a senha do aluno.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-600">Nova Senha</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border border-neutral-300 p-3 rounded-lg outline-none focus:border-red-600" placeholder="Mínimo 6 caracteres" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-600">Confirmar Senha</label>
                    <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} className="w-full border border-neutral-300 p-3 rounded-lg outline-none focus:border-red-600" placeholder="Repita a senha" />
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-red-700 text-white font-bold py-3.5 rounded-xl hover:bg-red-800 transition-colors flex items-center justify-center gap-2 mt-8 shadow-lg"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>

      </form>
    </div>
  );
}