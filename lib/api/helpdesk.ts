import api from './client';

export const helpdeskApi = {
  createAppointment: async (data: any) => {
    const response = await api.post('/api/helpdesk/appointments', data);
    return response.data;
  },

 getAdmissions: async (params?: { search?: string; status?: string }) => {
    const response = await api.get('/api/helpdesk/admissions', { params });
    // response.data is { success: true, data: [...] }
    return response.data;
  },
};