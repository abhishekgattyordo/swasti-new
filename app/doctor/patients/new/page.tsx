"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, UserPlus, Calendar, Clock, Mic, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { quickAddApi } from "@/lib/api/quickAdd";
import EnhancedVoiceInput from "@/components/ui/EnhancedVoiceInput";
import VoiceAssistant from "@/components/doctor/VoiceAssistant";

export default function QuickAddPatientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedDate =
    searchParams.get("date") || new Date().toISOString().split("T")[0];
  const selectedTime =
    searchParams.get("time") ||
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);

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

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.id && user?.role === "doctor") {
          setDoctorId(user.id);
        } else {
          console.error("User is not a doctor or missing ID");
          toast.error("Invalid doctor information");
        }
      } catch {
        toast.error("Failed to load user info");
      }
    } else {
      console.log("No user found in localStorage");
      toast.error("Please log in");
      router.push("/login");
    }
    setLoadingDoctor(false);
  }, [router]);

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

  const handleVoiceInput = (fieldName: string, text: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: text }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
    toast.success(`${fieldName.replace('_', ' ')} filled: "${text}"`);
  };

  const handleVoiceAssistantData = (extractedData: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, ...extractedData }));
    toast.success("Voice data applied! Review and submit.");
  };

  const parseDateFromSpeech = (text: string): string | null => {
    const lowerText = text.toLowerCase().trim();
    
    const months: Record<string, number> = {
      'january': 1, 'jan': 1, 'jan.': 1,
      'february': 2, 'feb': 2, 'feb.': 2,
      'march': 3, 'mar': 3, 'mar.': 3,
      'april': 4, 'apr': 4, 'apr.': 4,
      'may': 5,
      'june': 6, 'jun': 6, 'jun.': 6,
      'july': 7, 'jul': 7, 'jul.': 7,
      'august': 8, 'aug': 8, 'aug.': 8,
      'september': 9, 'sep': 9, 'sept': 9, 'sep.': 9, 'sept.': 9,
      'october': 10, 'oct': 10, 'oct.': 10,
      'november': 11, 'nov': 11, 'nov.': 11,
      'december': 12, 'dec': 12, 'dec.': 12
    };
    
    const currentYear = new Date().getFullYear();
    const minYear = 1900;
    const maxYear = currentYear;
    
    const formatDate = (year: number, month: number, day: number): string | null => {
      if (year >= minYear && year <= maxYear && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const testDate = new Date(year, month - 1, day);
        if (testDate.getFullYear() === year && testDate.getMonth() === month - 1 && testDate.getDate() === day) {
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
      }
      return null;
    };
    
    const monthPattern = Object.keys(months).join('|');
    
    const pattern1 = new RegExp(`(${monthPattern})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s+(\\d{4}|\\d{2})`, 'i');
    let match = lowerText.match(pattern1);
    if (match) {
      const month = months[match[1].toLowerCase()];
      let day = parseInt(match[2]);
      let year = parseInt(match[3]);
      if (year < 100) year = 1900 + year;
      return formatDate(year, month, day);
    }
    
    const pattern2 = new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthPattern})\\s+(\\d{4}|\\d{2})`, 'i');
    match = lowerText.match(pattern2);
    if (match) {
      let day = parseInt(match[1]);
      const month = months[match[2].toLowerCase()];
      let year = parseInt(match[3]);
      if (year < 100) year = 1900 + year;
      return formatDate(year, month, day);
    }
    
    return null;
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

      if (response && response.appointment) {
        toast.success("Patient added and appointment booked");
        router.push("/doctor/schedule");
      } else {
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3B1E6F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!doctorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-600 dark:text-red-400">
          Doctor not authenticated. Please log in.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <UserPlus className="w-6 h-6 text-[#3B1E6F] dark:text-[#7A329F]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#3B1E6F] dark:text-white">
                Quick Add Patient
              </h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
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
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setVoiceMode(!voiceMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              voiceMode 
                ? "bg-emerald-500 text-white" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Mic className="w-4 h-4" />
            {voiceMode ? "Voice Mode ON" : "Voice Mode OFF"}
          </button>
          
          <VoiceAssistant 
            onExtractedData={handleVoiceAssistantData} 
            disabled={submitting}
          />
        </div>
      </div>

      {/* Voice Mode Info Banner */}
      {voiceMode && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-center gap-2">
          <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Voice mode is ON! Click the microphone icon next to any field and speak to fill it automatically.
          </p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="full_name_en"
                  value={formData.full_name_en}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A329F] focus:border-transparent pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.full_name_en ? "border-red-500 dark:border-red-500" : "border-gray-200 dark:border-gray-600"
                  }`}
                  placeholder="John Doe"
                />
                {voiceMode && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <EnhancedVoiceInput
                      onTranscript={(text) => handleVoiceInput("full_name_en", text)}
                      fieldName="full_name"
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>
              {errors.full_name_en && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.full_name_en}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A329F] focus:border-transparent pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.phone ? "border-red-500 dark:border-red-500" : "border-gray-200 dark:border-gray-600"
                  }`}
                  placeholder="9876543210"
                />
                {voiceMode && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <EnhancedVoiceInput
                      onTranscript={(text) => {
                        const digits = text.replace(/\D/g, '');
                        handleVoiceInput("phone", digits.slice(0, 10));
                      }}
                      fieldName="phone"
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>
              {errors.phone && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A329F] focus:border-transparent pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.email ? "border-red-500 dark:border-red-500" : "border-gray-200 dark:border-gray-600"
                  }`}
                  placeholder="john@example.com"
                />
                {voiceMode && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <EnhancedVoiceInput
                      onTranscript={(text) => {
                        const cleanEmail = text.replace(/\s/g, '');
                        handleVoiceInput("email", cleanEmail);
                      }}
                      fieldName="email"
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A329F] focus:border-transparent pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {voiceMode && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <EnhancedVoiceInput
                      onTranscript={(text) => {
                        const parsedDate = parseDateFromSpeech(text);
                        if (parsedDate) {
                          handleVoiceInput("dob", parsedDate);
                          toast.success(`Date set to: ${new Date(parsedDate).toLocaleDateString()}`);
                        } else {
                          toast.error("Try: 'May 15th 1990' or '15 May 1990'");
                        }
                      }}
                      fieldName="dob"
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>
              {formData.dob && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Selected: {new Date(formData.dob).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A329F] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Blood Group
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A329F] focus:border-transparent pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="O+"
                />
                {voiceMode && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <EnhancedVoiceInput
                      onTranscript={(text) => {
                        const match = text.toUpperCase().match(/(A|B|AB|O)[+-]/);
                        handleVoiceInput("blood_group", match ? match[0] : text.toUpperCase());
                      }}
                      fieldName="blood_group"
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Allergies
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A329F] focus:border-transparent pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Penicillin"
                />
                {voiceMode && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <EnhancedVoiceInput
                      onTranscript={(text) => handleVoiceInput("allergies", text)}
                      fieldName="allergies"
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Voice Tips */}
          {voiceMode && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
              <h4 className="text-xs font-semibold text-[#3B1E6F] dark:text-[#7A329F] mb-1 flex items-center gap-1">
                <Mic className="w-3 h-3" /> Voice Tips
              </h4>
              <p className="text-xs text-[#7A329F] dark:text-[#9B4DBF]">
                Click microphone → Speak naturally → Field auto-fills
              </p>
            </div>
          )}

          {/* Form actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-[#3B1E6F] to-[#7A329F] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-[#3B1E6F]/20"
            >
              {submitting ? "Saving..." : "Add Patient & Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}