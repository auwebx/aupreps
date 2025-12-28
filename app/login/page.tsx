"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowResendVerification(false);

    try {
      await login({
        username: form.email,
        password: form.password,
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "requiresVerification" in error &&
        (error as { requiresVerification?: boolean }).requiresVerification
      ) {
        setShowResendVerification(true);
        setResendEmail(form.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await api.resendVerification(resendEmail);
      toast.success("Verification email sent! Please check your inbox.");
      setShowResendVerification(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to resend verification email";

      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-white to-green-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl p-8 border-4 border-green-600 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-800">Welcome Back</h1>
          <p className="text-sm text-gray-600 mt-1">
            Secure Online Examination Platform
          </p>
        </div>

        {showResendVerification && (
          <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
            <p className="text-yellow-800 text-sm mb-2 font-medium">
              Your email is not verified. Please check your inbox.
            </p>
            <Button
              onClick={handleResendVerification}
              variant="outline"
              className="w-full text-sm bg-yellow-100 border-yellow-400 hover:bg-yellow-200 text-yellow-900"
            >
              Resend Verification Email
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border-2 border-green-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-50 border-2 border-green-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-green-700 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-green-700 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <p className="text-center mt-6 text-gray-700">
          Dont have an account?{" "}
          <Link
            href="/register"
            className="text-green-700 hover:underline font-semibold"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
