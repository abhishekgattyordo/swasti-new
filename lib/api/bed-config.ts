import api from './client';
import {
  Floor,
  Ward,
  Room,
  Bed,
  BulkBedCreate,
  BedSummary,
  BedStatus,
  WardType,
  PatientCategory,
  ApiResponse,
  AdmitData,        
  DischargeData,    
  TransferData 
} from './types';

// ==================== FLOORS ====================
export const getFloors = () => api.get<ApiResponse<Floor[]>>('/api/bed-config/floors/');
export const getFloor = (id: number) => api.get<ApiResponse<Floor>>(`/api/bed-config/floors/${id}/`);
export const createFloor = (data: { floor_number: number; name?: string }) => 
  api.post<ApiResponse<Floor>>('/api/bed-config/floors/', data);
export const updateFloor = (id: number, data: Partial<Floor>) => 
  api.put<ApiResponse<Floor>>(`/api/bed-config/floors/${id}/`, data);
export const deleteFloor = (id: number) => 
  api.delete<ApiResponse>(`/api/bed-config/floors/${id}/`);

// ==================== WARDS ====================
export const getWards = (floorId?: number) => 
  api.get<ApiResponse<Ward[]>>('/api/bed-config/wards/', { params: { floor_id: floorId } });
export const getWard = (id: number) => 
  api.get<ApiResponse<Ward>>(`/api/bed-config/wards/${id}/`);
export const createWard = (data: {
  floor_id: number;
  name: string;
  type: WardType;
  patient_category: PatientCategory;
  description?: string | null;
  daily_rate?: number;  
}) => api.post<ApiResponse<Ward>>('/api/bed-config/wards/', data);
export const updateWard = (id: number, data: Partial<Ward>) => 
  api.put<ApiResponse<Ward>>(`/api/bed-config/wards/${id}/`, data);
export const deleteWard = (id: number) => 
  api.delete<ApiResponse>(`/api/bed-config/wards/${id}/`);

// ==================== ROOMS ====================
export const getRooms = (wardId?: number) => 
  api.get<ApiResponse<Room[]>>('/api/bed-config/rooms/', { params: { ward_id: wardId } });
export const getRoom = (id: number) => 
  api.get<ApiResponse<Room>>(`/api/bed-config/rooms/${id}/`);
export const createRoom = (data: {
  ward_id: number;
  room_number: string;
  name?: string | null;
  description?: string | null;
}) => api.post<ApiResponse<Room>>('/api/bed-config/rooms/', data);
export const updateRoom = (id: number, data: Partial<Room>) => 
  api.put<ApiResponse<Room>>(`/api/bed-config/rooms/${id}/`, data);
export const patchRoom = (id: number, data: Partial<Room>) => 
  api.patch<ApiResponse<Room>>(`/api/bed-config/rooms/${id}/`, data);
export const deleteRoom = (id: number) => 
  api.delete<ApiResponse>(`/api/bed-config/rooms/${id}/`);

// ==================== BEDS ====================
export const getBeds = (params?: { 
  ward_id?: number; 
  room_id?: number; 
  status?: BedStatus;
  is_active?: boolean; 
}) => api.get<ApiResponse<Bed[]>>('/api/bed-config/beds/', { params });
export const getBed = (id: number) => 
  api.get<ApiResponse<Bed>>(`/api/bed-config/beds/${id}/`);
export const createBeds = (data: BulkBedCreate) => 
  api.post<ApiResponse<Bed[]>>('/api/bed-config/beds/', data);
export const createSingleBed = (data: {
  ward_id: number;
  room_id?: number;
  bed_number: string;
  patient_category?: PatientCategory;
  attributes?: Record<string, any>;
}) => api.post<ApiResponse<Bed[]>>('/api/bed-config/beds/', {
  ...data,
  count: 1
});
export const updateBed = (id: number, data: Partial<Bed>) => 
  api.put<ApiResponse<Bed>>(`/api/bed-config/beds/${id}/`, data);
export const patchBed = (id: number, data: Partial<Bed>) => 
  api.patch<ApiResponse<Bed>>(`/api/bed-config/beds/${id}/`, data);
export const updateBedStatus = (id: number, status: BedStatus) => 
  api.patch<ApiResponse<Bed>>(`/api/bed-config/beds/${id}/`, { status });
export const deleteBed = (id: number) => 
  api.delete<ApiResponse>(`/api/bed-config/beds/${id}/`);
export const transferBed = (id: number, newRoomId: number) => 
  api.post<ApiResponse<Bed>>(`/api/bed-config/beds/${id}/transfer/`, { new_room_id: newRoomId });

// ==================== SUMMARY ====================
export const getBedSummary = () => api.get<ApiResponse<BedSummary>>('/api/bed-config/summary/');


// ==================== ADT (ADMISSION, DISCHARGE, TRANSFER) APIs ====================

export const admitPatient = (bedId: number, data: AdmitData) => 
  api.post<ApiResponse<{ bed: Bed; patient: any }>>(`/api/bed-config/beds/${bedId}/admit/`, data);


export const dischargePatient = (bedId: number, data?: DischargeData) => 
  api.post<ApiResponse<Bed>>(`/api/bed-config/beds/${bedId}/discharge/`, data || {});

/**
 * Transfer a patient from one bed to another
 * POST /api/bed-config/beds/:bedId/transfer/
 */
export const transferPatient = (bedId: number, data: TransferData) => 
  api.post<ApiResponse<Bed>>(`/api/bed-config/beds/${bedId}/transfer/`, data);

/**
 * Get patient history for a bed
 * GET /api/bed-config/beds/:bedId/history/
 */
export const getBedPatientHistory = (bedId: number) => 
  api.get<ApiResponse<any[]>>(`/api/bed-config/beds/${bedId}/history/`);

/**
 * Get current patient info for a bed
 * GET /api/bed-config/beds/:bedId/patient/
 */
export const getCurrentPatient = (bedId: number) => 
  api.get<ApiResponse<any>>(`/api/bed-config/beds/${bedId}/patient/`);

// ==================== CONVENIENCE METHODS ====================

/**
 * Mark a bed as cleaning (after discharge)
 */
export const markBedAsCleaning = (bedId: number) => 
  api.patch<ApiResponse<Bed>>(`/api/bed-config/beds/${bedId}/`, { status: 'cleaning' });

/**
 * Mark a bed as available (after cleaning)
 */
export const markBedAsAvailable = (bedId: number) => 
  api.patch<ApiResponse<Bed>>(`/api/bed-config/beds/${bedId}/`, { status: 'available' });

/**
 * Mark a bed as maintenance
 */
export const markBedAsMaintenance = (bedId: number) => 
  api.patch<ApiResponse<Bed>>(`/api/bed-config/beds/${bedId}/`, { status: 'maintenance' });

/**
 * Mark a bed as reserved
 */
export const markBedAsReserved = (bedId: number) => 
  api.patch<ApiResponse<Bed>>(`/api/bed-config/beds/${bedId}/`, { status: 'reserved' });

// ==================== BULK OPERATIONS ====================

/**
 * Bulk update bed status
 */
export const bulkUpdateBedStatus = (data: { bed_ids: number[]; status: BedStatus }) => 
  api.post<ApiResponse>('/api/bed-config/beds/bulk-status-update/', data);

/**
 * Export bed configuration
 */
export const exportBedConfig = () => 
  api.get('/api/bed-config/export/', { responseType: 'blob' });

/**
 * Import bed configuration
 */
export const importBedConfig = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/bed-config/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// ==================== DASHBOARD & ANALYTICS ====================

/**
 * Get occupancy forecast
 */
export const getOccupancyForecast = () => 
  api.get<ApiResponse<Array<{ hour: string; occupancy: number }>>>('/api/bed-config/forecast/');

/**
 * Get recent activity
 */
export const getRecentActivity = (limit: number = 20) => 
  api.get<ApiResponse<any[]>>('/api/bed-config/activity/', { params: { limit } });

/**
 * Get bed turnover rate
 */
export const getTurnoverRate = (days: number = 7) => 
  api.get<ApiResponse>('/api/bed-config/analytics/turnover/', { params: { days } });

/**
 * Get average length of stay
 */
export const getAverageLengthOfStay = (days: number = 30) => 
  api.get<ApiResponse>('/api/bed-config/analytics/los/', { params: { days } });