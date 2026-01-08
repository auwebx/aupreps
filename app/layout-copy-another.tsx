import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/AuthProvider";
import CopyProtection from "@/components/CopyProtection";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://aupreps.com'), // Replace with your actual domain
  
  title: {
    default: "AUPreps – WAEC, JAMB, NECO Past Questions & Practice Tests",
    template: "%s | AUPreps"
  },
  
  description: "The #1 WAEC/JAMB Practice Platform in Nigeria, Africa & Across the World. Access thousands of past questions, mock exams, and study materials for WAEC, JAMB, NECO, and other exams.",
  
  keywords: [
    "WAEC past questions",
    "JAMB past questions",
    "NECO past questions",
    "WAEC practice",
    "JAMB CBT practice",
    "Nigeria exam preparation",
    "UTME past questions",
    "SSCE past questions",
    "exam preparation Nigeria",
    "WAEC answers",
    "JAMB mock exam",
    "study materials Nigeria",
    "past questions and answers",
    "AUPreps",
    "online exam practice"
  ],
  
  authors: [{ name: "AUPreps" }],
  creator: "AUPreps",
  publisher: "AUPreps",
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://aupreps.com',
    siteName: 'AUPreps',
    title: 'AUPreps – WAEC, JAMB, NECO Past Questions & Practice Platform',
    description: 'The #1 WAEC/JAMB Practice Platform in Nigeria, Africa & Across the World. Access thousands of past questions and ace your exams.',
    images: [
      {
        url: '/logo.png', // Add a 1200x630px image
        width: 1200,
        height: 630,
        alt: 'AUPreps - Exam Preparation Platform',
      }
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'AUPreps – WAEC, JAMB, NECO Past Questions',
    description: 'The #1 WAEC/JAMB Practice Platform in Nigeria, Africa & Across the World',
    images: ['/og-image.jpg'], // Same as OG image
    creator: '@aupreps', // Replace with your Twitter handle
  },
  
  manifest: "/manifest.json",
  
  alternates: {
    canonical: 'https://aupreps.com',
  },
  
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  
  category: 'education',
  
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  }
};

export const viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional Schema.org markup for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "AUPreps",
              "description": "The #1 WAEC/JAMB Practice Platform in Nigeria, Africa & Across the World",
              "url": "https://aupreps.com",
              "logo": "https://aupreps.com/logo.png",
              "sameAs": [
                "https://facebook.com/aupreps",
                "https://twitter.com/aupreps",
                "https://instagram.com/aupreps"
              ],
              "areaServed": {
                "@type": "Country",
                "name": "Nigeria"
              },
              "offers": {
                "@type": "Offer",
                "category": "Educational Services"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <CopyProtection />
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}