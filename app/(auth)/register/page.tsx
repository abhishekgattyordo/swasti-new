"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// TypeScript interfaces
interface FormData {
  // Step 1
  fullNameEn: string;
  fullNameHi: string;
  dob: string;
  gender: string;
  address: string;
  city: string;               // new
  state: string;
  country: string;            // new
  pincode: string;
  phone: string;              // new
  email: string;              // new
  blood_group: string;        // new

  // Step 2
  allergies: string[];
  chronicConditions: string[];
  medications: string;

  // Step 3
  insuranceProvider: string;
  policyNumber: string;
  validUntil: string;
  groupId: string;
  
  // Store patientId between steps
  patientId?: string;
}

interface ValidationErrors {
  [key: string]: string[];
}

interface RegistrationCompletionState {
  patientEmail: string;
  patientName: string;
  setupEmailSent: boolean;
  message: string;
}

interface Step {
  number: number;
  title: string;
  subtitle: string;
  progress: number;
}

interface IconProps {
  name: string;
  className?: string;
}

// Icon component with proper typing
const Icon: React.FC<IconProps> = ({ name, className }) => {
  const icons: Record<string, string> = {
    health_and_safety: "🏥",
    medical_services: "⚕️",
    person: "👤",
    translate: "🌐",
    fingerprint: "🖐️",
    cloud_upload: "📤",
    add_circle: "➕",
    cloud_done: "☁️",
    verified_user: "🔒",
    local_hospital: "🏨",
    badge: "🪪",
    check: "✓",
    add: "+",
    arrow_forward: "→",
    arrow_back: "←",
    sync: "🔄",
    wifi_off: "📴",
    cloud_off: "☁️❌",
    lock: "🔐",
    check_circle: "✅",
    info: "ℹ️",
    keyboard_arrow_down: "⌄",
    arrow_backward: "←",
    wifi: "📶",
    cloud: "☁️",
    fingerprint_alt: "🖐️",
    id_card: "🪪",
    phone: "📞",
    email: "✉️",
    bloodtype: "🩸",
    location_city: "🏙️",
    public: "🌍",
  };

  return <span className={className}>{icons[name] || "•"}</span>;
};

export default function RegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [registrationComplete, setRegistrationComplete] = useState<RegistrationCompletionState | null>(null);

  // Initial form data with new fields
  const [formData, setFormData] = useState<FormData>({
    // Step 1
    fullNameEn: "",
    fullNameHi: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    country: "India",          // default
    pincode: "",
    phone: "",
    email: "",
    blood_group: "",

    // Step 2
    allergies: [],
    chronicConditions: [],
    medications: "",

    // Step 3
    insuranceProvider: "",
    policyNumber: "",
    validUntil: "",
    groupId: "",
  });

  // Steps configuration
  const steps: Step[] = [
    {
      number: 1,
      title: "Personal Details",
      subtitle: "Next: Medical History",
      progress: 33,
    },
    {
      number: 2,
      title: "Medical History",
      subtitle: "Next: Insurance",
      progress: 66,
    },
    {
      number: 3,
      title: "Insurance",
      subtitle: "Final Step",
      progress: 100,
    },
  ];

  // Constants for dropdowns
  const states = ["Delhi", "Maharashtra", "Karnataka", "Uttar Pradesh", "Tamil Nadu", "Gujarat", "West Bengal", "Telangana"];
  const countries = ["India", "Other"]; // for simplicity, but can be expanded
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
  const allergies = [
    "Dust",
    "Pollen",
    "Peanuts",
    "Penicillin",
    "Shellfish",
    "Latex",
  ];
  const chronicConditions = [
    "Diabetes Type 2",
    "Hypertension",
    "Asthma",
    "Thyroid Disorder",
  ];
  const insuranceProviders = [
    "LIC of India",
    "HDFC Ergo",
    "ICICI Lombard",
    "Star Health",
    "Other / Private",
  ];
  const genderOptions = ["Male", "Female", "Other"];

  // Clear validation errors for a field when user starts typing
  const clearFieldError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // API Handlers
  const handleStep1Submit = async (): Promise<boolean> => {
    setValidationErrors({});
    
    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 1,
          fullNameEn: formData.fullNameEn,
          fullNameHi: formData.fullNameHi || null,
          dob: formData.dob,
          gender: formData.gender.toLowerCase(),
          address: formData.address,
          city: formData.city || null,
          state: formData.state,
          country: formData.country || 'India',
          pincode: formData.pincode,
          phone: formData.phone,
          email: formData.email,
          blood_group: formData.blood_group || null,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({ ...prev, patientId: data.data.patient_id }));
        setError(null);
        return true;
      } else {
        if (data.errors) {
          setValidationErrors(data.errors);
          const firstError = (Object.values(data.errors)[0] as string[])?.[0];
          setError(firstError || "Please check the form for errors");
        } else {
          setError(data.message || "Step 1 failed");
        }
        return false;
      }
    } catch (err) {
      setError("Network error. Please try again.");
      return false;
    }
  };

  const handleStep2Submit = async (): Promise<boolean> => {
    setValidationErrors({});
    
    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 2,
          patientId: formData.patientId,
          allergies: formData.allergies,
          chronicConditions: formData.chronicConditions,
          medications: formData.medications,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setError(null);
        return true;
      } else {
        if (data.errors) {
          setValidationErrors(data.errors);
          const firstError = (Object.values(data.errors)[0] as string[])?.[0];
          setError(firstError || "Please check the form for errors");
        } else {
          setError(data.message || "Step 2 failed");
        }
        return false;
      }
    } catch (err) {
      setError("Network error. Please try again.");
      return false;
    }
  };

  const handleStep3Submit = async (): Promise<boolean> => {
    setIsSubmitting(true);
    setValidationErrors({});
    
    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 3,
          patientId: formData.patientId,
          insuranceProvider: formData.insuranceProvider || null,
          policyNumber: formData.policyNumber || null,
          validUntil: formData.validUntil || null,
          groupId: formData.groupId || null,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setError(null);
        setRegistrationComplete({
          patientEmail: data?.data?.email || formData.email,
          patientName: data?.data?.full_name_en || formData.fullNameEn,
          setupEmailSent: Boolean(data?.data?.setupEmailSent),
          message: data.message || "Registration completed successfully.",
        });
        return true;
      } else {
        if (data.errors) {
          setValidationErrors(data.errors);
          const firstError = (Object.values(data.errors)[0] as string[])?.[0];
          setError(firstError || "Registration failed");
        } else {
          setError(data.message || "Registration failed");
        }
        return false;
      }
    } catch (err) {
      setError("Network error. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setError(null);
    setValidationErrors({});
    
    // Basic client-side validation
    if (currentStep === 1) {
      if (!formData.fullNameEn || !formData.dob || !formData.gender || !formData.address || !formData.pincode || !formData.state || !formData.phone || !formData.email) {
        setError("Please fill all required fields");
        return;
      }
      if (formData.pincode.length !== 6) {
        setError("Pincode must be 6 digits");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }
      if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) {
        setError("Please enter a valid phone number (10-15 digits, optional +)");
        return;
      }
    }
    
    // Submit current step
    let success = false;
    if (currentStep === 1) {
      success = await handleStep1Submit();
    } else if (currentStep === 2) {
      success = await handleStep2Submit();
    } else if (currentStep === 3) {
      success = await handleStep3Submit();
    }
    
    // Move to next step if successful
    if (success && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
    setError(null);
    setValidationErrors({});
  };

  const toggleAllergy = (allergy: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
    clearFieldError('allergies');
  };

  const toggleCondition = (condition: string) => {
    setFormData((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter((c) => c !== condition)
        : [...prev.chronicConditions, condition],
    }));
    clearFieldError('chronicConditions');
  };

  const toggleLanguage = () => {
    setLanguage((lang) => (lang === "en" ? "hi" : "hi"));
  };

  const toggleOnlineStatus = () => {
    setIsOnline((prev) => !prev);
  };

  // Update form data handler with error clearing
  const updateFormData = <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    clearFieldError(key);
  };

  // Current step progress
  const currentProgress = steps[currentStep - 1]?.progress || 33;

  // Helper to get field error
  const getFieldError = (field: string): string | null => {
    return validationErrors[field]?.[0] || null;
  };

  // Render step content based on current step
  const renderStepContent = () => {
    if (registrationComplete) {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-900/20">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
              <Icon name="check_circle" className="text-lg" />
              <h2 className="text-lg font-bold">Registration Completed</h2>
            </div>
            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
              {registrationComplete.message}
            </p>
          </div>

          <div className="rounded-xl border border-[#cfdbe7] bg-white p-5 dark:border-gray-700 dark:bg-[#1a2632]">
            <h3 className="text-base font-bold text-[#0d141b] dark:text-white">Email Delivery</h3>
            <p className="mt-2 text-sm text-[#4c739a] dark:text-gray-300">
              Recipient: <span className="font-semibold">{registrationComplete.patientEmail}</span>
            </p>
            <p className="mt-1 text-sm text-[#4c739a] dark:text-gray-300">
              Patient: <span className="font-semibold">{registrationComplete.patientName}</span>
            </p>
            <div
              className={cn(
                "mt-4 rounded-lg border px-4 py-3 text-sm",
                registrationComplete.setupEmailSent
                  ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                  : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
              )}
            >
              {registrationComplete.setupEmailSent
                ? "Verification email sent successfully. Ask the patient to open the mail and set password using the secure link."
                : "Registration completed but email could not be sent. Please retry or contact support."}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => router.push("/login")}
              className="h-11 rounded-lg bg-primary px-6 text-sm font-bold text-white hover:bg-primary-dark"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Registration Banner */}
            <div className="@container">
              <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-[#cfdbe7] dark:border-gray-600 bg-blue-50/50 dark:bg-blue-900/10 p-5 @[480px]:flex-row @[480px]:items-center">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      name="fingerprint"
                      className="text-primary text-[20px]"
                    />
                    <p className="text-[#0d141b] dark:text-white text-base font-bold leading-tight">
                      Quick Registration
                    </p>
                  </div>
                  <p className="text-[#4c739a] dark:text-gray-300 text-sm font-normal leading-normal">
                    Fill your details to create your health profile.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <h1 className="text-[#0d141b] dark:text-white text-2xl font-bold leading-tight">
              Personal Information
            </h1>
            <p className="text-[#4c739a] dark:text-gray-400 text-sm">
              Please provide your details as per your official ID documents.
            </p>

            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#0d141b] dark:text-gray-200 text-sm font-medium leading-normal flex justify-between">
                    <span>Full Name (English) <span className="text-red-500">*</span></span>
                    <span className="text-xs text-gray-500 font-normal">
                      As on ID card
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      className={cn(
                        "w-full h-11 rounded-lg border bg-slate-50 dark:bg-gray-800 px-4 py-2 text-[#0d141b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400",
                        getFieldError('fullNameEn') 
                          ? "border-red-500 dark:border-red-500" 
                          : "border-[#cfdbe7] dark:border-gray-600"
                      )}
                      placeholder="e.g. Rajesh Kumar"
                      type="text"
                      value={formData.fullNameEn}
                      onChange={(e) =>
                        updateFormData("fullNameEn", e.target.value)
                      }
                      required
                    />
                    <Icon
                      name="person"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]"
                    />
                  </div>
                  {getFieldError('fullNameEn') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('fullNameEn')}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#0d141b] dark:text-gray-200 text-sm font-medium leading-normal">
                    पूरा नाम (हिंदी)
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-11 rounded-lg border border-[#cfdbe7] dark:border-gray-600 bg-slate-50 dark:bg-gray-800 px-4 py-2 text-[#0d141b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                      placeholder="उदा. राजेश कुमार"
                      type="text"
                      value={formData.fullNameHi}
                      onChange={(e) =>
                        updateFormData("fullNameHi", e.target.value)
                      }
                    />
                    <Icon
                      name="translate"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]"
                    />
                  </div>
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#0d141b] dark:text-gray-200 text-sm font-medium leading-normal">
                    Date of Birth / जन्म तिथि <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={cn(
                      "w-full h-11 rounded-lg border bg-slate-50 dark:bg-gray-800 px-4 py-2 text-[#0d141b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                      getFieldError('dob') 
                        ? "border-red-500 dark:border-red-500" 
                        : "border-[#cfdbe7] dark:border-gray-600"
                    )}
                    type="date"
                    value={formData.dob}
                    onChange={(e) => updateFormData("dob", e.target.value)}
                    required
                  />
                  {getFieldError('dob') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('dob')}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#0d141b] dark:text-gray-200 text-sm font-medium leading-normal">
                    Gender / लिंग <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {genderOptions.map((gender) => (
                      <label key={gender} className="cursor-pointer">
                        <input
                          className="peer sr-only"
                          name="gender"
                          type="radio"
                          checked={formData.gender === gender}
                          onChange={() => updateFormData("gender", gender)}
                          required
                        />
                        <div
                          className={cn(
                            "h-11 flex items-center justify-center rounded-lg border bg-slate-50 dark:bg-gray-800 text-[#0d141b] dark:text-gray-300 text-sm font-medium transition-all",
                            formData.gender === gender
                              ? "border-primary bg-blue-50 dark:bg-blue-900/30 text-primary"
                              : "border-[#cfdbe7] dark:border-gray-600",
                            getFieldError('gender') && "border-red-500"
                          )}
                        >
                          {gender}
                        </div>
                      </label>
                    ))}
                  </div>
                  {getFieldError('gender') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('gender')}</p>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="flex flex-col gap-4 pt-2">
                <label className="text-[#0d141b] dark:text-gray-200 text-sm font-bold leading-normal uppercase tracking-wider text-xs text-gray-500">
                  Address Details
                </label>
                <div className="flex flex-col gap-2">
                  <label className="text-[#0d141b] dark:text-gray-200 text-sm font-medium leading-normal">
                    Residential Address / पता <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className={cn(
                      "w-full rounded-lg border bg-slate-50 dark:bg-gray-800 px-4 py-3 text-[#0d141b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 resize-none",
                      getFieldError('address') 
                        ? "border-red-500 dark:border-red-500" 
                        : "border-[#cfdbe7] dark:border-gray-600"
                    )}
                    placeholder="House No, Street, Locality..."
                    rows={3}
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    required
                  />
                  {getFieldError('address') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('address')}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* City */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#0d141b] dark:text-gray-200 text-sm font-medium leading-normal">
                      City / शहर <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={cn(
                        "w-full h-11 rounded-lg border bg-slate-50 dark:bg-gray-800 px-4 py-2 text-[#0d141b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                        getFieldError('city') 
                          ? "border-red-500 dark:border-red-500" 
                          : "border-[#cfdbe7] dark:border-gray-600"
                      )}
                      placeholder="e.g. Mumbai"
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                      required
                    />
                    {getFieldError('city') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('city')}</p>
                    )}
                  </div>
                  {/* State */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#0d141b] dark:text-gray-200 text-sm font-medium leading-normal">
                      State / राज्य <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className={cn(
                          "w-full h-11 appearance-none rounded-lg border bg-slate-50 dark:bg-gray-800 px-4 py-2 text-[#0d141b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                          getFieldError('state') 
                            ? "border-red-500 dark:border-red-500" 
                            : "border-[#cfdbe7] dark:border-gray-600"
                        )}
                        value={formData.state}
                        onChange={(e) =>
                          updateFormData("state", e.target.value)
                        }
                        required
                      >
                        <option value="">
                          Select State
                        </option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <Icon
                        name="keyboard_arrow_down"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[20px]"
                      />
                    </div>
                    {getFieldError('state') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('state')}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pincode */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#0d141b] dark:text-gray-200 text-sm font-medium leading-normal">
                      Pincode / पिन कोड <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={cn(
                        "w-full h-11 rounded-lg border bg-slate-50 dark:bg-gray-800 px-4 py-2 text-[#0d141b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                        getFieldError('pincode') 
                          ? "border-red-500 dark:border-red-500" 
                          : "border-[#cfdbe7] dark:border-gray-600"
                      )}
                      maxLength={6}
                      placeholder="110001"
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                        updateFormData("pincode", value);
                      }}
                      required
                    />
                    {getFieldError('pincode') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('pincode')}</p>
                    )}
                  </div>
                  {/* Country */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#0d141b] dark:text-gray-200 text-sm font-medium leading-normal">
                      Country / देश <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className={cn(
                          "w-full h-11 appearance-none rounded-lg border bg-slate-50 dark:bg-gray-800 px-4 py-2 text-[#0d141b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                          getFieldError('country') 
                            ? "border-red-500 dark:border-red-500" 
                            : "border-[#cfdbe7] dark:border-gray-600"
                        )}
                        value={formData.country}
                        onChange={(e) =>
                          updateFormData("country", e.target.value)
                        }
                        required
                      >
                        <option value="India">India</option>
                        <option value="Other">Other</option>
                      </select>
                      <Icon
                        name="public"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[20px]"
                      />
                    </div>
                    {getFieldError('country') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('country')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="flex flex-col gap-4 pt-2">
                <label className="text-[#0d141b] dark:text-gray-200 text-sm font-bold leading-normal uppercase tracking-wider text-xs text-gray-500">
                  Contact Information
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#0d141b] dark:text-gray-200 text-sm font-medium leading-normal">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className={cn(
                          "w-full h-11 rounded-lg border bg-slate-50 dark:bg-gray-800 px-4 py-2 text-[#0d141b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                          getFieldError('phone') 
                            ? "border-red-500 dark:border-red-500" 
                            : "border-[#cfdbe7] dark:border-gray-600"
                        )}
                        placeholder="+91 9876543210"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          updateFormData("phone", e.target.value)
                        }
                        required
                      />
                      <Icon
                        name="phone"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]"
                      />
                    </div>
                    {getFieldError('phone') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('phone')}</p>
                    )}
                  </div>
                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#0d141b] dark:text-gray-200 text-sm font-medium leading-normal">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className={cn(
                          "w-full h-11 rounded-lg border bg-slate-50 dark:bg-gray-800 px-4 py-2 text-[#0d141b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                          getFieldError('email') 
                            ? "border-red-500 dark:border-red-500" 
                            : "border-[#cfdbe7] dark:border-gray-600"
                        )}
                        placeholder="example@domain.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          updateFormData("email", e.target.value)
                        }
                        required
                      />
                      <Icon
                        name="email"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]"
                      />
                    </div>
                    {getFieldError('email') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('email')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Blood Group */}
              <div className="flex flex-col gap-2">
                <label className="text-[#0d141b] dark:text-gray-200 text-sm font-medium leading-normal">
                  Blood Group
                </label>
                <div className="relative md:w-1/2">
                  <select
                    className={cn(
                      "w-full h-11 appearance-none rounded-lg border bg-slate-50 dark:bg-gray-800 px-4 py-2 text-[#0d141b] dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",
                      getFieldError('blood_group') 
                        ? "border-red-500 dark:border-red-500" 
                        : "border-[#cfdbe7] dark:border-gray-600"
                    )}
                    value={formData.blood_group}
                    onChange={(e) =>
                      updateFormData("blood_group", e.target.value)
                    }
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                  <Icon
                    name="bloodtype"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[20px]"
                  />
                </div>
                {getFieldError('blood_group') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('blood_group')}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-10 animate-fade-in">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <div>
              <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight">
                Medical History
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xl">
                Please provide details about your past and current health
                conditions. This information is encrypted and secure.{" "}
                <span className="text-primary font-medium inline-flex items-center gap-1">
                  <Icon name="verified_user" className="text-sm" /> ABDM
                  Compliant
                </span>
              </p>
            </div>

            {/* Allergies Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                  Do you have any known allergies?
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Select all that apply
                </span>
              </div>
              <div className={cn(
                "flex flex-wrap gap-3",
                getFieldError('allergies') && "p-2 border border-red-300 rounded-lg"
              )}>
                {allergies.map((allergy) => (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={cn(
                      "flex h-9 items-center justify-center gap-x-2 rounded-full pl-4 pr-3 transition-all",
                      formData.allergies.includes(allergy)
                        ? "bg-primary text-white"
                        : "bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300",
                    )}
                  >
                    <p className="text-sm font-medium">{allergy}</p>
                    {formData.allergies.includes(allergy) && (
                      <Icon name="check" className="text-sm" />
                    )}
                  </button>
                ))}
              </div>
              {getFieldError('allergies') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('allergies')}</p>
              )}
            </div>

            {/* Chronic Conditions */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                  Existing Chronic Conditions
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Select all that apply
                </span>
              </div>
              <div className={cn(
                "flex flex-wrap gap-3",
                getFieldError('chronicConditions') && "p-2 border border-red-300 rounded-lg"
              )}>
                {chronicConditions.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => toggleCondition(condition)}
                    className={cn(
                      "flex h-9 items-center justify-center gap-x-2 rounded-full pl-4 pr-3 transition-all",
                      formData.chronicConditions.includes(condition)
                        ? "bg-primary text-white"
                        : "bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300",
                    )}
                  >
                    <p className="text-sm font-medium">{condition}</p>
                    {formData.chronicConditions.includes(condition) && (
                      <Icon name="check" className="text-sm" />
                    )}
                  </button>
                ))}
              </div>
              {getFieldError('chronicConditions') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('chronicConditions')}</p>
              )}
            </div>

            {/* Medications */}
            <div className="flex flex-col gap-4">
              <label
                className="text-slate-900 dark:text-white text-lg font-bold"
                htmlFor="medications"
              >
                Current Medications &amp; Treatments
              </label>
              <div className="relative group">
                <textarea
                  id="medications"
                  className={cn(
                    "w-full resize-none rounded-lg border bg-white dark:bg-[#1a2632] p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary",
                    getFieldError('medications') 
                      ? "border-red-500 dark:border-red-500" 
                      : "border-slate-300 dark:border-slate-600"
                  )}
                  placeholder="List name and dosage (e.g., Metformin 500mg, Daily)..."
                  rows={4}
                  value={formData.medications}
                  onChange={(e) =>
                    updateFormData("medications", e.target.value)
                  }
                  maxLength={500}
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-400 bg-white dark:bg-[#1a2632] px-1">
                  {formData.medications.length}/500 characters
                </div>
              </div>
              {getFieldError('medications') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('medications')}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {error && (
              <div className="lg:col-span-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Left Column - Insurance Details */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Insurance Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                    <Icon name="health_and_safety" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Insurance Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Insurance Provider
                    </label>
                    <div className="relative">
                      <select
                        className={cn(
                          "w-full rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none",
                          getFieldError('insuranceProvider') 
                            ? "border-red-500 dark:border-red-500" 
                            : "border-slate-300 dark:border-slate-700"
                        )}
                        value={formData.insuranceProvider}
                        onChange={(e) =>
                          updateFormData("insuranceProvider", e.target.value)
                        }
                      >
                        <option value="">
                          Select provider
                        </option>
                        {insuranceProviders.map((provider) => (
                          <option key={provider} value={provider}>
                            {provider}
                          </option>
                        ))}
                      </select>
                    </div>
                    {getFieldError('insuranceProvider') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('insuranceProvider')}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Policy Number
                    </label>
                    <input
                      className={cn(
                        "w-full rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-slate-400",
                        getFieldError('policyNumber') 
                          ? "border-red-500 dark:border-red-500" 
                          : "border-slate-300 dark:border-slate-700"
                      )}
                      placeholder="e.g. POL-883920-X"
                      type="text"
                      value={formData.policyNumber}
                      onChange={(e) =>
                        updateFormData("policyNumber", e.target.value)
                      }
                    />
                    {getFieldError('policyNumber') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('policyNumber')}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Valid Through
                    </label>
                    <input
                      className={cn(
                        "w-full rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-slate-400",
                        getFieldError('validUntil') 
                          ? "border-red-500 dark:border-red-500" 
                          : "border-slate-300 dark:border-slate-700"
                      )}
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        updateFormData("validUntil", e.target.value)
                      }
                    />
                    {getFieldError('validUntil') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('validUntil')}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Group ID{" "}
                      <span className="text-slate-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      className={cn(
                        "w-full rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-slate-400",
                        getFieldError('groupId') 
                          ? "border-red-500 dark:border-red-500" 
                          : "border-slate-300 dark:border-slate-700"
                      )}
                      placeholder="Enter Group ID"
                      type="text"
                      value={formData.groupId}
                      onChange={(e) =>
                        updateFormData("groupId", e.target.value)
                      }
                    />
                    {getFieldError('groupId') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('groupId')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Context/Info */}
            <div className="hidden lg:flex flex-col gap-6">
              {/* Summary Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
                <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                  Registration Summary
                </h4>
                <ul className="space-y-4">
                  {steps.map((step, index) => (
                    <li
                      key={step.number}
                      className="flex gap-3 relative pb-4 border-l-2 pl-4"
                      style={{
                        borderColor:
                          step.number <= currentStep
                            ? "#137fec"
                            : "transparent",
                        paddingBottom:
                          index === steps.length - 1 ? "0" : "1rem",
                      }}
                    >
                      <span
                        className="absolute -left-[9px] top-0 size-4 rounded-full border-2 border-white dark:border-slate-900"
                        style={{
                          backgroundColor:
                            step.number <= currentStep
                              ? "#137fec"
                              : step.number === currentStep + 1
                                ? "white"
                                : "#e2e8f0",
                        }}
                      ></span>
                      <div>
                        <p
                          className={cn(
                            "text-sm font-bold",
                            step.number <= currentStep
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-400",
                          )}
                        >
                          {step.title}
                        </p>
                        <p
                          className={cn(
                            "text-xs",
                            step.number <= currentStep
                              ? "text-slate-500"
                              : "text-slate-400",
                          )}
                        >
                          {step.number < currentStep
                            ? "Completed"
                            : step.number === currentStep
                              ? "In Progress"
                              : "Pending"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50 p-3 text-center">
          <p className="text-amber-800 dark:text-amber-200 text-sm font-medium flex items-center justify-center gap-2">
            <Icon name="cloud_off" className="text-lg" />
            You are currently offline. Data will be saved locally and synced
            once connectivity is restored.
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-10 w-full max-w-[1200px] mx-auto gap-8">
        {/* Progress Bar */}
        <div className="w-full max-w-[960px]">
          <div className="flex justify-between items-end mb-2">
            <p className="text-base font-semibold">
              Step {currentStep} of 3: {steps[currentStep - 1]?.title}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {steps[currentStep - 1]?.subtitle}
            </p>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 w-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
              {currentProgress}% Completed
            </span>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-[#cfdbe7] dark:border-gray-700 overflow-hidden flex flex-col w-full max-w-[960px]">
          <div className="p-6 sm:p-8 flex flex-col gap-8">
            {renderStepContent()}
          </div>

          {/* Footer Actions */}
          {!registrationComplete && (
            <div className="pt-4 border-t border-[#e7edf3] dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 p-6">
              <button
                onClick={handleBack}
                className="w-full sm:w-auto h-11 px-6 rounded-lg border border-transparent text-gray-600 dark:text-gray-400 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentStep === 1 || isSubmitting}
              >
                Back
              </button>

              <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-6 sm:px-8 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-md shadow-blue-200 dark:shadow-none transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⚪</span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {currentStep < 3
                          ? `Next: ${steps[currentStep]?.title}`
                          : "Complete Registration"}
                      </span>
                      {currentStep < 3 ? (
                        <Icon
                          name="arrow_forward"
                          className="text-[18px] flex-shrink-0"
                        />
                      ) : (
                        <Icon name="check" className="text-[18px] flex-shrink-0" />
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
      `}</style>
    </div>
  );
}