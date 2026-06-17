"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Clock, Plus, Trash2, Loader2, Menu, X, Stethoscope, Calendar } from "lucide-react";
import HelpDeskSidebar from "@/components/helpdesk/HelpDeskSidebar";

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  department: string;
}

interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ManageDoctorSlotsPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.doctorId as string;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    fetchDoctor();
    fetchAvailability();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`/api/doctors/${doctorId}`);
      const data = await res.json();
      if (data.success) {
        setDoctor(data.data);
      }
    } catch (error) {
      console.error("Error fetching doctor:", error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await fetch(`/api/doctors/${doctorId}/availability`);
      const data = await res.json();
      if (data.success) {
        setSlots(data.data);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = () => {
    setSlots([...slots, {
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
      duration: 30
    }]);
  };

  const updateSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/doctors/${doctorId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots })
      });
      
      if (res.ok) {
        router.push('/helpdesk/doctor-slots');
      }
    } catch (error) {
      console.error("Error saving slots:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleBillingClick = () => router.push('/helpdesk/billing');
  const handleRoomAvailabilityClick = () => console.log('Room Availability clicked');
  const handleDoctorSlotsClick = () => {};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#2BB2A7]" />
          <span className="text-gray-600 dark:text-gray-400">Loading doctor availability...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <HelpDeskSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onBillingClick={handleBillingClick}
        onRoomAvailabilityClick={handleRoomAvailabilityClick}
        onDoctorSlotsClick={handleDoctorSlotsClick}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-[#E2EFEA] dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20">
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">Manage Slots</h1>
        </header>

        <button
          className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {/* Header with back button */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Manage Availability Slots
                </h1>
                {doctor && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#2BB2A7]" />
                    Dr. {doctor.firstName} {doctor.lastName} • {doctor.specialty}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2.5 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto justify-center shadow-lg shadow-[#2BB2A7]/20"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Slots
            </button>
          </div>

          {/* Slots Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2EFEA] dark:border-gray-700 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2BB2A7]" />
                Weekly Schedule
              </h2>
              <button
                onClick={addSlot}
                className="px-3 py-2 bg-[#2BB2A7] text-white rounded-lg hover:bg-[#1F8F89] transition-colors flex items-center gap-2 text-sm shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Slot
              </button>
            </div>

            {slots.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#EAF7F4] dark:bg-[#1F8F89]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-[#2BB2A7]" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No slots configured. Click Add Slot to create availability.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {slots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-[#F4F9F7] dark:bg-gray-700/30 rounded-lg border border-[#E2EFEA] dark:border-gray-600"
                  >
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <select
                        value={slot.dayOfWeek}
                        onChange={(e) => updateSlot(index, 'dayOfWeek', parseInt(e.target.value))}
                        className="px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent text-sm w-full sm:w-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {DAYS.map((day, i) => (
                          <option key={i} value={i}>{day.slice(0,3)}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                          className="px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent text-sm w-28 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                          className="px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent text-sm w-28 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <select
                        value={slot.duration}
                        onChange={(e) => updateSlot(index, 'duration', parseInt(e.target.value))}
                        className="px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent text-sm w-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                      </select>
                    </div>

                    <button
                      onClick={() => removeSlot(index)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto"
                      title="Remove slot"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          {slots.length > 0 && (
            <div className="mt-4 p-4 bg-[#EAF7F4] dark:bg-[#1F8F89]/20 rounded-lg border border-[#2BB2A7]/30 dark:border-[#2BB2A7]/20">
              <p className="text-sm text-[#1F8F89] dark:text-[#2BB2A7] flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Total slots configured: <strong>{slots.length}</strong>
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}