"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, User, Mail, Lock, Save, Loader2, ToggleLeft, GraduationCap } from "lucide-react";

export default function EditStudentPage() {
  const router = useRouter();
  const { id } = useParams(); // Esse ID pode ser user_id ou aluno_id, o backend agora trata os dois
  
  const [student, setStudent] = useState({
    name: "",
    email: "",
    password: "",
    status: "ativo",
    phone_number: "", // Se quiser editar telefone também
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        // CORREÇÃO: Usa a rota de admin que preparamos
        const data = await fetchWithAuth(`admin/alunos/${id}`);
        setStudent({
          name: data.name || "",
          email: data.email || "",
          password: "",
          status: data.status || "ativo",
          phone_number: data.phone_number || ""
        });
      } catch (err: any) {
        setError("Erro ao carregar dados do aluno");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
  
    try {
      // CORREÇÃO: Envia para admin/alunos com a chave 'aluno'
      await fetchWithAuth(`admin/alunos/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ 
            aluno: {
                name: student.name,
                email: student.email,
                password: student.password, // Se vazio, backend ignora
                status: student.status,
                phone_number: student.phone_number
            } 
        }),
      });
  
      alert("Dados atualizados com sucesso!");
      router.push("/admin/students");
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando dados...</div>;

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
          <h1 className="text-2xl font-bold text-neutral-900">Editar Aluno</h1>
          <p className="text-neutral-500 text-sm">Gerencie o acesso e status da conta.</p>
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
               <GraduationCap size={20} className="text-red-700"/> Conta do Aluno
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
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all text-neutral-800"
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium mb-1 text-neutral-600">Email</label>
               <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={student.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all text-neutral-800"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Status</label>
                   <div className="relative">
                      <ToggleLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <select
                        name="status"
                        value={student.status}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white appearance-none cursor-pointer text-neutral-800"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Resetar Senha</label>
                   <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="password"
                        name="password"
                        value={student.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all text-neutral-800"
                        placeholder="Deixe vazio para manter"
                      />
                   </div>
                </div>
            </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-red-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 w-full md:w-auto justify-center"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>

      </form>
    </div>
  );
}