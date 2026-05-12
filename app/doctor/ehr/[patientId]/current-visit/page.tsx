


"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { currentVisitApi } from "@/lib/api/ehr";
import toast from "react-hot-toast";

export default function CurrentVisitPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params.patientId as string;
  const appointmentId = params.appointmentId as string;
  const date = searchParams.get("date");

  const [formData, setFormData] = useState({
    diagnosis: "",
    icd10_code: "",
    clinical_notes: "",
    follow_up_date: "",
    patient_instructions: "",
    consultation_fee: 0, // new field
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;

        if (date) {
          response = await currentVisitApi.getCurrentVisitByDate(patientId, date);
        } else if (appointmentId) {
          response = await currentVisitApi.getCurrentVisit(patientId, appointmentId);
        } else {
          response = await currentVisitApi.getCurrentVisit(patientId);
        }

        console.log("API response", response);

        // Safely extract visit data
        const visitData =
          response && typeof response === 'object' && 'success' in response
            ? response.data
            : response;

        if (visitData && typeof visitData === 'object' && Object.keys(visitData).length > 0) {
          const formattedDate = visitData.follow_up_date
            ? visitData.follow_up_date.split("T")[0]
            : "";

          setFormData({
            diagnosis: visitData.diagnosis || "",
            icd10_code: visitData.icd10_code || "",
            clinical_notes: visitData.clinical_notes || "",
            follow_up_date: formattedDate,
            patient_instructions: visitData.patient_instructions || "",
            consultation_fee: visitData.consultation_fee || 0, // load existing fee if any
          });
        } else {
          // No data – reset form
          setFormData({
            diagnosis: "",
            icd10_code: "",
            clinical_notes: "",
            follow_up_date: "",
            patient_instructions: "",
            consultation_fee: 0,
          });
        }
      } catch (error: any) {
        console.error("Error fetching current visit:", error);
        if (error?.response?.status !== 404) {
          toast.error("Failed to load current visit data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, appointmentId, date]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...formData };
      if (date) {
        payload.date = date;
      } else if (appointmentId) {
        payload.appointmentId = appointmentId;
      }

      // Ensure consultation_fee is sent as a number
      payload.consultation_fee = parseFloat(payload.consultation_fee) || 0;

      const response = await currentVisitApi.saveCurrentVisit(patientId, payload);
      const json = response.data !== undefined ? response.data : response;

      if (json && (json.success || json.appointmentId)) {
        toast.success(json.message || "Current visit saved");
      } else {
        toast.error(json?.message || "Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Diagnosis Section (unchanged) */}
      <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#137fec]">
                clinical_notes
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Assessment & Diagnosis
              </h3>
              <p className="text-xs text-slate-500">
                Primary evaluation and clinical findings
              </p>
            </div>
          </div>
          <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
            {saving ? "Saving..." : "Draft saved"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                diagnosis
              </span>
              Primary Diagnosis
            </label>
            <div className="relative">
              <input
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] pl-10 py-3 shadow-sm"
                placeholder="e.g. Acute Bronchitis"
                type="text"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                code
              </span>
              ICD-10 Code
            </label>
            <input
              name="icd10_code"
              value={formData.icd10_code}
              onChange={handleChange}
              className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] py-3 px-4 shadow-sm"
              type="text"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-400">
              note
            </span>
            Clinical Notes
          </label>
          <textarea
            name="clinical_notes"
            value={formData.clinical_notes}
            onChange={handleChange}
            className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-4 shadow-sm"
            placeholder="Enter patient complaints, observations, and assessment details..."
            rows={5}
          />
        </div>
      </section>

      {/* Follow Up Section */}
      <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#137fec]">
              event_upcoming
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Follow-up & Instructions
            </h3>
            <p className="text-xs text-slate-500">
              Schedule next visit and patient guidance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                calendar_month
              </span>
              Follow-up Date
            </label>
            <input
              name="follow_up_date"
              value={formData.follow_up_date}
              onChange={handleChange}
              className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] px-4 py-3 shadow-sm"
              type="date"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                description
              </span>
              Patient Instructions
            </label>
            <textarea
              name="patient_instructions"
              value={formData.patient_instructions}
              onChange={handleChange}
              className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-3 shadow-sm"
              placeholder="Additional instructions..."
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* Consultation Fee Section (new) */}
      <section className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600">
              currency_rupee
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Consultation Fee
            </h3>
            <p className="text-xs text-slate-500">
              Enter the fee for this visit (manually adjustable)
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 max-w-xs">
          <label className="text-sm font-semibold text-slate-700">
            Amount (₹)
          </label>
          <input
            name="consultation_fee"
            type="number"
            step="0.01"
            min="0"
            value={formData.consultation_fee}
            onChange={handleChange}
            className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] px-4 py-3 shadow-sm"
            placeholder="0.00"
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-[#137fec] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}