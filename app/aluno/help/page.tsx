'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Mail, MessageSquare, Instagram } from 'lucide-react';

// Tipagem para os dados do coach que virão da API
interface CoachData {
  user: {
    name: string;
    email: string;
  };
  phone_number: string;
  instagram: string;
}

export default function AlunoHelpPage() {
  const [coach, setCoach] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCoachData = async () => {
      try {
        const data = await fetchWithAuth('meu_coach');
        setCoach(data);
      } catch (error) {
        console.error("Erro ao buscar dados do coach:", error);
      } finally {
        setLoading(false);
      }
    };
    getCoachData();
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 shadow rounded-md text-neutral-800">
      <h1 className="text-2xl font-bold mb-6 border-b pb-4">Central de Ajuda</h1>

      <div className="space-y-8">
        {/* Seção do Coach */}
        <section>
          <h2 className="text-xl font-semibold text-red-700 mb-3">Contato do seu Coach</h2>
          {loading ? (
            <p>Carregando...</p>
          ) : coach ? (
            <div className="space-y-3">
              <p>Precisa falar sobre seu treino ou tirar alguma dúvida? Entre em contato direto com seu coach, <strong>{coach.user.name}</strong>.</p>
              <ul className="space-y-3 list-disc list-inside text-neutral-700">
                {coach.user.email && (
                  <li>
                    <strong>E-mail:</strong>
                    <a href={`mailto:${coach.user.email}`} className="text-blue-600 hover:underline ml-2">
                      {coach.user.email}
                    </a>
                  </li>
                )}
                {coach.phone_number && (
                  <li>
                    <strong>WhatsApp:</strong>
                    <a href={`https://wa.me/${coach.phone_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                      {coach.phone_number}
                    </a>
                  </li>
                )}
                {coach.instagram && (
                  <li>
                    <strong>Instagram:</strong>
                    <a href={`https://instagram.com/${coach.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                      {coach.instagram}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <p className="text-neutral-500">Não foi possível carregar as informações do seu coach.</p>
          )}
        </section>

        <hr />

        {/* Seção de Suporte da Plataforma */}
        <section>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Suporte da Plataforma</h2>
          <p className="text-neutral-600 mb-3">
            Para problemas técnicos, sugestões ou questões administrativas, fale com o suporte do The Grinders.
          </p>
          <ul className="space-y-3 list-disc list-inside text-neutral-700">
            <li>
              <strong>E-mail:</strong>
              <a href="mailto:seu-email-de-suporte@exemplo.com" className="text-blue-600 hover:underline ml-2">
                seu-email-de-suporte@exemplo.com
              </a>
            </li>
            <li>
              <strong>WhatsApp:</strong>
              <a href="https://wa.me/5511988888888" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                (11) 98888-8888
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}