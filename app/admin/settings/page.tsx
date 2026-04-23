"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Lock, Shield, Loader2, Check, AlertTriangle } from "lucide-react";

export default function AdminSettingsPage() {
  const [savingPassword, setSavingPassword] = useState(false);
  const [passForm, setPassForm] = useState({ current_password: "", password: "", password_confirmation: "" });

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassForm({ ...passForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.password !== passForm.password_confirmation) {
      alert("A nova senha e a confirmação não coincidem.");
      return;
    }
    setSavingPassword(true);
    try {
      await fetchWithAuth("auth/change_password", { method: "POST", body: JSON.stringify(passForm) });
      alert("Senha de administrador alterada com sucesso!");
      setPassForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (error: any) {
      alert("Erro ao alterar senha: " + error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary text-sm";

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-content-primary pb-24 md:pb-6">

      <div>
        <h1 className="text-2xl font-bold text-content-primary">Configurações</h1>
        <p className="text-sm text-content-tertiary">Segurança da conta administrativa.</p>
      </div>

      {/* Segurança */}
      <section className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-page">
          <h2 className="text-base font-bold flex items-center gap-2 text-content-primary">
            <Shield size={17} className="text-brand" /> Alterar Senha Mestra
          </h2>
          <p className="text-sm text-content-tertiary mt-0.5">
            Mantenha sua senha forte. Esta conta tem acesso total ao sistema.
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">

            <div className="bg-semantic-warning-bg border border-semantic-warning-border rounded-xl p-3 flex items-start gap-3 mb-4">
              <AlertTriangle className="text-semantic-warning-text shrink-0 mt-0.5" size={17} />
              <p className="text-xs text-semantic-warning-text">
                Ao alterar a senha, todas as sessões ativas deste administrador podem ser desconectadas por segurança.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Senha Atual</label>
              <input type="password" name="current_password" value={passForm.current_password} onChange={handlePassChange} className={inputClass} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Nova Senha</label>
                <input type="password" name="password" value={passForm.password} onChange={handlePassChange} className={inputClass} required placeholder="Mínimo 8 caracteres" />
              </div>
              <div>
                <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Confirmar Senha</label>
                <input type="password" name="password_confirmation" value={passForm.password_confirmation} onChange={handlePassChange} className={inputClass} required placeholder="Repita a senha" />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="submit" disabled={savingPassword}
                className="bg-brand text-content-on-brand font-bold py-3 px-8 rounded-xl hover:bg-brand-hover transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center"
              >
                {savingPassword ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                Atualizar Credenciais
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
