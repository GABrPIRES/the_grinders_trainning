"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { 
  User, Mail, Phone, Save, Loader2, Briefcase
} from "lucide-react";

export default function CoachProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    bio: ""
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchWithAuth("profile");
        
        // Lógica segura para pegar o nome (da raiz ou aninhado)
        const userName = data.name || data.user?.name || "";
        const userEmail = data.email || data.user?.email || "";
        
        // Dados do Personal
        const personal = data.personal || {};

        setForm({
          name: userName,
          email: userEmail,
          phone_number: personal.phone_number || "",
          bio: personal.bio || ""
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
        body: JSON.stringify({ 
            // Envia o User separado
            user: { 
                name: form.name 
            },
            // Envia o Personal separado
            personal: { 
                phone_number: form.phone_number,
                bio: form.bio
            }
        }),
      });
      alert("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error(error);
      alert("Erro ao atualizar: " + (error.message || "Tente novamente."));
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando perfil...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-neutral-800 pb-20 md:pb-0">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Meu Perfil</h1>
        <p className="text-neutral-500 text-sm">Gerencie suas informações pessoais de apresentação.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA (Cartão Visual) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-neutral-900 to-neutral-800 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center mt-8">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mb-3">
                 <div className="w-full h-full rounded-full bg-neutral-100 flex items-center justify-center text-2xl font-bold text-neutral-700">
                    {getInitials(form.name)}
                 </div>
              </div>
              
              <h2 className="text-xl font-bold text-neutral-900">{form.name}</h2>
              <p className="text-sm text-neutral-500">Coach The Grinders</p>
              
              <div className="mt-6 w-full space-y-3 text-left">
                 <div className="flex items-center gap-3 text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                    <Mail size={16} />
                    <span className="truncate">{form.email}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (Formulário) */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl border border-neutral-200 shadow-sm space-y-8">
            
            {/* DADOS PESSOAIS */}
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-800 mb-4 border-b pb-2">
                <User size={20} className="text-red-700"/> Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-neutral-600">Nome Completo</label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Email</label>
                   <input 
                     name="email" 
                     value={form.email} 
                     disabled 
                     className="w-full border border-neutral-200 bg-neutral-50 text-neutral-400 p-2.5 rounded-lg cursor-not-allowed" 
                     title="Email não pode ser alterado"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Telefone / WhatsApp</label>
                   <input 
                     name="phone_number" 
                     value={form.phone_number} 
                     onChange={handleChange} 
                     className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                     placeholder="(00) 00000-0000"
                   />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-neutral-600">Bio / Sobre Mim</label>
                  <textarea 
                    name="bio" 
                    value={form.bio} 
                    onChange={handleChange} 
                    className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-32 resize-none" 
                    placeholder="Conte um pouco sobre sua experiência, especialidades..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-red-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70"
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