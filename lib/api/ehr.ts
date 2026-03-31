import api from './client';

// Visit type (adjust fields if needed)
export interface Visit<T = any>  {
  id?: string;

  diagnosis?: string;
  icd10_code?: string;
  clinical_notes?: string;
  follow_up_date?: string;
  patient_instructions?: string;

  doctor_id?: number;
  doctor_name?: string;
  doctor_specialty?: string;

  appointment_date?: string;
  appointment_time?: string;
    data?: T;

  created_at?: string;
  updated_at?: string;
  success: boolean;
}


export interface ApiVisit {
  appointment_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  status: string;
  notes: string;
  doctor_name: string;
  doctor_specialty: string;
  diagnosis: string | null;
  icd10_code: string | null;
  clinical_notes: string | null;
  follow_up_date: string | null;
  patient_instructions: string | null;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}


export type GetVisitsResponse = ApiVisit[];

 
export const currentVisitApi = {
  getCurrentVisit: async (
    patientId: string,
    appointmentId?: string
  ): Promise<Visit> => {  // ✅ Return the raw Visit object, not ApiResponse<Visit>
    const url = appointmentId
      ? `/api/ehr/${patientId}/current-visit?appointmentId=${appointmentId}`
      : `/api/ehr/${patientId}/current-visit`;
    const response = await api.get(url);
    return response.data; // raw data (e.g., { diagnosis, follow_up_date, ... })
  },

  saveCurrentVisit: (patientId: string, data: any) => 
    api.post(`/api/ehr/${patientId}/current-visit`, data),

  getCurrentVisitByDate: async (
    patientId: string,
    date: string
  ): Promise<Visit> => {  // ✅ Also return raw Visit
    const res = await api.get(`/api/ehr/${patientId}/current-visit?date=${date}`);
    return res.data;
  },
getCompletedVisits: async (patientId: string): Promise<GetVisitsResponse> => {
  const res = await api.get<GetVisitsResponse>(
    `/api/ehr/${patientId}/visits`
  );
  return res.data;
},
// ------------------vitals-----------------
       getVitalsByDate: async (patientId: string, date: string) => {
    const response = await api.get(`/api/ehr/${patientId}/vitals?date=${date}`);
    return response.data;
  },
  
  saveVitals: (patientId: string, data: any) =>
    api.post(`/api/ehr/${patientId}/vitals`, data),

   updateVital: (patientId: string, vitalId: string, data: any) =>
    api.put(`/api/ehr/${patientId}/vitals?vitalId=${vitalId}`, data),

deleteVital: (patientId: string, vitalId: string) =>
  api.delete(`/api/ehr/${patientId}/vitals?vitalId=${vitalId}`),
  //  -----------------prescription------------------------

  // Inside currentVisitApi object

getPrescriptionsByDate: async (patientId: string, date: string) => {
  const response = await api.get(`/api/ehr/${patientId}/prescriptions?date=${date}`);
  return response.data; // returns { success, data }
},

savePrescriptions: (patientId: string, data: any) =>
  api.post(`/api/ehr/${patientId}/prescriptions`, data),

updatePrescription: (patientId: string, prescriptionId: string, data: any) =>
  api.put(`/api/ehr/${patientId}/prescriptions?prescriptionId=${prescriptionId}`, data),

deletePrescription: (patientId: string, prescriptionId: string) =>
  api.delete(`/api/ehr/${patientId}/prescriptions?prescriptionId=${prescriptionId}`),
};



