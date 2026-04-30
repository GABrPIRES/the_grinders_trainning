'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import Image from 'next/image';
import { Instagram, User, ExternalLink, AlertCircle } from 'lucide-react';

interface CoachProfile {
  user: {
    name: string;
    email: string;
  };
  bio: string;
  phone_number: string;
  instagram: string;
}

function CoachSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse pb-24 md:pb-6">
      <div className="bg-surface-elevated rounded-2xl border border-line overflow-hidden">
        <div className="h-28 bg-surface-subtle"></div>
        <div className="px-6 md:px-10 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-8">
            <div className="w-32 h-32 rounded-full bg-surface-subtle border-4 border-surface-elevated"></div>
            <div className="space-y-2 text-center md:text-left">
              <div className="h-8 bg-surface-subtle rounded-lg w-48"></div>
              <div className="h-5 bg-surface-subtle rounded-full w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="h-5 bg-surface-subtle rounded w-16"></div>
              <div className="h-4 bg-surface-subtle rounded w-full"></div>
              <div className="h-4 bg-surface-subtle rounded w-5/6"></div>
              <div className="h-4 bg-surface-subtle rounded w-4/6"></div>
            </div>
            <div className="space-y-3">
              <div className="h-5 bg-surface-subtle rounded w-20"></div>
              <div className="h-14 bg-surface-subtle rounded-xl"></div>
              <div className="h-14 bg-surface-subtle rounded-xl"></div>
              <div className="h-14 bg-surface-subtle rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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

  if (loading) return <CoachSkeleton />;

  if (error) return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-start gap-3 bg-semantic-error-bg border border-semantic-error-border rounded-xl px-5 py-4">
        <AlertCircle size={18} className="text-semantic-error-text flex-shrink-0 mt-0.5" />
        <p className="text-sm text-semantic-error-text">{error}</p>
      </div>
    </div>
  );

  if (!coach) return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-surface-elevated border border-line rounded-xl shadow-sm p-12 text-center flex flex-col items-center">
        <User size={48} className="text-content-muted mb-4" />
        <h3 className="text-lg font-bold text-content-primary mb-1">Nenhum coach associado</h3>
        <p className="text-sm text-content-tertiary">Fale com seu coach para ser vinculado.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24 md:pb-6">

      <div className="bg-surface-elevated rounded-2xl shadow-sm border border-line overflow-hidden">

        {/* Faixa de cor no topo */}
        <div className="h-28 bg-gradient-to-r from-red-800 to-red-600"></div>

        <div className="px-6 pb-8 md:px-10">
          {/* Avatar e Nome */}
          <div className="flex flex-col md:flex-row items-center md:items-end mb-8 gap-6 -mt-16">
            <div className="w-32 h-32 rounded-full border-4 border-surface-elevated bg-brand-surface flex items-center justify-center shadow-md text-brand flex-shrink-0">
              <User size={56} />
            </div>
            <div className="text-center md:text-left mb-2">
              <h1 className="text-3xl font-bold text-content-primary">{coach.user.name}</h1>
              <span className="inline-block bg-brand-surface text-brand text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider mt-2">
                Head Coach
              </span>
            </div>
          </div>

          {/* Bio e Contatos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Bio */}
            <div className="md:col-span-2 space-y-3">
              <h2 className="text-lg font-bold text-content-primary border-b border-line pb-2">Sobre</h2>
              <p className="text-sm text-content-secondary leading-relaxed whitespace-pre-wrap">
                {coach.bio || "Este coach ainda não adicionou uma biografia."}
              </p>
            </div>

            {/* Contatos */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-content-primary border-b border-line pb-2">Contatos</h2>

              {coach.user.email && (
                <a
                  href={`mailto:${coach.user.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-subtle border border-transparent hover:border-line transition-all group"
                >
                  <div className="bg-semantic-info-bg p-2 rounded-lg group-hover:bg-semantic-info-text transition-colors flex-shrink-0">
                    <Image src="/images/icons/icon_email.png" alt="Email" width={20} height={20} className="object-contain" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-content-muted uppercase">Email</p>
                    <p className="text-sm font-medium text-content-primary truncate">{coach.user.email}</p>
                  </div>
                </a>
              )}

              {coach.instagram && (
                <a
                  href={`https://instagram.com/${coach.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-subtle border border-transparent hover:border-line transition-all group"
                >
                  <div className="bg-pink-50 text-pink-600 p-2 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition-colors flex-shrink-0">
                    <Instagram size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-content-muted uppercase">Instagram</p>
                    <p className="text-sm font-medium text-content-primary flex items-center gap-1">
                      {coach.instagram} <ExternalLink size={12} className="text-content-muted" />
                    </p>
                  </div>
                </a>
              )}

              {coach.phone_number && (
                <a
                  href={`https://wa.me/55${coach.phone_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-subtle border border-transparent hover:border-line transition-all group"
                >
                  <div className="bg-semantic-success-bg p-2 rounded-lg group-hover:bg-semantic-success-text transition-colors flex-shrink-0">
                    <Image src="/images/icons/icon_whatsapp.png" alt="WhatsApp" width={20} height={20} className="object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-content-muted uppercase">WhatsApp</p>
                    <p className="text-sm font-medium text-content-primary">{coach.phone_number}</p>
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
