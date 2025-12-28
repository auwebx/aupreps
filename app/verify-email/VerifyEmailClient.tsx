"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link - no token provided");
      return;
    }

    const verify = async () => {
      try {
        const result = await api.verifyEmail(token);
        setStatus("success");
        setMessage(result.message || "Email verified successfully!");
        setTimeout(() => router.push("/login"), 3000);
      } catch (error: unknown) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Verification failed. The link may be invalid or expired."
        );
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-purple-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-white mb-4">Success!</h1>
            <p className="text-gray-300 mb-6">{message}</p>
            <p className="text-sm text-gray-400">Redirecting to login...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
            <p className="text-gray-300 mb-6">{message}</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                Go to Login
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}