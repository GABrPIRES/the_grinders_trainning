import { fetchWithAuth } from '@/lib/api';

export const treinoService = {
  async start(treinoId: string) {
    return await fetchWithAuth(`treinos/${treinoId}/start`, { method: 'POST' });
  },

  async finish(treinoId: string) {
    return await fetchWithAuth(`treinos/${treinoId}/finish`, { method: 'POST' });
  },

  async logSection(sectionId: string, payload: { actual_load?: number | null; actual_rpe?: number | null; feito?: boolean }) {
    return await fetchWithAuth(`sections/${sectionId}/log`, {
      method: 'PUT',
      body: JSON.stringify({ section: payload }),
    });
  },

  async logExercicio(exercicioId: string, observation: string) {
    return await fetchWithAuth(`exercicios/${exercicioId}/log`, {
      method: 'PUT',
      body: JSON.stringify({ exercicio: { observation } }),
    });
  },
};
