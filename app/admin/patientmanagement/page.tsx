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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
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
  lastVisit: string;
  nextAppointment: string;
  status: "active" | "inactive" | "critical";
  statusColor: string;
}

interface Appointment {
  id: number;
  appointment_date: string;
  status: string;
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
          className={`ml-1 p-1 rounded-md hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20 transition-colors ${
            currentValue ? "text-[#2BB2A7] dark:text-[#2BB2A7]" : "text-slate-400"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0 border-[#E2EFEA] dark:border-slate-700" align="start">
        <Command className="bg-white dark:bg-slate-800">
          <CommandInput placeholder={placeholder} className="h-8 text-gray-900 dark:text-white" />
          <CommandList>
            <CommandEmpty className="text-gray-500 dark:text-gray-400">No results.</CommandEmpty>
            {options ? (
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt}
                    onSelect={() => {
                      onFilter(column, opt);
                      setOpen(false);
                    }}
                    className="text-gray-700 dark:text-gray-300 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10"
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
                  className="text-gray-700 dark:text-gray-300 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10"
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
          className={`ml-1 p-1 rounded-md hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20 transition-colors ${
            currentRange?.from || currentRange?.to
              ? "text-[#2BB2A7] dark:text-[#2BB2A7]"
              : "text-slate-400"
          }`}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 border-[#E2EFEA] dark:border-slate-700 bg-white dark:bg-slate-800" align="start">
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-gray-900 dark:text-white">Date Range</h4>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="from" className="text-gray-700 dark:text-gray-300">From</Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-8 border-[#E2EFEA] dark:border-slate-600 focus:ring-[#2BB2A7] focus:border-[#2BB2A7]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="to" className="text-gray-700 dark:text-gray-300">To</Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-8 border-[#E2EFEA] dark:border-slate-600 focus:ring-[#2BB2A7] focus:border-[#2BB2A7]"
              />
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex-1 border-[#E2EFEA] dark:border-slate-600 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10"
            >
              Clear
            </Button>
            <Button 
              size="sm" 
              onClick={handleApply} 
              className="flex-1 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white"
            >
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [statsData, setStatsData] = useState([
    { title: "Total Patients", value: "0", color: "teal", icon: <Users /> },
    { title: "Active Cases", value: "0", color: "emerald", icon: <Activity /> },
    { title: "ICU Patients", value: "0", color: "red", icon: <HeartPulse /> },
    {
      title: "Monthly Admissions",
      value: "0",
      color: "amber",
      icon: <TrendingUp />,
    },
  ]);

  const filtersData = [
    { label: "All Patients", isActive: true },
    { label: "Active", isActive: false },
    { label: "Critical", isActive: false },
    { label: "Inactive", isActive: false },
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "text-[#1F8F89] dark:text-[#2BB2A7]";
      case "critical":
        return "text-rose-700 dark:text-rose-400";
      default:
        return "text-slate-700 dark:text-slate-400";
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientsApi.adminGetAllPatients();
      console.log("API response:", response);

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
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.full_name_en || "Patient")}&background=2BB2A7&color=fff&size=128`;

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
          conditionColor:
            "bg-[#EAF7F4] text-[#1F8F89] dark:bg-[#1F8F89]/20 dark:text-[#2BB2A7]",
          department,
          contact: item.phone || "",
          lastVisit: "N/A",
          nextAppointment: "N/A",
          status,
          statusColor: getStatusColor(status),
        };
      });

      setPatients(mappedPatients);
      setTotalItems(mappedPatients.length);
      updateStats(mappedPatients);
      setError(null);

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
          const appointments: any[] =
            json.data || (Array.isArray(json) ? json : []);

          const now = new Date();

          const pastAppointments = appointments
            .filter((apt) => {
              const aptDate = new Date(apt.date);
              return aptDate < now && apt.status !== "CANCELLED";
            })
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );

          const futureAppointments = appointments
            .filter((apt) => {
              const aptDate = new Date(apt.date);
              return aptDate >= now && apt.status !== "CANCELLED";
            })
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

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
        return patient;
      });

      setPatients(updatedPatients);
      setCurrentPage(1);
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
    loadPatients();
  };

  const updateStats = (patients: Patient[]) => {
    const total = patients.length;
    const active = patients.filter((p) => p.status === "active").length;
    const critical = patients.filter((p) => p.status === "critical").length;
    setStatsData([
      {
        title: "Total Patients",
        value: total.toString(),
        color: "teal",
        icon: <Users />,
      },
      {
        title: "Active Cases",
        value: active.toString(),
        color: "emerald",
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
          setTotalItems(updated.length);
          updateStats(updated);
          if (currentPage > 1 && updated.length <= (currentPage - 1) * itemsPerPage) {
            setCurrentPage(currentPage - 1);
          }
          return updated;
        });

        toast.success(response.message);
      } else {
        console.log("⚠️ FAILED BLOCK");

        if (response.code === '23503' || response.detail?.includes('still referenced')) {
          const tableMatch = response.detail?.match(/table "([^"]+)"/);
          const tableName = tableMatch ? tableMatch[1] : '';

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

          console.error('Delete failed - Foreign key constraint:', {
            code: response.code,
            detail: response.detail,
            constraint: response.constraint
          });
        } else if (response.message?.includes('not found') || response.code === '404') {
          toast.error('Patient not found. It may have been already deleted.');
          loadPatients();
        } else {
          toast.error(response.message || "Failed to delete patient");
        }
      }
    } catch (error: any) {
      console.log("❌ CATCH BLOCK TRIGGERED");
      console.error("❌ ERROR:", error);

      if (error?.response?.data) {
        const errorData = error.response.data;

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
      } else if (error?.message === 'Network Error') {
        toast.error('Network error. Please check your connection.');
      } else {
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

  // Pagination calculations
  const totalFilteredItems = filteredPatients.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredItems);
  const currentItems = filteredPatients.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const tableElement = document.querySelector('.table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (startPage > 1) {
        pageNumbers.unshift('...');
        pageNumbers.unshift(1);
      }
      
      if (endPage < totalPages) {
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case "active":
          return {
            bg: "bg-[#EAF7F4] dark:bg-[#1F8F89]/20",
            text: "text-[#1F8F89] dark:text-[#2BB2A7]",
            dot: "bg-[#2BB2A7]",
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

  const getStatColor = (color: string) => {
    switch (color) {
      case "teal":
        return "bg-[#EAF7F4] dark:bg-[#1F8F89]/20 text-[#2BB2A7] dark:text-[#2BB2A7]";
      case "emerald":
        return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
      case "red":
        return "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400";
      case "amber":
        return "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
      default:
        return "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
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
                      className="flex items-center justify-center gap-1.5 rounded-lg h-9 md:h-10 px-3 md:px-4 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white text-sm font-semibold shadow-lg shadow-[#2BB2A7]/20 hover:opacity-90 transition-all w-full md:w-auto"
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
                      className="flex flex-col justify-between rounded-xl p-5 bg-white dark:bg-slate-900 border border-[#E2EFEA] dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
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
                        <div className={`p-3 rounded-lg ${getStatColor(stat.color)}`}>
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
                        className="text-xs text-[#2BB2A7] hover:text-[#1F8F89] font-medium"
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
                              ? "bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white shadow-lg shadow-[#2BB2A7]/25"
                              : "bg-white/80 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-slate-400/30 dark:hover:border-slate-600"
                          }
                        `}
                        onClick={() => setSelectedFilter(filter.label)}
                      >
                        {selectedFilter === filter.label && (
                          <div className="absolute inset-0 rounded-full border-2 border-[#2BB2A7]/30 animate-pulse"></div>
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

                  {/* Patients Table */}
                  {!loading && !error && (
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#E2EFEA] dark:border-slate-800 overflow-hidden shadow-sm table-container">
                      <div className="overflow-x-auto">
                        <div className="min-w-[1000px]">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-[#F4F9F7] dark:bg-slate-800/50 border-b border-[#E2EFEA] dark:border-slate-700">
                                <th className="px-4 py-3 text-[#1F8F89] dark:text-[#2BB2A7] text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-[#E2EFEA] dark:border-slate-700">
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

                                <th className="px-4 py-3 text-[#1F8F89] dark:text-[#2BB2A7] text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-[#E2EFEA] dark:border-slate-700">
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
                                <th className="px-4 py-3 text-[#1F8F89] dark:text-[#2BB2A7] text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-[#E2EFEA] dark:border-slate-700">
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
                                <th className="px-4 py-3 text-[#1F8F89] dark:text-[#2BB2A7] text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-[#E2EFEA] dark:border-slate-700">
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
                                <th className="px-4 py-3 text-[#1F8F89] dark:text-[#2BB2A7] text-sm font-bold uppercase tracking-wider text-right whitespace-nowrap">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentItems.length > 0 ? (
                                currentItems.map((patient) => (
                                  <tr
                                    key={patient.id}
                                    className="border-b border-[#E2EFEA] dark:border-slate-700 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 transition-colors cursor-pointer"
                                    onClick={() =>
                                      router.push(
                                        `/admin/patientmanagement/${patient.id}`,
                                      )
                                    }
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap border-r border-[#E2EFEA] dark:border-slate-700">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2BB2A7] to-[#86C94C] bg-cover bg-center ring-2 ring-[#2BB2A7]/30 dark:ring-[#2BB2A7]/20 flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm"
                                          style={{
                                            backgroundImage: patient.avatarUrl.includes('ui-avatars') 
                                              ? `url(${patient.avatarUrl})` 
                                              : "none",
                                          }}
                                        >
                                          {!patient.avatarUrl.includes('ui-avatars') && patient.name.charAt(0)}
                                        </div>
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

                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap border-r border-[#E2EFEA] dark:border-slate-700">
                                      {patient.lastVisit}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap border-r border-[#E2EFEA] dark:border-slate-700">
                                      {patient.nextAppointment}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap border-r border-[#E2EFEA] dark:border-slate-700">
                                      <StatusBadge status={patient.status} />
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-[#2BB2A7] dark:hover:text-[#2BB2A7] hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20 rounded-lg transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(
                                              `/admin/addnewpatient?patientId=${patient.id}`,
                                            );
                                          }}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20 rounded-lg transition-colors"
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
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                    No patients found matching your filters
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      {/* Pagination Controls */}
                      <div className="px-4 py-3 border-t border-[#E2EFEA] dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span>
                            Showing {startIndex + 1} to {endIndex} of {totalFilteredItems} patients
                          </span>
                          <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="px-2 py-1 border border-[#E2EFEA] dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                          <span>per page</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                              currentPage === 1
                                ? "border-[#E2EFEA] dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                                : "border-[#E2EFEA] dark:border-slate-600 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          
                          {getPageNumbers().map((page, index) => (
                            <button
                              key={index}
                              onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                              className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                                page === currentPage
                                  ? "bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white border-transparent"
                                  : typeof page === 'number'
                                  ? "border-[#E2EFEA] dark:border-slate-600 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 text-slate-700 dark:text-slate-300"
                                  : "border-transparent text-slate-500 dark:text-slate-400 cursor-default"
                              }`}
                              disabled={typeof page !== 'number'}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                              currentPage === totalPages || totalPages === 0
                                ? "border-[#E2EFEA] dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                                : "border-[#E2EFEA] dark:border-slate-600 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <ChevronRight className="w-4 h-4" />
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