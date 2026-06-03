


"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

// Types
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  patientId: string;
  phone: string;
  email: string;
  city: string;
  bloodGroup: string;
  allergies: string[];
  status: string;
}

export default function EHRSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;
      setLoading(true);
      
      try {
        const patientRes = await fetch(`/api/registration?patientId=${patientId}`);
        const patientJson = await patientRes.json();
        
        if (patientJson.success) {
          const patientData = patientJson.data;
          setPatient({
            id: patientData.patient_id,
            name: patientData.full_name_en || "Unknown",
            age: calculateAge(patientData.dob),
            gender: patientData.gender === "male" ? "Male" : patientData.gender === "female" ? "Female" : "Other",
            patientId: patientData.patient_id,
            phone: patientData.phone || "",
            email: patientData.email || "",
            city: patientData.city || "",
            bloodGroup: patientData.blood_group || "",
            allergies: patientData.allergy ? [patientData.allergy] : patientData.allergies || [],
            status: patientData.status || "Active",
          });
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast.error("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient record...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Patient Not Found</h2>
          <p className="text-red-600 mb-4">Unable to load patient information.</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Simple header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm border border-gray-200"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Main Content - No sidebar, no navigation */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Patient Health Record</h1>
          <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Patient Information Card */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Patient Information</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-sm font-medium text-gray-900 col-span-2">{patient.name}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">Patient ID</p>
                <p className="text-sm text-gray-900 col-span-2">{patient.patientId}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">Age / Gender</p>
                <p className="text-sm text-gray-900 col-span-2">{patient.age} years / {patient.gender}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="text-sm text-gray-900 col-span-2">{patient.bloodGroup || "Not specified"}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm text-gray-900 col-span-2">{patient.phone || "Not specified"}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm text-gray-900 break-all col-span-2">{patient.email || "Not specified"}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">City</p>
                <p className="text-sm text-gray-900 col-span-2">{patient.city || "Not specified"}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-sm col-span-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                    patient.status === "Critical" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}>
                    {patient.status}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Allergies */}
            {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== "None" && (
              <div className="mt-6 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-700">Allergies</p>
                <p className="text-sm text-red-600 mt-1">{patient.allergies.join(", ")}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-200">
          <p>This is a computer-generated document. No signature required.</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          button {
            display: none !important;
          }
          .border, .border-b, .border-t {
            border: 1px solid #e5e7eb !important;
          }
          .bg-gray-50, .bg-red-50 {
            background: #f9fafb !important;
            print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
        }
      `}</style>
    </div>
  );
}