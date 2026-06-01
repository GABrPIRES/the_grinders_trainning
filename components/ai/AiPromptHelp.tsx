'use client';

import { Info } from 'lucide-react';

/**
 * Bloco informativo mostrando exatamente o payload que enviamos ao Gemini
 * em cada execução da IA, além dos placeholders que podem ser interpolados
 * no system prompt.
 *
 * Usado em /admin/ai-config e em /coach/settings (seção "Personalização da IA")
 * para que quem está escrevendo o prompt saiba quais campos pode referenciar.
 *
 * Mantenha em sincronia com:
 *   - app/services/ai_load_payload_builder.rb (montagem do payload)
 *   - app/services/gemini_client.rb (DEFAULT_SYSTEM_PROMPT — bloco INPUT)
 */
export default function AiPromptHelp() {
  return (
    <div className="border border-line bg-surface-subtle rounded-lg p-3 text-xs space-y-3">
      <div className="flex items-start gap-2">
        <Info size={14} className="text-content-muted shrink-0 mt-0.5" />
        <div>
          <p className="font-bold uppercase text-content-secondary mb-1">
            O que a IA recebe a cada execução
          </p>
          <p className="text-content-tertiary leading-relaxed">
            Quando o aluno responde o formulário semanal, enviamos ao Gemini um JSON com:
          </p>
        </div>
      </div>

      <ol className="space-y-2 text-content-secondary pl-5 list-decimal">
        <li>
          <code className="font-mono text-content-primary">periodization_goal</code>{' '}
          <span className="text-content-tertiary">— objetivo da próxima semana:</span>{' '}
          <code className="font-mono">"overload"</code> | <code className="font-mono">"maintenance"</code> | <code className="font-mono">"deload"</code>
        </li>

        <li>
          <code className="font-mono text-content-primary">weekly_feedback</code>{' '}
          <span className="text-content-tertiary">— formulário que o aluno preencheu no fim da semana:</span>
          <ul className="list-disc pl-5 mt-1 space-y-0.5 text-content-tertiary">
            <li><code className="font-mono">sleep_level</code> (1-10)</li>
            <li><code className="font-mono">stress_level</code> (1-10)</li>
            <li><code className="font-mono">diet_level</code> (1-10)</li>
            <li><code className="font-mono">body_weight</code> (kg)</li>
            <li><code className="font-mono">training_desire</code> (1-10)</li>
            <li><code className="font-mono">general_evaluation</code> (texto livre)</li>
          </ul>
        </li>

        <li>
          <code className="font-mono text-content-primary">treinos[]</code>{' '}
          <span className="text-content-tertiary">— todos os treinos da semana, com:</span>
          <ul className="list-disc pl-5 mt-1 space-y-0.5 text-content-tertiary">
            <li><code className="font-mono">treino_id</code>, <code className="font-mono">treino_name</code></li>
            <li>
              <code className="font-mono">exercises[]</code> — cada exercício com:
              <ul className="list-[circle] pl-5 space-y-0.5">
                <li><code className="font-mono">exercise_name</code></li>
                <li><code className="font-mono">observation</code> <span className="opacity-70">(observação livre do aluno sobre o exercício)</span></li>
                <li>
                  <code className="font-mono">sections[]</code> — cada série com:
                  <ul className="list-[square] pl-5 space-y-0.5">
                    <li><code className="font-mono">section_id</code>, <code className="font-mono">reps</code></li>
                    <li><code className="font-mono">prescribed_load</code> <span className="opacity-70">(o que o coach pediu)</span></li>
                    <li><code className="font-mono">actual_load</code> <span className="opacity-70">(o que o aluno fez)</span></li>
                    <li><code className="font-mono">expected_rpe</code> / <code className="font-mono">actual_rpe</code></li>
                    <li><code className="font-mono">completed</code> (true/false)</li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ol>

      <div className="border-t border-line pt-3">
        <p className="font-bold uppercase text-content-secondary mb-1.5">
          Placeholders disponíveis no prompt
        </p>
        <p className="text-content-tertiary leading-relaxed mb-2">
          Substituídos pelos valores configurados antes de enviar ao Gemini:
        </p>
        <div className="flex flex-wrap gap-1.5">
          <code className="font-mono text-content-primary bg-surface-app border border-line px-2 py-0.5 rounded">{'{{max_load_increase_pct}}'}</code>
          <code className="font-mono text-content-primary bg-surface-app border border-line px-2 py-0.5 rounded">{'{{critical_delta_pct}}'}</code>
          <code className="font-mono text-content-primary bg-surface-app border border-line px-2 py-0.5 rounded">{'{{sleep_threshold}}'}</code>
          <code className="font-mono text-content-primary bg-surface-app border border-line px-2 py-0.5 rounded">{'{{stress_threshold}}'}</code>
        </div>
      </div>
    </div>
  );
}
