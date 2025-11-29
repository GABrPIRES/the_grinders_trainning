"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Lock, Bell, Shield, Loader2, Check } from "lucide-react";

export default function StudentSettingsPage() {
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
        alert("As senhas não coincidem.");
        return;
    }
    setSavingPassword(true);
    try {
      await fetchWithAuth("auth/change_password", {
        method: "POST",
        body: JSON.stringify(passForm),
      });
      alert("Senha atualizada com sucesso!");
      setPassForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (error: any) {
      alert("Erro ao alterar senha: " + error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-neutral-800 pb-20 md:pb-0">
      
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Configurações</h1>
        <p className="text-neutral-500 text-sm">Segurança da conta e preferências.</p>
      </div>

      <div className="space-y-6">
        
        {/* SEGURANÇA */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
             <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800">
               <Shield size={20} className="text-red-700" /> Alterar Senha
             </h2>
          </div>
          
          <div className="p-6">
             <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Senha Atual</label>
                   <input type="password" name="current_password" value={passForm.current_password} onChange={handlePassChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium mb-1 text-neutral-600">Nova Senha</label>
                       <input type="password" name="password" value={passForm.password} onChange={handlePassChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" required />
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-1 text-neutral-600">Confirmar Senha</label>
                       <input type="password" name="password_confirmation" value={passForm.password_confirmation} onChange={handlePassChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" required />
                    </div>
                </div>
                <button type="submit" disabled={savingPassword} className="mt-2 bg-neutral-900 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-70 w-full md:w-auto justify-center">
                    {savingPassword ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    Atualizar Senha
                </button>
             </form>
          </div>
        </section>

        {/* NOTIFICAÇÕES (Visual) */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-700 rounded-lg"><Bell size={20}/></div>
                <div>
                    <p className="font-semibold text-neutral-800">Notificações de Treino</p>
                    <p className="text-xs text-neutral-500">Receba lembretes e mensagens do coach (Em breve).</p>
                </div>
            </div>
            <button onClick={() => setNotifications(!notifications)} className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${notifications ? 'bg-red-700' : 'bg-neutral-300'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
        </section>

      </div>
    </div>
  );
}