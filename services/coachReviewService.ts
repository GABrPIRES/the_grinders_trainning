import { fetchWithAuth } from '@/lib/api';

export interface SectionDiff {
  section_id: string;
  reps: number | null;
  series: number | null;
  load_unit: string | null;
  prescribed_load: number | null;
  suggested_load: number | null;
  suggestion_id: string | null;
  suggestion_status: string | null;
  critical: boolean;
  // Contexto da semana anterior (carga/RPE que o aluno preencheu nesta série)
  previous_prescribed_load: number | null;
  previous_prescribed_rpe: number | null;
  previous_actual_load: number | null;
  previous_actual_rpe: number | null;
}

export interface ExercicioDiff {
  exercicio_id: string;
  exercicio_name: string;
  // Observação do aluno na semana anterior
  previous_observation: string | null;
  // Status de feito (clique do botão "feito" no exercicio inteiro)
  previous_feito: boolean | null;
  sections: SectionDiff[];
}

export interface TreinoReview {
  treino_id: string;
  treino_name: string;
  treino_day: string | null;
  status: string;
  ai_observation: string | null;
  exercicios: ExercicioDiff[];
}

export interface SectionOverride {
  id: string;
  load: number;
}

export const coachReviewService = {
  async reviewTreino(treinoId: string): Promise<TreinoReview> {
    return await fetchWithAuth(`coach/treinos/${treinoId}/review`);
  },

  async approveTreino(treinoId: string, sections?: SectionOverride[]) {
    return await fetchWithAuth(`coach/treinos/${treinoId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ sections: sections ?? [] }),
    });
  },

  async publishTreino(treinoId: string) {
    return await fetchWithAuth(`coach/treinos/${treinoId}/publish`, { method: 'POST' });
  },

  async toggleFeedback(weekId: string) {
    return await fetchWithAuth(`weeks/${weekId}/toggle_feedback`, { method: 'PATCH' });
  },
};
