import { fetchWithAuth } from '@/lib/api';

export const notificationsService = {
  async index() {
    return await fetchWithAuth('notifications');
  },

  async markRead(notificationId: string) {
    return await fetchWithAuth(`notifications/${notificationId}/read`, { method: 'POST' });
  },
};
