'use client';

import { useState } from 'react';
import { X, Send, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import { weeklyFeedbackService, WeeklyFeedbackPayload } from '@/services/weeklyFeedbackService';

interface WeeklyFeedbackModalProps {
  weekId: string;
  incompleteTreinos?: string[];
  onClose: () => void;
  onSubmitted: () => void;
}

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
}

function SliderField({ label, value, onChange, lowLabel = 'Baixo', highLabel = 'Alto' }: SliderFieldProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-semibold text-neutral-700">{label}</label>
        <span className="text-sm font-bold text-red-700 w-6 text-center">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-red-600 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export default function WeeklyFeedbackModal({ weekId, incompleteTreinos = [], onClose, onSubmitted }: WeeklyFeedbackModalProps) {
  const [sleepLevel, setSleepLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [dietLevel, setDietLevel] = useState(5);
  const [trainingDesire, setTrainingDesire] = useState(5);
  const [bodyWeight, setBodyWeight] = useState('');
  const [generalEvaluation, setGeneralEvaluation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snoozing, setSnoozing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload: WeeklyFeedbackPayload = {
        week_id: weekId,
        sleep_level: sleepLevel,
        stress_level: stressLevel,
        diet_level: dietLevel,
        training_desire: trainingDesire,
        general_evaluation: generalEvaluation || undefined,
      };
      if (bodyWeight && !isNaN(parseFloat(bodyWeight))) {
        payload.body_weight = parseFloat(bodyWeight);
      }
      await weeklyFeedbackService.create(payload);
      // Notifica componentes globais (banner do layout, dashboard, etc.) que o
      // formulário foi enviado para que sumam sem precisar de reload.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('weekly-feedback-submitted', { detail: { weekId } }));
      }
      onSubmitted();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSnooze = async () => {
    setSnoozing(true);
    try {
      await weeklyFeedbackService.snooze(weekId);
      onClose();
    } catch {
      onClose();
    } finally {
      setSnoozing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="bg-neutral-900 text-white p-5 flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg">Avaliação Semanal</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Como foi sua semana? Leva menos de 1 minuto.</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors mt-0.5">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">

          {incompleteTreinos.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Treinos não concluídos esta semana:</p>
                <p className="text-xs text-amber-700 mt-0.5">{incompleteTreinos.join(', ')}</p>
                <p className="text-xs text-amber-600 mt-1">Você ainda pode enviar a avaliação, mas considere informar o coach nas observações.</p>
              </div>
            </div>
          )}

          <SliderField label="Qualidade do Sono" value={sleepLevel} onChange={setSleepLevel} lowLabel="Péssimo" highLabel="Ótimo" />
          <SliderField label="Nível de Estresse" value={stressLevel} onChange={setStressLevel} lowLabel="Baixo" highLabel="Alto" />
          <SliderField label="Qualidade da Dieta" value={dietLevel} onChange={setDietLevel} lowLabel="Péssima" highLabel="Ótima" />
          <SliderField label="Vontade de Treinar" value={trainingDesire} onChange={setTrainingDesire} lowLabel="Nenhuma" highLabel="Muita" />

          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-1">Peso Corporal (kg) <span className="text-neutral-400 font-normal">— opcional</span></label>
            <input
              type="number"
              step="0.1"
              placeholder="Ex: 82.5"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              className="w-full border border-neutral-300 rounded-xl p-3 text-sm text-neutral-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-1">Observações <span className="text-neutral-400 font-normal">— opcional</span></label>
            <textarea
              rows={3}
              placeholder="Alguma dor, lesão ou comentário para o coach?"
              value={generalEvaluation}
              onChange={(e) => setGeneralEvaluation(e.target.value)}
              className="w-full border border-neutral-300 rounded-xl p-3 text-sm text-neutral-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-800 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            {submitting ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
          <button
            onClick={handleSnooze}
            disabled={snoozing}
            className="w-full text-neutral-500 text-sm font-medium py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <Clock size={14} />
            {snoozing ? 'Aguarde...' : 'Responder depois'}
            <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
