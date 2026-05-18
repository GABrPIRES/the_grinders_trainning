import { fetchWithAuth } from '@/lib/api';

export interface WeeklyFeedbackPayload {
  week_id: string;
  sleep_level?: number;
  stress_level?: number;
  diet_level?: number;
  training_desire?: number;
  body_weight?: number;
  general_evaluation?: string;
}

export interface PendingFeedback {
  pending: boolean;
  week_id?: string;
  deadline_at?: string;
  incomplete_treinos?: string[];
  start_date?: string;
  end_date?: string;
  date_range_label?: string;
}

export const weeklyFeedbackService = {
  async pending(): Promise<PendingFeedback> {
    return await fetchWithAuth('weekly_feedbacks/pending');
  },

  async create(payload: WeeklyFeedbackPayload) {
    return await fetchWithAuth('weekly_feedbacks', {
      method: 'POST',
      body: JSON.stringify({ weekly_feedback: payload }),
    });
  },

  async snooze(weekId: string) {
    return await fetchWithAuth(`weekly_feedbacks/${weekId}/snooze`, { method: 'POST' });
  },
};
