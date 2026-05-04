// lib/api/nurse.ts
import api from './client';

// ============================================
// Type Definitions
// ============================================

export interface VitalRecord {
  id?: number;
  patientId: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  spO2: number;
  clinicalNotes?: string;
  status?: 'stable' | 'critical' | 'improving' | 'deteriorating' | 'normal';
  recordedBy?: string;
  nurseId?: string;
  nurseName?: string;
}

export interface VitalResponse {
  id: number;
  timestamp: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  spO2: number;
  clinicalNotes: string;
  status: string;
  recordedBy: string;
}

export interface VitalsApiResponse {
  success: boolean;
  message?: string;
  data: VitalResponse[];
  count: number;
}

export interface RecordVitalsApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    id: number;
    patientId: string;
    bp: string;
    heartRate: number;
    temperature: string;
    respiratoryRate: number;
    spO2: number;
    clinicalNotes: string;
    status: string;
    recordedBy: string;
    recordedAt: string;
    nurseId?: string;
    nurseName?: string;
  };
  // Direct response properties (when API returns data directly)
  id?: number;
  patientId?: string;
  bp?: string;
  heartRate?: number;
  temperature?: string;
  respiratoryRate?: number;
  spO2?: number;
  clinicalNotes?: string;
  status?: string;
  recordedBy?: string;
  recordedAt?: string;
  nurseId?: string;
  nurseName?: string;
}

export interface Patient {
  id: number;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  bed_number: string;
  ward_name: string;
  admission_date: string;
  status: string;
  reason: string;
  diagnosis: string | null;
}

export interface PatientsApiResponse {
  success: boolean;
  data: Patient[];
}

export interface PatientDetailsApiResponse {
  success: boolean;
  data: any;
}

export interface VitalQueryParams {
  patientId: string;
  hours?: number;
  status?: string;
  date?: string;
}

export interface PatientQueryParams {
  search?: string;
  status?: string;
}

export interface NursingNote {
  id: string;
  patientId: string;
  patientName: string;
  bed: string;
  noteType: 'admission' | 'progress' | 'critical' | 'discharge' | 'post-op' | 'intervention';
  title: string;
  content: string;
  priority: 'routine' | 'urgent' | 'critical';
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  tags: string[];
  assessmentFindings?: string;
  interventions?: string;
  patientResponse?: string;
  followUpRequired?: boolean;
}

export interface NursingNotesApiResponse {
  success: boolean;
  message?: string;
  data: NursingNote[];
  count: number;
}

export interface CreateNoteApiResponse {
  success: boolean;
  message: string;
  data: NursingNote;
}

export interface DeleteNoteApiResponse {
  success: boolean;
  message: string;
}

export interface NoteQueryParams {
  noteType?: string;
  priority?: string;
  search?: string;
}

export interface CreateNoteData {
  patientId: string;
  patientName?: string;
  bed?: string;
  noteType: string;
  title: string;
  content: string;
  priority: string;
  tags?: string[];
  assessmentFindings?: string;
  interventions?: string;
  patientResponse?: string;
  followUpRequired?: boolean;
  nurseId?: string;
  nurseName?: string;
}

export interface HandoverPatient {
  patientId: string;
  patientName: string;
  bed: string;
  currentStatus: string;
  pendingTasks: string[];
  medicationsDue: string[];
  labTestsPending: string[];
  doctorInstructions: string;
  familyCommunication: string;
  specialNotes: string;
  additionalNotes?: string;
}

export interface CreateHandoverData {
  fromNurse: string;
  toNurse: string;
  fromShift: string;
  toShift: string;
  generalNotes?: string;
  equipmentStatus?: string;
  emergencySupplies?: string;
  checklist?: string[];
  patients: HandoverPatient[];
  nurseId?: string;
  nurseName?: string;
}

export interface HandoverResponse {
  success: boolean;
  message: string;
  data: any;
}

// ============================================
// API Methods
// ============================================

export const nurseApi = {
  // Get vitals for a patient
  getVitals: async (
    patientId: string, 
    hours?: number, 
    status?: string,
    date?: string  // NEW: optional date parameter
  ): Promise<VitalsApiResponse> => {
    try {
      const params: any = { patientId };
      
      if (date) {
        // When date is provided, send date
        params.date = date;
      } else {
        // Otherwise send hours (default 24)
        params.hours = hours || 24;
      }
      
      if (status) {
        params.status = status;
      }
      
      const response = await api.get<VitalsApiResponse>('/api/nurse/vitals', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching vitals:', error);
      throw error;
    }
  },

  // Record new vitals
  recordVitals: async (data: VitalRecord): Promise<RecordVitalsApiResponse> => {
    try {
      const response = await api.post<RecordVitalsApiResponse>('/api/nurse/vitals', data);
      return response.data;
    } catch (error) {
      console.error('Error recording vitals:', error);
      throw error;
    }
  },

  // Get patient details
  getPatientDetails: async (patientId: string): Promise<PatientDetailsApiResponse> => {
    try {
      const response = await api.get<PatientDetailsApiResponse>(`/api/nurse/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw error;
    }
  },

  // Get all patients for nurse (active admissions)
  getPatients: async (params?: PatientQueryParams): Promise<PatientsApiResponse> => {
    try {
      const response = await api.get<PatientsApiResponse>('/api/helpdesk/admissions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get nursing notes
getNotes: async (patientId: string, params?: NoteQueryParams) => {
  const response = await api.get('/api/nurse/notes', { params: { patientId, ...params } });
  return response.data;
},

// Create nursing note
createNote: async (data: CreateNoteData) => {
  const response = await api.post('/api/nurse/notes', data);
  return response.data;
},

// Delete nursing note
deleteNote: async (noteId: string) => {
  const response = await api.delete(`/api/nurse/notes?id=${noteId}`);
  return response.data;
},

getHandover: async (params?: { id?: string; date?: string; status?: string }) => {
  const response = await api.get('/api/nurse/handover', { params });
  return response.data;
},

createHandover: async (data: CreateHandoverData) => {
  const response = await api.post('/api/nurse/handover', data);
  return response.data;
},

acknowledgeHandover: async (handoverId: string, acknowledgedBy: string) => {
  const response = await api.put('/api/nurse/handover', { handoverId, acknowledgedBy });
  return response.data;
},

getMyWardPatients: async (nurseId: string, params?: { status?: string; search?: string }) => {
  const response = await api.get('/api/nurse/ward-patients', { 
    params: { nurseId, ...params } 
  });
  return response.data;
},

// Get medication administrations
getMedications: async (patientId: string, status?: string) => {
  const response = await api.get('/api/nurse/medications', { 
    params: { patientId, status } 
  });
  return response.data;
},

// Record medication administration
administerMedication: async (data: {
  patientId: string;
  medicationName: string;
  dosage: string;
  route: string;
  scheduledTime: string;
  duration?: string;
   frequency?: string;
  notes?: string;
  nurseId?: string;
  nurseName?: string;
    prescribedBy?: string;
      prescribedById?: string;
}) => {
  const response = await api.post('/api/nurse/medications', data);
  return response.data;
},

updateMedicationStatus: async (data: {
  id: string;
  status: string;
  notes?: string;
  nurseId?: string;
  nurseName?: string;
}) => {
  const response = await api.put('/api/nurse/medications', data);
  return response.data;
},

// ✅ Tasks
getTasks: async (patientId: string, params?: { status?: string }) => {
  const response = await api.get('/api/doctors/tasks', { params: { patientId, ...params } });
  return response.data;
},

updateTask: async (id: string, data: { status: string; result?: string; completedBy?: string }) => {
  const response = await api.put('/api/doctors/tasks', { id, ...data });
  return response.data;
},

};