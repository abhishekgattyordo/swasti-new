"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Activity,
  Heart,
  Clock,
  FileText,
  Edit,
  Download,
  Printer,
  AlertCircle,
  CheckCircle2,
  Award,
  GraduationCap,
  Languages,
  Briefcase,
  Star,
  BookOpen,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { Menu, X } from 'lucide-react';
import { doctorsApi } from "@/lib/api/doctors";

interface DoctorDetails {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  department: string;
  licenseNumber: string;
  dateOfBirth?: string;
  dateJoined: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  qualifications: string[];
  experience?: number;
  bio?: string;
  status: 'active' | 'on-leave' | 'inactive';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DoctorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
  const doctorId = Number(params.id);
  if (isNaN(doctorId)) {
    toast.error("Invalid doctor ID");
    router.push("/admin/doctorsmanagement");
    return;
  }

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const response = await doctorsApi.getDoctor(doctorId);
      console.log('Raw API response (details):', response); // 👈 DEBUG

      // Try to extract doctor data from various possible response structures
      let doctorData = null;
      if (response.data?.success && response.data.data) {
        // Case: { success: true, data: { ... } }
        doctorData = response.data.data;
      } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
        // Case: Direct doctor object
        doctorData = response.data;
      } else if (response.data?.data && typeof response.data.data === 'object') {
        // Case: { data: { ... } } (no success)
        doctorData = response.data.data;
      }

      if (!doctorData) {
        console.error('Unexpected API response:', response.data);
        toast.error('Failed to load doctor details: unexpected response format');
        router.push("/admin/doctorsmanagement");
        return;
      }

      // Map the data to your DoctorDetails interface (adjust field names if needed)
      const mappedDoctor: DoctorDetails = {
        id: doctorData.id,
        firstName: doctorData.firstName || doctorData.first_name || '',
        lastName: doctorData.lastName || doctorData.last_name || '',
        email: doctorData.email || '',
        phone: doctorData.phone || '',
        specialty: doctorData.specialty || doctorData.speciality || '',
        department: doctorData.department || '',
        licenseNumber: doctorData.licenseNumber || doctorData.license_number || '',
        dateOfBirth: doctorData.dateOfBirth || doctorData.date_of_birth,
        dateJoined: doctorData.dateJoined || doctorData.date_joined || '',
        address: doctorData.address,
        city: doctorData.city,
        state: doctorData.state,
        zipCode: doctorData.zipCode || doctorData.zip_code,
        country: doctorData.country,
        qualifications: doctorData.qualifications || [],
        experience: doctorData.experience,
        bio: doctorData.bio,
        status: doctorData.status || 'inactive',
        avatar: doctorData.avatar,
        createdAt: doctorData.created_at || doctorData.createdAt || '',
        updatedAt: doctorData.updated_at || doctorData.updatedAt || '',
      };

      setDoctor(mappedDoctor);
    } catch (error) {
      console.error("Error fetching doctor:", error);
      toast.error("Failed to load doctor details");
      router.push("/admin/doctorsmanagement");
    } finally {
      setLoading(false);
    }
  };

  fetchDoctor();
}, [params.id, router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</Badge>;
      case "on-leave":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">On Leave</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1">
          <Header />
          <div className="flex items-center justify-center h-[60vh] px-4">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading doctor details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) return null;

  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  const joinedDate = formatDate(doctor.dateJoined);
  const dob = formatDate(doctor.dateOfBirth);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-50 p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          {/* Back Button */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm sm:text-base">Back to Doctor List</span>
            </button>
            
            {/* Mobile Action Buttons */}
            <div className="flex gap-2 lg:hidden">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Doctor Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 w-full">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                  {doctor.avatar ? (
                    <Image
                      src={doctor.avatar}
                      alt={fullName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                      {doctor.firstName[0]}{doctor.lastName[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {fullName}
                    </h1>
                    {getStatusBadge(doctor.status)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {doctor.specialty} • {doctor.department}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {doctor.experience && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {doctor.experience} years experience
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Desktop Action Buttons */}
              <div className="hidden lg:flex gap-3 ml-auto flex-shrink-0">
                <Button variant="outline" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button variant="outline" className="gap-2">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="inline-flex w-auto">
                <TabsTrigger value="overview" className="px-4 py-2 text-sm whitespace-nowrap">Overview</TabsTrigger>
                <TabsTrigger value="qualifications" className="px-4 py-2 text-sm whitespace-nowrap">Qualifications</TabsTrigger>
                <TabsTrigger value="personal" className="px-4 py-2 text-sm whitespace-nowrap">Personal</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Contact Information */}
                <Card>
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-900 dark:text-white break-all">
                        {doctor.phone}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-900 dark:text-white break-all">
                        {doctor.email}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Biography */}
                {doctor.bio && (
                  <Card>
                    <CardHeader className="px-4 sm:px-6">
                      <CardTitle className="text-base">Biography</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {doctor.bio}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* License Info */}
                <Card>
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-base">License & Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">License Number:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{doctor.licenseNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date Joined:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{joinedDate}</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Qualifications Tab */}
            {activeTab === "qualifications" && (
              <Card>
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-base">Qualifications & Certifications</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {doctor.qualifications && doctor.qualifications.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2">
                      {doctor.qualifications.map((q, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                          {q}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No qualifications listed.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Personal Tab */}
            {activeTab === "personal" && (
              <>
                <Card>
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-base">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date of Birth:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{dob}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                {(doctor.address || doctor.city || doctor.state || doctor.country) && (
                  <Card>
                    <CardHeader className="px-4 sm:px-6">
                      <CardTitle className="text-base">Address</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {doctor.address && <>{doctor.address}<br /></>}
                        {doctor.city && doctor.state && `${doctor.city}, ${doctor.state} `}
                        {doctor.zipCode && <>{doctor.zipCode}<br /></>}
                        {doctor.country}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}