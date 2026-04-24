export type WardType = "General" | "Semi-Special" | "Special" | "VIP" | "ICU" | "Pediatric";
export type PatientCategory = "Male" | "Female" | "Children" | "Mixed";
export type BedStatus = "available" | "occupied" | "cleaning" | "maintenance" | "reserved";

export interface Floor {
  id: number;
  floor_number: number;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Ward {
  id: number;
  floor_id: number;
  name: string;
  type: WardType;
  patient_category: PatientCategory;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: number;
  ward_id: number;
  room_number: string;
  name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Bed {
  id: number;
  ward_id: number;
  room_id?: number;
  bed_number: string;
  type: WardType;
  floor_number: number;
  status: BedStatus;
  patient_category: PatientCategory;
 attributes?: Record<string, string | number | boolean | null | undefined | object>;
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
 attributes?: Record<string, string | number | boolean | null | undefined | object>;
}