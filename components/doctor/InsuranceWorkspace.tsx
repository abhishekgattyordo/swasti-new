// components/InsuranceWorkspace.tsx
"use client";

import React from "react";
// ✅ FIXED: Use framer-motion instead of motion/react
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ClipboardCheck,
  ShieldCheck,
  CheckCircle2,
  Check,
  Sparkles,
  FileJson,
  AlertTriangle,
} from "lucide-react";

// ============================================
// TYPES DEFINED DIRECTLY IN THIS FILE
// ============================================

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Icd10Code {
  code: string;
  description: string;
  category: string;
}

export interface ProcedureCode {
  code: string;
  description: string;
  category: string;
}

export interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  address: string;
  phone: string;
  policyNumber: string;
  tpaName: string;
  insurerName: string;
}

export interface DiagnosisDetails {
  primaryDiagnosis: string;
  icd10Codes: string;
  clinicalFindings: string;
  durationOfIllness: string;
  pastMedicalHistory: string;
}

export interface ProposedTreatment {
  procedureName: string;
  procedureCode: string;
  treatmentType: string;
  clinicalJustification: string;
}

export interface HospitalizationDetails {
  hospitalName: string;
  providerId: string;
  roomCategoryRequested: string;
  proposedAdmissionDate: string;
  expectedLengthOfStay: string;
}

export interface CostEstimation {
  roomRentPerDay: string;
  icuCharges: string;
  investigationCosts: string;
  surgeryCharges: string;
  professionalFees: string;
  medicinesCost: string;
  totalEstimatedCost: string;
}

export interface InvestigationDetails {
  labTests: string;
  radiologyFindings: string;
}

export interface TreatingDoctor {
  physicianName: string;
  registrationNumber: string;
  specialization: string;
  contact: string;
}

export interface PreAuthForm {
  patientInfo: PatientInfo;
  diagnosisDetails: DiagnosisDetails;
  proposedTreatment: ProposedTreatment;
  hospitalizationDetails: HospitalizationDetails;
  costEstimation: CostEstimation;
  investigationDetails: InvestigationDetails;
  treatingDoctor: TreatingDoctor;
}

export interface HospitalizationRecommend {
  isHospitalizationRequired: boolean;
  admissionType: string;
  expectedLengthOfStay: string;
  justification: string;
}

export interface AnalysisResult {
  patientSummary: string;
  soapNote: SoapNote;
  icd10Codes: Icd10Code[];
  procedureCodes: ProcedureCode[];
  laboratoryOrders: string[];
  hospitalizationRecommend: HospitalizationRecommend;
  preAuthForm: PreAuthForm;
  billingChecklist: string[];
  _simulationNotice?: string;
}

export interface InsuranceWorkspaceProps {
  activeTab: "overview" | "form" | "codes" | "checklist" | "json";
  setActiveTab: (tab: "overview" | "form" | "codes" | "checklist" | "json") => void;
  result: AnalysisResult;
  calculateCompletionPercentage: () => number;
  getMissingFieldsList: () => string[];
  isDigitallySigned: boolean;
  setIsDigitallySigned: (signed: boolean) => void;
  adminSignerName: string;
  setAdminSignerName: (name: string) => void;
  submitStep: number;
  setSubmitStep: (step: number) => void;
  preAuthId: string | null;
  setPreAuthId: (id: string | null) => void;
  submittingTpa: boolean;
  handleSubmitTpa: () => void;
  handleUpdateField: (section: keyof PreAuthForm, field: string, value: string) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const InsuranceWorkspace: React.FC<InsuranceWorkspaceProps> = ({
  activeTab,
  setActiveTab,
  result,
  calculateCompletionPercentage,
  getMissingFieldsList,
  isDigitallySigned,
  setIsDigitallySigned,
  adminSignerName,
  setAdminSignerName,
  submitStep,
  setSubmitStep,
  preAuthId,
  setPreAuthId,
  submittingTpa,
  handleSubmitTpa,
  handleUpdateField,
}) => {
  // Tab names for display
  const tabs = [
    { id: "overview" as const, label: "SOAP Overview", icon: Activity },
    { id: "form" as const, label: "IRDAI Pre-Auth Form", icon: ClipboardCheck },
    { id: "codes" as const, label: "ICD-10 & Codes", icon: ShieldCheck },
    { id: "checklist" as const, label: "Admin Checklist", icon: CheckCircle2 },
    { id: "json" as const, label: "JSON Export", icon: FileJson },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-slate-50/50 p-1 flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Patient Summary */}
              <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Patient Summary</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{result.patientSummary}</p>
              </div>

              {/* SOAP Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-xl p-4 bg-slate-50/50">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">S - Subjective</span>
                  <p className="text-sm text-slate-700 mt-2">{result.soapNote.subjective}</p>
                </div>
                <div className="border rounded-xl p-4 bg-slate-50/50">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">O - Objective</span>
                  <p className="text-sm text-slate-700 mt-2">{result.soapNote.objective}</p>
                </div>
                <div className="border rounded-xl p-4 bg-slate-50/50">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">A - Assessment</span>
                  <p className="text-sm text-slate-700 mt-2">{result.soapNote.assessment}</p>
                </div>
                <div className="border rounded-xl p-4 bg-slate-50/50">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">P - Plan</span>
                  <p className="text-sm text-slate-700 mt-2">{result.soapNote.plan}</p>
                </div>
              </div>

              {/* Hospitalization Recommendation */}
              <div className="border rounded-xl p-4 bg-green-50/50 border-green-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-green-800">Hospitalization Recommendation</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    result.hospitalizationRecommend.isHospitalizationRequired
                      ? "bg-green-500 text-white"
                      : "bg-slate-400 text-white"
                  }`}>
                    {result.hospitalizationRecommend.isHospitalizationRequired ? "✅ Required" : "Not Required"}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mt-2">
                  <strong>Type:</strong> {result.hospitalizationRecommend.admissionType}
                </p>
                <p className="text-sm text-slate-700">
                  <strong>Expected Stay:</strong> {result.hospitalizationRecommend.expectedLengthOfStay}
                </p>
                <p className="text-sm text-slate-700 mt-2 italic">{result.hospitalizationRecommend.justification}</p>
              </div>
            </motion.div>
          )}

          {activeTab === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Digital Signature Panel */}
              <div className="bg-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-bold">TPA Pre-Auth Review Workstation</h3>
                    <p className="text-sm text-blue-100 mt-1">Review and submit the pre-authorization dossier</p>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-500/30 px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">TPA Node: Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {/* Completion Percentage */}
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-xs uppercase text-blue-200 font-bold tracking-wider">Auto-Populate Rate</p>
                    <p className="text-3xl font-bold mt-1">{calculateCompletionPercentage()}%</p>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div
                        className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateCompletionPercentage()}%` }}
                      />
                    </div>
                  </div>

                  {/* Missing Fields */}
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-xs uppercase text-blue-200 font-bold tracking-wider">Required Manual Review</p>
                    {getMissingFieldsList().length === 0 ? (
                      <p className="text-emerald-300 font-semibold mt-1">✅ All fields completed!</p>
                    ) : (
                      <ul className="text-sm mt-1 space-y-1">
                        {getMissingFieldsList().slice(0, 4).map((field, i) => (
                          <li key={i} className="text-amber-200">• {field}</li>
                        ))}
                        {getMissingFieldsList().length > 4 && (
                          <li className="text-blue-200">+ {getMissingFieldsList().length - 4} more</li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* Sign & Submit */}
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-xs uppercase text-blue-200 font-bold tracking-wider">Billing Admin Sign-off</p>
                    {isDigitallySigned ? (
                      <div className="flex items-center justify-between mt-2 bg-emerald-500/20 p-2 rounded-lg">
                        <span className="text-sm font-semibold">✅ Signed: {adminSignerName}</span>
                        <button
                          onClick={() => {
                            setIsDigitallySigned(false);
                            setSubmitStep(0);
                            setPreAuthId(null);
                          }}
                          className="text-xs text-red-300 hover:text-red-200"
                        >
                          Reset
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-2">
                        <input
                          type="text"
                          placeholder="Enter your name..."
                          value={adminSignerName}
                          onChange={(e) => setAdminSignerName(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                        <button
                          onClick={() => {
                            if (!adminSignerName.trim()) {
                              alert("Please enter your name to sign.");
                              return;
                            }
                            setIsDigitallySigned(true);
                          }}
                          disabled={!adminSignerName.trim()}
                          className="w-full py-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 rounded-lg text-sm font-semibold transition-all"
                        >
                          Apply Digital Signature
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                {!preAuthId ? (
                  <button
                    onClick={handleSubmitTpa}
                    disabled={submittingTpa || !isDigitallySigned}
                    className={`w-full mt-4 py-3 rounded-lg font-bold transition-all ${
                      isDigitallySigned && !submittingTpa
                        ? "bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    }`}
                  >
                    {submittingTpa ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Transmitting...
                      </span>
                    ) : (
                      "Submit to TPA Gateway"
                    )}
                  </button>
                ) : (
                  <div className="mt-4 p-4 bg-emerald-500/30 rounded-lg border border-emerald-400/50 text-center">
                    <p className="font-bold text-white">✅ Pre-Authorization Issued!</p>
                    <p className="text-sm text-emerald-200 mt-1">Reference: <span className="font-mono">{preAuthId}</span></p>
                  </div>
                )}
              </div>

              {/* Pre-Auth Form Fields */}
              <div className="border rounded-xl p-6 space-y-6">
                {/* Patient Info */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 border-b pb-2">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {Object.entries(result.preAuthForm.patientInfo).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-xs text-slate-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleUpdateField("patientInfo", key, e.target.value)}
                          className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm ${
                            value === "Requires Review"
                              ? "border-amber-300 bg-amber-50 text-amber-800"
                              : "border-slate-200 bg-white"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnosis Details */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 border-b pb-2">Diagnosis Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {Object.entries(result.preAuthForm.diagnosisDetails).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-xs text-slate-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleUpdateField("diagnosisDetails", key, e.target.value)}
                          className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm ${
                            value === "Requires Review"
                              ? "border-amber-300 bg-amber-50 text-amber-800"
                              : "border-slate-200 bg-white"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposed Treatment */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 border-b pb-2">Proposed Treatment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {Object.entries(result.preAuthForm.proposedTreatment).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-xs text-slate-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleUpdateField("proposedTreatment", key, e.target.value)}
                          className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm ${
                            value === "Requires Review"
                              ? "border-amber-300 bg-amber-50 text-amber-800"
                              : "border-slate-200 bg-white"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Estimation */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 border-b pb-2">Cost Estimation (₹)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {Object.entries(result.preAuthForm.costEstimation).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-xs text-slate-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleUpdateField("costEstimation", key, e.target.value)}
                          className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm ${
                            value === "Requires Review"
                              ? "border-amber-300 bg-amber-50 text-amber-800"
                              : "border-slate-200 bg-white"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "codes" && (
            <motion.div
              key="codes"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* ICD-10 Codes */}
              <div className="border rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-4">ICD-10 Codes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.icd10Codes.map((code, i) => (
                    <div key={i} className="border rounded-lg p-4 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{code.code}</span>
                        <span className="text-xs text-slate-500">{code.category}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-2">{code.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Procedure Codes */}
              <div className="border rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Procedure Codes</h3>
                {result.procedureCodes.map((proc, i) => (
                  <div key={i} className="flex items-center justify-between border-b last:border-0 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{proc.description}</p>
                      <span className="text-xs text-slate-500">{proc.category}</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded">
                      {proc.code}
                    </span>
                  </div>
                ))}
              </div>

              {/* Lab Orders */}
              <div className="border rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Laboratory Orders</h3>
                <div className="flex flex-wrap gap-2">
                  {result.laboratoryOrders.map((lab, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {lab}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "checklist" && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Review these checkpoints before submitting the pre-authorization request.</span>
                </p>
              </div>
              <div className="space-y-3">
                {result.billingChecklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 border rounded-lg bg-white hover:bg-slate-50 transition-colors">
                    <input type="checkbox" className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300" />
                    <label className="text-sm text-slate-700 font-medium cursor-pointer select-none">{item}</label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "json" && (
            <motion.div
              key="json"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Complete JSON payload for EMR integration</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                    alert("JSON copied to clipboard!");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Copy JSON
                </button>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-[600px]">
                <pre className="text-xs text-slate-300 font-mono">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InsuranceWorkspace;