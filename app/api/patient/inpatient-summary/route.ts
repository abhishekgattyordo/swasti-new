// app/api/patient/inpatient-summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authErrorResponse,requireRole } from '@/lib/auth/guards';

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

  // 2. Build timeline events – explicit type
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

  // 4. Medical records – explicit type
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
  } catch (err) {
    console.warn('Medical records table not found');
  }

  // 5. Ward room string
  let wardRoom: string | null = null;
  if (admission.ward_name) {
    wardRoom = roomNumber ? `${admission.ward_name} - Room ${roomNumber}` : admission.ward_name;
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
    },
    timelineEvents,
    medicalRecords,
    billing,
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
        const authResponse=authErrorResponse(error);
if(authResponse){
  return authResponse
}
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}