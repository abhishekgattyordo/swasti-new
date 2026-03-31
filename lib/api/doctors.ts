import api from './client';


interface SlotsResponse {
  success: boolean;
  date: string;
  doctor_id: string;
  slots: string[];
}
interface UpdateDoctorResponse {
  success: boolean;
  message: string;
  data: any;
  errors?: any;
}
interface GetDoctorResponse {
  success: boolean;
  message: string;
  data: any; // you can later replace with Doctor type
}
interface DeleteDoctorResponse {
  success: boolean;
  message: string;
}

interface BulkImportResponse {
  success: boolean;
  message: string;
  data: { id: number; name: string }[];
}


export const doctorsApi = {
  getDoctors: (params?: any) => api.get('/api/doctors', { params }),
getDoctor: async (id: number): Promise<GetDoctorResponse> => {
  const res = await api.get(`/api/doctors/${id}`);
  return res as unknown as GetDoctorResponse; // ✅ same pattern
},

  createDoctor: (data: FormData) => api.post('/api/doctors', data),
updateDoctor: async (id: number, data: any): Promise<UpdateDoctorResponse> => {
  const res = await api.put(
    `/api/doctors/${id}`,
    data
  );
  return res as unknown as UpdateDoctorResponse; // ✅ same as delete
},
 deleteDoctor: async (id: number): Promise<DeleteDoctorResponse> => {
  const res = await api.delete(`/api/doctors/${id}`);
  return res as unknown as DeleteDoctorResponse; // ✅ same pattern
},
    getSpecialties: () => api.get('/api/doctors/specialties'),
  getSlots: (doctorId: number, date: string): Promise<SlotsResponse> =>
    api.get(`/api/doctors-appoitment/${doctorId}/slots?date=${date}`),

     importDoctors: (doctors: any[]): Promise<BulkImportResponse> =>
    api.post('/api/doctors/bulk', { doctors }),
};