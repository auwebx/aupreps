"use client";

import { toast } from "sonner";

interface PaystackButtonProps {
  email: string;
  amount: number; // in kobo
  reference: string;
  onSuccess: (response: { reference: string }) => void;
  onClose?: () => void;
  label?: string;
  className?: string;
}

export default function PaystackButton({
  email,
  amount,
  reference,
  label = "Pay with Paystack",
  className = "px-8 py-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg transition",
}: PaystackButtonProps) {
  const handlePayment = () => {
    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast.error("Paystack key not configured");
      return;
    }

    // CORRECT PAYSTACK URL FORMAT (2025)
    const url = new URL("https://checkout.paystack.com/");
    
    // Required parameters
    url.searchParams.append("key", process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);
    url.searchParams.append("email", email);
    url.searchParams.append("amount", amount.toString());
    url.searchParams.append("ref", reference);
    url.searchParams.append("currency", "NGN");

    // Optional metadata
    url.searchParams.append("metadata", JSON.stringify({
      custom_fields: [
        { display_name: "Platform", variable_name: "source", value: "AUWebX" },
        { display_name: "Customer", variable_name: "user_id", value: email }
      ]
    }));

    // Redirect — this works 100% on all browsers
    window.location.href = url.toString();
  };

  return (
    <button onClick={handlePayment} className={className} type="button">
      {label}
    </button>
  );
}