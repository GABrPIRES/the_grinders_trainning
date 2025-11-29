"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Lock, Shield, Loader2, Check, AlertTriangle } from "lucide-react";

export default function AdminSettingsPage() {
  const [savingPassword, setSavingPassword] = useState(false);
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
        alert("A nova senha e a confirmação não coincidem.");
        return;
    }
    setSavingPassword(true);
    try {
      await fetchWithAuth("auth/change_password", {
        method: "POST",
        body: JSON.stringify(passForm),
      });
      alert("Senha de administrador alterada com sucesso!");
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
        <p className="text-neutral-500 text-sm">Segurança da conta administrativa.</p>
      </div>

      <div className="space-y-6">
        
        {/* SEGURANÇA */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
             <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800">
               <Shield size={20} className="text-red-700" /> Alterar Senha Mestra
             </h2>
             <p className="text-sm text-neutral-500 mt-1">
                Mantenha sua senha forte. Esta conta tem acesso total ao sistema.
             </p>
          </div>
          
          <div className="p-6">
             <form onSubmit={handlePasswordSubmit} className="space-y-4">
                
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-start gap-3 mb-4">
                    <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-yellow-800">
                        Ao alterar a senha, todas as sessões ativas deste administrador podem ser desconectadas por segurança.
                    </p>
                </div>

                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Senha Atual</label>
                   <input 
                     type="password" 
                     name="current_password" 
                     value={passForm.current_password} 
                     onChange={handlePassChange} 
                     className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                     required 
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium mb-1 text-neutral-600">Nova Senha</label>
                       <input 
                         type="password" 
                         name="password" 
                         value={passForm.password} 
                         onChange={handlePassChange} 
                         className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                         required 
                         placeholder="Mínimo 8 caracteres"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-1 text-neutral-600">Confirmar Senha</label>
                       <input 
                         type="password" 
                         name="password_confirmation" 
                         value={passForm.password_confirmation} 
                         onChange={handlePassChange} 
                         className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                         required 
                         placeholder="Repita a senha"
                       />
                    </div>
                </div>
                <button 
                    type="submit" 
                    disabled={savingPassword} 
                    className="mt-4 bg-neutral-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-70 w-full md:w-auto justify-center"
                >
                    {savingPassword ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    Atualizar Credenciais
                </button>
             </form>
          </div>
        </section>

      </div>
    </div>
  );
}