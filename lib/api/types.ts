// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== BED CONFIGURATION TYPES ====================

export interface Floor {
  id: number;
  floor_number: number;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export type WardType = "General" | "Semi-Special" | "Special" | "VIP" | "ICU" | "Pediatric" | "Emergency";
export type PatientCategory = "Male" | "Female" | "Children" | "Mixed";
export type BedStatus = "available" | "occupied" | "cleaning" | "maintenance" | "reserved";

export interface Ward {
  id: number;
  floor_id: number;
  name: string;
  type: WardType;
  patient_category: PatientCategory;
  description: string | null;
  daily_rate: number;  
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: number;
  ward_id: number;
  room_number: string;
  name: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bed {
  id: number;
  ward_id: number;
  room_id: number | null;
  bed_number: string;
  type: WardType;
  floor_number: number;
  status: BedStatus;
  patient_category: PatientCategory;
  attributes: Record<string, any> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BulkBedCreate {
  ward_id: number;
  room_id?: number;
  count: number;
  prefix?: string;
  patient_category?: PatientCategory;
  attributes?: Record<string, any>;
}

export interface BedSummary {
  summary: {
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    cleaningBeds?: number;
    maintenanceBeds?: number;
    reservedBeds?: number;
    occupancyRate: string;
  };
  statusCounts: Array<{ status: string; count: number }>;
  floorCounts: Array<{
    floor_id: number;
    floor_number: number;
    name: string | null;
    total_beds: number;
    occupied: number;
  }>;
  wardTypeCounts: Array<{ type: string; total_beds: number; occupied: number }>;
  categoryCounts: Array<{ category: string; count: number }>;
  recentActivity: Array<{
    type: string;
    bed_number: string;
    status: string;
    ward_name: string;
    room_number: string | null;
    updated_at: string;
  }>;
}

// ==================== ADT (ADMISSION, DISCHARGE, TRANSFER) TYPES ====================

export interface AdmitData {
  patientName: string;
  mrn: string;
  gender?: 'M' | 'F';
  age?: number;
  diagnosis?: string;
  estimatedDischarge?: string;
  contact?: string;
  specialRequirements?: string;
}

export interface DischargeData {
  dischargeNotes?: string;
}

export interface TransferData {
  destinationBedId: number;
  reason?: string;
}

export interface PatientInfo {
  id: string;
  name: string;
  mrn: string;
  gender?: string;
  age?: number;
  contact?: string;
  specialRequirements?: string;
  admissionDate: string;
  diagnosis?: string;
  estimatedDischarge?: string;
  transferDate?: string;
  transferReason?: string;
  transferredFrom?: number;
}

// ==================== AUTH TYPES ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  full_name_en: string;
  full_name_hi?: string;
  role: 'patient' | 'doctor' | 'admin' | 'pharmacy' | 'helpdesk';
  patient_id?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
  refreshToken?: string;
}

// ==================== PATIENT REGISTRATION TYPES ====================

export interface Patient {
  patient_id: string;
  full_name_en: string;
  full_name_hi?: string;
  dob: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address: string;
  pincode: string;
  state: string;
  registration_step: number;
  created_at: string;
  updated_at: string;
}

export interface MedicalHistory {
  id: number;
  patient_id: string;
  allergy: string;
  chronic_condition: string;
  medications: string;
  created_at: string;
}

export interface InsuranceDetails {
  id: number;
  patient_id: string;
  insurance_provider?: string;
  policy_number?: string;
  valid_until?: string;
  group_id?: string;
  abha_id: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationDetails {
  patient_id: string;
  full_name_en: string;
  full_name_hi?: string;
  dob: string;
  gender: string;
  address: string;
  pincode: string;
  state: string;
  registration_step: number;
  created_at: string;
  updated_at: string;
  insurance_provider?: string;
  policy_number?: string;
  valid_until?: string;
  group_id?: string;
  abha_id: string;
  registration_id: string;
  registration_status: string;
  completed_at: string;
}

// Step payloads for multi-step registration
export interface Step1Payload {
  fullNameEn: string;
  fullNameHi?: string;
  dob: string;
  gender: string;
  address: string;
  pincode: string;
  state: string;
}

export interface Step2Payload {
  patientId: string;
  allergies: string[];
  chronicConditions: string[];
  medications?: string;
}

export interface Step3Payload {
  patientId: string;
  insuranceProvider?: string;
  policyNumber?: string;
  validUntil?: string;
  groupId?: string;
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardStats {
  totalPatients: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  cleaningBeds?: number;
  maintenanceBeds?: number;
  reservedBeds?: number;
  occupancyRate: number;
  pendingAppointments: number;
}

export interface ActivityItem {
  id: string;
  type: 'admission' | 'discharge' | 'transfer' | 'cleaning' | 'maintenance';
  bedNumber: string;
  patientName?: string;
  timestamp: string;
  user: string;
  notes?: string;
}

// ==================== WARD MANAGEMENT UI TYPES ====================

export interface Vital {
  heartRate: number;
  bloodPressure: string;
  spO2: number;
  temperature: number;
  isAlert: boolean;
}

export interface NursingNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isUrgent: boolean;
}

export interface UIPatient {
  name: string;
  initials: string;
  gender: "M" | "F";
  age: number;
  mrn: string;
  admissionDate: string;
  estimatedDischarge: string;
  diagnosis: string;
  contact: string;
  specialRequirements: string;
}

export interface UIBed {
  id: string;
  number: string;
  type: WardType;
  status: BedStatus;
  ward: string;
  floor: number;
  wing: string;
  patient?: UIPatient;
  vitals?: Vital;
  notes: NursingNote[];
  recentlyChanged: boolean;
  gridPosition: { row: number; col: number };
}

export interface UIWard {
  id: string;
  name: string;
  floor: number;
  wing: string;
  totalBeds: number;
  occupiedBeds: number;
}

export interface OccupancyForecast {
  hour: string;
  occupancy: number;
}

// ==================== EXPORT ALL TYPES ====================

export type {
  // Bed config types are already exported above
};

// Status colors and labels for UI
export const statusColors: Record<BedStatus, string> = {
  available: "bg-status-available",
  occupied: "bg-status-occupied",
  cleaning: "bg-status-cleaning",
  maintenance: "bg-status-maintenance",
  reserved: "bg-status-reserved",
};

export const statusLabels: Record<BedStatus, string> = {
  available: "Available",
  occupied: "Occupied",
  cleaning: "Cleaning",
  maintenance: "Maintenance",
  reserved: "Reserved",
};



export interface AdmitData {
  patientName: string;
  mrn: string;
  gender?: 'M' | 'F';
  age?: number;
  diagnosis?: string;
  estimatedDischarge?: string;
  contact?: string;
  specialRequirements?: string;
}

export interface DischargeData {
  dischargeNotes?: string;
}

export interface TransferData {
  destinationBedId: number;
  reason?: string;
}

export interface PatientInfo {
  id: string;
  name: string;
  mrn: string;
  gender?: string;
  age?: number;
  contact?: string;
  specialRequirements?: string;
  admissionDate: string;
  diagnosis?: string;
  estimatedDischarge?: string;
  transferDate?: string;
  transferReason?: string;
  transferredFrom?: number;
}

export interface PatientHistoryEntry {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  bedId: number;
  bedNumber: string;
  action: 'admit' | 'discharge' | 'transfer_in' | 'transfer_out';
  timestamp: string;
  notes?: string;
  performedBy?: string;
}


// ==================== DOCTOR TYPES ====================

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  department: string;
  licenseNumber: string;
  dateOfBirth?: string;
  dateJoined: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  qualifications: string[];
  experience?: number;
  bio?: string;
  status: 'active' | 'on-leave' | 'inactive';
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDoctorDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  department: string;
  licenseNumber: string;
  dateOfBirth?: string;
  dateJoined: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  qualifications: string[];
  experience?: number;
  bio?: string;
  status: 'active' | 'on-leave' | 'inactive';
  avatar?: File | string | null;
}

export interface UpdateDoctorDto extends Partial<CreateDoctorDto> {}

export interface DoctorSpecialty {
  id: number;
  name: string;
  description?: string;
  department?: string;
}

export interface DoctorDepartment {
  id: number;
  name: string;
  description?: string;
}


// lib/types.ts
export type TriageType = 'Red' | 'Yellow' | 'Green';
export type GenderType = 'Male' | 'Female' | 'Other';
export type DecisionType = 'Admit' | 'Observe' | 'Discharge Home' | 'Transfer';
export type LabStatus = 'Pending' | 'Available' | 'Not Ordered' | 'Not Indicated';
export type AssessmentStatus = 'Draft' | 'Completed' | 'Converted to Admission';

export interface Lab {
  name: string;
  status: LabStatus;
}

export interface AuthorInfo {
  id: number;
  name: string;
  role: string;
}

export interface Assessment {
  id: string;
  status: AssessmentStatus;
  linkedAdmissionId?: string;
  completedAt?: string;
  
  // Patient Info
  uhid: string;
  patientName: string;
  age: number | '';
  gender: GenderType | '';
  arrivalAt: string;
  
  // Triage & Vitals
  triage: TriageType | '';
  systolic: number | '';
  diastolic: number | '';
  heartRate: number | '';
  respiratoryRate: number | '';
  temperature: number | '';
  tempUnit: 'C' | 'F';
  spo2: number | '';
  painScore: number;
  gcs: number | '';
  
  // Point-of-Care
  rbs: number | '';
  upt?: 'Positive' | 'Negative' | 'Not Done';
  ecgDone: 'Yes' | 'No' | '';
  ecgReportAttached: boolean;
  cxrDone: 'Yes' | 'No' | '';
  cxrReportAttached: boolean;
  usgDone: 'Yes' | 'No' | '';
  usgFindings: string;
  
  // Lab Orders
  labs: Lab[];
  
  // Doctor Assessment
  chiefComplaints: string;
  complaintDuration: string;
  pastHistory: string;
  provisionalDiagnosis: string;
  examFindings: string;
  intervention: string;
  
  // Disposition
  decision: DecisionType | '';
  mainDoctor: string;
  referral: string;
  dutyDoctorName: string;
  
  // Author Tracking
  createdBy?: AuthorInfo;
  updatedBy?: AuthorInfo;
  completedBy?: AuthorInfo;
  convertedBy?: AuthorInfo;
}

export const DOCTORS = ['Dr. Smith', 'Dr. Jones', 'Dr. Patel', 'Dr. Lee'];
export const SPECIALTIES = ['None', 'Medicine', 'Surgery', 'Pediatrics', 'Orthopedics', 'Cardiology'];