"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, Search, Loader2, Stethoscope, Clock, ChevronRight, Filter } from "lucide-react";
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

  // Column filter state
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


// Add this useEffect for debugging
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
}, [tenantLoading]);

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

  // Combine global search and column filters
  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    // Global search
    const matchesGlobalSearch = searchQuery === "" ||
      fullName.includes(searchLower) ||
      doctor.specialty?.toLowerCase().includes(searchLower) ||
      doctor.department?.toLowerCase().includes(searchLower) ||
      doctor.status?.toLowerCase().includes(searchLower);

    // Column filters
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

  // Filter popover component
  const FilterPopover = ({ column, placeholder }: { column: keyof typeof filters; placeholder: string }) => {
    const isOpen = openFilter === column;
    const value = filters[column];

    

    return (
      <div className="relative inline-block" ref={(el) => { filterRefs.current[column] = el; }}>
        <button
          onClick={() => setOpenFilter(isOpen ? null : column)}
          className={`ml-1 p-1 rounded-md hover:bg-gray-100 transition-colors ${value ? "text-blue-600" : "text-gray-400"}`}
          aria-label={`Filter by ${column}`}
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filter by {column}
              </h4>
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => handleFilterChange(column, e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => clearFilter(column)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpenFilter(null)}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Doctor Slots feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <HelpDeskSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onBillingClick={handleBillingClick}
        onRoomAvailabilityClick={handleRoomAvailabilityClick}
        onDoctorSlotsClick={handleDoctorSlotsClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden"> {/* Add overflow-hidden to contain children */}
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <span className="material-icons">menu</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800 truncate">Doctor Slots</h1>
        </header>

        {/* Mobile toggle button */}
        <button
          className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Main content area with vertical scroll only */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Slots Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage availability slots for doctors</p>
            </div>

            {/* Global Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name, specialty, department, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Doctors Table */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] lg:min-w-full border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                          <div className="flex items-center gap-1">
                            DOCTOR
                            <FilterPopover column="name" placeholder="Filter by name..." />
                          </div>
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                          <div className="flex items-center gap-1">
                            DEPARTMENT
                            <FilterPopover column="department" placeholder="Filter by department..." />
                          </div>
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                          <div className="flex items-center gap-1">
                            SPECIALTY
                            <FilterPopover column="specialty" placeholder="Filter by specialty..." />
                          </div>
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                          <div className="flex items-center gap-1">
                            STATUS
                            <FilterPopover column="status" placeholder="Filter by status..." />
                          </div>
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDoctors.map((doctor) => (
                        <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 border border-gray-200">
                            <div className="flex items-center gap-3 whitespace-nowrap">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                                {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                              </div>
                              <span className="font-medium text-gray-900">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 border border-gray-200">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <Stethoscope className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{doctor.department}</span>
                            </div>
                          </td>
                          <td className="p-4 border border-gray-200">
                            <span className="text-sm text-gray-600 whitespace-nowrap">{doctor.specialty}</span>
                          </td>
                          <td className="p-4 border border-gray-200">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              doctor.status === 'active' 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {doctor.status}
                            </span>
                          </td>
                          <td className="p-4 border border-gray-200">
                            <Link href={`/helpdesk/doctor-slots/${doctor.id}`}>
                              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1 whitespace-nowrap">
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
                    <p className="text-gray-500">No doctors found</p>
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