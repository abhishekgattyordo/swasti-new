"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, Search, Loader2, Stethoscope, ChevronRight, Filter, Calendar, Clock } from "lucide-react";
import HelpDeskSidebar from "@/components/helpdesk/HelpDeskSidebar";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, HELPDESK_FEATURES } from "@/lib/feature";

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  department: string;
  status: string;
  avatar?: string;
}

export default function DoctorSlotsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

  const [filters, setFilters] = useState({
    name: "",
    department: "",
    specialty: "",
    status: "",
  });

  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isDoctorSlotsEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.HELPDESK,
    HELPDESK_FEATURES.DOCTOR_SLOTS
  );

  useEffect(() => {
    console.log("=== DOCTOR SLOTS PAGE DEBUG ===");
    console.log("1. tenantLoading:", tenantLoading);
    console.log("2. tenant:", tenant);
    console.log("3. isDoctorSlotsEnabled:", isDoctorSlotsEnabled);
    console.log("4. MODULE_KEYS.HELPDESK:", MODULE_KEYS.HELPDESK);
    console.log("5. HELPDESK_FEATURES.DOCTOR_SLOTS:", HELPDESK_FEATURES.DOCTOR_SLOTS);
  }, [tenantLoading, tenant, isDoctorSlotsEnabled]);

  useEffect(() => {
    if (!tenantLoading && !isDoctorSlotsEnabled) {
      return;
    }
  }, [tenantLoading, isDoctorSlotsEnabled, router]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/doctors');
      const data = await res.json();
      
      if (data.success) {
        setDoctors(data.data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (column: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
  };

  const clearFilter = (column: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [column]: "" }));
    setOpenFilter(null);
  };

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchesGlobalSearch = searchQuery === "" ||
      fullName.includes(searchLower) ||
      doctor.specialty?.toLowerCase().includes(searchLower) ||
      doctor.department?.toLowerCase().includes(searchLower) ||
      doctor.status?.toLowerCase().includes(searchLower);

    const matchesName = filters.name === "" ||
      fullName.includes(filters.name.toLowerCase());
    const matchesDepartment = filters.department === "" ||
      doctor.department?.toLowerCase().includes(filters.department.toLowerCase());
    const matchesSpecialty = filters.specialty === "" ||
      doctor.specialty?.toLowerCase().includes(filters.specialty.toLowerCase());
    const matchesStatus = filters.status === "" ||
      doctor.status?.toLowerCase().includes(filters.status.toLowerCase());

    return matchesGlobalSearch && matchesName && matchesDepartment && matchesSpecialty && matchesStatus;
  });

  const handleBillingClick = () => router.push('/helpdesk/billing');
  const handleRoomAvailabilityClick = () => console.log('Room Availability clicked');
  const handleDoctorSlotsClick = () => {};

  const FilterPopover = ({ column, placeholder }: { column: keyof typeof filters; placeholder: string }) => {
    const isOpen = openFilter === column;
    const value = filters[column];

    return (
      <div className="relative inline-block" ref={(el) => { filterRefs.current[column] = el; }}>
        <button
          onClick={() => setOpenFilter(isOpen ? null : column)}
          className={`ml-1 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            value ? "text-[#7A329F] dark:text-[#9B4DBF]" : "text-gray-400"
          }`}
          aria-label={`Filter by ${column}`}
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Filter by {column}
              </h4>
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => handleFilterChange(column, e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-[#7A329F] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => clearFilter(column)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpenFilter(null)}
                  className="text-xs bg-[#3B1E6F] hover:bg-[#7A329F] text-white px-3 py-1 rounded transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!tenantLoading && !isDoctorSlotsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Doctor Slots feature is not enabled for {tenant?.name}.
          </p>
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
        <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-bold text-[#3B1E6F] dark:text-white truncate">Doctor Slots</h1>
        </header>

        <button
          className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-gradient-to-r from-[#3B1E6F] to-[#7A329F] hover:from-[#7A329F] hover:to-[#0D5CB3] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold text-[#3B1E6F] dark:text-white">Doctor Slots Management</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage availability slots for doctors</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-[#3B1E6F] dark:text-[#7A329F]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Doctors</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{doctors.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Active Doctors</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {doctors.filter(d => d.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Slots Today</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">-</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name, specialty, department, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7A329F] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Doctors Table */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#3B1E6F] dark:text-[#7A329F]" />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] lg:min-w-full border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-700/30">
                      <tr>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1">
                            DOCTOR
                            <FilterPopover column="name" placeholder="Filter by name..." />
                          </div>
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1">
                            DEPARTMENT
                            <FilterPopover column="department" placeholder="Filter by department..." />
                          </div>
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1">
                            SPECIALTY
                            <FilterPopover column="specialty" placeholder="Filter by specialty..." />
                          </div>
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1">
                            STATUS
                            <FilterPopover column="status" placeholder="Filter by status..." />
                          </div>
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredDoctors.map((doctor) => (
                        <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 whitespace-nowrap">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B1E6F] to-[#7A329F] flex items-center justify-center text-white font-bold text-xs">
                                {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <Stethoscope className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{doctor.department}</span>
                            </div>
                          </td>
                          <td className="p-4 border border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{doctor.specialty}</span>
                          </td>
                          <td className="p-4 border border-gray-200 dark:border-gray-700">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              doctor.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400'
                            }`}>
                              {doctor.status}
                            </span>
                          </td>
                          <td className="p-4 border border-gray-200 dark:border-gray-700">
                            <Link href={`/helpdesk/doctor-slots/${doctor.id}`}>
                              <button className="px-3 py-1.5 bg-gradient-to-r from-[#3B1E6F] to-[#7A329F] text-white rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center gap-1 whitespace-nowrap shadow-sm">
                                Manage Slots
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredDoctors.length === 0 && (
                  <div className="text-center py-12">
                    <Stethoscope className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No doctors found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}