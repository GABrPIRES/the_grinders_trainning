"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import PasswordField from '@/components/PasswordField';
import {
  ArrowLeft, User, Mail, Lock, Phone,
  Save, Loader2, GraduationCap, Shield, ChevronDown, AlertCircle,
} from "lucide-react";

interface Coach {
  id: string;
  user: { name: string };
}

export default function CreateStudentPage() {
  const router = useRouter();
  const { showToast, ToastEl } = useToast();
  const [student, setStudent] = useState({ name: "", email: "", password: "", phone_number: "", personal_id: "" });
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCoaches() {
      try {
        const data = await fetchWithAuth("admin/coaches?limit=100");
        setCoaches(Array.isArray(data) ? data : (data.coaches || []));
      } catch (err) {
        console.error("Erro ao carregar lista de coaches", err);
      }
    }
    loadCoaches();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetchWithAuth("admin/alunos", {
        method: "POST",
        body: JSON.stringify({
          aluno: {
            name: student.name,
            email: student.email,
            password: student.password,
            phone_number: student.phone_number,
            personal_id: student.personal_id || null,
          },
        }),
      });
      showToast("Aluno cadastrado e vinculado com sucesso!");
      router.push("/admin/students");
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar aluno");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary placeholder:text-content-tertiary text-sm";

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Novo Aluno</h1>
          <p className="text-sm text-content-tertiary">Cadastre um aluno e vincule-o a um coach.</p>
        </div>
      </div>

      {error && (
        <div className="bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-elevated border border-line p-6 md:p-8 rounded-xl shadow-sm space-y-6">
        <div className="space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2 text-content-primary border-b border-line pb-3 mb-4">
            <GraduationCap size={18} className="text-brand" /> Dados Cadastrais
          </h2>

          {/* Coach */}
          <div>
            <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Coach Responsável</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
              <select name="personal_id" value={student.personal_id} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                <option value="">Selecione um Coach (Opcional)</option>
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>{coach.user.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" size={15} />
            </div>
            <p className="text-xs text-content-muted mt-1">O aluno aparecerá na lista deste coach imediatamente.</p>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
              <input type="text" name="name" value={student.name} onChange={handleChange} className={inputClass} placeholder="Ex: João da Silva" required />
            </div>
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
                <input type="email" name="email" value={student.email} onChange={handleChange} className={inputClass} placeholder="email@exemplo.com" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
                <input type="text" name="phone_number" value={student.phone_number} onChange={handleChange} className={inputClass} placeholder="(00) 00000-0000" />
              </div>
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-bold text-content-muted uppercase mb-1.5">Senha Inicial</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
              <PasswordField name="password" value={student.password} onChange={handleChange} className={inputClass} placeholder="Mínimo 6 caracteres" required />
            </div>
            <p className="text-xs text-content-muted mt-1">O aluno poderá alterar essa senha no primeiro acesso.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit" disabled={loading}
            className="bg-brand text-content-on-brand font-bold py-3 px-8 rounded-xl hover:bg-brand-hover transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Salvando..." : "Cadastrar Aluno"}
          </button>
        </div>
      </form>
      {ToastEl}
    </div>
  );
}
