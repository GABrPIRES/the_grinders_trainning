"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, User, Mail, Lock, Save, Loader2, ShieldCheck } from "lucide-react";

export default function CreateCoachPage() {
  const [coach, setCoach] = useState({
    name: "",
    email: "",
    password: "",
  });
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
        body: JSON.stringify({
          user: {
            ...coach,
            role: "personal",
          },
        }),
      });

      alert("Coach cadastrado com sucesso!");
      router.push("/admin/coaches");
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar coach");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Novo Coach</h1>
          <p className="text-neutral-500 text-sm">Cadastre um profissional para gerenciar alunos.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl border border-neutral-200 shadow-sm space-y-6">
        
        <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800 border-b border-neutral-100 pb-2 mb-4">
               <ShieldCheck size={20} className="text-red-700"/> Dados de Acesso
            </h2>

            <div>
               <label className="block text-sm font-medium mb-1 text-neutral-600">Nome Completo</label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={coach.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all text-neutral-800"
                    placeholder="Ex: Carlos Silva"
                    required
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium mb-1 text-neutral-600">Email Profissional</label>
               <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={coach.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all text-neutral-800"
                    placeholder="Ex: carlos@thegrinders.com"
                    required
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium mb-1 text-neutral-600">Senha Inicial</label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={coach.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all text-neutral-800"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
               </div>
               <p className="text-xs text-neutral-400 mt-1">O coach poderá alterar essa senha depois.</p>
            </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 w-full md:w-auto justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Salvando..." : "Cadastrar Coach"}
          </button>
        </div>

      </form>
    </div>
  );
}