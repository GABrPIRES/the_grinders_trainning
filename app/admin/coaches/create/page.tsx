"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, User, Mail, Lock, Save, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function CreateCoachPage() {
  const [coach, setCoach] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoach({ ...coach, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetchWithAuth("users", {
        method: "POST",
        body: JSON.stringify({ user: { ...coach, role: "personal" } }),
      });
      alert("Coach cadastrado com sucesso!");
      router.push("/admin/coaches");
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar coach");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary placeholder:text-content-tertiary text-sm";

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Novo Coach</h1>
          <p className="text-sm text-content-tertiary">Cadastre um profissional para gerenciar alunos.</p>
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
            <ShieldCheck size={18} className="text-brand" /> Dados de Acesso
          </h2>

          <div>
            <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
              <input type="text" name="name" value={coach.name} onChange={handleChange} className={inputClass} placeholder="Ex: Carlos Silva" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Email Profissional</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
              <input type="email" name="email" value={coach.email} onChange={handleChange} className={inputClass} placeholder="Ex: carlos@thegrinders.com" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Senha Inicial</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
              <input type="password" name="password" value={coach.password} onChange={handleChange} className={inputClass} placeholder="Mínimo 6 caracteres" required />
            </div>
            <p className="text-xs text-content-muted mt-1">O coach poderá alterar essa senha depois.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit" disabled={loading}
            className="bg-brand text-content-on-brand font-bold py-3 px-8 rounded-xl hover:bg-brand-hover transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Salvando..." : "Cadastrar Coach"}
          </button>
        </div>
      </form>
    </div>
  );
}
