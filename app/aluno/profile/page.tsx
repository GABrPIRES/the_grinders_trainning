"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { 
  User, Save, Loader2, Weight, Ruler, Target, 
  Activity, Calendar, Clock, Dumbbell, Trophy, AlertTriangle, Timer
} from "lucide-react";

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    // User
    name: "",
    email: "",
    // Aluno - Pessoal
    phone_number: "",
    birth_date: "",
    // Aluno - Físico
    weight: "",
    height: "",
    lesao: "",
    restricao_medica: "",
    // Aluno - Treino
    objetivo: "",
    treinos_semana: "",
    tempo_treino: "",   // integer
    horario_treino: "", // integer
    // Aluno - PRs Atuais
    pr_supino: "",
    pr_terra: "",
    pr_agachamento: "",
    // Aluno - Novos PRs (Metas ou Recentes)
    new_pr_supino: "",
    new_pr_terra: "",
    new_pr_agachamento: ""
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchWithAuth("profile");
        
        const userName = data.name || data.user?.name || "";
        const userEmail = data.email || data.user?.email || "";
        const alunoData = data.aluno || {};

        setForm({
          name: userName,
          email: userEmail,
          phone_number: alunoData.phone_number || "",
          birth_date: alunoData.birth_date ? String(alunoData.birth_date).split('T')[0] : "",
          
          weight: alunoData.weight || "",
          height: alunoData.height || "",
          lesao: alunoData.lesao || "",
          restricao_medica: alunoData.restricao_medica || "",
          
          objetivo: alunoData.objetivo || "",
          treinos_semana: alunoData.treinos_semana || "",
          tempo_treino: alunoData.tempo_treino || "",
          horario_treino: alunoData.horario_treino || "",
          
          pr_supino: alunoData.pr_supino || "",
          pr_terra: alunoData.pr_terra || "",
          pr_agachamento: alunoData.pr_agachamento || "",
          
          new_pr_supino: alunoData.new_pr_supino || "",
          new_pr_terra: alunoData.new_pr_terra || "",
          new_pr_agachamento: alunoData.new_pr_agachamento || ""
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
            user: { name: form.name },
            aluno: { 
                phone_number: form.phone_number,
                birth_date: form.birth_date,
                
                weight: form.weight,
                height: form.height,
                lesao: form.lesao,
                restricao_medica: form.restricao_medica,
                
                objetivo: form.objetivo,
                treinos_semana: form.treinos_semana,
                tempo_treino: form.tempo_treino,
                horario_treino: form.horario_treino,
                
                pr_supino: form.pr_supino,
                pr_terra: form.pr_terra,
                pr_agachamento: form.pr_agachamento,
                
                new_pr_supino: form.new_pr_supino,
                new_pr_terra: form.new_pr_terra,
                new_pr_agachamento: form.new_pr_agachamento
            }
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
    <div className="max-w-6xl mx-auto space-y-6 text-neutral-800 pb-20 md:pb-0">
      
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Meu Perfil</h1>
        <p className="text-neutral-500 text-sm">Mantenha seus dados atualizados para otimizar seus treinos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: CARTÃO DO ATLETA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-red-800 to-red-600 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center mt-8">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mb-3">
                 <div className="w-full h-full rounded-full bg-neutral-100 flex items-center justify-center text-2xl font-bold text-neutral-700">
                    {getInitials(form.name)}
                 </div>
              </div>
              <h2 className="text-xl font-bold text-neutral-900">{form.name}</h2>
              <p className="text-sm text-neutral-500">Atleta</p>
              
              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                 <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                    <p className="text-xs text-neutral-500 uppercase font-bold">Peso</p>
                    <p className="text-lg font-bold text-neutral-800">{form.weight || "-"} kg</p>
                 </div>
                 <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                    <p className="text-xs text-neutral-500 uppercase font-bold">Total (SBD)</p>
                    <p className="text-lg font-bold text-neutral-800">
                       {(Number(form.pr_supino) + Number(form.pr_terra) + Number(form.pr_agachamento)) || 0} kg
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl border border-neutral-200 shadow-sm space-y-8">
            
            {/* 1. DADOS PESSOAIS */}
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-800 mb-4 border-b pb-2">
                <User size={20} className="text-red-700"/> Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-neutral-600">Nome Completo</label>
                  <input name="name" value={form.name} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Email</label>
                   <input name="email" value={form.email} disabled className="w-full border border-neutral-200 bg-neutral-50 text-neutral-400 p-2.5 rounded-lg cursor-not-allowed" />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Telefone</label>
                   <input name="phone_number" value={form.phone_number} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="(00) 00000-0000"/>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Calendar size={14}/> Nascimento</label>
                   <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"/>
                </div>
              </div>
            </div>

            {/* 2. CORPO & SAÚDE */}
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-800 mb-4 border-b pb-2">
                <Activity size={20} className="text-red-700"/> Corpo & Saúde
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Weight size={14}/> Peso (kg)</label>
                  <input type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Ruler size={14}/> Altura (m)</label>
                  <input type="number" step="0.01" name="height" value={form.height} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Lesões (Histórico ou Atuais)</label>
                   <textarea name="lesao" value={form.lesao} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-20 resize-none" placeholder="Ex: Dor no ombro esquerdo ao supinar..."/>
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><AlertTriangle size={14}/> Restrições Médicas</label>
                   <textarea name="restricao_medica" value={form.restricao_medica} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-20 resize-none" placeholder="Ex: Asma, Hipertensão..."/>
                </div>
              </div>
            </div>

            {/* 3. ROTINA DE TREINO */}
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-800 mb-4 border-b pb-2">
                <Dumbbell size={20} className="text-red-700"/> Rotina de Treino
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Target size={14}/> Objetivo Principal</label>
                   <input name="objetivo" value={form.objetivo} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Ex: Ganho de força no agachamento..."/>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Activity size={14}/> Frequência (Dias/Semana)</label>
                   <input type="number" name="treinos_semana" value={form.treinos_semana} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Ex: 4"/>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Timer size={14}/> Tempo Disponível (min)</label>
                   <input type="number" name="tempo_treino" value={form.tempo_treino} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Ex: 60"/>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Clock size={14}/> Horário Preferido (Hora)</label>
                   <input type="number" name="horario_treino" value={form.horario_treino} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Ex: 18"/>
                </div>
              </div>
            </div>

            {/* 4. PERFORMANCE (PRs) */}
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-800 mb-4 border-b pb-2">
                <Trophy size={20} className="text-red-700"/> Performance (Cargas Máximas)
              </h3>
              
              {/* PRs Atuais */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-neutral-600 mb-3">Recordes Atuais (1RM)</p>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Agachamento</label>
                        <input type="number" name="pr_agachamento" value={form.pr_agachamento} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="kg" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Supino</label>
                        <input type="number" name="pr_supino" value={form.pr_supino} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="kg" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Terra</label>
                        <input type="number" name="pr_terra" value={form.pr_terra} onChange={handleChange} className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="kg" />
                    </div>
                </div>
              </div>

              {/* Novos PRs / Metas */}
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                <p className="text-sm font-semibold text-neutral-600 mb-3 flex items-center gap-2"><Target size={14}/> Metas / Novos Recordes</p>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Novo Agach.</label>
                        <input type="number" name="new_pr_agachamento" value={form.new_pr_agachamento} onChange={handleChange} className="w-full border border-neutral-200 bg-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Meta" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Novo Supino</label>
                        <input type="number" name="new_pr_supino" value={form.new_pr_supino} onChange={handleChange} className="w-full border border-neutral-200 bg-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Meta" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Novo Terra</label>
                        <input type="number" name="new_pr_terra" value={form.new_pr_terra} onChange={handleChange} className="w-full border border-neutral-200 bg-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Meta" />
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
      </div>
    </div>
  );
}