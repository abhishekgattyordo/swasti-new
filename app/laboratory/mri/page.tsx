"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, LABARATORY_FEATURES } from "@/lib/feature";
import Card from "@/components/laboratory/Card";

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

  const pendingOrders = orders.filter(o => o.status === "Ordered");
  const completedOrders = orders.filter(o => o.status === "Completed");

  const getStatusBadge = (status: string) => {
    const configs: Record<string, string> = {
      Ordered: "bg-amber-50 text-amber-700 border-amber-200",
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return configs[status] || configs.Ordered;
  };

  if (tenantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MRI orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">MRI Scan</h1>
            <p className="text-sm text-gray-500 mt-1">Manage MRI orders and reports</p>
            {tenant && <p className="text-xs text-gray-400 mt-1">Tenant: {tenant.name}</p>}
          </div>
          <button
            onClick={() => setShowOrderModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            + New MRI Order
          </button>
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pending Orders
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "completed"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Completed Reports
          </button>
        </div>
      </div>

      <div className="p-8">
        {activeTab === "pending" ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending MRI Orders</h2>
            {pendingOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No pending MRI orders</p>
              </Card>
            ) : (
              pendingOrders.map((order) => (
                <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.patient_name}</h3>
                        <span className="text-sm text-gray-500">ID: {order.patient_id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {order.order_id} • {order.visit_type} Visit • {order.order_date}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <p className="text-sm">
                          <span className="font-medium">Body Part:</span> {order.body_part}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">MRI Type:</span> {order.mri_type}
                        </p>
                      </div>
                      {order.with_contrast && (
                        <p className="text-sm text-blue-600 mt-1">✓ With Contrast</p>
                      )}
                      {order.doctor_name && (
                        <p className="text-sm text-gray-500 mt-1">Ordered by: Dr. {order.doctor_name}</p>
                      )}
                      {order.notes && (
                        <p className="text-sm text-gray-500 mt-1">Notes: {order.notes}</p>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <button
                        onClick={() => {
                          setSelectedOrderForResult(order);
                          setShowResultModal(true);
                        }}
                        className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Enter Report
                      </button>
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed MRI Reports</h2>
            {completedOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No completed MRI reports</p>
              </Card>
            ) : (
              completedOrders.map((order) => (
                <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.patient_name}</h3>
                        <span className="text-sm text-gray-500">ID: {order.patient_id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {order.order_id} • {order.visit_type} Visit • Completed: {order.completed_date}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <p className="text-sm">
                          <span className="font-medium">Body Part:</span> {order.body_part}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">MRI Type:</span> {order.mri_type}
                        </p>
                      </div>
                      {order.with_contrast && (
                        <p className="text-sm text-blue-600">With Contrast</p>
                      )}
                      {order.result && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700">Report:</p>
                          <p className="text-sm text-gray-600 mt-1">{order.result}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* New MRI Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">New MRI Order</h2>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedPatient(null);
                    setPatientList([]);
                    setPhoneSearch("");
                    setFormData({ body_part: "", mri_type: "", with_contrast: false, doctor_name: "", notes: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Patient Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Patient by Phone Number *
                  </label>
                  <div className="flex space-x-2">
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      maxLength={10}
                    />
                    <button
                      onClick={searchPatientByPhone}
                      disabled={isSearching || phoneSearch.length < 10}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                  </div>
                  {searchError && <p className="text-sm text-red-600 mt-1">{searchError}</p>}
                  
                  {showPatientDropdown && patientList.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {patientList.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => selectPatient(patient)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">ID: {patient.id}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPatient && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-900">✅ Patient Selected: {selectedPatient.name}</p>
                    <p className="text-sm text-green-700">ID: {selectedPatient.id}</p>
                  </div>
                )}

                {/* Visit Type */}
                {selectedPatient && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visit Type *</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input type="radio" value="OP" checked={selectedVisitType === "OP"} onChange={() => setSelectedVisitType("OP")} className="mr-2" />
                        OP Visit
                      </label>
                      <label className="flex items-center">
                        <input type="radio" value="IP" checked={selectedVisitType === "IP"} onChange={() => setSelectedVisitType("IP")} className="mr-2" />
                        IP Admission
                      </label>
                    </div>
                  </div>
                )}

                {/* MRI Details */}
                {selectedPatient && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Body Part *</label>
                      <select
                        value={formData.body_part}
                        onChange={(e) => setFormData({ ...formData, body_part: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select Body Part</option>
                        {bodyParts.map(part => (
                          <option key={part} value={part}>{part}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">MRI Type *</label>
                      <select
                        value={formData.mri_type}
                        onChange={(e) => setFormData({ ...formData, mri_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="with_contrast" className="ml-2 block text-sm text-gray-700">
                        With Contrast (Gadolinium)
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Referring Doctor</label>
                      <input
                        type="text"
                        placeholder="Doctor's name"
                        value={formData.doctor_name}
                        onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Notes</label>
                      <textarea
                        placeholder="Any clinical notes or specific concerns..."
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={!selectedPatient || !formData.body_part || !formData.mri_type}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">MRI Report</h2>
                <button onClick={() => setShowResultModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Patient: <span className="font-medium">{selectedOrderForResult.patient_name}</span></p>
                <p className="text-sm text-gray-600">Order ID: <span className="font-medium">{selectedOrderForResult.order_id}</span></p>
                <p className="text-sm text-gray-600">Body Part: <span className="font-medium">{selectedOrderForResult.body_part}</span></p>
                <p className="text-sm text-gray-600">MRI Type: <span className="font-medium">{selectedOrderForResult.mri_type}</span></p>
                {selectedOrderForResult.with_contrast && (
                  <p className="text-sm text-blue-600">With Contrast</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MRI Report / Findings *</label>
                <textarea
                  placeholder="Enter detailed MRI report, findings, observations..."
                  rows={8}
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowResultModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={completeOrder} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
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