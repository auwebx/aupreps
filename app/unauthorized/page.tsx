"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Shield } from "lucide-react";
import { getDashboardRoute } from "@/lib/auth-utils";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const { user } = useAuth();
  const router = useRouter();

  const goToDashboard = () => {
    if (user) {
      const route = getDashboardRoute(user.roles);
      router.push(route);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-purple-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
        <Shield className="mx-auto text-red-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-gray-300 mb-6">
          You dont have permission to access this page.
        </p>
        <Button
          onClick={goToDashboard}
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
        >
          Go to Your Dashboard
        </Button>
      </div>
    </div>
  );
}