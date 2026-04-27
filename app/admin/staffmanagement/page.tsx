"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  UserCheck,
  UserX,
  FileCheck,
  Eye,
  Edit,
  Trash2,
  Filter,
  Plus,
  Loader2,
} from "lucide-react";

// shadcn/ui components
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
import { Menu, X } from "lucide-react";
import { toast } from "sonner";

// Staff type definition
export interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  role: string;
  department: string;
  phone: string;
  dateJoined: string;
  status: "active" | "on-leave" | "inactive";
  employeeId: string;
  qualifications: string[];
  experience: number;
}

// Mock Staff Data
const mockStaffData: Staff[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@hospital.com",
    avatar: null,
    role: "Nurse",
    department: "Emergency",
    phone: "+1 234-567-8901",
    dateJoined: "Jan 15, 2023",
    status: "active",
    employeeId: "EMP-001",
    qualifications: ["BSN", "RN License"],
    experience: 5,
  },
  {
    id: 2,
    firstName: "Emily",
    lastName: "Johnson",
    email: "emily.johnson@hospital.com",
    avatar: null,
    role: "Receptionist",
    department: "Front Desk",
    phone: "+1 234-567-8902",
    dateJoined: "Mar 10, 2022",
    status: "active",
    employeeId: "EMP-002",
    qualifications: ["BBA", "Medical Reception Certification"],
    experience: 3,
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@hospital.com",
    avatar: null,
    role: "Lab Technician",
    department: "Laboratory",
    phone: "+1 234-567-8903",
    dateJoined: "Aug 20, 2021",
    status: "on-leave",
    employeeId: "EMP-003",
    qualifications: ["BSc MLT", "Certified Lab Technician"],
    experience: 7,
  },
  {
    id: 4,
    firstName: "Sarah",
    lastName: "Davis",
    email: "sarah.davis@hospital.com",
    avatar: null,
    role: "Pharmacist",
    department: "Pharmacy",
    phone: "+1 234-567-8904",
    dateJoined: "Nov 05, 2023",
    status: "active",
    employeeId: "EMP-004",
    qualifications: ["BPharm", "Registered Pharmacist"],
    experience: 4,
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Wilson",
    email: "david.wilson@hospital.com",
    avatar: null,
    role: "Radiology Tech",
    department: "Radiology",
    phone: "+1 234-567-8905",
    dateJoined: "Jun 30, 2020",
    status: "inactive",
    employeeId: "EMP-005",
    qualifications: ["BSc Radiology", "ARRT Certified"],
    experience: 8,
  },
  {
    id: 6,
    firstName: "Jessica",
    lastName: "Martinez",
    email: "jessica.martinez@hospital.com",
    avatar: null,
    role: "Billing Specialist",
    department: "Billing",
    phone: "+1 234-567-8906",
    dateJoined: "Feb 18, 2023",
    status: "active",
    employeeId: "EMP-006",
    qualifications: ["BCom", "Medical Billing Certification"],
    experience: 2,
  },
  {
    id: 7,
    firstName: "Robert",
    lastName: "Taylor",
    email: "robert.taylor@hospital.com",
    avatar: null,
    role: "Housekeeping",
    department: "Facilities",
    phone: "+1 234-567-8907",
    dateJoined: "Apr 12, 2019",
    status: "active",
    employeeId: "EMP-007",
    qualifications: ["High School Diploma"],
    experience: 6,
  },
  {
    id: 8,
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@hospital.com",
    avatar: null,
    role: "IT Support",
    department: "IT",
    phone: "+1 234-567-8908",
    dateJoined: "Sep 03, 2022",
    status: "active",
    employeeId: "EMP-008",
    qualifications: ["BSc IT", "CompTIA A+"],
    experience: 4,
  },
];

// Stats data
const statsData = [
  {
    title: "Total Staff",
    value: "0",
    color: "blue",
    icon: Users,
  },
  {
    title: "Active Now",
    value: "0",
    color: "green",
    icon: UserCheck,
  },
  {
    title: "On Leave",
    value: "0",
    color: "amber",
    icon: UserX,
  },
  {
    title: "Inactive",
    value: "0",
    color: "red",
    icon: FileCheck,
  },
];

interface ColumnFilter {
  column: string;
  value: string;
}

// Column Filter Component
function ColumnFilter({
  column,
  placeholder = "Filter...",
  options,
  onFilter,
  currentValue,
}: {
  column: string;
  placeholder?: string;
  options?: string[];
  onFilter: (column: string, value: string) => void;
  currentValue?: string;
}) {
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
                        "[cmdk-input]"
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

// Date Range Filter Component
function DateRangeFilter({
  column,
  onFilter,
  currentRange,
}: {
  column: string;
  onFilter: (column: string, from: string, to: string) => void;
  currentRange?: { from: string; to: string };
}) {
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
          <Filter className="h-3.5 w-3.5" />
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

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          bg: "bg-green-100 dark:bg-green-900/20",
          text: "text-green-800 dark:text-green-300",
          dot: "bg-green-500",
        };
      case "on-leave":
        return {
          bg: "bg-amber-100 dark:bg-amber-900/20",
          text: "text-amber-800 dark:text-amber-300",
          dot: "bg-amber-500",
        };
      default:
        return {
          bg: "bg-slate-100 dark:bg-slate-800/50",
          text: "text-slate-700 dark:text-slate-400",
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
      <span>
        {status === "on-leave"
          ? "On Leave"
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

const StaffManagementPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [dateFilters, setDateFilters] = useState<
    Record<string, { from: string; to: string }>
  >({});
  const [staff, setStaff] = useState<Staff[]>(mockStaffData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [stats, setStats] = useState(statsData);
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Initialize filters and stats from mock data
  useEffect(() => {
    // Update stats
    const active = staff.filter((s) => s.status === "active").length;
    const onLeave = staff.filter((s) => s.status === "on-leave").length;
    const inactive = staff.filter((s) => s.status === "inactive").length;

    setStats([
      { ...statsData[0], value: staff.length.toString() },
      { ...statsData[1], value: active.toString() },
      { ...statsData[2], value: onLeave.toString() },
      { ...statsData[3], value: inactive.toString() },
    ]);

    // Extract unique roles and departments
    const roles = Array.from(new Set(staff.map((s) => s.role))) as string[];
    const departments = Array.from(new Set(staff.map((s) => s.department))) as string[];
    setRoleOptions(roles.sort());
    setDepartmentOptions(departments.sort());
  }, []);

  // Delete staff handler
  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    setStaff((prev) => prev.filter((s) => s.id !== id));
    toast.success("Staff member deleted successfully");

    // Update stats after deletion
    const active = staff.filter((s) => s.id !== id && s.status === "active").length;
    const onLeave = staff.filter((s) => s.id !== id && s.status === "on-leave").length;
    const inactive = staff.filter((s) => s.id !== id && s.status === "inactive").length;

    setStats([
      { ...statsData[0], value: (staff.length - 1).toString() },
      { ...statsData[1], value: active.toString() },
      { ...statsData[2], value: onLeave.toString() },
      { ...statsData[3], value: inactive.toString() },
    ]);
  };

  // Filter staff
  const filteredStaff = staff.filter((staffMember) => {
    const fullName = `${staffMember.firstName} ${staffMember.lastName}`;
    const matchesSearch =
      searchQuery === "" ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRole === "All Roles" || staffMember.role === selectedRole;

    const matchesColumnFilters = columnFilters.every((filter) => {
      const value = staffMember[filter.column as keyof Staff];
      return value
        ?.toString()
        .toLowerCase()
        .includes(filter.value.toLowerCase());
    });

    // Date range filter for dateJoined
    const dateRange = dateFilters.dateJoined;
    let matchesDateRange = true;
    if (dateRange && (dateRange.from || dateRange.to)) {
      const staffDate = new Date(staffMember.dateJoined);
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        if (staffDate < fromDate) matchesDateRange = false;
      }
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        if (staffDate > toDate) matchesDateRange = false;
      }
    }

    return (
      matchesSearch &&
      matchesRole &&
      matchesColumnFilters &&
      matchesDateRange
    );
  });

  // Build filter buttons
  const filterButtons = [
    {
      label: "All Roles",
      isActive: selectedRole === "All Roles",
    },
    ...roleOptions.map((role) => ({
      label: role,
      isActive: selectedRole === role,
    })),
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex items-center justify-center text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
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

      {/* Main Content Area */}
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
                      Staff Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
                      Central hub for staff credentials, status updates,
                      and administrative workflow.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <button
                      onClick={() => router.push("/admin/addnewstaff")}
                      className="flex items-center justify-center gap-1.5 rounded-lg h-9 md:h-10 px-3 md:px-4 bg-[#137fec] text-white text-sm font-semibold shadow-lg shadow-[#137fec]/20 hover:bg-[#137fec]/90 transition-all w-full md:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Staff</span>
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={index}
                        className="
                          flex flex-col justify-between
                          rounded-xl
                          p-4 md:p-5
                          bg-white dark:bg-slate-900
                          border border-slate-200 dark:border-slate-800
                          shadow-sm hover:shadow-md
                          transition-all duration-200
                        "
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium mb-1">
                              {stat.title}
                            </p>
                            <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                              {stat.value}
                            </p>
                          </div>

                          <div
                            className={`p-2 md:p-3 rounded-lg ${
                              stat.color === "blue"
                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : stat.color === "green"
                                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                  : stat.color === "amber"
                                    ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                    : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            <Icon className="w-5 h-5 md:w-6 md:h-6" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filters and Table Section */}
              <div className="flex flex-col gap-4 md:gap-5">
                <div className="flex-1 flex flex-col gap-3 md:gap-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        STAFF FILTERS
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

                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by name, email, role, department, or employee ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec] focus:border-transparent"
                      />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {filterButtons.map((filter) => (
                        <button
                          key={filter.label}
                          className={`
                            group
                            relative
                            flex
                            items-center
                            justify-center
                            gap-x-1.5
                            h-8 md:h-9
                            rounded-full
                            px-3 md:px-4
                            text-xs md:text-sm
                            font-medium
                            transition-all
                            duration-300
                            backdrop-blur-sm
                            whitespace-nowrap
                            ${
                              filter.isActive
                                ? "bg-gradient-to-r from-[#137fec] to-blue-500 text-white shadow-lg shadow-blue-500/25"
                                : "bg-white/80 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-slate-400/30 dark:hover:border-slate-600"
                            }
                          `}
                          onClick={() => setSelectedRole(filter.label)}
                        >
                          {filter.isActive && (
                            <div className="absolute inset-0 rounded-full border-2 border-blue-300/30 animate-pulse"></div>
                          )}
                          <span>{filter.label}</span>
                          {!filter.isActive && (
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs">
                              →
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Staff Table with Column Filters */}
                  <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <div className="min-w-[800px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-300 dark:border-slate-700">
                              <th className="px-3 md:px-4 py-3 text-slate-900 dark:text-white text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                                <div className="flex items-center">
                                  Staff Name
                                  <ColumnFilter
                                    column="name"
                                    placeholder="Filter by name..."
                                    onFilter={(col, val) => {
                                      setColumnFilters((prev) => {
                                        const filtered = prev.filter(
                                          (f) => f.column !== col
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
                                        (f) => f.column === "name"
                                      )?.value
                                    }
                                  />
                                </div>
                              </th>
                              <th className="px-3 md:px-4 py-3 text-slate-900 dark:text-white text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                                <div className="flex items-center">
                                  Employee ID
                                  <ColumnFilter
                                    column="employeeId"
                                    placeholder="Filter by ID..."
                                    onFilter={(col, val) => {
                                      setColumnFilters((prev) => {
                                        const filtered = prev.filter(
                                          (f) => f.column !== col
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
                                        (f) => f.column === "employeeId"
                                      )?.value
                                    }
                                  />
                                </div>
                              </th>
                              <th className="px-3 md:px-4 py-3 text-slate-900 dark:text-white text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                                <div className="flex items-center">
                                  Role
                                  <ColumnFilter
                                    column="role"
                                    options={roleOptions}
                                    onFilter={(col, val) => {
                                      setColumnFilters((prev) => {
                                        const filtered = prev.filter(
                                          (f) => f.column !== col
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
                                        (f) => f.column === "role"
                                      )?.value
                                    }
                                  />
                                </div>
                              </th>
                              <th className="px-3 md:px-4 py-3 text-slate-900 dark:text-white text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                                <div className="flex items-center">
                                  Department
                                  <ColumnFilter
                                    column="department"
                                    options={departmentOptions}
                                    onFilter={(col, val) => {
                                      setColumnFilters((prev) => {
                                        const filtered = prev.filter(
                                          (f) => f.column !== col
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
                                        (f) => f.column === "department"
                                      )?.value
                                    }
                                  />
                                </div>
                              </th>
                              <th className="px-3 md:px-4 py-3 text-slate-900 dark:text-white text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                                <div className="flex items-center">
                                  Contact
                                  <ColumnFilter
                                    column="phone"
                                    placeholder="Filter by phone..."
                                    onFilter={(col, val) => {
                                      setColumnFilters((prev) => {
                                        const filtered = prev.filter(
                                          (f) => f.column !== col
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
                                        (f) => f.column === "phone"
                                      )?.value
                                    }
                                  />
                                </div>
                              </th>
                              <th className="px-3 md:px-4 py-3 text-slate-900 dark:text-white text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                                <div className="flex items-center">
                                  Date Joined
                                  <DateRangeFilter
                                    column="dateJoined"
                                    onFilter={(col, from, to) => {
                                      setDateFilters((prev) => ({
                                        ...prev,
                                        [col]: { from, to },
                                      }));
                                    }}
                                    currentRange={dateFilters.dateJoined}
                                  />
                                </div>
                              </th>
                              <th className="px-3 md:px-4 py-3 text-slate-900 dark:text-white text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                                <div className="flex items-center">
                                  Status
                                  <ColumnFilter
                                    column="status"
                                    options={["active", "on-leave", "inactive"]}
                                    onFilter={(col, val) => {
                                      setColumnFilters((prev) => {
                                        const filtered = prev.filter(
                                          (f) => f.column !== col
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
                                        (f) => f.column === "status"
                                      )?.value
                                    }
                                  />
                                </div>
                              </th>
                              <th className="px-3 md:px-4 py-3 text-slate-900 dark:text-white text-xs md:text-sm font-bold uppercase tracking-wider text-right whitespace-nowrap">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStaff.map((staffMember) => (
                              <tr
                                key={staffMember.id}
                                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                onClick={() =>
                                  router.push(
                                    `/admin/staffmanagement/${staffMember.id}`
                                  )
                                }
                              >
                                <td className="px-3 md:px-4 py-3 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                                  <div className="flex items-center gap-2 md:gap-3">
                                    <div
                                      className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-200 bg-cover bg-center ring-2 ring-slate-100 dark:ring-slate-800 flex-shrink-0"
                                      style={{
                                        backgroundImage: staffMember.avatar
                                          ? `url(${staffMember.avatar})`
                                          : "url('/placeholder-avatar.png')",
                                      }}
                                    ></div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-slate-900 dark:text-white font-semibold text-sm md:text-base truncate">
                                        {staffMember.firstName} {staffMember.lastName}
                                      </span>
                                      <span className="text-slate-500 text-xs md:text-sm truncate">
                                        {staffMember.email}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 md:px-4 py-3 text-slate-600 dark:text-slate-400 text-xs md:text-sm font-mono whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                                  {staffMember.employeeId}
                                </td>
                                <td className="px-3 md:px-4 py-3 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs md:text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300`}
                                  >
                                    {staffMember.role}
                                  </span>
                                </td>
                                <td className="px-3 md:px-4 py-3 text-slate-600 dark:text-slate-400 text-xs md:text-sm whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                                  {staffMember.department}
                                </td>
                                <td className="px-3 md:px-4 py-3 text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium font-mono whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                                  <div className="truncate max-w-[120px] md:max-w-none">
                                    {staffMember.phone}
                                  </div>
                                </td>
                                <td className="px-3 md:px-4 py-3 text-slate-600 dark:text-slate-400 text-xs md:text-sm whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                                  {staffMember.dateJoined}
                                </td>
                                <td className="px-3 md:px-4 py-3 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                                  <StatusBadge status={staffMember.status} />
                                </td>
                                <td className="px-3 md:px-4 py-3 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1 md:gap-2">
                                    <button
                                      className="p-1 md:p-1.5 text-slate-600 dark:text-slate-400 hover:text-[#137fec] dark:hover:text-[#137fec] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                      title="View"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                          `/admin/staffmanagement/${staffMember.id}`
                                        );
                                      }}
                                    >
                                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                    <button
                                      className="p-1 md:p-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                      title="Edit"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                          `/admin/staffmanagement/edit/${staffMember.id}`
                                        );
                                      }}
                                    >
                                      <Edit className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                    <button
                                      className="p-1 md:p-1.5 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                      title="Delete"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(
                                          staffMember.id,
                                          `${staffMember.firstName} ${staffMember.lastName}`
                                        );
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pagination */}
                    <div className="px-3 md:px-4 py-3 border-t border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="text-xs md:text-sm text-slate-500 font-medium">
                        Showing 1 to {filteredStaff.length} of{" "}
                        {staff.length} entries
                      </span>
                      <div className="flex gap-1 md:gap-2">
                        <button className="px-2 md:px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-xs md:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap">
                          Previous
                        </button>
                        <button className="px-2 md:px-3 py-1.5 rounded bg-[#137fec] text-white text-xs md:text-sm font-semibold">
                          1
                        </button>
                        <button className="px-2 md:px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-xs md:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          2
                        </button>
                        <button className="px-2 md:px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-xs md:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap">
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffManagementPage;