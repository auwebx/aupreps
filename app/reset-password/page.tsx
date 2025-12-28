"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Password validation states
  const [validations, setValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    passwordsMatch: false,
  });

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error("Invalid reset link", {
        description: "No token provided in the URL.",
      });
      return;
    }
    setTokenValid(true);
  }, [token]);

  // Update password validations
  useEffect(() => {
    const pwd = passwords.password;
    setValidations({
      minLength: pwd.length >= 8,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      passwordsMatch:
        pwd.length > 0 &&
        passwords.confirmPassword.length > 0 &&
        pwd === passwords.confirmPassword,
    });
  }, [passwords]);

  const isPasswordValid = () => {
    return (
      validations.minLength &&
      validations.hasUpperCase &&
      validations.hasLowerCase &&
      validations.hasNumber &&
      validations.passwordsMatch
    );
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!isPasswordValid()) {
    toast.error("Please meet all password requirements");
    return;
  }

  if (!token) {
    toast.error("Reset token is missing or invalid.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reset-password?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json",
          Accept: "application/ld+json",
        },
        body: JSON.stringify({
          token,
          password: passwords.password,
          newPassword: passwords.password, // compatibility with some APIs
        }),
      }
    );

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = "Failed to reset password. Token may be expired.";

      // Handle ApiPlatform validation errors
      if (
        typeof data === "object" &&
        data !== null &&
        "violations" in data &&
        Array.isArray((data as { violations: unknown }).violations)
      ) {
        errorMessage = (data as {
          violations: { message: string }[];
        }).violations
          .map((v) => v.message)
          .join(", ");
      }
      // Hydra error description
      else if (
        typeof data === "object" &&
        data !== null &&
        "hydra:description" in data &&
        typeof (data as { "hydra:description": string })["hydra:description"] === "string"
      ) {
        errorMessage = (data as { "hydra:description": string })["hydra:description"];
      }
      // Generic message
      else if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message: string }).message === "string"
      ) {
        errorMessage = (data as { message: string }).message;
      }

      throw new Error(errorMessage);
    }

    setSuccess(true);
    toast.success("Password reset successful!", {
      description: "You can now login with your new password.",
      duration: 5000,
    });

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Please try requesting a new reset link.";

    toast.error("Password reset failed", {
      description: message,
    });
  } finally {
    setLoading(false);
  }
};



  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-white to-green-800 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl p-8 border-4 border-red-600 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-red-800">Invalid Link</h1>
            <p className="text-sm text-gray-600 mt-1">
              This password reset link is invalid or has expired
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/forgot-password">
              <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all shadow-lg">
                Request New Reset Link
              </Button>
            </Link>

            <Link href="/login">
              <Button
                variant="outline"
                className="w-full border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold"
              >
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-white to-green-800 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl p-8 border-4 border-green-600 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-green-800">
              Password Reset!
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Your password has been successfully reset
            </p>
          </div>

          <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg mb-6">
            <p className="text-green-800 text-sm font-medium text-center">
              Redirecting to login page...
            </p>
          </div>

          <Link href="/login">
            <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all shadow-lg">
              Continue to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-800">
            Reset Password
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={passwords.password}
                onChange={(e) =>
                  setPasswords({ ...passwords, password: e.target.value })
                }
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
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-50 border-2 border-green-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-green-700 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Password must contain:
            </p>
            <div className="space-y-1 text-xs">
              <ValidationItem
                valid={validations.minLength}
                text="At least 8 characters"
              />
              <ValidationItem
                valid={validations.hasUpperCase}
                text="One uppercase letter"
              />
              <ValidationItem
                valid={validations.hasLowerCase}
                text="One lowercase letter"
              />
              <ValidationItem
                valid={validations.hasNumber}
                text="One number"
              />
              <ValidationItem
                valid={validations.passwordsMatch}
                text="Passwords match"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !isPasswordValid()}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-green-700 hover:underline font-semibold"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ValidationItem({ valid, text }: { valid: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {valid ? (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      )}
      <span className={valid ? "text-green-700" : "text-gray-500"}>
        {text}
      </span>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-white to-green-800 flex items-center justify-center">
        <div className="text-green-800 text-xl">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}