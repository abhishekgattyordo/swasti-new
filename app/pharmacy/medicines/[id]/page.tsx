


'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, X, Menu, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/pharmacy/Sidebar';
import { medicinesApi } from '@/lib/api/medicinesApi';

const categories = [
  "Antibiotics",
  "Pain Relief",
  "Cardiovascular",
  "Diabetes",
  "Respiratory",
  "Gastrointestinal"
];

const units = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Inhaler",
  "Cream",
  "Drops",
  "Bottle"
];

export default function MedicineFormPage() {
  const router = useRouter();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // In Next.js 15, params is a Promise – we need to unwrap it
  const [id, setId] = useState<string | undefined>();
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      const rawId = resolvedParams?.id as string | undefined;
      setId(rawId);
      setIsEdit(!!rawId && rawId !== 'add');
    };
    unwrapParams();
  }, [params]);

  const [form, setForm] = useState({
    name: "",
    genericName: "",
    brandName: "",
    category: "",
    unit: "",
    purchasePrice: "",
    sellingPrice: "",
    mrp: "",
    taxPercent: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch medicine data if in edit mode
  useEffect(() => {
  if (isEdit && id && id !== 'add') {
    const fetchMedicine = async () => {
      setIsLoading(true);
      try {
        console.log('1️⃣ Fetching medicine with ID:', id);
        const response = await medicinesApi.getMedicine(parseInt(id));
        console.log('2️⃣ Full response object:', response);
        console.log('2️⃣ response.data:', response.data);

        // Handle both possible response structures
        const apiData = response.data?.data || response.data;
        const success = response.data?.success !== undefined ? response.data.success : !!apiData?.id;

        if (success && apiData && !Array.isArray(apiData)) {
          console.log('3️⃣ Raw data from API:', apiData);

          const newForm = {
            name: apiData.name || "",
            genericName: apiData.generic_name || "",
            brandName: apiData.brand_name || "",
            category: apiData.category || "",
            unit: apiData.unit || "",
            purchasePrice: apiData.purchase_price?.toString() || "",
            sellingPrice: apiData.selling_price?.toString() || "",
            mrp: apiData.mrp?.toString() || "",
            taxPercent: apiData.tax_percent?.toString() || "0",
          };
          console.log('4️⃣ Mapped form data:', newForm);

          setForm(newForm);
          // React batches state updates, so log after a short delay
          setTimeout(() => console.log('5️⃣ Form state after setForm:', form), 100);
        } else {
          console.error('❌ Invalid data received:', apiData);
          toast.error("Failed to load medicine data");
          router.push("/pharmacy/medicines");
        }
      } catch (error) {
        console.error("❌ Error fetching medicine:", error);
        toast.error("An error occurred while loading medicine data");
        router.push("/pharmacy/medicines");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedicine();
  }
}, [isEdit, id, router]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Medicine name is required";
    if (!form.category) e.category = "Category is required";
    if (!form.unit) e.unit = "Unit is required";
    if (!form.purchasePrice || isNaN(Number(form.purchasePrice))) e.purchasePrice = "Valid purchase price required";
    if (!form.sellingPrice || isNaN(Number(form.sellingPrice))) e.sellingPrice = "Valid selling price required";
    if (Number(form.sellingPrice) < Number(form.purchasePrice)) e.sellingPrice = "Must be ≥ purchase price";
    if (form.taxPercent && Number(form.taxPercent) < 0) e.taxPercent = "Cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (addAnother: boolean) => {
  if (!validate()) return;

  setIsSubmitting(true);

  const payload = {
    name: form.name,
    genericName: form.genericName || undefined,
    brandName: form.brandName || undefined,
    category: form.category,
    unit: form.unit,
    purchasePrice: parseFloat(form.purchasePrice),
    sellingPrice: parseFloat(form.sellingPrice),
    mrp: form.mrp ? parseFloat(form.mrp) : undefined,
    taxPercent: form.taxPercent ? parseFloat(form.taxPercent) : 0,
  };

  try {
    let response;
    if (isEdit && id) {
      response = await medicinesApi.updateMedicine(parseInt(id), payload);
    } else {
      response = await medicinesApi.createMedicine(payload);
    }

    console.log('Submit response:', response);

    // ✅ Check both possible locations of the success flag
    const isSuccess = response?.data?.success === true || (response as any)?.success === true;
    const message = response?.data?.message || (response as any)?.message;

    if (isSuccess) {
      toast.success(`Medicine ${isEdit ? "updated" : "saved"} successfully`, {
        description: `${form.name} has been ${isEdit ? "updated" : "added"} to the medicine master.`,
      });

      if (addAnother) {
        setForm({
          name: "",
          genericName: "",
          brandName: "",
          category: form.category,
          unit: form.unit,
          purchasePrice: "",
          sellingPrice: "",
          mrp: "",
          taxPercent: "",
        });
        setErrors({});
        toast.info("Ready for next medicine", {
          description: "You can add another medicine now.",
        });
      } else {
        router.push("/pharmacy/medicines");
      }
    } else {
      toast.error(message || "Operation failed");
    }
  } catch (error: any) {
    console.error("Submit error:", error);
    toast.error(error.response?.data?.message || "An error occurred");
  } finally {
    setIsSubmitting(false);
  }
};

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col w-full lg:ml-0 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center px-4 md:px-6">
            <div className="flex items-center gap-3">
              {/* Spacer for mobile menu */}
              <div className="w-8 lg:hidden"></div>
              
              {/* Back Button */}
              <button
                onClick={() => router.push("/pharmacy/medicines")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isEdit ? "Edit Medicine" : "Add Medicine"}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isEdit ? "Update medicine details" : "Add a new medicine to the master"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Medicine Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Medicine Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={errors.name ? "border-red-500" : ""}
                      placeholder="Enter medicine name"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Generic Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Generic Name
                    </label>
                    <Input
                      value={form.genericName}
                      onChange={(e) => setForm({ ...form, genericName: e.target.value })}
                      placeholder="Enter generic name"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Brand */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Brand
                    </label>
                    <Input
                      value={form.brandName}
                      onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                      placeholder="Enter brand name"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.category}
                      onValueChange={(value) => setForm({ ...form, category: value })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-xs text-red-500">{errors.category}</p>
                    )}
                  </div>

                  {/* Unit Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Unit Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.unit}
                      onValueChange={(value) => setForm({ ...form, unit: value })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.unit && (
                      <p className="text-xs text-red-500">{errors.unit}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Purchase Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Purchase Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.purchasePrice}
                      onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                      className={errors.purchasePrice ? "border-red-500" : ""}
                      placeholder="0.00"
                      disabled={isSubmitting}
                    />
                    {errors.purchasePrice && (
                      <p className="text-xs text-red-500">{errors.purchasePrice}</p>
                    )}
                  </div>

                  {/* Selling Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selling Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.sellingPrice}
                      onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                      className={errors.sellingPrice ? "border-red-500" : ""}
                      placeholder="0.00"
                      disabled={isSubmitting}
                    />
                    {errors.sellingPrice && (
                      <p className="text-xs text-red-500">{errors.sellingPrice}</p>
                    )}
                  </div>

                  {/* MRP */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      MRP (₹)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.mrp}
                      onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                      placeholder="0.00"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Tax Percentage */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tax %
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.taxPercent}
                      onChange={(e) => setForm({ ...form, taxPercent: e.target.value })}
                      className={errors.taxPercent ? "border-red-500" : ""}
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                    {errors.taxPercent && (
                      <p className="text-xs text-red-500">{errors.taxPercent}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <Button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEdit ? "Update" : "Save"} Medicine
              </Button>
              
              {!isEdit && (
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Save & Add Another
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => router.push("/pharmacy/medicines")}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}