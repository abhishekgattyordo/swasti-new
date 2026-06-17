"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Users, UserCheck, UserX, FileCheck, 
  Eye, Edit, Trash2, Plus, Loader2, Save, X, Building2, Menu
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
  wardId?: number | null;
  wardName?: string;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "bg-[#EAF7F4] dark:bg-[#1F8F89]/20", text: "text-[#1F8F89] dark:text-[#2BB2A7]", dot: "bg-[#2BB2A7]" };
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
  const [wards, setWards] = useState<any[]>([]);
  
  // Inline editing states
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
  const [editingWardId, setEditingWardId] = useState<number | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);

  const router = useRouter();

  // Fetch wards
  const fetchWards = async () => {
    try {
      const response = await fetch('/api/bed-config/wards');
      const result = await response.json();
      if (result?.success && result?.data) {
        setWards(result.data);
      } else if (Array.isArray(result)) {
        setWards(result);
      } else if (result?.data) {
        setWards(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch wards:', err);
    }
  };

  // Fetch all staff
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await staffApi.getAllStaff();
      console.log("Staff data fetched:", response);

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
        wardId: s.ward_id || null,
        wardName: s.ward_name || null,
      }));

      setStaff(mappedData);
      
      const roles = [...new Set(mappedData.map((s: Staff) => s.role))] as string[];
      setRoleOptions(roles);

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
    fetchWards();
  }, []);

  // Quick update staff field (status or ward)
  const quickUpdateStaff = async (staffId: number, field: string, value: any) => {
    setSavingField(`${field}-${staffId}`);
    try {
      const payload: any = {};
      if (field === 'status') {
        payload.status = value;
      } else if (field === 'wardId') {
        payload.wardId = value;
      }

      const response = await staffApi.updateStaff(staffId, payload);
      
      if (response?.success) {
        // Update local state
        setStaff(prev => prev.map(s => {
          if (s.id === staffId) {
            if (field === 'status') {
              return { ...s, status: value };
            } else if (field === 'wardId') {
              const ward = wards.find(w => w.id === parseInt(value));
              return { ...s, wardId: value ? parseInt(value) : null, wardName: ward?.name || null };
            }
          }
          return s;
        }));
        toast.success(`${field === 'status' ? 'Status' : 'Ward'} updated successfully`);
      } else {
        toast.error(response?.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSavingField(null);
      setEditingStatusId(null);
      setEditingWardId(null);
    }
  };

  // Stats Calculation
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === "active").length;
  const onLeaveStaff = staff.filter(s => s.status === "on-leave").length;
  const inactiveStaff = staff.filter(s => s.status === "inactive").length;

  const statsData = [
    { title: "Total Staff", value: totalStaff.toString(), color: "teal", icon: Users },
    { title: "Active Now", value: activeStaff.toString(), color: "emerald", icon: UserCheck },
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
      
      await staffApi.deleteStaff(id);
      
      setStaff(prev => prev.filter(s => s.id !== id));
      
      toast.dismiss(toastId);
      toast.success(`${name} has been deleted successfully`);
      
    } catch (err: any) {
      console.error("Delete failed:", err);
      
      if (err.response?.status === 404) {
        toast.error("Staff member not found");
        fetchStaff();
      } else {
        toast.error(err.response?.data?.message || err.message || "Failed to delete staff member");
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

  const getStatColor = (color: string) => {
    switch (color) {
      case "teal":
        return "bg-[#EAF7F4] dark:bg-[#1F8F89]/20 text-[#2BB2A7] dark:text-[#2BB2A7]";
      case "emerald":
        return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
      case "amber":
        return "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
      case "red":
        return "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400";
      default:
        return "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2BB2A7] mx-auto" />
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
            <Button onClick={fetchStaff} className="bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white">
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
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white rounded-full shadow-lg transition-all duration-200"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Staff Management</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Manage hospital staff members and their information
                </p>
              </div>

              <Button 
                onClick={() => router.push("/admin/addnewstaff")}
                className="bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 flex items-center gap-2 text-white shadow-lg shadow-[#2BB2A7]/20"
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
                  <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-[#E2EFEA] dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{stat.title}</p>
                        <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${getStatColor(stat.color)}`}>
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

              <input
                type="text"
                placeholder="Search by name, email, role, department or employee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-[#E2EFEA] dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent text-gray-900 dark:text-white"
              />

              <div className="flex flex-wrap gap-2">
                {filterButtons.map((filter) => (
                  <button
                    key={filter.label}
                    onClick={() => setSelectedRole(filter.label)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filter.isActive
                        ? "bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white shadow-md"
                        : "bg-white dark:bg-slate-800 border border-[#E2EFEA] dark:border-slate-700 hover:border-[#2BB2A7]"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#E2EFEA] dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#F4F9F7] dark:bg-slate-800/50 border-b border-[#E2EFEA] dark:border-slate-700">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1F8F89] dark:text-[#2BB2A7] border-r border-[#E2EFEA] dark:border-slate-700">Staff Member</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1F8F89] dark:text-[#2BB2A7] border-r border-[#E2EFEA] dark:border-slate-700">Employee ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1F8F89] dark:text-[#2BB2A7] border-r border-[#E2EFEA] dark:border-slate-700">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1F8F89] dark:text-[#2BB2A7] border-r border-[#E2EFEA] dark:border-slate-700">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1F8F89] dark:text-[#2BB2A7] border-r border-[#E2EFEA] dark:border-slate-700">Ward</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1F8F89] dark:text-[#2BB2A7] border-r border-[#E2EFEA] dark:border-slate-700">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1F8F89] dark:text-[#2BB2A7] border-r border-[#E2EFEA] dark:border-slate-700">Joined</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1F8F89] dark:text-[#2BB2A7] border-r border-[#E2EFEA] dark:border-slate-700">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[#1F8F89] dark:text-[#2BB2A7]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.length > 0 ? (
                      filteredStaff.map((member, index) => (
                        <tr
                          key={member.id}
                          className={`hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 transition-all duration-200 border-b border-[#E2EFEA] dark:border-slate-700 ${
                            index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'
                          }`}
                        >
                          {/* Staff Member */}
                          <td className="px-4 py-3 border-r border-[#E2EFEA] dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#2BB2A7] to-[#86C94C] flex-shrink-0 overflow-hidden border border-[#2BB2A7]/30 flex items-center justify-center text-white font-semibold text-xs">
                                {member.avatar ? (
                                  <img src={member.avatar} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <span>{member.firstName[0]}{member.lastName[0]}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-900 dark:text-white">{member.firstName} {member.lastName}</p>
                                <p className="text-xs text-slate-500">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Employee ID */}
                          <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300 border-r border-[#E2EFEA] dark:border-slate-700">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{member.employeeId}</span>
                          </td>
                          
                          {/* Role */}
                          <td className="px-4 py-3 border-r border-[#E2EFEA] dark:border-slate-700">
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-[#EAF7F4] text-[#1F8F89] dark:bg-[#1F8F89]/20 dark:text-[#2BB2A7] text-xs font-medium">
                              {member.role}
                            </span>
                          </td>
                          
                          {/* Department */}
                          <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 border-r border-[#E2EFEA] dark:border-slate-700">
                            {member.department}
                          </td>
                          
                          {/* Ward - EDITABLE */}
                          <td className="px-4 py-3 border-r border-[#E2EFEA] dark:border-slate-700" onClick={e => e.stopPropagation()}>
                            {editingWardId === member.id ? (
                              <div className="flex items-center gap-1">
                                <select
                                  defaultValue={member.wardId || ''}
                                  onChange={(e) => quickUpdateStaff(member.id, 'wardId', e.target.value)}
                                  className="w-full px-1 py-0.5 text-xs border border-[#2BB2A7] rounded bg-white dark:bg-slate-800 focus:ring-1 focus:ring-[#2BB2A7] text-gray-900 dark:text-white"
                                  autoFocus
                                >
                                  <option value="">None</option>
                                  {wards.map((ward: any) => (
                                    <option key={ward.id} value={ward.id}>{ward.name}</option>
                                  ))}
                                </select>
                                <button onClick={() => setEditingWardId(null)} className="p-0.5 hover:bg-gray-200 rounded">
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="flex items-center gap-1 cursor-pointer hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 rounded px-1 py-0.5 group"
                                onClick={() => setEditingWardId(member.id)}
                              >
                                {savingField === `wardId-${member.id}` ? (
                                  <Loader2 size={12} className="animate-spin text-[#2BB2A7]" />
                                ) : member.wardName ? (
                                  <span className="text-xs flex items-center gap-1">
                                    <Building2 size={10} className="text-slate-400" />
                                    {member.wardName}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Not assigned</span>
                                )}
                                <Edit size={10} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </td>
                          
                          {/* Contact */}
                          <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 border-r border-[#E2EFEA] dark:border-slate-700">
                            {member.phone}
                          </td>
                          
                          {/* Date Joined */}
                          <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 border-r border-[#E2EFEA] dark:border-slate-700">
                            {member.dateJoined}
                          </td>
                          
                          {/* Status - EDITABLE */}
                          <td className="px-4 py-3 border-r border-[#E2EFEA] dark:border-slate-700" onClick={e => e.stopPropagation()}>
                            {editingStatusId === member.id ? (
                              <div className="flex items-center gap-1">
                                <select
                                  defaultValue={member.status}
                                  onChange={(e) => quickUpdateStaff(member.id, 'status', e.target.value)}
                                  className="w-full px-1 py-0.5 text-xs border border-[#2BB2A7] rounded bg-white dark:bg-slate-800 focus:ring-1 focus:ring-[#2BB2A7] text-gray-900 dark:text-white"
                                  autoFocus
                                >
                                  <option value="active">Active</option>
                                  <option value="on-leave">On Leave</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                                <button onClick={() => setEditingStatusId(null)} className="p-0.5 hover:bg-gray-200 rounded">
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="cursor-pointer hover:opacity-80"
                                onClick={() => setEditingStatusId(member.id)}
                              >
                                {savingField === `status-${member.id}` ? (
                                  <Loader2 size={14} className="animate-spin text-[#2BB2A7]" />
                                ) : (
                                  <StatusBadge status={member.status} />
                                )}
                              </div>
                            )}
                          </td>
                          
                          {/* Actions */}
                          <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20 text-[#2BB2A7] hover:text-[#1F8F89]"
                                onClick={() => router.push(`/admin/staffmanagement/edit/${member.id}`)}
                                title="Edit Staff"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
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
                        <td colSpan={9} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                              <Users className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                            </div>
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No staff members found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="border-t border-[#E2EFEA] dark:border-slate-700 bg-[#F4F9F7] dark:bg-slate-800/50 px-6 py-3">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Showing {filteredStaff.length} of {staff.length} staff members</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2BB2A7]"></span>
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