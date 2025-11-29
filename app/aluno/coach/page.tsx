'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Mail, Instagram, User, Phone, ExternalLink } from 'lucide-react';

// Tipagem
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

  if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando perfil do coach...</div>;
  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg mx-6 mt-6">{error}</div>;
  if (!coach) return <div className="p-8 text-center text-neutral-500">Nenhum coach associado a você.</div>;

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0">
      
      {/* CARD PRINCIPAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden relative">

        <div className="px-6 pb-8 md:px-10">
           {/* Avatar e Nome */}
           <div className="flex flex-col md:flex-row items-center md:items-end mb-6 gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-neutral-100 flex items-center justify-center shadow-md text-4xl font-bold text-neutral-400">
                  {/* Se tiver foto, usar Image. Senão, Iniciais ou Ícone */}
                  <User size={64} />
              </div>
              <div className="text-center md:text-left mb-2">
                 <h1 className="text-3xl font-bold text-neutral-900">{coach.user.name}</h1>
                 <span className="inline-block bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider mt-1">
                    Head Coach
                 </span>
              </div>
           </div>

           {/* Bio e Informações */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Coluna da Esquerda: Bio */}
              <div className="md:col-span-2 space-y-4">
                 <h2 className="text-lg font-bold text-neutral-800 border-b border-neutral-100 pb-2">Sobre</h2>
                 <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                    {coach.bio || "Este coach ainda não adicionou uma biografia."}
                 </p>
              </div>

              {/* Coluna da Direita: Contatos (Cards) */}
              <div className="space-y-4">
                 <h2 className="text-lg font-bold text-neutral-800 border-b border-neutral-100 pb-2">Contatos</h2>
                 
                 {coach.user.email && (
                    <a href={`mailto:${coach.user.email}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all group">
                       <div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Mail size={20} />
                       </div>
                       <div className="overflow-hidden">
                          <p className="text-xs text-neutral-500 font-semibold uppercase">Email</p>
                          <p className="text-sm font-medium text-neutral-800 truncate">{coach.user.email}</p>
                       </div>
                    </a>
                 )}

                 {coach.instagram && (
                    <a 
                      href={`https://instagram.com/${coach.instagram.replace('@', '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all group"
                    >
                       <div className="bg-pink-50 text-pink-600 p-2 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition-colors">
                          <Instagram size={20} />
                       </div>
                       <div>
                          <p className="text-xs text-neutral-500 font-semibold uppercase">Instagram</p>
                          <p className="text-sm font-medium text-neutral-800 flex items-center gap-1">
                             {coach.instagram} <ExternalLink size={12} className="text-neutral-400"/>
                          </p>
                       </div>
                    </a>
                 )}

                 {coach.phone_number && (
                    <a 
                       href={`https://wa.me/55${coach.phone_number.replace(/\D/g, '')}`} 
                       target="_blank"
                       className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all group"
                    >
                       <div className="bg-green-50 text-green-600 p-2 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                          <Phone size={20} />
                       </div>
                       <div>
                          <p className="text-xs text-neutral-500 font-semibold uppercase">WhatsApp</p>
                          <p className="text-sm font-medium text-neutral-800">{coach.phone_number}</p>
                       </div>
                    </a>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}