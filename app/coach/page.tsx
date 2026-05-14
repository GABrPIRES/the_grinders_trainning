"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, TooltipProps,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus,
  Users, AlertCircle, Cpu,
  UserPlus, ClipboardList, CreditCard,
  Upload, DollarSign, Dumbbell,
  PlusCircle, Filter, ChevronDown,
  CheckCircle2, Weight, Activity,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  total_revenue_current_month:  number;
  total_revenue_previous_month: number;
  active_students_count:        number;
  total_students_count:         number;
  overdue_payments_count:       number;
  pending_ai_reviews_count:     number;
  revenue_chart_data:           { date: string; total: number }[];
}

interface TrainingStats {
  period: { start_date: string; end_date: string };
  students_without_workouts:         { id: string; name: string; email: string }[];
  students_without_workouts_count:   number;
  engagement_global: {
    total_sections: number;
    feito_pct:      number;
    load_pct:       number;
    rpe_pct:        number;
  };
  students_engagement: {
    aluno_id:            string;
    name:                string;
    total_sections:      number;
    feito_pct:           number;
    load_pct:            number;
    rpe_pct:             number;
    treinos_in_progress: number;
    treinos_completed:   number;
  }[];
  workouts_without_engagement:       { treino_id: string; treino_name: string; aluno_name: string; status: string; day: string }[];
  workouts_without_engagement_count: number;
}

interface Aluno { id: string; user: { name: string } }

type FinPeriod = 7 | 30 | 90 | 365;
type TrainPreset = 30 | 90 | 120 | 'custom';

const FIN_PERIODS: { label: string; value: FinPeriod }[] = [
  { label: "7d",  value: 7   },
  { label: "30d", value: 30  },
  { label: "90d", value: 90  },
  { label: "12m", value: 365 },
];

const TRAIN_PRESETS: { label: string; value: TrainPreset }[] = [
  { label: "30 dias",  value: 30  },
  { label: "90 dias",  value: 90  },
  { label: "120 dias", value: 120 },
  { label: "Período",  value: "custom" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pctColor(v: number) {
  if (v >= 75) return "text-semantic-success-text";
  if (v >= 50) return "text-semantic-warning-text";
  return "text-semantic-error-text";
}
function pctBg(v: number) {
  if (v >= 75) return "bg-semantic-success-text";
  if (v >= 50) return "bg-semantic-warning-text";
  return "bg-semantic-error-text";
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-1">
        <div className="h-7 bg-surface-subtle rounded-lg w-56" />
        <div className="h-4 bg-surface-subtle rounded w-40" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-surface-subtle rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-surface-subtle rounded-2xl" />
        <div className="h-80 bg-surface-subtle rounded-2xl" />
      </div>
    </div>
  );
}

function TrainingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface-subtle rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-surface-subtle rounded-xl" />)}
      </div>
      <div className="h-64 bg-surface-subtle rounded-2xl" />
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  title, value, subtitle, icon, trend, trendLabel, urgency,
}: {
  title:       string;
  value:       string | number;
  subtitle?:   string;
  icon:        React.ReactNode;
  trend?:      "up" | "down" | "flat";
  trendLabel?: string;
  urgency?:    "warning" | "error" | "info" | "success";
}) {
  const urgencyBg: Record<string, string> = {
    warning: "bg-semantic-warning-bg border-semantic-warning-border",
    error:   "bg-semantic-error-bg border-semantic-error-border",
    info:    "bg-semantic-info-bg border-semantic-info-border",
    success: "bg-semantic-success-bg border-semantic-success-border",
  };
  const urgencyText: Record<string, string> = {
    warning: "text-semantic-warning-text",
    error:   "text-semantic-error-text",
    info:    "text-semantic-info-text",
    success: "text-semantic-success-text",
  };

  const trendIcon = trend === "up" ? <TrendingUp size={12} /> : trend === "down" ? <TrendingDown size={12} /> : <Minus size={12} />;
  const trendColor = trend === "up" ? "text-semantic-success-text" : trend === "down" ? "text-semantic-error-text" : "text-content-muted";

  return (
    <div className={`bg-surface-elevated border rounded-2xl p-5 flex flex-col gap-3 shadow-sm ${urgency ? urgencyBg[urgency] : "border-line"}`}>
      <div className="flex items-start justify-between">
        <p className={`text-xs font-bold uppercase tracking-wide ${urgency ? urgencyText[urgency] : "text-content-muted"}`}>{title}</p>
        <div className={`p-2 rounded-xl ${urgency ? "bg-white/30" : "bg-surface-subtle"}`}>{icon}</div>
      </div>
      <div>
        <p className={`text-2xl font-bold ${urgency ? urgencyText[urgency] : "text-content-primary"}`}>{value}</p>
        {subtitle && <p className={`text-xs mt-0.5 ${urgency ? urgencyText[urgency] + " opacity-70" : "text-content-tertiary"}`}>{subtitle}</p>}
      </div>
      {trend && trendLabel && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>{trendIcon}<span>{trendLabel}</span></div>
      )}
    </div>
  );
}

// ─── Engagement bar ───────────────────────────────────────────────────────────

function EngagementBar({ label, icon, pct: v, total }: { label: string; icon: React.ReactNode; pct: number; total: number }) {
  return (
    <div className="bg-surface-elevated border border-line rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-content-secondary">{icon}{label}</div>
        <span className={`text-sm font-bold ${pctColor(v)}`}>{v}%</span>
      </div>
      <div className="h-2 bg-surface-subtle rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${pctBg(v)}`} style={{ width: `${v}%` }} />
      </div>
      <p className="text-xs text-content-muted mt-1">{total} séries no período</p>
    </div>
  );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value?: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-elevated border border-line rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-content-muted text-xs font-bold mb-1">{label}</p>
      <p className="font-bold text-content-primary">
        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(payload[0].value ?? 0)}
      </p>
    </div>
  );
}

// ─── Quick action ─────────────────────────────────────────────────────────────

function QuickAction({ label, href, icon, router }: { label: string; href: string; icon: React.ReactNode; router: ReturnType<typeof useRouter> }) {
  return (
    <button
      onClick={() => router.push(href)}
      className="group flex flex-col items-start gap-2 p-4 bg-surface-subtle border border-line rounded-xl hover:border-brand/40 hover:bg-brand/5 transition-all text-left"
    >
      <div className="p-2 bg-surface-elevated rounded-lg group-hover:bg-brand/10 transition-colors">{icon}</div>
      <span className="text-xs font-bold text-content-secondary group-hover:text-brand transition-colors leading-tight">{label}</span>
    </button>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'in_progress')
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-semantic-info-bg text-semantic-info-text border border-semantic-info-border">Em andamento</span>;
  if (status === 'completed')
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border">Concluído</span>;
  return null;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CoachDashboardPage() {
  const router   = useRouter();
  const { user } = useAuth();

  // Financial
  const [data, setData]         = useState<DashboardData | null>(null);
  const [finLoading, setFinLoading] = useState(true);
  const [finPeriod, setFinPeriod]   = useState<FinPeriod>(30);

  // Training stats
  const [trainStats, setTrainStats]     = useState<TrainingStats | null>(null);
  const [trainLoading, setTrainLoading] = useState(true);
  const [trainError, setTrainError]     = useState(false);
  const [trainPreset, setTrainPreset]   = useState<TrainPreset>(30);
  const [customStart, setCustomStart]   = useState("");
  const [customEnd,   setCustomEnd]     = useState("");
  const [filterAluno, setFilterAluno]   = useState("");
  const [alunos, setAlunos]             = useState<Aluno[]>([]);

  // ── Fetches ──
  const fetchFinancial = useCallback(async (p: FinPeriod) => {
    setFinLoading(true);
    try { setData(await fetchWithAuth(`coach_dashboard?period=${p}`)); }
    catch (err) { console.error(err); }
    finally { setFinLoading(false); }
  }, []);

  const fetchTrainingStats = useCallback(async () => {
    setTrainLoading(true);
    setTrainError(false);
    try {
      let qs = "";
      if (trainPreset === "custom" && customStart && customEnd) {
        qs = `start_date=${customStart}&end_date=${customEnd}`;
      } else if (trainPreset !== "custom") {
        qs = `period=${trainPreset}`;
      } else {
        qs = "period=30";
      }
      if (filterAluno) qs += `&aluno_id=${filterAluno}`;
      setTrainStats(await fetchWithAuth(`coach_dashboard/training_stats?${qs}`));
    } catch (err) { console.error(err); setTrainError(true); }
    finally { setTrainLoading(false); }
  }, [trainPreset, customStart, customEnd, filterAluno]);

  useEffect(() => { fetchFinancial(finPeriod); }, [finPeriod, fetchFinancial]);
  useEffect(() => { fetchTrainingStats(); }, []);
  useEffect(() => {
    fetchWithAuth("alunos?limit=500").then(d => setAlunos(d.alunos || [])).catch(() => {});
  }, []);

  // ── Derived ──
  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite");
    setCurrentDate(new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  const revTrend = (): { trend: "up" | "down" | "flat"; label: string } => {
    if (!data) return { trend: "flat", label: "" };
    const curr = data.total_revenue_current_month;
    const prev = data.total_revenue_previous_month;
    if (prev === 0) return { trend: curr > 0 ? "up" : "flat", label: "sem histórico" };
    const pct = ((curr - prev) / prev) * 100;
    return { trend: pct > 0 ? "up" : pct < 0 ? "down" : "flat", label: `${pct > 0 ? "+" : ""}${pct.toFixed(1)}% vs mês anterior` };
  };

  const chartTotal = data?.revenue_chart_data.reduce((s, r) => s + r.total, 0) ?? 0;
  const chartAvg   = data && data.revenue_chart_data.length > 0 ? chartTotal / data.revenue_chart_data.length : 0;
  const { trend, label: trendLabel } = revTrend();

  if (finLoading) {
    return <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 md:pb-6"><DashboardSkeleton /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-8 text-content-primary">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          {greeting}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-sm text-content-tertiary mt-0.5">
          {currentDate}
        </p>
      </div>

      {/* ── KPI financeiros ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Faturamento (Mês)" value={fmt(data?.total_revenue_current_month ?? 0)}
          icon={<DollarSign size={18} className="text-semantic-success-text" />}
          trend={trend} trendLabel={trendLabel}
        />
        <KpiCard
          title="Alunos Ativos" value={data?.active_students_count ?? 0}
          subtitle={`de ${data?.total_students_count ?? 0} no total`}
          icon={<Users size={18} className="text-semantic-info-text" />}
        />
        <KpiCard
          title="Cobranças Atrasadas" value={data?.overdue_payments_count ?? 0}
          icon={<AlertCircle size={18} className={data?.overdue_payments_count ? "text-semantic-error-text" : "text-content-muted"} />}
          urgency={data?.overdue_payments_count ? "error" : undefined}
          subtitle={data?.overdue_payments_count ? "requerem atenção" : "tudo em dia"}
        />
        <KpiCard
          title="Revisões IA" value={data?.pending_ai_reviews_count ?? 0}
          icon={<Cpu size={18} className={data?.pending_ai_reviews_count ? "text-semantic-warning-text" : "text-content-muted"} />}
          urgency={data?.pending_ai_reviews_count ? "warning" : undefined}
          subtitle={data?.pending_ai_reviews_count ? "sugestões pendentes" : "nenhuma pendente"}
        />
      </div>

      {/* ── Gráfico + Ações rápidas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart */}
        <div className="lg:col-span-2 bg-surface-elevated border border-line rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-content-primary">Faturamento</h2>
              <p className="text-xs text-content-tertiary mt-0.5">
                Total: <span className="font-bold text-content-primary">{fmt(chartTotal)}</span>
                <span className="mx-2 text-line">·</span>
                Média: <span className="font-bold text-content-primary">{fmt(chartAvg)}</span>
                {finPeriod <= 90 ? "/dia" : "/mês"}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-surface-subtle border border-line rounded-xl p-1 self-start sm:self-auto">
              {FIN_PERIODS.map(p => (
                <button key={p.value} onClick={() => setFinPeriod(p.value)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${finPeriod === p.value ? "bg-brand text-content-on-brand shadow-sm" : "text-content-muted hover:text-content-primary"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenue_chart_data ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-brand, #b91c1c)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-brand, #b91c1c)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false}
                  tick={{ fill: "var(--color-content-tertiary, #9ca3af)" }}
                  interval={finPeriod === 7 ? 0 : finPeriod === 30 ? 4 : finPeriod === 90 ? 8 : 0}
                />
                <YAxis fontSize={10} tickLine={false} axisLine={false}
                  tick={{ fill: "var(--color-content-tertiary, #9ca3af)" }}
                  tickFormatter={v => v === 0 ? "0" : `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-brand)", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area type="monotone" dataKey="total" stroke="var(--color-brand, #b91c1c)" strokeWidth={2}
                  fill="url(#brandGradient)" dot={false}
                  activeDot={{ r: 4, fill: "var(--color-brand, #b91c1c)", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-line flex items-center gap-2 flex-wrap">
            <span className="text-xs text-content-muted">Período:</span>
            <span className="text-xs font-bold text-content-secondary">{FIN_PERIODS.find(p => p.value === finPeriod)?.label}</span>
            {chartTotal > 0 && (
              <>
                <span className="text-content-muted text-xs">·</span>
                <span className="text-xs text-semantic-success-text font-bold flex items-center gap-1"><TrendingUp size={11} /> {fmt(chartTotal)} recebidos</span>
              </>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-surface-elevated border border-line rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-content-primary mb-4">Acesso rápido</h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickAction label="Novo Aluno"      href="/coach/students/create" icon={<UserPlus    size={16} className="text-content-secondary" />} router={router} />
            <QuickAction label="Treinos"         href="/coach/treinos"         icon={<Dumbbell    size={16} className="text-content-secondary" />} router={router} />
            <QuickAction label="Importar Treino" href="/coach/import"          icon={<Upload      size={16} className="text-content-secondary" />} router={router} />
            <QuickAction label="Pagamentos"      href="/coach/payments"        icon={<CreditCard  size={16} className="text-content-secondary" />} router={router} />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── INSIGHTS DE TREINO ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-5">

        {/* Cabeçalho da seção */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-line pt-6">
          <div>
            <h2 className="text-lg font-bold text-content-primary">Insights de Treino</h2>
            <p className="text-sm text-content-tertiary">Engajamento e adesão dos alunos no período selecionado.</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-surface-elevated border border-line rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-3 items-end">

            {/* Presets */}
            <div>
              <p className="text-xs font-bold text-content-muted uppercase mb-1.5">Período</p>
              <div className="flex items-center gap-1 bg-surface-subtle border border-line rounded-xl p-1">
                {TRAIN_PRESETS.map(p => (
                  <button key={String(p.value)} onClick={() => setTrainPreset(p.value)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${trainPreset === p.value ? "bg-brand text-content-on-brand shadow-sm" : "text-content-muted hover:text-content-primary"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom date range */}
            {trainPreset === "custom" && (
              <>
                <div>
                  <p className="text-xs font-bold text-content-muted uppercase mb-1.5">De</p>
                  <input type="date" onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()} value={customStart} onChange={e => setCustomStart(e.target.value)}
                    className="px-3 py-2 border border-line-input rounded-lg text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-content-muted uppercase mb-1.5">Até</p>
                  <input type="date" onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()} value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                    className="px-3 py-2 border border-line-input rounded-lg text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* Aluno filter */}
            <div>
              <p className="text-xs font-bold text-content-muted uppercase mb-1.5">Aluno</p>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={14} />
                <select value={filterAluno} onChange={e => setFilterAluno(e.target.value)}
                  className="pl-8 pr-8 py-2 border border-line-input rounded-lg text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none appearance-none cursor-pointer"
                >
                  <option value="">Todos os alunos</option>
                  {alunos.map(a => <option key={a.id} value={a.id}>{a.user.name}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" size={14} />
              </div>
            </div>

            {/* Aplicar */}
            <button
              onClick={fetchTrainingStats}
              className="flex items-center gap-2 bg-brand text-content-on-brand px-4 py-2 rounded-xl font-bold text-sm hover:bg-brand-hover transition-colors shadow-sm self-end"
            >
              <Filter size={14} /> Filtrar
            </button>
          </div>
        </div>

        {/* Conteúdo dos insights */}
        {trainLoading ? <TrainingSkeleton /> : (
          <div className="space-y-5">

            {/* Erro de carregamento */}
            {trainError && (
              <div className="flex items-center gap-3 bg-semantic-error-bg border border-semantic-error-border rounded-xl px-5 py-4">
                <AlertCircle size={18} className="text-semantic-error-text shrink-0" />
                <div>
                  <p className="text-sm font-bold text-semantic-error-text">Erro ao carregar insights de treino</p>
                  <p className="text-xs text-semantic-error-text opacity-70 mt-0.5">Verifique a conexão com a API ou tente novamente.</p>
                </div>
                <button
                  onClick={fetchTrainingStats}
                  className="ml-auto text-xs font-bold text-semantic-error-text border border-semantic-error-border rounded-lg px-3 py-1.5 hover:bg-semantic-error-border/20 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* KPI cards de treino — sempre visíveis */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Sem treino no período"
                value={trainStats?.students_without_workouts_count ?? 0}
                subtitle="alunos sem treino publicado"
                icon={<AlertCircle size={18} className={(trainStats?.students_without_workouts_count ?? 0) > 0 ? "text-semantic-warning-text" : "text-content-muted"} />}
                urgency={(trainStats?.students_without_workouts_count ?? 0) > 0 ? "warning" : undefined}
              />
              <KpiCard
                title="Sem engajamento"
                value={trainStats?.workouts_without_engagement_count ?? 0}
                subtitle="treinos sem nenhum dado"
                icon={<Activity size={18} className={(trainStats?.workouts_without_engagement_count ?? 0) > 0 ? "text-semantic-error-text" : "text-content-muted"} />}
                urgency={(trainStats?.workouts_without_engagement_count ?? 0) > 0 ? "error" : undefined}
              />
              <KpiCard
                title="Séries no período"
                value={(trainStats?.engagement_global.total_sections ?? 0).toLocaleString("pt-BR")}
                subtitle="em treinos ativos/concluídos"
                icon={<Dumbbell size={18} className="text-content-muted" />}
              />
              <KpiCard
                title="Feito (média)"
                value={`${trainStats?.engagement_global.feito_pct ?? 0}%`}
                subtitle="séries marcadas como feitas"
                icon={<CheckCircle2 size={18} className="text-content-muted" />}
                urgency={
                  !trainStats ? undefined :
                  trainStats.engagement_global.feito_pct >= 75 ? "success" :
                  trainStats.engagement_global.feito_pct >= 50 ? "warning" : "error"
                }
              />
            </div>

            {trainStats && (
              <>
                {/* Barras de engagement global */}
                {trainStats.engagement_global.total_sections > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <EngagementBar
                      label="Feito"
                      icon={<CheckCircle2 size={14} />}
                      pct={trainStats.engagement_global.feito_pct}
                      total={trainStats.engagement_global.total_sections}
                    />
                    <EngagementBar
                      label="Carga registrada"
                      icon={<Weight size={14} />}
                      pct={trainStats.engagement_global.load_pct}
                      total={trainStats.engagement_global.total_sections}
                    />
                    <EngagementBar
                      label="RPE registrado"
                      icon={<Activity size={14} />}
                      pct={trainStats.engagement_global.rpe_pct}
                      total={trainStats.engagement_global.total_sections}
                    />
                  </div>
                ) : (
                  <div className="bg-surface-elevated border border-line rounded-xl px-5 py-6 text-center">
                    <Dumbbell size={24} className="text-content-muted mx-auto mb-2" />
                    <p className="text-sm font-bold text-content-secondary">Nenhum treino ativo ou concluído no período</p>
                    <p className="text-xs text-content-muted mt-1">Publique treinos para os alunos para ver o engajamento aqui.</p>
                  </div>
                )}

                {/* Tabela de engajamento por aluno */}
                <div className="bg-surface-elevated border border-line rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-line bg-surface-subtle flex items-center justify-between">
                    <h3 className="font-bold text-content-primary text-sm">Engajamento por Aluno</h3>
                    <span className="text-xs text-content-muted">Ordenado do menor para o maior</span>
                  </div>

                  {trainStats.students_engagement.length > 0 ? (
                    <>
                      {/* Desktop */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-line text-left">
                          <thead className="bg-surface-subtle">
                            <tr>
                              <th className="px-6 py-3 text-xs font-bold text-content-muted uppercase">Aluno</th>
                              <th className="px-4 py-3 text-xs font-bold text-content-muted uppercase text-center">Feito</th>
                              <th className="px-4 py-3 text-xs font-bold text-content-muted uppercase text-center">Carga</th>
                              <th className="px-4 py-3 text-xs font-bold text-content-muted uppercase text-center">RPE</th>
                              <th className="px-4 py-3 text-xs font-bold text-content-muted uppercase text-center">Em prog.</th>
                              <th className="px-4 py-3 text-xs font-bold text-content-muted uppercase text-center">Concluídos</th>
                              <th className="px-4 py-3 text-xs font-bold text-content-muted uppercase text-center">Séries</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line bg-surface-elevated">
                            {trainStats.students_engagement.map(s => (
                              <tr key={s.aluno_id}
                                onClick={() => router.push(`/coach/students/${s.aluno_id}`)}
                                className="hover:bg-surface-subtle transition-colors cursor-pointer"
                              >
                                <td className="px-6 py-3 font-bold text-content-primary text-sm">{s.name}</td>
                                <td className="px-4 py-3 text-center"><span className={`text-sm font-bold ${pctColor(s.feito_pct)}`}>{s.feito_pct}%</span></td>
                                <td className="px-4 py-3 text-center"><span className={`text-sm font-bold ${pctColor(s.load_pct)}`}>{s.load_pct}%</span></td>
                                <td className="px-4 py-3 text-center"><span className={`text-sm font-bold ${pctColor(s.rpe_pct)}`}>{s.rpe_pct}%</span></td>
                                <td className="px-4 py-3 text-center text-sm text-content-secondary">{s.treinos_in_progress}</td>
                                <td className="px-4 py-3 text-center text-sm text-content-secondary">{s.treinos_completed}</td>
                                <td className="px-4 py-3 text-center text-sm text-content-muted">{s.total_sections}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden divide-y divide-line">
                        {trainStats.students_engagement.map(s => (
                          <div key={s.aluno_id}
                            onClick={() => router.push(`/coach/students/${s.aluno_id}`)}
                            className="p-4 space-y-3 cursor-pointer active:bg-surface-subtle"
                          >
                            <p className="font-bold text-content-primary text-sm">{s.name}</p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {[
                                { label: "Feito", v: s.feito_pct },
                                { label: "Carga", v: s.load_pct },
                                { label: "RPE",   v: s.rpe_pct },
                              ].map(({ label, v }) => (
                                <div key={label} className="bg-surface-subtle rounded-lg p-2">
                                  <p className="text-[10px] text-content-muted font-bold uppercase">{label}</p>
                                  <p className={`text-base font-bold ${pctColor(v)}`}>{v}%</p>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-content-muted">{s.treinos_in_progress} em andamento · {s.treinos_completed} concluídos · {s.total_sections} séries</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <Users size={24} className="text-content-muted mx-auto mb-2" />
                      <p className="text-sm font-bold text-content-secondary">Nenhum aluno com dados de engajamento</p>
                      <p className="text-xs text-content-muted mt-1">Aparecerá aqui quando alunos iniciarem ou concluírem treinos.</p>
                    </div>
                  )}
                </div>

                {/* Grid inferior: sem treino + sem engajamento */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {trainStats.students_without_workouts.length > 0 ? (
                    <div className="bg-surface-elevated border border-semantic-warning-border rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-5 py-4 bg-semantic-warning-bg border-b border-semantic-warning-border flex items-center gap-2">
                        <AlertCircle size={15} className="text-semantic-warning-text" />
                        <h3 className="font-bold text-semantic-warning-text text-sm">
                          Alunos sem treino publicado ({trainStats.students_without_workouts_count})
                        </h3>
                      </div>
                      <div className="divide-y divide-line">
                        {trainStats.students_without_workouts.map(a => (
                          <div key={a.id}
                            onClick={() => router.push(`/coach/students/${a.id}`)}
                            className="flex items-center justify-between px-5 py-3 hover:bg-surface-subtle transition-colors cursor-pointer"
                          >
                            <div>
                              <p className="text-sm font-bold text-content-primary">{a.name}</p>
                              <p className="text-xs text-content-tertiary">{a.email}</p>
                            </div>
                            <span className="text-xs text-brand font-bold">Ver →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-elevated border border-line rounded-2xl p-6 flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-semantic-success-text shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-content-primary">Todos com treino publicado</p>
                        <p className="text-xs text-content-muted mt-0.5">Nenhum aluno sem treino no período.</p>
                      </div>
                    </div>
                  )}

                  {trainStats.workouts_without_engagement.length > 0 ? (
                    <div className="bg-surface-elevated border border-semantic-error-border rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-5 py-4 bg-semantic-error-bg border-b border-semantic-error-border flex items-center gap-2">
                        <Activity size={15} className="text-semantic-error-text" />
                        <h3 className="font-bold text-semantic-error-text text-sm">
                          Treinos sem nenhum dado ({trainStats.workouts_without_engagement_count})
                        </h3>
                      </div>
                      <div className="divide-y divide-line">
                        {trainStats.workouts_without_engagement.slice(0, 10).map(w => (
                          <div key={w.treino_id} className="flex items-center justify-between px-5 py-3">
                            <div>
                              <p className="text-sm font-bold text-content-primary">{w.treino_name}</p>
                              <p className="text-xs text-content-tertiary">{w.aluno_name} · {w.day}</p>
                            </div>
                            <StatusBadge status={w.status} />
                          </div>
                        ))}
                        {trainStats.workouts_without_engagement_count > 10 && (
                          <p className="text-xs text-center text-content-muted py-3">
                            +{trainStats.workouts_without_engagement_count - 10} treinos adicionais
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-elevated border border-line rounded-2xl p-6 flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-semantic-success-text shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-content-primary">Todos os treinos com dados</p>
                        <p className="text-xs text-content-muted mt-0.5">Nenhum treino sem registro de engajamento.</p>
                      </div>
                    </div>
                  )}

                </div>
              </>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
