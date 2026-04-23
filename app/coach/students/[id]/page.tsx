"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import {
  ArrowLeft, User, Mail, Phone, Calendar,
  Activity, AlertCircle, Dumbbell, Trophy, Edit, CreditCard,
} from "lucide-react";

interface StudentDetails {
  id: string;
  birth_date: string;
  phone_number: string;
  weight: number;
  height: number;
  objetivo: string;
  lesao: string;
  restricao_medica: string;
  treinos_semana: number;
  tempo_treino: string;
  horario_treino: string;
  pr_supino: number;
  pr_terra: number;
  pr_agachamento: number;
  user: { name: string; email: string };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StudentSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center gap-4 pb-6 border-b border-line">
        <div className="w-10 h-10 bg-surface-subtle rounded-lg flex-shrink-0"></div>
        <div className="space-y-2">
          <div className="h-7 bg-surface-subtle rounded-lg w-52"></div>
          <div className="h-4 bg-surface-subtle rounded w-40"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-44 bg-surface-subtle rounded-xl"></div>
        ))}
        <div className="md:col-span-2 lg:col-span-3 h-28 bg-surface-subtle rounded-xl"></div>
      </div>
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="flex justify-between items-center border-b border-line pb-2.5 last:border-0 last:pb-0">
      <span className="text-content-muted flex items-center gap-2 text-sm">{icon} {label}</span>
      <span className="font-bold text-content-primary text-sm">{value}</span>
    </li>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentDetailsPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchWithAuth(`alunos/${id}`)
      .then(setStudent)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—";

  const calcAge = (d: string) => {
    if (!d) return "—";
    const birth = new Date(d);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} anos`;
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <StudentSkeleton />
    </div>
  );

  if (notFound || !student) return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="bg-surface-elevated border border-line rounded-xl shadow-sm p-12 text-center flex flex-col items-center">
        <AlertCircle size={48} className="text-semantic-error-text mb-4" />
        <h3 className="text-lg font-bold text-content-primary mb-1">Aluno não encontrado</h3>
        <p className="text-sm text-content-tertiary">Verifique o link ou volte para a lista.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-line pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/coach/students")}
            className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary"
            aria-label="Voltar"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-content-primary">{student.user.name}</h1>
            <div className="flex items-center gap-2 text-content-tertiary mt-0.5 text-sm">
              <Mail size={14} />
              <span>{student.user.email}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => router.push(`/coach/payments/${student.id}`)}
            className="flex-1 md:flex-none px-4 py-2 bg-surface-elevated border border-line rounded-lg font-bold text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors text-sm"
          >
            Financeiro
          </button>
          <button
            onClick={() => router.push(`/coach/students/${student.id}/edit`)}
            className="flex-1 md:flex-none px-4 py-2 bg-brand text-content-on-brand rounded-lg font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Edit size={15} /> Editar Conta
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Dados pessoais */}
        <div className="bg-surface-elevated border border-line rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-content-primary flex items-center gap-2 mb-4 border-b border-line pb-3">
            <User size={16} className="text-brand" /> Dados Pessoais
          </h2>
          <ul className="space-y-2.5">
            <InfoRow icon={<Phone size={14} />}    label="Telefone"    value={student.phone_number || "—"} />
            <InfoRow icon={<Calendar size={14} />} label="Nascimento"  value={formatDate(student.birth_date)} />
            <InfoRow icon={<Activity size={14} />} label="Idade"       value={calcAge(student.birth_date)} />
          </ul>
        </div>

        {/* Corpo & saúde */}
        <div className="bg-surface-elevated border border-line rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-content-primary flex items-center gap-2 mb-4 border-b border-line pb-3">
            <Activity size={16} className="text-brand" /> Corpo & Saúde
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-surface-subtle rounded-lg p-3 text-center">
              <p className="text-xs text-content-muted font-bold uppercase mb-1">Peso</p>
              <p className="font-bold text-content-primary text-lg">
                {student.weight ? `${student.weight} kg` : "—"}
              </p>
            </div>
            <div className="bg-surface-subtle rounded-lg p-3 text-center">
              <p className="text-xs text-content-muted font-bold uppercase mb-1">Altura</p>
              <p className="font-bold text-content-primary text-lg">
                {student.height ? `${student.height} m` : "—"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-content-muted font-bold uppercase mb-1">Lesões / Restrições</p>
            <p className="text-sm text-content-secondary">
              {student.lesao || student.restricao_medica || "Nenhuma relatada"}
            </p>
          </div>
        </div>

        {/* Treino */}
        <div className="bg-surface-elevated border border-line rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-content-primary flex items-center gap-2 mb-4 border-b border-line pb-3">
            <Dumbbell size={16} className="text-brand" /> Treino
          </h2>
          <ul className="space-y-2.5">
            <InfoRow icon={<AlertCircle size={14} />} label="Objetivo"   value={student.objetivo || "—"} />
            <InfoRow icon={<Activity size={14} />}    label="Frequência" value={student.treinos_semana ? `${student.treinos_semana}×/sem` : "—"} />
            <InfoRow icon={<Calendar size={14} />}    label="Horário"    value={student.horario_treino || "—"} />
          </ul>
        </div>

        {/* PRs */}
        <div className="md:col-span-2 lg:col-span-3 bg-surface-elevated border border-line rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-content-primary flex items-center gap-2 mb-4 border-b border-line pb-3">
            <Trophy size={16} className="text-semantic-warning-text" /> Recordes Pessoais
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Agachamento", value: student.pr_agachamento },
              { label: "Supino",      value: student.pr_supino      },
              { label: "Terra",       value: student.pr_terra       },
            ].map(pr => (
              <div key={pr.label} className="bg-surface-subtle rounded-xl p-4">
                <p className="text-[10px] font-bold text-content-muted uppercase tracking-wide mb-1">{pr.label}</p>
                <p className="text-2xl font-bold text-content-primary">{pr.value || 0}</p>
                <p className="text-xs text-content-muted">kg</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
