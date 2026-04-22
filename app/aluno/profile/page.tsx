"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import {
  User, Save, Loader2, Weight, Ruler, Target,
  Activity, Calendar, Clock, Dumbbell, Trophy, AlertTriangle, Timer
} from "lucide-react";

const inputClass = "w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all text-content-primary bg-surface-app placeholder:text-content-tertiary";

function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 animate-pulse space-y-6 pb-24 md:pb-6">
      <div className="space-y-2">
        <div className="h-8 bg-surface-subtle rounded-lg w-40"></div>
        <div className="h-4 bg-surface-subtle rounded w-72"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="h-64 bg-surface-subtle rounded-xl"></div>
        <div className="lg:col-span-2 h-96 bg-surface-subtle rounded-xl"></div>
      </div>
    </div>
  );
}

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    birth_date: "",
    weight: "",
    height: "",
    lesao: "",
    restricao_medica: "",
    objetivo: "",
    treinos_semana: "",
    tempo_treino: "",
    horario_treino: "",
    pr_supino: "",
    pr_terra: "",
    pr_agachamento: "",
    new_pr_supino: "",
    new_pr_terra: "",
    new_pr_agachamento: "",
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
          new_pr_agachamento: alunoData.new_pr_agachamento || "",
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
            new_pr_agachamento: form.new_pr_agachamento,
          },
        }),
      });
      alert("Perfil atualizado com sucesso!");
    } catch (error: any) {
      alert("Erro ao atualizar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const totalSBD =
    (Number(form.pr_supino) + Number(form.pr_terra) + Number(form.pr_agachamento)) || 0;

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 text-content-primary pb-24 md:pb-6">

      <div>
        <h1 className="text-3xl font-bold text-content-primary">Meu Perfil</h1>
        <p className="text-sm text-content-tertiary mt-1">Mantenha seus dados atualizados para otimizar seus treinos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Cartão do Atleta */}
        <div className="lg:col-span-1">
          <div className="bg-surface-elevated rounded-xl border border-line shadow-sm text-center relative overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-red-800 to-red-600"></div>

            <div className="relative flex flex-col items-center -mt-12 px-6 pb-6">
              <div className="w-24 h-24 rounded-full bg-surface-elevated border-4 border-surface-elevated shadow-lg mb-3 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-surface-subtle flex items-center justify-center text-2xl font-bold text-content-secondary">
                  {getInitials(form.name)}
                </div>
              </div>
              <h2 className="text-xl font-bold text-content-primary">{form.name}</h2>
              <p className="text-sm text-content-tertiary mt-0.5">Atleta</p>

              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                <div className="bg-surface-subtle p-3 rounded-xl border border-line">
                  <p className="text-xs text-content-muted font-bold uppercase">Peso</p>
                  <p className="text-lg font-bold text-content-primary">{form.weight || "—"} <span className="text-xs font-medium">kg</span></p>
                </div>
                <div className="bg-surface-subtle p-3 rounded-xl border border-line">
                  <p className="text-xs text-content-muted font-bold uppercase">SBD Total</p>
                  <p className="text-lg font-bold text-content-primary">{totalSBD} <span className="text-xs font-medium">kg</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-surface-elevated p-6 md:p-8 rounded-xl border border-line shadow-sm space-y-8">

            {/* 1. Dados Pessoais */}
            <section>
              <h2 className="text-lg font-bold flex items-center gap-2 text-content-primary mb-4 pb-2 border-b border-line">
                <User size={20} className="text-brand" /> Dados Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor="name" className="text-sm font-medium text-content-secondary">Nome Completo</label>
                  <input id="name" name="name" value={form.name} onChange={handleChange} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm font-medium text-content-secondary">Email</label>
                  <input id="email" name="email" value={form.email} disabled
                    className="w-full px-4 py-2.5 border border-line rounded-lg bg-surface-subtle text-content-muted cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="phone_number" className="text-sm font-medium text-content-secondary">Telefone</label>
                  <input id="phone_number" name="phone_number" value={form.phone_number} onChange={handleChange}
                    className={inputClass} placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="birth_date" className="text-sm font-medium text-content-secondary flex items-center gap-1.5">
                    <Calendar size={14} /> Nascimento
                  </label>
                  <input id="birth_date" type="date" name="birth_date" value={form.birth_date} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </section>

            {/* 2. Corpo & Saúde */}
            <section>
              <h2 className="text-lg font-bold flex items-center gap-2 text-content-primary mb-4 pb-2 border-b border-line">
                <Activity size={20} className="text-brand" /> Corpo & Saúde
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="weight" className="text-sm font-medium text-content-secondary flex items-center gap-1.5">
                    <Weight size={14} /> Peso (kg)
                  </label>
                  <input id="weight" type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="height" className="text-sm font-medium text-content-secondary flex items-center gap-1.5">
                    <Ruler size={14} /> Altura (m)
                  </label>
                  <input id="height" type="number" step="0.01" name="height" value={form.height} onChange={handleChange} className={inputClass} />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor="lesao" className="text-sm font-medium text-content-secondary">Lesões (Histórico ou Atuais)</label>
                  <textarea id="lesao" name="lesao" value={form.lesao} onChange={handleChange}
                    className={`${inputClass} h-20 resize-none`}
                    placeholder="Ex: Dor no ombro esquerdo ao supinar..." />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor="restricao_medica" className="text-sm font-medium text-content-secondary flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Restrições Médicas
                  </label>
                  <textarea id="restricao_medica" name="restricao_medica" value={form.restricao_medica} onChange={handleChange}
                    className={`${inputClass} h-20 resize-none`}
                    placeholder="Ex: Asma, Hipertensão..." />
                </div>
              </div>
            </section>

            {/* 3. Rotina de Treino */}
            <section>
              <h2 className="text-lg font-bold flex items-center gap-2 text-content-primary mb-4 pb-2 border-b border-line">
                <Dumbbell size={20} className="text-brand" /> Rotina de Treino
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor="objetivo" className="text-sm font-medium text-content-secondary flex items-center gap-1.5">
                    <Target size={14} /> Objetivo Principal
                  </label>
                  <input id="objetivo" name="objetivo" value={form.objetivo} onChange={handleChange}
                    className={inputClass} placeholder="Ex: Ganho de força no agachamento..." />
                </div>
                <div className="space-y-1">
                  <label htmlFor="treinos_semana" className="text-sm font-medium text-content-secondary flex items-center gap-1.5">
                    <Activity size={14} /> Frequência (Dias/Semana)
                  </label>
                  <input id="treinos_semana" type="number" name="treinos_semana" value={form.treinos_semana}
                    onChange={handleChange} className={inputClass} placeholder="Ex: 4" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="tempo_treino" className="text-sm font-medium text-content-secondary flex items-center gap-1.5">
                    <Timer size={14} /> Tempo Disponível (min)
                  </label>
                  <input id="tempo_treino" type="number" name="tempo_treino" value={form.tempo_treino}
                    onChange={handleChange} className={inputClass} placeholder="Ex: 60" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="horario_treino" className="text-sm font-medium text-content-secondary flex items-center gap-1.5">
                    <Clock size={14} /> Horário Preferido (Hora)
                  </label>
                  <input id="horario_treino" type="number" name="horario_treino" value={form.horario_treino}
                    onChange={handleChange} className={inputClass} placeholder="Ex: 18" />
                </div>
              </div>
            </section>

            {/* 4. Performance */}
            <section>
              <h2 className="text-lg font-bold flex items-center gap-2 text-content-primary mb-4 pb-2 border-b border-line">
                <Trophy size={20} className="text-brand" /> Performance (Cargas Máximas)
              </h2>

              <div className="mb-5">
                <p className="text-sm font-medium text-content-secondary mb-3">Recordes Atuais (1RM)</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="pr_agachamento" className="text-xs font-bold text-content-muted uppercase">Agachamento</label>
                    <input id="pr_agachamento" type="number" name="pr_agachamento" value={form.pr_agachamento}
                      onChange={handleChange} className={inputClass} placeholder="kg" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="pr_supino" className="text-xs font-bold text-content-muted uppercase">Supino</label>
                    <input id="pr_supino" type="number" name="pr_supino" value={form.pr_supino}
                      onChange={handleChange} className={inputClass} placeholder="kg" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="pr_terra" className="text-xs font-bold text-content-muted uppercase">Terra</label>
                    <input id="pr_terra" type="number" name="pr_terra" value={form.pr_terra}
                      onChange={handleChange} className={inputClass} placeholder="kg" />
                  </div>
                </div>
              </div>

              <div className="bg-surface-subtle p-4 rounded-xl border border-line">
                <p className="text-sm font-medium text-content-secondary mb-3 flex items-center gap-1.5">
                  <Target size={14} /> Metas / Novos Recordes
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="new_pr_agachamento" className="text-xs font-bold text-content-muted uppercase">Novo Agach.</label>
                    <input id="new_pr_agachamento" type="number" name="new_pr_agachamento" value={form.new_pr_agachamento}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-line bg-surface-app text-content-primary rounded-lg focus:ring-2 focus:ring-semantic-info-text outline-none transition-all placeholder:text-content-tertiary"
                      placeholder="Meta" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="new_pr_supino" className="text-xs font-bold text-content-muted uppercase">Novo Supino</label>
                    <input id="new_pr_supino" type="number" name="new_pr_supino" value={form.new_pr_supino}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-line bg-surface-app text-content-primary rounded-lg focus:ring-2 focus:ring-semantic-info-text outline-none transition-all placeholder:text-content-tertiary"
                      placeholder="Meta" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="new_pr_terra" className="text-xs font-bold text-content-muted uppercase">Novo Terra</label>
                    <input id="new_pr_terra" type="number" name="new_pr_terra" value={form.new_pr_terra}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-line bg-surface-app text-content-primary rounded-lg focus:ring-2 focus:ring-semantic-info-text outline-none transition-all placeholder:text-content-tertiary"
                      placeholder="Meta" />
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-brand text-content-on-brand font-bold py-3 px-8 rounded-lg hover:bg-brand-hover transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
