import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/AuthProvider";
import CopyProtection from "@/components/CopyProtection";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AUPreps – WAEC, JAMB, NECO Past Questions",
  description: "The #1 WAEC/JAMB Practice Platform in Nigeria, Africa & Across the World",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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