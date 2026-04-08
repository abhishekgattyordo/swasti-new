"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { User } from "lucide-react"; // 👈 added import
import { useDoctor } from "@/app/doctor/layout";
import { appointmentsApi } from "@/lib/api/appointments";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
  onSave: (appointment: any) => void;
  selectedDate: string;
  selectedTime: string;
  doctorId: number;
}

export default function NewAppointmentModal({
  onClose,
  onSave,
  selectedDate,
  selectedTime,
  doctorId,
}: Props) {
  const { patients } = useDoctor(); // expects patients array with { id, name, age, gender }
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [form, setForm] = useState({
    consultationType: "",
    notes: "",
  });

  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    return patients.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    try {
      const payload = {
        doctor_id: doctorId,
        patient_id: selectedPatient.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        consultation_type: form.consultationType,
        notes: form.notes,
      };
      const response = await appointmentsApi.createAppointment(payload);
      if (response.success) {
        // Transform to match Appointment type expected by parent
        const newAppt = {
          id: response.data.id,
          time: selectedTime,
          name: selectedPatient.name,
          age: selectedPatient.age,
          gender: selectedPatient.gender,
          reason: "",
          meta: `${selectedPatient.age} yrs • ${selectedPatient.gender}`,
          type: form.consultationType === "in-person" ? "In-Person" : "Video",
          status: "BOOKED",
          statusColor: "text-blue-600 bg-blue-100",
          action: "View",
          icon: <User className="w-3 h-3" />,
          meetingLink: form.consultationType === "video" ? "https://meet.jit.si/..." : undefined,
          patientId: selectedPatient.id,
        };
        onSave(newAppt);
        toast.success("Appointment booked");
        onClose();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
        <p className="text-sm text-gray-600 mb-4">
          {format(new Date(selectedDate), "PPP")} at {selectedTime}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient selector */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Patient</label>
            <input
              type="text"
              placeholder="Search patient by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
                setSelectedPatient(null);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full border rounded-lg p-2"
              required
            />
            {showDropdown && filteredPatients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {patient.name} ({patient.age} yrs, {patient.gender})
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Consultation Type</label>
            <select
              value={form.consultationType}
              onChange={(e) => setForm({ ...form, consultationType: e.target.value })}
              className="w-full border rounded-lg p-2"
            >
              <option value="in-person">In-Person</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg p-2"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}