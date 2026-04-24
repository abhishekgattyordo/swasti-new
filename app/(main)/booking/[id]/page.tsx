


"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/ui/Header";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

interface Doctor {
  id: number;
  firstName: string;
  name: string;
  lastName: string;
  image: string | null;
  fees: number;
  email: string;
  phone: string;
  specialty: string;
  languages: string[];
  reviews: number;
  availability: {
    morning: string[];
    afternoon: string[];
    evening: string[];
  };
  department: string;
  licenseNumber: string;
  dateOfBirth: string;
  education: number;
  dateJoined: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  qualifications: string[];
  experience: number;
  bio: string;
  status: string;
  rating: number;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  isOnline: boolean;
  isVerified: boolean;
}

interface BookingDoctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: number;
  image: string | null;
  fees: number;
  education: string[];
  languages: string[];
  availability: {
    morning: any[];
    afternoon: any[];
    evening: any[];
  };
  isOnline: boolean;
  isVerified: boolean;
}

interface AppointmentData {
  consultationType: "in-person" | "teleconsultation";
  selectedDate: string;
  selectedTime: string;
  notes: string;
  paymentMethod: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasSlots: boolean;
  isPast?: boolean;
  isSelected?: boolean;
}

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  X,
} from "lucide-react";
import { doctorsApi } from "@/lib/api/doctors";

const LoadingSpinner = () => (
  <div className="min-h-screen bg-background-light dark:bg-background-dark">
    <Header />
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">
          Loading doctor details...
        </p>
      </div>
    </div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-background-light dark:bg-background-dark">
    <Header />
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center p-8">
        <div className="mb-4 flex justify-center">
          <svg
            className="w-16 h-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Doctor Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>
        <Link
          href="/doctor-selection"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white hover:bg-green-600 transition"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Doctors
        </Link>
      </div>
    </div>
  </div>
);

const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      fullDate: date.toISOString().split("T")[0],
    });
  }
  return dates;
};

function BookingPageContent() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<BookingDoctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    consultationType: "in-person",
    selectedDate: new Date().toISOString().split("T")[0],
    selectedTime: "",
    notes: "",
    paymentMethod: "card",
  });

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const dates = generateDates();
  const currentMonthName = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const loadDoctorData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await doctorsApi.getDoctor(Number(doctorId));
        const doc = response.data.data || response.data;
        const doctorData: BookingDoctor = {
          id: doc.id.toString(),
          name: `Dr. ${doc.firstName} ${doc.lastName}`,
          specialty: doc.specialty || "General",
          rating: doc.rating || 4.5,
          reviews: 0,
          experience: doc.experience || 0,
          image: doc.avatar
            ? `http://localhost:3000/${doc.avatar}`
            : null,
          fees: doc.fee ? Number(doc.fee) : 500,
          education: doc.qualifications || [],
          languages: [],
          availability: { morning: [], afternoon: [], evening: [] },
          isOnline: true,
          isVerified: true,
        };
        setDoctor(doctorData);
      } catch (err) {
        console.error("Error loading doctor data:", err);
        setError("Failed to load doctor data");
      } finally {
        setIsLoading(false);
      }
    };
    if (doctorId) loadDoctorData();
  }, [doctorId]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor || !appointmentData.selectedDate) return;
      setLoadingSlots(true);
      try {
        const res = await fetch(
          `/api/doctors-appoitment/${doctorId}/slots?date=${appointmentData.selectedDate}`,
        );
        if (!res.ok) {
          setAvailableSlots([]);
          return;
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.slots)) {
          setAvailableSlots(data.slots);
          if (data.slots.length > 0) {
            if (
              !appointmentData.selectedTime ||
              !data.slots.includes(appointmentData.selectedTime)
            ) {
              setAppointmentData((prev) => ({
                ...prev,
                selectedTime: data.slots[0],
              }));
            }
          } else {
            setAppointmentData((prev) => ({ ...prev, selectedTime: "" }));
          }
        } else {
          setAvailableSlots([]);
          setAppointmentData((prev) => ({ ...prev, selectedTime: "" }));
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
  }, [doctor, appointmentData.selectedDate, doctorId]);

  useEffect(() => {
    if (!doctor) return;
    const generateCalendar = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const firstDayIndex = firstDay.getDay();
      const prevMonthLastDay = new Date(year, month, 0).getDate();

      const days: CalendarDay[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const dayNumber = prevMonthLastDay - i;
        const date = new Date(year, month - 1, dayNumber);
        days.push({
          date,
          isCurrentMonth: false,
          hasSlots: false,
          isPast: date < today,
          isSelected: false,
        });
      }

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const isPast = date < today;
        const isSelected =
          appointmentData.selectedDate === date.toISOString().split("T")[0];
        days.push({
          date,
          isCurrentMonth: true,
          hasSlots: !isPast,
          isPast,
          isSelected,
        });
      }

      const totalCells = 42;
      const remaining = totalCells - days.length;
      for (let i = 1; i <= remaining; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          date,
          isCurrentMonth: false,
          hasSlots: false,
          isPast: date < today,
          isSelected: false,
        });
      }

      setCalendarDays(days);
    };
    generateCalendar();
  }, [currentMonth, doctor, appointmentData.selectedDate]);

  const updateAppointmentData = <K extends keyof AppointmentData>(
    key: K,
    value: AppointmentData[K],
  ) => {
    setAppointmentData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateSelect = (fullDate: string) => {
    updateAppointmentData("selectedDate", fullDate);
    setShowFullCalendar(false);
  };

  const handleTimeSelect = (time: string) => {
    updateAppointmentData("selectedTime", time);
  };

  const formatDateDisplay = () => {
    const date = new Date(appointmentData.selectedDate);
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${day} ${month}, ${year} | ${appointmentData.selectedTime}`;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleConfirmAppointment = async () => {
    console.log("Confirming appointment...");
    if (!doctor) return;

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.id) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    setIsBooking(true);
    try {
      const appointmentPayload = {
        doctor_id: doctor.id,
        patient_id: user.patient_id,
        appointment_date: appointmentData.selectedDate,
        appointment_time: appointmentData.selectedTime,
        consultation_type: appointmentData.consultationType,
        notes: appointmentData.notes || "",
      };

      const res = await fetch("/api/appointments/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to book appointment");
      }

      const appointmentSummary = {
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        doctorImage: doctor.image,
        consultationType: appointmentData.consultationType,
        date: appointmentData.selectedDate,
        time: appointmentData.selectedTime,
        notes: appointmentData.notes || "",
        fees: doctor.fees,
        patientName: user.name || "Patient",
        bookingId: data.data?.id || `APT-${Date.now()}`,
        bookedOn: new Date().toISOString(),
      };

      localStorage.setItem(
        "appointmentSummary",
        JSON.stringify(appointmentSummary),
      );
      router.push(`/booking/confirmation/${doctor.id}`);
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to book appointment",
      );
    } finally {
      setIsBooking(false);
      setShowConfirm(false);
    }
  };

  if (isLoading && !doctor) return <LoadingSpinner />;
  if (error || !doctor)
    return <ErrorDisplay message={error || "Doctor not found"} />;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <div className="flex flex-col">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-green-50 dark:hover:bg-slate-700 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-green-600" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Book Appointment
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-1 ml-10">
              Schedule your consultation with {doctor.name}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              {/* Doctor Card */}
              <div className="bg-white border-l-4 border-green-500 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 relative rounded-full overflow-hidden border-4 border-white shadow-sm">
                      <Image
                        src={doctor.image ?? "/default-doctor.jpg"}
                        alt={doctor.name}
                        width={80}
                        height={80}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {doctor.name}
                      </h3>
                      <div className="text-[15px] text-green-600 font-medium uppercase tracking-wide">
                        {doctor.specialty}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[15px]">
                        <svg
                          className="w-4 h-4 text-green-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14l9-5-9-5-9 5 9 5z"
                          />
                        </svg>
                        <span className="text-slate-700">
                          {doctor.specialty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[15px]">
                        <svg
                          className="w-4 h-4 text-green-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01"
                          />
                        </svg>
                        <span className="text-slate-700">
                          {doctor.experience} years experience
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-slate-900">
                          {doctor.rating}
                        </span>
                        <span className="text-sm text-slate-500">
                          ({doctor.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[15px] text-slate-600 font-medium">
                        View complete profile
                      </span>
                      <button
                        onClick={() => router.push(`/doctor/${doctor.id}`)}
                        className="inline-flex items-center gap-2 text-green-500 hover:text-green-600"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation Type Selector */}
              <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 md:mb-4">
                  Consultation Type
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-700/50 flex-1">
                    <input
                      type="radio"
                      name="consultationType"
                      value="in-person"
                      checked={appointmentData.consultationType === "in-person"}
                      onChange={() => updateAppointmentData("consultationType", "in-person")}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">In-Person</p>
                      <p className="text-xs text-slate-500">Visit the clinic/hospital</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-700/50 flex-1">
                    <input
                      type="radio"
                      name="consultationType"
                      value="teleconsultation"
                      checked={appointmentData.consultationType === "teleconsultation"}
                      onChange={() => updateAppointmentData("consultationType", "teleconsultation")}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Teleconsultation</p>
                      <p className="text-xs text-slate-500">Video call from anywhere</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Appointment Notes */}
              <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 md:mb-4">
                  Appointment Notes (Optional)
                </h3>
                <textarea
                  placeholder="Add any symptoms, concerns, or questions for the doctor..."
                  className="w-full h-28 md:h-32 p-3 md:p-4 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                  value={appointmentData.notes}
                  onChange={(e) =>
                    updateAppointmentData("notes", e.target.value)
                  }
                />
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2">
                  This helps the doctor prepare for your consultation
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Choose date and time
                  </h3>
                  <button
                    onClick={() => setShowFullCalendar(!showFullCalendar)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors cursor-pointer select-none"
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      {showFullCalendar
                        ? currentMonth.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : currentMonthName}
                    </span>
                  </button>
                </div>

                {showFullCalendar && (
                  <div className="mb-6 border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => navigateMonth("prev")}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">
                        {currentMonth.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        onClick={() => navigateMonth("next")}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="w-full">
                      <div className="grid grid-cols-7 mb-3">
                        {weekdays.map((day) => (
                          <div
                            key={day}
                            className={`text-center text-xs font-medium uppercase py-1 ${
                              day === "Sat" || day === "Sun"
                                ? "text-red-400"
                                : "text-slate-400"
                            }`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-y-1">
                        {calendarDays.map((calendarDay, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              if (
                                calendarDay.isCurrentMonth &&
                                calendarDay.hasSlots
                              ) {
                                handleDateSelect(
                                  calendarDay.date.toISOString().split("T")[0],
                                );
                              }
                            }}
                            className={`h-10 w-full flex items-center justify-center text-sm transition-colors relative ${
                              !calendarDay.isCurrentMonth
                                ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                : !calendarDay.hasSlots
                                  ? "text-slate-300 dark:text-slate-600 line-through decoration-slate-400 cursor-not-allowed"
                                  : calendarDay.isSelected
                                    ? "bg-green-500 text-white font-semibold"
                                    : "text-slate-700 dark:text-slate-300 hover:bg-green-500/10 hover:text-green-500"
                            }`}
                            disabled={
                              !calendarDay.hasSlots ||
                              !calendarDay.isCurrentMonth
                            }
                          >
                            {calendarDay.date.getDate()}
                            {calendarDay.isSelected && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-slate-800">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!showFullCalendar && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Select Date
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-4">
                      {dates.map((item) => (
                        <button
                          key={item.fullDate}
                          onClick={() => handleDateSelect(item.fullDate)}
                          className={`min-w-[70px] py-3 text-center border transition-all duration-200 flex flex-col items-center relative rounded-lg ${
                            appointmentData.selectedDate === item.fullDate
                              ? "bg-green-500 text-white border-green-500 shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-green-200"
                          }`}
                        >
                          {appointmentData.selectedDate === item.fullDate && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800 mt-2">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                          <div className="text-xs font-medium">{item.day}</div>
                          <div className="text-lg font-semibold mt-1">
                            {item.date}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Select Time
                  </h4>
                  {loadingSlots ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-green-500 border-t-transparent animate-spin rounded-full mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">
                        Loading available slots...
                      </p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`px-4 py-2.5 text-sm border transition-all duration-200 flex items-center justify-center rounded-lg relative ${
                            appointmentData.selectedTime === time
                              ? "border-green-500 bg-green-50 text-green-600 font-medium shadow-sm"
                              : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-green-200"
                          }`}
                        >
                          {time}
                          {appointmentData.selectedTime === time && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No slots available for this date
                    </p>
                  )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-green-50 px-5 py-4 border border-green-100 rounded-lg">
                  <div className="mb-3 sm:mb-0">
                    <p className="text-sm font-medium text-slate-800">
                      {appointmentData.selectedTime
                        ? formatDateDisplay()
                        : "Select a date and time"}
                    </p>
                    {appointmentData.selectedTime && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Time slot confirmed
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isBooking || !appointmentData.selectedTime}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg transition flex items-center gap-2 min-w-[140px] justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isBooking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                        Booking...
                      </>
                    ) : (
                      "Book Appointment"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Confirm Your Appointment</h2>
              <button
                onClick={() => setShowConfirm(false)}
                className="ml-auto p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-[80px] text-sm font-medium text-gray-500 dark:text-gray-400">Doctor</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{doctor.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="min-w-[80px] text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(appointmentData.selectedDate).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {(() => {
                        const [hours, minutes] = appointmentData.selectedTime.split(':').map(Number);
                        const period = hours >= 12 ? 'PM' : 'AM';
                        const hour12 = hours % 12 || 12;
                        return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="min-w-[80px] text-sm font-medium text-gray-500 dark:text-gray-400">Consultation</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white capitalize">{appointmentData.consultationType}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="min-w-[80px] text-sm font-medium text-gray-500 dark:text-gray-400">Fee</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">₹{doctor.fees}</p>
                  </div>
                </div>
                {appointmentData.notes && (
                  <div className="flex items-start gap-3">
                    <div className="min-w-[80px] text-sm font-medium text-gray-500 dark:text-gray-400">Notes</div>
                    <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">{appointmentData.notes}</div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAppointment}
                  disabled={isBooking}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isBooking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm & Book
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BookingPageContent />
    </Suspense>
  );
}