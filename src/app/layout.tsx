import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import FloatingAI from "@/components/FloatingAI";
import AppHeader from "@/components/AppHeader";
import { ResponsiveProvider } from "@/lib/responsive";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MZR Survey — Pakistan 2025",
  description: "Advanced survey with AI assistant for technology, healthcare, and youth issues in Pakistan. Share your voice on tech access, healthcare, and social challenges.",
  keywords: ["Pakistan survey", "technology survey", "healthcare survey", "youth issues", "AI assistant", "MZR"],
  authors: [{ name: "MZR Survey Team" }],
  creator: "MZR Survey",
  publisher: "MZR Survey",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "MZR Survey — Pakistan 2025",
    description: "Advanced survey with AI assistant for technology, healthcare, and youth issues in Pakistan.",
    url: "https://mzr-survey.vercel.app",
    siteName: "MZR Survey",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MZR Survey — Pakistan 2025",
    description: "Advanced survey with AI assistant for technology, healthcare, and youth issues in Pakistan.",
    creator: "@mzrsurvey",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0D1B1E" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1B1E" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased ghibli-bg`}>
        <div className="blob bg-emerald-500/20 h-40 w-40 top-10 left-10" />
        <div className="blob bg-amber-400/20 h-56 w-56 bottom-20 right-10" />
        <I18nProvider>
          <ResponsiveProvider>
            <AppHeader />
            <main className="mx-auto max-w-6xl px-[var(--container-pad)] py-6">
              {children}
            </main>
            <FloatingAI />
            <Toaster 
              position="bottom-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(15, 44, 44, 0.95)',
                  color: '#fff',
                  border: '1px solid rgba(22, 66, 60, 0.6)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                },
                success: {
                  style: {
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  },
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  style: {
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  },
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
                loading: {
                  style: {
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  },
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </ResponsiveProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
