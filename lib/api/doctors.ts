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


interface MyPatientsResponse {
  success: boolean;
  data: any[];
  count: number;
  stats: {
    total_patients: string;
    active_patients: string;
    discharged_patients: string;
  };
}

interface MyPatientsParams {
  doctorId?: string;
  doctorName?: string;
  status?: string;
  search?: string;
}

interface WardNursesResponse {
  success: boolean;
  data: any[];
  count: number;
  patient: {
    id: string;
    ward: {
      id: number;
      name: string;
      type: string;
    };
  };
  ward: {
    id: number;
    name: string;
    type: string;
  };
  stats: {
    total_nurses: string;
    active_nurses: string;
  };
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


     getMyPatients: async (params: MyPatientsParams): Promise<MyPatientsResponse> => {
    const response = await api.get('/api/doctors/my-patients', { params });
    return response.data;
  },

   getWardNurses: async (patientId: string): Promise<WardNursesResponse> => {
    const response = await api.get('/api/doctors/ward-nurses', { 
      params: { patientId } 
    });
    return response.data;
  },

  // Get tasks for a patient
getTasks: async (patientId: string, params?: { status?: string; assignedTo?: string }) => {
  const response = await api.get('/api/doctors/tasks', { params: { patientId, ...params } });
  return response.data;
},

// Create task
createTask: async (data: {
  patientId: string;
  taskType: string;
  title: string;
  description?: string;
  priority?: string;
  dueDate: string;
  dueTime: string;
  assignedTo: string;
  assignedBy?: string;
  notes?: string;
  customTaskType?: string;
}) => {
  const response = await api.post('/api/doctors/tasks', data);
  return response.data;
},

// Update task (complete, add result)
updateTask: async (id: string, data: { status?: string; result?: string; completedBy?: string; notes?: string }) => {
  const response = await api.put('/api/doctors/tasks', { id, ...data });
  return response.data;
},

// Delete task
deleteTask: async (id: string) => {
  const response = await api.delete(`/api/doctors/tasks?id=${id}`);
  return response.data;
},


};