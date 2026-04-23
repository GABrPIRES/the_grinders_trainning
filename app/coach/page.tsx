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
  Upload, ArrowRight, DollarSign,
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

type Period = 7 | 30 | 90 | 365;

const PERIODS: { label: string; value: Period }[] = [
  { label: "7d",  value: 7   },
  { label: "30d", value: 30  },
  { label: "90d", value: 90  },
  { label: "12m", value: 365 },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-1">
        <div className="h-7 bg-surface-subtle rounded-lg w-56"></div>
        <div className="h-4 bg-surface-subtle rounded w-40"></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-surface-subtle rounded-2xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-surface-subtle rounded-2xl"></div>
        <div className="h-80 bg-surface-subtle rounded-2xl"></div>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  title, value, subtitle, icon, trend, trendLabel, urgency,
}: {
  title:      string;
  value:      string | number;
  subtitle?:  string;
  icon:       React.ReactNode;
  trend?:     "up" | "down" | "flat";
  trendLabel?: string;
  urgency?:   "warning" | "error" | "info";
}) {
  const urgencyBg: Record<string, string> = {
    warning: "bg-semantic-warning-bg border-semantic-warning-border",
    error:   "bg-semantic-error-bg border-semantic-error-border",
    info:    "bg-semantic-info-bg border-semantic-info-border",
  };

  const urgencyText: Record<string, string> = {
    warning: "text-semantic-warning-text",
    error:   "text-semantic-error-text",
    info:    "text-semantic-info-text",
  };

  const trendIcon =
    trend === "up"   ? <TrendingUp  size={12} /> :
    trend === "down" ? <TrendingDown size={12} /> :
                       <Minus size={12} />;

  const trendColor =
    trend === "up"   ? "text-semantic-success-text" :
    trend === "down" ? "text-semantic-error-text"   :
                       "text-content-muted";

  return (
    <div
      className={`bg-surface-elevated border rounded-2xl p-5 flex flex-col gap-3 shadow-sm ${
        urgency ? urgencyBg[urgency] : "border-line"
      }`}
    >
      <div className="flex items-start justify-between">
        <p className={`text-xs font-bold uppercase tracking-wide ${urgency ? urgencyText[urgency] : "text-content-muted"}`}>
          {title}
        </p>
        <div className={`p-2 rounded-xl ${urgency ? "bg-white/30" : "bg-surface-subtle"}`}>
          {icon}
        </div>
      </div>

      <div>
        <p className={`text-2xl font-bold ${urgency ? urgencyText[urgency] : "text-content-primary"}`}>
          {value}
        </p>
        {subtitle && (
          <p className={`text-xs mt-0.5 ${urgency ? urgencyText[urgency] + " opacity-70" : "text-content-tertiary"}`}>
            {subtitle}
          </p>
        )}
      </div>

      {trend && trendLabel && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          {trendIcon}
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
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

function QuickAction({
  label, href, icon, router,
}: {
  label:  string;
  href:   string;
  icon:   React.ReactNode;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <button
      onClick={() => router.push(href)}
      className="group flex items-center justify-between gap-3 p-4 bg-surface-elevated border border-line rounded-xl hover:border-brand/40 hover:bg-brand-surface/30 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-surface-subtle rounded-lg group-hover:bg-brand-surface transition-colors">
          {icon}
        </div>
        <span className="text-sm font-bold text-content-primary group-hover:text-brand transition-colors">
          {label}
        </span>
      </div>
      <ArrowRight size={14} className="text-content-muted group-hover:text-brand transition-colors flex-shrink-0" />
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CoachDashboardPage() {
  const router    = useRouter();
  const { user }  = useAuth();
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState<Period>(30);

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const d = await fetchWithAuth(`coach_dashboard?period=${p}`);
      setData(d);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(period); }, [period, fetchData]);

  // ── Formatters ──
  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  // ── Derived ──
  const revTrend = (): { trend: "up" | "down" | "flat"; label: string } => {
    if (!data) return { trend: "flat", label: "" };
    const curr = data.total_revenue_current_month;
    const prev = data.total_revenue_previous_month;
    if (prev === 0) return { trend: curr > 0 ? "up" : "flat", label: "sem histórico" };
    const pct = ((curr - prev) / prev) * 100;
    return {
      trend: pct > 0 ? "up" : pct < 0 ? "down" : "flat",
      label: `${pct > 0 ? "+" : ""}${pct.toFixed(1)}% vs mês anterior`,
    };
  };

  const chartTotal = data?.revenue_chart_data.reduce((s, r) => s + r.total, 0) ?? 0;
  const chartAvg   = data && data.revenue_chart_data.length > 0
    ? chartTotal / data.revenue_chart_data.length
    : 0;

  const periodLabel = PERIODS.find(p => p.value === period)?.label ?? "30d";

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 md:pb-6">
        <DashboardSkeleton />
      </div>
    );
  }

  const { trend, label: trendLabel } = revTrend();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6 text-content-primary">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          {greeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-sm text-content-tertiary mt-0.5">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Faturamento (Mês)"
          value={fmt(data?.total_revenue_current_month ?? 0)}
          icon={<DollarSign size={18} className="text-semantic-success-text" />}
          trend={trend}
          trendLabel={trendLabel}
        />
        <KpiCard
          title="Alunos Ativos"
          value={data?.active_students_count ?? 0}
          subtitle={`de ${data?.total_students_count ?? 0} no total`}
          icon={<Users size={18} className="text-semantic-info-text" />}
        />
        <KpiCard
          title="Cobranças Atrasadas"
          value={data?.overdue_payments_count ?? 0}
          icon={<AlertCircle size={18} className={data?.overdue_payments_count ? "text-semantic-error-text" : "text-content-muted"} />}
          urgency={data?.overdue_payments_count ? "error" : undefined}
          subtitle={data?.overdue_payments_count ? "requerem atenção" : "tudo em dia"}
        />
        <KpiCard
          title="Revisões IA"
          value={data?.pending_ai_reviews_count ?? 0}
          icon={<Cpu size={18} className={data?.pending_ai_reviews_count ? "text-semantic-warning-text" : "text-content-muted"} />}
          urgency={data?.pending_ai_reviews_count ? "warning" : undefined}
          subtitle={data?.pending_ai_reviews_count ? "sugestões pendentes" : "nenhuma pendente"}
        />
      </div>

      {/* Chart + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart */}
        <div className="lg:col-span-2 bg-surface-elevated border border-line rounded-2xl shadow-sm p-6">

          {/* Chart header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-content-primary">Faturamento</h2>
              <p className="text-xs text-content-tertiary mt-0.5">
                Total: <span className="font-bold text-content-primary">{fmt(chartTotal)}</span>
                <span className="mx-2 text-line">·</span>
                Média: <span className="font-bold text-content-primary">{fmt(chartAvg)}</span>
                {period <= 90 ? "/dia" : "/mês"}
              </p>
            </div>
            {/* Period filter */}
            <div className="flex items-center gap-1 bg-surface-subtle border border-line rounded-xl p-1 self-start sm:self-auto">
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    period === p.value
                      ? "bg-brand text-content-on-brand shadow-sm"
                      : "text-content-muted hover:text-content-primary"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts area chart */}
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.revenue_chart_data ?? []}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#b91c1c" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#b91c1c" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
                <XAxis
                  dataKey="date"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-content-tertiary, #9ca3af)" }}
                  interval={period === 7 ? 0 : period === 30 ? 4 : period === 90 ? 8 : 0}
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-content-tertiary, #9ca3af)" }}
                  tickFormatter={v => v === 0 ? "0" : `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#b91c1c", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#b91c1c"
                  strokeWidth={2}
                  fill="url(#brandGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#b91c1c", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Period insight row */}
          <div className="mt-4 pt-4 border-t border-line flex items-center gap-2 flex-wrap">
            <span className="text-xs text-content-muted">Período:</span>
            <span className="text-xs font-bold text-content-secondary">{periodLabel}</span>
            {chartTotal > 0 && (
              <>
                <span className="text-content-muted text-xs">·</span>
                <span className="text-xs text-semantic-success-text font-bold flex items-center gap-1">
                  <TrendingUp size={11} /> {fmt(chartTotal)} recebidos
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-surface-elevated border border-line rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-content-primary mb-4">Acesso rápido</h2>
          <div className="space-y-2">
            <QuickAction label="Gerenciar Alunos"  href="/coach/students"        icon={<Users         size={16} className="text-content-secondary" />} router={router} />
            <QuickAction label="Adicionar Aluno"   href="/coach/students/create" icon={<UserPlus      size={16} className="text-content-secondary" />} router={router} />
            <QuickAction label="Gerenciar Planos"  href="/coach/plans"           icon={<ClipboardList size={16} className="text-content-secondary" />} router={router} />
            <QuickAction label="Ver Pagamentos"    href="/coach/payments"        icon={<CreditCard    size={16} className="text-content-secondary" />} router={router} />
            <QuickAction label="Importar Treinos"  href="/coach/import"          icon={<Upload        size={16} className="text-content-secondary" />} router={router} />
          </div>
        </div>
      </div>
    </div>
  );
}
