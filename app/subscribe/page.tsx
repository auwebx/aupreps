"use client";

import { useAuth } from "@/components/AuthProvider";
import PaystackButton from "@/components/PaystackButton";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export default function Subscribe() {
  const { user } = useAuth();

  const generateReference = () => {
    return `auwebx-pro-${user?.id || "guest"}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSuccess = async (response: { reference: string }) => {
    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: response.reference,
          user_id: user?.id,
        }),
      });

      if (!res.ok) throw new Error("Verification failed");
      toast.success("Payment successful! You're now Pro!", {
        description: "Unlimited access activated.",
      });
    } catch {
      toast.error("Payment verification failed", {
        description: "Contact support if charged.",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">
        Upgrade to Pro
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <Card className="p-8 bg-slate-800/50 backdrop-blur border-slate-700">
          <h3 className="text-2xl font-bold mb-4">Free</h3>
          <p className="text-5xl font-bold mb-6">₦0</p>
          <ul className="space-y-3 mb-8 text-left">
            <li>50 questions/day</li>
            <li>Basic explanations</li>
            <li>Offline mode</li>
          </ul>
          <button disabled className="w-full py-4 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed">
            Current Plan
          </button>
        </Card>

        {/* Pro Monthly – RECOMMENDED */}
        <Card className="p-8 bg-gradient-to-br from-pink-600 to-purple-600 transform scale-105 border-pink-400 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">
            MOST POPULAR
          </div>
          <h3 className="text-3xl font-bold mb-4">Pro Monthly</h3>
          <p className="text-6xl font-bold mb-6">₦2,900</p>
          <ul className="space-y-3 mb-8 text-left">
            <li>Unlimited questions</li>
            <li>AI explanations</li>
            <li>Full timed tests</li>
            <li>Leaderboard</li>
            <li>Performance analytics</li>
          </ul>

          <PaystackButton
            email={user?.email || "user@auwebx.com"}
            amount={290000}
            reference={generateReference()}
            onSuccess={handleSuccess}
            label="Pay ₦2,900 with Paystack"
          />
        </Card>

        {/* Pro Yearly */}
        <Card className="p-8 bg-slate-800/50 backdrop-blur border-slate-700">
          <h3 className="text-2xl font-bold mb-4">Pro Yearly</h3>
          <p className="text-5xl font-bold mb-2">₦19,900</p>
          <p className="text-green-400 font-bold mb-6">Save 43%!</p>
          <ul className="space-y-3 mb-8 text-left">
            <li>Everything in Pro</li>
            <li>Priority support</li>
            <li>Early access</li>
          </ul>
          <PaystackButton
            email={user?.email || "user@auwebx.com"}
            amount={1990000}
            reference={generateReference()}
            onSuccess={handleSuccess}
            label="Pay ₦19,900 (Yearly)"
          />
        </Card>
      </div>
    </div>
  );
}