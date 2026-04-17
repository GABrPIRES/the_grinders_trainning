'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ClipboardList, X } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import WeeklyFeedbackModal from '@/components/modals/WeeklyFeedbackModal';

interface PendingResult {
  pending: boolean;
  week_id?: string;
  deadline_at?: string;
  incomplete_treinos?: string[];
}

export default function FeedbackAlertBanner() {
  const pathname = usePathname();
  const [pending, setPending] = useState<PendingResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
    fetchWithAuth('weekly_feedbacks/pending')
      .then((res: PendingResult) => setPending(res))
      .catch(() => {});
  }, [pathname]);

  if (!pending?.pending || dismissed) return null;

  return (
    <>
      <div className="bg-amber-50 border-b border-amber-300 px-4 py-3 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <ClipboardList size={18} className="text-amber-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-900">
              Você tem um formulário semanal para preencher!
            </p>
            {pending.incomplete_treinos && pending.incomplete_treinos.length > 0 && (
              <p className="text-xs text-amber-700 mt-0.5">
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
            className="text-amber-500 hover:text-amber-700 transition-colors"
            aria-label="Dispensar"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {showModal && pending.week_id && (
        <WeeklyFeedbackModal
          weekId={pending.week_id}
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
