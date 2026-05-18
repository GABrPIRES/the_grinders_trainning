"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { Sparkles, Search, Loader2, AlertCircle, Info } from "lucide-react";

interface PersonalRow {
  personal_id: string;
  user_id: string;
  name: string;
  email: string;
  ai_enabled_by_admin: boolean;
  ai_enabled: boolean;
}

interface AiPermissionsResponse {
  ai_enabled_global: boolean;
  personals: PersonalRow[];
}

export default function AdminAiPermissionsPage() {
  const { showToast, ToastEl } = useToast();
  const [loading, setLoading] = useState(true);
  const [aiEnabledGlobal, setAiEnabledGlobal] = useState(false);
  const [togglingGlobal, setTogglingGlobal] = useState(false);
  const [personals, setPersonals] = useState<PersonalRow[]>([]);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWithAuth("admin/ai_permissions")
      .then((d: AiPermissionsResponse) => {
        setAiEnabledGlobal(d.ai_enabled_global);
        setPersonals(d.personals);
      })
      .catch(() => showToast("Erro ao carregar permissões.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return personals;
    const q = search.toLowerCase();
    return personals.filter(
      (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    );
  }, [personals, search]);

  const handleToggleGlobal = async () => {
    const next = !aiEnabledGlobal;
    setTogglingGlobal(true);
    try {
      await fetchWithAuth("admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ settings: { ai_enabled_global: next } }),
      });
      setAiEnabledGlobal(next);
      showToast(`IA globalmente ${next ? "ativada" : "desativada"}.`);
    } catch {
      showToast("Erro ao alterar configuração global.", "error");
    } finally {
      setTogglingGlobal(false);
    }
  };

  const handleTogglePersonal = async (row: PersonalRow) => {
    const next = !row.ai_enabled_by_admin;
    setTogglingId(row.personal_id);
    try {
      const updated: PersonalRow = await fetchWithAuth(
        `admin/ai_permissions/${row.personal_id}`,
        { method: "PATCH", body: JSON.stringify({ ai_enabled_by_admin: next }) }
      );
      setPersonals((prev) =>
        prev.map((p) => (p.personal_id === row.personal_id ? updated : p))
      );
      showToast(`IA ${next ? "habilitada" : "desabilitada"} para ${row.name}.`);
    } catch {
      showToast("Erro ao atualizar coach.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-content-primary pb-24 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Permissões de IA</h1>
        <p className="text-sm text-content-tertiary">
          Controle quem pode usar a auto-regulação de cargas por IA — globalmente e por coach.
        </p>
      </div>

      {/* Toggle global */}
      <section className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-page">
          <h2 className="text-base font-bold flex items-center gap-2 text-content-primary">
            <Sparkles size={17} className="text-brand" /> Chave Global
          </h2>
          <p className="text-sm text-content-tertiary mt-0.5">
            Quando desligado, nenhum coach recebe sugestões da IA — mesmo que esteja habilitado individualmente.
          </p>
        </div>
        <div className="p-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-content-primary text-sm">Auto-regulação por IA</p>
            <p className="text-xs text-content-tertiary mt-0.5">
              {aiEnabledGlobal
                ? "Atualmente ativa — coaches habilitados estão recebendo sugestões."
                : "Atualmente desativada — sugestões da IA não estão sendo geradas."}
            </p>
          </div>
          <button
            onClick={handleToggleGlobal}
            disabled={togglingGlobal || loading}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 disabled:opacity-60 ${
              aiEnabledGlobal ? "bg-brand" : "bg-surface-subtle border border-line"
            }`}
          >
            <div
              className={`bg-surface-elevated w-4 h-4 rounded-full shadow transform transition-transform duration-300 ${
                aiEnabledGlobal ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Lista de coaches */}
      <section className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-page">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-bold text-content-primary">Coaches</h2>
              <p className="text-sm text-content-tertiary mt-0.5">
                Habilite ou desabilite a IA por coach. Coaches habilitados aqui podem ainda se autodesativar nas configurações deles.
              </p>
            </div>
          </div>
          <div className="relative mt-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-9 pr-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary text-sm"
            />
          </div>
        </div>

        <div className="divide-y divide-line">
          {loading ? (
            <div className="px-6 py-10 flex items-center justify-center gap-2 text-content-tertiary">
              <Loader2 className="animate-spin" size={16} /> Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-content-tertiary">
              Nenhum coach encontrado.
            </div>
          ) : (
            filtered.map((row) => {
              const isToggling = togglingId === row.personal_id;
              const adminEnabled = row.ai_enabled_by_admin;
              const coachDisabled = adminEnabled && !row.ai_enabled;
              return (
                <div
                  key={row.personal_id}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-content-primary text-sm truncate">
                      {row.name}
                    </p>
                    <p className="text-xs text-content-tertiary truncate">{row.email}</p>
                    {coachDisabled && (
                      <p className="text-xs text-content-muted mt-1 flex items-center gap-1">
                        <Info size={11} />
                        Coach desativou a IA para si próprio.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleTogglePersonal(row)}
                    disabled={isToggling}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 disabled:opacity-60 ${
                      adminEnabled ? "bg-brand" : "bg-surface-subtle border border-line"
                    }`}
                  >
                    <div
                      className={`bg-surface-elevated w-4 h-4 rounded-full shadow transform transition-transform duration-300 ${
                        adminEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {!aiEnabledGlobal && !loading && (
          <div className="px-6 py-4 bg-semantic-warning-bg border-t border-semantic-warning-border flex items-start gap-3">
            <AlertCircle
              size={16}
              className="text-semantic-warning-text shrink-0 mt-0.5"
            />
            <p className="text-xs text-semantic-warning-text">
              A chave global está desligada — esses toggles por coach só passam a valer quando a chave global for ativada.
            </p>
          </div>
        )}
      </section>

      {ToastEl}
    </div>
  );
}
