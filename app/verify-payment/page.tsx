// app/verify-payment/page.tsx  ← Now a Server Component
import { Suspense } from 'react';
import VerifyPaymentClient from './VerifyPaymentClient';

export const dynamic = 'force-dynamic'; // Optional, but safe to keep

export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 to-purple-950 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/10 text-center">
            <svg className="animate-spin h-16 w-16 text-purple-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-white">Verifying Payment</h2>
            <p className="text-gray-300 mt-2">Please wait while we confirm your payment...</p>
          </div>
        </div>
      }
    >
      <VerifyPaymentClient />
    </Suspense>
  );
}