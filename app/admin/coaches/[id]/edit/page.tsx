"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, User, Mail, Lock, Save, Loader2, ShieldCheck, ToggleLeft, AlertCircle } from "lucide-react";

function EditCoachSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 bg-surface-subtle rounded-lg" />
        <div className="space-y-2">
          <div className="h-6 bg-surface-subtle rounded w-36" />
          <div className="h-4 bg-surface-subtle rounded w-56" />
        </div>
      </div>
      <div className="bg-surface-elevated border border-line rounded-xl p-8 space-y-4">
        <div className="h-5 bg-surface-subtle rounded w-44" />
        <div className="h-10 bg-surface-subtle rounded-lg" />
        <div className="h-10 bg-surface-subtle rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-surface-subtle rounded-lg" />
          <div className="h-10 bg-surface-subtle rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function EditCoachPage() {
  const router = useRouter();
  const { id } = useParams();
  const [coach, setCoach] = useState({ name: "", email: "", password: "", status: "ativo" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchCoachData = async () => {
      try {
        const data = await fetchWithAuth(`users/${id}`);
        setCoach({ name: data.name || "", email: data.email || "", password: "", status: data.status || "ativo" });
      } catch (err: any) {
        setError("Erro ao carregar os dados do coach");
      } finally {
        setLoading(false);
      }
    };
    fetchCoachData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCoach({ ...coach, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await fetchWithAuth(`users/${id}`, { method: "PATCH", body: JSON.stringify({ user: coach }) });
      alert("Dados do coach atualizados!");
      router.push("/admin/coaches");
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary placeholder:text-content-tertiary text-sm";

  if (loading) return <div className="max-w-2xl mx-auto pb-24 md:pb-6 text-content-primary"><EditCoachSkeleton /></div>;

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Editar Coach</h1>
          <p className="text-sm text-content-tertiary">Gerencie o acesso e status do profissional.</p>
        </div>
      </div>

      {error && (
        <div className="bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-elevated border border-line p-6 md:p-8 rounded-xl shadow-sm space-y-6">
        <div className="space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2 text-content-primary border-b border-line pb-3 mb-4">
            <ShieldCheck size={18} className="text-brand" /> Informações da Conta
          </h2>

          <div>
            <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
              <input type="text" name="name" value={coach.name} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
              <input type="email" name="email" value={coach.email} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Status da Conta</label>
              <div className="relative">
                <ToggleLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
                <select name="status" value={coach.status} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Resetar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
                <input type="password" name="password" value={coach.password} onChange={handleChange} className={inputClass} placeholder="Deixe vazio para manter" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit" disabled={saving}
            className="bg-brand text-content-on-brand font-bold py-3 px-8 rounded-xl hover:bg-brand-hover transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
