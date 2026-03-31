import api from './client';
import { getWards, getRooms, getBeds } from './bed-config';


type BedStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning';

interface RawAdmissionResponse {
  success: boolean;
  message: string;
  data: {
    admissionId: number;
    patientId: string;
  };
  generatedPassword?: string; // optional if exists
}


export interface ActiveAdmissionData {
  admission_id: number;
  admission_date: string;
  ward_name: string;
  bed_number?: string;
}

export interface GetActiveAdmissionResponse {
  success: boolean;
  admission_id: number;
  admission_date: string;
  ward_name: string;
  bed_number?: string;
}

export const admissionsApi = {
  getWards: () => getWards(),
  getRooms: (wardId: number) => getRooms(wardId),
 getBeds: (params: { ward_id?: number; room_id?: number; status?: BedStatus }) => getBeds(params),

  // Search patient by phone
  searchPatient: (phone: string) => api.get(`/api/registration?phone=${encodeURIComponent(phone)}`),

  // Create admission – flatten the response so that admissionId, patientId are at root
  createAdmission: (data: any): Promise<RawAdmissionResponse> => 
  api.post('/api/helpdesk/admissions', data),

  getDoctors: (params?: any) => api.get('/api/doctors', { params }),

getActiveAdmission: (patientId: string): Promise<GetActiveAdmissionResponse> =>
  api.get(`/api/helpdesk/admissions/active/${patientId}`).then(res => res.data),
};