"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, Save, Loader2, Lock, User, Mail, Phone } from "lucide-react";

export default function EditStudentAccountPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Focamos APENAS nos dados essenciais de conta
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: ""
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchWithAuth(`alunos/${id}`);
        setForm(prev => ({
          ...prev,
          name: data.user.name || "",
          email: data.user.email || "",
          phone_number: data.phone_number || "",
          password: "", 
          password_confirmation: ""
        }));
      } catch (error) {
        console.error("Erro ao carregar aluno", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                password_confirmation: form.password_confirmation
            } 
        }),
      });
      alert("Conta do aluno atualizada!");
      router.push(`/coach/students/${id}`); // Volta para a visualização completa
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

        {/* Alterar Senha */}
        <div className="pt-6">
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