"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import {
  ArrowLeft, Save, Loader2, Lock, User,
  Mail, Phone, CreditCard, AlertCircle,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EditSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-surface-subtle rounded-lg flex-shrink-0"></div>
        <div className="h-7 bg-surface-subtle rounded-lg w-56"></div>
      </div>
      <div className="bg-surface-elevated border border-line rounded-xl p-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-11 bg-surface-subtle rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EditStudentAccountPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [plans, setPlans]       = useState<Plan[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
    plano_id: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [studentData, plansData] = await Promise.all([
          fetchWithAuth(`alunos/${id}`),
          fetchWithAuth("planos"),
        ]);
        setForm(prev => ({
          ...prev,
          name:         studentData.user.name         || "",
          email:        studentData.user.email        || "",
          phone_number: studentData.phone_number      || "",
          plano_id:     studentData.current_plano_id  || "",
        }));
        setPlans(Array.isArray(plansData) ? plansData : []);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password && form.password !== form.password_confirmation) {
      setError("As senhas não coincidem.");
      return;
    }
    setSaving(true);
    try {
      await fetchWithAuth(`alunos/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          aluno: {
            name:                  form.name,
            email:                 form.email,
            phone_number:          form.phone_number,
            password:              form.password,
            password_confirmation: form.password_confirmation,
            plano_id:              form.plano_id,
          },
        }),
      });
      router.push(`/coach/students/${id}`);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all text-content-primary bg-surface-app placeholder:text-content-tertiary text-sm";

  const labelClass = "block text-sm font-medium text-content-secondary mb-1";

  if (loading) return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <EditSkeleton />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 pb-24 md:pb-6 text-content-primary">

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
          <h1 className="text-2xl font-bold text-content-primary">Editar Conta do Aluno</h1>
          <p className="text-sm text-content-tertiary">Altere os dados de acesso e plano.</p>
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

        {/* Informações básicas */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2 border-b border-line pb-3">
            <User size={17} className="text-brand" /> Informações Básicas
          </h2>

          <div>
            <label htmlFor="name" className={labelClass}>Nome Completo</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className={labelClass}>
                <span className="flex items-center gap-1.5"><Mail size={13} /> Email</span>
              </label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            <div>
              <label htmlFor="phone_number" className={labelClass}>
                <span className="flex items-center gap-1.5"><Phone size={13} /> Telefone</span>
              </label>
              <input
                id="phone_number"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                className={inputClass}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </section>

        {/* Plano & assinatura */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2 border-b border-line pb-3">
            <CreditCard size={17} className="text-brand" /> Plano & Assinatura
          </h2>
          <div>
            <label htmlFor="plano_id" className={labelClass}>Plano Atual</label>
            <select
              id="plano_id"
              name="plano_id"
              value={form.plano_id}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="">Sem plano ativo</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
            <p className="text-xs text-content-muted mt-1.5">
              Ao alterar o plano, uma nova assinatura será criada iniciando hoje.
            </p>
          </div>
        </section>

        {/* Segurança */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2 border-b border-line pb-3">
            <Lock size={17} className="text-brand" /> Segurança
          </h2>

          <div className="bg-semantic-warning-bg border border-semantic-warning-border text-semantic-warning-text text-xs p-3 rounded-lg">
            Preencha abaixo apenas se quiser alterar a senha do aluno.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className={labelClass}>Nova Senha</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label htmlFor="password_confirmation" className={labelClass}>Confirmar Senha</label>
              <input
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                className={inputClass}
                placeholder="Repita a senha"
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand text-content-on-brand font-bold py-3 px-6 rounded-lg hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
}
