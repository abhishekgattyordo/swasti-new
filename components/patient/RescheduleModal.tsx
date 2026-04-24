"use client";

import { useState, useEffect } from "react";
import { X} from "lucide-react";
import { doctorsApi } from "@/lib/api/doctors";
import { appointmentsApi } from "@/lib/api/appointments";
import toast from "react-hot-toast";

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor_id: string;
  doctor_name: string;
  // other fields not needed here
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onReschedule: () => void; // callback to refresh list
}

export default function RescheduleModal({ isOpen, onClose, appointment, onReschedule }: Props) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens with new appointment
  useEffect(() => {
    if (isOpen && appointment) {
      setSelectedDoctorId(appointment.doctor_id);
      setSelectedDate("");
      setSelectedTime("");
      setAvailableSlots([]);
      fetchDoctors();
    }
  }, [isOpen, appointment]);

  // Fetch doctors list
  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await doctorsApi.getDoctors();
      setDoctors(res.data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctorId || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const res = await doctorsApi.getSlots(Number(selectedDoctorId), selectedDate);
        const slots = res.slots || [];
        setAvailableSlots(slots);
        if (selectedTime && !slots.includes(selectedTime)) {
          setSelectedTime("");
        }
      } catch (error) {
        console.error("Error fetching slots:", error);
        toast.error("Failed to load available slots");
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!appointment) return;
  if (!selectedDoctorId || !selectedDate || !selectedTime) {
    toast.error("Please select doctor, date, and time");
    return;
  }

  setSubmitting(true);
  try {
    // Use snake_case keys expected by backend
    await appointmentsApi.updateAppointment(appointment.id, {
      doctor_id: Number(selectedDoctorId),
      appointment_date: selectedDate,
      appointment_time: selectedTime,
    });
    toast.success("Appointment rescheduled successfully");
    onReschedule();
    onClose();
  } catch (error) {
    console.error("Reschedule error:", error);
    toast.error("Failed to reschedule appointment");
  } finally {
    setSubmitting(false);
  }
};

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reschedule Appointment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Current Doctor:</span> {appointment.doctor_name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            <span className="font-semibold">Current:</span> {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Select Doctor</label>
            {loadingDoctors ? (
              <div className="text-center py-2 text-gray-500">Loading doctors...</div>
            ) : (
              <select
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  setSelectedDate("");
                  setSelectedTime("");
                  setAvailableSlots([]);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.firstName} {doc.lastName} - {doc.specialty}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">New Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
              required
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">New Time</label>
            {selectedDoctorId && selectedDate ? (
              loadingSlots ? (
                <div className="text-center py-2 text-gray-500">Loading slots...</div>
              ) : availableSlots.length > 0 ? (
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                  required
                >
                  <option value="">Select a time</option>
                  {availableSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-red-500">No available slots for this doctor and date</p>
              )
            ) : (
              <p className="text-sm text-gray-500">Select a doctor and date first</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedDoctorId || !selectedDate || !selectedTime}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Rescheduling..." : "Reschedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}