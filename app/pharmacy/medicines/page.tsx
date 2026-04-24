"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Power,
  Filter,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Sidebar from "@/components/pharmacy/Sidebar";
import { medicinesApi } from '@/lib/api/medicinesApi';
import { toast } from 'sonner';
import MedicineImport from '@/components/pharmacy/MedicineImport';
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, PHARMACY_FEATURES } from "@/lib/feature";

// Categories
const categories = [
  "Antibiotics",
  "Pain Relief",
  "Cardiovascular",
  "Diabetes",
  "Respiratory",
  "Gastrointestinal",
];

export default function MedicineListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [confirmModal, setConfirmModal] = useState<string | null>(null);
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isMedicineEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.PHARMACY,
  PHARMACY_FEATURES.MEDICINE
);


useEffect(() => {
  if (!tenantLoading && !isMedicineEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading,isMedicineEnabled,router]);
  // Fetch medicines – memoized with useCallback
  const fetchMedicines = useCallback(async () => {
 

    setLoading(true);

    try {
      const params: any = {};
      if (search) params.search = search;
      if (categoryFilter !== 'all') params.category = categoryFilter;

  

      const response = await medicinesApi.getMedicines(params);

   

      // Handle different response shapes
      let medicinesArray = [];

      if (Array.isArray(response.data)) {
     
        medicinesArray = response.data;
      } else if (response.data?.success && Array.isArray(response.data.data)) {
      
        medicinesArray = response.data.data;
      } else {
       
        setError('Failed to load medicines');
        setLoading(false);
        return;
      }

      const mapped = medicinesArray.map((item: any) => {
    
        return {
          id: item.id.toString(),
          name: item.name,
          generic: item.generic_name,
          brand: item.brand_name,
          category: item.category,
          unit: item.unit,
          sellingPrice: parseFloat(item.selling_price) || 0,
          taxPercent: parseFloat(item.tax_percent) || 0,
          isActive: item.is_active,
        };
      });

   

      setMeds(mapped);
      setError(null);
    } catch (err) {
      console.error('🔥 Fetch medicines error:', err);
      setError('An error occurred');
    } finally {
      console.log('⏹️ Loading finished');
      setLoading(false);
    }
  }, [search, categoryFilter]); // Dependencies – re‑create when search or category changes

  // Initial fetch
  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // Client‑side filtering
  const filtered = meds.filter((m) => {
    const searchLower = search.toLowerCase();

    const nameMatch = m.name && m.name.toLowerCase().includes(searchLower);
    const brandMatch = m.brand && m.brand.toLowerCase().includes(searchLower);
    const genericMatch = m.generic && m.generic.toLowerCase().includes(searchLower);

    const matchSearch = search === '' || nameMatch || brandMatch || genericMatch;

    const matchCategory = categoryFilter === 'all' || m.category === categoryFilter;

    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'active' ? m.isActive : !m.isActive);



    return matchSearch && matchCategory && matchStatus;
  });

  // Toggle active status
  const handleToggle = async (id: string) => {
    try {
      const medicine = meds.find(m => m.id === id);
      if (!medicine) return;

      console.log('🔄 Toggling status for:', medicine.name, 'current active:', medicine.isActive);

      const response = await medicinesApi.updateMedicine(Number(id), {
        isActive: !medicine.isActive
      });

      console.log('📥 Full response object:', response);
      console.log('📥 response.data:', response?.data);

      // Check both possibilities – using type assertion for the second to avoid TypeScript error
      const isSuccess = response?.data?.success === true || (response as any)?.success === true;
      const errorMsg = response?.data?.message || (response as any)?.message || 'Failed to update status';

      if (isSuccess) {
        // Optimistically update local state
        setMeds(prev =>
          prev.map(m => (m.id === id ? { ...m, isActive: !m.isActive } : m))
        );
        toast.success(`Medicine ${medicine.isActive ? 'deactivated' : 'activated'} successfully`);
      } else {
        console.error('❌ Update failed – isSuccess false, errorMsg:', errorMsg);
        console.error('Actual response structure:', response);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('🔥 Update error:', error);
      toast.error(error?.response?.data?.message || 'An error occurred');
    } finally {
      setConfirmModal(null);
    }
  };

  if (!tenantLoading && !isMedicineEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Pharmacy Medicine feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col w-full lg:ml-0 min-w-0">
        <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center px-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 lg:hidden"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Medicine Master
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
               
              
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchMedicines} disabled={loading}>
                  {loading ? "Loading..." : "Refresh"}
                </Button>
                  <MedicineImport onSuccess={fetchMedicines} />
                <Button
                  onClick={() => router.push("/pharmacy/medicines/add")}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              </div>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex flex-wrap items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search name, brand, generic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value: any) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Filters */}
            <div className="md:hidden">
              <Button
                variant="outline"
                className="w-full mb-3"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showMobileFilters ? "Hide Filters" : "Show Filters"}
              </Button>

              {showMobileFilters && (
                <Card className="mb-4">
                  <CardContent className="p-4 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={statusFilter}
                      onValueChange={(value: any) => setStatusFilter(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3">Medicine Name</th>
                      <th className="px-6 py-3">Generic</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Unit</th>
                      <th className="px-6 py-3">Selling Price</th>
                      <th className="px-6 py-3">Tax %</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {m.name}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {m.generic}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          >
                            {m.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {m.unit}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          ₹{m.sellingPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {m.taxPercent}%
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={
                              m.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }
                          >
                            {m.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                router.push(`/pharmacy/medicines/${m.id}`)
                              }
                            >
                              <Edit2 className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setConfirmModal(m.id)}
                            >
                              <Power
                                className={`h-4 w-4 ${m.isActive ? "text-red-500" : "text-green-500"}`}
                              />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((m) => (
                <Card key={m.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {m.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {m.generic}
                        </p>
                      </div>
                      <Badge
                        className={
                          m.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }
                      >
                        {m.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Category
                        </p>
                        <Badge
                          variant="outline"
                          className="mt-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        >
                          {m.category}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Unit
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {m.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Price
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          ₹{m.sellingPrice.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Tax
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {m.taxPercent}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => router.push(`/pharmacy/medicines/${m.id}`)}
                      >
                        <Edit2 className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 ${m.isActive ? "text-red-600" : "text-green-600"}`}
                        onClick={() => setConfirmModal(m.id)}
                      >
                        <Power className="h-4 w-4 mr-1" />
                        {m.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No medicines found matching your filters
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Confirm Modal */}
            <Dialog open={!!confirmModal} onOpenChange={() => setConfirmModal(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirm Status Change</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to{" "}
                  {meds.find((m) => m.id === confirmModal)?.isActive
                    ? "deactivate"
                    : "activate"}{" "}
                  this medicine?
                </p>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmModal(null)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={
                      meds.find((m) => m.id === confirmModal)?.isActive
                        ? "destructive"
                        : "default"
                    }
                    onClick={() => confirmModal && handleToggle(confirmModal)}
                    className="w-full sm:w-auto"
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}