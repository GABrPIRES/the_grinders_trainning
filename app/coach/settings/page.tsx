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

  const [aiPrefs, setAiPrefs] = useState({
    ai_enabled_by_admin: false,
    ai_enabled: true,
  });
  const [savingAi, setSavingAi] = useState(false);

  useEffect(() => {
    loadInviteData();
    loadPendingStudents();
    loadNotifPrefs();
    loadAiPrefs();
  }, []);

  const loadAiPrefs = async () => {
    try {
      const data = await fetchWithAuth("coach/settings");
      setAiPrefs({
        ai_enabled_by_admin: data.ai_enabled_by_admin,
        ai_enabled: data.ai_enabled,
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
