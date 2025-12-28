// app/verify-payment/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';


interface DebugInfo {
  error?: string;
  reference: string;
}

export default function VerifyPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      console.log('Payment reference:', reference);
      
      if (!reference) {
        setStatus('failed');
        setMessage('No payment reference found');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        if (!token) {
          setStatus('failed');
          setMessage('Session expired. Please log in and contact support with your payment reference.');
          setDebugInfo({ reference });
          return;
        }

        // const API_URL = 'http://localhost:8000/api';

        const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api";


        // Step 1: Verify payment with Paystack
        console.log('Step 1: Verifying with Paystack...');
        const verifyResponse = await fetch(`/api/paystack/verify?reference=${reference}`);
        const verifyData = await verifyResponse.json();
        
        console.log('Paystack verification response:', verifyData);

        if (!verifyResponse.ok || !verifyData.success) {
          throw new Error(verifyData.error || 'Payment verification failed');
        }

        // Step 2: Create subscription record
        console.log('Step 2: Creating subscription...');
        const subscriptionPayload = {
          amount: verifyData.amount / 100, // Convert from kobo to naira
          paymentMethod: 'paystack',
          paystackReference: reference,
        };
        
        console.log('Subscription payload:', subscriptionPayload);

        const subscriptionResponse = await fetch(`${API_URL}/subscriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/ld+json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(subscriptionPayload),
        });

        console.log('Subscription response status:', subscriptionResponse.status);

        if (!subscriptionResponse.ok) {
          const errorText = await subscriptionResponse.text();
          console.error('Subscription creation failed:', errorText);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            throw new Error(`Failed to create subscription: ${errorText}`);
          }
          
          throw new Error(errorData['hydra:description'] || errorData.message || 'Failed to create subscription');
        }

        const subscriptionData = await subscriptionResponse.json();
        console.log('Subscription created:', subscriptionData);

        setStatus('success');
        setMessage('Payment successful! Your subscription is now active.');
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/dashboard/user');
        }, 3000);

      } catch (error: unknown) {
  console.error('Verification error:', error);

  let errorMessage = 'Payment verification failed';
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  setStatus('failed');
  setMessage(errorMessage);
  setDebugInfo({ error: errorMessage, reference });
}

    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 to-purple-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/10">
        {status === 'verifying' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <svg className="animate-spin h-16 w-16 text-purple-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Verifying Payment</h2>
            <p className="text-gray-300">{message}</p>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-sm text-gray-300">
              <p>Please wait while we confirm your payment with Paystack...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4">
            <div className="bg-linear-to-br from-green-500/20 to-green-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto border-4 border-green-500/50">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-400">Payment Successful!</h2>
            <p className="text-gray-300">{message}</p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                🎉 You now have access to all premium features!
              </p>
            </div>
            <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center space-y-4">
            <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-400">Payment Verification Issue</h2>
            <p className="text-gray-300">{message}</p>
            
            {debugInfo && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-left text-xs text-gray-300">
                <p className="font-semibold mb-2">Debug Information:</p>
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-gray-300">
              <p>Please contact support with the reference number above if payment was deducted.</p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => router.push('/dashboard/user/subscription')}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/login')}
                className="w-full text-gray-300 bg-white/5 py-3 px-4 rounded-lg hover:bg-white/10 font-medium transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}