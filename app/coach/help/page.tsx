"use client";

import { 
  Mail, 
  MessageCircle, 
  Instagram, 
  HelpCircle, 
  FileText, 
  Settings,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function CoachHelpPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 md:pb-0 text-neutral-800">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          Central de Ajuda
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Estamos aqui para ajudar você a tirar o máximo proveito da plataforma.
        </p>
      </div>

      {/* CANAIS DE SUPORTE (CARDS) */}
      <section>
        <h2 className="text-lg font-bold text-neutral-800 mb-4">Fale Conosco</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card WhatsApp */}
            <a 
              href="https://wa.me/5511979699898" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all flex flex-col items-center text-center cursor-pointer"
            >
               <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
               </div>
               <h3 className="font-bold text-neutral-900">WhatsApp</h3>
               <p className="text-sm text-neutral-500 mb-4">Resposta rápida para dúvidas urgentes.</p>
               <span className="text-sm font-semibold text-green-600 flex items-center gap-1 group-hover:underline">
                  (11) 97969-9898 <ExternalLink size={12}/>
               </span>
            </a>

            {/* Card Email */}
            <a 
              href="mailto:gabrielribeiropires@outlook.com"
              className="group bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center cursor-pointer"
            >
               <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail size={24} />
               </div>
               <h3 className="font-bold text-neutral-900">E-mail</h3>
               <p className="text-sm text-neutral-500 mb-4">Para sugestões e problemas técnicos.</p>
               <span className="text-sm font-semibold text-blue-600 flex items-center gap-1 group-hover:underline truncate max-w-full">
                  gabrielribeiropires@outlook.com
               </span>
            </a>

            {/* Card Instagram */}
            <a 
              href="https://instagram.com/gabriel_r_pires" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-pink-200 transition-all flex flex-col items-center text-center cursor-pointer"
            >
               <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Instagram size={24} />
               </div>
               <h3 className="font-bold text-neutral-900">Instagram</h3>
               <p className="text-sm text-neutral-500 mb-4">Siga para dicas e novidades.</p>
               <span className="text-sm font-semibold text-pink-600 flex items-center gap-1 group-hover:underline">
                  @gabriel_r_pires <ExternalLink size={12}/>
               </span>
            </a>

        </div>
      </section>

      {/* FAQ (PERGUNTAS FREQUENTES) */}
      <section>
        <h2 className="text-lg font-bold text-neutral-800 mb-4">Dúvidas Frequentes</h2>
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm divide-y divide-neutral-100">
            
            {/* Pergunta 1 */}
            <div className="p-6">
                <div className="flex items-start gap-3">
                    <div className="mt-1 min-w-[24px]"><FileText className="text-red-700" size={20}/></div>
                    <div>
                        <h3 className="font-semibold text-neutral-900">Como eu edito um treino já criado?</h3>
                        <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                            Navegue até a tela de <strong className="text-neutral-800">Gestão de Treinos</strong>, selecione o aluno desejado na lista. 
                            Você verá a planilha atual dele; basta clicar nos campos para editar cargas ou exercícios e salvar.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pergunta 2 */}
            <div className="p-6">
                <div className="flex items-start gap-3">
                    <div className="mt-1 min-w-[24px]"><Settings className="text-red-700" size={20}/></div>
                    <div>
                        <h3 className="font-semibold text-neutral-900">Onde eu cadastro meus planos?</h3>
                        <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                            Atualmente, a gestão de planos é feita pelo administrador do sistema. 
                            Entre em contato pelo WhatsApp se precisar criar ou alterar um plano de assinatura personalizado.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pergunta 3 */}
            <div className="p-6">
                <div className="flex items-start gap-3">
                    <div className="mt-1 min-w-[24px]"><User className="text-red-700" size={20}/></div>
                    <div>
                        <h3 className="font-semibold text-neutral-900">Como adicionar um novo aluno?</h3>
                        <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                            Vá até a aba <strong className="text-neutral-800">Meus Alunos</strong> e clique no botão "Novo Aluno" no canto superior direito.
                            Preencha os dados básicos e o aluno receberá o acesso.
                        </p>
                    </div>
                </div>
            </div>

        </div>
      </section>

      {/* MENSAGEM FINAL */}
      <div className="bg-red-700 text-white p-8 rounded-xl text-center">
        <h3 className="text-xl font-bold mb-2">Ainda precisa de ajuda?</h3>
        <p className="text-black mb-6 max-w-lg mx-auto">
            Nossa equipe de suporte responde geralmente em menos de 2 horas durante o horário comercial.
        </p>
        <a 
            href="https://wa.me/5511979699898" 
            target="_blank"
            className="inline-flex items-center gap-2 bg-white text-neutral-900 px-6 py-3 rounded-full font-bold hover:bg-neutral-200 transition-colors"
        >
            Chamar no Suporte <ChevronRight size={16} />
        </a>
      </div>

    </div>
  );
}

// Pequeno helper para importar o User que usei no FAQ
import { User } from "lucide-react";