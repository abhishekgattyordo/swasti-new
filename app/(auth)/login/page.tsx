

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Lock,
//   Mail,
//   Eye,
//   EyeOff,
//   Shield,
//   BadgeCheck,
//   Hospital,
//   ChevronRight,
//   AlertCircle,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import Image from "next/image";
// import { useTenant } from "@/contexts/TenantContext";

// export default function LoginPage() {
//   const router = useRouter();
//   const { tenant, isLoading: tenantLoading } = useTenant();
  
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
//   const [serverError, setServerError] = useState<string | null>(null);

//   // Get tenant name
//   const tenantName = tenant?.name || "HealthPortal";

//   const validateForm = () => {
//     const newErrors: { email?: string; password?: string } = {};

//     const trimmedEmail = email.trim();
//     const trimmedPassword = password.trim();

//     if (!trimmedEmail) {
//       newErrors.email = "Email or Patient ID is required";
//     } else if (!/\S+@\S+\.\S+/.test(trimmedEmail) && !/^[A-Z0-9]+$/i.test(trimmedEmail)) {
//       newErrors.email = "Please enter a valid email or patient ID";
//     }

//     if (!trimmedPassword) {
//       newErrors.password = "Password is required";
//     } else if (trimmedPassword.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     setServerError(null);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setIsLoading(true);
//     setServerError(null);

//     const trimmedEmail = email.trim();
//     const trimmedPassword = password.trim();

//     if (trimmedEmail === "laboratory@gmail.com" && trimmedPassword === "password123") {
//       const dummyUser = {
//         id: 99,
//         email: "laboratory@gmail.com",
//         full_name_en: "Lab Technician",
//         role: "laboratory",
//         patient_id: null,
//         doctor_id: null,
//       };
//       localStorage.setItem("user", JSON.stringify(dummyUser));
//       localStorage.setItem("accessToken", "dummy-token");
//       console.log("✅ Dummy laboratory login successful");
//       router.push("/laboratory");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       console.log("🔍 Attempting login with:", { email: trimmedEmail });

//       const res = await fetch("/api/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
//       });

//       const data = await res.json();
//       console.log("📥 Login response:", data);

//       if (!res.ok) {
//         if (data.errors) {
//           setErrors(data.errors);
//         } else if (data.message) {
//           setServerError(data.message);
//         } else {
//           setServerError("Login failed. Please try again.");
//         }
//         setIsLoading(false);
//         return;
//       }

//           localStorage.setItem("user", JSON.stringify(data.user));

//       // Store access token
//       if (data.token) {
//         localStorage.setItem("accessToken", data.token);
//       }

//       // Store basic user info
//       localStorage.setItem("userId", data.user?.id?.toString() || '');
//       localStorage.setItem("userName", data.user?.full_name_en || '');
//       localStorage.setItem("userRole", data.user?.role || '');

//       // If nurse, fetch and store staff ID
//       if (data.user?.role === 'nurse') {
//         try {
//           const staffRes = await fetch('/api/admin/staff');
//           const staffData = await staffRes.json();
          
//           if (staffData?.success && staffData?.data) {
//             const staffRecord = staffData.data.find(
//               (s: any) => s.user_id === data.user.id
//             );
            
//             if (staffRecord) {
//               localStorage.setItem('staffId', staffRecord.id.toString());
//               console.log('✅ Staff ID stored:', staffRecord.id);
//             }
//           }
//         } catch (err) {
//           console.error('Failed to fetch staff ID:', err);
//         }
//       }

//       console.log("✅ Login successful for:", data.user.email, "Role:", data.user.role);

//       switch (data.user.role) {
//         case "admin":
//           router.push("/admin/healthcaredashboard");
//           break;
//         case "patient":
//           router.push("/patient/dashboard");
//           break;
//         case "doctor":
//           router.push("/doctor/dashboard");
//           break;
//         case "pharmacy":
//           router.push("/pharmacy/dashboard");
//           break;
//         case "helpdesk":
//           router.push("/helpdesk/dashboard");
//           break;
//         case "laboratory":
//           router.push("/laboratory");
//           break;
//         case "billing":
//           router.push("/billing/dashboard");
//           break;
//           case "nurse":
//           router.push("/nurse");
//           break;
//         default:
//           router.push("/");
//       }
//     } catch (error) {
//       console.error("❌ Login error:", error);
//       setServerError("Network error. Please check your connection and try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleForgotPassword = () => {
//     router.push("/reset-password");
//   };

//   const handleRegister = () => {
//     router.push("/register");
//   };

//   const backgroundImage =
//     "https://lh3.googleusercontent.com/aida-public/AB6AXuAUoKAWXblMA5hD_pTh52wG-slwGznFbTb8t4O32qAQysqQTwr4DlsX3FvTwdr8fbnLU6DA3tIQSxaGOn6pp86dDsrIjyQRAhf8ilnfpcXMSwVwPhvUOezUMQF2vX7iQKaDcgUWDcFDxuK7k4zT_pErUTMuw7UYGlT35lLQPO3daWpNd-oq8jjw3pl76k-1bQ2AZZXU4veTyzMdKOnL7dL9olz8eDrz34tkwLB7nfGwDTidwle7B-jTIXRjuVpy1wPoPX201n40AgA";

//   // Show loading state while tenant is being fetched
//   if (tenantLoading) {
//     return (
//       <div className="min-h-screen flex bg-white">
//         <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
//           <div className="text-center">
//             <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex bg-white">
//       {/* LEFT SIDE - Healthcare Image */}
//       <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
//         <Image
//           src={backgroundImage}
//           alt="Healthcare"
//           fill
//           className="object-cover opacity-40"
//           priority
//         />

//         <div className="relative z-10 p-12 xl:p-20 flex flex-col justify-end w-full text-white">
//           <div className="max-w-lg space-y-8">
//             <div className="flex items-center gap-3">
//               <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-white/10 border border-white/20">
//                 <Hospital className="w-6 h-6" />
//               </div>
//               <span className="text-2xl font-bold">{tenantName}</span>
//             </div>

//             <div>
//               <h1 className="text-4xl font-bold leading-tight">
//                 Welcome to {tenantName}
//               </h1>
//               <p className="text-gray-300 mt-3">
//                 Your secure gateway to manage health records, appointments,
//                 prescriptions, and connect with healthcare providers.
//               </p>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex items-center gap-3">
//                 <BadgeCheck className="text-green-400" />
//                 <div>
//                   <p>Secure Access</p>
//                   <p className="text-sm text-gray-400">HIPAA Compliant</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <Shield className="text-green-400" />
//                 <div>
//                   <p>Privacy First</p>
//                   <p className="text-sm text-gray-400">Encrypted Data</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT SIDE - Login Form */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
//         <div className="w-full max-w-md">
//           <h1 className="text-3xl font-semibold mb-6">Welcome Back</h1>

//           {serverError && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
//               <AlertCircle className="h-5 w-5" />
//               <p className="text-sm">{serverError}</p>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <Label>Email</Label>
//               <div className="relative mt-2">
//                 <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
//                 <Input
//                   className={cn(
//                     "pl-10 h-12",
//                     errors.email && "border-red-500 focus-visible:ring-red-500"
//                   )}
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email"
//                   disabled={isLoading}
//                 />
//               </div>
//               {errors.email && (
//                 <p className="text-sm text-red-500 mt-1">{errors.email}</p>
//               )}
//             </div>

//             <div>
//               <Label>Password</Label>
//               <div className="relative mt-2">
//                 <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
//                 <Input
//                   type={showPassword ? "text" : "password"}
//                   className={cn(
//                     "pl-10 pr-12 h-12",
//                     errors.password && "border-red-500 focus-visible:ring-red-500"
//                   )}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter your password"
//                   disabled={isLoading}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={isLoading}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
//               {errors.password && (
//                 <p className="text-sm text-red-500 mt-1">{errors.password}</p>
//               )}
//             </div>

//             <div className="flex justify-end">
//               <button
//                 type="button"
//                 onClick={handleForgotPassword}
//                 className="text-sm text-green-600 hover:text-green-700 hover:underline disabled:opacity-50"
//                 disabled={isLoading}
//               >
//                 Forgot password?
//               </button>
//             </div>

//             <Button
//               type="submit"
//               className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
//                   Signing in...
//                 </div>
//               ) : (
//                 <span className="flex items-center gap-2">
//                   Sign In <ChevronRight className="h-4 w-4" />
//                 </span>
//               )}
//             </Button>

//             <div className="text-center text-sm text-gray-500">
//               Don&apos;t have an account?{" "}
//               <button
//                 type="button"
//                 onClick={handleRegister}
//                 className="text-green-600 hover:text-green-700 hover:underline font-medium disabled:opacity-50"
//                 disabled={isLoading}
//               >
//                 Create account
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  BadgeCheck,
  Hospital,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTenant } from "@/contexts/TenantContext";

export default function LoginPage() {
  const router = useRouter();
  const { tenant, isLoading: tenantLoading } = useTenant();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Get tenant name
  const tenantName = tenant?.name || "HealthPortal";

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email or Patient ID is required";
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail) && !/^[A-Z0-9]+$/i.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email or patient ID";
    }

    if (!trimmedPassword) {
      newErrors.password = "Password is required";
    } else if (trimmedPassword.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    setServerError(null);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setServerError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (trimmedEmail === "laboratory@gmail.com" && trimmedPassword === "password123") {
      const dummyUser = {
        id: 99,
        email: "laboratory@gmail.com",
        full_name_en: "Lab Technician",
        role: "laboratory",
        patient_id: null,
        doctor_id: null,
      };
      localStorage.setItem("user", JSON.stringify(dummyUser));
      localStorage.setItem("accessToken", "dummy-token");
      console.log("✅ Dummy laboratory login successful");
      router.push("/laboratory");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔍 Attempting login with:", { email: trimmedEmail });

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      const data = await res.json();
      console.log("📥 Login response:", data);

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.message) {
          setServerError(data.message);
        } else {
          setServerError("Login failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      // Store access token
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
      }

      // Store basic user info
      localStorage.setItem("userId", data.user?.id?.toString() || '');
      localStorage.setItem("userName", data.user?.full_name_en || '');
      localStorage.setItem("userRole", data.user?.role || '');

      if (data.user?.role === 'patient') {
  const patientId = data.user?.patient_id || data.user?.id;
  if (patientId) {
    localStorage.setItem("patientId", patientId.toString());
    console.log("✅ patientId stored:", patientId);
  }
}


      // For nurse role, fetch staff details to check department
      if (data.user?.role === 'nurse') {
        try {
          const staffRes = await fetch('/api/admin/staff');
          const staffData = await staffRes.json();
          
          if (staffData?.success && staffData?.data) {
            const staffRecord = staffData.data.find(
              (s: any) => s.user_id === data.user.id
            );
            
            if (staffRecord) {
              localStorage.setItem('staffId', staffRecord.id.toString());
              localStorage.setItem('staffDepartment', staffRecord.department || '');
              localStorage.setItem('staffWardId', staffRecord.ward_id?.toString() || '');
              console.log('✅ Staff ID stored:', staffRecord.id);
              console.log('✅ Staff Department:', staffRecord.department);
              
              // Check if nurse is from Emergency department
              if (staffRecord.department === 'Emergency') {
                console.log('🚑 Emergency nurse detected, redirecting to emergency dashboard');
                router.push("/emergency/dashboard");
                setIsLoading(false);
                return;
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch staff ID:', err);
        }
      }

      console.log("✅ Login successful for:", data.user.email, "Role:", data.user.role);

      // Role-based navigation
      switch (data.user.role) {
        case "admin":
          router.push("/admin/healthcaredashboard");
          break;
        case "patient":
          router.push("/patient/dashboard");
          break;
        case "doctor":
          router.push("/doctor/dashboard");
          break;
        case "pharmacy":
          router.push("/pharmacy/dashboard");
          break;
        case "helpdesk":
          router.push("/helpdesk/dashboard");
          break;
        case "laboratory":
          router.push("/laboratory");
          break;
        case "billing":
          router.push("/billing/dashboard");
          break;
        case "nurse":
          router.push("/nurse");
          break;
        default:
          router.push("/");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/reset-password");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const backgroundImage =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAUoKAWXblMA5hD_pTh52wG-slwGznFbTb8t4O32qAQysqQTwr4DlsX3FvTwdr8fbnLU6DA3tIQSxaGOn6pp86dDsrIjyQRAhf8ilnfpcXMSwVwPhvUOezUMQF2vX7iQKaDcgUWDcFDxuK7k4zT_pErUTMuw7UYGlT35lLQPO3daWpNd-oq8jjw3pl76k-1bQ2AZZXU4veTyzMdKOnL7dL9olz8eDrz34tkwLB7nfGwDTidwle7B-jTIXRjuVpy1wPoPX201n40AgA";

  // Show loading state while tenant is being fetched
  if (tenantLoading) {
    return (
      <div className="min-h-screen flex bg-white">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT SIDE - Healthcare Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <Image
          src={backgroundImage}
          alt="Healthcare"
          fill
          className="object-cover opacity-40"
          priority
        />

        <div className="relative z-10 p-12 xl:p-20 flex flex-col justify-end w-full text-white">
          <div className="max-w-lg space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-white/10 border border-white/20">
                <Hospital className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">{tenantName}</span>
            </div>

            <div>
              <h1 className="text-4xl font-bold leading-tight">
                Welcome to {tenantName}
              </h1>
              <p className="text-gray-300 mt-3">
                Your secure gateway to manage health records, appointments,
                prescriptions, and connect with healthcare providers.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <BadgeCheck className="text-green-400" />
                <div>
                  <p>Secure Access</p>
                  <p className="text-sm text-gray-400">HIPAA Compliant</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="text-green-400" />
                <div>
                  <p>Privacy First</p>
                  <p className="text-sm text-gray-400">Encrypted Data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold mb-6">Welcome Back</h1>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  className={cn(
                    "pl-10 h-12",
                    errors.email && "border-red-500 focus-visible:ring-red-500"
                  )}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "pl-10 pr-12 h-12",
                    errors.password && "border-red-500 focus-visible:ring-red-500"
                  )}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-green-600 hover:text-green-700 hover:underline disabled:opacity-50"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  Signing in...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <div className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={handleRegister}
                className="text-green-600 hover:text-green-700 hover:underline font-medium disabled:opacity-50"
                disabled={isLoading}
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}