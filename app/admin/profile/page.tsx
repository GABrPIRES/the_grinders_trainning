"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { User, Mail, Save, Loader2, ShieldCheck, LayoutDashboard } from "lucide-react";

function AdminProfileSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-surface-elevated border border-line rounded-xl p-6 space-y-4">
        <div className="w-24 h-24 rounded-full bg-surface-subtle mx-auto mt-4" />
        <div className="h-6 bg-surface-subtle rounded w-40 mx-auto" />
        <div className="h-5 bg-surface-subtle rounded w-28 mx-auto" />
        <div className="h-20 bg-surface-subtle rounded-lg mt-4" />
      </div>
      <div className="lg:col-span-2 bg-surface-elevated border border-line rounded-xl p-8 space-y-4">
        <div className="h-6 bg-surface-subtle rounded w-36" />
        <div className="h-10 bg-surface-subtle rounded-lg" />
        <div className="h-10 bg-surface-subtle rounded-lg" />
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "" });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchWithAuth("profile");
        setForm({
          name: data.name || data.user?.name || "",
          email: data.email || data.user?.email || "",
          role: data.role || data.user?.role || "Admin",
        });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchWithAuth("profile", { method: "PUT", body: JSON.stringify({ user: { name: form.name } }) });
      alert("Perfil atualizado com sucesso!");
    } catch (error: any) {
      alert("Erro ao atualizar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const inputClass = "w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary text-sm";

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-content-primary pb-24 md:pb-6">

      <div>
        <h1 className="text-2xl font-bold text-content-primary">Perfil Administrativo</h1>
        <p className="text-sm text-content-tertiary">Gerencie suas credenciais de acesso.</p>
      </div>

      {loading ? <AdminProfileSkeleton /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Card Admin */}
          <div className="lg:col-span-1">
            <div className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
              <div className="h-20 bg-content-primary" />
              <div className="px-6 pb-6 flex flex-col items-center -mt-10">
                <div className="w-20 h-20 rounded-full bg-surface-elevated border-4 border-surface-elevated shadow-md flex items-center justify-center text-xl font-bold text-content-primary mb-3">
                  {getInitials(form.name)}
                </div>
                <h2 className="text-lg font-bold text-content-primary text-center">{form.name}</h2>
                <div className="flex items-center gap-1 bg-semantic-error-bg text-semantic-error-text px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 border border-semantic-error-border">
                  <ShieldCheck size={12} /> Administrador
                </div>
                <div className="mt-6 w-full bg-surface-subtle p-4 rounded-lg border border-line">
                  <p className="text-xs text-content-muted uppercase font-bold mb-2">Permissões</p>
                  <ul className="space-y-2 text-sm text-content-secondary">
                    <li className="flex items-center gap-2"><LayoutDashboard size={14} className="text-content-muted" /> Acesso Total ao Painel</li>
                    <li className="flex items-center gap-2"><User size={14} className="text-content-muted" /> Gestão de Usuários</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-surface-elevated border border-line rounded-xl shadow-sm p-6 md:p-8 space-y-6">
              <h3 className="text-base font-bold flex items-center gap-2 text-content-primary border-b border-line pb-3">
                <User size={17} className="text-brand" /> Dados da Conta
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Nome de Exibição</label>
                  <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Email de Acesso</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
                    <input
                      name="email" value={form.email} disabled
                      className="w-full pl-10 py-2.5 border border-line rounded-lg bg-surface-subtle text-content-muted text-sm cursor-not-allowed"
                      title="O email de administrador não pode ser alterado por aqui"
                    />
                  </div>
                  <p className="text-xs text-content-muted mt-1">Para alterar o email mestre, contate o suporte técnico.</p>
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
        </div>
      )}
    </div>
  );
}
