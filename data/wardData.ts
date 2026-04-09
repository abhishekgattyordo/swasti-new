



// import { useState, useEffect } from 'react';
// import { 
//   getBeds, 
//   getWards as getApiWards, 
//   getRooms, 
//   getFloors,
//   getBedSummary 
// } from '@/lib/api/bed-config';
// import type { 
//   Bed as ApiBed, 
//   Ward as ApiWard, 
//   Room, 
//   Floor, 
//   BedSummary as ApiBedSummary,
//   BedStatus as ApiBedStatus,
//   WardType
// } from '@/lib/api/types';

// // ==================== TYPES (Keep these) ====================

// export type BedStatus = "available" | "occupied" | "cleaning" | "maintenance" | "reserved";
// export type BedType = "General" | "ICU" | "Pediatric" | "Emergency" | "Maternity";

// export interface Vital {
//   heartRate: number;
//   bloodPressure: string;
//   spO2: number;
//   temperature: number;
//   isAlert: boolean;
// }

// export interface NursingNote {
//   id: string;
//   author: string;
//   text: string;
//   timestamp: string;
//   isUrgent: boolean;
// }

// export interface Patient {
//   name: string;
//   initials: string;
//   gender: "M" | "F";
//   age: number;
//   mrn: string;
//   admissionDate: string;
//   estimatedDischarge: string;
//   diagnosis: string;
//   contact: string;
//   specialRequirements: string;
// }

// export interface Bed {
//   id: string;
//   number: string;
//   type: BedType;
//   status: BedStatus;
//   ward: string;
//   floor: number;
//   wing: string;
//   patient?: Patient;
//   vitals?: Vital;
//   notes: NursingNote[];
//   recentlyChanged: boolean;
//   gridPosition: { row: number; col: number };
// }

// export interface Ward {
//   id: string;
//   name: string;
//   floor: number;
//   wing: string;
//   totalBeds: number;
//   occupiedBeds: number;
// }

// export interface OccupancyForecast {
//   hour: string;
//   occupancy: number;
// }

// export const statusColors: Record<BedStatus, string> = {
//   available: "bg-status-available",
//   occupied: "bg-status-occupied",
//   cleaning: "bg-status-cleaning",
//   maintenance: "bg-status-maintenance",
//   reserved: "bg-status-reserved",
// };

// export const statusLabels: Record<BedStatus, string> = {
//   available: "Available",
//   occupied: "Occupied",
//   cleaning: "Cleaning",
//   maintenance: "Maintenance",
//   reserved: "Reserved",
// };

// // ==================== API DATA FETCHING ====================

// // Cache for static data to reduce API calls
// let cachedFloors: Floor[] | null = null;
// let cachedRooms: Room[] | null = null;
// let cachedWards: ApiWard[] | null = null;

// // Helper to determine wing based on room/ward
// const getWing = (roomNumber?: string, wardId?: number): string => {
//   if (roomNumber) {
//     const num = parseInt(roomNumber.replace(/\D/g, '')) || 0;
//     return num % 2 === 0 ? "East" : "West";
//   }
//   if (wardId) {
//     return wardId % 2 === 0 ? "East" : "West";
//   }
//   return "Central";
// };

// // Helper to generate grid position
// const getGridPosition = (index: number): { row: number; col: number } => {
//   return {
//     row: Math.floor(index / 4),
//     col: index % 4
//   };
// };

// // Convert API bed status to UI bed status
// const mapApiStatusToUIStatus = (apiStatus: ApiBedStatus): BedStatus => {
//   return apiStatus; // They already match
// };

// // Convert API bed type to UI bed type
// const mapApiTypeToUIType = (apiType: WardType): BedType => {
//   // Map API ward types to UI bed types
//   const typeMap: Record<WardType, BedType> = {
//     'General': 'General',
//     'Semi-Special': 'General',
//     'Special': 'General',
//     'VIP': 'General',
//     'ICU': 'ICU',
//     'Pediatric': 'Pediatric'
//   };
//   return typeMap[apiType] || 'General';
// };

// // Create patient object from API bed attributes
// const createPatientFromAttributes = (attributes: Record<string, any> | null, bedId: number): Patient | undefined => {
//   if (!attributes) return undefined;

//   const name = attributes.patient_name || `Patient ${bedId}`;
//   const nameParts = name.split(' ');
//   const initials = attributes.patient_initials || 
//     nameParts.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

//   return {
//     name,
//     initials,
//     gender: attributes.gender || 'M',
//     age: attributes.age || 45,
//     mrn: attributes.mrn || `MRN${bedId}`,
//     admissionDate: attributes.admission_date || new Date().toISOString().split('T')[0],
//     estimatedDischarge: attributes.estimated_discharge || 
//       new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
//     diagnosis: attributes.diagnosis || "Under observation",
//     contact: attributes.contact || "+1-555-1234",
//     specialRequirements: attributes.special_requirements || "",
//   };
// };

// // Create vitals from API bed attributes
// const createVitalsFromAttributes = (attributes: Record<string, any> | null): Vital | undefined => {
//   if (!attributes?.vitals) return undefined;
  
//   const vitals = attributes.vitals;
//   return {
//     heartRate: vitals.heartRate || 72,
//     bloodPressure: vitals.bloodPressure || "120/80",
//     spO2: vitals.spO2 || 98,
//     temperature: vitals.temperature || 36.8,
//     isAlert: vitals.isAlert || false,
//   };
// };

// // Create nursing notes from API bed attributes
// const createNotesFromAttributes = (attributes: Record<string, any> | null, bedId: number): NursingNote[] => {
//   if (!attributes?.notes) return [];
  
//   return (attributes.notes as any[]).map((note, i) => ({
//     id: `${bedId}-note-${i}`,
//     author: note.author || "Nurse",
//     text: note.text || "",
//     timestamp: note.timestamp || new Date().toISOString(),
//     isUrgent: note.isUrgent || false,
//   }));
// };

// // Generate forecast from summary data
// const generateForecastFromSummary = (summary?: ApiBedSummary): OccupancyForecast[] => {
//   const baseOccupancy = summary?.summary ? parseInt(summary.summary.occupancyRate) || 70 : 70;
//   const hours = ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM", "12 AM"];
  
//   return hours.map((hour, i) => {
//     // Create variation around base occupancy
//     const variation = Math.sin(i * 0.8) * 10;
//     let occupancy = Math.min(95, Math.max(45, baseOccupancy + variation));
//     return { hour, occupancy: Math.round(occupancy) };
//   });
// };

// // ==================== REACT HOOK ====================

// export function useWardData() {
//   const [beds, setBeds] = useState<Bed[]>([]);
//   const [wards, setWards] = useState<Ward[]>([]);
//   const [forecast, setForecast] = useState<OccupancyForecast[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [summary, setSummary] = useState<ApiBedSummary | null>(null);

// const loadData = async () => {
//   try {
//     setLoading(true);
//     setError(null);

//     // Use allSettled so that individual failures don't break everything
//     const results = await Promise.allSettled([
//       getBeds({ is_active: true }),
//       getApiWards(),
//       getRooms(),
//       getFloors(),
//       getBedSummary()
//     ]);

//     const [bedsResult, wardsResult, roomsResult, floorsResult, summaryResult] = results;

//     // Safely extract data from each response
//     let bedsData: any[] = [];
// if (bedsResult.status === 'fulfilled') {
//   bedsData = bedsResult.value.data?.data || (Array.isArray(bedsResult.value.data) ? bedsResult.value.data : []);
//   console.log('✅ Beds loaded:', bedsData.length);
// } else {
//   console.error('❌ Failed to load beds:', bedsResult.reason);
// }

// let wardsData: any[] = [];
// if (wardsResult.status === 'fulfilled') {
//   wardsData = wardsResult.value.data?.data || (Array.isArray(wardsResult.value.data) ? wardsResult.value.data : []);
//   console.log('✅ Wards loaded:', wardsData.length);
// } else {
//   console.error('❌ Failed to load wards:', wardsResult.reason);
// }

// let roomsData: any[] = [];
// if (roomsResult.status === 'fulfilled') {
//   roomsData = roomsResult.value.data?.data || (Array.isArray(roomsResult.value.data) ? roomsResult.value.data : []);
// } else {
//   console.error('❌ Failed to load rooms:', roomsResult.reason);
// }

// let floorsData: any[] = [];
// if (floorsResult.status === 'fulfilled') {
//   floorsData = floorsResult.value.data?.data || (Array.isArray(floorsResult.value.data) ? floorsResult.value.data : []);
// } else {
//   console.error('❌ Failed to load floors:', floorsResult.reason);
// }

// let summaryData: any = null;
// if (summaryResult.status === 'fulfilled') {
//   summaryData = summaryResult.value.data?.data || summaryResult.value.data;
//   console.log('✅ Summary loaded');
// } else {
//   console.error('❌ Failed to load summary:', summaryResult.reason);
// }

//     // Cache static data (only if they loaded successfully)
//     cachedWards = wardsData;
//     cachedRooms = roomsData;
//     cachedFloors = floorsData;

//     // Create lookup maps (use empty arrays if data missing)
//     const wardMap = new Map(cachedWards.map(w => [w.id, w]));
//     const roomMap = new Map(cachedRooms.map(r => [r.id, r]));
//     const floorMap = new Map(cachedFloors.map(f => [f.id, f]));

//     // Convert API beds to UI beds
//     const uiBeds: Bed[] = bedsData.map((apiBed, index) => {
//       const ward = wardMap.get(apiBed.ward_id);
//       const room = apiBed.room_id ? roomMap.get(apiBed.room_id) : undefined;
//       const floor = floorMap.get(ward?.floor_id || 0);

//       return {
//         id: apiBed.id.toString(),
//         number: apiBed.bed_number,
//         type: mapApiTypeToUIType(apiBed.type),
//         status: mapApiStatusToUIStatus(apiBed.status),
//         ward: ward?.name || `Ward ${apiBed.ward_id}`,
//         floor: apiBed.floor_number,
//         wing: getWing(room?.room_number, apiBed.ward_id),
//         patient: apiBed.status === 'occupied' 
//           ? createPatientFromAttributes(apiBed.attributes, apiBed.id)
//           : undefined,
//         vitals: createVitalsFromAttributes(apiBed.attributes),
//         notes: createNotesFromAttributes(apiBed.attributes, apiBed.id),
//         recentlyChanged: false,
//         gridPosition: getGridPosition(index),
//       };
//     });

//     // Group beds by ward to create ward objects (only if we have beds)
// const bedsByWard = uiBeds.reduce((acc, bed) => {
//   if (!acc[bed.ward]) acc[bed.ward] = [];
//   acc[bed.ward].push(bed);
//   return acc;
// }, {} as Record<string, Bed[]>);

//     // Create UI wards from API wards (or empty array if no wards)
//     const uiWards: Ward[] = cachedWards.map(apiWard => {
//       const wardBeds = bedsByWard[apiWard.name] || [];
//       const floor = floorMap.get(apiWard.floor_id);
//       return {
//         id: apiWard.id.toString(),
//         name: apiWard.name,
//         floor: floor?.floor_number || 1,
//         wing: getWing(undefined, apiWard.id),
//         totalBeds: wardBeds.length,
//         occupiedBeds: wardBeds.filter(b => b.status === 'occupied').length,
//       };
//     });

//     // Generate forecast from summary (or empty array if no summary)
//     const uiForecast = summaryData ? generateForecastFromSummary(summaryData) : [];

//     setBeds(uiBeds);
//     setWards(uiWards);
//     setForecast(uiForecast);
//     setSummary(summaryData);
//     setError(null);
//   } catch (err) {
//     // This should not happen because allSettled never rejects
//     console.error('Unexpected error in loadData:', err);
//     setError('An unexpected error occurred');
//   } finally {
//     setLoading(false);
//   }
// };

//   useEffect(() => {
//     loadData();
//   }, []);

//   return { 
//     beds, 
//     wards, 
//     forecast, 
//     summary,
//     loading, 
//     error, 
//     refresh: loadData 
//   };
// }

// // ==================== INDIVIDUAL DATA FETCHERS ====================

// // For components that need just beds
// export async function fetchBeds(): Promise<Bed[]> {
//   try {
//     const response = await getBeds({ is_active: true });
//     const wards = await getApiWards();
//     const rooms = await getRooms();
    
//    const wardMap = new Map(wards.data?.data?.map(w => [w.id, w]) || []);
// const roomMap = new Map(rooms.data?.data?.map(r => [r.id, r]) || []);
    
//    return (response.data?.data || []).map((apiBed, index) => {
//       const ward = wardMap.get(apiBed.ward_id);
//       const room = apiBed.room_id ? roomMap.get(apiBed.room_id) : undefined;
      
//       return {
//         id: apiBed.id.toString(),
//         number: apiBed.bed_number,
//         type: mapApiTypeToUIType(apiBed.type),
//         status: mapApiStatusToUIStatus(apiBed.status),
//         ward: ward?.name || `Ward ${apiBed.ward_id}`,
//         floor: apiBed.floor_number,
//         wing: getWing(room?.room_number, apiBed.ward_id),
//         patient: apiBed.status === 'occupied' 
//           ? createPatientFromAttributes(apiBed.attributes, apiBed.id)
//           : undefined,
//         vitals: createVitalsFromAttributes(apiBed.attributes),
//         notes: createNotesFromAttributes(apiBed.attributes, apiBed.id),
//         recentlyChanged: false,
//         gridPosition: getGridPosition(index),
//       };
//     });
//   } catch (error) {
//     console.error('Error fetching beds:', error);
//     return [];
//   }
// }

// // For components that need just wards
// export async function fetchWards(): Promise<Ward[]> {
//   try {
//     const [wardsRes, bedsRes] = await Promise.all([
//       getApiWards(),
//       getBeds({ is_active: true })
//     ]);
    
//     const beds = bedsRes.data?.data || [];
//     const bedsByWard = beds.reduce((acc, bed) => {
//       const wardId = bed.ward_id;
//       if (!acc[wardId]) acc[wardId] = [];
//       acc[wardId].push(bed);
//       return acc;
//     }, {} as Record<number, ApiBed[]>);  // <-- fixed type

//     return (wardsRes.data?.data || []).map(apiWard => {
//       const wardBeds = bedsByWard[apiWard.id] || [];
//       const occupiedCount = wardBeds.filter(b => b.status === 'occupied').length;
      
//       return {
//         id: apiWard.id.toString(),
//         name: apiWard.name,
//         floor: apiWard.floor_id,
//         wing: getWing(undefined, apiWard.id),
//         totalBeds: wardBeds.length,
//         occupiedBeds: occupiedCount,
//       };
//     });
//   } catch (error) {
//     console.error('Error fetching wards:', error);
//     return [];
//   }
// }

// // For components that need just forecast
// export async function fetchForecast(): Promise<OccupancyForecast[]> {
//   try {
//    const summaryRes = await getBedSummary();
// const summaryData = summaryRes.data?.data;
// return summaryData ? generateForecastFromSummary(summaryData) : [];
//   } catch (error) {
//     console.error('Error fetching forecast:', error);
//     return [];
//   }
// }

// // ==================== EXPORT FOR BACKWARD COMPATIBILITY ====================

// // Export empty arrays for components that might still import these directly
// // This will cause them to show no data instead of mock data
// export const beds: Bed[] = [];
// export const wards: Ward[] = [];
// export const occupancyForecast: OccupancyForecast[] = [];






import { useState, useEffect } from 'react';
import { 
  getBeds, 
  getWards as getApiWards, 
  getRooms, 
  getFloors,
  getBedSummary 
} from '@/lib/api/bed-config';
import type { 
  Bed as ApiBed, 
  Ward as ApiWard, 
  Room, 
  Floor, 
  BedSummary as ApiBedSummary,
  BedStatus as ApiBedStatus,
  WardType
} from '@/lib/api/types';

// ==================== TYPES (Keep these) ====================

export type BedStatus = "available" | "occupied" | "cleaning" | "maintenance" | "reserved";
export type BedType = "General" | "ICU" | "Pediatric" | "Emergency" | "Maternity";

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

export interface Patient {
  name: string;
  initials: string;
  gender: "M" | "F";
  age: number;
  mrn: string;
   phone?: string;  
  admissionDate: string;
  estimatedDischarge: string;
  diagnosis: string;
  contact: string;
  specialRequirements: string;
}

export interface Bed {
  id: string;
  number: string;
  type: BedType;
  status: BedStatus;
  ward: string;
  floor: number;
  wing: string;
  patient?: Patient;
  vitals?: Vital;
  notes: NursingNote[];
  recentlyChanged: boolean;
  gridPosition: { row: number; col: number };
}

export interface Ward {
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

// ==================== API DATA FETCHING ====================

// Cache for static data to reduce API calls
let cachedFloors: Floor[] | null = null;
let cachedRooms: Room[] | null = null;
let cachedWards: ApiWard[] | null = null;

// Helper to determine wing based on room/ward
const getWing = (roomNumber?: string, wardId?: number): string => {
  if (roomNumber) {
    const num = parseInt(roomNumber.replace(/\D/g, '')) || 0;
    return num % 2 === 0 ? "East" : "West";
  }
  if (wardId) {
    return wardId % 2 === 0 ? "East" : "West";
  }
  return "Central";
};

// Helper to generate grid position
const getGridPosition = (index: number): { row: number; col: number } => {
  return {
    row: Math.floor(index / 4),
    col: index % 4
  };
};

// Convert API bed status to UI bed status
const mapApiStatusToUIStatus = (apiStatus: ApiBedStatus): BedStatus => {
  return apiStatus; // They already match
};

// Convert API bed type to UI bed type
const mapApiTypeToUIType = (apiType: WardType): BedType => {
  // Map API ward types to UI bed types
  const typeMap: Record<WardType, BedType> = {
    'General': 'General',
    'Semi-Special': 'General',
    'Special': 'General',
    'VIP': 'General',
    'ICU': 'ICU',
    'Pediatric': 'Pediatric'
  };
  return typeMap[apiType] || 'General';
};

// Create patient object from API bed attributes
const createPatientFromAttributes = (patientData: any, bedId: number): Patient | undefined => {
  if (!patientData) return undefined;

  const name = patientData.name || `Patient ${bedId}`;
  const nameParts = name.split(' ');
  const initials = patientData.initials || 
    nameParts.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return {
    name,
    initials,
    gender: patientData.gender || 'M',
    age: patientData.age || 0,
    mrn: patientData.mrn || `MRN${bedId}`,
    admissionDate: patientData.admissionDate || new Date().toISOString().split('T')[0],
    estimatedDischarge: patientData.estimatedDischarge || 
      new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
    diagnosis: patientData.diagnosis || "Under observation",
    contact: patientData.contact || "+1-555-1234",
    specialRequirements: patientData.specialRequirements || "",
  };
};

// Create vitals from API bed attributes
const createVitalsFromAttributes = (attributes: Record<string, any> | null): Vital | undefined => {
  if (!attributes?.vitals) return undefined;
  
  const vitals = attributes.vitals;
  return {
    heartRate: vitals.heartRate || 72,
    bloodPressure: vitals.bloodPressure || "120/80",
    spO2: vitals.spO2 || 98,
    temperature: vitals.temperature || 36.8,
    isAlert: vitals.isAlert || false,
  };
};

// Create nursing notes from API bed attributes
const createNotesFromAttributes = (attributes: Record<string, any> | null, bedId: number): NursingNote[] => {
  if (!attributes?.notes) return [];
  
  return (attributes.notes as any[]).map((note, i) => ({
    id: `${bedId}-note-${i}`,
    author: note.author || "Nurse",
    text: note.text || "",
    timestamp: note.timestamp || new Date().toISOString(),
    isUrgent: note.isUrgent || false,
  }));
};

// Generate forecast from summary data
const generateForecastFromSummary = (summary?: ApiBedSummary): OccupancyForecast[] => {
  const baseOccupancy = summary?.summary ? parseInt(summary.summary.occupancyRate) || 70 : 70;
  const hours = ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM", "12 AM"];
  
  return hours.map((hour, i) => {
    // Create variation around base occupancy
    const variation = Math.sin(i * 0.8) * 10;
    let occupancy = Math.min(95, Math.max(45, baseOccupancy + variation));
    return { hour, occupancy: Math.round(occupancy) };
  });
};

// ==================== REACT HOOK ====================

export function useWardData() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [forecast, setForecast] = useState<OccupancyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ApiBedSummary | null>(null);

const loadData = async () => {
  try {
    setLoading(true);
    setError(null);

    // Use allSettled so that individual failures don't break everything
    const results = await Promise.allSettled([
      getBeds({ is_active: true }),
      getApiWards(),
      getRooms(),
      getFloors(),
      getBedSummary()
    ]);

    const [bedsResult, wardsResult, roomsResult, floorsResult, summaryResult] = results;

    // Safely extract data from each response
    let bedsData: any[] = [];
if (bedsResult.status === 'fulfilled') {
  bedsData = bedsResult.value.data?.data || (Array.isArray(bedsResult.value.data) ? bedsResult.value.data : []);
  console.log('✅ Beds loaded:', bedsData.length);
} else {
  console.error('❌ Failed to load beds:', bedsResult.reason);
}

let wardsData: any[] = [];
if (wardsResult.status === 'fulfilled') {
  wardsData = wardsResult.value.data?.data || (Array.isArray(wardsResult.value.data) ? wardsResult.value.data : []);
  console.log('✅ Wards loaded:', wardsData.length);
} else {
  console.error('❌ Failed to load wards:', wardsResult.reason);
}

let roomsData: any[] = [];
if (roomsResult.status === 'fulfilled') {
  roomsData = roomsResult.value.data?.data || (Array.isArray(roomsResult.value.data) ? roomsResult.value.data : []);
} else {
  console.error('❌ Failed to load rooms:', roomsResult.reason);
}

let floorsData: any[] = [];
if (floorsResult.status === 'fulfilled') {
  floorsData = floorsResult.value.data?.data || (Array.isArray(floorsResult.value.data) ? floorsResult.value.data : []);
} else {
  console.error('❌ Failed to load floors:', floorsResult.reason);
}

let summaryData: any = null;
if (summaryResult.status === 'fulfilled') {
  summaryData = summaryResult.value.data?.data || summaryResult.value.data;
  console.log('✅ Summary loaded');
} else {
  console.error('❌ Failed to load summary:', summaryResult.reason);
}

    // Cache static data (only if they loaded successfully)
    cachedWards = wardsData;
    cachedRooms = roomsData;
    cachedFloors = floorsData;

    // Create lookup maps (use empty arrays if data missing)
    const wardMap = new Map(cachedWards.map(w => [w.id, w]));
    const roomMap = new Map(cachedRooms.map(r => [r.id, r]));
    const floorMap = new Map(cachedFloors.map(f => [f.id, f]));

    // Convert API beds to UI beds
    const uiBeds: Bed[] = bedsData.map((apiBed, index) => {
      const ward = wardMap.get(apiBed.ward_id);
      const room = apiBed.room_id ? roomMap.get(apiBed.room_id) : undefined;
      const floor = floorMap.get(ward?.floor_id || 0);

      return {
        id: apiBed.id.toString(),
        number: apiBed.bed_number,
        type: mapApiTypeToUIType(apiBed.type),
        status: mapApiStatusToUIStatus(apiBed.status),
        ward: ward?.name || `Ward ${apiBed.ward_id}`,
        floor: apiBed.floor_number,
        wing: getWing(room?.room_number, apiBed.ward_id),
       patient: apiBed.status === 'occupied' 
  ? createPatientFromAttributes(apiBed.attributes?.currentPatient || apiBed.attributes, apiBed.id)
  : undefined,
        vitals: createVitalsFromAttributes(apiBed.attributes),
        notes: createNotesFromAttributes(apiBed.attributes, apiBed.id),
        recentlyChanged: false,
        gridPosition: getGridPosition(index),
      };
    });

    // Group beds by ward to create ward objects (only if we have beds)
const bedsByWard = uiBeds.reduce((acc, bed) => {
  if (!acc[bed.ward]) acc[bed.ward] = [];
  acc[bed.ward].push(bed);
  return acc;
}, {} as Record<string, Bed[]>);

    // Create UI wards from API wards (or empty array if no wards)
    const uiWards: Ward[] = cachedWards.map(apiWard => {
      const wardBeds = bedsByWard[apiWard.name] || [];
      const floor = floorMap.get(apiWard.floor_id);
      return {
        id: apiWard.id.toString(),
        name: apiWard.name,
        floor: floor?.floor_number || 1,
        wing: getWing(undefined, apiWard.id),
        totalBeds: wardBeds.length,
        occupiedBeds: wardBeds.filter(b => b.status === 'occupied').length,
      };
    });

    // Generate forecast from summary (or empty array if no summary)
    const uiForecast = summaryData ? generateForecastFromSummary(summaryData) : [];

    setBeds(uiBeds);
    setWards(uiWards);
    setForecast(uiForecast);
    setSummary(summaryData);
    setError(null);
  } catch (err) {
    // This should not happen because allSettled never rejects
    console.error('Unexpected error in loadData:', err);
    setError('An unexpected error occurred');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadData();
  }, []);

  return { 
    beds, 
    wards, 
    forecast, 
    summary,
    loading, 
    error, 
    refresh: loadData 
  };
}

// ==================== INDIVIDUAL DATA FETCHERS ====================

// For components that need just beds
export async function fetchBeds(): Promise<Bed[]> {
  try {
    const response = await getBeds({ is_active: true });
    const wards = await getApiWards();
    const rooms = await getRooms();
    
   const wardMap = new Map(wards.data?.data?.map(w => [w.id, w]) || []);
const roomMap = new Map(rooms.data?.data?.map(r => [r.id, r]) || []);
    
   return (response.data?.data || []).map((apiBed, index) => {
      const ward = wardMap.get(apiBed.ward_id);
      const room = apiBed.room_id ? roomMap.get(apiBed.room_id) : undefined;
      
      return {
        id: apiBed.id.toString(),
        number: apiBed.bed_number,
        type: mapApiTypeToUIType(apiBed.type),
        status: mapApiStatusToUIStatus(apiBed.status),
        ward: ward?.name || `Ward ${apiBed.ward_id}`,
        floor: apiBed.floor_number,
        wing: getWing(room?.room_number, apiBed.ward_id),
        patient: apiBed.status === 'occupied' 
          ? createPatientFromAttributes(apiBed.attributes, apiBed.id)
          : undefined,
        vitals: createVitalsFromAttributes(apiBed.attributes),
        notes: createNotesFromAttributes(apiBed.attributes, apiBed.id),
        recentlyChanged: false,
        gridPosition: getGridPosition(index),
      };
    });
  } catch (error) {
    console.error('Error fetching beds:', error);
    return [];
  }
}

// For components that need just wards
export async function fetchWards(): Promise<Ward[]> {
  try {
    const [wardsRes, bedsRes] = await Promise.all([
      getApiWards(),
      getBeds({ is_active: true })
    ]);
    
    const beds = bedsRes.data?.data || [];
    const bedsByWard = beds.reduce((acc, bed) => {
      const wardId = bed.ward_id;
      if (!acc[wardId]) acc[wardId] = [];
      acc[wardId].push(bed);
      return acc;
    }, {} as Record<number, ApiBed[]>);  // <-- fixed type

    return (wardsRes.data?.data || []).map(apiWard => {
      const wardBeds = bedsByWard[apiWard.id] || [];
      const occupiedCount = wardBeds.filter(b => b.status === 'occupied').length;
      
      return {
        id: apiWard.id.toString(),
        name: apiWard.name,
        floor: apiWard.floor_id,
        wing: getWing(undefined, apiWard.id),
        totalBeds: wardBeds.length,
        occupiedBeds: occupiedCount,
      };
    });
  } catch (error) {
    console.error('Error fetching wards:', error);
    return [];
  }
}

// For components that need just forecast
export async function fetchForecast(): Promise<OccupancyForecast[]> {
  try {
   const summaryRes = await getBedSummary();
const summaryData = summaryRes.data?.data;
return summaryData ? generateForecastFromSummary(summaryData) : [];
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return [];
  }
}

// ==================== EXPORT FOR BACKWARD COMPATIBILITY ====================

// Export empty arrays for components that might still import these directly
// This will cause them to show no data instead of mock data
export const beds: Bed[] = [];
export const wards: Ward[] = [];
export const occupancyForecast: OccupancyForecast[] = [];