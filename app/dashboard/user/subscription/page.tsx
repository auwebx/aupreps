"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PaymentFormData {
  amount: number;
  paymentMethod: "paystack" | "bank_transfer";
  transactionReference?: string;
  phoneNumber?: string;
  usePhoneAsReference: boolean;
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
  phoneNumber?: string;
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
    usePhoneAsReference: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  //const [setShowWhatsAppButton] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [step, setStep] = useState<"details" | "payment" | "confirmation">(
    "details"
  );

  const WHATSAPP_NUMBER = "+2349013039060";
  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api";
  const BANK_ACCOUNT_NUMBER = "0123456789";
  const BANK_ACCOUNT_NAME = "Abdullahi Umar Abubakar";
  const BANK_NAME = "Opay";

  // Generate a transaction reference
  const generateTransactionReference = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TRF${timestamp}${random}`;
  };

  useEffect(() => {
    if (
      formData.paymentMethod === "bank_transfer" &&
      !formData.transactionReference
    ) {
      setFormData((prev) => ({
        ...prev,
        transactionReference: generateTransactionReference(),
      }));
    }
  }, [formData.paymentMethod]);

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

    const data = (await response.json()) as PaystackInitializeResponse;
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
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(
        errorData["hydra:description"] ||
          errorData.message ||
          "Failed to create subscription"
      );
    }

    return (await response.json()) as SubscriptionResponse;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formData.amount < 5000) {
        throw new Error("Minimum subscription amount is ₦5,000");
      }

      const subscriptionData: SubscriptionData = {
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
      };

      if (formData.paymentMethod === "paystack") {
        const authorizationUrl = await handlePaystackPayment(formData.amount);
        window.location.href = authorizationUrl;
      } else if (formData.paymentMethod === "bank_transfer") {
        // Use phone number as reference if selected
        if (formData.usePhoneAsReference) {
          if (!formData.phoneNumber || formData.phoneNumber.trim() === "") {
            throw new Error("Please enter your phone number");
          }
          subscriptionData.transactionReference = formData.phoneNumber;
          subscriptionData.phoneNumber = formData.phoneNumber;
        } else {
          if (
            !formData.transactionReference ||
            formData.transactionReference.trim() === ""
          ) {
            throw new Error("Please enter a transaction reference");
          }
          subscriptionData.transactionReference = formData.transactionReference;
        }

        await createSubscription(subscriptionData);
        setStep("confirmation");
        setLoading(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string): void => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const sendToWhatsApp = (): void => {
    const message = `PAYMENT CONFIRMATION REQUEST

Amount: ₦${formData.amount.toLocaleString()}
Reference: ${
      formData.usePhoneAsReference
        ? formData.phoneNumber
        : formData.transactionReference
    }
Payment Method: Bank Transfer
Date: ${new Date().toLocaleDateString()}

Please confirm my payment. Thank you!`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(
      /[^0-9]/g,
      ""
    )}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    setTimeout(() => {
      router.push("/dashboard/user");
    }, 2000);
  };

  const renderBankTransferDetails = () => (
    <div className="bg-linear-to-br from-blue-50 to-blue-100 p-5 rounded-lg space-y-6 border border-blue-200">
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
          <svg
            className="w-6 h-6 text-blue-600"
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
          Bank Transfer Instructions
        </h3>

        {/* Step 1: Copy Bank Details */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                1
              </span>
              Copy Bank Details
            </h4>
            <button
              onClick={() =>
                copyToClipboard(BANK_ACCOUNT_NUMBER, "Account Number")
              }
              className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg font-medium transition-colors"
            >
              {copySuccess ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Account Name:</span>
              <span className="font-bold text-gray-900">
                {BANK_ACCOUNT_NAME}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Account Number:</span>
              <span className="font-bold text-gray-900 text-lg">
                {BANK_ACCOUNT_NUMBER}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Bank Name:</span>
              <span className="font-medium text-gray-900">{BANK_NAME}</span>
            </div>
          </div>
        </div>

        {/* Step 2: Make Transfer */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center mb-3">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">
              2
            </span>
            <h4 className="font-medium text-gray-800">Make the Transfer</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-700">
                Transfer{" "}
                <strong className="text-green-700">
                  exactly ₦{formData.amount.toLocaleString()}
                </strong>{" "}
                to the account above
              </p>
            </div>
            <p className="text-gray-600 text-xs">
              Open your banking app or visit your bank to make the transfer
            </p>
          </div>
        </div>

        {/* Step 3: Choose Reference */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center mb-4">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">
              3
            </span>
            <h4 className="font-medium text-gray-800">Transaction Reference</h4>
          </div>

          <div className="space-y-4">
            {/* Option 1: Use phone number */}
            <div className="flex items-start gap-3">
              <input
                type="radio"
                id="usePhone"
                checked={formData.usePhoneAsReference}
                onChange={() =>
                  setFormData({
                    ...formData,
                    usePhoneAsReference: true,
                    transactionReference: formData.phoneNumber || "",
                  })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="usePhone"
                  className="font-medium text-gray-800 mb-1 block"
                >
                  Use Phone Number as Reference
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Enter your phone number to use as transaction reference
                </p>
                <input
                  type="tel"
                  placeholder="e.g., 08012345678"
                  value={formData.phoneNumber || ""}
                  onChange={(e) => {
                    const phone = e.target.value.replace(/\D/g, "");
                    setFormData({
                      ...formData,
                      phoneNumber: phone,
                      transactionReference: formData.usePhoneAsReference
                        ? phone
                        : formData.transactionReference,
                    });
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  disabled={!formData.usePhoneAsReference}
                />
              </div>
            </div>

            {/* Option 2: Custom reference */}
            <div className="flex items-start gap-3">
              <input
                type="radio"
                id="useCustom"
                checked={!formData.usePhoneAsReference}
                onChange={() =>
                  setFormData({
                    ...formData,
                    usePhoneAsReference: false,
                  })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="useCustom"
                  className="font-medium text-gray-800 mb-1 block"
                >
                  Custom Reference
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Use a custom reference (letters and numbers only)
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="e.g., TRF123456"
                    value={formData.transactionReference || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transactionReference: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    disabled={formData.usePhoneAsReference}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        transactionReference: generateTransactionReference(),
                      })
                    }
                    className="text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    Generate New Reference
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-medium text-green-800 mb-1">Important:</p>
            <p className="text-sm text-gray-700">
              Use this reference when making the transfer. After completing the
              transfer, you will confirm your payment via WhatsApp for instant
              activation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentConfirmation = () => (
    <div className="text-center space-y-8">
      {/* Success Animation */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-green-100 rounded-full animate-ping opacity-20"></div>
        </div>
        <div className="bg-linear-to-br from-green-400 to-emerald-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto border-4 border-white shadow-lg relative">
          <svg
            className="w-12 h-12 text-white"
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
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Details Submitted!
        </h2>
        <p className="text-gray-600">
          Complete the bank transfer and confirm via WhatsApp for instant
          activation
        </p>
      </div>

      {/* Payment Summary Card */}
      <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 text-left">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">
          Payment Summary
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">
                Amount to Transfer
              </div>
              <div className="text-2xl font-bold text-green-700">
                ₦{formData.amount.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Reference</div>
              <div className="text-lg font-medium text-gray-900 font-mono">
                {formData.usePhoneAsReference
                  ? formData.phoneNumber
                  : formData.transactionReference}
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    formData.usePhoneAsReference
                      ? formData.phoneNumber!
                      : formData.transactionReference!,
                    "Reference"
                  )
                }
                className="text-xs text-blue-600 hover:text-blue-700 mt-1"
              >
                {copySuccess ? "✓ Copied!" : "Copy reference"}
              </button>
            </div>
          </div>

          {/* Quick Copy Section */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3">
              Quick Copy Details
            </h4>
            <div className="space-y-2">
              <button
                onClick={() =>
                  copyToClipboard(
                    `Transfer ${formData.amount} to ${BANK_ACCOUNT_NUMBER} (${BANK_ACCOUNT_NAME})`,
                    "Transfer details"
                  )
                }
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-sm flex justify-between items-center"
              >
                <span className="text-gray-700">Bank transfer details</span>
                <span className="text-blue-600 font-medium">Copy</span>
              </button>

              <button
                onClick={() =>
                  copyToClipboard(
                    `₦${formData.amount} - Ref: ${
                      formData.usePhoneAsReference
                        ? formData.phoneNumber
                        : formData.transactionReference
                    }`,
                    "Amount & Reference"
                  )
                }
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-sm flex justify-between items-center"
              >
                <span className="text-gray-700">Amount & Reference</span>
                <span className="text-blue-600 font-medium">Copy</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details Card */}
      <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 text-left">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Bank Account Details</h3>
          <button
            onClick={() =>
              copyToClipboard(
                `${BANK_ACCOUNT_NUMBER} - ${BANK_ACCOUNT_NAME} - ${BANK_NAME}`,
                "Bank details"
              )
            }
            className="text-sm bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg font-medium"
          >
            Copy All
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <span className="text-gray-600">Account Name:</span>
            <span className="font-bold text-gray-900">{BANK_ACCOUNT_NAME}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <span className="text-gray-600">Account Number:</span>
            <span className="font-bold text-gray-900 text-lg">
              {BANK_ACCOUNT_NUMBER}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <span className="text-gray-600">Bank Name:</span>
            <span className="font-medium text-gray-900">{BANK_NAME}</span>
          </div>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Reminder:</strong> Use the reference above when making the
            transfer
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <button
            onClick={sendToWhatsApp}
            className="w-full bg-green-600 text-white py-4 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <div className="text-left">
              <div className="text-lg font-semibold">Confirm via WhatsApp</div>
              <div className="text-sm opacity-90">Send payment proof</div>
            </div>
          </button>
{/* 
          <button
            onClick={() => router.push("/dashboard/user")}
            className="w-full bg-white text-gray-700 border-2 border-gray-300 py-4 px-4 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-3 transition-all"
          >
            <svg
              className="w-6 h-6 text-gray-600"
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
            <div className="text-left">
              <div className="text-lg font-semibold">I will Transfer Later</div>
              <div className="text-sm">Return to dashboard</div>
            </div>
          </button> */}
        </div>

        <button
          onClick={() => {
            setStep("details");
           // setShowWhatsAppButton(false);
          }}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Edit payment details
        </button>
      </div>

      {/* Timeline */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Details Submitted
            </span>
          </div>
          <div className="h-1 w-12 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">2</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Make Transfer
            </span>
          </div>
          <div className="h-1 w-12 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold">3</span>
            </div>
            <span className="text-sm font-medium text-gray-500">
              Confirm via WhatsApp
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === "confirmation"
              ? "Complete Your Payment"
              : "Subscribe & Top-Up"}
          </h1>
          <p className="text-gray-600">
            {step === "confirmation"
              ? "Follow these steps to complete your bank transfer"
              : "Get unlimited access to all features"}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {step === "confirmation" ? (
            renderPaymentConfirmation()
          ) : (
            <>
              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="space-y-8"
              >
                {/* Amount Selection */}
                <div className="space-y-4">
                  <label className="block text-lg font-medium text-gray-900">
                    Select Amount (₦)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[5000, 10000, 20000, 50000].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setFormData({ ...formData, amount })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          formData.amount === amount
                            ? "border-blue-500 bg-blue-50 text-blue-700 font-bold"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-xl">
                          ₦{amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {amount === 5000
                            ? "Basic"
                            : amount === 10000
                            ? "Standard"
                            : amount === 20000
                            ? "Premium"
                            : "Ultimate"}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Amount
                    </label>
                    <input
                      type="number"
                      min="5000"
                      step="100"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: Number(e.target.value),
                        })
                      }
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Minimum: ₦5,000
                    </p>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <label className="block text-lg font-medium text-gray-900">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label
                      className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        formData.paymentMethod === "paystack"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paystack"
                        checked={formData.paymentMethod === "paystack"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            paymentMethod: "paystack",
                          })
                        }
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            formData.paymentMethod === "paystack"
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.paymentMethod === "paystack" && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Paystack
                          </div>
                          <div className="text-sm text-gray-600">
                            Card/Bank Transfer
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full inline-block">
                        Instant
                      </div>
                    </label>

                    <label
                      className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        formData.paymentMethod === "bank_transfer"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={formData.paymentMethod === "bank_transfer"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            paymentMethod: "bank_transfer",
                            usePhoneAsReference: false,
                          })
                        }
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            formData.paymentMethod === "bank_transfer"
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.paymentMethod === "bank_transfer" && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Bank Transfer
                          </div>
                          <div className="text-sm text-gray-600">
                            Manual Transfer
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full inline-block">
                        Manual
                      </div>
                    </label>
                  </div>
                </div>

                {/* Bank Transfer Details */}
                {formData.paymentMethod === "bank_transfer" &&
                  renderBankTransferDetails()}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
                    <svg
                      className="w-5 h-5 shrink-0 mt-0.5"
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

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-4 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-6 w-6"
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
                    ) : formData.paymentMethod === "bank_transfer" ? (
                      "Submit"
                    ) : (
                      "Continue to Payment"
                    )}
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/user")}
                      className="flex-1 bg-white text-gray-700 border-2 border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>

                   {/*  <button
                      type="button"
                      onClick={() =>
                        (window.location.href =
                          "/dashboard/user/subscription/history")
                      }
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                    >
                      View History
                    </button> */}
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact support: info@aupreps.com | 0901-303-9060
          </p>
        </div>
      </div>
    </div>
  );
}
