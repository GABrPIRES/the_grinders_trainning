"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Dumbbell,
  Calendar,
  CreditCard,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { parseISO, isWithinInterval } from "date-fns";
import WeeklyFeedbackModal from "@/components/modals/WeeklyFeedbackModal";

interface DashboardData {
  student_name: string;
  status_financeiro: 'ativo' | 'vencido' | 'inativo';
  plano_nome: string;
  vencimento: string | null;
  active_block: { title: string; id: string } | null;
  current_week: { number: number; start_date: string; end_date: string; id: string } | null;
  next_workout: { id: string; name: string; day: string } | null;
  treinos_concluidos: number;
}

interface PendingFeedback {
  pending: boolean;
  week_id?: string;
}

function ShortcutCard({ title, subtitle, icon, href, accentClass, router }: any) {
  return (
    <button
      onClick={() => router.push(href)}
      className={`flex items-center p-4 bg-surface-elevated border border-line rounded-xl shadow-sm hover:shadow-md transition-all text-left group ${accentClass}`}
    >
      <div className="p-3 rounded-full bg-surface-subtle group-hover:bg-surface-elevated transition-colors flex-shrink-0">
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="font-bold text-content-primary">{title}</h3>
        <p className="text-xs text-content-tertiary">{subtitle}</p>
      </div>
      <ArrowRight className="ml-auto text-content-muted group-hover:text-current transition-colors" size={20} />
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-pulse space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-9 bg-surface-subtle rounded-lg w-48"></div>
          <div className="h-4 bg-surface-subtle rounded w-40"></div>
        </div>
        <div className="h-8 bg-surface-subtle rounded-full w-44"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-surface-subtle rounded-2xl"></div>
        <div className="h-48 bg-surface-subtle rounded-xl"></div>
      </div>
      <div className="space-y-4">
        <div className="h-6 bg-surface-subtle rounded w-36"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-surface-subtle rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AlunoDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, feedbackRes] = await Promise.all([
          fetchWithAuth('student_dashboard'),
          fetchWithAuth('weekly_feedbacks/pending').catch(() => null),
        ]);
        setData(res);
        if (feedbackRes) setPendingFeedback(feedbackRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não def.";
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).replace('.', '');
  };

  if (loading) return <DashboardSkeleton />;

  if (!data) return (
    <div className="p-8 flex flex-col items-center justify-center text-center">
      <AlertCircle size={48} className="text-content-muted mb-4" />
      <h3 className="text-lg font-bold text-content-primary mb-1">Erro ao carregar dados</h3>
      <p className="text-sm text-content-tertiary">Tente recarregar a página.</p>
    </div>
  );

  const statusBadge = {
    ativo: {
      cls: 'bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border',
      icon: <CheckCircle2 size={16} />,
      label: 'Mensalidade em dia',
    },
    vencido: {
      cls: 'bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border',
      icon: <AlertCircle size={16} />,
      label: 'Pagamento Pendente',
    },
    inativo: {
      cls: 'bg-surface-subtle text-content-secondary border border-line',
      icon: <AlertCircle size={16} />,
      label: 'Sem Assinatura',
    },
  }[data.status_financeiro];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 text-content-primary pb-24 md:pb-6">

      {/* Cabeçalho de Boas-vindas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-content-primary">Olá, {data.student_name.split(' ')[0]}!</h1>
          <p className="text-sm text-content-tertiary mt-1">Pronto para o treino de hoje?</p>
        </div>

        <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${statusBadge.cls}`}>
          {statusBadge.icon}
          {statusBadge.label}
        </div>
      </div>

      {/* Formulário Semanal Pendente */}
      {pendingFeedback?.pending && pendingFeedback.week_id && (
        <div className="bg-semantic-warning-bg border border-semantic-warning-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-semantic-warning-border/30 rounded-xl flex-shrink-0">
              <ClipboardList size={22} className="text-semantic-warning-text" />
            </div>
            <div>
              <p className="font-bold text-content-primary">Formulário semanal pendente</p>
              <p className="text-sm text-semantic-warning-text mt-0.5">
                Você completou todos os treinos da semana! Preencha a avaliação para o coach ajustar sua próxima semana.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-content-on-brand font-bold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            <ClipboardList size={16} />
            Preencher agora
          </button>
        </div>
      )}

      {showFeedbackModal && pendingFeedback?.week_id && (
        <WeeklyFeedbackModal
          weekId={pendingFeedback.week_id}
          onClose={() => setShowFeedbackModal(false)}
          onSubmitted={() => {
            setShowFeedbackModal(false);
            setPendingFeedback({ pending: false });
          }}
        />
      )}

      {/* CARD DESTAQUE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda — Hero card */}
        <div className="lg:col-span-2 space-y-6">
          {data.active_block ? (
            <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                <Dumbbell size={150} />
              </div>
              <div className="relative z-10">
                <p className="text-red-100 text-xs font-bold uppercase tracking-wider mb-1">
                  {data.active_block.title}
                </p>
                {data.current_week ? (
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2">Semana {data.current_week.number}</h2>
                    <p className="text-red-100 flex items-center gap-2 text-sm">
                      <Calendar size={16} />
                      {formatDate(data.current_week.start_date)} – {formatDate(data.current_week.end_date)}
                    </p>
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold mb-6">Nenhuma semana ativa hoje</h2>
                )}
                {data.next_workout ? (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-red-100 text-xs font-bold uppercase mb-2">Próxima Sessão</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold">{data.next_workout.name}</h3>
                        <p className="text-sm opacity-80 mt-0.5">{formatDate(data.next_workout.day)}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/aluno/treinos/${data.next_workout!.id}`)}
                        className="bg-white text-red-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors"
                      >
                        Começar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-sm">Você completou todos os treinos agendados!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface-subtle p-8 rounded-2xl text-center border border-line">
              <Dumbbell size={40} className="text-content-muted mx-auto mb-3" />
              <p className="text-content-tertiary text-sm">Seu coach ainda não definiu um bloco de treinos.</p>
            </div>
          )}
        </div>

        {/* Coluna Direita — Resumo */}
        <div className="space-y-6">
          <div className="bg-surface-elevated p-6 rounded-xl border border-line shadow-sm">
            <h3 className="font-bold text-content-primary mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-brand" />
              Resumo do Bloco
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-line">
                <span className="text-sm text-content-tertiary">Treinos Realizados</span>
                <span className="text-2xl font-bold text-content-primary">{data.treinos_concluidos}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-content-tertiary">Plano Atual</span>
                <span className="text-sm font-bold text-content-primary bg-surface-subtle px-2 py-1 rounded-lg">
                  {data.plano_nome}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ATALHOS */}
      <div>
        <h2 className="text-xl font-bold text-content-primary mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ShortcutCard
            title="Ver Treinos"
            subtitle="Seu programa completo"
            icon={<Dumbbell size={22} className="text-brand" />}
            href="/aluno/treinos"
            accentClass="hover:border-brand"
            router={router}
          />
          <ShortcutCard
            title="Meu Coach"
            subtitle="Contato e informações"
            icon={<User size={22} className="text-content-secondary" />}
            href="/aluno/coach"
            accentClass="hover:border-line-input"
            router={router}
          />
          <ShortcutCard
            title="Financeiro"
            subtitle="Pagamentos e plano"
            icon={<CreditCard size={22} className="text-content-secondary" />}
            href="/aluno/payment"
            accentClass="hover:border-line-input"
            router={router}
          />
        </div>
      </div>

    </div>
  );
}
