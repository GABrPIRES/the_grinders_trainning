"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { 
  User, Mail, Save, Loader2, ShieldCheck, 
  LayoutDashboard
} from "lucide-react";

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "" // Apenas para visualização
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchWithAuth("profile");
        // O Admin pega os dados direto da raiz ou de user
        const userName = data.name || data.user?.name || "";
        const userEmail = data.email || data.user?.email || "";
        const userRole = data.role || data.user?.role || "Admin";

        setForm({
          name: userName,
          email: userEmail,
          role: userRole
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
      // Admin só atualiza o próprio nome na tabela users
      await fetchWithAuth("profile", {
        method: "PUT",
        body: JSON.stringify({ 
            user: { name: form.name }
        }),
      });
      alert("Perfil atualizado com sucesso!");
    } catch (error: any) {
      alert("Erro ao atualizar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando perfil...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-neutral-800 pb-20 md:pb-0">
      
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Perfil Administrativo</h1>
        <p className="text-neutral-500 text-sm">Gerencie suas credenciais de acesso.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: CARTÃO DO ADMIN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm text-center relative overflow-hidden">
            {/* Banner Preto para Admin */}
            <div className="absolute top-0 left-0 w-full h-24 bg-neutral-900 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center mt-8">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mb-3">
                 <div className="w-full h-full rounded-full bg-neutral-100 flex items-center justify-center text-2xl font-bold text-neutral-800">
                    {getInitials(form.name)}
                 </div>
              </div>
              <h2 className="text-xl font-bold text-neutral-900">{form.name}</h2>
              <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold uppercase mt-1">
                 <ShieldCheck size={12} /> Administrador
              </div>
              
              <div className="mt-6 w-full text-left bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                 <p className="text-xs text-neutral-500 uppercase font-bold mb-2">Permissões</p>
                 <ul className="space-y-2 text-sm text-neutral-700">
                    <li className="flex items-center gap-2"><LayoutDashboard size={14} className="text-neutral-400"/> Acesso Total ao Painel</li>
                    <li className="flex items-center gap-2"><User size={14} className="text-neutral-400"/> Gestão de Usuários</li>
                 </ul>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl border border-neutral-200 shadow-sm space-y-8">
            
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-800 mb-4 border-b pb-2">
                <User size={20} className="text-red-700"/> Dados da Conta
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-600">Nome de Exibição</label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Email de Acesso</label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                     <input 
                        name="email" 
                        value={form.email} 
                        disabled 
                        className="w-full border border-neutral-200 bg-neutral-50 text-neutral-500 p-2.5 pl-10 rounded-lg cursor-not-allowed" 
                        title="O email de administrador não pode ser alterado por aqui"
                     />
                   </div>
                   <p className="text-xs text-neutral-400 mt-1">Para alterar o email mestre, contate o suporte técnico.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-neutral-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-black transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 w-full md:w-auto justify-center"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}