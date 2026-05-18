"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Shield, Loader2, Check, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import PushNotificationToggle from "@/components/settings/PushNotificationToggle";
import PasswordField from '@/components/PasswordField';

export default function StudentSettingsPage() {
  const { showToast, ToastEl } = useToast();
  const [savingPassword, setSavingPassword] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [passForm, setPassForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: ""
  });

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassForm({ ...passForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.password !== passForm.password_confirmation) {
      showToast("As senhas não coincidem.", "error");
      return;
    }
    setSavingPassword(true);
    try {
      await fetchWithAuth("auth/change_password", {
        method: "POST",
        body: JSON.stringify(passForm),
      });
      showToast("Senha atualizada com sucesso!");
      setPassForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (error: any) {
      showToast("Erro ao alterar senha: " + error.message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass = "w-full border border-line-input bg-surface-elevated text-content-primary placeholder:text-content-muted p-2.5 rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all";

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-content-primary pb-20 md:pb-0">

      <div>
        <h1 className="text-2xl font-bold text-content-primary">Configurações</h1>
        <p className="text-content-tertiary text-sm">Segurança da conta e preferências.</p>
      </div>

      <div className="space-y-6">

        {/* SEGURANÇA */}
        <section className="bg-surface-elevated rounded-xl border border-line shadow-sm overflow-hidden">
          <div className="p-6 border-b border-line bg-surface-subtle">
             <h2 className="text-lg font-bold flex items-center gap-2 text-content-primary">
               <Shield size={20} className="text-brand" /> Alterar Senha
             </h2>
          </div>

          <div className="p-6">
             <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium mb-1 text-content-secondary">Senha Atual</label>
                   <PasswordField name="current_password" value={passForm.current_password} onChange={handlePassChange} className={inputClass} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium mb-1 text-content-secondary">Nova Senha</label>
                       <PasswordField name="password" value={passForm.password} onChange={handlePassChange} className={inputClass} required />
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-1 text-content-secondary">Confirmar Senha</label>
                       <PasswordField name="password_confirmation" value={passForm.password_confirmation} onChange={handlePassChange} className={inputClass} required />
                    </div>
                </div>
                <button type="submit" disabled={savingPassword} className="mt-2 bg-brand text-content-on-brand font-bold py-2.5 px-6 rounded-lg hover:bg-brand-hover transition-colors flex items-center gap-2 disabled:opacity-70 w-full md:w-auto justify-center">
                    {savingPassword ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    Atualizar Senha
                </button>
             </form>
          </div>
        </section>

        {/* NOTIFICAÇÕES */}
        <section className="bg-surface-elevated rounded-xl border border-line shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-line bg-surface-page">
            <h2 className="text-base font-bold flex items-center gap-2 text-content-primary">
              <Smartphone size={17} className="text-brand" /> Notificações no Celular
            </h2>
            <p className="text-sm text-content-tertiary mt-0.5">
              Receba alertas de treinos publicados e formulários mesmo com o app fechado.
            </p>
          </div>
          <div className="p-6">
            <PushNotificationToggle />
          </div>
        </section>

      </div>
      {ToastEl}
    </div>
  );
}
