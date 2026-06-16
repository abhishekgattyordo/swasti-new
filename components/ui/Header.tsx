"use client";

import {
  Menu,
  X,
  User,
  LogIn,
  UserPlus,
  ChevronDown,
  LogOut,
  Bell,
  Heart,
  Stethoscope,
  Users,
  Calendar,
  FileText,
  ClipboardList,
  Activity,
  DoorOpen, 
  Receipt,
  FlaskConical,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTenant } from "@/contexts/TenantContext";

interface User {
  id: number;
  email: string;
  role: "admin" | "doctor" | "patient" | "helpdesk" | "pharmacy" | "laboratory" | string;
  full_name_en?: string;
  name?: string;
  patient_id?: string | null;
  created_at?: string;
}

const roleNavConfig = {
  common: [
    { href: "/appointments", label: "Find Doctors" },
  ],
  admin: [
    { href: "/admin/healthcaredashboard", label: "Dashboard", icon: Activity },
    { href: "/admin/bed-management", label: "Room Availability", icon: DoorOpen },
    { href: "/admin/patientmanagement", label: "Patients", icon: Users },
    { href: "/admin/doctorsmanagement", label: "Doctors", icon: Stethoscope },
  ],
  doctor: [
    { href: "/doctor/dashboard", label: "Dashboard", icon: Activity },
    { href: "/doctor/patients", label: "My Patients", icon: Users },
    { href: "/doctor/schedule", label: "Schedule", icon: ClipboardList },
  ],
  patient: [
    { href: "/patient/dashboard", label: "Dashboard", icon: Activity },
    { href: "/patient/prescriptions", label: "Prescriptions", icon: FileText },
  ],
  helpdesk: [
    { href: "/helpdesk/dashboard", label: "Dashboard", icon: Activity },
    { href: "/helpdesk/appointments", label: "Appointments", icon: Calendar },
    { href: "/admin/bed-management", label: "Room Availability", icon: DoorOpen },
  ],
  pharmacy: [
    { href: "/pharmacy/dashboard", label: "Dashboard", icon: Activity },
    { href: "/pharmacy/stock", label: "Current Stock", icon: ClipboardList },
    { href: "/pharmacy/ledger", label: "Ledger", icon: Receipt },
  ],
  laboratory: [
    { href: "/laboratory/orders", label: "Dashboard", icon: Activity },
    { href: "/laboratory/reports", label: "Lab Orders", icon: ClipboardList },
    { href: "/laboratory/test", label: "Reports", icon: FileText },
    { href: "/laboratory/samples", label: "Sample Collection", icon: FlaskConical },
  ],
};

const roleHomePage = {
  admin: "/admin/healthcaredashboard",
  doctor: "/doctor/dashboard",
  patient: "/patient/dashboard",
  helpdesk: "/helpdesk/dashboard",
  pharmacy: "/pharmacy/dashboard",
  laboratory: "/laboratory/dashboard", 
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { tenant, isLoading } = useTenant();
  const tenantName = tenant?.name || "OrDo Health";

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    };
    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    router.push("/");
  };

  const isLoggedIn = !!user;
  const role = user?.role as string;
  const currentRole = (role === "admin" || role === "doctor" || role === "patient" || role === "helpdesk" || role === "pharmacy" || role === "laboratory")
    ? role
    : "patient";

  const navItems = [
    ...roleNavConfig.common,
    ...(roleNavConfig[currentRole as keyof typeof roleNavConfig] || []),
  ];

  const homeHref = isLoggedIn
    ? roleHomePage[currentRole as keyof typeof roleHomePage] || "/"
    : "/";

  const displayName = user?.full_name_en || user?.name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo – with OrDo Logo - Increased size, no background */}
          <Link href={homeHref} className="flex items-center gap-3 group">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <img 
                src="/OrDo%20New%20Logo.png"
                alt="OrDo Logo" 
                className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-200"
              />
            </div>
            <div>
              <span className="text-xl font-bold text-[#3B1E6F] dark:text-white">
                {tenantName}
              </span>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5 tracking-wide">
                Healthcare Information System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation – role‑based */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-[#7A329F] dark:text-gray-300 dark:hover:text-[#9B4DBF] font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth/User Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <button className="p-2 text-gray-600 hover:text-[#7A329F] dark:text-gray-400 dark:hover:text-[#9B4DBF] relative transition-colors">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="relative">
                  <button
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#3B1E6F] to-[#7A329F] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {displayName.split(" ")[0]}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {displayName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href={roleHomePage[currentRole] || "/"}
                        className="flex items-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-[#3B1E6F] dark:hover:text-[#7A329F] transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User size={16} />
                        <span>Dashboard</span>
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                        <button
                          className="flex items-center space-x-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="flex items-center space-x-2 px-4 py-2 text-[#7A329F] hover:text-[#3B1E6F] dark:text-[#9B4DBF] dark:hover:text-[#7A329F] font-medium transition-colors">
                    <LogIn size={18} />
                    <span>Login</span>
                  </button>
                </Link>
                <Link href="/register">
                  <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#3B1E6F] via-[#7A329F] to-[#0D5CB3] text-white rounded-lg hover:opacity-90 transition-all shadow-lg shadow-[#3B1E6F]/20">
                    <UserPlus size={18} />
                    <span>Sign Up</span>
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-[#7A329F] dark:text-gray-400 dark:hover:text-[#9B4DBF] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu – role‑based */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex flex-col space-y-4">
              {isLoggedIn && (
                <div className="flex items-center space-x-3 px-2 py-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3B1E6F] to-[#7A329F] rounded-full flex items-center justify-center text-white font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{displayName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                </div>
              )}

              {/* Mobile nav items */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#7A329F] dark:hover:text-[#9B4DBF] font-medium py-2 px-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-4 space-y-3 border-t border-gray-100 dark:border-gray-800">
                {isLoggedIn ? (
                  <>
                    <Link href="/profile">
                      <button
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-[#7A329F] dark:text-[#9B4DBF] border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User size={18} />
                        <span>My Profile</span>
                      </button>
                    </Link>
                    <button
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <button
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-[#7A329F] border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogIn size={18} />
                        <span>Login</span>
                      </button>
                    </Link>
                    <Link href="/register">
                      <button
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-[#3B1E6F] via-[#7A329F] to-[#0D5CB3] text-white rounded-lg hover:opacity-90 transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserPlus size={18} />
                        <span>Sign Up Free</span>
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}