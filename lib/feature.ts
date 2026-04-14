// lib/feature.ts

// Main Module Keys
export const MODULE_KEYS = {
  PHARMACY: 'pharmacy',
  PATIENT: 'patient',
  HELPDESK: 'helpdesk',
  BILLING: 'billing',
  DOCTOR: 'doctor',
  LABARATORY: 'labaratory',
  ADMIN: 'admin', 
} as const;

// Pharmacy Microfeature Keys
export const PHARMACY_FEATURES = {
  DASHBOARD: 'pharmacy_dashboard',
  MEDICINE: 'pharmacy_medicine',
  PURCHASE_ENTRY: 'pharmacy_purchase_entry',
  CURRENT_STOCK: 'pharmacy_current_stock',
  BILLING: 'pharmacy_billing',
  OP_DISPENSE: 'pharmacy_op_dispense',
  IP_ISSUE: 'pharmacy_ip_issue',
  LEDGER: 'pharmacy_ledger',
  EXPIRY_REPORT: 'pharmacy_expiry_report',
  STOCK_ADJUSTMENT: 'pharmacy_stock_adjustment',
} as const;

// Patient Microfeature Keys
export const PATIENT_FEATURES = {
  DASHBOARD: 'patient_dashboard',
  MEDICAL_RECORDS: 'patient_medical_records',
  PRESCRIPTION: 'patient_prescription',
  BILLING: 'patient_billing',
  ADMISSION_SUMMARY: 'patient_admission_summary',
  PROFILE: 'patient_profile',
  BOOK_APPOINTMENT: 'patient_book_appointment',
} as const;

// Helpdesk Microfeature Keys
export const HELPDESK_FEATURES = {
  DASHBOARD: 'helpdesk_dashboard',
  APPOINTMENTS: 'helpdesk_appointments',
  ROOM_AVAILABILITY: 'helpdesk_room_availability',
  DOCTOR_SLOTS: 'helpdesk_doctor_slots',
  BILLING: 'helpdesk_billing',
  NEW_ADMISSION: 'helpdesk_new_admission',
} as const;

// Billing Microfeature Keys
export const BILLING_FEATURES = {
  DASHBOARD: 'billing_dashboard',
  ADMITTED_PATIENT_BILLING: 'billing_admitted_patients',
  ALL_BILLS: 'billing_all_bills',
  DISCHARGE_SUMMARY: 'billing_discharge_summary',
  LEDGER: 'billing_ledger',
} as const;

// Doctor Microfeature Keys
export const DOCTOR_FEATURES = {
  DASHBOARD: 'doctor_dashboard',
  SCHEDULE: 'doctor_schedule',
  PATIENTS: 'doctor_patients',
  BILLING: 'doctor_billing',
} as const;

// Laboratory Microfeature Keys
export const LABARATORY_FEATURES = {
  DASHBOARD: 'labaratory_dashboard',
  TEST_CATALOG: 'labaratory_test_catalog',
  LAB_ORDERS: 'labaratory_lab_orders',
  SAMPLE_COLLECTION: 'labaratory_sample_collection',
  REPORTS: 'labaratory_reports',
} as const;

// Admin Microfeature Keys
export const ADMIN_FEATURES = {
  DASHBOARD: 'admin_dashboard',
  DOCTORS: 'admin_doctors',
  PATIENTS: 'admin_patients',
  BED_CONFIGURATION: 'admin_bed_configuration',
} as const;