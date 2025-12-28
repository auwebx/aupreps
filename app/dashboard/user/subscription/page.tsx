"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PaymentFormData {
  amount: number;
  paymentMethod: "paystack" | "bank_transfer";
  transactionReference?: string;
}

interface PaystackInitializeResponse {
  authorization_url: string;
  access_code?: string;
  reference?: string;
}

interface SubscriptionData {
  amount: number;
  paymentMethod: "paystack" | "bank_transfer";
  transactionReference?: string;
}

interface SubscriptionResponse {
  id: string | number;
  amount: number;
  paymentMethod: string;
  status?: string;
  createdAt?: string;
}

interface ErrorResponse {
  "hydra:description"?: string;
  message?: string;
  detail?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 5000,
    paymentMethod: "paystack",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false);

  const WHATSAPP_NUMBER = "+2347043619930";
  const API_URL  = process.env.NEXT_PUBLIC_API_URL + "/api";


  const handlePaystackPayment = async (amount: number): Promise<string> => {
    const response = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: amount * 100 }),
    });

    if (!response.ok) {
      throw new Error("Failed to initialize payment");
    }

    const data = await response.json() as PaystackInitializeResponse;
    return data.authorization_url;
  };

  const createSubscription = async (
    subscriptionData: SubscriptionData
  ): Promise<SubscriptionResponse> => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/ld+json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const errorData = await response.json() as ErrorResponse;
      throw new Error(
        errorData["hydra:description"] ||
          errorData.message ||
          "Failed to create subscription"
      );
    }

    return await response.json() as SubscriptionResponse;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formData.amount < 2000) {
        throw new Error("Minimum subscription amount is ₦2,000");
      }

      const subscriptionData: SubscriptionData = {
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
      };

      if (formData.paymentMethod === "paystack") {
        const authorizationUrl = await handlePaystackPayment(formData.amount);
        window.location.href = authorizationUrl;
      } else if (formData.paymentMethod === "bank_transfer") {
        if (
          !formData.transactionReference ||
          formData.transactionReference.trim() === ""
        ) {
          throw new Error("Please enter your transaction reference");
        }

        subscriptionData.transactionReference = formData.transactionReference;
        await createSubscription(subscriptionData);
        setShowWhatsAppButton(true);
        setLoading(false);
        return;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const sendToWhatsApp = (): void => {
    const message = `Hello, I just made a bank transfer for subscription.

Amount: ₦${formData.amount.toLocaleString()}
Transaction Reference: ${formData.transactionReference ?? "N/A"}

Please confirm my payment. Thank you!`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(
      /[^0-9]/g,
      ""
    )}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        {!showWhatsAppButton ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Subscribe to Top-Up
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Get unlimited access to all features
              </p>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount (₦)
                </label>
                <input
                  type="number"
                  id="amount"
                  min="2000"
                  step="100"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-900"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Minimum: ₦2,000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paystack"
                      checked={formData.paymentMethod === "paystack"}
                      onChange={() =>
                        setFormData({ ...formData, paymentMethod: "paystack" })
                      }
                      className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          Paystack
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Instant
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Pay securely with your debit/credit card
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === "bank_transfer"}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          paymentMethod: "bank_transfer",
                        })
                      }
                      className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          Bank Transfer
                        </span>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          Manual
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Transfer to our bank account
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.paymentMethod === "bank_transfer" && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg space-y-4 border border-blue-200">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Bank Details
                    </h3>
                    <div className="bg-white rounded-md p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium text-gray-900">
                          Access Bank
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Name:</span>
                        <span className="font-medium text-gray-900">
                          Your Company Name
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-bold text-gray-900 text-lg">
                          0123456789
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reference"
                      className="block text-sm font-medium text-gray-800 mb-2"
                    >
                      Transaction Reference{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="reference"
                      placeholder="e.g., TRF/12345678"
                      value={formData.transactionReference ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transactionReference: e.target.value,
                        })
                      }
                      className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-gray-900"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-700">
                      Enter the reference number from your bank transfer receipt
                    </p>
                  </div>

                  <div className="bg-white border border-green-300 rounded-md p-3 flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs text-gray-700">
                      After submitting, you will be able to send your payment
                      proof screenshot via WhatsApp for quick confirmation
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Processing...
                  </span>
                ) : (
                  "Continue to Payment"
                )}
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = "/dashboard/user")}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg font-medium hover:scale-105 transition-transform shadow-md"
              >
                Back to Dashboard
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto border-4 border-green-200">
              <svg
                className="w-10 h-10 text-green-600"
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

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Submitted!
              </h2>
              <p className="text-gray-600">
                Now send your payment proof via WhatsApp for quick confirmation
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg text-left border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                Payment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Amount:</span>
                  <span className="font-bold text-gray-900">
                    ₦{formData.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Reference:</span>
                  <span className="font-medium text-gray-900">
                    {formData.transactionReference ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Status:</span>
                  <span className="text-yellow-600 font-medium">
                    Pending Confirmation
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={sendToWhatsApp}
                className="w-full bg-green-600 text-white py-4 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium flex items-center justify-center gap-3 transition-colors shadow-md"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span className="text-lg">Send Proof via WhatsApp</span>
              </button>

              <button
                onClick={() => router.push("/dashboard/user")}
                className="w-full text-gray-700 bg-gray-100 py-3 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Skip for now, go to dashboard
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Your payment will be confirmed within 24 hours after we receive
              your proof
            </p>
          </div>
        )}
      </div>
    </div>
  );
}