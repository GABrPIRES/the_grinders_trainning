'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Mail, Instagram, UserCircle } from 'lucide-react';

// Tipagem para os dados do coach que virão da API
interface CoachProfile {
  user: {
    name: string;
    email: string;
  };
  bio: string;
  phone_number: string;
  instagram: string;
}

export default function MeuCoachPage() {
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getCoachData = async () => {
      try {
        const data = await fetchWithAuth('meu_coach');
        setCoach(data);
      } catch (err: any) {
        setError('Não foi possível carregar as informações do seu coach.');
        console.error("Erro ao buscar dados do coach:", err);
      } finally {
        setLoading(false);
      }
    };
    getCoachData();
  }, []);

  if (loading) return <p className="text-neutral-800">Carregando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!coach) return <p className="text-neutral-500">Nenhum coach associado a você.</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg">
      <div className="flex flex-col items-center text-center">
        <UserCircle size={96} className="text-neutral-400 mb-4" />
        <h1 className="text-3xl font-bold text-neutral-800">{coach.user.name}</h1>
        <p className="text-md text-red-700 font-semibold">Seu Coach</p>
      </div>

      <div className="mt-8 space-y-6">
        {/* Seção da Bio */}
        {coach.bio && (
          <section>
            <h2 className="text-xl font-semibold text-neutral-700 mb-2 border-b pb-2">Sobre</h2>
            <p className="text-neutral-600 whitespace-pre-wrap">{coach.bio}</p>
          </section>
        )}

        {/* Seção de Contato */}
        <section>
          <h2 className="text-xl font-semibold text-neutral-700 mb-3 border-b pb-2">Contatos</h2>
          <div className="space-y-4">
            {coach.user.email && (
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-neutral-500" />
                <a href={`mailto:${coach.user.email}`} className="text-blue-600 hover:underline">
                  {coach.user.email}
                </a>
              </div>
            )}
            {coach.instagram && (
              <div className="flex items-center gap-3">
                <Instagram size={20} className="text-neutral-500" />
                <a href={`https://instagram.com/${coach.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {coach.instagram}
                </a>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}