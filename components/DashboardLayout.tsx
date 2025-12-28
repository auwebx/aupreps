"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getUserRole } from "@/lib/auth-utils";
import {
  Home,
  Users,
  Settings,
  LogOut,
  BarChart,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function DashboardLayout({
  children,
  allowedRoles,
}: DashboardLayoutProps) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Inside DashboardLayout.tsx
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login"; // ← this is the key
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-green-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Check if user has required role
  const hasAccess = allowedRoles.some((role) => user.roles.includes(role));
  if (!hasAccess) {
    router.push("/unauthorized");
    return null;
  }

  const userRole = getUserRole(user.roles);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-green-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/5 backdrop-blur-lg border-r border-white/10 p-6 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="md:hidden flex justify-end mb-4">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white hover:text-green-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-green-300 text-sm capitalize">{userRole} Portal</p>
        </div>

        <nav className="space-y-2">
          <Link href={`/dashboard/${userRole}`}>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
              <Home size={20} className="text-green-500" />
              <span>Overview</span>
            </button>
          </Link>

          {(userRole === "admin" || userRole === "staff") && (
            <Link href={`/dashboard/${userRole}/exams`}>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
                <Users size={20} className="text-green-500" />
                <span>Exams</span>
              </button>
            </Link>
          )}

          {(userRole === "admin" || userRole === "staff") && (
            <Link href={`/dashboard/${userRole}/subjects`}>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
                <Users size={20} className="text-green-500" />
                <span>Subjects</span>
              </button>
            </Link>
          )}

          {(userRole === "admin" || userRole === "staff") && (
            <Link href={`/dashboard/${userRole}/topics`}>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
                <Users size={20} className="text-green-500" />
                <span>Topics</span>
              </button>
            </Link>
          )}

          {(userRole === "admin" || userRole === "staff") && (
            <Link href={`/dashboard/${userRole}/questions`}>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
                <Users size={20} className="text-green-500" />
                <span>Questions</span>
              </button>
            </Link>
          )}

          {(userRole === "admin" || userRole === "staff") && (
            <Link href={`/dashboard/${userRole}/users`}>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
                <Users size={20} className="text-green-500" />
                <span>Users</span>
              </button>
            </Link>
          )}

          {userRole === "admin" && (
            <Link href={`/dashboard/${userRole}/reports`}>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
                <BarChart size={20} className="text-green-500" />
                <span>Reports</span>
              </button>
            </Link>
          )}

          {userRole === "admin" && (
            <Link href={`/dashboard/${userRole}/subscriptions`}>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
                <BarChart size={20} className="text-green-500" />
                <span>Subscriptions</span>
              </button>
            </Link>
          )}

          <Link href={`/dashboard/${userRole}/tests`}>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
              <UserCircle size={20} className="text-green-500" />
              <span>Tests</span>
            </button>
          </Link>

          <Link href={`/dashboard/${userRole}/ocr`}>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
              <UserCircle size={20} className="text-green-500" />
              <span>OCR</span>
            </button>
          </Link>

          <Link href={`/dashboard/${userRole}/subscription`}>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
              <UserCircle size={20} className="text-green-500" />
              <span>Subscribe</span>
            </button>
          </Link>

          <Link href={`/dashboard/${userRole}/profile`}>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
              <UserCircle size={20} className="text-green-500" />
              <span>Profile</span>
            </button>
          </Link>

          <Link href={`/dashboard/${userRole}/settings`}>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition">
              <Settings size={20} className="text-green-500" />
              <span>Settings</span>
            </button>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={logout}
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-white"
          >
            <LogOut size={18} className="text-green-500" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="p-8 md:ml-64">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                className="md:hidden text-white"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-gray-300 text-sm md:text-base">
                  {user.email} • {user.phoneNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end md:justify-start space-x-4">
              <div className="text-right md:text-right">
                <p className="text-sm text-gray-400">Role</p>
                <p className="text-white font-semibold capitalize">
                  {userRole}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-400 flex items-center justify-center text-white font-bold text-lg">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
            </div>
          </div>
        </header>
        {/* Dashboard Content */}
        {children}
      </main>
    </div>
  );
}
