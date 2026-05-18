'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ClipboardList, X } from 'lucide-react';
import { weeklyFeedbackService, PendingFeedback } from '@/services/weeklyFeedbackService';
import WeeklyFeedbackModal from '@/components/modals/WeeklyFeedbackModal';

export default function FeedbackAlertBanner() {
  const pathname = usePathname();
  const [pending, setPending] = useState<PendingFeedback | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
    weeklyFeedbackService
      .pending()
      .then((res) => setPending(res))
      .catch(() => {});
  }, [pathname]);

  // Escuta o evento global despachado quando qualquer instância do modal
  // submete o formulário com sucesso, para sumir sem precisar reload.
  useEffect(() => {
    const handler = () => setPending({ pending: false });
    window.addEventListener('weekly-feedback-submitted', handler);
    return () => window.removeEventListener('weekly-feedback-submitted', handler);
  }, []);

  if (!pending?.pending || dismissed) return null;

  return (
    <>
      <div className="bg-semantic-warning-bg border-b border-semantic-warning-border px-4 py-3 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <ClipboardList size={18} className="text-semantic-warning-text flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-content-primary">
              Você tem um formulário semanal para preencher!
            </p>
            {pending.date_range_label && (
              <p className="text-xs text-semantic-warning-text mt-0.5">
                Semana de <span className="font-medium">{pending.date_range_label}</span>
              </p>
            )}
            {pending.incomplete_treinos && pending.incomplete_treinos.length > 0 && (
              <p className="text-xs text-semantic-warning-text mt-0.5">
                Treinos pendentes: <span className="font-medium">{pending.incomplete_treinos.join(', ')}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Preencher agora
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-semantic-warning-text hover:text-content-primary transition-colors"
            aria-label="Dispensar"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {showModal && pending.week_id && (
        <WeeklyFeedbackModal
          weekId={pending.week_id}
          dateRangeLabel={pending.date_range_label}
          incompleteTreinos={pending.incomplete_treinos}
          onClose={() => setShowModal(false)}
          onSubmitted={() => {
            setShowModal(false);
            setPending({ pending: false });
          }}
        />
      )}
    </>
  );
}
