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

export const weeklyFeedbackService = {
  async pending() {
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
