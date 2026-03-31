

// "use client";

// import { useState, useEffect } from "react";
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

// export default function LabTestsPage() {
//   const [tests, setTests] = useState<LabTest[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editingTest, setEditingTest] = useState<LabTest | null>(null);
//   const [formData, setFormData] = useState({
//     test_name: "",
//     test_code: "",
//     category: "Blood" as const,
//     price: "",
//     active: true,
//   });

//   // Load tests from localStorage on mount
//   useEffect(() => {
//     const savedTests = localStorage.getItem('lab_tests');
//     if (savedTests) {
//       setTests(JSON.parse(savedTests));
//     } else {
//       // Default tests
//       const defaultTests = [
//         { id: "1", test_name: "Complete Blood Count", test_code: "CBC001", category: "Blood" as const, price: 500, active: true, created_at: new Date().toISOString() },
//         { id: "2", test_name: "Blood Glucose", test_code: "GLU002", category: "Blood" as const, price: 150, active: true, created_at: new Date().toISOString() },
//         { id: "3", test_name: "Urine Routine", test_code: "UR003", category: "Urine" as const, price: 200, active: true, created_at: new Date().toISOString() },
//       ];
//       setTests(defaultTests);
//       localStorage.setItem('lab_tests', JSON.stringify(defaultTests));
//     }
//   }, []);

//   const handleSave = () => {
//     if (!formData.test_name || !formData.test_code || !formData.price) {
//       alert('Please fill all required fields');
//       return;
//     }

//     if (editingTest) {
//       const updatedTests = tests.map(test => 
//         test.id === editingTest.id 
//           ? { ...test, ...formData, price: parseFloat(formData.price) }
//           : test
//       );
//       setTests(updatedTests);
//       localStorage.setItem('lab_tests', JSON.stringify(updatedTests));
//     } else {
//       const newTest = {
//         id: Date.now().toString(),
//         ...formData,
//         price: parseFloat(formData.price),
//         created_at: new Date().toISOString(),
//       };
//       const updatedTests = [newTest, ...tests];
//       setTests(updatedTests);
//       localStorage.setItem('lab_tests', JSON.stringify(updatedTests));
//     }
    
//     setShowModal(false);
//     setEditingTest(null);
//     setFormData({ test_name: "", test_code: "", category: "Blood", price: "", active: true });
//   };

//   const toggleActive = (id: string) => {
//     const updatedTests = tests.map(test => 
//       test.id === id ? { ...test, active: !test.active } : test
//     );
//     setTests(updatedTests);
//     localStorage.setItem('lab_tests', JSON.stringify(updatedTests));
//   };

//   const deleteTest = (id: string) => {
//     if (confirm('Are you sure you want to delete this test?')) {
//       const updatedTests = tests.filter(test => test.id !== id);
//       setTests(updatedTests);
//       localStorage.setItem('lab_tests', JSON.stringify(updatedTests));
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
//       setFormData({ test_name: "", test_code: "", category: "Blood", price: "", active: true });
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

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900">Test Catalog</h1>
//             <p className="text-sm text-gray-500 mt-1">Manage laboratory test configurations</p>
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
//           {tests.map((test) => (
//             <Card key={test.id} className="p-6 hover:shadow-md transition-shadow">
//               <div className="flex items-center justify-between">
//                 <div className="flex-1">
//                   <div className="flex items-center space-x-3 mb-2">
//                     <h3 className="text-lg font-semibold text-gray-900">{test.test_name}</h3>
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(test.category)}`}>
//                       {test.category}
//                     </span>
//                     {!test.active && (
//                       <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
//                         Inactive
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-sm text-gray-500">Code: {test.test_code}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-2xl font-bold text-gray-900">₹{test.price}</p>
//                   <div className="flex items-center space-x-3 mt-2">
//                     <button
//                       onClick={() => toggleActive(test.id)}
//                       className={`px-3 py-1 rounded-lg text-sm transition-colors ${
//                         test.active 
//                           ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
//                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                       }`}
//                     >
//                       {test.active ? 'Active' : 'Activate'}
//                     </button>
//                     <button
//                       onClick={() => openModal(test)}
//                       className="px-3 py-1 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => deleteTest(test.id)}
//                       className="px-3 py-1 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </Card>
//           ))}
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
//                     onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
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
//                     onChange={(e) => setFormData({ ...formData, test_code: e.target.value })}
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
//                     onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
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
//                     value={formData.price}
//                     onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//                     placeholder="e.g., 500"
//                   />
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={formData.active}
//                     onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
//                     className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
//                   />
//                   <label className="ml-2 block text-sm text-gray-700">Active</label>
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
import Card from "@/components/laboratory/Card";

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
  const [tests, setTests] = useState<LabTest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);
  const [formData, setFormData] = useState<FormData>({
    test_name: "",
    test_code: "",
    category: "Blood",
    price: "",
    active: true,
  });

  // Load tests from localStorage on mount
  useEffect(() => {
    const savedTests = localStorage.getItem('lab_tests');
    if (savedTests) {
      setTests(JSON.parse(savedTests));
    } else {
      // Default tests
      const defaultTests: LabTest[] = [
        { id: "1", test_name: "Complete Blood Count", test_code: "CBC001", category: "Blood", price: 500, active: true, created_at: new Date().toISOString() },
        { id: "2", test_name: "Blood Glucose", test_code: "GLU002", category: "Blood", price: 150, active: true, created_at: new Date().toISOString() },
        { id: "3", test_name: "Urine Routine", test_code: "UR003", category: "Urine", price: 200, active: true, created_at: new Date().toISOString() },
      ];
      setTests(defaultTests);
      localStorage.setItem('lab_tests', JSON.stringify(defaultTests));
    }
  }, []);

  const handleSave = () => {
    if (!formData.test_name || !formData.test_code || !formData.price) {
      alert('Please fill all required fields');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (editingTest) {
      const updatedTests = tests.map(test => 
        test.id === editingTest.id 
          ? { 
              ...test, 
              test_name: formData.test_name,
              test_code: formData.test_code,
              category: formData.category,
              price: priceNum,
              active: formData.active,
            }
          : test
      );
      setTests(updatedTests);
      localStorage.setItem('lab_tests', JSON.stringify(updatedTests));
    } else {
      const newTest: LabTest = {
        id: Date.now().toString(),
        test_name: formData.test_name,
        test_code: formData.test_code,
        category: formData.category,
        price: priceNum,
        active: formData.active,
        created_at: new Date().toISOString(),
      };
      const updatedTests = [newTest, ...tests];
      setTests(updatedTests);
      localStorage.setItem('lab_tests', JSON.stringify(updatedTests));
    }
    
    setShowModal(false);
    setEditingTest(null);
    setFormData({ test_name: "", test_code: "", category: "Blood", price: "", active: true });
  };

  const toggleActive = (id: string) => {
    const updatedTests = tests.map(test => 
      test.id === id ? { ...test, active: !test.active } : test
    );
    setTests(updatedTests);
    localStorage.setItem('lab_tests', JSON.stringify(updatedTests));
  };

  const deleteTest = (id: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      const updatedTests = tests.filter(test => test.id !== id);
      setTests(updatedTests);
      localStorage.setItem('lab_tests', JSON.stringify(updatedTests));
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
      setFormData({ test_name: "", test_code: "", category: "Blood", price: "", active: true });
    }
    setShowModal(true);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Blood: "bg-red-50 text-red-700 border-red-200",
      Urine: "bg-amber-50 text-amber-700 border-amber-200",
      Other: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[category as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Test Catalog</h1>
            <p className="text-sm text-gray-500 mt-1">Manage laboratory test configurations</p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            + Add New Test
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 gap-4">
          {tests.map((test) => (
            <Card key={test.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{test.test_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(test.category)}`}>
                      {test.category}
                    </span>
                    {!test.active && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Code: {test.test_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₹{test.price}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <button
                      onClick={() => toggleActive(test.id)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        test.active 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {test.active ? 'Active' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openModal(test)}
                      className="px-3 py-1 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTest(test.id)}
                      className="px-3 py-1 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingTest ? "Edit Test" : "Add New Test"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    value={formData.test_name}
                    onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Complete Blood Count"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Code *
                  </label>
                  <input
                    type="text"
                    value={formData.test_code}
                    onChange={(e) => setFormData({ ...formData, test_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., CBC001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as "Blood" | "Urine" | "Other" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Blood">Blood</option>
                    <option value="Urine">Urine</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Active</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
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