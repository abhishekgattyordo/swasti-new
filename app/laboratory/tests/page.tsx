

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useTenant } from "@/contexts/TenantContext";
// import { MODULE_KEYS, LABARATORY_FEATURES } from "@/lib/feature";
// import Card from "@/components/laboratory/Card";

// interface LabTest {
//   id: string;
//   test_name: string;
//   test_code: string;
//   category: "Blood" | "Urine" | "Other";
//   price: number;
//   active: boolean;
//   created_at: string;
// }

// interface FormData {
//   test_name: string;
//   test_code: string;
//   category: "Blood" | "Urine" | "Other";
//   price: string;
//   active: boolean;
// }

// export default function LabTestsPage() {
//   const router = useRouter();
//   const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();
  
//   const [tests, setTests] = useState<LabTest[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editingTest, setEditingTest] = useState<LabTest | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [formData, setFormData] = useState<FormData>({
//     test_name: "",
//     test_code: "",
//     category: "Blood",
//     price: "",
//     active: true,
//   });

//   // Check if Test Catalog feature is enabled
//   const isTestCatalogEnabled = isMicroFeatureEnabled(
//     MODULE_KEYS.LABARATORY,
//     LABARATORY_FEATURES.TEST_CATALOG
//   );

//   // Redirect if feature is not enabled
//   useEffect(() => {
//     if (!tenantLoading && !isTestCatalogEnabled) {
//       router.push("/unauthorized");
//     }
//   }, [tenantLoading, isTestCatalogEnabled, router]);

//   // Fetch tests only if feature is enabled
//   useEffect(() => {
//     if (isTestCatalogEnabled) {
//       fetchTests();
//     }
//   }, [isTestCatalogEnabled]);

//   const fetchTests = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch("/api/laboratory/tests");
//       const result = await response.json();
      
//       if (result.success) {
//         setTests(result.data);
//       } else {
//         setError(result.error || "Failed to fetch tests");
//         console.error("Error fetching tests:", result.error);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       setError("Network error. Please check if the server is running.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create + Update via API
//   const handleSave = async () => {
//     if (!formData.test_name || !formData.test_code || !formData.price) {
//       alert("Please fill all required fields");
//       return;
//     }

//     const priceNum = parseFloat(formData.price);
//     if (isNaN(priceNum) || priceNum <= 0) {
//       alert("Please enter a valid price");
//       return;
//     }

//     try {
//       if (editingTest) {
//         // UPDATE
//         console.log("Updating test:", editingTest.id);
//         const response = await fetch("/api/laboratory/tests", {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             id: editingTest.id,
//             test_name: formData.test_name,
//             test_code: formData.test_code,
//             category: formData.category,
//             price: priceNum,
//             active: formData.active,
//           }),
//         });
        
//         const result = await response.json();
//         console.log("Update response:", result);
        
//         if (!result.success) {
//           throw new Error(result.error || "Update failed");
//         }
        
//         alert("Test updated successfully!");
//       } else {
//         // CREATE
//         console.log("Creating new test");
//         const response = await fetch("/api/laboratory/tests", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             test_name: formData.test_name,
//             test_code: formData.test_code,
//             category: formData.category,
//             price: priceNum,
//             active: formData.active,
//           }),
//         });
        
//         const result = await response.json();
//         console.log("Create response:", result);
        
//         if (!result.success) {
//           throw new Error(result.error || "Create failed");
//         }
        
//         alert("Test added successfully!");
//       }

//       await fetchTests();
//       setShowModal(false);
//       setEditingTest(null);
//       setFormData({
//         test_name: "",
//         test_code: "",
//         category: "Blood",
//         price: "",
//         active: true,
//       });
//     } catch (error: any) {
//       console.error("Error saving test:", error);
//       alert(`Error saving test: ${error.message}`);
//     }
//   };

//   // Toggle active via API
//   const toggleActive = async (id: string, currentStatus: boolean) => {
//     try {
//       const response = await fetch("/api/laboratory/tests", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           id,
//           active: !currentStatus,
//         }),
//       });
      
//       const result = await response.json();
//       if (!result.success) throw new Error(result.error);
      
//       setTests((prev) =>
//         prev.map((test) =>
//           test.id === id ? { ...test, active: !currentStatus } : test
//         )
//       );
//     } catch (error) {
//       console.error("Error toggling test:", error);
//       alert("Error updating test status");
//     }
//   };

//   // Delete via API
//   const deleteTest = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this test?")) return;

//     try {
//       const response = await fetch(`/api/laboratory/tests?id=${id}`, {
//         method: "DELETE",
//       });
      
//       const result = await response.json();
//       if (!result.success) throw new Error(result.error);
      
//       setTests((prev) => prev.filter((test) => test.id !== id));
//       alert("Test deleted successfully!");
//     } catch (error) {
//       console.error("Error deleting test:", error);
//       alert("Error deleting test");
//     }
//   };

//   const openModal = (test?: LabTest) => {
//     if (test) {
//       setEditingTest(test);
//       setFormData({
//         test_name: test.test_name,
//         test_code: test.test_code,
//         category: test.category,
//         price: test.price.toString(),
//         active: test.active,
//       });
//     } else {
//       setEditingTest(null);
//       setFormData({
//         test_name: "",
//         test_code: "",
//         category: "Blood",
//         price: "",
//         active: true,
//       });
//     }
//     setShowModal(true);
//   };

//   const getCategoryColor = (category: string) => {
//     const colors = {
//       Blood: "bg-red-50 text-red-700 border-red-200",
//       Urine: "bg-amber-50 text-amber-700 border-amber-200",
//       Other: "bg-gray-50 text-gray-700 border-gray-200",
//     };
//     return colors[category as keyof typeof colors];
//   };

//   // Show loading state while checking tenant and feature flags
//   if (tenantLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show unauthorized if feature is not enabled
//   if (!isTestCatalogEnabled) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="text-red-500 text-6xl mb-4">🔒</div>
//           <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
//           <p className="text-gray-600">
//             Test Catalog feature is not enabled for {tenant?.name}.
//           </p>
//           <button
//             onClick={() => router.push("/dashboard")}
//             className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
//           >
//             Go to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading tests...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="bg-red-50 text-red-600 p-4 rounded-lg">
//             <p className="font-semibold">Error loading tests</p>
//             <p className="text-sm mt-1">{error}</p>
//             <button 
//               onClick={fetchTests}
//               className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900">Test Catalog</h1>
//             <p className="text-sm text-gray-500 mt-1">
//               Manage laboratory test configurations
//             </p>
//             {tenant && (
//               <p className="text-xs text-gray-400 mt-1">
//                 Tenant: {tenant.name}
//               </p>
//             )}
//           </div>
//           <button
//             onClick={() => openModal()}
//             className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
//           >
//             + Add New Test
//           </button>
//         </div>
//       </div>

//       <div className="p-8">
//         <div className="grid grid-cols-1 gap-4">
//           {tests.length === 0 ? (
//             <Card className="p-8 text-center">
//               <p className="text-gray-500">No tests found. Click Add New Test to create one.</p>
//             </Card>
//           ) : (
//             tests.map((test) => (
//               <Card
//                 key={test.id}
//                 className="p-6 hover:shadow-md transition-shadow"
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-3 mb-2">
//                       <h3 className="text-lg font-semibold text-gray-900">
//                         {test.test_name}
//                       </h3>
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
//                           test.category
//                         )}`}
//                       >
//                         {test.category}
//                       </span>
//                       {!test.active && (
//                         <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
//                           Inactive
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-sm text-gray-500">Code: {test.test_code}</p>
//                     <p className="text-xs text-gray-400 mt-1">
//                       Created: {new Date(test.created_at).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-2xl font-bold text-gray-900">
//                       ₹{test.price}
//                     </p>
//                     <div className="flex items-center space-x-3 mt-2">
//                       <button
//                         onClick={() => toggleActive(test.id, test.active)}
//                         className={`px-3 py-1 rounded-lg text-sm transition-colors ${
//                           test.active
//                             ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
//                             : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                         }`}
//                       >
//                         {test.active ? "Active" : "Activate"}
//                       </button>
//                       <button
//                         onClick={() => openModal(test)}
//                         className="px-3 py-1 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => deleteTest(test.id)}
//                         className="px-3 py-1 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Add/Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {editingTest ? "Edit Test" : "Add New Test"}
//                 </h2>
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   ✕
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Test Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.test_name}
//                     onChange={(e) =>
//                       setFormData({ ...formData, test_name: e.target.value })
//                     }
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//                     placeholder="e.g., Complete Blood Count"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Test Code *
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.test_code}
//                     onChange={(e) =>
//                       setFormData({ ...formData, test_code: e.target.value })
//                     }
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//                     placeholder="e.g., CBC001"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Category *
//                   </label>
//                   <select
//                     value={formData.category}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         category: e.target.value as
//                           | "Blood"
//                           | "Urine"
//                           | "Other",
//                       })
//                     }
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//                   >
//                     <option value="Blood">Blood</option>
//                     <option value="Urine">Urine</option>
//                     <option value="Other">Other</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Price (₹) *
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={formData.price}
//                     onChange={(e) =>
//                       setFormData({ ...formData, price: e.target.value })
//                     }
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//                     placeholder="e.g., 500"
//                   />
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={formData.active}
//                     onChange={(e) =>
//                       setFormData({ ...formData, active: e.target.checked })
//                     }
//                     className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
//                   />
//                   <label className="ml-2 block text-sm text-gray-700">
//                     Active
//                   </label>
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
//                 >
//                   {editingTest ? "Update" : "Add"} Test
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/context/TenantContext";
import { MODULE_KEYS, LABARATORY_FEATURES } from "@/lib/feature";
import Card from "@/components/laboratory/Card";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  Microscope,
  Activity,
  DollarSign,
  Tag,
  FolderOpen,
} from "lucide-react";

interface LabTest {
  id: string;
  test_name: string;
  test_code: string;
  category: "Blood" | "Urine" | "Other";
  price: number;
  active: boolean;
  created_at: string;
}

interface FormData {
  test_name: string;
  test_code: string;
  category: "Blood" | "Urine" | "Other";
  price: string;
  active: boolean;
}

export default function LabTestsPage() {
  const router = useRouter();
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();
  
  const [tests, setTests] = useState<LabTest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<FormData>({
    test_name: "",
    test_code: "",
    category: "Blood",
    price: "",
    active: true,
  });

  const isTestCatalogEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.LABARATORY,
    LABARATORY_FEATURES.TEST_CATALOG
  );

  useEffect(() => {
    if (!tenantLoading && !isTestCatalogEnabled) {
      router.push("/unauthorized");
    }
  }, [tenantLoading, isTestCatalogEnabled, router]);

  useEffect(() => {
    if (isTestCatalogEnabled) {
      fetchTests();
    }
  }, [isTestCatalogEnabled]);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/laboratory/tests");
      const result = await response.json();
      
      if (result.success) {
        setTests(result.data);
      } else {
        setError(result.error || "Failed to fetch tests");
        console.error("Error fetching tests:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.test_name || !formData.test_code || !formData.price) {
      alert("Please fill all required fields");
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      if (editingTest) {
        const response = await fetch("/api/laboratory/tests", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingTest.id,
            test_name: formData.test_name,
            test_code: formData.test_code,
            category: formData.category,
            price: priceNum,
            active: formData.active,
          }),
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || "Update failed");
        }
        
        alert("Test updated successfully!");
      } else {
        const response = await fetch("/api/laboratory/tests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            test_name: formData.test_name,
            test_code: formData.test_code,
            category: formData.category,
            price: priceNum,
            active: formData.active,
          }),
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || "Create failed");
        }
        
        alert("Test added successfully!");
      }

      await fetchTests();
      setShowModal(false);
      setEditingTest(null);
      setFormData({
        test_name: "",
        test_code: "",
        category: "Blood",
        price: "",
        active: true,
      });
    } catch (error: any) {
      console.error("Error saving test:", error);
      alert(`Error saving test: ${error.message}`);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/laboratory/tests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          active: !currentStatus,
        }),
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      setTests((prev) =>
        prev.map((test) =>
          test.id === id ? { ...test, active: !currentStatus } : test
        )
      );
    } catch (error) {
      console.error("Error toggling test:", error);
      alert("Error updating test status");
    }
  };

  const deleteTest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;

    try {
      const response = await fetch(`/api/laboratory/tests?id=${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      setTests((prev) => prev.filter((test) => test.id !== id));
      alert("Test deleted successfully!");
    } catch (error) {
      console.error("Error deleting test:", error);
      alert("Error deleting test");
    }
  };

  const openModal = (test?: LabTest) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        test_name: test.test_name,
        test_code: test.test_code,
        category: test.category,
        price: test.price.toString(),
        active: test.active,
      });
    } else {
      setEditingTest(null);
      setFormData({
        test_name: "",
        test_code: "",
        category: "Blood",
        price: "",
        active: true,
      });
    }
    setShowModal(true);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Blood: "bg-[#EAF7F4] text-[#1F8F89] border-[#2BB2A7]/30 dark:bg-[#1F8F89]/20 dark:text-[#2BB2A7] dark:border-[#2BB2A7]/20",
      Urine: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
      Other: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600",
    };
    return colors[category as keyof typeof colors];
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      Blood: "🩸",
      Urine: "💧",
      Other: "🔬",
    };
    return icons[category as keyof typeof icons];
  };

  const filteredTests = tests.filter(test =>
    test.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.test_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTests = filteredTests.filter(t => t.active);
  const inactiveTests = filteredTests.filter(t => !t.active);

  if (tenantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2BB2A7] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isTestCatalogEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-[#E2EFEA] dark:border-gray-700">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test Catalog feature is not enabled for {tenant?.name}.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2BB2A7] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-[#E2EFEA] dark:border-gray-700">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="font-semibold text-gray-800 dark:text-white">Error loading tests</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{error}</p>
          <button 
            onClick={fetchTests}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-[#E2EFEA] dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test Catalog</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage laboratory test configurations
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Test
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tests by name or code..."
            className="w-full sm:w-80 pl-9 pr-4 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EAF7F4] dark:bg-[#1F8F89]/20 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-[#2BB2A7]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tests.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-900/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Tests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeTests.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-500/10 dark:bg-gray-700/50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Inactive Tests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveTests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test List */}
        {filteredTests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-12 text-center">
            <Microscope className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No tests found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {searchTerm ? "Try adjusting your search" : "Click Add New Test to create one"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {test.test_name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                          test.category
                        )}`}
                      >
                        {getCategoryIcon(test.category)} {test.category}
                      </span>
                      {!test.active && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                          Inactive
                        </span>
                      )}
                      {test.active && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#EAF7F4] text-[#1F8F89] dark:bg-[#1F8F89]/20 dark:text-[#2BB2A7] border border-[#2BB2A7]/30 dark:border-[#2BB2A7]/20">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <p className="text-gray-500 dark:text-gray-400">
                        <Tag className="w-3.5 h-3.5 inline mr-1" />
                        Code: {test.test_code}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5 inline mr-1" />
                        Created: {new Date(test.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <p className="text-2xl font-bold text-[#2BB2A7]">
                      ₹{test.price}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        onClick={() => toggleActive(test.id, test.active)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          test.active
                            ? "bg-[#EAF7F4] dark:bg-[#1F8F89]/20 text-[#1F8F89] dark:text-[#2BB2A7] hover:bg-[#2BB2A7] hover:text-white dark:hover:bg-[#2BB2A7] dark:hover:text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {test.active ? "Active" : "Activate"}
                      </button>
                      <button
                        onClick={() => openModal(test)}
                        className="p-1.5 rounded-lg text-[#2BB2A7] hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTest(test.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer with count */}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredTests.length} of {tests.length} tests
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-[#E2EFEA] dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingTest ? "Edit Test" : "Add New Test"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    value={formData.test_name}
                    onChange={(e) =>
                      setFormData({ ...formData, test_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Complete Blood Count"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Test Code *
                  </label>
                  <input
                    type="text"
                    value={formData.test_code}
                    onChange={(e) =>
                      setFormData({ ...formData, test_code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., CBC001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as
                          | "Blood"
                          | "Urine"
                          | "Other",
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Blood">Blood</option>
                    <option value="Urine">Urine</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (₹) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="h-4 w-4 text-[#2BB2A7] focus:ring-[#2BB2A7] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingTest ? "Update" : "Add"} Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}