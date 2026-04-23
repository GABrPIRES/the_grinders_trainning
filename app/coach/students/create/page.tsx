"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import {
  ArrowLeft, User, Mail, Phone, Lock,
  CreditCard, Save, Loader2, GraduationCap, AlertCircle,
} from "lucide-react";
import Cleave from "cleave.js/react";
import "cleave.js/dist/addons/cleave-phone.br";

interface Plan {
  id: string;
  name: string;
}

export default function AddStudentPage() {
  const router = useRouter();
  const [student, setStudent] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    planoId: "",
  });
  const [plans, setPlans]   = useState<Plan[]>([]);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWithAuth("planos")
      .then(setPlans)
      .catch(err => console.error("Falha ao carregar planos:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setStudent({ ...student, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetchWithAuth("alunos", {
        method: "POST",
        body: JSON.stringify({
          aluno: {
            name:         student.name,
            email:        student.email,
            password:     student.password,
            phone_number: student.phoneNumber,
            plano_id:     student.planoId || null,
          },
        }),
      });
      router.push("/coach/students");
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar aluno.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all text-content-primary bg-surface-app placeholder:text-content-tertiary text-sm";

  const labelClass = "block text-sm font-medium text-content-secondary mb-1";

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Novo Aluno</h1>
          <p className="text-sm text-content-tertiary">Cadastre um aluno para gerenciar seus treinos.</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-elevated border border-line rounded-xl shadow-sm p-6 md:p-8 space-y-8">

        {/* Dados pessoais */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2 border-b border-line pb-3">
            <GraduationCap size={18} className="text-brand" /> Dados Pessoais
          </h2>

          <div>
            <label htmlFor="name" className={labelClass}>Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
              <input
                id="name"
                type="text"
                name="name"
                value={student.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: João da Silva"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={student.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="aluno@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className={labelClass}>WhatsApp / Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
                <Cleave
                  id="phoneNumber"
                  name="phoneNumber"
                  value={student.phoneNumber}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="(11) 99999-9999"
                  options={{ phone: true, phoneRegionCode: "BR" }}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
              <input
                id="password"
                type="password"
                name="password"
                value={student.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <p className="text-xs text-content-muted mt-1.5">O aluno poderá alterar esta senha no primeiro login.</p>
          </div>
        </section>

        {/* Assinatura */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2 border-b border-line pb-3">
            <CreditCard size={18} className="text-brand" /> Assinatura
          </h2>

          <div>
            <label htmlFor="planoId" className={labelClass}>Selecionar Plano</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={16} />
              <select
                id="planoId"
                name="planoId"
                value={student.planoId}
                onChange={handleChange}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Sem plano (apenas cadastro)</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-content-muted mt-1.5">
              Selecionar um plano irá gerar uma assinatura ativa imediatamente.
            </p>
          </div>
        </section>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-brand text-content-on-brand font-bold py-3 px-8 rounded-lg hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Salvando..." : "Cadastrar Aluno"}
          </button>
        </div>
      </form>
    </div>
  );
}
