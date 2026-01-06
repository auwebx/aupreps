"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/ld+json",
            Accept: "application/ld+json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        setSubmitted(true);
        toast.success("Email sent!", {
          description:
            "If the email exists, you'll receive a password reset link.",
          duration: 6000,
        });
      } else {
        throw new Error("Failed to send reset email");
      }
    } catch (error: unknown) {
      console.error(error);

      toast.error("Something went wrong", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-white to-green-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl p-8 border-4 border-green-600 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center overflow-hidden relative">
            <Image
              src="/logo.png"
              alt="AUPreps Logo"
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-green-800">
            Forgot Password?
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {submitted
              ? "Check your email for reset instructions"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg">
              <p className="text-green-800 text-sm font-medium mb-2">
                Email Sent Successfully!
              </p>
              <p className="text-green-700 text-sm">
                If an account exists with <strong>{email}</strong>, you will
                receive a password reset link shortly. Please check your inbox
                and spam folder.
              </p>
            </div>

            <Link href="/login" className="block">
              <Button
                variant="outline"
                className="w-full border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Login
              </Button>
            </Link>

            <button
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
              className="w-full text-sm text-green-700 hover:underline font-medium"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border-2 border-green-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Link href="/login" className="block">
              <Button
                variant="outline"
                type="button"
                className="w-full border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Login
              </Button>
            </Link>
          </form>
        )}

        <div className="mt-6 pt-6 border-t-2 border-gray-200">
          <p className="text-center text-sm text-gray-600">
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
    </div>
  );
}
