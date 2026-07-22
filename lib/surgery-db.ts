






// import fs from 'fs';
// import path from 'path';
// import pg from 'pg';
// import { SurgeryCase, CaseStatus, SurgeryType, PriorityLevel } from '../types';

// const { Pool } = pg;

// // Database file path - using absolute path from working directory
// const DB_FILE = path.join(process.cwd(), 'swasti_db.json');

// // Global PostgreSQL connection pool
// let pool: pg.Pool | null = null;

// export function getPool() {
//   if (!pool) {
//     const connectionString = process.env.DATABASE_URL;
//     if (!connectionString) {
//       return null;
//     }
//     pool = new Pool({
//       connectionString,
//       ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
//     });
//     // Ensure data column exists
//     pool.query('ALTER TABLE surgery_cases ADD COLUMN IF NOT EXISTS data TEXT').catch(err => {
//       console.warn("Failed to alter surgery_cases to add data column:", err.message || err);
//     });
//   }
//   return pool;
// }

// export async function query(text: string, params?: any[]): Promise<any> {
//   const p = getPool();
//   if (p) {
//     return await p.query(text, params);
//   }
//   console.warn("DATABASE_URL is not defined. Falling back to local JSON database simulation.");
//   return { rows: [] };
// }

// // Interface for normalized tables in our database
// export interface DatabaseSchema {
//   users: {
//     id: string;
//     name: string;
//     email: string;
//     role: string;
//   }[];
//   patients: {
//     id: string;
//     name: string;
//     age: number;
//     gender: string;
//     phone: string;
//     bloodGroup: string;
//   }[];
//   admissions: {
//     id: string;
//     patientId: string;
//     roomNumber: string;
//     admissionDate: string;
//   }[];
//   surgery_cases: {
//     id: string;
//     patientId: string;
//     admissionId: string;
//     status: string;
//     currentStep: number;
//     surgeryName: string;
//     diagnosis: string;
//     surgeryType: string;
//     expectedDate: string;
//     priorityLevel: string;
//     estimatedDuration: number;
//     clinicalNotes: string;
//     recommendedBy: string;
//     recommendedDate: string;
//   }[];
//   pre_operative_assessments: {
//     id: string;
//     caseId: string;
//     performedBy: string;
//     medicalHistory: string;
//     previousSurgeries: string;
//     allergies: string;
//     currentMedication: string;
//     comorbidities: string; // JSON string
//     vitals: string; // JSON string
//     tests: string; // JSON string
//     fitnessStatus: string;
//   }[];
//   anesthesia_evaluations: {
//     id: string;
//     caseId: string;
//     anesthetistName: string;
//     asaGrade: string;
//     airwayAssessment: string;
//     previousAnesthesiaHistory: string;
//     drugAllergies: string;
//     anesthesiaType: string;
//     status: string;
//     evaluationDate: string;
//   }[];
//   insurance: {
//     id: string;
//     caseId: string;
//     hasInsurance: boolean;
//     insuranceCompany: string;
//     tpaName: string;
//     requestedAmount: number;
//     approvedAmount: number;
//     documents: string; // JSON string of document names
//     status: string;
//   }[];
//   consent_forms: {
//     id: string;
//     caseId: string;
//     consents: string; // JSON string
//     signatures: string; // JSON string
//     signatureImages?: string; // JSON string
//     status: string;
//   }[];
//   ot_schedules: {
//     id: string;
//     caseId: string;
//     otRoom: string;
//     surgeryDate: string;
//     startTime: string;
//     endTime: string;
//     estimatedDuration: number;
//     status: string;
//   }[];
//   surgery_teams: {
//     id: string;
//     caseId: string;
//     team: string; // JSON string
//     assignedBy: string;
//     assignmentDate: string;
//     availabilityStatus: string;
//   }[];
//   equipment_checks: {
//     id: string;
//     caseId: string;
//     equipment: string; // JSON string
//     status: string;
//   }[];
//   day_checklists: {
//     id: string;
//     caseId: string;
//     checklist: string; // JSON string
//     otClearanceStatus: string;
//   }[];
//   intra_operative_records: {
//     id: string;
//     caseId: string;
//     timeline: string; // JSON string
//     events: string; // JSON string
//     surgicalNotes: string; // JSON string
//   }[];
//   consumables: {
//     id: string;
//     caseId: string;
//     surgicalConsumables: string; // JSON string
//     medicinesUsed: string; // JSON string
//     implants: string; // JSON string
//   }[];
//   recovery_notes: {
//     id: string;
//     caseId: string;
//     vitalsLogs: string; // JSON string
//     status: string;
//   }[];
//   post_operative_orders: {
//     id: string;
//     caseId: string;
//     medications: string;
//     antibiotics: string;
//     fluids: string;
//     diet: string;
//     physiotherapy: string;
//     nursingTasks: string; // JSON string
//   }[];
//   outcome_tracking: {
//     id: string;
//     caseId: string;
//     outcome: string;
//     outcomeNotes: string;
//     followUpPlan: string;
//   }[];
//   billing: {
//     id: string;
//     caseId: string;
//     actualCharges: string; // JSON string
//     totalActualCost: number;
//     isBilled: boolean;
//     billingDate: string;
//   }[];
//   discharge_summaries: {
//     id: string;
//     caseId: string;
//     summary: string; // JSON string
//     status: string;
//     dischargeDate: string;
//   }[];
//   ai_care_plans: {
//     id: string;
//     caseId: string;
//     carePlan: string; // JSON string
//     generatedAt: string;
//   }[];
//   audit_logs: {
//     id: string;
//     userId: string;
//     userEmail: string;
//     action: string;
//     entity: string;
//     entityId: string;
//     previousState: string; // JSON string
//     newState: string; // JSON string
//     timestamp: string;
//   }[];
// }

// // Global cached state (reloaded from disk)
// let dbCache: DatabaseSchema | null = null;

// // Lock flag to prevent concurrent write collisions
// let isWriting = false;

// // Function to read raw database from file
// export function readDb(): DatabaseSchema {
//   if (dbCache) return dbCache;

//   if (!fs.existsSync(DB_FILE)) {
//     // If database doesn't exist, seed it with migrated initial cases
//     const initialDb = seedInitialDatabase();
//     saveDb(initialDb);
//     dbCache = initialDb;
//     return initialDb;
//   }

//   try {
//     const rawData = fs.readFileSync(DB_FILE, 'utf-8');
//     if (!rawData.trim()) {
//       const initialDb = seedInitialDatabase();
//       saveDb(initialDb);
//       dbCache = initialDb;
//       return initialDb;
//     }
//     const parsed = JSON.parse(rawData) as DatabaseSchema;
//     dbCache = parsed;
//     return parsed;
//   } catch (error) {
//     console.error("Failed to read swasti_db.json, recreating seeded db", error);
//     const initialDb = seedInitialDatabase();
//     saveDb(initialDb);
//     dbCache = initialDb;
//     return initialDb;
//   }
// }

// // Function to save database to file atomically
// export function saveDb(data: DatabaseSchema) {
//   dbCache = data;
//   if (isWriting) {
//     // If already writing, perform a sync write immediately to avoid corruption
//     fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
//     return;
//   }

//   isWriting = true;
//   try {
//     // Use a temp file for atomic saving to prevent corrupting database if the node process is halted mid-write
//     const tempFile = DB_FILE + '.tmp';
//     fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
//     fs.renameSync(tempFile, DB_FILE);
//   } catch (err) {
//     console.error("Atomic database write failed, falling back to direct write", err);
//     fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
//   } finally {
//     isWriting = false;
//   }
// }

// // Normalize a full case into individual rows and insert them into the schema tables
// function insertOrUpdateCaseInSchema(db: DatabaseSchema, c: SurgeryCase) {
//   // 1. Patient Table
//   const existingPatientIdx = db.patients.findIndex(p => p.id === c.patient.id);
//   const patientRow = {
//     id: c.patient.id,
//     name: c.patient.name,
//     age: c.patient.age,
//     gender: c.patient.gender,
//     phone: c.patient.phone,
//     bloodGroup: c.patient.bloodGroup
//   };
//   if (existingPatientIdx >= 0) db.patients[existingPatientIdx] = patientRow;
//   else db.patients.push(patientRow);

//   // 2. Admission Table
//   const existingAdmissionIdx = db.admissions.findIndex(a => a.id === c.patient.admissionId);
//   const admissionRow = {
//     id: c.patient.admissionId,
//     patientId: c.patient.id,
//     roomNumber: c.patient.roomNumber,
//     admissionDate: c.recommendation.recommendedDate || new Date().toISOString().split('T')[0]
//   };
//   if (existingAdmissionIdx >= 0) db.admissions[existingAdmissionIdx] = admissionRow;
//   else db.admissions.push(admissionRow);

//   // 3. Surgery Cases Table
//   const existingCaseIdx = db.surgery_cases.findIndex(sc => sc.id === c.id);
//   const caseRow = {
//     id: c.id,
//     patientId: c.patient.id,
//     admissionId: c.patient.admissionId,
//     status: c.status,
//     currentStep: c.currentStep,
//     surgeryName: c.recommendation.surgeryName,
//     diagnosis: c.recommendation.diagnosis,
//     surgeryType: c.recommendation.surgeryType,
//     expectedDate: c.recommendation.expectedDate,
//     priorityLevel: c.recommendation.priorityLevel,
//     estimatedDuration: c.recommendation.estimatedDuration,
//     clinicalNotes: c.recommendation.clinicalNotes,
//     recommendedBy: c.recommendation.recommendedBy,
//     recommendedDate: c.recommendation.recommendedDate
//   };
//   if (existingCaseIdx >= 0) db.surgery_cases[existingCaseIdx] = caseRow;
//   else db.surgery_cases.push(caseRow);

//   // 4. Pre-Operative Assessment Table
//   const existingPreOpIdx = db.pre_operative_assessments.findIndex(p => p.caseId === c.id);
//   const preOpRow = {
//     id: `PREOP-${c.id}`,
//     caseId: c.id,
//     performedBy: c.preSurgeryAssessment.performedBy || '',
//     medicalHistory: c.preSurgeryAssessment.medicalHistory || '',
//     previousSurgeries: c.preSurgeryAssessment.previousSurgeries || '',
//     allergies: c.preSurgeryAssessment.allergies || '',
//     currentMedication: c.preSurgeryAssessment.currentMedication || '',
//     comorbidities: JSON.stringify(c.preSurgeryAssessment.comorbidities || {}),
//     vitals: JSON.stringify(c.preSurgeryAssessment.vitals || {}),
//     tests: JSON.stringify(c.preSurgeryAssessment.tests || {}),
//     fitnessStatus: c.preSurgeryAssessment.fitnessStatus || 'Pending'
//   };
//   if (existingPreOpIdx >= 0) db.pre_operative_assessments[existingPreOpIdx] = preOpRow;
//   else db.pre_operative_assessments.push(preOpRow);

//   // 5. Anesthesia Evaluation Table
//   const existingAnesthesiaIdx = db.anesthesia_evaluations.findIndex(a => a.caseId === c.id);
//   const anesthesiaRow = {
//     id: `ANESTH-${c.id}`,
//     caseId: c.id,
//     anesthetistName: c.anesthesiaEvaluation.anesthetistName || '',
//     asaGrade: c.anesthesiaEvaluation.asaGrade || 'ASA I',
//     airwayAssessment: c.anesthesiaEvaluation.airwayAssessment || '',
//     previousAnesthesiaHistory: c.anesthesiaEvaluation.previousAnesthesiaHistory || '',
//     drugAllergies: c.anesthesiaEvaluation.drugAllergies || '',
//     anesthesiaType: c.anesthesiaEvaluation.anesthesiaType || 'General',
//     status: c.anesthesiaEvaluation.status || 'Pending',
//     evaluationDate: c.anesthesiaEvaluation.evaluationDate || ''
//   };
//   if (existingAnesthesiaIdx >= 0) db.anesthesia_evaluations[existingAnesthesiaIdx] = anesthesiaRow;
//   else db.anesthesia_evaluations.push(anesthesiaRow);

//   // 6. Insurance Table
//   const existingInsuranceIdx = db.insurance.findIndex(i => i.caseId === c.id);
//   const insuranceRow = {
//     id: `INS-${c.id}`,
//     caseId: c.id,
//     hasInsurance: c.insurancePreAuth.hasInsurance || false,
//     insuranceCompany: c.insurancePreAuth.insuranceCompany || '',
//     tpaName: c.insurancePreAuth.tpaName || '',
//     requestedAmount: c.insurancePreAuth.requestedAmount || 0,
//     approvedAmount: c.insurancePreAuth.approvedAmount || 0,
//     documents: JSON.stringify(c.insurancePreAuth.documents || []),
//     status: c.insurancePreAuth.status || 'Draft'
//   };
//   if (existingInsuranceIdx >= 0) db.insurance[existingInsuranceIdx] = insuranceRow;
//   else db.insurance.push(insuranceRow);

//   // 7. Consent Forms Table
//   const existingConsentIdx = db.consent_forms.findIndex(co => co.caseId === c.id);
//   const consentRow = {
//     id: `CONSENT-${c.id}`,
//     caseId: c.id,
//     consents: JSON.stringify(c.consentManagement.consents || {}),
//     signatures: JSON.stringify(c.consentManagement.signatures || {}),
//     signatureImages: JSON.stringify((c.consentManagement as any).signatureImages || {}),
//     status: c.consentManagement.status || 'Pending'
//   };
//   if (existingConsentIdx >= 0) db.consent_forms[existingConsentIdx] = consentRow;
//   else db.consent_forms.push(consentRow);

//   // 8. OT Schedules Table
//   const existingOtIdx = db.ot_schedules.findIndex(o => o.caseId === c.id);
//   const otRow = {
//     id: `OTSCHED-${c.id}`,
//     caseId: c.id,
//     otRoom: c.otScheduling.otRoom || 'OT Suite 1 (Cardiothoracic)',
//     surgeryDate: c.otScheduling.surgeryDate || '',
//     startTime: c.otScheduling.startTime || '',
//     endTime: c.otScheduling.endTime || '',
//     estimatedDuration: c.otScheduling.estimatedDuration || 60,
//     status: c.otScheduling.status || 'Scheduled'
//   };
//   if (existingOtIdx >= 0) db.ot_schedules[existingOtIdx] = otRow;
//   else db.ot_schedules.push(otRow);

//   // 9. Surgery Teams Table
//   const existingTeamIdx = db.surgery_teams.findIndex(t => t.caseId === c.id);
//   const teamRow = {
//     id: `TEAM-${c.id}`,
//     caseId: c.id,
//     team: JSON.stringify(c.teamAssignment.team || {}),
//     assignedBy: c.teamAssignment.assignedBy || '',
//     assignmentDate: c.teamAssignment.assignmentDate || '',
//     availabilityStatus: c.teamAssignment.availabilityStatus || 'Pending Verification'
//   };
//   if (existingTeamIdx >= 0) db.surgery_teams[existingTeamIdx] = teamRow;
//   else db.surgery_teams.push(teamRow);

//   // 10. Equipment Check Table
//   const existingEquipIdx = db.equipment_checks.findIndex(eq => eq.caseId === c.id);
//   const equipRow = {
//     id: `EQUIP-${c.id}`,
//     caseId: c.id,
//     equipment: JSON.stringify(c.equipmentCheck?.equipment || {}),
//     status: c.equipmentCheck?.status || 'Pending'
//   };
//   if (existingEquipIdx >= 0) db.equipment_checks[existingEquipIdx] = equipRow;
//   else db.equipment_checks.push(equipRow);

//   // 11. Day Checklist Table
//   const existingCheckIdx = db.day_checklists.findIndex(dc => dc.caseId === c.id);
//   const checkRow = {
//     id: `DAYCHECK-${c.id}`,
//     caseId: c.id,
//     checklist: JSON.stringify(c.dayChecklist.checklist || {}),
//     otClearanceStatus: c.dayChecklist.otClearanceStatus || 'Pending'
//   };
//   if (existingCheckIdx >= 0) db.day_checklists[existingCheckIdx] = checkRow;
//   else db.day_checklists.push(checkRow);

//   // 12. Intra-Operative Record Table
//   const existingIntraIdx = db.intra_operative_records.findIndex(io => io.caseId === c.id);
//   const intraRow = {
//     id: `INTRAOP-${c.id}`,
//     caseId: c.id,
//     timeline: JSON.stringify(c.intraOperative.timeline || {}),
//     events: JSON.stringify(c.intraOperative.events || []),
//     surgicalNotes: JSON.stringify(c.intraOperative.surgicalNotes || {})
//   };
//   if (existingIntraIdx >= 0) db.intra_operative_records[existingIntraIdx] = intraRow;
//   else db.intra_operative_records.push(intraRow);

//   // 13. Consumables & Implants Table
//   const existingConsIdx = db.consumables.findIndex(co => co.caseId === c.id);
//   const consRow = {
//     id: `CONSUM-${c.id}`,
//     caseId: c.id,
//     surgicalConsumables: JSON.stringify(c.consumablesTracking.surgicalConsumables || []),
//     medicinesUsed: JSON.stringify(c.consumablesTracking.medicinesUsed || []),
//     implants: JSON.stringify(c.consumablesTracking.implants || [])
//   };
//   if (existingConsIdx >= 0) db.consumables[existingConsIdx] = consRow;
//   else db.consumables.push(consRow);

//   // 14. Recovery Notes Table
//   const existingRecIdx = db.recovery_notes.findIndex(r => r.caseId === c.id);
//   const recRow = {
//     id: `RECOVERY-${c.id}`,
//     caseId: c.id,
//     vitalsLogs: JSON.stringify(c.postOpRecovery.vitalsLogs || []),
//     status: c.postOpRecovery.status || 'Critical'
//   };
//   if (existingRecIdx >= 0) db.recovery_notes[existingRecIdx] = recRow;
//   else db.recovery_notes.push(recRow);

//   // 15. Post-Operative Orders Table
//   const existingPostOpIdx = db.post_operative_orders.findIndex(po => po.caseId === c.id);
//   const postOpRow = {
//     id: `POSTOP-${c.id}`,
//     caseId: c.id,
//     medications: c.postOpOrders.medications || '',
//     antibiotics: c.postOpOrders.antibiotics || '',
//     fluids: c.postOpOrders.fluids || '',
//     diet: c.postOpOrders.diet || '',
//     physiotherapy: c.postOpOrders.physiotherapy || '',
//     nursingTasks: JSON.stringify(c.postOpOrders.nursingTasks || [])
//   };
//   if (existingPostOpIdx >= 0) db.post_operative_orders[existingPostOpIdx] = postOpRow;
//   else db.post_operative_orders.push(postOpRow);

//   // 16. Outcome Tracking Table
//   const existingOutcomeIdx = db.outcome_tracking.findIndex(ot => ot.caseId === c.id);
//   const outcomeRow = {
//     id: `OUTCOME-${c.id}`,
//     caseId: c.id,
//     outcome: c.outcomeTracking.outcome || 'Successful',
//     outcomeNotes: c.outcomeTracking.outcomeNotes || '',
//     followUpPlan: c.outcomeTracking.followUpPlan || ''
//   };
//   if (existingOutcomeIdx >= 0) db.outcome_tracking[existingOutcomeIdx] = outcomeRow;
//   else db.outcome_tracking.push(outcomeRow);

//   // 17. Billing Table
//   const existingBillingIdx = db.billing.findIndex(b => b.caseId === c.id);
//   const billingRow = {
//     id: `BILLING-${c.id}`,
//     caseId: c.id,
//     actualCharges: JSON.stringify(c.billing.actualCharges || {}),
//     totalActualCost: c.billing.totalActualCost || 0,
//     isBilled: c.billing.isBilled || false,
//     billingDate: c.billing.billingDate || ''
//   };
//   if (existingBillingIdx >= 0) db.billing[existingBillingIdx] = billingRow;
//   else db.billing.push(billingRow);

//   // 18. Discharge Summaries Table
//   const existingDisIdx = db.discharge_summaries.findIndex(d => d.caseId === c.id);
//   const disRow = {
//     id: `DISCHARGE-${c.id}`,
//     caseId: c.id,
//     summary: JSON.stringify(c.discharge.summary || {}),
//     status: c.discharge.status || 'In Ward',
//     dischargeDate: c.discharge.dischargeDate || ''
//   };
//   if (existingDisIdx >= 0) db.discharge_summaries[existingDisIdx] = disRow;
//   else db.discharge_summaries.push(disRow);

//   // 19. AI Care Plans (Calculated on step progression/generation)
//   if (c.recommendation.clinicalNotes?.includes('AI-generated') || c.id === 'CASE-101') {
//     const existingCareIdx = db.ai_care_plans.findIndex(cp => cp.caseId === c.id);
//     const careRow = {
//       id: `AICARE-${c.id}`,
//       caseId: c.id,
//       carePlan: JSON.stringify({
//         carePlanId: `PLAN-${c.id}`,
//         title: `${c.recommendation.surgeryName} AI Care Pathway`,
//         clinicalSummary: c.recommendation.clinicalNotes,
//         aiGeneratedCarePlan: {
//           criticalMilestones: ['Pre-operative clinical checks', 'Optimal general anesthesia induction', 'Surgical resection', 'Recovery room vitals logging'],
//           recommendedConsumablesAndImplants: ['Standard lap suture sets', 'Antibiotic prophylaxis'],
//           estimatedRecoveryTimeInRecoveryRoom: 120,
//           dischargeCriteria: ['Normal vital logs', 'Pain score < 3']
//         }
//       }),
//       generatedAt: new Date().toISOString()
//     };
//     if (existingCareIdx >= 0) db.ai_care_plans[existingCareIdx] = careRow;
//     else db.ai_care_plans.push(careRow);
//   }
// }

// // Convert schema rows back into a single denormalized fully populated SurgeryCase object
// function denormalizeCaseFromSchema(
//   cRow: any,
//   patients: any[],
//   admissions: any[],
//   preOps: any[],
//   anesthesias: any[],
//   insurances: any[],
//   consents: any[],
//   otScheds: any[],
//   teams: any[],
//   equips: any[],
//   checklists: any[],
//   intraops: any[],
//   consums: any[],
//   recoveries: any[],
//   orders: any[],
//   outcomes: any[],
//   billings: any[],
//   discharges: any[]
// ): SurgeryCase {
//   const patientRow = patients.find(p => p.id === cRow.patientId) || {};
//   const admissionRow = admissions.find(a => a.id === cRow.admissionId) || {};
//   const preOpRow = preOps.find(p => p.caseId === cRow.id) || {};
//   const anesthesiaRow = anesthesias.find(a => a.caseId === cRow.id) || {};
//   const insuranceRow = insurances.find(i => i.caseId === cRow.id) || {};
//   const consentRow = consents.find(co => co.caseId === cRow.id) || {};
//   const otRow = otScheds.find(o => o.caseId === cRow.id) || {};
//   const teamRow = teams.find(t => t.caseId === cRow.id) || {};
//   const equipRow = equips.find(eq => eq.caseId === cRow.id) || {};
//   const checkRow = checklists.find(dc => dc.caseId === cRow.id) || {};
//   const intraRow = intraops.find(io => io.caseId === cRow.id) || {};
//   const consRow = consums.find(co => co.caseId === cRow.id) || {};
//   const recRow = recoveries.find(r => r.caseId === cRow.id) || {};
//   const postOpRow = orders.find(po => po.caseId === cRow.id) || {};
//   const outcomeRow = outcomes.find(ot => ot.caseId === cRow.id) || {};
//   const billingRow = billings.find(b => b.caseId === cRow.id) || {};
//   const disRow = discharges.find(d => d.caseId === cRow.id) || {};

//   // Safe JSON parser helper
//   const parseJson = (str: string, fallback: any) => {
//     if (!str) return fallback;
//     try {
//       return JSON.parse(str);
//     } catch (e) {
//       return fallback;
//     }
//   };

//   return {
//     id: cRow.id,
//     patient: {
//       id: patientRow.id || 'P-001',
//       name: patientRow.name || 'Unknown',
//       age: patientRow.age || 30,
//       gender: patientRow.gender || 'Male',
//       admissionId: admissionRow.id || 'ADM-001',
//       roomNumber: admissionRow.roomNumber || 'Ward A, Bed 1',
//       phone: patientRow.phone || '+91 99999 00000',
//       bloodGroup: patientRow.bloodGroup || 'O+'
//     },
//     status: cRow.status as CaseStatus,
//     currentStep: cRow.currentStep || 1,
//     recommendation: {
//       surgeryName: cRow.surgeryName,
//       diagnosis: cRow.diagnosis,
//       surgeryType: cRow.surgeryType as SurgeryType,
//       expectedDate: cRow.expectedDate,
//       priorityLevel: cRow.priorityLevel as PriorityLevel,
//       estimatedDuration: cRow.estimatedDuration || 60,
//       clinicalNotes: cRow.clinicalNotes,
//       recommendedBy: cRow.recommendedBy,
//       recommendedDate: cRow.recommendedDate
//     },
//     preSurgeryAssessment: {
//       performedBy: preOpRow.performedBy || '',
//       medicalHistory: preOpRow.medicalHistory || '',
//       previousSurgeries: preOpRow.previousSurgeries || '',
//       allergies: preOpRow.allergies || '',
//       currentMedication: preOpRow.currentMedication || '',
//       comorbidities: parseJson(preOpRow.comorbidities, { diabetes: false, hypertension: false, heartDisease: false, asthma: false, other: '' }),
//       vitals: parseJson(preOpRow.vitals, { bp: '120/80', pulse: 72, temp: 98.6, spo2: 98, weight: 70, height: 170, bmi: 24.2 }),
//       tests: parseJson(preOpRow.tests, { cbc: '', bloodGroup: '', ptInr: '', bloodSugar: '', ecg: '', xray: '', ctScan: '', mri: '' }),
//       fitnessStatus: preOpRow.fitnessStatus || 'Pending'
//     },
//     anesthesiaEvaluation: {
//       anesthetistName: anesthesiaRow.anesthetistName || '',
//       asaGrade: anesthesiaRow.asaGrade || 'ASA I',
//       airwayAssessment: anesthesiaRow.airwayAssessment || '',
//       previousAnesthesiaHistory: anesthesiaRow.previousAnesthesiaHistory || '',
//       drugAllergies: anesthesiaRow.drugAllergies || '',
//       anesthesiaType: anesthesiaRow.anesthesiaType || 'General',
//       status: anesthesiaRow.status || 'Pending',
//       evaluationDate: anesthesiaRow.evaluationDate || ''
//     },
//     costEstimation: {
//       charges: parseJson(billingRow.actualCharges, { surgeonFee: 0, assistantFee: 0, otUsage: 0, recoveryRoom: 0, anesthesia: 0, nursing: 0, implants: 0, consumables: 0, medicines: 0, investigations: 0, roomCharges: 0 }),
//       estimatedCost: billingRow.totalActualCost || 0,
//       packageCost: billingRow.totalActualCost || 0,
//       patientPayable: 0,
//       insurancePayable: billingRow.totalActualCost || 0
//     },
//     insurancePreAuth: {
//       hasInsurance: insuranceRow.hasInsurance || false,
//       insuranceCompany: insuranceRow.insuranceCompany || '',
//       tpaName: insuranceRow.tpaName || '',
//       requestedAmount: insuranceRow.requestedAmount || 0,
//       approvedAmount: insuranceRow.approvedAmount || 0,
//       documents: parseJson(insuranceRow.documents, []),
//       status: insuranceRow.status || 'Draft'
//     },
//     consentManagement: {
//       consents: parseJson(consentRow.consents, { surgery: false, anesthesia: false, transfusion: false }),
//       signatures: parseJson(consentRow.signatures, { patient: false, attendant: false, doctor: false, witness: false }),
//       signatureImages: parseJson(consentRow.signatureImages, {}),
//       status: consentRow.status || 'Pending'
//     },
//     teamAssignment: {
//       team: parseJson(teamRow.team, { primarySurgeon: '', assistantSurgeon: '', leadAnesthetist: '', assistantAnesthetist: '', scrubNurse: '', circulatingNurse: '', otTechnician: '', biomedicalTech: '' }),
//       assignedBy: teamRow.assignedBy || '',
//       assignmentDate: teamRow.assignmentDate || '',
//       availabilityStatus: teamRow.availabilityStatus || 'Pending Verification'
//     },
//     otScheduling: {
//       otRoom: otRow.otRoom || 'OT Suite 1 (Cardiothoracic)',
//       surgeryDate: otRow.surgeryDate || '',
//       startTime: otRow.startTime || '',
//       endTime: otRow.endTime || '',
//       estimatedDuration: otRow.estimatedDuration || 60,
//       status: otRow.status || 'Scheduled'
//     },
//     equipmentCheck: {
//       equipment: parseJson(equipRow.equipment, { otTable: 'Available', monitor: 'Available', ventilator: 'Available', cauteryMachine: 'Available', endoscopyEquipment: 'Available' }),
//       status: equipRow.status || 'Pending'
//     },
//     dayChecklist: {
//       checklist: parseJson(checkRow.checklist, { consentCompleted: false, insuranceApproved: false, patientFasting: false, testsAvailable: false, bloodAvailable: false, otReady: false, teamReady: false }),
//       otClearanceStatus: checkRow.otClearanceStatus || 'Pending'
//     },
//     intraOperative: {
//       timeline: parseJson(intraRow.timeline, { patientShiftedToOT: '', anesthesiaStart: '', surgeryStart: '', surgeryEnd: '', anesthesiaEnd: '' }),
//       events: parseJson(intraRow.events, []),
//       surgicalNotes: parseJson(intraRow.surgicalNotes, { procedurePerformed: '', findings: '', complications: '', bloodLoss: 0, implantUsed: '', specimenSent: false })
//     },
//     consumablesTracking: {
//       surgicalConsumables: parseJson(consRow.surgicalConsumables, []),
//       medicinesUsed: parseJson(consRow.medicinesUsed, []),
//       implants: parseJson(consRow.implants, [])
//     },
//     postOpRecovery: {
//       vitalsLogs: parseJson(recRow.vitalsLogs, []),
//       status: recRow.status || 'Critical'
//     },
//     postOpOrders: {
//       medications: postOpRow.medications || '',
//       antibiotics: postOpRow.antibiotics || '',
//       fluids: postOpRow.fluids || '',
//       diet: postOpRow.diet || '',
//       physiotherapy: postOpRow.physiotherapy || '',
//       nursingTasks: parseJson(postOpRow.nursingTasks, [])
//     },
//     outcomeTracking: {
//       outcome: outcomeRow.outcome || 'Successful',
//       outcomeNotes: outcomeRow.outcomeNotes || '',
//       followUpPlan: outcomeRow.followUpPlan || ''
//     },
//     billing: {
//       actualCharges: parseJson(billingRow.actualCharges, { surgeonFee: 0, assistantFee: 0, otUsage: 0, recoveryRoom: 0, anesthesia: 0, nursing: 0, implants: 0, consumables: 0, medicines: 0, investigations: 0, roomCharges: 0 }),
//       totalActualCost: billingRow.totalActualCost || 0,
//       isBilled: billingRow.isBilled || false,
//       billingDate: billingRow.billingDate || ''
//     },
//     discharge: {
//       summary: parseJson(disRow.summary, { surgerySummary: '', otNotes: '', implantDetails: '', dischargeSummary: '', medicationPlan: '', followUpAppointment: '' }),
//       status: disRow.status || 'In Ward',
//       dischargeDate: disRow.dischargeDate || ''
//     }
//   };
// }

// // Seed helper to populate the whole relational schema dynamically from mock cases
// export function seedInitialDatabase(): DatabaseSchema {
//   const schema: DatabaseSchema = {
//     users: [
//       { id: 'u1', name: 'Dr. Devendra Mehta', email: 'mehta@swasti.gov.in', role: 'Surgeon' },
//       { id: 'u2', name: 'Dr. Ronald D\'Souza', email: 'ronald@swasti.gov.in', role: 'Anesthetist' },
//       { id: 'u3', name: 'Sister Jaspreet Kaur', email: 'jaspreet@swasti.gov.in', role: 'Nurse' },
//       { id: 'u4', name: 'Dr. S. Clinical', email: 'abhishekgatty0@gmail.com', role: 'Admin' }
//     ],
//     patients: [],
//     admissions: [],
//     surgery_cases: [],
//     pre_operative_assessments: [],
//     anesthesia_evaluations: [],
//     insurance: [],
//     consent_forms: [],
//     ot_schedules: [],
//     surgery_teams: [],
//     equipment_checks: [],
//     day_checklists: [],
//     intra_operative_records: [],
//     consumables: [],
//     recovery_notes: [],
//     post_operative_orders: [],
//     outcome_tracking: [],
//     billing: [],
//     discharge_summaries: [],
//     ai_care_plans: [],
//     audit_logs: [
//       {
//         id: 'LOG-0001',
//         userId: 'u4',
//         userEmail: 'abhishekgatty0@gmail.com',
//         action: 'SEED',
//         entity: 'Database',
//         entityId: 'ALL',
//         previousState: '{}',
//         newState: '{"status":"Seeded initial relational schema successfully"}',
//         timestamp: new Date().toISOString()
//       }
//     ]
//   };

//   return schema;
// }

// // ------------------------------------------------------------
// // DATABASE READ/WRITE QUERY LAYER WITH RELATIONAL JOINS & TRANS
// // ------------------------------------------------------------

// export async function ensureDatabaseSeeded() {
//   const p = getPool();
//   if (!p) return;

//   try {
//     // 1. Seed users table if empty
//     try {
//       const userCheck = await p.query('SELECT COUNT(*) FROM users');
//       const userCount = parseInt(userCheck.rows[0].count, 10);
//       if (userCount === 0) {
//         console.log("PostgreSQL users table is empty. Seeding initial users...");
//         const seedUsers = [
//           { email: 'mehta@swasti.gov.in', password: 'hashedpassword123', full_name_en: 'Dr. Devendra Mehta', role: 'doctor' },
//           { email: 'ronald@swasti.gov.in', password: 'hashedpassword123', full_name_en: "Dr. Ronald D'Souza", role: 'doctor' },
//           { email: 'jaspreet@swasti.gov.in', password: 'hashedpassword123', full_name_en: 'Sister Jaspreet Kaur', role: 'nurse' },
//           { email: 'abhishekgatty0@gmail.com', password: 'hashedpassword123', full_name_en: 'Dr. S. Clinical', role: 'admin' }
//         ];
//         for (const u of seedUsers) {
//           await p.query(
//             'INSERT INTO users (email, password, full_name_en, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
//             [u.email, u.password, u.full_name_en, u.role]
//           );
//         }
//         console.log("PostgreSQL users table successfully seeded!");
//       }
//     } catch (err: any) {
//       console.warn("PostgreSQL automatic users table seeding failed. Error:", err.message || err);
//     }

//     // 2. Seed surgery_cases table if empty
//     const checkRes = await p.query('SELECT COUNT(*) FROM surgery_cases');
//     const count = parseInt(checkRes.rows[0].count, 10);
//     if (count === 0) {
//       console.log("PostgreSQL database is empty. Ready for new cases.");
//     }
//   } catch (err: any) {
//     console.warn("PostgreSQL automatic seeding failed. Table might not be ready or exists with different columns. Error:", err.message || err);
//   }
// }

// export async function getCases(): Promise<SurgeryCase[]> {
//   await ensureDatabaseSeeded();

//   const p = getPool();
//   if (p) {
//     try {
//       const res = await p.query('SELECT data FROM surgery_cases ORDER BY updated_at DESC');
//       return res.rows.map(row => (typeof row.data === 'string' ? JSON.parse(row.data) : row.data) as SurgeryCase);
//     } catch (err: any) {
//       console.warn("PostgreSQL getCases failed, falling back to local JSON database:", err.message || err);
//     }
//   }

//   const db = readDb();
//   return db.surgery_cases.map(sc => {
//     return denormalizeCaseFromSchema(
//       sc,
//       db.patients,
//       db.admissions,
//       db.pre_operative_assessments,
//       db.anesthesia_evaluations,
//       db.insurance,
//       db.consent_forms,
//       db.ot_schedules,
//       db.surgery_teams,
//       db.equipment_checks,
//       db.day_checklists,
//       db.intra_operative_records,
//       db.consumables,
//       db.recovery_notes,
//       db.post_operative_orders,
//       db.outcome_tracking,
//       db.billing,
//       db.discharge_summaries
//     );
//   });
// }

// export async function getCaseById(id: string): Promise<SurgeryCase | undefined> {
//   const p = getPool();
//   if (p) {
//     try {
//       const res = await p.query('SELECT data FROM surgery_cases WHERE id = $1', [id]);
//       if (res.rows.length > 0) {
//         const row = res.rows[0];
//         return (typeof row.data === 'string' ? JSON.parse(row.data) : row.data) as SurgeryCase;
//       }
//       return undefined;
//     } catch (err: any) {
//       console.warn("PostgreSQL getCaseById failed, falling back to local JSON database:", err.message || err);
//     }
//   }

//   const db = readDb();
//   const sc = db.surgery_cases.find(c => c.id === id);
//   if (!sc) return undefined;

//   return denormalizeCaseFromSchema(
//     sc,
//     db.patients,
//     db.admissions,
//     db.pre_operative_assessments,
//     db.anesthesia_evaluations,
//     db.insurance,
//     db.consent_forms,
//     db.ot_schedules,
//     db.surgery_teams,
//     db.equipment_checks,
//     db.day_checklists,
//     db.intra_operative_records,
//     db.consumables,
//     db.recovery_notes,
//     db.post_operative_orders,
//     db.outcome_tracking,
//     db.billing,
//     db.discharge_summaries
//   );
// }

// export async function insertCase(newCase: Partial<SurgeryCase>, userEmail = 'abhishekgatty0@gmail.com', userRole = 'Admin'): Promise<SurgeryCase> {
//   const db = readDb();

//   const caseId = newCase.id || `CASE-${Math.floor(Math.random() * 900 + 100)}`;
//   const patientId = newCase.patient?.id || `P-${Math.floor(Math.random() * 900 + 100)}`;
//   const admissionId = newCase.patient?.admissionId || `ADM-${Math.floor(Math.random() * 9000 + 1000)}`;

//   const fullCase: SurgeryCase = {
//     id: caseId,
//     patient: {
//       id: patientId,
//       name: newCase.patient?.name || 'Unknown',
//       age: newCase.patient?.age || 30,
//       gender: newCase.patient?.gender || 'Male',
//       admissionId: admissionId,
//       roomNumber: newCase.patient?.roomNumber || 'Ward A, Bed 1',
//       phone: newCase.patient?.phone || '+91 99999 00000',
//       bloodGroup: newCase.patient?.bloodGroup || 'O+'
//     },
//     status: 'Recommended',
//     currentStep: 1,
//     recommendation: {
//       surgeryName: newCase.recommendation?.surgeryName || 'Recommended Surgery',
//       diagnosis: newCase.recommendation?.diagnosis || 'Diagnosis',
//       surgeryType: newCase.recommendation?.surgeryType || 'Elective',
//       expectedDate: newCase.recommendation?.expectedDate || '2026-06-25',
//       priorityLevel: (newCase.recommendation?.priorityLevel || (newCase.recommendation as any)?.priority || 'Medium') as PriorityLevel,
//       estimatedDuration: newCase.recommendation?.estimatedDuration || 60,
//       clinicalNotes: newCase.recommendation?.clinicalNotes || (newCase as any)?.clinicalNotes || 'No notes.',
//       recommendedBy: newCase.recommendation?.recommendedBy || 'Doctor',
//       recommendedDate: new Date().toISOString().split('T')[0]
//     },
//     preSurgeryAssessment: {
//       performedBy: '',
//       medicalHistory: '',
//       previousSurgeries: '',
//       allergies: '',
//       currentMedication: '',
//       comorbidities: { diabetes: false, hypertension: false, heartDisease: false, asthma: false, other: '' },
//       vitals: { bp: '120/80', pulse: 72, temp: 98.6, spo2: 98, weight: 70, height: 170, bmi: 24.2 },
//       tests: { cbc: '', bloodGroup: '', ptInr: '', bloodSugar: '', ecg: '', xray: '', ctScan: '', mri: '' },
//       fitnessStatus: 'Pending'
//     },
//     anesthesiaEvaluation: {
//       anesthetistName: '',
//       asaGrade: 'ASA I',
//       airwayAssessment: '',
//       previousAnesthesiaHistory: '',
//       drugAllergies: '',
//       anesthesiaType: 'General',
//       status: 'Pending',
//       evaluationDate: ''
//     },
//     costEstimation: {
//       charges: { surgeonFee: 0, assistantFee: 0, otUsage: 0, recoveryRoom: 0, anesthesia: 0, nursing: 0, implants: 0, consumables: 0, medicines: 0, investigations: 0, roomCharges: 0 },
//       estimatedCost: 0,
//       packageCost: 0,
//       patientPayable: 0,
//       insurancePayable: 0
//     },
//     insurancePreAuth: { hasInsurance: false, insuranceCompany: '', tpaName: '', requestedAmount: 0, approvedAmount: 0, documents: [], status: 'Draft' },
//     consentManagement: { consents: { surgery: false, anesthesia: false, transfusion: false }, signatures: { patient: false, attendant: false, doctor: false, witness: false }, status: 'Pending' },
//     teamAssignment: { team: { primarySurgeon: '', assistantSurgeon: '', leadAnesthetist: '', assistantAnesthetist: '', scrubNurse: '', circulatingNurse: '', otTechnician: '', biomedicalTech: '' }, assignedBy: '', assignmentDate: '', availabilityStatus: 'Pending Verification' },
//     otScheduling: { otRoom: 'OT Suite 1 (Cardiothoracic)', surgeryDate: '2026-06-25', startTime: '09:00', endTime: '10:00', estimatedDuration: 60, status: 'Scheduled' },
//     equipmentCheck: { equipment: { otTable: 'Available', monitor: 'Available', ventilator: 'Available', cauteryMachine: 'Available', endoscopyEquipment: 'Available' }, status: 'Pending' },
//     dayChecklist: { checklist: { consentCompleted: false, insuranceApproved: false, patientFasting: false, testsAvailable: false, bloodAvailable: false, otReady: false, teamReady: false }, otClearanceStatus: 'Pending' },
//     intraOperative: { timeline: { patientShiftedToOT: '', anesthesiaStart: '', surgeryStart: '', surgeryEnd: '', anesthesiaEnd: '' }, events: [], surgicalNotes: { procedurePerformed: '', findings: '', complications: '', bloodLoss: 0, implantUsed: '', specimenSent: false } },
//     consumablesTracking: { surgicalConsumables: [], medicinesUsed: [], implants: [] },
//     postOpRecovery: { vitalsLogs: [], status: 'Critical' },
//     postOpOrders: { medications: '', antibiotics: '', fluids: '', diet: '', physiotherapy: '', nursingTasks: [] },
//     outcomeTracking: { outcome: 'Successful', outcomeNotes: '', followUpPlan: '' },
//     billing: { actualCharges: { surgeonFee: 0, assistantFee: 0, otUsage: 0, recoveryRoom: 0, anesthesia: 0, nursing: 0, implants: 0, consumables: 0, medicines: 0, investigations: 0, roomCharges: 0 }, totalActualCost: 0, isBilled: false, billingDate: '' },
//     discharge: { summary: { surgerySummary: '', otNotes: '', implantDetails: '', dischargeSummary: '', medicationPlan: '', followUpAppointment: '' }, status: 'In Ward', dischargeDate: '' }
//   };

//   const p = getPool();
//   if (p) {
//     try {
//       const insertCaseSql = `
//         INSERT INTO surgery_cases (id, patient_id, admission_id, status, current_step, surgery_name, diagnosis, surgery_type, expected_date, priority_level, estimated_duration, clinical_notes, recommended_by, recommended_date, data)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
//         ON CONFLICT (id) DO UPDATE SET
//           patient_id = EXCLUDED.patient_id,
//           admission_id = EXCLUDED.admission_id,
//           status = EXCLUDED.status,
//           current_step = EXCLUDED.current_step,
//           surgery_name = EXCLUDED.surgery_name,
//           diagnosis = EXCLUDED.diagnosis,
//           surgery_type = EXCLUDED.surgery_type,
//           expected_date = EXCLUDED.expected_date,
//           priority_level = EXCLUDED.priority_level,
//           estimated_duration = EXCLUDED.estimated_duration,
//           clinical_notes = EXCLUDED.clinical_notes,
//           recommended_by = EXCLUDED.recommended_by,
//           recommended_date = EXCLUDED.recommended_date,
//           data = EXCLUDED.data
//       `;
//       try {
//         await p.query(insertCaseSql, [
//           caseId,
//           patientId,
//           admissionId,
//           fullCase.status,
//           fullCase.currentStep,
//           fullCase.recommendation.surgeryName,
//           fullCase.recommendation.diagnosis,
//           fullCase.recommendation.surgeryType,
//           fullCase.recommendation.expectedDate,
//           fullCase.recommendation.priorityLevel,
//           fullCase.recommendation.estimatedDuration,
//           fullCase.recommendation.clinicalNotes,
//           fullCase.recommendation.recommendedBy,
//           fullCase.recommendation.recommendedDate,
//           JSON.stringify(fullCase)
//         ]);
//       } catch (e: any) {
//         // Fallback for strict schema without 'data' column
//         const insertCaseSqlNoData = `
//           INSERT INTO surgery_cases (id, patient_id, admission_id, status, current_step, surgery_name, diagnosis, surgery_type, expected_date, priority_level, estimated_duration, clinical_notes, recommended_by, recommended_date)
//           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
//           ON CONFLICT (id) DO UPDATE SET
//             patient_id = EXCLUDED.patient_id,
//             admission_id = EXCLUDED.admission_id,
//             status = EXCLUDED.status,
//             current_step = EXCLUDED.current_step,
//             surgery_name = EXCLUDED.surgery_name,
//             diagnosis = EXCLUDED.diagnosis,
//             surgery_type = EXCLUDED.surgery_type,
//             expected_date = EXCLUDED.expected_date,
//             priority_level = EXCLUDED.priority_level,
//             estimated_duration = EXCLUDED.estimated_duration,
//             clinical_notes = EXCLUDED.clinical_notes,
//             recommended_by = EXCLUDED.recommended_by,
//             recommended_date = EXCLUDED.recommended_date
//         `;
//         await p.query(insertCaseSqlNoData, [
//           caseId,
//           patientId,
//           admissionId,
//           fullCase.status,
//           fullCase.currentStep,
//           fullCase.recommendation.surgeryName,
//           fullCase.recommendation.diagnosis,
//           fullCase.recommendation.surgeryType,
//           fullCase.recommendation.expectedDate,
//           fullCase.recommendation.priorityLevel,
//           fullCase.recommendation.estimatedDuration,
//           fullCase.recommendation.clinicalNotes,
//           fullCase.recommendation.recommendedBy,
//           fullCase.recommendation.recommendedDate
//         ]);
//       }

//       // Insert audit log
//       const logId = `LOG-${Math.floor(Math.random() * 90000 + 10000)}`;
//       const insertLogSql = `
//         INSERT INTO audit_logs (id, user_id, user_email, action, entity, entity_id, previous_state, new_state)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//       `;
//       await p.query(insertLogSql, [
//         logId,
//         'unknown',
//         userEmail,
//         'CREATE',
//         'SurgeryCase',
//         caseId,
//         JSON.stringify(null),
//         JSON.stringify({ id: caseId, patientName: fullCase.patient.name, surgeryName: fullCase.recommendation.surgeryName })
//       ]);
//     } catch (err: any) {
//       console.warn("PostgreSQL insertCase failed, falling back to local JSON database:", err.message || err);
//     }
//   }

//   insertOrUpdateCaseInSchema(db, fullCase);

//   const userRow = db.users.find(u => u.email === userEmail) || { id: 'unknown', name: userRole };
//   const auditLog = {
//     id: `LOG-${Math.floor(Math.random() * 90000 + 10000)}`,
//     userId: userRow.id,
//     userEmail: userEmail,
//     action: 'CREATE',
//     entity: 'SurgeryCase',
//     entityId: caseId,
//     previousState: 'null',
//     newState: JSON.stringify({ id: caseId, patientName: fullCase.patient.name, surgeryName: fullCase.recommendation.surgeryName }),
//     timestamp: new Date().toISOString()
//   };
//   db.audit_logs.push(auditLog);

//   saveDb(db);
//   return fullCase;
// }

// export async function updateCase(updatedCase: SurgeryCase, userEmail = 'abhishekgatty0@gmail.com', userRole = 'Admin'): Promise<SurgeryCase> {
//   const db = readDb();

//   const caseId = updatedCase.id;
//   const previousCase = await getCaseById(caseId);

//   const p = getPool();
//   if (p) {
//     try {
//       const updateCaseSql = `
//         UPDATE surgery_cases
//         SET status = $1, current_step = $2, surgery_name = $3, diagnosis = $4, surgery_type = $5, expected_date = $6, priority_level = $7, estimated_duration = $8, clinical_notes = $9, updated_at = CURRENT_TIMESTAMP
//         WHERE id = $10
//       `;
//       await p.query(updateCaseSql, [
//         updatedCase.status,
//         updatedCase.currentStep,
//         updatedCase.recommendation.surgeryName,
//         updatedCase.recommendation.diagnosis,
//         updatedCase.recommendation.surgeryType,
//         updatedCase.recommendation.expectedDate,
//         updatedCase.recommendation.priorityLevel,
//         updatedCase.recommendation.estimatedDuration,
//         updatedCase.recommendation.clinicalNotes,
//         caseId
//       ]);

//       try {
//         await p.query('UPDATE surgery_cases SET data = $1 WHERE id = $2', [JSON.stringify(updatedCase), caseId]);
//       } catch (e) {
//         // Safe to ignore if column data doesn't exist
//       }

//       const logId = `LOG-${Math.floor(Math.random() * 90000 + 10000)}`;
//       const insertLogSql = `
//         INSERT INTO audit_logs (id, user_id, user_email, action, entity, entity_id, previous_state, new_state)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//       `;
//       await p.query(insertLogSql, [
//         logId,
//         'unknown',
//         userEmail,
//         'UPDATE',
//         'SurgeryCase',
//         caseId,
//         previousCase ? JSON.stringify({ status: previousCase.status, step: previousCase.currentStep }) : '{}',
//         JSON.stringify({ status: updatedCase.status, step: updatedCase.currentStep })
//       ]);
//     } catch (err: any) {
//       console.warn("PostgreSQL updateCase failed, falling back to local JSON database:", err.message || err);
//     }
//   }

//   const exists = db.surgery_cases.some(sc => sc.id === caseId);
//   if (!exists) {
//     throw new Error(`Transaction failed: Surgery Case ${caseId} does not exist in relational schema.`);
//   }

//   insertOrUpdateCaseInSchema(db, updatedCase);

//   const userRow = db.users.find(u => u.email === userEmail) || { id: 'unknown', name: userRole };
//   const auditLog = {
//     id: `LOG-${Math.floor(Math.random() * 90000 + 10000)}`,
//     userId: userRow.id,
//     userEmail: userEmail,
//     action: 'UPDATE',
//     entity: 'SurgeryCase',
//     entityId: caseId,
//     previousState: previousCase ? JSON.stringify({ status: previousCase.status, step: previousCase.currentStep }) : 'unknown',
//     newState: JSON.stringify({ status: updatedCase.status, step: updatedCase.currentStep }),
//     timestamp: new Date().toISOString()
//   };
//   db.audit_logs.push(auditLog);

//   saveDb(db);
//   return updatedCase;
// }

// export async function getAuditLogs() {
//   const p = getPool();
//   if (p) {
//     try {
//       const res = await p.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
//       return res.rows;
//     } catch (err: any) {
//       console.warn("PostgreSQL getAuditLogs failed, falling back to local JSON database:", err.message || err);
//     }
//   }

//   const db = readDb();
//   return db.audit_logs;
// }

// export async function getUsers() {
//   const p = getPool();
//   if (p) {
//     try {
//       const res = await p.query('SELECT id, email, full_name_en AS name, role FROM users ORDER BY full_name_en ASC');
//       return res.rows;
//     } catch (err: any) {
//       console.warn("PostgreSQL getUsers failed, falling back to local JSON database:", err.message || err);
//     }
//   }

//   const db = readDb();
//   return db.users;
// }







// lib/surgery-db.ts
import { query } from '@/lib/db';
import { SurgeryCase, PriorityLevel } from '../types';

/**
 * Ensure the data column exists in surgery_cases (run once).
 */
let dataColumnChecked = false;
async function ensureDataColumn() {
  if (dataColumnChecked) return;
  try {
    await query('ALTER TABLE surgery_cases ADD COLUMN IF NOT EXISTS data TEXT');
    dataColumnChecked = true;
  } catch (err: any) {
    console.warn('Failed to add data column to surgery_cases:', err.message);
  }
}

/**
 * Retrieves all surgery cases from the database.
 */
export async function getCases(): Promise<SurgeryCase[]> {
  await ensureDataColumn();
  const res = await query('SELECT data FROM surgery_cases ORDER BY updated_at DESC');
  return res.rows.map(row => (typeof row.data === 'string' ? JSON.parse(row.data) : row.data) as SurgeryCase);
}

/**
 * Retrieves a surgery case by its unique ID.
 */
export async function getCaseById(id: string): Promise<SurgeryCase | undefined> {
  await ensureDataColumn();
  const res = await query('SELECT data FROM surgery_cases WHERE id = $1', [id]);
  if (res.rows.length > 0) {
    const row = res.rows[0];
    return (typeof row.data === 'string' ? JSON.parse(row.data) : row.data) as SurgeryCase;
  }
  return undefined;
}

/**
 * Inserts a new surgery case into the database and logs the action in audit_logs.
 */
export async function insertCase(
  newCase: Partial<SurgeryCase>,
  userEmail = 'system@swasti.gov.in',
  userRole = 'Admin'
): Promise<SurgeryCase> {
  await ensureDataColumn();

  const caseId = newCase.id || `CASE-${Math.floor(Math.random() * 900 + 100)}`;
  const patientId = newCase.patient?.id || `P-${Math.floor(Math.random() * 900 + 100)}`;
  const admissionId = newCase.patient?.admissionId || `ADM-${Math.floor(Math.random() * 9000 + 1000)}`;

  const fullCase: SurgeryCase = {
    id: caseId,
    patient: {
      id: patientId,
      name: newCase.patient?.name || 'Unknown',
      age: newCase.patient?.age || 30,
      gender: newCase.patient?.gender || 'Male',
      admissionId: admissionId,
      roomNumber: newCase.patient?.roomNumber || 'Ward A, Bed 1',
      phone: newCase.patient?.phone || '+91 99999 00000',
      bloodGroup: newCase.patient?.bloodGroup || 'O+',
    },
    status: 'Recommended',
    currentStep: 1,
    recommendation: {
      surgeryName: newCase.recommendation?.surgeryName || 'Recommended Surgery',
      diagnosis: newCase.recommendation?.diagnosis || 'Diagnosis',
      surgeryType: newCase.recommendation?.surgeryType || 'Elective',
      expectedDate: newCase.recommendation?.expectedDate || new Date().toISOString().split('T')[0],
      priorityLevel: (newCase.recommendation?.priorityLevel || 'Medium') as PriorityLevel,
      estimatedDuration: newCase.recommendation?.estimatedDuration || 60,
      clinicalNotes: newCase.recommendation?.clinicalNotes || 'No notes.',
      recommendedBy: newCase.recommendation?.recommendedBy || 'Doctor',
      recommendedDate: new Date().toISOString().split('T')[0],
    },
    preSurgeryAssessment: {
      performedBy: '',
      medicalHistory: '',
      previousSurgeries: '',
      allergies: '',
      currentMedication: '',
      comorbidities: { diabetes: false, hypertension: false, heartDisease: false, asthma: false, other: '' },
      vitals: { bp: '120/80', pulse: 72, temp: 98.6, spo2: 98, weight: 70, height: 170, bmi: 24.2 },
      tests: { cbc: '', bloodGroup: '', ptInr: '', bloodSugar: '', ecg: '', xray: '', ctScan: '', mri: '' },
      fitnessStatus: 'Pending',
    },
    anesthesiaEvaluation: {
      anesthetistName: '',
      asaGrade: 'ASA I',
      airwayAssessment: '',
      previousAnesthesiaHistory: '',
      drugAllergies: '',
      anesthesiaType: 'General',
      status: 'Pending',
      evaluationDate: '',
    },
    costEstimation: {
      charges: { surgeonFee: 0, assistantFee: 0, otUsage: 0, recoveryRoom: 0, anesthesia: 0, nursing: 0, implants: 0, consumables: 0, medicines: 0, investigations: 0, roomCharges: 0 },
      estimatedCost: 0,
      packageCost: 0,
      patientPayable: 0,
      insurancePayable: 0,
    },
    insurancePreAuth: { hasInsurance: false, insuranceCompany: '', tpaName: '', requestedAmount: 0, approvedAmount: 0, documents: [], status: 'Draft' },
    consentManagement: { consents: { surgery: false, anesthesia: false, transfusion: false }, signatures: { patient: false, attendant: false, doctor: false, witness: false }, status: 'Pending' },
    teamAssignment: { team: { primarySurgeon: '', assistantSurgeon: '', leadAnesthetist: '', assistantAnesthetist: '', scrubNurse: '', circulatingNurse: '', otTechnician: '', biomedicalTech: '' }, assignedBy: '', assignmentDate: '', availabilityStatus: 'Pending Verification' },
    otScheduling: { otRoom: 'OT Suite 1', surgeryDate: '', startTime: '09:00', endTime: '10:00', estimatedDuration: 60, status: 'Pending' },
    equipmentCheck: { equipment: { otTable: 'Available', monitor: 'Available', ventilator: 'Available', cauteryMachine: 'Available', endoscopyEquipment: 'Available' }, status: 'Pending' },
    dayChecklist: { checklist: { consentCompleted: false, insuranceApproved: false, patientFasting: false, testsAvailable: false, bloodAvailable: false, otReady: false, teamReady: false }, otClearanceStatus: 'Pending' },
    intraOperative: { timeline: { patientShiftedToOT: '', anesthesiaStart: '', surgeryStart: '', surgeryEnd: '', anesthesiaEnd: '' }, events: [], surgicalNotes: { procedurePerformed: '', findings: '', complications: '', bloodLoss: 0, implantUsed: '', specimenSent: false } },
    consumablesTracking: { surgicalConsumables: [], medicinesUsed: [], implants: [] },
    postOpRecovery: { vitalsLogs: [], status: 'Critical' },
    postOpOrders: { medications: '', antibiotics: '', fluids: '', diet: '', physiotherapy: '', nursingTasks: [] },
    outcomeTracking: { outcome: 'Successful', outcomeNotes: '', followUpPlan: '' },
    billing: { actualCharges: { surgeonFee: 0, assistantFee: 0, otUsage: 0, recoveryRoom: 0, anesthesia: 0, nursing: 0, implants: 0, consumables: 0, medicines: 0, investigations: 0, roomCharges: 0 }, totalActualCost: 0, isBilled: false, billingDate: '' },
    discharge: { summary: { surgerySummary: '', otNotes: '', implantDetails: '', dischargeSummary: '', medicationPlan: '', followUpAppointment: '' }, status: 'In Ward', dischargeDate: '' },
  };

  const insertCaseSql = `
    INSERT INTO surgery_cases (id, patient_id, admission_id, status, current_step, surgery_name, diagnosis, surgery_type, expected_date, priority_level, estimated_duration, clinical_notes, recommended_by, recommended_date, data)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    ON CONFLICT (id) DO UPDATE SET
      patient_id = EXCLUDED.patient_id,
      admission_id = EXCLUDED.admission_id,
      status = EXCLUDED.status,
      current_step = EXCLUDED.current_step,
      surgery_name = EXCLUDED.surgery_name,
      diagnosis = EXCLUDED.diagnosis,
      surgery_type = EXCLUDED.surgery_type,
      expected_date = EXCLUDED.expected_date,
      priority_level = EXCLUDED.priority_level,
      estimated_duration = EXCLUDED.estimated_duration,
      clinical_notes = EXCLUDED.clinical_notes,
      recommended_by = EXCLUDED.recommended_by,
      recommended_date = EXCLUDED.recommended_date,
      data = EXCLUDED.data
  `;

  await query(insertCaseSql, [
    caseId,
    patientId,
    admissionId,
    fullCase.status,
    fullCase.currentStep,
    fullCase.recommendation.surgeryName,
    fullCase.recommendation.diagnosis,
    fullCase.recommendation.surgeryType,
    fullCase.recommendation.expectedDate,
    fullCase.recommendation.priorityLevel,
    fullCase.recommendation.estimatedDuration,
    fullCase.recommendation.clinicalNotes,
    fullCase.recommendation.recommendedBy,
    fullCase.recommendation.recommendedDate,
    JSON.stringify(fullCase),
  ]);

  // Insert audit log (try-catch to prevent failure if table doesn't exist)
  try {
    const logId = `LOG-${Math.floor(Math.random() * 90000 + 10000)}`;
    await query(
      `INSERT INTO audit_logs (id, user_id, user_email, action, entity, entity_id, previous_state, new_state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        logId,
        'unknown',
        userEmail,
        'CREATE',
        'SurgeryCase',
        caseId,
        JSON.stringify(null),
        JSON.stringify({ id: caseId, patientName: fullCase.patient.name, surgeryName: fullCase.recommendation.surgeryName }),
      ]
    );
  } catch {
    // Audit log table might not exist – ignore
  }

  return fullCase;
}

/**
 * Updates an existing surgery case in the database and records an audit log.
 */
export async function updateCase(
  updatedCase: SurgeryCase,
  userEmail = 'system@swasti.gov.in',
  userRole = 'Admin'
): Promise<SurgeryCase> {
  const caseId = updatedCase.id;
  const previousCase = await getCaseById(caseId);

  if (!previousCase) {
    throw new Error(`Transaction failed: Surgery Case ${caseId} does not exist in the database.`);
  }

  await query(
    `UPDATE surgery_cases
     SET status = $1, current_step = $2, surgery_name = $3, diagnosis = $4, surgery_type = $5, expected_date = $6, priority_level = $7, estimated_duration = $8, clinical_notes = $9, data = $10, updated_at = CURRENT_TIMESTAMP
     WHERE id = $11`,
    [
      updatedCase.status,
      updatedCase.currentStep,
      updatedCase.recommendation.surgeryName,
      updatedCase.recommendation.diagnosis,
      updatedCase.recommendation.surgeryType,
      updatedCase.recommendation.expectedDate,
      updatedCase.recommendation.priorityLevel,
      updatedCase.recommendation.estimatedDuration,
      updatedCase.recommendation.clinicalNotes,
      JSON.stringify(updatedCase),
      caseId,
    ]
  );

  try {
    const logId = `LOG-${Math.floor(Math.random() * 90000 + 10000)}`;
    await query(
      `INSERT INTO audit_logs (id, user_id, user_email, action, entity, entity_id, previous_state, new_state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        logId,
        'unknown',
        userEmail,
        'UPDATE',
        'SurgeryCase',
        caseId,
        JSON.stringify({ status: previousCase.status, step: previousCase.currentStep }),
        JSON.stringify({ status: updatedCase.status, step: updatedCase.currentStep }),
      ]
    );
  } catch {
    // Ignore audit table errors
  }

  return updatedCase;
}

/**
 * Fetches recent audit logs.
 */
export async function getAuditLogs() {
  try {
    const res = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    return res.rows;
  } catch {
    return [];
  }
}

/**
 * Fetches active medical users from the users table.
 */
export async function getUsers() {
  try {
    const res = await query('SELECT id, email, full_name_en AS name, role FROM users ORDER BY full_name_en ASC');
    return res.rows;
  } catch {
    return [];
  }
}




