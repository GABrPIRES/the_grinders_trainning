"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, User, Mail, Lock, Phone, Save, Loader2, GraduationCap } from "lucide-react";

export default function CreateStudentPage() {
  const [student, setStudent] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
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
            ...student,
            role: "aluno",
          },
        }),
      });

      alert("Aluno cadastrado com sucesso!");
      router.push("/admin/students"); // Ajuste se sua rota for /admin/alunos
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar aluno");
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
          <h1 className="text-2xl font-bold text-neutral-900">Novo Aluno</h1>
          <p className="text-neutral-500 text-sm">Cadastre um novo aluno na plataforma.</p>
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
               <GraduationCap size={20} className="text-red-700"/> Dados do Aluno
            </h2>

            <div>
               <label className="block text-sm font-medium mb-1 text-neutral-600">Nome Completo</label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={student.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    placeholder="Ex: João da Silva"
                    required
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Email</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={student.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        placeholder="email@exemplo.com"
                        required
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Telefone / WhatsApp</label>
                   <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="text"
                        name="phone_number"
                        value={student.phone_number}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        placeholder="(00) 00000-0000"
                      />
                   </div>
                </div>
            </div>

            <div>
               <label className="block text-sm font-medium mb-1 text-neutral-600">Senha Inicial</label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={student.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
               </div>
               <p className="text-xs text-neutral-400 mt-1">O aluno poderá alterar essa senha no primeiro acesso.</p>
            </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-neutral-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-black transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 w-full md:w-auto justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Salvando..." : "Cadastrar Aluno"}
          </button>
        </div>

      </form>
    </div>
  );
}