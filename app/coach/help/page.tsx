"use client";

import {
  Mail, MessageCircle, Instagram, FileText,
  Settings, ExternalLink, ChevronRight, User,
} from "lucide-react";

export default function CoachHelpPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Central de Ajuda</h1>
        <p className="text-sm text-content-tertiary mt-0.5">
          Estamos aqui para ajudar você a tirar o máximo proveito da plataforma.
        </p>
      </div>

      {/* Canais de suporte */}
      <section>
        <h2 className="text-base font-bold text-content-primary mb-4">Fale Conosco</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <a
            href="https://wa.me/5511979699898"
            target="_blank" rel="noopener noreferrer"
            className="group bg-surface-elevated border border-line rounded-xl p-6 shadow-sm hover:shadow-md hover:border-semantic-success-border transition-all flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-semantic-success-bg text-semantic-success-text flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-semantic-success-border">
              <MessageCircle size={22} />
            </div>
            <h3 className="font-bold text-content-primary mb-1">WhatsApp</h3>
            <p className="text-sm text-content-tertiary mb-4">Resposta rápida para dúvidas urgentes.</p>
            <span className="text-sm font-bold text-semantic-success-text flex items-center gap-1 group-hover:underline">
              (11) 97969-9898 <ExternalLink size={11} />
            </span>
          </a>

          <a
            href="mailto:gabrielribeiropires@outlook.com"
            className="group bg-surface-elevated border border-line rounded-xl p-6 shadow-sm hover:shadow-md hover:border-semantic-info-border transition-all flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-semantic-info-bg text-semantic-info-text flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-semantic-info-border">
              <Mail size={22} />
            </div>
            <h3 className="font-bold text-content-primary mb-1">E-mail</h3>
            <p className="text-sm text-content-tertiary mb-4">Para sugestões e problemas técnicos.</p>
            <span className="text-sm font-bold text-semantic-info-text flex items-center gap-1 group-hover:underline truncate max-w-full">
              gabrielribeiropires@outlook.com
            </span>
          </a>

          <a
            href="https://instagram.com/gabriel_r_pires"
            target="_blank" rel="noopener noreferrer"
            className="group bg-surface-elevated border border-line rounded-xl p-6 shadow-sm hover:shadow-md hover:border-brand/30 transition-all flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-surface-subtle text-content-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-line">
              <Instagram size={22} />
            </div>
            <h3 className="font-bold text-content-primary mb-1">Instagram</h3>
            <p className="text-sm text-content-tertiary mb-4">Siga para dicas e novidades.</p>
            <span className="text-sm font-bold text-brand flex items-center gap-1 group-hover:underline">
              @gabriel_r_pires <ExternalLink size={11} />
            </span>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-base font-bold text-content-primary mb-4">Dúvidas Frequentes</h2>
        <div className="bg-surface-elevated border border-line rounded-xl shadow-sm divide-y divide-line">

          <div className="p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0"><FileText className="text-brand" size={18} /></div>
              <div>
                <h3 className="font-bold text-content-primary">Como eu edito um treino já criado?</h3>
                <p className="text-sm text-content-tertiary mt-2 leading-relaxed">
                  Navegue até <strong className="text-content-secondary">Gestão de Treinos</strong>, selecione o aluno desejado e clique no treino para editar cargas ou exercícios.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0"><Settings className="text-brand" size={18} /></div>
              <div>
                <h3 className="font-bold text-content-primary">Onde eu cadastro meus planos?</h3>
                <p className="text-sm text-content-tertiary mt-2 leading-relaxed">
                  A gestão de planos está disponível na aba <strong className="text-content-secondary">Planos</strong>. Entre em contato pelo WhatsApp se precisar de ajuda.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0"><User className="text-brand" size={18} /></div>
              <div>
                <h3 className="font-bold text-content-primary">Como adicionar um novo aluno?</h3>
                <p className="text-sm text-content-tertiary mt-2 leading-relaxed">
                  Vá até <strong className="text-content-secondary">Meus Alunos</strong> e clique em "Novo Aluno", ou compartilhe seu link de convite nas configurações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <div className="bg-brand text-content-on-brand p-8 rounded-xl text-center">
        <h3 className="text-xl font-bold mb-2">Ainda precisa de ajuda?</h3>
        <p className="text-sm opacity-80 mb-6 max-w-lg mx-auto">
          Nossa equipe responde geralmente em menos de 2 horas durante o horário comercial.
        </p>
        <a
          href="https://wa.me/5511979699898"
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-surface-elevated text-content-primary px-6 py-3 rounded-full font-bold hover:bg-surface-page transition-colors"
        >
          Chamar no Suporte <ChevronRight size={15} />
        </a>
      </div>
    </div>
  );
}
