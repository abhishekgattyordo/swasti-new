"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, UserPlus, Calendar, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { quickAddApi } from "@/lib/api/quickAdd";

export default function QuickAddPatientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get date and time from query params
  const selectedDate =
    searchParams.get("date") || new Date().toISOString().split("T")[0];
  const selectedTime =
    searchParams.get("time") ||
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  const [formData, setFormData] = useState({
    full_name_en: "",
    phone: "",
    email: "",
    dob: "",
    gender: "",
    blood_group: "",
    allergies: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load doctor ID from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        // Assuming the logged-in user is a doctor and has an 'id' field
        if (user?.id && user?.role === "doctor") {
          setDoctorId(user.id);
        } else {
          console.error("User is not a doctor or missing ID");
          toast.error("Invalid doctor information");
        }
      } catch  {
        toast.error("Failed to load user info");
      }
    } else {
      console.log("No user found in localStorage");
      toast.error("Please log in");
      router.push("/login");
    }
    setLoadingDoctor(false);
  }, [router]);

  // Redirect if no date/time
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      toast.error("Missing appointment date or time");
      router.push("/doctor/patients");
    }
  }, [selectedDate, selectedTime, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name_en.trim())
      newErrors.full_name_en = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email";
    return newErrors;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  if (!doctorId) {
    toast.error("Doctor information missing");
    return;
  }

  setSubmitting(true);
  try {
    const payload = {
      ...formData,
      added_by_doctor_id: doctorId,
      doctor_id: doctorId,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      consultation_type: "in-person",
      notes: "Quick add from schedule",
    };

    const response = await quickAddApi.createPatientAndAppointment(payload);
    console.log("Quick add response:", response);

    // Check if the response contains an appointment (indicates success)
    if (response && response.appointment) {
      toast.success("Patient added and appointment booked");
      router.push("/doctor/schedule"); // adjust redirect if needed
    } else {
      // If response has a message or error field, show it
      toast.error(response?.message || response?.error || "Something went wrong");
    }
  } catch (error) {
    console.error("Quick add error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to book");
  } finally {
    setSubmitting(false);
  }
};

  if (loadingDoctor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!doctorId) {
    return (
      <div className="text-center text-red-600">
        Doctor not authenticated. Please log in.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-100">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Quick Add Patient
            </h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {selectedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {selectedTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name_en"
                value={formData.full_name_en}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.full_name_en ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="John Doe"
              />
              {errors.full_name_en && (
                <p className="text-xs text-red-600">{errors.full_name_en}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.phone ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="+1 234 567 890"
              />
              {errors.phone && (
                <p className="text-xs text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.email ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Blood Group
              </label>
              <input
                type="text"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g., O+"
              />
            </div>

            {/* Allergies */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Allergies
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g., Penicillin"
              />
            </div>
          </div>

          {/* Form actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Add Patient & Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
