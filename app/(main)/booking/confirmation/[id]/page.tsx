

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/ui/Header";

import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  FileText,
  CreditCard,
  MapPin,
  Video,
  Home,
  Mail,
  Phone,
  ArrowLeft,
  Download,
  Printer,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";

interface AppointmentSummary {
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
  consultationType: "in-person" | "teleconsultation";
  date: string;
  time: string;
  notes: string;
  fees: string;
  patientName: string;
  bookingId: string;
  bookedOn: string;
}

export default function AppointmentConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const [summary, setSummary] = useState<AppointmentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Retrieve appointment data from localStorage
    const storedSummary = localStorage.getItem("appointmentSummary");
    if (storedSummary) {
      setSummary(JSON.parse(storedSummary));
    } else {
      // If no data, redirect to home
      router.push("/");
    }
    setIsLoading(false);
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ✅ Convert 24‑hour time to 12‑hour format with AM/PM
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const handleDownloadReceipt = () => {
    toast.success("Receipt downloaded successfully");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const handleAddToCalendar = () => {
    toast.success("Added to calendar");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading confirmation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your appointment has been successfully scheduled
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Left Column - Appointment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Appointment Details
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Doctor Info */}
                <div className="flex items-start gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-green-100 dark:border-green-900/30">
                 {summary.doctorImage ? (
  <img
    src={summary.doctorImage}
    alt={summary.doctorName}
    className="w-full h-full object-cover"
    onError={(e) => {
      (e.target as HTMLImageElement).src = "/default-doctor.jpg";
    }}
  />
) : null}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {summary.doctorName}
                    </h3>
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      {summary.doctorSpecialty}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Booking ID: {summary.bookingId}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatDate(summary.date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatTime(summary.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consultation Type */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      {summary.consultationType === "teleconsultation" ? (
                        <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Consultation Type</p>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">
                        {summary.consultationType === "teleconsultation" ? "Video Consultation" : "In-Person Visit"}
                      </p>
                      {summary.consultationType === "teleconsultation" && (
                        <p className="text-xs text-green-600 mt-1">
                          Video link will be sent 15 minutes before
                        </p>
                      )}
                      {summary.consultationType === "in-person" && (
                        <p className="text-xs text-gray-500 mt-1">
                          Clinic: 123 Healthcare Ave, Medical District
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {summary.notes && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Notes</p>
                        <p className="text-gray-700 dark:text-gray-300">{summary.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fee Details */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Consultation Fee</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {summary.fees}
                        </span>
                      
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                  Booked on: {new Date(summary.bookedOn).toLocaleString()}
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                What's Next?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {summary.consultationType === "teleconsultation" ? (
                  <>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        Check Email
                      </h4>
                      <p className="text-xs text-gray-500">
                        Confirmation sent to your email
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Video className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        Join Video Call
                      </h4>
                      <p className="text-xs text-gray-500">
                        Link will be sent 15 min before
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        Reminder
                      </h4>
                      <p className="text-xs text-gray-500">
                        SMS reminder 2 hours before
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        Visit Clinic
                      </h4>
                      <p className="text-xs text-gray-500">
                        123 Healthcare Ave, Medical District
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        Carry Documents
                      </h4>
                      <p className="text-xs text-gray-500">
                        ID proof & previous reports
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        Arrive Early
                      </h4>
                      <p className="text-xs text-gray-500">
                        Please arrive 15 minutes before
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-1 space-y-4">
            {/* Action Buttons */}
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
    Actions
  </h3>
  <div className="space-y-3">
    <button
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
    >
      <Share2 className="w-4 h-4" />
      Share
    </button>

    <button
      onClick={handleAddToCalendar}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
    >
      <Calendar className="w-4 h-4" />
      Add to Calendar
    </button>
  </div>
</div>

            {/* Need Help? */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                If you have any questions or need to reschedule, please contact our support team.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">support@healthcare.com</span>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <button
              onClick={() => router.push("/")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}