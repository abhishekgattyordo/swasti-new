"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, LABARATORY_FEATURES } from "@/lib/feature";
import Card from "@/components/laboratory/Card";
import {
  Plus,
  Search,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  FileText,
  Calendar,
  Brain,
  Activity,
  Microscope,
  Printer,
  Download,
  Hospital,
  Pill,
} from "lucide-react";

interface MRIOrder {
  id: string;
  order_id: string;
  patient_id: string;
  patient_name: string;
  body_part: string;
  mri_type: string;
  with_contrast: boolean;
  visit_type: "OP" | "IP";
  visit_id: string;
  status: "Ordered" | "Completed" | "Cancelled";
  order_date: string;
  completed_date?: string;
  result?: string;
  doctor_name?: string;
  notes?: string;
}

export default function MRIPage() {
  const router = useRouter();
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();
  
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientList, setPatientList] = useState<any[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedVisitType, setSelectedVisitType] = useState<"OP" | "IP">("OP");
  const [orders, setOrders] = useState<MRIOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    body_part: "",
    mri_type: "",
    with_contrast: false,
    doctor_name: "",
    notes: "",
  });
  const [selectedOrderForResult, setSelectedOrderForResult] = useState<MRIOrder | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultText, setResultText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const mriTypes = [
    "Brain MRI",
    "Spine MRI",
    "Joint MRI",
    "Cardiac MRI",
    "Abdominal MRI",
    "Pelvic MRI",
    "Breast MRI",
    "MRA (Angiography)",
    "MRV (Venography)",
    "Other"
  ];

  const bodyParts = [
    "Brain",
    "Cervical Spine",
    "Thoracic Spine",
    "Lumbar Spine",
    "Shoulder",
    "Elbow",
    "Wrist",
    "Hand",
    "Hip",
    "Knee",
    "Ankle",
    "Foot",
    "Abdomen",
    "Pelvis",
    "Chest",
    "Other"
  ];

  useEffect(() => {
    fetchMRIOrders();
  }, []);

  const fetchMRIOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/laboratory/mri");
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Error fetching MRI orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchPatientByPhone = async () => {
    const cleanPhone = phoneSearch.replace(/\s/g, '').replace(/-/g, '');
    
    if (!cleanPhone || cleanPhone.length < 10) {
      setSearchError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const response = await fetch(`/api/registration?phone=${encodeURIComponent(cleanPhone)}`);
      
      if (!response.ok) {
        throw new Error("Patient not found");
      }

      const result = await response.json();
      
      if (result.success === true && result.data && Array.isArray(result.data) && result.data.length > 0) {
        const patients = result.data.map((patientData: any) => ({
          id: patientData.patient_id,
          name: patientData.full_name_en,
          phone: patientData.phone,
          registration_id: patientData.registration_id,
        }));
        
        setPatientList(patients);
        setShowPatientDropdown(true);
        setSearchError("");
        
        if (patients.length === 1) {
          setSelectedPatient(patients[0]);
          setShowPatientDropdown(false);
        }
      } else {
        setSearchError("No patient found with this phone number");
        setPatientList([]);
        setSelectedPatient(null);
        setShowPatientDropdown(false);
      }
    } catch (error) {
      console.error("Error searching patient:", error);
      setSearchError("Error searching patient. Please try again.");
      setPatientList([]);
      setSelectedPatient(null);
      setShowPatientDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientDropdown(false);
    setPhoneSearch(patient.phone);
  };

  const handleCreateOrder = async () => {
    if (!selectedPatient || !formData.body_part || !formData.mri_type) {
      alert("Please fill all required fields");
      return;
    }

    const orderId = `MRI-${Date.now()}`;
    const today = new Date().toISOString().split("T")[0];
    const visitId = selectedPatient.registration_id || `OP-${Date.now()}`;

    const orderData = {
      order_id: orderId,
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
      body_part: formData.body_part,
      mri_type: formData.mri_type,
      with_contrast: formData.with_contrast,
      visit_type: selectedVisitType,
      visit_id: visitId,
      status: "Ordered",
      order_date: today,
      doctor_name: formData.doctor_name,
      notes: formData.notes,
    };

    try {
      const response = await fetch("/api/laboratory/mri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      alert(`✅ MRI Order Created Successfully!\n\nOrder ID: ${orderId}\nPatient: ${selectedPatient.name}\nBody Part: ${formData.body_part}\nMRI Type: ${formData.mri_type}`);
      
      await fetchMRIOrders();
      
      setShowOrderModal(false);
      setSelectedPatient(null);
      setPatientList([]);
      setPhoneSearch("");
      setFormData({ body_part: "", mri_type: "", with_contrast: false, doctor_name: "", notes: "" });
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (confirm("Are you sure you want to cancel this MRI order?")) {
      try {
        const response = await fetch("/api/laboratory/mri", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: orderId, status: "Cancelled" }),
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error);
        }

        alert("✅ MRI order cancelled successfully");
        await fetchMRIOrders();
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Error cancelling order. Please try again.");
      }
    }
  };

  const completeOrder = async () => {
    if (!selectedOrderForResult) return;
    
    if (!resultText.trim()) {
      alert("Please enter the MRI report/result before completing");
      return;
    }

    try {
      const response = await fetch("/api/laboratory/mri", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrderForResult.id,
          status: "Completed",
          completed_date: new Date().toISOString().split("T")[0],
          result: resultText,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      alert("✅ MRI order completed successfully!");
      setShowResultModal(false);
      setSelectedOrderForResult(null);
      setResultText("");
      await fetchMRIOrders();
    } catch (error) {
      console.error("Error completing order:", error);
      alert("Error completing order. Please try again.");
    }
  };

  const downloadPDF = (order: MRIOrder) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MRI Report - ${order.order_id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2BB2A7;
            padding-bottom: 10px;
          }
          .hospital-name {
            font-size: 24px;
            font-weight: bold;
            color: #2BB2A7;
          }
          .report-title {
            font-size: 20px;
            font-weight: bold;
            margin-top: 10px;
            color: #1F8F89;
          }
          .patient-info {
            background-color: #f4f9f7;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
          }
          .info-row {
            display: flex;
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: bold;
            width: 150px;
          }
          .info-value {
            flex: 1;
          }
          .report-section {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2BB2A7;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital-name">${tenant?.name || 'Hospital'} Radiology Department</div>
          <div class="report-title">MRI Scan Report</div>
        </div>
        
        <div class="patient-info">
          <div class="info-row">
            <div class="info-label">Patient Name:</div>
            <div class="info-value">${order.patient_name}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Patient ID:</div>
            <div class="info-value">${order.patient_id}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Order ID:</div>
            <div class="info-value">${order.order_id}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Visit Type:</div>
            <div class="info-value">${order.visit_type} - ${order.visit_id}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Exam Date:</div>
            <div class="info-value">${order.order_date}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Report Date:</div>
            <div class="info-value">${order.completed_date || ''}</div>
          </div>
        </div>
        
        <div class="report-section">
          <div class="section-title">Exam Details</div>
          <div class="info-row">
            <div class="info-label">Body Part:</div>
            <div class="info-value">${order.body_part}</div>
          </div>
          <div class="info-row">
            <div class="info-label">MRI Type:</div>
            <div class="info-value">${order.mri_type}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Contrast:</div>
            <div class="info-value">${order.with_contrast ? 'Yes (Gadolinium)' : 'No'}</div>
          </div>
          ${order.doctor_name ? `
          <div class="info-row">
            <div class="info-label">Referring Doctor:</div>
            <div class="info-value">Dr. ${order.doctor_name}</div>
          </div>
          ` : ''}
        </div>
        
        <div class="report-section">
          <div class="section-title">Radiology Report</div>
          <div style="white-space: pre-wrap;">${order.result || 'No report available'}</div>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated report. No signature required.</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    const win = window.open();
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  const exportToCSV = () => {
    const completedOrders = orders.filter(o => o.status === "Completed");
    const headers = ["Order ID", "Patient Name", "Patient ID", "Body Part", "MRI Type", "With Contrast", "Visit Type", "Order Date", "Completed Date", "Referring Doctor"];
    const csvData = completedOrders.map(order => [
      order.order_id,
      order.patient_name,
      order.patient_id,
      order.body_part,
      order.mri_type,
      order.with_contrast ? "Yes" : "No",
      `${order.visit_type} - ${order.visit_id}`,
      order.order_date,
      order.completed_date || "-",
      order.doctor_name || "-"
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mri_reports_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingOrders = orders.filter(o => o.status === "Ordered");
  const completedOrders = orders.filter(o => o.status === "Completed");
  
  const filteredCompletedOrders = completedOrders.filter(order =>
    order.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      Ordered: { 
        bg: "bg-amber-50 dark:bg-amber-900/20", 
        text: "text-amber-700 dark:text-amber-300", 
        icon: <Clock className="w-3.5 h-3.5 inline mr-1" />
      },
      Completed: { 
        bg: "bg-[#EAF7F4] dark:bg-[#1F8F89]/20", 
        text: "text-[#1F8F89] dark:text-[#2BB2A7]", 
        icon: <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
      },
      Cancelled: { 
        bg: "bg-red-50 dark:bg-red-900/20", 
        text: "text-red-700 dark:text-red-300", 
        icon: <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
      },
    };
    return configs[status] || configs.Ordered;
  };

  if (tenantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2BB2A7] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2BB2A7] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading MRI orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-[#E2EFEA] dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MRI Scan</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage MRI orders and reports</p>
          </div>
          <button
            onClick={() => setShowOrderModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New MRI Order
          </button>
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-[#2BB2A7] text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending Orders ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "completed"
                ? "bg-[#2BB2A7] text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Completed Reports ({completedOrders.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "pending" ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending MRI Orders</h2>
            {pendingOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-12 text-center">
                <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No pending MRI orders</p>
              </div>
            ) : (
              pendingOrders.map((order) => {
                const statusConfig = getStatusBadge(order.status);
                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {order.patient_name}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {order.patient_id}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.icon}
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {order.order_id} • {order.visit_type} Visit • {order.order_date}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Body Part:</span>{' '}
                            <span className="text-gray-600 dark:text-gray-400">{order.body_part}</span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">MRI Type:</span>{' '}
                            <span className="text-gray-600 dark:text-gray-400">{order.mri_type}</span>
                          </p>
                        </div>
                        {order.with_contrast && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            With Contrast
                          </p>
                        )}
                        {order.doctor_name && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ordered by: Dr. {order.doctor_name}</p>
                        )}
                        {order.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Notes: {order.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <button
                          onClick={() => {
                            setSelectedOrderForResult(order);
                            setShowResultModal(true);
                          }}
                          className="px-4 py-2 bg-[#2BB2A7] text-white rounded-lg hover:bg-[#1F8F89] transition-colors text-sm"
                        >
                          Enter Report
                        </button>
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Completed MRI Reports</h2>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient, ID or order..."
                    className="pl-9 pr-4 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-[#2BB2A7] text-white rounded-lg hover:bg-[#1F8F89] transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
            
            {filteredCompletedOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No completed MRI reports found</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F4F9F7] dark:bg-gray-700/30 border-b border-[#E2EFEA] dark:border-gray-700">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">Order ID</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">Patient</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">Body Part</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">MRI Type</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">Contrast</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">Report Date</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2EFEA] dark:divide-gray-700">
                      {filteredCompletedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900 dark:text-white">
                            {order.order_id}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{order.patient_name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {order.patient_id}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {order.body_part}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {order.mri_type}
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            {order.with_contrast ? (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">Yes</span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            {order.completed_date}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => downloadPDF(order)}
                              className="px-3 py-1.5 bg-[#EAF7F4] text-[#1F8F89] hover:bg-[#2BB2A7] hover:text-white rounded-lg transition-colors text-xs font-medium flex items-center gap-1 mx-auto"
                            >
                              <Printer className="w-3 h-3" />
                              PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="px-4 py-3 bg-[#F4F9F7] dark:bg-gray-700/30 border-t border-[#E2EFEA] dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Reports: <span className="font-semibold text-gray-900 dark:text-white">{filteredCompletedOrders.length}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New MRI Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#E2EFEA] dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New MRI Order</h2>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedPatient(null);
                    setPatientList([]);
                    setPhoneSearch("");
                    setFormData({ body_part: "", mri_type: "", with_contrast: false, doctor_name: "", notes: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Patient by Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phoneSearch}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneSearch(value);
                        setSearchError("");
                        setSelectedPatient(null);
                        setShowPatientDropdown(false);
                      }}
                      className="flex-1 px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      maxLength={10}
                    />
                    <button
                      onClick={searchPatientByPhone}
                      disabled={isSearching || phoneSearch.length < 10}
                      className="px-4 py-2 bg-[#2BB2A7] text-white rounded-lg hover:bg-[#1F8F89] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                  </div>
                  {searchError && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{searchError}</p>}
                  
                  {showPatientDropdown && patientList.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-[#E2EFEA] dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {patientList.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => selectPatient(patient)}
                          className="w-full text-left px-4 py-3 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 border-b border-[#E2EFEA] dark:border-gray-700 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{patient.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {patient.id}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPatient && (
                  <div className="bg-[#EAF7F4] dark:bg-[#1F8F89]/20 border border-[#2BB2A7]/30 dark:border-[#2BB2A7]/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-[#1F8F89] dark:text-[#2BB2A7]">✅ Patient Selected: {selectedPatient.name}</p>
                    <p className="text-sm text-[#1F8F89] dark:text-[#2BB2A7]">ID: {selectedPatient.id}</p>
                  </div>
                )}

                {selectedPatient && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visit Type *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <input type="radio" value="OP" checked={selectedVisitType === "OP"} onChange={() => setSelectedVisitType("OP")} className="mr-2 accent-[#2BB2A7]" />
                        OP Visit
                      </label>
                      <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <input type="radio" value="IP" checked={selectedVisitType === "IP"} onChange={() => setSelectedVisitType("IP")} className="mr-2 accent-[#2BB2A7]" />
                        IP Admission
                      </label>
                    </div>
                  </div>
                )}

                {selectedPatient && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Body Part *</label>
                      <select
                        value={formData.body_part}
                        onChange={(e) => setFormData({ ...formData, body_part: e.target.value })}
                        className="w-full px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Body Part</option>
                        {bodyParts.map(part => (
                          <option key={part} value={part}>{part}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">MRI Type *</label>
                      <select
                        value={formData.mri_type}
                        onChange={(e) => setFormData({ ...formData, mri_type: e.target.value })}
                        className="w-full px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select MRI Type</option>
                        {mriTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="with_contrast"
                        checked={formData.with_contrast}
                        onChange={(e) => setFormData({ ...formData, with_contrast: e.target.checked })}
                        className="h-4 w-4 accent-[#2BB2A7] focus:ring-[#2BB2A7] border-gray-300 rounded"
                      />
                      <label htmlFor="with_contrast" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        With Contrast (Gadolinium)
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Referring Doctor</label>
                      <input
                        type="text"
                        placeholder="Doctor's name"
                        value={formData.doctor_name}
                        onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                        className="w-full px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Clinical Notes</label>
                      <textarea
                        placeholder="Any clinical notes or specific concerns..."
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={!selectedPatient || !formData.body_part || !formData.mri_type}
                  className="px-4 py-2 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create MRI Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enter Result Modal */}
      {showResultModal && selectedOrderForResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl border border-[#E2EFEA] dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">MRI Report</h2>
                <button onClick={() => setShowResultModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-[#F4F9F7] dark:bg-gray-700/50 rounded-lg border border-[#E2EFEA] dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-300">Patient: <span className="font-medium">{selectedOrderForResult.patient_name}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Order ID: <span className="font-medium">{selectedOrderForResult.order_id}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Body Part: <span className="font-medium">{selectedOrderForResult.body_part}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-300">MRI Type: <span className="font-medium">{selectedOrderForResult.mri_type}</span></p>
                {selectedOrderForResult.with_contrast && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">With Contrast</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">MRI Report / Findings *</label>
                <textarea
                  placeholder="Enter detailed MRI report, findings, observations..."
                  rows={8}
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowResultModal(false)} className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 transition-colors text-gray-700 dark:text-gray-300">
                  Cancel
                </button>
                <button onClick={completeOrder} className="px-4 py-2 bg-[#2BB2A7] text-white rounded-lg hover:bg-[#1F8F89] transition-colors">
                  Save Report & Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}