"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Users, UserCheck, UserX, FileCheck, 
  Eye, Edit, Trash2, Plus, Loader2 
} from "lucide-react";

import { staffApi } from "@/lib/api/staff";

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

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-800 dark:text-green-300", dot: "bg-green-500" };
      case "on-leave":
        return { bg: "bg-amber-100 dark:bg-amber-900/20", text: "text-amber-800 dark:text-amber-300", dot: "bg-amber-500" };
      default:
        return { bg: "bg-slate-100 dark:bg-slate-800/50", text: "text-slate-700 dark:text-slate-400", dot: "bg-slate-500" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${config.bg} ${config.text} text-xs font-medium`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
      <span>{status === "on-leave" ? "On Leave" : status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
};

const StaffManagementPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const router = useRouter();

  // Fetch all staff
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await staffApi.getAllStaff();
      console.log("Staff data fetched:", response);

      // Handle both array response and wrapped response
      const staffData = Array.isArray(response) ? response : response.data || [];
      
      const mappedData = staffData.map((s: any) => ({
        id: s.id,
        firstName: s.first_name,
        lastName: s.last_name,
        email: s.email,
        avatar: s.avatar_url,
        role: s.role,
        department: s.department,
        phone: s.phone,
        dateJoined: s.date_joined,
        status: s.status,
        employeeId: s.employee_id,
        qualifications: s.qualifications || [],
        experience: s.experience || 0,
      }));

      setStaff(mappedData);
      
      // Extract unique roles and departments for filters
      const roles = [...new Set(mappedData.map((s: Staff) => s.role))] as string[];
      const departments = [...new Set(mappedData.map((s: Staff) => s.department))] as string[];
      setRoleOptions(roles);
      setDepartmentOptions(departments);

    } catch (err: any) {
      console.error("Fetch error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load staff data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Stats Calculation
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === "active").length;
  const onLeaveStaff = staff.filter(s => s.status === "on-leave").length;
  const inactiveStaff = staff.filter(s => s.status === "inactive").length;

  const statsData = [
    { title: "Total Staff", value: totalStaff.toString(), color: "blue", icon: Users },
    { title: "Active Now", value: activeStaff.toString(), color: "green", icon: UserCheck },
    { title: "On Leave", value: onLeaveStaff.toString(), color: "amber", icon: UserX },
    { title: "Inactive", value: inactiveStaff.toString(), color: "red", icon: FileCheck },
  ];

  // Delete staff handler
  const handleDelete = async (id: number, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setDeletingId(id);

    try {
      const toastId = toast.loading(`Deleting ${name}...`);
      
      const response = await staffApi.deleteStaff(id);
      console.log('Delete response:', response);
      
      // Remove from local state immediately for better UX
      setStaff(prev => prev.filter(s => s.id !== id));
      
      toast.dismiss(toastId);
      toast.success(`${name} has been deleted successfully`, {
        description: response.message || "The staff member has been removed from the system.",
        duration: 3000,
      });
      
    } catch (err: any) {
      console.error("Delete failed:", err);
      
      // Handle specific error cases
      if (err.response?.status === 404) {
        toast.error("Staff member not found", {
          description: "They may have been already deleted. Refreshing the list...",
        });
        fetchStaff(); // Refresh the list
      } else {
        const errorMessage = err.response?.data?.message || 
                            err.message || 
                            "Failed to delete staff member";
        
        toast.error(errorMessage, {
          description: "Please try again or contact support if the issue persists.",
          duration: 5000,
        });
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Filter staff
  const filteredStaff = staff.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch = 
      searchQuery === "" ||
      fullName.includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower) ||
      member.department.toLowerCase().includes(searchLower) ||
      member.employeeId.toLowerCase().includes(searchLower);

    const matchesRole = selectedRole === "All Roles" || member.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const filterButtons = [
    { label: "All Roles", isActive: selectedRole === "All Roles" },
    ...roleOptions.map(role => ({
      label: role,
      isActive: selectedRole === role,
    })),
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#137fec] mx-auto" />
            <p className="mt-2 text-slate-500">Loading staff data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️ {error}</div>
            <Button onClick={fetchStaff} className="bg-[#137fec] hover:bg-[#137fec]/90">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-[#137fec] hover:bg-[#137fec]/90 text-white rounded-full shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <span>✕</span> : <span>☰</span>}
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Manage hospital staff members and their information
                </p>
              </div>

              <Button 
                onClick={() => router.push("/admin/addnewstaff")}
                className="bg-[#137fec] hover:bg-[#137fec]/90 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Staff
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{stat.title}</p>
                        <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        stat.color === "blue" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" :
                        stat.color === "green" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600" :
                        stat.color === "amber" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600" :
                        "bg-rose-50 dark:bg-rose-900/30 text-rose-600"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="uppercase text-xs font-bold tracking-widest text-slate-500">Filters</h3>
              </div>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search by name, email, role, department or employee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#137fec]"
              />

              {/* Role Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {filterButtons.map((filter) => (
                  <button
                    key={filter.label}
                    onClick={() => setSelectedRole(filter.label)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filter.isActive
                        ? "bg-[#137fec] text-white shadow-md"
                        : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Staff Table with Enhanced Borders */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-850 border-b-2 border-slate-300 dark:border-slate-600">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        Staff Member
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        Employee ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        Date Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.length > 0 ? (
                      filteredStaff.map((member, index) => (
                        <tr
                          key={member.id}
                          className={`hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-200 cursor-pointer border-b border-slate-200 dark:border-slate-700 ${
                            index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'
                          }`}
                          onClick={() => router.push(`/admin/staffmanagement/${member.id}`)}
                        >
                          <td className="px-6 py-4 border-r border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex-shrink-0 overflow-hidden border-2 border-blue-200 dark:border-blue-700">
                                {member.avatar ? (
                                  <img src={member.avatar} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold text-sm">
                                    {member.firstName[0]}{member.lastName[0]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{member.firstName} {member.lastName}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                              {member.employeeId}
                            </span>
                          </td>
                          <td className="px-6 py-4 border-r border-slate-200 dark:border-slate-700">
                            <span className="inline-flex px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-700">
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                            <span className="inline-flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                              {member.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {member.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {member.dateJoined}
                            </div>
                          </td>
                          <td className="px-6 py-4 border-r border-slate-200 dark:border-slate-700">
                            <StatusBadge status={member.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                             
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 hover:text-amber-700"
                                onClick={() => router.push(`/admin/staffmanagement/edit/${member.id}`)}
                                title="Edit Staff"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                                onClick={() => handleDelete(member.id, `${member.firstName} ${member.lastName}`)}
                                disabled={deletingId === member.id}
                                title="Delete Staff"
                              >
                                {deletingId === member.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-16 text-center border-t border-slate-200 dark:border-slate-700">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                              <Users className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No staff members found</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filter criteria</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer with Border */}
              <div className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-6 py-3">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Showing {filteredStaff.length} of {staff.length} staff members</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span>Active: {activeStaff}</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 ml-3"></span>
                    <span>On Leave: {onLeaveStaff}</span>
                    <span className="w-2 h-2 rounded-full bg-slate-400 ml-3"></span>
                    <span>Inactive: {inactiveStaff}</span>
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