"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { Menu, X, Loader2, Save } from "lucide-react";
import {
  PersonAdd,
  Upload,
  CheckCircle,
  ErrorOutline,
  Phone,
  Email,
  CalendarToday,
  Badge,
  LocalHospital,
  Home,
  School,
  Close,
} from "@mui/icons-material";
import { doctorsApi } from "@/lib/api/doctors";
import { toast } from "sonner";

export default function EditDoctorPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.id as string;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialty: "",
    department: "",
    licenseNumber: "",
    dateOfBirth: "",
    dateJoined: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    qualifications: [""],
    experience: "",
    bio: "",
    status: "active",
    avatar: null as File | null,
    existingAvatar: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const specialties = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Oncology",
    "Orthopedics",
    "Dermatology",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Internal Medicine",
    "Emergency Medicine",
    "Anesthesiology",
    "Pathology",
    "Ophthalmology",
  ];

  const departments = [
    "Cardiology Department",
    "Neurology Department",
    "Pediatrics Department",
    "Surgery Department",
    "Emergency Department",
    "Intensive Care Unit",
    "Diagnostics",
    "Oncology Center",
    "Orthopedics Center",
  ];

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        const response = await doctorsApi.getDoctor(parseInt(doctorId));
        console.log("Raw API response (getDoctor):", response);

        // ✅ FIX: The API returns { success, data } directly
        if (!response?.success) {
          console.error("API Error:", response);
          setFetchError("Failed to load doctor");
          toast.error(response?.message || "Failed to load doctor data");
          setIsLoading(false);
          return;
        }

        const doctor = response.data; // ✅ doctor object is here

        if (!doctor) {
          setFetchError("Doctor data not found");
          toast.error("Doctor not found");
          setIsLoading(false);
          return;
        }

        // Map doctor fields to form state (assuming camelCase from API)
        setFormData({
          firstName: doctor.firstName || "",
          lastName: doctor.lastName || "",
          email: doctor.email || "",
          phone: doctor.phone || "",
          specialty: doctor.specialty || "",
          department: doctor.department || "",
          licenseNumber: doctor.licenseNumber || "",
          dateOfBirth: doctor.dateOfBirth
            ? doctor.dateOfBirth.split("T")[0]
            : "",
          dateJoined: doctor.dateJoined ? doctor.dateJoined.split("T")[0] : "",
          address: doctor.address || "",
          city: doctor.city || "",
          state: doctor.state || "",
          zipCode: doctor.zipCode || "",
          country: doctor.country || "",
          qualifications: doctor.qualifications?.length
            ? doctor.qualifications
            : [""],
          experience: doctor.experience?.toString() || "",
          bio: doctor.bio || "",
          status: doctor.status || "active",
          avatar: null,
          existingAvatar: doctor.avatar || "",
        });

        if (doctor.avatar) setAvatarPreview(doctor.avatar);
      } catch (error) {
        console.error("Error fetching doctor:", error);
        setFetchError("Network error. Please try again.");
        toast.error("Failed to load doctor data");
      } finally {
        setIsLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: null, existingAvatar: "" }));
    setAvatarPreview(null);
  };

  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, ""],
    }));
  };

  const updateQualification = (index: number, value: string) => {
    setFormData((prev) => {
      const newQualifications = [...prev.qualifications];
      newQualifications[index] = value;
      return { ...prev, qualifications: newQualifications };
    });
  };

  const removeQualification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.specialty) newErrors.specialty = "Specialty is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.licenseNumber.trim())
      newErrors.licenseNumber = "License number is required";
    if (!formData.dateJoined) newErrors.dateJoined = "Date joined is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Use FormData for potential file upload
      const apiFormData = new FormData();
      apiFormData.append("firstName", formData.firstName);
      apiFormData.append("lastName", formData.lastName);
      apiFormData.append("email", formData.email);
      apiFormData.append("phone", formData.phone);
      apiFormData.append("specialty", formData.specialty);
      apiFormData.append("department", formData.department);
      apiFormData.append("licenseNumber", formData.licenseNumber);
      if (formData.dateOfBirth)
        apiFormData.append("dateOfBirth", formData.dateOfBirth);
      apiFormData.append("dateJoined", formData.dateJoined);
      if (formData.address) apiFormData.append("address", formData.address);
      if (formData.city) apiFormData.append("city", formData.city);
      if (formData.state) apiFormData.append("state", formData.state);
      if (formData.zipCode) apiFormData.append("zipCode", formData.zipCode);
      if (formData.country) apiFormData.append("country", formData.country);
      formData.qualifications.forEach(
        (q) => q.trim() && apiFormData.append("qualifications[]", q),
      );
      if (formData.experience)
        apiFormData.append("experience", formData.experience);
      if (formData.bio) apiFormData.append("bio", formData.bio);
      apiFormData.append("status", formData.status);
      if (formData.avatar) apiFormData.append("avatar", formData.avatar);

      const response = await doctorsApi.updateDoctor(
        parseInt(doctorId),
        apiFormData,
      );

      console.log("Update response:", response);

      if (response.success) {
        toast.success(response.message || "Doctor updated successfully!");
        router.push("/admin/doctormanagement");
      } else {
        if (response.errors) {
          setErrors(response.errors);
        } else {
          toast.error(response.message || "Failed to update doctor");
        }
      }
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error("An error occurred while updating");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
            <ErrorOutline className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
              Error Loading Doctor
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{fetchError}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-primary text-white rounded-full shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <div className="p-4 lg:p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                  <PersonAdd className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Edit Doctor
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Update doctor information
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left column – Basic Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Badge /> Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            First Name *
                          </label>
                          <input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                              errors.firstName
                                ? "border-rose-500"
                                : "border-slate-300 dark:border-slate-700"
                            } bg-white dark:bg-slate-800`}
                          />
                          {errors.firstName && (
                            <p className="text-xs text-rose-600 flex items-center gap-1">
                              <ErrorOutline /> {errors.firstName}
                            </p>
                          )}
                        </div>
                        {/* Last Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Last Name *
                          </label>
                          <input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                              errors.lastName
                                ? "border-rose-500"
                                : "border-slate-300 dark:border-slate-700"
                            } bg-white dark:bg-slate-800`}
                          />
                          {errors.lastName && (
                            <p className="text-xs text-rose-600">
                              <ErrorOutline /> {errors.lastName}
                            </p>
                          )}
                        </div>
                        {/* Email */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email *
                          </label>
                          <div className="relative">
                            <Email className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                                errors.email
                                  ? "border-rose-500"
                                  : "border-slate-300 dark:border-slate-700"
                              } bg-white dark:bg-slate-800`}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-xs text-rose-600">
                              <ErrorOutline /> {errors.email}
                            </p>
                          )}
                        </div>
                        {/* Phone */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Phone *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                                errors.phone
                                  ? "border-rose-500"
                                  : "border-slate-300 dark:border-slate-700"
                              } bg-white dark:bg-slate-800`}
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-xs text-rose-600">
                              <ErrorOutline /> {errors.phone}
                            </p>
                          )}
                        </div>
                        {/* DOB */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Date of Birth
                          </label>
                          <div className="relative">
                            <CalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </div>
                        </div>
                        {/* Date Joined */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Date Joined *
                          </label>
                          <div className="relative">
                            <CalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="date"
                              name="dateJoined"
                              value={formData.dateJoined}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                                errors.dateJoined
                                  ? "border-rose-500"
                                  : "border-slate-300 dark:border-slate-700"
                              } bg-white dark:bg-slate-800`}
                            />
                          </div>
                          {errors.dateJoined && (
                            <p className="text-xs text-rose-600">
                              <ErrorOutline /> {errors.dateJoined}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Professional Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <LocalHospital /> Professional Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Specialty */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Specialty *
                          </label>
                          <select
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                              errors.specialty
                                ? "border-rose-500"
                                : "border-slate-300 dark:border-slate-700"
                            } bg-white dark:bg-slate-800`}
                          >
                            <option value="">Select</option>
                            {specialties.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          {errors.specialty && (
                            <p className="text-xs text-rose-600">
                              <ErrorOutline /> {errors.specialty}
                            </p>
                          )}
                        </div>
                        {/* Department */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Department *
                          </label>
                          <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                              errors.department
                                ? "border-rose-500"
                                : "border-slate-300 dark:border-slate-700"
                            } bg-white dark:bg-slate-800`}
                          >
                            <option value="">Select</option>
                            {departments.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                          {errors.department && (
                            <p className="text-xs text-rose-600">
                              <ErrorOutline /> {errors.department}
                            </p>
                          )}
                        </div>
                        {/* License */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            License Number *
                          </label>
                          <input
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                              errors.licenseNumber
                                ? "border-rose-500"
                                : "border-slate-300 dark:border-slate-700"
                            } bg-white dark:bg-slate-800`}
                          />
                          {errors.licenseNumber && (
                            <p className="text-xs text-rose-600">
                              <ErrorOutline /> {errors.licenseNumber}
                            </p>
                          )}
                        </div>
                        {/* Experience */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Years of Experience
                          </label>
                          <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>

                      {/* Qualifications */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            Qualifications
                          </label>
                          <button
                            type="button"
                            onClick={addQualification}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <School /> Add
                          </button>
                        </div>
                        {formData.qualifications.map((q, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              value={q}
                              onChange={(e) =>
                                updateQualification(i, e.target.value)
                              }
                              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                              placeholder="e.g., MD, Board Certification"
                            />
                            {formData.qualifications.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeQualification(i)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                              >
                                <Close />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Biography</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right column – Avatar & Address */}
                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Profile Photo
                      </h3>
                      <div
                        className={`border-2 ${avatarPreview ? "border-slate-200" : "border-dashed border-slate-300"} rounded-2xl p-6`}
                      >
                        {avatarPreview ? (
                          <div className="space-y-4">
                            <div
                              className="relative w-32 h-32 mx-auto rounded-full bg-cover bg-center ring-4 ring-white"
                              style={{
                                backgroundImage: `url(${avatarPreview})`,
                              }}
                            />
                            <button
                              type="button"
                              onClick={removeAvatar}
                              className="absolute top-0 right-1/3 p-1 bg-rose-500 text-white rounded-full"
                            >
                              <Close />
                            </button>
                            <p className="text-sm text-center text-slate-600">
                              Click to change photo
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4">
                              <Upload className="text-blue-500 text-3xl" />
                            </div>
                            <p className="text-sm text-slate-600 mb-2">
                              Upload a professional photo
                            </p>
                            <p className="text-xs text-slate-500 mb-4">
                              JPG, PNG up to 2MB
                            </p>
                          </div>
                        )}
                        <label className="block cursor-pointer py-3 px-4 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          {avatarPreview ? "Change Photo" : "Upload Photo"}
                        </label>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Home /> Address
                      </h3>
                      <div className="space-y-3">
                        <input
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Street Address"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                          <input
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="State"
                            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            placeholder="ZIP Code"
                            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                          <input
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="Country"
                            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Status
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-300 hover:border-blue-500 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value="active"
                            checked={formData.status === "active"}
                            onChange={handleChange}
                            className="text-blue-600"
                          />
                          <div>
                            <span className="text-sm font-medium">Active</span>
                            <p className="text-xs text-slate-500">
                              Doctor is currently practicing
                            </p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-300 hover:border-amber-500 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value="on-leave"
                            checked={formData.status === "on-leave"}
                            onChange={handleChange}
                            className="text-amber-600"
                          />
                          <div>
                            <span className="text-sm font-medium">
                              On Leave
                            </span>
                            <p className="text-xs text-slate-500">
                              Doctor is temporarily unavailable
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <CheckCircle className="text-emerald-500" />
                    All information is securely stored
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#137fec] to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-70 text-sm font-medium flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="text-lg" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
