'use server';

import webpush, { PushSubscription } from 'web-push';  // Import type for plain object

webpush.setVapidDetails(
  'mailto:auwebx87@gmail.com', // Replace with your email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Store as plain object type from web-push (ensures keys are present)
let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub;  // Now typed correctly with keys
  return { success: true };
}

export async function unsubscribeUser() {
  subscription = null;
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) throw new Error('No subscription available');
  
  // Optional: Log for debugging (remove in production)
  console.log('Sending to subscription:', {
    endpoint: subscription.endpoint,
    hasKeys: !!subscription.keys,
    p256dh: subscription.keys?.p256dh ? 'present' : 'missing',
    auth: subscription.keys?.auth ? 'present' : 'missing',
  });

  try {
    await webpush.sendNotification(
      subscription,  // Now guaranteed to have keys
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icon-192x192.png',
      })
    );
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    
    // Enhanced error handling: Check for invalid/expired subscriptions
    if (error instanceof Error && 'statusCode' in error && (error.statusCode === 404 || error.statusCode === 410)) {
      console.log('Subscription expired or invalid; clearing it.');
      subscription = null;  // Auto-unsubscribe invalid ones
      return { success: false, error: 'Subscription expired; resubscribe.' };
    }
    
    return { success: false, error: 'Failed to send notification' };
  }
}