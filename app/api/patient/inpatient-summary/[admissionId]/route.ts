// // app/api/patient/inpatient-summary/[admissionId]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import { authErrorResponse,requireRole } from '@/lib/auth/guards';

// // --- Type definitions ---
// interface TimelineEvent {
//   id: number;
//   date: string;
//   title: string;
//   description: string;
//   type: string;
//   color: string;
//   icon?: string;
//   note?: string;
// }

// interface MedicalRecord {
//   id: number;
//   title: string;
//   subtitle: string;
//   icon: string;
//   fileUrl: string | null;
// }

// interface BillingSummary {
//   totalAmount: number;
//   insuranceCoverage: number;
//   patientPay: number;
//   status: string;
// }

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ admissionId: string }> }
// ) {
//   try {
//        requireRole(req, ['patient']);
//     const { admissionId } = await params;
//     const admissionIdNum = parseInt(admissionId);

//     // 1. Fetch admission & patient details
//     const admissionRes = await query(
//       `SELECT 
//          a.id,
//          a.admission_date,
//          a.discharge_date,
//          a.status,
//          a.reason,
//          a.diagnosis,
//          a.primary_consultant,
//          a.consultant_dept,
//          p.patient_id,
//          p.full_name_en as patient_name,
//          p.dob,
//          p.gender,
//          p.phone,
//          p.email,
//          w.name as ward_name,
//          b.bed_number,
//          b.attributes as bed_attributes
//        FROM admissions a
//        JOIN patients p ON a.patient_id = p.patient_id
//        LEFT JOIN wards w ON a.ward_id = w.id
//        LEFT JOIN beds b ON a.bed_id = b.id
//        WHERE a.id = $1`,
//       [admissionIdNum]
//     );

//     if (admissionRes.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Admission not found' },
//         { status: 404 }
//       );
//     }

//     const admission = admissionRes.rows[0];

//     // Extract room number from bed_attributes if available
//     let roomNumber = '';
//     if (admission.bed_attributes && typeof admission.bed_attributes === 'object') {
//       roomNumber = admission.bed_attributes.room_number || '';
//     }

//     // 2. Build timeline events – explicit type
//     const timelineEvents: TimelineEvent[] = [];

//     // Admission event
//     timelineEvents.push({
//       id: 1,
//       date: new Date(admission.admission_date).toLocaleString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//       }),
//       title: 'Patient Admitted',
//       description: admission.reason || 'Patient admitted',
//       type: 'admission',
//       color: 'green',
//     });

//     // Ward transfers
//     const transfersRes = await query(
//       `SELECT 
//          wt.from_date,
//          wt.to_date,
//          w.name as ward_name,
//          w.type as ward_type
//        FROM ward_transfers wt
//        JOIN wards w ON wt.ward_id = w.id
//        WHERE wt.admission_id = $1
//        ORDER BY wt.from_date`,
//       [admissionIdNum]
//     );

//     for (let i = 0; i < transfersRes.rows.length; i++) {
//       const transfer = transfersRes.rows[i];
//       timelineEvents.push({
//         id: 100 + i,
//         date: new Date(transfer.from_date).toLocaleString('en-US', {
//           month: 'short',
//           day: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit',
//         }),
//         title: `Transferred to ${transfer.ward_name}`,
//         description: `Moved to ${transfer.ward_name} (${transfer.ward_type})`,
//         type: 'transfer',
//         color: 'gray',
//       });
//     }

//     // Discharge event
//     if (admission.discharge_date) {
//       timelineEvents.push({
//         id: 999,
//         date: new Date(admission.discharge_date).toLocaleString('en-US', {
//           month: 'short',
//           day: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit',
//         }),
//         title: 'Discharge Complete',
//         description: 'Patient discharged. Final summary provided.',
//         type: 'discharge',
//         icon: 'logout',
//         color: 'gray',
//       });
//     }

//     timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

//     // 3. Billing summary
//     let billing: BillingSummary | null = null;
//     const billRes = await query(
//       `SELECT 
//          COALESCE(SUM(total_amount), 0) as total_amount,
//          COALESCE(SUM(paid_amount), 0) as paid_amount
//        FROM ip_bills
//        WHERE admission_id = $1`,
//       [admissionIdNum]
//     );

//     if (billRes.rows.length > 0) {
//       const total = parseFloat(billRes.rows[0].total_amount);
//       const paid = parseFloat(billRes.rows[0].paid_amount);
//       billing = {
//         totalAmount: total,
//         insuranceCoverage: 0,
//         patientPay: total - paid,
//         status: total - paid <= 0 ? 'Settled' : 'Pending',
//       };
//     }

//     // 4. Medical records – explicit type
//     let medicalRecords: MedicalRecord[] = [];
//     try {
//       const recordsRes = await query(
//         `SELECT id, title, subtitle, icon, file_url
//          FROM medical_records
//          WHERE admission_id = $1
//          ORDER BY created_at DESC`,
//         [admissionIdNum]
//       );
//       medicalRecords = recordsRes.rows.map(r => ({
//         id: r.id,
//         title: r.title,
//         subtitle: r.subtitle,
//         icon: r.icon,
//         fileUrl: r.file_url,
//       }));
//     } catch  {
//       console.warn('Medical records table not found');
//     }

//     // 5. Build wardRoom
//     let wardRoom: string | null = null;
//     if (admission.ward_name) {
//       wardRoom = roomNumber ? `${admission.ward_name} - Room ${roomNumber}` : admission.ward_name;
//     }

//     // 6. Final response
//     const responseData = {
//       patient: {
//         name: admission.patient_name,
//         admissionId: admission.patient_id,
//         status: admission.status === 'discharged' ? 'Discharged' : 'Admitted',
//         primaryConsultant: admission.primary_consultant,
//         consultantDept: admission.consultant_dept,
//         wardRoom: wardRoom,
//         admissionDate: admission.admission_date,
//         dischargeDate: admission.discharge_date,
//       },
//       timelineEvents,
//       medicalRecords,
//       billing,
//     };

//     return NextResponse.json({ success: true, data: responseData });
//   } catch (error: unknown) {
//     console.error('Inpatient summary error:', error);
//        const authResponse=authErrorResponse(error);
// if(authResponse){
//   return authResponse
// }
//     const message = error instanceof Error ? error.message : 'Internal server error';
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500 }
//     );
//   }
// }




// app/api/patient/inpatient-summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse, requireRole } from '@/lib/auth/guards';
import { getCases } from '@/lib/surgery-db';

// --- Type definitions ---
interface TimelineEvent {
  id: number;
  date: string;
  title: string;
  description: string;
  type: string;
  color: string;
  icon?: string;
  note?: string;
}

interface MedicalRecord {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  fileUrl: string | null;
}

interface BillingSummary {
  totalAmount: number;
  insuranceCoverage: number;
  patientPay: number;
  status: string;
}

interface SurgeryHistoryItem {
  caseId: string;
  surgeryName: string | null;
  diagnosis: string | null;
  surgeryType: string | null;
  priorityLevel: string | null;
  expectedDate: string | null;
  caseStatus: string | null;
  estimatedDuration: number | null;
  recommendedBy: string | null;
  recommendedDate: string | null;
  otRoom: string | null;
  surgeryDate: string | null;
  startTime: string | null;
  endTime: string | null;
  otStatus: string | null;
  outcome: string | null;
  outcomeNotes: string | null;
  fitnessStatus: string | null;
  preopPerformedBy: string | null;
  asaGrade: string | null;
  anesthesiaStatus: string | null;
  currentStep: number;
  workflow: any[];
}

// --- Helper to build workflow for a single case ---
function buildWorkflow(caseData: any, currentStep: number) {
  return [
    {
      step: 1,
      name: 'Procedure Recommendation',
      status: currentStep >= 1 ? 'completed' : 'pending',
      completedAt: caseData.recommended_date || null,
      performedBy: caseData.recommended_by || null,
      details: [
        { label: 'Proposed Procedure', value: caseData.surgery_name || null },
        { label: 'Clinical Diagnosis', value: caseData.diagnosis || null },
        { label: 'Surgery Type', value: caseData.surgery_type || null },
        { label: 'Priority Urgency', value: caseData.priority_level || null },
        { label: 'Estimated Duration (Minutes)', value: caseData.estimated_duration || null },
        { label: 'Clinical Justification', value: caseData.clinical_notes || null },
      ],
    },
    {
      step: 2,
      name: 'Pre-Operative Assessment',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'in-progress' : 'pending',
      completedAt: caseData.preop_completed_at || null,
      performedBy: caseData.preop_performed_by || null,
      details: [
        { label: 'Fitness Status', value: caseData.fitness_status || null },
        { label: 'Co-morbidities', value: caseData.comorbidities || null },
        { label: 'Vitals', value: caseData.vitals || null },
        { label: 'Medical History', value: caseData.medical_history || null },
        { label: 'Drug Allergies', value: caseData.allergies || null },
      ],
    },
    {
      step: 3,
      name: 'Anesthesia Clearance',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'in-progress' : 'pending',
      completedAt: caseData.anesthesia_evaluation_date || null,
      performedBy: caseData.anesthetist_name || null,
      details: [
        { label: 'Anesthetist assigned', value: caseData.anesthetist_name || null },
        { label: 'ASA Classification', value: caseData.asa_grade || null },
        { label: 'Anesthesia Technique', value: caseData.anesthesia_type || null },
        { label: 'Airway Assessment', value: caseData.airway_assessment || null },
        { label: 'Clearance Outcome', value: caseData.anesthesia_status || null },
      ],
    },
    {
      step: 4,
      name: 'Authorization & Consent',
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'in-progress' : 'pending',
      completedAt: caseData.consent_completed_at || null,
      performedBy: caseData.consent_performed_by || null,
      details: [
        { label: 'Surgical Consent', value: caseData.surgical_consent || null },
        { label: 'Anesthetic Consent', value: caseData.anesthetic_consent || null },
        { label: 'Blood Transfusion Consent', value: caseData.transfusion_consent || null },
        { label: 'Verification Status', value: caseData.consent_status || null },
      ],
    },
    {
      step: 5,
      name: 'Post-Anesthesia Care (PACU)',
      status: currentStep > 5 ? 'completed' : currentStep === 5 ? 'in-progress' : 'pending',
      completedAt: caseData.pacu_completed_at || null,
      performedBy: caseData.pacu_performed_by || null,
      details: [
        { label: 'Recovery Status', value: caseData.recovery_status || null },
        { label: 'Timeline', value: caseData.timeline || null },
      ],
    },
    {
      step: 6,
      name: 'OT Slot Booking',
      status: currentStep > 6 ? 'completed' : currentStep === 6 ? 'in-progress' : 'pending',
      completedAt: caseData.ot_surgery_date || null,
      performedBy: caseData.ot_performed_by || null,
      details: [
        { label: 'Assigned OT Room', value: caseData.ot_room || null },
        { label: 'Scheduled Date', value: caseData.ot_surgery_date || null },
        { label: 'Start Time', value: caseData.ot_start_time || null },
        { label: 'End Time', value: caseData.ot_end_time || null },
        { label: 'Booking Status', value: caseData.ot_status || null },
      ],
    },
    {
      step: 7,
      name: 'Sterilization & Instrument Check',
      status: currentStep > 7 ? 'completed' : currentStep === 7 ? 'in-progress' : 'pending',
      completedAt: caseData.equipment_completed_at || null,
      performedBy: caseData.equipment_performed_by || null,
      details: [
        { label: 'Equipment Verification', value: caseData.equipment_status || null },
        { label: 'Surgical Table', value: caseData.ot_table || null },
        { label: 'Multipara Monitor', value: caseData.monitor || null },
        { label: 'Ventilator', value: caseData.ventilator || null },
      ],
    },
    {
      step: 8,
      name: 'Admissions & Pre-Op Checklist',
      status: currentStep > 8 ? 'completed' : currentStep === 8 ? 'in-progress' : 'pending',
      completedAt: caseData.checklist_completed_at || null,
      performedBy: caseData.checklist_performed_by || null,
      details: [
        { label: 'Patient Fasting', value: caseData.patient_fasting || null },
        { label: 'Consent Completed', value: caseData.consent_completed || null },
        { label: 'Blood Available', value: caseData.blood_available || null },
        { label: 'OT Clearance Status', value: caseData.day_clearance || null },
      ],
    },
    {
      step: 9,
      name: 'Surgical Consumables & Implants',
      status: currentStep > 9 ? 'completed' : currentStep === 9 ? 'in-progress' : 'pending',
      completedAt: caseData.consumables_completed_at || null,
      performedBy: caseData.consumables_performed_by || null,
      details: [
        { label: 'Surgical Consumables', value: caseData.surgical_consumables || null },
        { label: 'Implants', value: caseData.implants || null },
      ],
    },
    {
      step: 10,
      name: 'Clinical Team Staffing',
      status: currentStep > 10 ? 'completed' : currentStep === 10 ? 'in-progress' : 'pending',
      completedAt: caseData.team_assignment_date || null,
      performedBy: caseData.team_performed_by || null,
      details: [
        { label: 'Primary Surgeon', value: caseData.primary_surgeon || null },
        { label: 'Lead Anesthetist', value: caseData.lead_anesthetist || null },
        { label: 'Scrub Nurse', value: caseData.scrub_nurse || null },
        { label: 'Circulating Nurse', value: caseData.circulating_nurse || null },
        { label: 'OT Technician', value: caseData.ot_technician || null },
      ],
    },
    {
      step: 11,
      name: 'Ward Transition & Recovery Orders',
      status: currentStep > 11 ? 'completed' : currentStep === 11 ? 'in-progress' : 'pending',
      completedAt: caseData.postop_completed_at || null,
      performedBy: caseData.postop_performed_by || null,
      details: [
        { label: 'Recovery Status', value: caseData.recovery_status || null },
        { label: 'Medication Orders', value: caseData.postop_medications || null },
        { label: 'Intravenous Fluids', value: caseData.postop_fluids || null },
        { label: 'Nursing Tasks', value: caseData.nursing_tasks || null },
      ],
    },
    {
      step: 12,
      name: 'Clinical Outcome Tracking',
      status: currentStep > 12 ? 'completed' : currentStep === 12 ? 'in-progress' : 'pending',
      completedAt: caseData.outcome_completed_at || null,
      performedBy: caseData.primary_surgeon || null,
      details: [
        { label: 'Surgical Outcome', value: caseData.outcome || null },
        { label: 'Complications', value: caseData.complications || null },
        { label: 'Intra-Op Findings', value: caseData.intraop_findings || null },
        { label: 'Outcome Remarks', value: caseData.outcome_notes || null },
      ],
    },
    {
      step: 13,
      name: 'Financial Clearance & Billing',
      status: currentStep > 13 ? 'completed' : currentStep === 13 ? 'in-progress' : 'pending',
      completedAt: caseData.billing_date || null,
      performedBy: caseData.billing_performed_by || null,
      details: [
        { label: 'Estimated Package Cost', value: caseData.package_cost || null },
        { label: 'Actual Final Cost', value: caseData.actual_cost || null },
        { label: 'Is Billed', value: caseData.is_billed || null },
      ],
    },
    {
      step: 14,
      name: 'Discharge & Outpatient Follow-Up',
      status: currentStep >= 14 ? 'completed' : 'pending',
      completedAt: caseData.discharge_date || null,
      performedBy: caseData.discharge_performed_by || null,
      details: [
        { label: 'Surgical Summary', value: caseData.discharge_surgery_summary || null },
        { label: 'Discharge Summary', value: caseData.discharge_summary || null },
        { label: 'Medication Plan', value: caseData.discharge_meds_plan || null },
        { label: 'Follow-Up Appointment', value: caseData.follow_up_date || null },
      ],
    },
  ];
}

// --- Helper function to build summary by admission ID ---
async function getSummaryByAdmissionId(admissionIdNum: number) {
  // 1. Fetch admission & patient details
  const admissionRes = await query(
    `SELECT 
       a.id,
       a.admission_date,
       a.discharge_date,
       a.status,
       a.reason,
       a.diagnosis,
       a.primary_consultant,
       a.consultant_dept,
       p.patient_id,
       p.full_name_en as patient_name,
       p.dob,
       p.gender,
       p.phone,
       p.email,
       w.name as ward_name,
       b.bed_number,
       b.attributes as bed_attributes
     FROM admissions a
     JOIN patients p ON a.patient_id = p.patient_id
     LEFT JOIN wards w ON a.ward_id = w.id
     LEFT JOIN beds b ON a.bed_id = b.id
     WHERE a.id = $1`,
    [admissionIdNum]
  );

  if (admissionRes.rows.length === 0) {
    return NextResponse.json(
      { success: false, message: 'Admission not found' },
      { status: 404 }
    );
  }

  const admission = admissionRes.rows[0];

  // Extract room number
  let roomNumber = '';
  if (admission.bed_attributes && typeof admission.bed_attributes === 'object') {
    roomNumber = admission.bed_attributes.room_number || '';
  }

  // 2. Build timeline events
  const timelineEvents: TimelineEvent[] = [];

  // Admission event
  timelineEvents.push({
    id: 1,
    date: new Date(admission.admission_date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    title: 'Patient Admitted',
    description: admission.reason || 'Patient admitted',
    type: 'admission',
    color: 'green',
  });

  // Ward transfers
  const transfersRes = await query(
    `SELECT 
       wt.from_date,
       wt.to_date,
       w.name as ward_name,
       w.type as ward_type
     FROM ward_transfers wt
     JOIN wards w ON wt.ward_id = w.id
     WHERE wt.admission_id = $1
     ORDER BY wt.from_date`,
    [admissionIdNum]
  );

  for (let i = 0; i < transfersRes.rows.length; i++) {
    const transfer = transfersRes.rows[i];
    timelineEvents.push({
      id: 100 + i,
      date: new Date(transfer.from_date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      title: `Transferred to ${transfer.ward_name}`,
      description: `Moved to ${transfer.ward_name} (${transfer.ward_type})`,
      type: 'transfer',
      color: 'gray',
    });
  }

  // Discharge event
  if (admission.discharge_date) {
    timelineEvents.push({
      id: 999,
      date: new Date(admission.discharge_date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      title: 'Discharge Complete',
      description: 'Patient discharged. Final summary provided.',
      type: 'discharge',
      icon: 'logout',
      color: 'gray',
    });
  }

  timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 3. Billing summary
  let billing: BillingSummary | null = null;
  const billRes = await query(
    `SELECT 
       COALESCE(SUM(total_amount), 0) as total_amount,
       COALESCE(SUM(paid_amount), 0) as paid_amount
     FROM ip_bills
     WHERE admission_id = $1`,
    [admissionIdNum]
  );

  if (billRes.rows.length > 0) {
    const total = parseFloat(billRes.rows[0].total_amount);
    const paid = parseFloat(billRes.rows[0].paid_amount);
    billing = {
      totalAmount: total,
      insuranceCoverage: 0,
      patientPay: total - paid,
      status: total - paid <= 0 ? 'Settled' : 'Pending',
    };
  }

  // 4. Medical records
  let medicalRecords: MedicalRecord[] = [];
  try {
    const recordsRes = await query(
      `SELECT id, title, subtitle, icon, file_url
       FROM medical_records
       WHERE admission_id = $1
       ORDER BY created_at DESC`,
      [admissionIdNum]
    );
    medicalRecords = recordsRes.rows.map(r => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      icon: r.icon,
      fileUrl: r.file_url,
    }));
  } catch {
    console.warn('Medical records table not found');
  }

  // 5. Ward room string
  let wardRoom: string | null = null;
  if (admission.ward_name) {
    wardRoom = roomNumber ? `${admission.ward_name} - Room ${roomNumber}` : admission.ward_name;
  }

  // 6. Fetch surgery history from surgery_cases
  let surgeryHistory: SurgeryHistoryItem[] = [];
  const dischargeStatus = admission.discharge_date ? 'Discharged' : 'Not Discharged';

  try {
    const surgeryRes = await query(
      `SELECT 
         sc.id as case_id,
         sc.surgery_name,
         sc.diagnosis,
         sc.surgery_type,
         sc.priority_level,
         sc.expected_date,
         sc.status as case_status,
         sc.estimated_duration,
         sc.recommended_by,
         sc.recommended_date,
         sc.clinical_notes,
         sc.current_step,
         ot.ot_room,
         ot.surgery_date as ot_surgery_date,
         ot.start_time as ot_start_time,
         ot.end_time as ot_end_time,
         ot.status as ot_status,
         outcome.outcome,
         outcome.outcome_notes,
         preop.fitness_status,
         preop.performed_by as preop_performed_by,
         anesthesia.asa_grade,
         anesthesia.status as anesthesia_status
       FROM surgery_cases sc
       LEFT JOIN ot_schedules ot ON sc.id = ot.case_id
       LEFT JOIN outcome_tracking outcome ON sc.id = outcome.case_id
       LEFT JOIN pre_operative_assessments preop ON sc.id = preop.case_id
       LEFT JOIN anesthesia_evaluations anesthesia ON sc.id = anesthesia.case_id
       WHERE sc.patient_id = $1 AND sc.admission_id = $2
       ORDER BY sc.expected_date DESC`,
      [admission.patient_id, admission.id]
    );

    surgeryHistory = surgeryRes.rows.map(row => {
      const currentStep = row.current_step || 1;
      const workflow = buildWorkflow(row, currentStep);

      return {
        caseId: row.case_id,
        surgeryName: row.surgery_name,
        diagnosis: row.diagnosis,
        surgeryType: row.surgery_type,
        priorityLevel: row.priority_level,
        expectedDate: row.expected_date,
        caseStatus: row.case_status,
        estimatedDuration: row.estimated_duration,
        recommendedBy: row.recommended_by,
        recommendedDate: row.recommended_date,
        otRoom: row.ot_room,
        surgeryDate: row.ot_surgery_date,
        startTime: row.ot_start_time,
        endTime: row.ot_end_time,
        otStatus: row.ot_status,
        outcome: row.outcome,
        outcomeNotes: row.outcome_notes,
        fitnessStatus: row.fitness_status,
        preopPerformedBy: row.preop_performed_by,
        asaGrade: row.asa_grade,
        anesthesiaStatus: row.anesthesia_status,
        currentStep,
        workflow,
      };
    });
  } catch (err) {
    console.warn('Error fetching surgery history:', err);
  }

  const responseData = {
    patient: {
      name: admission.patient_name,
      admissionId: admission.patient_id,
      status: admission.status === 'discharged' ? 'Discharged' : 'Admitted',
      primaryConsultant: admission.primary_consultant,
      consultantDept: admission.consultant_dept,
      wardRoom: wardRoom,
      admissionDate: admission.admission_date,
      dischargeDate: admission.discharge_date,
      dischargeStatus,
      surgeryCount: surgeryHistory.length,
    },
    timelineEvents,
    medicalRecords,
    billing,
    surgeryHistory,
  };

  return NextResponse.json({ success: true, data: responseData });
}

// --- Main GET handler ---
export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['patient']);
    const url = new URL(req.url);
    const patientId = url.searchParams.get('patientId');
    const dateParam = url.searchParams.get('date');
    const admissionId = url.searchParams.get('admissionId');

    // If admissionId is provided directly, use the helper
    if (admissionId) {
      return getSummaryByAdmissionId(parseInt(admissionId));
    }

    // Otherwise require patientId and date
    if (!patientId || !dateParam) {
      return NextResponse.json(
        { success: false, message: 'Either admissionId or (patientId + date) required' },
        { status: 400 }
      );
    }

    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Find the admission active on the given date for this patient
    const admissionRes = await query(
      `SELECT id
       FROM admissions
       WHERE patient_id = $1
         AND admission_date <= $2
         AND (discharge_date IS NULL OR discharge_date >= $2)
       ORDER BY admission_date DESC
       LIMIT 1`,
      [patientId, targetDate]
    );

    if (admissionRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No active admission found for this date' },
        { status: 404 }
      );
    }

    const foundAdmissionId = admissionRes.rows[0].id;
    return getSummaryByAdmissionId(foundAdmissionId);
  } catch (error: unknown) {
    console.error('Inpatient summary error:', error);
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}