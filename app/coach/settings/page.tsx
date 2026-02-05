"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import { coachService } from "@/services/coachService"; // Importe o serviço criado
import { 
  Lock, 
  Bell, 
  Moon, 
  Shield, 
  Check, 
  Loader2,
  UserPlus,
  Copy,
  Users,
  Share2
} from "lucide-react";

export default function CoachSettingsPage() {
  const [savingPassword, setSavingPassword] = useState(false);
  const [passForm, setPassForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: ""
  });

  // Estados novos para Invite/Approvals
  const [inviteData, setInviteData] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // Estados fictícios visuais
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // --- Efeitos ---
  useEffect(() => {
    loadInviteData();
    loadPendingStudents();
  }, []);

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

  const handleShare = async () => {
    if (!inviteData?.link) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Convite The Grinders',
          text: `Venha treinar comigo! Use o código ${inviteData.code} ou acesse o link:`,
          url: inviteData.link,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado ou erro:', error);
      }
    } else {
      // Fallback para computadores que não suportam share nativo
      copyToClipboard();
      alert("Link copiado para a área de transferência!");
    }
  };

  // --- Handlers ---
  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassForm({ ...passForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.password !== passForm.password_confirmation) {
        alert("A nova senha e a confirmação não coincidem.");
        return;
    }
    setSavingPassword(true);
    try {
      await fetchWithAuth("auth/change_password", {
        method: "POST",
        body: JSON.stringify(passForm),
      });
      alert("Senha alterada com sucesso!");
      setPassForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (error: any) {
      alert("Erro ao alterar senha: " + error.message);
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
      } catch (e) { alert("Erro ao atualizar."); }
  };

  const handleApproval = async (id: string, action: 'approve' | 'reject') => {
      if (!confirm(`Confirma ${action === 'approve' ? 'aprovar' : 'rejeitar'} este aluno?`)) return;
      try {
          await coachService.handleApproval(id, action);
          setPendingStudents(prev => prev.filter(s => s.id !== id));
      } catch (e) { alert("Erro na ação."); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-neutral-800 pb-20 md:pb-0">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Configurações</h1>
        <p className="text-neutral-500 text-sm">Preferências do aplicativo e segurança da conta.</p>
      </div>

      <div className="space-y-6">

        {/* --- NOVO: SEÇÃO DE CONVITES & APROVAÇÕES --- */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800">
                    <UserPlus size={20} className="text-red-700" /> Cadastros & Convites
                </h2>
                <p className="text-sm text-neutral-500 mt-1">Gerencie como novos alunos entram no seu time.</p>
            </div>

            <div className="p-6 space-y-8">
                {loadingInvite ? (
                    <div className="flex justify-center"><Loader2 className="animate-spin text-red-700"/></div>
                ) : (
                    <>
                        {/* Cartão do Código */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Seu Código de Coach</label>
                                <div className="text-3xl font-mono font-bold text-red-700 mt-1 tracking-widest">
                                    {inviteData?.code}
                                </div>
                                <p className="text-xs text-neutral-400 mt-2">Validade: 7 dias (renova auto)</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase">Link de Convite</label>
                                    <div className="flex gap-2 mt-1">
                                        <input 
                                            readOnly 
                                            value={inviteData?.link} 
                                            className="flex-1 text-sm bg-white border border-neutral-300 rounded px-3 py-2 text-neutral-600 outline-none"
                                        />
                                        <button 
                                            onClick={copyToClipboard}
                                            className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 p-2 rounded transition-colors"
                                            title="Copiar"
                                        >
                                            {copied ? <Check size={18}/> : <Copy size={18}/>}
                                        </button>
                                        <button 
                                            onClick={handleShare}
                                            className="bg-red-700 hover:bg-red-800 text-white p-2 rounded transition-colors shadow-sm"
                                            title="Compartilhar"
                                        >
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-neutral-700">Aprovação Automática?</span>
                                    <button 
                                        onClick={toggleAutoApprove}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${inviteData?.auto_approve ? 'bg-green-600' : 'bg-neutral-300'}`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${inviteData?.auto_approve ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Pendentes */}
                        {pendingStudents.length > 0 && (
                            <div className="border-t border-neutral-100 pt-6">
                                <h3 className="font-bold text-neutral-800 flex items-center gap-2 mb-4">
                                    <Users size={18} /> Aprovações Pendentes
                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{pendingStudents.length}</span>
                                </h3>
                                <div className="space-y-3">
                                    {pendingStudents.map((student) => (
                                        <div key={student.id} className="flex items-center justify-between bg-white border border-neutral-200 p-3 rounded-lg shadow-sm">
                                            <div>
                                                <p className="font-semibold text-neutral-900">{student.name}</p>
                                                <p className="text-xs text-neutral-500">{student.email}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleApproval(student.id, 'reject')}
                                                    className="px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 rounded border border-transparent transition-colors"
                                                >
                                                    Recusar
                                                </button>
                                                <button 
                                                    onClick={() => handleApproval(student.id, 'approve')}
                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded transition-colors shadow-sm"
                                                >
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
        
        {/* SEÇÃO DE SEGURANÇA (MANTIDA IGUAL AO SEU CÓDIGO) */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
             <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800">
               <Shield size={20} className="text-red-700" /> Segurança e Login
             </h2>
             <p className="text-sm text-neutral-500 mt-1">Gerencie sua senha de acesso.</p>
          </div>
          
          <div className="p-6 md:p-8">
             <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Senha Atual</label>
                   <input 
                     type="password"
                     name="current_password"
                     value={passForm.current_password}
                     onChange={handlePassChange}
                     className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                     required
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium mb-1 text-neutral-600">Nova Senha</label>
                       <input 
                         type="password"
                         name="password"
                         value={passForm.password}
                         onChange={handlePassChange}
                         className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                         required
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-1 text-neutral-600">Confirmar Senha</label>
                       <input 
                         type="password"
                         name="password_confirmation"
                         value={passForm.password_confirmation}
                         onChange={handlePassChange}
                         className="w-full border border-neutral-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                         required
                       />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={savingPassword}
                    className="mt-2 bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                    {savingPassword ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    Atualizar Senha
                </button>
             </form>
          </div>
        </section>

        {/* SEÇÃO DE PREFERÊNCIAS (MANTIDA IGUAL AO SEU CÓDIGO) */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
             <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800">
               <Bell size={20} className="text-red-700" /> Preferências do App
             </h2>
             <p className="text-sm text-neutral-500 mt-1">Personalize sua experiência.</p>
          </div>
          
          <div className="p-6 space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-50 text-red-700 rounded-lg"><Bell size={20}/></div>
                   <div>
                      <p className="font-semibold text-neutral-800">Notificações Push</p>
                      <p className="text-xs text-neutral-500">Receba alertas sobre novos alunos e pagamentos (Em breve).</p>
                   </div>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${notifications ? 'bg-red-700' : 'bg-neutral-300'}`}
                >
                   <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-neutral-100 text-neutral-700 rounded-lg"><Moon size={20}/></div>
                   <div>
                      <p className="font-semibold text-neutral-800">Modo Escuro</p>
                      <p className="text-xs text-neutral-500">Alterne entre tema claro e escuro (Em breve).</p>
                   </div>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-neutral-900' : 'bg-neutral-300'}`}
                >
                   <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}