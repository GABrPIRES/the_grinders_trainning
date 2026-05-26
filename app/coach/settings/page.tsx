"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { coachService } from "@/services/coachService";
import PasswordField from '@/components/PasswordField';
import {
  Bell, Shield, Check, Loader2,
  UserPlus, Copy, Users, Share2, Mail, CheckCircle2, AlertCircle, Smartphone, Sparkles,
} from "lucide-react";
import PushNotificationToggle from "@/components/settings/PushNotificationToggle";

function PrefRow({
  icon, title, description, checked, onToggle, saving,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  saving: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-surface-subtle text-brand rounded-lg border border-line shrink-0 mt-0.5">{icon}</div>
        <div>
          <p className="font-bold text-content-primary text-sm">{title}</p>
          <p className="text-xs text-content-tertiary mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={saving}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 disabled:opacity-60 ${checked ? 'bg-brand' : 'bg-surface-subtle border border-line'}`}
      >
        <div className={`bg-surface-elevated w-4 h-4 rounded-full shadow transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default function CoachSettingsPage() {
  const { showToast, ToastEl } = useToast();
  const { showConfirm, ConfirmEl } = useConfirm();
  const [savingPassword, setSavingPassword] = useState(false);
  const [passForm, setPassForm] = useState({ current_password: "", password: "", password_confirmation: "" });

  const [inviteData, setInviteData] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    notifications_enabled: true,
    email_on_workout_completed: true,
    email_on_workout_missed: true,
    email_students_on_publish: true,
    emails_globally_enabled: false,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [aiPrefs, setAiPrefs] = useState<{
    ai_enabled_by_admin: boolean;
    ai_enabled: boolean;
    ai_duplication_mode: 'preserve' | 'destructive';
  }>({
    ai_enabled_by_admin: false,
    ai_enabled: true,
    ai_duplication_mode: 'preserve',
  });
  const [savingAi, setSavingAi] = useState(false);
  const [savingDuplicationMode, setSavingDuplicationMode] = useState(false);

  // Sprint 012 — personalização da IA (prompt + 4 parâmetros)
  type AiConfigData = {
    defaults: {
      ai_system_prompt: string;
      ai_max_load_increase_pct: number;
      ai_critical_delta_pct: number;
      ai_sleep_threshold: number;
      ai_stress_threshold: number;
    };
    current: {
      ai_system_prompt: string | null;
      ai_max_load_increase_pct: number | string | null;
      ai_critical_delta_pct: number | string | null;
      ai_sleep_threshold: number | string | null;
      ai_stress_threshold: number | string | null;
    };
    is_using_default: boolean;
    ranges: Record<string, { min: number; max: number }>;
  };
  const [aiConfig, setAiConfig] = useState<AiConfigData | null>(null);
  const [editingAiConfig, setEditingAiConfig] = useState(false);
  const [aiConfigForm, setAiConfigForm] = useState({
    ai_system_prompt: "",
    ai_max_load_increase_pct: "",
    ai_critical_delta_pct: "",
    ai_sleep_threshold: "",
    ai_stress_threshold: "",
  });
  const [savingAiConfig, setSavingAiConfig] = useState(false);
  const [resettingAiConfig, setResettingAiConfig] = useState(false);

  useEffect(() => {
    loadInviteData();
    loadPendingStudents();
    loadNotifPrefs();
    loadAiPrefs();
    loadAiConfig();
  }, []);

  const loadAiPrefs = async () => {
    try {
      const data = await fetchWithAuth("coach/settings");
      setAiPrefs({
        ai_enabled_by_admin: data.ai_enabled_by_admin,
        ai_enabled: data.ai_enabled,
        ai_duplication_mode: data.ai_duplication_mode || 'preserve',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAiEnabled = async () => {
    const next = !aiPrefs.ai_enabled;
    setSavingAi(true);
    try {
      await fetchWithAuth("coach/settings/ai_enabled", {
        method: "PATCH",
        body: JSON.stringify({ ai_enabled: next }),
      });
      setAiPrefs((p) => ({ ...p, ai_enabled: next }));
      showToast(`Atualização por IA ${next ? "ativada" : "desativada"}.`);
    } catch {
      showToast("Erro ao atualizar preferência.", "error");
    } finally {
      setSavingAi(false);
    }
  };

  const loadAiConfig = async () => {
    try {
      const d: AiConfigData = await fetchWithAuth("coach/ai_config");
      setAiConfig(d);
      setAiConfigForm({
        ai_system_prompt: d.current.ai_system_prompt || "",
        ai_max_load_increase_pct: d.current.ai_max_load_increase_pct?.toString() || "",
        ai_critical_delta_pct: d.current.ai_critical_delta_pct?.toString() || "",
        ai_sleep_threshold: d.current.ai_sleep_threshold?.toString() || "",
        ai_stress_threshold: d.current.ai_stress_threshold?.toString() || "",
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAiConfig = async () => {
    const payload: Record<string, any> = {};
    payload.ai_system_prompt = aiConfigForm.ai_system_prompt.trim() || null;
    (['ai_max_load_increase_pct', 'ai_critical_delta_pct', 'ai_sleep_threshold', 'ai_stress_threshold'] as const).forEach((k) => {
      const v = aiConfigForm[k].trim();
      payload[k] = v === "" ? null : Number(v);
    });

    setSavingAiConfig(true);
    try {
      await fetchWithAuth("coach/ai_config", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      await loadAiConfig();
      setEditingAiConfig(false);
      showToast("Personalização da IA salva.");
    } catch (e: any) {
      showToast(e?.message || "Erro ao salvar personalização.", "error");
    } finally {
      setSavingAiConfig(false);
    }
  };

  const handleResetAiConfig = async () => {
    setResettingAiConfig(true);
    try {
      await fetchWithAuth("coach/ai_config/reset_to_default", { method: "POST" });
      await loadAiConfig();
      setEditingAiConfig(false);
      showToast("Voltou para a configuração padrão.");
    } catch {
      showToast("Erro ao voltar para padrão.", "error");
    } finally {
      setResettingAiConfig(false);
    }
  };

  const handleDuplicationModeChange = async (mode: 'preserve' | 'destructive') => {
    if (mode === aiPrefs.ai_duplication_mode) return;
    setSavingDuplicationMode(true);
    try {
      await fetchWithAuth("coach/settings/ai_duplication_mode", {
        method: "PATCH",
        body: JSON.stringify({ ai_duplication_mode: mode }),
      });
      setAiPrefs((p) => ({ ...p, ai_duplication_mode: mode }));
      showToast(`Modo de duplicação ajustado.`);
    } catch {
      showToast("Erro ao atualizar modo de duplicação.", "error");
    } finally {
      setSavingDuplicationMode(false);
    }
  };

  const loadInviteData = async () => {
    try {
      const data = await coachService.getInviteSettings();
      setInviteData(data);
    } catch (e) { console.error(e); } finally { setLoadingInvite(false); }
  };

  const loadPendingStudents = async () => {
    try {
      const data = await coachService.getPendingStudents();
      setPendingStudents(data);
    } catch (e) { console.error(e); }
  };

  const loadNotifPrefs = async () => {
    try {
      const data = await fetchWithAuth("coach/notification_preferences");
      setNotifPrefs(data);
    } catch (e) { console.error(e); }
  };

  const handleNotifPrefToggle = async (key: keyof typeof notifPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    setSavingPrefs(true);
    try {
      await fetchWithAuth("coach/notification_preferences", {
        method: "PATCH",
        body: JSON.stringify({ notification_preferences: { [key]: updated[key] } }),
      });
    } catch {
      setNotifPrefs(notifPrefs); // reverte
      showToast("Erro ao salvar preferência.", "error");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleShare = async () => {
    if (!inviteData?.link) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Convite The Grinders', text: `Use o código ${inviteData.code}:`, url: inviteData.link });
      } catch (e) { copyToClipboard(); }
    } else {
      copyToClipboard();
    }
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassForm({ ...passForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.password !== passForm.password_confirmation) {
      showToast("A nova senha e a confirmação não coincidem.", "error");
      return;
    }
    setSavingPassword(true);
    try {
      await fetchWithAuth("auth/change_password", { method: "POST", body: JSON.stringify(passForm) });
      showToast("Senha alterada com sucesso!");
      setPassForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (error: any) {
      showToast("Erro ao alterar senha: " + error.message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const copyToClipboard = () => {
    if (inviteData?.link) {
      navigator.clipboard.writeText(inviteData.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleAutoApprove = async () => {
    if (!inviteData) return;
    try {
      const newState = !inviteData.auto_approve;
      await coachService.updateSettings(newState);
      setInviteData({ ...inviteData, auto_approve: newState });
    } catch (e) { showToast("Erro ao atualizar.", "error"); }
  };

  const handleApproval = async (id: string, action: 'approve' | 'reject') => {
    const ok = await showConfirm({ message: `Confirma ${action === 'approve' ? 'aprovar' : 'rejeitar'} este aluno?` });
    if (!ok) return;
    try {
      await coachService.handleApproval(id, action);
      setPendingStudents(prev => prev.filter(s => s.id !== id));
    } catch (e) { showToast("Erro na ação.", "error"); }
  };

  const inputClass = "w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary text-sm";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Configurações</h1>
        <p className="text-sm text-content-tertiary mt-0.5">Preferências do aplicativo e segurança da conta.</p>
      </div>

      <div className="space-y-6">

        {/* Convites & Aprovações */}
        <section className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-line bg-surface-page">
            <h2 className="text-base font-bold flex items-center gap-2 text-content-primary">
              <UserPlus size={17} className="text-brand" /> Cadastros & Convites
            </h2>
            <p className="text-sm text-content-tertiary mt-0.5">Gerencie como novos alunos entram no seu time.</p>
          </div>

          <div className="p-6 space-y-6">
            {loadingInvite ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-brand" /></div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Código */}
                  <div className="bg-surface-subtle p-4 rounded-xl border border-line">
                    <label className="text-xs font-bold text-content-muted uppercase tracking-wide">Seu Código de Coach</label>
                    <div className="text-3xl font-mono font-bold text-brand mt-1 tracking-widest">
                      {inviteData?.code}
                    </div>
                    <p className="text-xs text-content-muted mt-2">Validade: 7 dias (renova automaticamente)</p>
                  </div>

                  {/* Link + toggles */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-content-muted uppercase">Link de Convite</label>
                      <div className="flex gap-2 mt-1">
                        <input readOnly value={inviteData?.link} className="flex-1 text-sm bg-surface-subtle border border-line rounded-lg px-3 py-2 text-content-secondary outline-none" />
                        <button onClick={copyToClipboard} className="bg-surface-subtle hover:bg-surface-page border border-line text-content-secondary p-2 rounded-lg transition-colors" title="Copiar">
                          {copied ? <Check size={17} className="text-semantic-success-text" /> : <Copy size={17} />}
                        </button>
                        <button onClick={handleShare} className="bg-brand hover:bg-brand-hover text-content-on-brand p-2 rounded-lg transition-colors shadow-sm" title="Compartilhar">
                          <Share2 size={17} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-content-secondary">Aprovação Automática?</span>
                      <button
                        onClick={toggleAutoApprove}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${inviteData?.auto_approve ? 'bg-semantic-success-text' : 'bg-surface-subtle border border-line'}`}
                      >
                        <div className={`bg-surface-elevated w-4 h-4 rounded-full shadow transform transition-transform duration-300 ${inviteData?.auto_approve ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pendentes */}
                {pendingStudents.length > 0 && (
                  <div className="border-t border-line pt-6">
                    <h3 className="font-bold text-content-primary flex items-center gap-2 mb-4">
                      <Users size={16} /> Aprovações Pendentes
                      <span className="bg-semantic-warning-bg text-semantic-warning-text text-xs px-2 py-0.5 rounded-full border border-semantic-warning-border font-bold">{pendingStudents.length}</span>
                    </h3>
                    <div className="space-y-3">
                      {pendingStudents.map(student => (
                        <div key={student.id} className="flex items-center justify-between bg-surface-page border border-line p-3 rounded-xl">
                          <div>
                            <p className="font-bold text-content-primary text-sm">{student.name}</p>
                            <p className="text-xs text-content-tertiary">{student.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleApproval(student.id, 'reject')} className="px-3 py-1.5 text-xs font-bold text-semantic-error-text hover:bg-semantic-error-bg rounded-lg border border-transparent hover:border-semantic-error-border transition-colors">
                              Recusar
                            </button>
                            <button onClick={() => handleApproval(student.id, 'approve')} className="px-3 py-1.5 text-xs font-bold text-semantic-success-text bg-semantic-success-bg border border-semantic-success-border hover:opacity-80 rounded-lg transition-opacity">
                              Aprovar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Segurança */}
        <section className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-line bg-surface-page">
            <h2 className="text-base font-bold flex items-center gap-2 text-content-primary">
              <Shield size={17} className="text-brand" /> Segurança e Login
            </h2>
            <p className="text-sm text-content-tertiary mt-0.5">Gerencie sua senha de acesso.</p>
          </div>

          <div className="p-6">
            <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-content-muted uppercase mb-1">Senha Atual</label>
                <PasswordField name="current_password" value={passForm.current_password} onChange={handlePassChange} className={inputClass} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-content-muted uppercase mb-1">Nova Senha</label>
                  <PasswordField name="password" value={passForm.password} onChange={handlePassChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-content-muted uppercase mb-1">Confirmar Senha</label>
                  <PasswordField name="password_confirmation" value={passForm.password_confirmation} onChange={handlePassChange} className={inputClass} required />
                </div>
              </div>
              <button
                type="submit" disabled={savingPassword}
                className="bg-brand text-content-on-brand font-bold py-2.5 px-6 rounded-xl hover:bg-brand-hover transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {savingPassword ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                Atualizar Senha
              </button>
            </form>
          </div>
        </section>

        {/* Atualização por IA — só aparece se admin habilitou para este coach */}
        {aiPrefs.ai_enabled_by_admin && (
          <section className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-line bg-surface-page">
              <h2 className="text-base font-bold flex items-center gap-2 text-content-primary">
                <Sparkles size={17} className="text-brand" /> Atualização de cargas por IA
              </h2>
              <p className="text-sm text-content-tertiary mt-0.5">
                Quando ativo, ao aluno responder o formulário semanal o sistema sugere automaticamente cargas para a próxima semana — você revisa e aprova antes de publicar.
              </p>
            </div>
            <div className="p-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-content-primary text-sm">Ativar IA para meus alunos</p>
                <p className="text-xs text-content-tertiary mt-0.5">
                  {aiPrefs.ai_enabled
                    ? "Atualmente ativa — você recebe sugestões da IA para revisar."
                    : "Atualmente desativada — você cria todos os treinos manualmente."}
                </p>
              </div>
              <button
                onClick={handleToggleAiEnabled}
                disabled={savingAi}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 disabled:opacity-60 ${
                  aiPrefs.ai_enabled ? "bg-brand" : "bg-surface-subtle border border-line"
                }`}
              >
                <div
                  className={`bg-surface-elevated w-4 h-4 rounded-full shadow transform transition-transform duration-300 ${
                    aiPrefs.ai_enabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Modo de duplicação — só aparece se a IA está ativa (sprint 011) */}
            {aiPrefs.ai_enabled && (
              <div className="px-6 pb-6 pt-2 border-t border-line">
                <p className="text-xs font-bold uppercase text-content-muted tracking-wide mt-4 mb-3">
                  Como a IA duplica a semana
                </p>
                <div className="flex flex-col gap-3">
                  <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                    aiPrefs.ai_duplication_mode === 'preserve'
                      ? 'border-brand bg-brand/5'
                      : 'border-line hover:bg-surface-subtle'
                  }`}>
                    <input
                      type="radio"
                      name="ai_duplication_mode"
                      value="preserve"
                      checked={aiPrefs.ai_duplication_mode === 'preserve'}
                      onChange={() => handleDuplicationModeChange('preserve')}
                      disabled={savingDuplicationMode}
                      className="mt-1 accent-brand"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-content-primary">Preservar treinos existentes</p>
                      <p className="text-xs text-content-tertiary mt-0.5">
                        A IA duplica a semana anterior <strong>sem mexer</strong> em treinos que você criou manualmente na próxima semana.
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                    aiPrefs.ai_duplication_mode === 'destructive'
                      ? 'border-brand bg-brand/5'
                      : 'border-line hover:bg-surface-subtle'
                  }`}>
                    <input
                      type="radio"
                      name="ai_duplication_mode"
                      value="destructive"
                      checked={aiPrefs.ai_duplication_mode === 'destructive'}
                      onChange={() => handleDuplicationModeChange('destructive')}
                      disabled={savingDuplicationMode}
                      className="mt-1 accent-brand"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-content-primary">Apagar e duplicar do zero</p>
                      <p className="text-xs text-content-tertiary mt-0.5">
                        A IA <strong>apaga todos os treinos</strong> da próxima semana antes de duplicar. Use se você sempre prefere começar limpo.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Personalização da IA — sprint 012 */}
        {aiPrefs.ai_enabled_by_admin && aiPrefs.ai_enabled && aiConfig && (
          <section className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-line bg-surface-page flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2 text-content-primary">
                  <Sparkles size={17} className="text-brand" /> Personalização da IA
                </h2>
                <p className="text-sm text-content-tertiary mt-0.5">
                  {aiConfig.is_using_default
                    ? "Usando a configuração padrão definida pelo administrador."
                    : "Você está com prompt/parâmetros personalizados para seus alunos."}
                </p>
              </div>
              {!aiConfig.is_using_default && !editingAiConfig && (
                <button
                  type="button"
                  onClick={handleResetAiConfig}
                  disabled={resettingAiConfig}
                  className="text-xs font-medium text-content-secondary underline disabled:opacity-50 shrink-0"
                >
                  {resettingAiConfig ? "Resetando…" : "Voltar ao padrão"}
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              {!editingAiConfig ? (
                <button
                  type="button"
                  onClick={() => setEditingAiConfig(true)}
                  className="bg-brand text-content-on-brand font-bold text-sm px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
                >
                  Personalizar
                </button>
              ) : (
                <>
                  {/* Prompt */}
                  <div>
                    <label className="text-xs font-bold text-content-secondary uppercase tracking-wide block mb-1">
                      System Prompt
                      <span className="font-normal normal-case text-content-muted ml-1">(vazio = usar padrão)</span>
                    </label>
                    <textarea
                      rows={10}
                      value={aiConfigForm.ai_system_prompt}
                      placeholder={aiConfig.defaults.ai_system_prompt.slice(0, 300) + "…"}
                      onChange={(e) => setAiConfigForm({ ...aiConfigForm, ai_system_prompt: e.target.value })}
                      className="w-full text-xs font-mono border border-line-input rounded-lg p-3 bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none placeholder:text-content-tertiary"
                    />
                  </div>

                  {/* 4 parâmetros */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(['ai_max_load_increase_pct', 'ai_critical_delta_pct', 'ai_sleep_threshold', 'ai_stress_threshold'] as const).map((k) => {
                      const range = aiConfig.ranges[k];
                      const dft = aiConfig.defaults[k];
                      const labels: Record<string, string> = {
                        ai_max_load_increase_pct: "Aumento máximo (%)",
                        ai_critical_delta_pct: "Delta crítico (%)",
                        ai_sleep_threshold: "Threshold de sono",
                        ai_stress_threshold: "Threshold de estresse",
                      };
                      return (
                        <div key={k}>
                          <label className="text-xs font-bold text-content-secondary uppercase tracking-wide">
                            {labels[k]}{" "}
                            <span className="font-normal normal-case text-content-muted">
                              ({range.min}-{range.max}, default {dft})
                            </span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min={range.min}
                            max={range.max}
                            value={aiConfigForm[k]}
                            placeholder={String(dft)}
                            onChange={(e) => setAiConfigForm({ ...aiConfigForm, [k]: e.target.value })}
                            className="w-full mt-1 text-sm border border-line-input rounded-lg px-3 py-2 bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none placeholder:text-content-tertiary"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSaveAiConfig}
                      disabled={savingAiConfig}
                      className="bg-brand text-content-on-brand font-bold py-2 px-4 rounded-lg hover:bg-brand-hover transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
                    >
                      {savingAiConfig ? <Loader2 className="animate-spin" size={14} /> : null}
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAiConfig(false)}
                      className="border border-line text-content-secondary font-medium py-2 px-4 rounded-lg hover:bg-surface-subtle transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Preferências */}
        <section className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-line bg-surface-page">
            <h2 className="text-base font-bold flex items-center gap-2 text-content-primary">
              <Bell size={17} className="text-brand" /> Notificações
            </h2>
            <p className="text-sm text-content-tertiary mt-0.5">Controle quando e como você é alertado.</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Push — celular */}
            <div className="border-b border-line pb-5">
              <p className="text-xs font-bold text-content-muted uppercase mb-4 flex items-center gap-2">
                <Smartphone size={13} /> Notificações no celular
              </p>
              <PushNotificationToggle />
            </div>

            {/* Toggle global de notificações in-app */}
            <PrefRow
              icon={<Bell size={18} />}
              title="Notificações in-app"
              description="Receba alertas quando alunos concluírem treinos e outras atualizações."
              checked={notifPrefs.notifications_enabled}
              onToggle={() => handleNotifPrefToggle("notifications_enabled")}
              saving={savingPrefs}
            />

            {/* E-mails — só aparece se o admin habilitou a feature */}
            {notifPrefs.emails_globally_enabled ? (
              <>
                <div className="border-t border-line pt-5">
                  <p className="text-xs font-bold text-content-muted uppercase mb-4 flex items-center gap-2">
                    <Mail size={13} /> Notificações por e-mail
                  </p>
                  <div className="space-y-4">
                    <PrefRow
                      icon={<CheckCircle2 size={18} />}
                      title="Treino concluído pelo aluno"
                      description="Receba um e-mail com o resumo de carga e RPE quando um aluno finalizar o treino."
                      checked={notifPrefs.email_on_workout_completed}
                      onToggle={() => handleNotifPrefToggle("email_on_workout_completed")}
                      saving={savingPrefs}
                    />
                    <PrefRow
                      icon={<AlertCircle size={18} />}
                      title="Treino não realizado"
                      description="Seja avisado quando um aluno não realizar um treino dentro da semana."
                      checked={notifPrefs.email_on_workout_missed}
                      onToggle={() => handleNotifPrefToggle("email_on_workout_missed")}
                      saving={savingPrefs}
                    />
                    <PrefRow
                      icon={<Mail size={18} />}
                      title="Avisar alunos ao publicar semana"
                      description="Seus alunos recebem um e-mail quando você publica todos os treinos da semana."
                      checked={notifPrefs.email_students_on_publish}
                      onToggle={() => handleNotifPrefToggle("email_students_on_publish")}
                      saving={savingPrefs}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="border-t border-line pt-5">
                <p className="text-xs text-content-muted flex items-center gap-2">
                  <Mail size={13} />
                  Notificações por e-mail não estão disponíveis no momento.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
      {ToastEl}
      {ConfirmEl}
    </div>
  );
}
