// services/coachService.ts
import { fetchWithAuth } from '@/lib/api';

export const coachService = {
  async getInviteSettings() {
    return await fetchWithAuth('coach/invite');
  },

  async updateSettings(autoApprove: boolean) {
    return await fetchWithAuth('coach/settings', {
      method: 'PUT',
      // Sending directly matches the fallback in the controller
      body: JSON.stringify({ auto_approve_students: autoApprove }) 
    });
  },

  async getPendingStudents() {
    return await fetchWithAuth('coach/approvals');
  },

  async handleApproval(studentId: string | number, action: 'approve' | 'reject') {
    return await fetchWithAuth(`coach/approvals/${studentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action_type: action })
    });
  }
};