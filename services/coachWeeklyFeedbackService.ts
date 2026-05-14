import { fetchWithAuth } from '@/lib/api';

export interface WeeklyFeedbackResponse {
  id: string;
  week_id: string;
  aluno_id: string;
  sleep_level: number;
  stress_level: number;
  diet_level: number;
  body_weight: number | null;
  training_desire: number;
  general_evaluation: string | null;
  created_at: string;
}

export const coachWeeklyFeedbackService = {
  getByWeek: (weekId: string): Promise<WeeklyFeedbackResponse> =>
    fetchWithAuth(`coach/weeks/${weekId}/weekly_feedback`),

  delete: (feedbackId: string): Promise<{ message: string }> =>
    fetchWithAuth(`coach/weekly_feedbacks/${feedbackId}`, { method: 'DELETE' }),
};
