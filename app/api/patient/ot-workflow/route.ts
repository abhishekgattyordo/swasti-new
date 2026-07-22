// app/api/patient/ot-workflow/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCases } from '@/lib/surgery-db';
import { SurgeryCase } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const patientId = url.searchParams.get('patientId')?.trim();
    const caseId = url.searchParams.get('caseId')?.trim();

    if (!patientId && !caseId) {
      return NextResponse.json(
        { success: false, error: 'Either caseId or patientId is required as a query parameter.' },
        { status: 400 }
      );
    }

    const cases = await getCases();

    if (!cases || !Array.isArray(cases) || cases.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No surgery cases found in the system.' },
        { status: 404 }
      );
    }

    let targetCase: SurgeryCase | undefined;

    if (caseId) {
      targetCase = cases.find(
        (c) => c.id?.toLowerCase() === caseId.toLowerCase()
      );
      if (!targetCase) {
        return NextResponse.json(
          { success: false, error: `No OT workflow found for case ID: "${caseId}"` },
          { status: 404 }
        );
      }
    } else if (patientId) {
      targetCase = cases.find((c) => {
        const idFromPatient = c.patient?.id;
        const idFromRaw = (c as any).patient_id || (c as any).patientId;
        return (
          idFromPatient?.toLowerCase() === patientId.toLowerCase() ||
          idFromRaw?.toLowerCase() === patientId.toLowerCase()
        );
      });
      if (!targetCase) {
        return NextResponse.json(
          { success: false, error: `No OT workflow found for patient ID: "${patientId}"` },
          { status: 404 }
        );
      }
    }

    // TypeScript safety
    if (!targetCase) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    // Safely extract patient data – use null for missing fields
    const patient = targetCase.patient || {};
    const patientSafe = {
      id: patient.id || null,
      name: patient.name || null,
      age: patient.age || null,
      gender: patient.gender || null,
      admissionId: patient.admissionId || null,
      roomNumber: patient.roomNumber || null,
      phone: patient.phone || null,
      bloodGroup: patient.bloodGroup || null,
    };

    const currentStep = targetCase.currentStep || 1;

    // ---- Determine Discharge Status ----
    const dischargeStatus = targetCase.discharge?.dischargeDate
      ? 'Discharged'
      : 'Not Discharged';

    // ---- 14‑Step Workflow Definition ----
    // All values come from the database; no hardcoded mock data.
    // performedBy and completedAt are set to null when they don't exist in the data model
    const workflow = [
      {
        step: 1,
        name: 'Procedure Recommendation',
        status: currentStep >= 1 ? 'completed' : 'pending',
        completedAt: targetCase.recommendation?.recommendedDate || null,
        performedBy: targetCase.recommendation?.recommendedBy || null,
        details: [
          { label: 'Proposed Procedure', value: targetCase.recommendation?.surgeryName || null },
          { label: 'Clinical Diagnosis', value: targetCase.recommendation?.diagnosis || null },
          { label: 'Surgery Type', value: targetCase.recommendation?.surgeryType || null },
          { label: 'Priority Urgency', value: targetCase.recommendation?.priorityLevel || null },
          { label: 'Est. Duration', value: targetCase.recommendation?.estimatedDuration ? `${targetCase.recommendation.estimatedDuration} mins` : null },
          { label: 'Clinical Justification', value: targetCase.recommendation?.clinicalNotes || null },
        ],
      },
      {
        step: 2,
        name: 'Pre-Operative Assessment',
        status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'in-progress' : 'pending',
        completedAt: null,
        performedBy: targetCase.preSurgeryAssessment?.performedBy || null,
        details: [
          { label: 'Fitness Status', value: targetCase.preSurgeryAssessment?.fitnessStatus || null },
          {
            label: 'Co-morbidities',
            value:
              Object.entries(targetCase.preSurgeryAssessment?.comorbidities || {})
                .filter(([, val]) => val === true)
                .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
                .join(', ') || targetCase.preSurgeryAssessment?.comorbidities?.other || null,
          },
          {
            label: 'Vitals Status',
            value: targetCase.preSurgeryAssessment?.vitals
              ? `BP: ${targetCase.preSurgeryAssessment.vitals.bp || 'N/A'}, Pulse: ${targetCase.preSurgeryAssessment.vitals.pulse || 'N/A'} bpm, SpO2: ${targetCase.preSurgeryAssessment.vitals.spo2 || 'N/A'}%`
              : null,
          },
          { label: 'Medical History', value: targetCase.preSurgeryAssessment?.medicalHistory || null },
          { label: 'Drug Allergies', value: targetCase.preSurgeryAssessment?.allergies || null },
        ],
      },
      {
        step: 3,
        name: 'Anesthesia Clearance',
        status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'in-progress' : 'pending',
        completedAt: targetCase.anesthesiaEvaluation?.evaluationDate || null,
        performedBy: targetCase.anesthesiaEvaluation?.anesthetistName || null,
        details: [
          { label: 'Anesthetist assigned', value: targetCase.anesthesiaEvaluation?.anesthetistName || null },
          { label: 'ASA Classification', value: targetCase.anesthesiaEvaluation?.asaGrade || null },
          { label: 'Anesthesia Technique', value: targetCase.anesthesiaEvaluation?.anesthesiaType || null },
          { label: 'Airway Assessment', value: targetCase.anesthesiaEvaluation?.airwayAssessment || null },
          { label: 'Clearance Outcome', value: targetCase.anesthesiaEvaluation?.status || null },
        ],
      },
      {
        step: 4,
        name: 'Authorization & Consent',
        status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'in-progress' : 'pending',
        completedAt: null,
        performedBy: null,
        details: [
          { label: 'Surgical Consent', value: targetCase.consentManagement?.consents?.surgery || null },
          { label: 'Anesthetic Consent', value: targetCase.consentManagement?.consents?.anesthesia || null },
          { label: 'Blood Transfusion Consent', value: targetCase.consentManagement?.consents?.transfusion || null },
          { label: 'Verification Status', value: targetCase.consentManagement?.status || null },
        ],
      },
      {
        step: 5,
        name: 'Post-Anesthesia Care (PACU)',
        status: currentStep > 5 ? 'completed' : currentStep === 5 ? 'in-progress' : 'pending',
        completedAt: null,
        performedBy: null,
        details: [
          { label: 'Recovery Status', value: targetCase.postOpRecovery?.status || null },
          {
            label: 'Timeline log',
            value: targetCase.intraOperative?.timeline?.anesthesiaStart
              ? `Anesthesia Start: ${targetCase.intraOperative.timeline.anesthesiaStart} | End: ${targetCase.intraOperative.timeline.anesthesiaEnd || null}`
              : null,
          },
        ],
      },
      {
        step: 6,
        name: 'OT Slot Booking',
        status: currentStep > 6 ? 'completed' : currentStep === 6 ? 'in-progress' : 'pending',
        completedAt: targetCase.otScheduling?.surgeryDate || null,
        performedBy: null,
        details: [
          { label: 'Assigned OT Room', value: targetCase.otScheduling?.otRoom || null },
          { label: 'Scheduled Date', value: targetCase.otScheduling?.surgeryDate || null },
          {
            label: 'Assigned Time slot',
            value: targetCase.otScheduling?.startTime ? `${targetCase.otScheduling.startTime} - ${targetCase.otScheduling.endTime}` : null,
          },
          { label: 'Booking Status', value: targetCase.otScheduling?.status || null },
        ],
      },
      {
        step: 7,
        name: 'Sterilization & Instrument Check',
        status: currentStep > 7 ? 'completed' : currentStep === 7 ? 'in-progress' : 'pending',
        completedAt: null,
        performedBy: null,
        details: [
          { label: 'Equipment Verification', value: targetCase.equipmentCheck?.status || null },
          { label: 'Surgical Table Status', value: targetCase.equipmentCheck?.equipment?.otTable || null },
          { label: 'Multipara Monitors', value: targetCase.equipmentCheck?.equipment?.monitor || null },
          { label: 'Ventilator Status', value: targetCase.equipmentCheck?.equipment?.ventilator || null },
        ],
      },
      {
        step: 8,
        name: 'Admissions & Pre-Op Checklist',
        status: currentStep > 8 ? 'completed' : currentStep === 8 ? 'in-progress' : 'pending',
        completedAt: null,
        performedBy: null,
        details: [
          { label: 'NBM/Fasting Status', value: targetCase.dayChecklist?.checklist?.patientFasting || null },
          { label: 'Consent Verification', value: targetCase.dayChecklist?.checklist?.consentCompleted || null },
          { label: 'Blood Cross-Matching', value: targetCase.dayChecklist?.checklist?.bloodAvailable || null },
          { label: 'OT Clearance Status', value: targetCase.dayChecklist?.otClearanceStatus || null },
        ],
      },
      {
        step: 9,
        name: 'Surgical Consumables & Implants',
        status: currentStep > 9 ? 'completed' : currentStep === 9 ? 'in-progress' : 'pending',
        completedAt: null,
        performedBy: null,
        details: [
          {
            label: 'Consumables Prepared',
            value: targetCase.consumablesTracking?.surgicalConsumables?.length
              ? `${targetCase.consumablesTracking.surgicalConsumables.length} items pre-packaged`
              : null,
          },
          {
            label: 'Implants Issued',
            value: targetCase.consumablesTracking?.implants?.length
              ? targetCase.consumablesTracking.implants.map((i) => `${i.name} (Batch: ${i.batchNumber})`).join(', ')
              : null,
          },
        ],
      },
      {
        step: 10,
        name: 'Clinical Team Staffing',
        status: currentStep > 10 ? 'completed' : currentStep === 10 ? 'in-progress' : 'pending',
        completedAt: targetCase.teamAssignment?.assignmentDate || null,
        performedBy: null,
        details: [
          { label: 'Primary Surgeon', value: targetCase.teamAssignment?.team?.primarySurgeon || null },
          { label: 'Lead Anesthetist', value: targetCase.teamAssignment?.team?.leadAnesthetist || null },
          { label: 'Assigned Scrub Nurse', value: targetCase.teamAssignment?.team?.scrubNurse || null },
          { label: 'Circulating Staff Nurse', value: targetCase.teamAssignment?.team?.circulatingNurse || null },
          { label: 'OT Technician', value: targetCase.teamAssignment?.team?.otTechnician || null },
        ],
      },
      {
        step: 11,
        name: 'Ward Transition & Recovery Orders',
        status: currentStep > 11 ? 'completed' : currentStep === 11 ? 'in-progress' : 'pending',
        completedAt: null,
        performedBy: null,
        details: [
          { label: 'Recovery Status', value: targetCase.postOpRecovery?.status || null },
          { label: 'Medication Orders', value: targetCase.postOpOrders?.medications || null },
          { label: 'Intravenous Fluids', value: targetCase.postOpOrders?.fluids || null },
          {
            label: 'Active Nursing Tasks',
            value: targetCase.postOpOrders?.nursingTasks
              ? `${targetCase.postOpOrders.nursingTasks.filter((t) => t.done).length}/${targetCase.postOpOrders.nursingTasks.length} completed`
              : null,
          },
        ],
      },
      {
        step: 12,
        name: 'Clinical Outcome Tracking',
        status: currentStep > 12 ? 'completed' : currentStep === 12 ? 'in-progress' : 'pending',
        completedAt: null,
        performedBy: targetCase.teamAssignment?.team?.primarySurgeon || null,
        details: [
          { label: 'Surgical Outcome', value: targetCase.outcomeTracking?.outcome || null },
          { label: 'Complications', value: targetCase.intraOperative?.surgicalNotes?.complications || null },
          { label: 'Intra-Op Findings', value: targetCase.intraOperative?.surgicalNotes?.findings || null },
          { label: 'Outcome Remarks', value: targetCase.outcomeTracking?.outcomeNotes || null },
        ],
      },
      {
        step: 13,
        name: 'Financial Clearance & Billing',
        status: currentStep > 13 ? 'completed' : currentStep === 13 ? 'in-progress' : 'pending',
        completedAt: targetCase.billing?.billingDate || null,
        performedBy: null,
        details: [
          {
            label: 'Est. Package Cost',
            value: targetCase.costEstimation?.packageCost
              ? `₹${targetCase.costEstimation.packageCost.toLocaleString('en-IN')}`
              : null,
          },
          {
            label: 'Actual Final Cost',
            value: targetCase.billing?.totalActualCost
              ? `₹${targetCase.billing.totalActualCost.toLocaleString('en-IN')}`
              : null,
          },
          { label: 'Invoice Status', value: targetCase.billing?.isBilled || null },
        ],
      },
      {
        step: 14,
        name: 'Discharge & Outpatient Follow-Up',
        status: currentStep >= 14 ? 'completed' : 'pending',
        completedAt: targetCase.discharge?.dischargeDate || null,
        performedBy: null,
        details: [
          { label: 'Surgical Summary', value: targetCase.discharge?.summary?.surgerySummary || null },
          { label: 'Discharge Summary', value: targetCase.discharge?.summary?.dischargeSummary || null },
          { label: 'Post-Op Meds Plan', value: targetCase.discharge?.summary?.medicationPlan || null },
          { label: 'Follow-Up Date', value: targetCase.discharge?.summary?.followUpAppointment || null },
        ],
      },
    ];

    return NextResponse.json({
      success: true,
      caseId: targetCase.id || null,
      patient: patientSafe,
      status: targetCase.status || null,
      currentStep,
      dischargeStatus,
      workflow,
    });
  } catch (err: any) {
    console.error('Error in /api/patient/ot-workflow:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch OT workflow.' },
      { status: 500 }
    );
  }
}