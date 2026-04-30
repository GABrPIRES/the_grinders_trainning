"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { User, Mail, Save, Loader2, Phone, FileText } from "lucide-react";
import { useToast } from "@/hooks/useToast";

function ProfileSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-surface-elevated border border-line rounded-xl p-6 space-y-4">
        <div className="w-24 h-24 rounded-full bg-surface-subtle mx-auto mt-4"></div>
        <div className="h-6 bg-surface-subtle rounded w-40 mx-auto"></div>
        <div className="h-4 bg-surface-subtle rounded w-32 mx-auto"></div>
      </div>
      <div className="lg:col-span-2 bg-surface-elevated border border-line rounded-xl p-8 space-y-4">
        <div className="h-6 bg-surface-subtle rounded w-36"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 h-10 bg-surface-subtle rounded-lg"></div>
          <div className="h-10 bg-surface-subtle rounded-lg"></div>
          <div className="h-10 bg-surface-subtle rounded-lg"></div>
          <div className="col-span-2 h-32 bg-surface-subtle rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default function CoachProfilePage() {
  const { showToast, ToastEl } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone_number: "", bio: "" });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchWithAuth("profile");
        const personal = data.personal || {};
        setForm({
          name: data.name || data.user?.name || "",
          email: data.email || data.user?.email || "",
          phone_number: personal.phone_number || "",
          bio: personal.bio || "",
        });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchWithAuth("profile", {
        method: "PUT",
        body: JSON.stringify({ user: { name: form.name }, personal: { phone_number: form.phone_number, bio: form.bio } }),
      });
      showToast("Perfil atualizado com sucesso!");
    } catch (error: any) {
      showToast("Erro ao atualizar: " + (error.message || "Tente novamente."), "error");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const inputClass = "w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary placeholder:text-content-tertiary text-sm";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Meu Perfil</h1>
        <p className="text-sm text-content-tertiary mt-0.5">Gerencie suas informações pessoais de apresentação.</p>
      </div>

      {loading ? <ProfileSkeleton /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Card visual */}
          <div className="lg:col-span-1">
            <div className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
              <div className="h-20 bg-content-primary" />
              <div className="px-6 pb-6 flex flex-col items-center -mt-10">
                <div className="w-20 h-20 rounded-full bg-surface-elevated border-4 border-surface-elevated shadow-md flex items-center justify-center text-xl font-bold text-content-primary mb-3">
                  {getInitials(form.name)}
                </div>
                <h2 className="text-lg font-bold text-content-primary text-center">{form.name}</h2>
                <p className="text-sm text-content-tertiary">Coach The Grinders</p>
                <div className="mt-4 w-full">
                  <div className="flex items-center gap-3 text-sm text-content-secondary bg-surface-subtle p-3 rounded-lg">
                    <Mail size={14} className="text-content-muted flex-shrink-0" />
                    <span className="truncate">{form.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-surface-elevated border border-line rounded-xl shadow-sm p-6 md:p-8 space-y-6">

              <div>
                <h3 className="text-base font-bold flex items-center gap-2 text-content-primary mb-4 pb-2 border-b border-line">
                  <User size={17} className="text-brand" /> Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-content-muted uppercase mb-1">Nome Completo</label>
                    <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-content-muted uppercase mb-1">Email</label>
                    <input
                      name="email" value={form.email} disabled
                      className="w-full px-4 py-2.5 border border-line rounded-lg bg-surface-subtle text-content-muted text-sm cursor-not-allowed"
                      title="Email não pode ser alterado"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-content-muted uppercase mb-1 flex items-center gap-1.5">
                      <Phone size={12} /> Telefone / WhatsApp
                    </label>
                    <input name="phone_number" value={form.phone_number} onChange={handleChange} className={inputClass} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-content-muted uppercase mb-1 flex items-center gap-1.5">
                      <FileText size={12} /> Bio / Sobre Mim
                    </label>
                    <textarea
                      name="bio" value={form.bio} onChange={handleChange}
                      className={`${inputClass} h-32 resize-none`}
                      placeholder="Conte um pouco sobre sua experiência, especialidades..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit" disabled={saving}
                  className="bg-brand text-content-on-brand font-bold py-3 px-8 rounded-xl hover:bg-brand-hover transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {ToastEl}
    </div>
  );
}
