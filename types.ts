export type SurgeryType = 'Minor' | 'Major' | 'Emergency' | 'Elective';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Immediate';
export type CaseStatus = 
  | 'Recommended'
  | 'Assessment Pending'
  | 'Assessment Completed'
  | 'Anesthesia Approved'
  | 'Team Assigned'
  | 'Scheduled'
  | 'OT Day Clearance'
  | 'In Surgery'
  | 'In Recovery'
  | 'Shifted to Ward'
  | 'Ready for Discharge'
  | 'Completed & Discharged';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  admissionId: string;
  roomNumber: string;
  phone: string;
  bloodGroup: string;
    email?: string;
}

export interface SurgeryCase {
  id: string;
  patient: Patient;
  status: CaseStatus;
  currentStep: number; // 1 to 17
  
  // Step 1: Recommendation
  recommendation: {
    surgeryName: string;
    diagnosis: string;
    surgeryType: SurgeryType;
    expectedDate: string;
    priorityLevel: PriorityLevel;
    estimatedDuration: number; // in minutes
    clinicalNotes: string;
    recommendedBy: string;
    recommendedDate: string;
  };

  // Step 2: Pre-Surgery Assessment
  preSurgeryAssessment: {
    performedBy: string;
    medicalHistory: string;
    previousSurgeries: string;
    allergies: string;
    currentMedication: string;
    comorbidities: {
      diabetes: boolean;
      hypertension: boolean;
      heartDisease: boolean;
      asthma: boolean;
      other: string;
    };
    vitals: {
      bp: string;
      pulse: number;
      temp: number;
      spo2: number;
      weight: number;
      height: number;
      bmi: number;
    };
    tests: {
      cbc: string;
      bloodGroup: string;
      ptInr: string;
      bloodSugar: string;
      ecg: string;
      xray: string;
      ctScan: string;
      mri: string;
    };
    fitnessStatus: 'Pending' | 'Completed' | 'Fit' | 'Not Fit';
      ecgRequired?: boolean; 
  };

  // Step 3: Anesthesia Evaluation
  anesthesiaEvaluation: {
    anesthetistName: string;
    asaGrade: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA V';
    airwayAssessment: string;
    previousAnesthesiaHistory: string;
    drugAllergies: string;
    anesthesiaType: 'General' | 'Regional' | 'Spinal' | 'Local';
    status: 'Pending' | 'Approved' | 'Rejected';
    evaluationDate: string;
  };

  // Step 4: Cost Estimation
  costEstimation: {
    charges: {
      surgeonFee: number;
      assistantFee: number;
      otUsage: number;
      recoveryRoom: number;
      anesthesia: number;
      nursing: number;
      implants: number;
      consumables: number;
      medicines: number;
      investigations: number;
      roomCharges: number;
    };
    estimatedCost: number;
    packageCost: number;
    patientPayable: number;
    insurancePayable: number;
  };

  // Step 5: Insurance Pre-Authorization
  insurancePreAuth: {
    hasInsurance: boolean;
    tpaName: string;
    insuranceCompany: string;
    requestedAmount: number;
    approvedAmount: number;
    documents: string[];
    status: 'N/A' | 'Draft' | 'Submitted' | 'Under Review' | 'Query Raised' | 'Approved' | 'Rejected';
  };

  // Step 6: Consent Management
  consentManagement: {
    consents: {
      surgery: boolean;
      anesthesia: boolean;
      transfusion: boolean;
    };
    signatures: {
      patient: boolean;
      attendant: boolean;
      doctor: boolean;
      witness: boolean;
    };
    status: 'Pending' | 'Signed' | 'Verified';
    signatureImages?: {  // Add this line
    patient?: string;
    attendant?: string;
    doctor?: string;
    witness?: string;
  };
  };

  // Step 7: Surgery Team Assignment
  teamAssignment: {
    team: {
      primarySurgeon: string;
      assistantSurgeon: string;
      leadAnesthetist: string;
      assistantAnesthetist: string;
      scrubNurse: string;
      circulatingNurse: string;
      otTechnician: string;
      biomedicalTech: string;
    };
    assignedBy: string;
    assignmentDate: string;
    availabilityStatus: 'All Available' | 'Conflict Detected' | 'Pending Verification';
  };

  // Step 8: OT Scheduling
  otScheduling: {
    otRoom: string;
    surgeryDate: string;
    startTime: string;
    endTime: string;
    estimatedDuration: number;
     status: 'Pending' | 'Scheduled' | 'Rescheduled' | 'Cancelled' | 'Completed'; 
  };

  // Step 9: Equipment & Inventory Check
  equipmentCheck: {
    equipment: {
      otTable: 'Available' | 'Reserved' | 'In Use' | 'Maintenance';
      monitor: 'Available' | 'Reserved' | 'In Use' | 'Maintenance';
      ventilator: 'Available' | 'Reserved' | 'In Use' | 'Maintenance';
      cauteryMachine: 'Available' | 'Reserved' | 'In Use' | 'Maintenance';
      endoscopyEquipment: 'Available' | 'Reserved' | 'In Use' | 'Maintenance';
    };
    status: 'Verified' | 'Pending' | 'Shortage';
  };

  // Step 10: Surgery Day Checklist
  dayChecklist: {
    checklist: {
      consentCompleted: boolean;
      insuranceApproved: boolean;
      patientFasting: boolean;
      testsAvailable: boolean;
      bloodAvailable: boolean;
      otReady: boolean;
      teamReady: boolean;
    };
    otClearanceStatus: 'Cleared' | 'Pending' | 'Hold';
  };

  // Step 11: Intra-Operative Management
  intraOperative: {
    timeline: {
      patientShiftedToOT: string;
      anesthesiaStart: string;
      surgeryStart: string;
      surgeryEnd: string;
      anesthesiaEnd: string;
    };
    surgicalNotes: {
      procedurePerformed: string;
      findings: string;
      complications: string;
      bloodLoss: number; // in ml
      implantUsed: string;
      specimenSent: boolean;
    };
    events: {
      time: string;
      event: string;
      note: string;
    }[];
  };

  // Step 12: Consumables & Implants Tracking
  consumablesTracking: {
    medicinesUsed: { name: string; quantity: number; cost: number }[];
    surgicalConsumables: { name: string; quantity: number; cost: number }[]; // sutures, gauze, etc.
    implants: { name: string; batchNumber: string; manufacturer: string; cost: number }[];
  };

  // Step 13: Post-Operative Recovery
  postOpRecovery: {
    vitalsLogs: {
      time: string;
      bp: string;
      pulse: number;
      spo2: number;
      painScore: number; // 0-10
      consciousness: 'Fully Awake' | 'Arousable to Voice' | 'Arousable to Pain' | 'Unresponsive';
    }[];
    status: 'Critical' | 'Stable' | 'Shifted to Ward';
  };

  // Step 14: Post-Operative Orders
  postOpOrders: {
    medications: string;
    antibiotics: string;
    fluids: string;
    diet: string;
    physiotherapy: string;
    nursingTasks: {
      id: string;
      task: string;
      done: boolean;
      assignedTime: string;
      completedTime?: string;
    }[];
  };

  // Step 15: Surgery Outcome Tracking
  outcomeTracking: {
    outcome: 'Successful' | 'Complication' | 'Re-operation Required' | 'Mortality';
    outcomeNotes: string;
    followUpPlan: string;
  };

  // Step 16: Surgery Billing
  billing: {
    actualCharges: {
      surgeonFee: number;
      assistantFee: number;
      otUsage: number;
      recoveryRoom: number;
      anesthesia: number;
      nursing: number;
      implants: number;
      consumables: number;
      medicines: number;
      investigations: number;
      roomCharges: number;
    };
    totalActualCost: number;
    isBilled: boolean;
    billingDate?: string;
  };

  // Step 17: Discharge & Follow-Up
  discharge: {
    summary: {
      surgerySummary: string;
      otNotes: string;
      implantDetails: string;
      dischargeSummary: string;
      medicationPlan: string;
      followUpAppointment: string;
    };
    dischargeDate?: string;
    status: 'In Ward' | 'Ready for Discharge' | 'Discharged';
  };

  ecgRecord?: {
  id?: string;
  patientId?: string;
  heartRate?: number;
  signal?: number[];
  timestamp?: string;
  notes?: string;
  // plus any other fields you want to include
  status?: string;
  orderedBy?: string;
  orderedDate?: string;
  rhythm?: string;
  bpm?: number;
  prInterval?: number;
  qrsDuration?: number;
  qtInterval?: number;
  rrInterval?: number;
  signalQuality?: number;
  signedBy?: string;      // ← add
  signedDate?: string;  
   aiAnalysisResult?: any;       // or a more specific type
  doctorNotes?: string;
  isApproved?: boolean;
  doctorSignature?: string;
  isSigned?: boolean;  
};
}

export const SURGEONS = [
  { id: 's1', name: 'Dr. Devendra Mehta', specialty: 'General Surgery', phone: '+91 98765 43210', status: 'Available' },
  { id: 's2', name: 'Dr. Anjali Deshmukh', specialty: 'Orthopedics', phone: '+91 98765 43211', status: 'In OT' },
  { id: 's3', name: 'Dr. Vivek Saxena', specialty: 'Cardiology', phone: '+91 98765 43212', status: 'Available' }
];

export const ANESTHETISTS = [
  { id: 'a1', name: 'Dr. Ronald D\'Souza', specialty: 'Cardiac Anesthesia', status: 'Available' },
  { id: 'a2', name: 'Dr. Priya Nair', specialty: 'Pediatric Anesthesia', status: 'In OT' }
];

export const NURSES = [
  { id: 'n1', name: 'Sister Jaspreet Kaur', role: 'Scrub Nurse', status: 'Available' },
  { id: 'n2', name: 'Sister Mary Joseph', role: 'Circulating Nurse', status: 'In OT' },
  { id: 'n3', name: 'Brother Rajesh Kumar', role: 'Anesthesia Assistant', status: 'Available' }
];

export const OT_ROOMS = [
  { id: 'r1', name: 'OT Suite 1 (Cardiothoracic)', status: 'Occupied', currentCase: 'CASE-103' },
  { id: 'r2', name: 'OT Suite 2 (Orthopedics/Neuro)', status: 'Available', currentCase: '' },
  { id: 'r3', name: 'OT Suite 3 (General Surgery - Lap)', status: 'Available', currentCase: '' },
  { id: 'r4', name: 'OT Suite 4 (Ophthalmic & Minor)', status: 'Maintenance', currentCase: '' }
];

export const DEFAULT_CONSUMABLES = [
  { name: 'Surgical Gown Pack', category: 'PPE', cost: 450, stock: 120 },
  { name: 'Scalpel Blades (Size 15)', category: 'Instruments', cost: 150, stock: 250 },
  { name: 'Suture Nylon 3-0', category: 'Sutures', cost: 350, stock: 400 },
  { name: 'Suture Vicryl 2-0', category: 'Sutures', cost: 600, stock: 350 },
  { name: 'Sterile Gloves (Size 7.5)', category: 'PPE', cost: 120, stock: 500 },
  { name: 'IV Cannula 18G', category: 'Disposables', cost: 80, stock: 600 },
  { name: 'Anesthesia Breathing Circuit', category: 'Anesthesia', cost: 1200, stock: 80 },
  { name: 'Electrocardiogram (ECG) Electrodes', category: 'Monitoring', cost: 50, stock: 1000 }
];

export const INITIAL_CASES: SurgeryCase[] = [];

export interface EcgPacket {
  deviceId: string;
  heartRate: number;
  leadI: number[];
  timestamp: number;
}

export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | '';
  notes: string;
}

export interface Recording {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  deviceId: string;
  heartRate: number;
  ecgSignal: number[];
  timestamp: number;
  durationSeconds: number;
  sampleCount: number;
  averageHeartRate: number;
  notes: string;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';
