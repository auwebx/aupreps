// app/dashboard/user/subscription/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

function VerifyPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    "verifying"
  );
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");

      if (!reference) {
        setStatus("failed");
        setMessage("No payment reference found");
        return;
      }

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setStatus("failed");
          setMessage("Authentication required. Please refresh the page.");
          return;
        }

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

        // Verify payment with Paystack
        const verifyResponse = await fetch(
          `/api/paystack/verify?reference=${reference}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok || !verifyData.success) {
          throw new Error(verifyData.error || "Payment verification failed");
        }

        // Create subscription record
        const subscriptionResponse = await fetch(`${API_URL}/subscriptions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/ld+json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: verifyData.amount / 100, // Convert from kobo to naira
            paymentMethod: "paystack",
            paystackReference: reference,
          }),
        });

        if (!subscriptionResponse.ok) {
          const errorData = await subscriptionResponse.json();
          throw new Error(
            errorData["hydra:description"] ||
              errorData.message ||
              "Failed to create subscription"
          );
        }

        setStatus("success");
        setMessage("Payment successful! Your subscription is now active.");

        // Redirect after 3 seconds
        setTimeout(() => {
          router.push("/dashboard/user");
        }, 3000);
      } catch (error: unknown) {
        console.error("Verification error:", error);
        setStatus("failed");

        if (error instanceof Error) {
          setMessage(error.message || "Payment verification failed");
        } else {
          setMessage("Payment verification failed");
        }
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/10">
        {status === "verifying" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <svg
                className="animate-spin h-16 w-16 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Verifying Payment</h2>
            <p className="text-gray-300">{message}</p>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-sm text-gray-300">
              <p>Please wait while we confirm your payment with Paystack...</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto border-4 border-green-500/50">
              <svg
                className="w-10 h-10 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-400">
              Payment Successful!
            </h2>
            <p className="text-gray-300">{message}</p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                🎉 You now have access to all premium features!
              </p>
            </div>
            <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
          </div>
        )}

        {status === "failed" && (
          <div className="text-center space-y-4">
            <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-400">Payment Failed</h2>
            <p className="text-gray-300">{message}</p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-gray-300">
              <p>
                If you believe this is an error, please contact support or try
                again.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/dashboard/user/subscription")}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/dashboard/user")}
                className="w-full text-gray-300 bg-white/5 py-3 px-4 rounded-lg hover:bg-white/10 font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <DashboardLayout allowedRoles={["ROLE_USER", "ROLE_ADMIN", "ROLE_STAFF"]}>
      <VerifyPaymentContent />
    </DashboardLayout>
  );
}
