// app/admin/patientmanagement/page.tsx (updated)
"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Edit,
  Filter,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Users, Activity, HeartPulse, TrendingUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Menu, X } from "lucide-react";
import { patientsApi } from "@/lib/api/registration";
import { toast } from "sonner";
import PatientImport from "@/components/admin/PatientImport";
// ==================== Types & Interfaces ====================
interface Patient {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  condition: string;
  conditionColor: string;
  department: string;
  contact: string;
  lastVisit: string; // will be updated from appointments
  nextAppointment: string; // will be updated from appointments
  status: "active" | "inactive" | "critical";
  statusColor: string;
}

// Type for appointment from the API
interface Appointment {
  id: number;
  appointment_date: string; // e.g., "2026-03-10T10:00:00Z"
  status: string; // e.g., "completed", "scheduled", "cancelled"
}

interface ColumnFilterProps {
  column: string;
  placeholder?: string;
  options?: string[];
  onFilter: (column: string, value: string) => void;
  currentValue?: string;
}

interface DateRangeFilterProps {
  column: string;
  onFilter: (column: string, from: string, to: string) => void;
  currentRange?: { from: string; to: string };
}

// ==================== Filter Components ====================
function ColumnFilter({
  column,
  placeholder = "Filter...",
  options,
  onFilter,
  currentValue,
}: ColumnFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`ml-1 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            currentValue ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} className="h-8" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            {options ? (
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt}
                    onSelect={() => {
                      onFilter(column, opt);
                      setOpen(false);
                    }}
                  >
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    const input =
                      document.querySelector<HTMLInputElement>(
                        "[cmdk-input]",
                      )?.value;
                    if (input) onFilter(column, input);
                    setOpen(false);
                  }}
                >
                  Apply
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DateRangeFilter({
  column,
  onFilter,
  currentRange,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(currentRange?.from || "");
  const [to, setTo] = useState(currentRange?.to || "");

  const handleApply = () => {
    onFilter(column, from, to);
    setOpen(false);
  };

  const handleClear = () => {
    setFrom("");
    setTo("");
    onFilter(column, "", "");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`ml-1 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            currentRange?.from || currentRange?.to
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-400"
          }`}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Date Range</h4>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-8"
              />
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex-1"
            >
              Clear
            </Button>
            <Button size="sm" onClick={handleApply} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ==================== Main Component ====================
const PatientManagementPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Patients");
  const [columnFilters, setColumnFilters] = useState<
    { column: string; value: string }[]
  >([]);
  const [dateFilters, setDateFilters] = useState<
    Record<string, { from: string; to: string }>
  >({});
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Stats data
  const [statsData, setStatsData] = useState([
    { title: "Total Patients", value: "0", color: "blue", icon: <Users /> },
    { title: "Active Cases", value: "0", color: "green", icon: <Activity /> },
    { title: "ICU Patients", value: "0", color: "red", icon: <HeartPulse /> },
    {
      title: "Monthly Admissions",
      value: "0",
      color: "amber",
      icon: <TrendingUp />,
    },
  ]);

  // Filter data (status filters)
  const filtersData = [
    { label: "All Patients", isActive: true },
    { label: "Active", isActive: false },
    { label: "Critical", isActive: false },
    { label: "Inactive", isActive: false },
  ];

  // Helper to get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "text-green-700 dark:text-green-400";
      case "critical":
        return "text-rose-700 dark:text-rose-400";
      default:
        return "text-slate-700 dark:text-slate-400";
    }
  };

  // Helper to format date from ISO string to local date string
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(); // you can customize format as needed
    } catch {
      return "N/A";
    }
  };

  // Fetch patients and then their appointments

  const loadPatients = async () => {
    try {
      setLoading(true);
      // 1. Fetch patients list
      const response = await patientsApi.adminGetAllPatients();
      console.log("API response:", response);

      // Extract patient array
      let patientsArray: any[] = [];
      if (Array.isArray(response.data)) {
        patientsArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        patientsArray = response.data.data;
      } else if (response.data?.success && Array.isArray(response.data.data)) {
        patientsArray = response.data.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        setError("Invalid data format from server");
        setLoading(false);
        return;
      }

      // Map to Patient type with placeholder dates
      const mappedPatients: Patient[] = patientsArray.map((item: any) => {
        const age = item.dob
          ? new Date().getFullYear() - new Date(item.dob).getFullYear()
          : 0;
        const condition =
          item.allergies?.[0] ||
          item.chronicConditions?.[0] ||
          item.condition ||
          "No condition";
        const department = item.department || "General";
        const status = (item.status || "active") as
          | "active"
          | "inactive"
          | "critical";
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.full_name_en || "Patient")}&background=137fec&color=fff&size=128`;
        const conditionColor =
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";

        return {
          id: item.patient_id?.toString() || item.id?.toString() || "",
          name:
            item.full_name_en ||
            `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
            "Unknown",
          email: item.email || "",
          avatarUrl,
          age,
          gender: item.gender
            ? ((item.gender.charAt(0).toUpperCase() + item.gender.slice(1)) as
                | "Male"
                | "Female"
                | "Other")
            : "Other",
          bloodGroup: item.blood_group || "Unknown",
          condition,
          conditionColor,
          department,
          contact: item.phone || "",
          lastVisit: "N/A", // placeholder
          nextAppointment: "N/A", // placeholder
          status,
          statusColor: getStatusColor(status),
        };
      });

      setPatients(mappedPatients);
      updateStats(mappedPatients);
      setError(null);

      // 2. For each patient, fetch appointments and update lastVisit & nextAppointment
      const appointmentPromises = mappedPatients.map(async (patient) => {
        try {
          const res = await fetch(`/api/appointments/patient/${patient.id}`);
          if (!res.ok) {
            console.warn(
              `Failed to fetch appointments for patient ${patient.id}`,
            );
            return {
              patientId: patient.id,
              lastVisit: "N/A",
              nextAppointment: "N/A",
            };
          }
          const json = await res.json();
          // Handle response format { success: true, data: [...] }
          const appointments: any[] =
            json.data || (Array.isArray(json) ? json : []);

          const now = new Date();

          // Past appointments: date before now, exclude cancelled
          const pastAppointments = appointments
            .filter((apt) => {
              const aptDate = new Date(apt.date);
              return aptDate < now && apt.status !== "CANCELLED";
            })
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            ); // most recent first

          // Future appointments: date after or equal now, exclude cancelled
          const futureAppointments = appointments
            .filter((apt) => {
              const aptDate = new Date(apt.date);
              return aptDate >= now && apt.status !== "CANCELLED";
            })
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            ); // soonest first

          const lastVisit =
            pastAppointments.length > 0
              ? formatDate(pastAppointments[0].date)
              : "N/A";
          const nextAppointment =
            futureAppointments.length > 0
              ? formatDate(futureAppointments[0].date)
              : "N/A";

          return { patientId: patient.id, lastVisit, nextAppointment };
        } catch (err) {
          console.error(
            `Error fetching appointments for patient ${patient.id}:`,
            err,
          );
          return {
            patientId: patient.id,
            lastVisit: "N/A",
            nextAppointment: "N/A",
          };
        }
      });

      const appointmentResults = await Promise.allSettled(appointmentPromises);
      // Update patients with appointment data
      const updatedPatients = mappedPatients.map((patient) => {
        const result = appointmentResults.find(
          (r) => r.status === "fulfilled" && r.value.patientId === patient.id,
        );
        if (result?.status === "fulfilled") {
          return {
            ...patient,
            lastVisit: result.value.lastVisit,
            nextAppointment: result.value.nextAppointment,
          };
        }
        return patient; // keep original placeholders
      });

      setPatients(updatedPatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("An error occurred while fetching patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleImportSuccess = () => {
    loadPatients(); // refresh the list
  };

  // Update stats based on patients
  const updateStats = (patients: Patient[]) => {
    const total = patients.length;
    const active = patients.filter((p) => p.status === "active").length;
    const critical = patients.filter((p) => p.status === "critical").length;
    setStatsData([
      {
        title: "Total Patients",
        value: total.toString(),
        color: "blue",
        icon: <Users />,
      },
      {
        title: "Active Cases",
        value: active.toString(),
        color: "green",
        icon: <Activity />,
      },
      {
        title: "ICU Patients",
        value: critical.toString(),
        color: "red",
        icon: <HeartPulse />,
      },
      {
        title: "Monthly Admissions",
        value: "187",
        color: "amber",
        icon: <TrendingUp />,
      },
    ]);
  };

  const handleDelete = async (patientId: string) => {
  console.log("🔥 Delete clicked:", patientId);

  if (!window.confirm("Are you sure you want to delete this patient?"))
    return;

  try {
    console.log("🚀 Calling API...");

    const response = await patientsApi.adminDeletePatient(patientId);

    console.log("✅ RESPONSE:", response);

    if (!response) {
      console.log("❌ RESPONSE UNDEFINED");
      toast.error("No response from server");
      return;
    }

    if (response.success) {
      console.log("🎉 SUCCESS BLOCK");

      setPatients((prev) => {
        const updated = prev.filter((p) => p.id !== patientId);
        updateStats(updated);
        return updated;
      });

      toast.success(response.message);
    } else {
      console.log("⚠️ FAILED BLOCK");
      
      // 🎯 Handle foreign key constraint error (code 23503)
      if (response.code === '23503' || response.detail?.includes('still referenced')) {
        // Extract table name from detail
        const tableMatch = response.detail?.match(/table "([^"]+)"/);
        const tableName = tableMatch ? tableMatch[1] : '';
        
        // User-friendly messages based on table
        const getFriendlyMessage = (table: string) => {
          const messages: Record<string, string> = {
            'emergency_assessments': 'This patient has emergency assessment records. Please delete their emergency assessments first.',
            'medical_history': 'This patient has medical history records. Please delete their medical history first.',
            'insurance_details': 'This patient has insurance details. Please delete their insurance records first.',
            'registrations': 'This patient has registration records. Please delete their registrations first.',
            'admissions': 'This patient has admission records. Please discharge them first.',
            'prescriptions': 'This patient has active prescriptions. Please cancel them first.',
            'lab_tests': 'This patient has pending lab tests. Please complete or cancel them first.',
            'bills': 'This patient has unpaid bills. Please settle them first.',
            'appointments': 'This patient has upcoming appointments. Please cancel them first.',
          };
          return messages[table] || `This patient has existing records in "${table}". Please remove those records first.`;
        };
        
        const friendlyMessage = getFriendlyMessage(tableName);
        toast.error(friendlyMessage);
        
        // Log technical details for developers
        console.error('Delete failed - Foreign key constraint:', {
          code: response.code,
          detail: response.detail,
          constraint: response.constraint
        });
      } 
      // Handle patient not found
      else if (response.message?.includes('not found') || response.code === '404') {
        toast.error('Patient not found. It may have been already deleted.');
        // Refresh the list to remove missing patient
        fetchPatients();
      }
      // Handle other errors
      else {
        toast.error(response.message || "Failed to delete patient");
      }
    }
  } catch (error: any) {
    console.log("❌ CATCH BLOCK TRIGGERED");
    console.error("❌ ERROR:", error);

    // Handle axios error response
    if (error?.response?.data) {
      const errorData = error.response.data;
      
      // Check for foreign key constraint in error response
      if (errorData.code === '23503' || errorData.detail?.includes('still referenced')) {
        const tableMatch = errorData.detail?.match(/table "([^"]+)"/);
        const tableName = tableMatch ? tableMatch[1] : '';
        
        const messages: Record<string, string> = {
          'emergency_assessments': 'Cannot delete: Patient has emergency assessment records.',
          'medical_history': 'Cannot delete: Patient has medical history records.',
          'insurance_details': 'Cannot delete: Patient has insurance records.',
          'registrations': 'Cannot delete: Patient has registration records.',
        };
        
        toast.error(messages[tableName] || `Cannot delete: Patient has records in "${tableName}".`);
      } else {
        toast.error(errorData.message || "An error occurred while deleting");
      }
    } 
    // Handle network errors
    else if (error?.message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    }
    // Generic error fallback
    else {
      toast.error("An unexpected error occurred. Please try again.");
    }
  }
};

  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      searchQuery === "" ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "All Patients" ||
      (selectedFilter === "Active" && patient.status === "active") ||
      (selectedFilter === "Critical" && patient.status === "critical") ||
      (selectedFilter === "Inactive" && patient.status === "inactive");

    const matchesColumnFilters = columnFilters.every((filter) => {
      const value = patient[filter.column as keyof Patient];
      return value
        ?.toString()
        .toLowerCase()
        .includes(filter.value.toLowerCase());
    });

    // Apply date range filters if present
    const matchesDateFilters = Object.entries(dateFilters).every(
      ([col, range]) => {
        if (!range.from && !range.to) return true;
        const patientDateStr = patient[col as keyof Patient] as string;
        if (patientDateStr === "N/A") return false;
        const patientDate = new Date(patientDateStr).getTime();
        if (range.from && new Date(range.from).getTime() > patientDate)
          return false;
        if (range.to && new Date(range.to).getTime() < patientDate)
          return false;
        return true;
      },
    );

    return (
      matchesSearch &&
      matchesFilter &&
      matchesColumnFilters &&
      matchesDateFilters
    );
  });

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case "active":
          return {
            bg: "bg-green-100 dark:bg-green-900/20",
            text: "text-green-800 dark:text-green-300",
            dot: "bg-green-500",
          };
        case "critical":
          return {
            bg: "bg-rose-100 dark:bg-rose-900/20",
            text: "text-rose-800 dark:text-rose-300",
            dot: "bg-rose-500 animate-pulse",
          };
        case "inactive":
          return {
            bg: "bg-slate-100 dark:bg-slate-800/50",
            text: "text-slate-700 dark:text-slate-400",
            dot: "bg-slate-500",
          };
        default:
          return {
            bg: "bg-slate-100",
            text: "text-slate-700",
            dot: "bg-slate-500",
          };
      }
    };

    const config = getStatusConfig(status);

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${config.bg} ${config.text} text-xs font-medium`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-white-600 hover:bg-green-700 text-blue rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-5">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 md:gap-5">
              {/* Page Header */}
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex-1">
                    <h1 className="text-slate-900 dark:text-white text-xl md:text-2xl font-bold tracking-tight">
                      Patient Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
                      Manage patient records, appointments, and medical history
                      in one place.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <PatientImport onSuccess={handleImportSuccess} />
                    <button
                      onClick={() => router.push("/admin/addnewpatient")}
                      className="flex items-center justify-center gap-1.5 rounded-lg h-9 md:h-10 px-3 md:px-4 bg-[#137fec] text-white text-sm font-semibold shadow-lg shadow-[#137fec]/20 hover:bg-[#137fec]/90 transition-all w-full md:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Patient</span>
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statsData.map((stat, index) => (
                    <div
                      key={index}
                      className="flex flex-col justify-between rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                            {stat.title}
                          </p>
                          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                            {loading ? "..." : stat.value}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            stat.color === "blue"
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : stat.color === "green"
                                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                : stat.color === "red"
                                  ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                                  : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {React.cloneElement(stat.icon, {
                            className: "w-6 h-6",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters and Table Section */}
              <div className="flex flex-col gap-4 md:gap-5">
                <div className="flex-1 flex flex-col gap-3 md:gap-4">
                  {/* Filters Header with Clear All */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Patient Filters
                    </h3>
                    {(columnFilters.length > 0 ||
                      Object.keys(dateFilters).length > 0) && (
                      <button
                        onClick={() => {
                          setColumnFilters([]);
                          setDateFilters({});
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>

                  {/* Status Filter Chips */}
                  <div className="flex flex-wrap gap-2.5">
                    {filtersData.map((filter) => (
                      <button
                        key={filter.label}
                        className={`
                          group relative flex items-center justify-center gap-x-2 h-10 rounded-full px-5 text-sm font-medium transition-all duration-300 backdrop-blur-sm
                          ${
                            selectedFilter === filter.label
                              ? "bg-gradient-to-r from-[#137fec] to-blue-500 text-white shadow-lg shadow-blue-500/25"
                              : "bg-white/80 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-slate-400/30 dark:hover:border-slate-600"
                          }
                        `}
                        onClick={() => setSelectedFilter(filter.label)}
                      >
                        {selectedFilter === filter.label && (
                          <div className="absolute inset-0 rounded-full border-2 border-blue-300/30 animate-pulse"></div>
                        )}
                        <span>{filter.label}</span>
                        {selectedFilter !== filter.label && (
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs">
                            →
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Loading / Error states */}
                  {loading && (
                    <div className="text-center py-8 text-slate-500">
                      Loading patients...
                    </div>
                  )}
                  {error && (
                    <div className="text-center py-8 text-rose-500">
                      {error}
                    </div>
                  )}

                  {/* Patients Table with Column Filters */}
                  {!loading && !error && (
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <div className="min-w-[1000px]">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-300 dark:border-slate-700">
                                <th className="px-4 py-3 text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                                  <div className="flex items-center">
                                    Patient
                                    <ColumnFilter
                                      column="name"
                                      placeholder="Filter by name..."
                                      onFilter={(col, val) => {
                                        setColumnFilters((prev) => {
                                          const filtered = prev.filter(
                                            (f) => f.column !== col,
                                          );
                                          return val
                                            ? [
                                                ...filtered,
                                                { column: col, value: val },
                                              ]
                                            : filtered;
                                        });
                                      }}
                                      currentValue={
                                        columnFilters.find(
                                          (f) => f.column === "name",
                                        )?.value
                                      }
                                    />
                                  </div>
                                </th>

                                <th className="px-4 py-3 text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                                  <div className="flex items-center">
                                    Last Visit
                                    <DateRangeFilter
                                      column="lastVisit"
                                      onFilter={(col, from, to) => {
                                        setDateFilters((prev) => ({
                                          ...prev,
                                          [col]: { from, to },
                                        }));
                                      }}
                                      currentRange={dateFilters.lastVisit}
                                    />
                                  </div>
                                </th>
                                <th className="px-4 py-3 text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                                  <div className="flex items-center">
                                    Next Appointment
                                    <DateRangeFilter
                                      column="nextAppointment"
                                      onFilter={(col, from, to) => {
                                        setDateFilters((prev) => ({
                                          ...prev,
                                          [col]: { from, to },
                                        }));
                                      }}
                                      currentRange={dateFilters.nextAppointment}
                                    />
                                  </div>
                                </th>
                                <th className="px-4 py-3 text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                                  <div className="flex items-center">
                                    Status
                                    <ColumnFilter
                                      column="status"
                                      options={[
                                        "active",
                                        "inactive",
                                        "critical",
                                      ]}
                                      onFilter={(col, val) => {
                                        setColumnFilters((prev) => {
                                          const filtered = prev.filter(
                                            (f) => f.column !== col,
                                          );
                                          return val
                                            ? [
                                                ...filtered,
                                                { column: col, value: val },
                                              ]
                                            : filtered;
                                        });
                                      }}
                                      currentValue={
                                        columnFilters.find(
                                          (f) => f.column === "status",
                                        )?.value
                                      }
                                    />
                                  </div>
                                </th>
                                <th className="px-4 py-3 text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider text-right whitespace-nowrap">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredPatients.map((patient) => (
                                <tr
                                  key={patient.id}
                                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                  onClick={() =>
                                    router.push(
                                      `/admin/patientmanagement/${patient.id}`,
                                    )
                                  }
                                >
                                  <td className="px-4 py-3 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center ring-2 ring-slate-100 dark:ring-slate-800 flex-shrink-0"
                                        style={{
                                          backgroundImage: `url(${patient.avatarUrl})`,
                                        }}
                                      ></div>
                                      <div className="flex flex-col">
                                        <span className="text-slate-900 dark:text-white font-semibold text-base">
                                          {patient.name}
                                        </span>
                                        <span className="text-slate-500 text-sm">
                                          {patient.age}y • {patient.gender}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                                    {patient.lastVisit}
                                  </td>
                                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                                    {patient.nextAppointment}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                                    <StatusBadge status={patient.status} />
                                  </td>
                                  <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(
                                            "Edit clicked for patient:",
                                            patient,
                                          );
                                          router.push(
                                            `/admin/addnewpatient?patientId=${patient.id}`,
                                          );
                                        }}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(patient.id);
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="px-4 py-3 border-t border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-sm text-slate-500 font-medium">
                          Showing 1 to {filteredPatients.length} of{" "}
                          {patients.length} patients
                        </span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Previous
                          </button>
                          <button className="px-3 py-1.5 rounded bg-[#137fec] text-white text-sm font-semibold">
                            1
                          </button>
                          <button className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            2
                          </button>
                          <button className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientManagementPage;
