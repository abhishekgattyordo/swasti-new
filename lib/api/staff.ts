// lib/api/staff.ts
import api from './client';

export const staffApi = {
  // Get all staff members
  getAllStaff: async (params?: { role?: string; department?: string; status?: string; search?: string }) => {
    const response = await api.get('/api/admin/staff', { params });
    return response.data;
  },
  
  // Get single staff member
  getStaffById: async (id: number) => {
    const response = await api.get(`/api/admin/staff/${id}`);
    return response.data;
  },
  
  // Create new staff member with optional file
  createStaff: async (data: any) => {
    // If there's an avatar file, use FormData
    if (data.avatar || data instanceof FormData) {
      const response = await api.post('/api/admin/staff', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    // Otherwise send as JSON
    const response = await api.post('/api/admin/staff', data);
    return response.data;
  },
  
  // Update staff member
  updateStaff: async (id: number, data: any) => {
    const response = await api.put(`/api/admin/staff/${id}`, data);
    return response.data;
  },
  
  // Delete staff member
  deleteStaff: async (id: number) => {
    const response = await api.delete(`/api/admin/staff/${id}`);
    return response.data;
  },
  
  // Check email uniqueness
  checkEmail: async (email: string, excludeId?: number) => {
    const response = await api.get('/api/admin/staff/check-email', { params: { email, excludeId } });
    return response.data;
  },
  
  // Check employee ID uniqueness
  checkEmployeeId: async (employeeId: string, excludeId?: number) => {
    const response = await api.get('/api/admin/staff/check-employeeid', { params: { id: employeeId, excludeId } });
    return response.data;
  },
};