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
}

export interface ExercicioDiff {
  exercicio_id: string;
  exercicio_name: string;
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
