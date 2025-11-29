"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { 
  MessageCircle, Mail, HelpCircle, 
  ChevronRight, ExternalLink 
} from "lucide-react";

interface CoachContact {
  name: string;
  phone_number: string;
  email: string;
}

export default function StudentHelpPage() {
  const [coach, setCoach] = useState<CoachContact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCoach() {
      try {
        const data = await fetchWithAuth("meu_coach");
        setCoach({
            name: data.user.name,
            email: data.user.email,
            phone_number: data.phone_number
        });
      } catch (error) {
        console.error("Erro ao carregar coach", error);
      } finally {
        setLoading(false);
      }
    }
    loadCoach();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 md:pb-0 text-neutral-800">
      
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
           <HelpCircle className="text-red-700" /> Central de Ajuda
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Dúvidas sobre o treino ou aplicativo? Fale com seu coach.
        </p>
      </div>

      {loading ? (
         <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando contatos...</div>
      ) : coach ? (
        <section>
            <h2 className="text-lg font-bold text-neutral-800 mb-4">Falar com {coach.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* WhatsApp do Coach */}
                <a 
                href={`https://wa.me/55${coach.phone_number?.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all flex items-center gap-4 cursor-pointer"
                >
                    <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageCircle size={28} />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900 text-lg">WhatsApp</h3>
                        <p className="text-sm text-neutral-500 mb-1">Resposta mais rápida.</p>
                        <span className="text-sm font-semibold text-green-600 flex items-center gap-1 group-hover:underline">
                            Chamar Agora <ExternalLink size={12}/>
                        </span>
                    </div>
                </a>

                {/* Email do Coach */}
                <a 
                href={`mailto:${coach.email}`}
                className="group bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-4 cursor-pointer"
                >
                    <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mail size={28} />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900 text-lg">E-mail</h3>
                        <p className="text-sm text-neutral-500 mb-1">Para assuntos administrativos.</p>
                        <span className="text-sm font-semibold text-blue-600 flex items-center gap-1 group-hover:underline">
                            Enviar Email <ChevronRight size={12}/>
                        </span>
                    </div>
                </a>
            </div>
        </section>
      ) : (
        <div className="p-8 bg-red-50 text-red-600 rounded-lg text-center">
            Não foi possível carregar os dados de contato do seu coach.
        </div>
      )}

      {/* FAQ Genérico do App */}
      <section>
        <h2 className="text-lg font-bold text-neutral-800 mb-4">Dúvidas Comuns</h2>
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm divide-y divide-neutral-100">
            <div className="p-5">
                <h3 className="font-semibold text-neutral-900 text-sm">Onde vejo meu próximo treino?</h3>
                <p className="text-sm text-neutral-600 mt-1">Na aba "Meus Treinos" ou diretamente no Dashboard inicial, no card "Próxima Sessão".</p>
            </div>
            <div className="p-5">
                <h3 className="font-semibold text-neutral-900 text-sm">Como renovar meu plano?</h3>
                <p className="text-sm text-neutral-600 mt-1">Vá em "Financeiro", copie a chave PIX do seu coach e envie o comprovante para ele via WhatsApp.</p>
            </div>
            <div className="p-5">
                <h3 className="font-semibold text-neutral-900 text-sm">Posso alterar meus dados?</h3>
                <p className="text-sm text-neutral-600 mt-1">Sim, vá em "Meu Perfil" no menu lateral para atualizar seu peso, altura e outros dados.</p>
            </div>
        </div>
      </section>

    </div>
  );
}