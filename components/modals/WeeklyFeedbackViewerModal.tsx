'use client';

import { useState } from 'react';
import { X, Trash2, Moon, Brain, Apple, Scale, Flame, MessageSquare } from 'lucide-react';
import {
  coachWeeklyFeedbackService,
  WeeklyFeedbackResponse,
} from '@/services/coachWeeklyFeedbackService';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

interface Props {
  feedback: WeeklyFeedbackResponse;
  onClose: () => void;
  onDeleted: () => void;
}

function FieldRow({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null;
  suffix?: string;
}) {
  const isEmpty = value === null || value === '' || value === undefined;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-line last:border-b-0">
      <div className="p-2 bg-surface-subtle text-brand rounded-lg border border-line shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-content-muted uppercase tracking-wide">{label}</p>
        <p className="text-sm text-content-primary mt-0.5 break-words">
          {isEmpty ? (
            <span className="text-content-muted italic">não informado</span>
          ) : (
            `${value}${suffix ?? ''}`
          )}
        </p>
      </div>
    </div>
  );
}

export default function WeeklyFeedbackViewerModal({ feedback, onClose, onDeleted }: Props) {
  const { showToast, ToastEl } = useToast();
  const { showConfirm, ConfirmEl } = useConfirm();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const ok = await showConfirm({
      message:
        'Esta ação é irreversível. O aluno verá o formulário novamente (se a semana ainda estiver ativa). Continuar?',
      confirmLabel: 'Remover',
      cancelLabel: 'Cancelar',
      danger: true,
    });
    if (!ok) return;

    setDeleting(true);
    try {
      await coachWeeklyFeedbackService.delete(feedback.id);
      showToast('Formulário removido.');
      onDeleted();
    } catch {
      showToast('Erro ao remover formulário.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
        <div className="bg-surface-elevated rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md flex flex-col max-h-[92vh] overflow-hidden">
          {/* Header */}
          <div className="bg-neutral-900 text-white p-5 flex justify-between items-start flex-shrink-0">
            <div>
              <h3 className="font-bold text-lg">Formulário Respondido</h3>
              <p className="text-xs text-neutral-300 mt-0.5">Avaliação semanal do aluno</p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors mt-0.5"
              aria-label="Fechar"
            >
              <X size={22} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1 text-content-primary">
            <FieldRow icon={<Moon size={16} />} label="Sono" value={feedback.sleep_level} suffix=" / 10" />
            <FieldRow icon={<Brain size={16} />} label="Estresse" value={feedback.stress_level} suffix=" / 10" />
            <FieldRow icon={<Apple size={16} />} label="Dieta" value={feedback.diet_level} suffix=" / 10" />
            <FieldRow icon={<Flame size={16} />} label="Vontade de treinar" value={feedback.training_desire} suffix=" / 10" />
            <FieldRow icon={<Scale size={16} />} label="Peso corporal" value={feedback.body_weight} suffix=" kg" />
            <FieldRow icon={<MessageSquare size={16} />} label="Observações" value={feedback.general_evaluation} />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-line bg-surface-page">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deleting ? 'Removendo...' : 'Remover formulário'}
            </button>
          </div>
        </div>
      </div>
      {ToastEl}
      {ConfirmEl}
    </>
  );
}
