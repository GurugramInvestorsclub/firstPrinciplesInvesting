import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";
import { SmoothScroll } from "@/components/ui/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const interTight = Geist({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "First Principles Investing",
    template: "%s | First Principles Investing",
  },
  description: "Strip away noise. Think clearly. Compound intelligently. A long-term platform for structural thinking and business fundamentals.",
  keywords: ["First Principles", "Investing", "Compounding", "Structural Moats", "Independent Thinking"],
  authors: [{ name: "First Principles Investing" }],
  creator: "First Principles Investing",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://firstprinciplesinvesting.com",
    title: "First Principles Investing",
    description: "Strip away noise. Think clearly. Compound intelligently.",
    siteName: "First Principles Investing",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${interTight.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <NoiseOverlay />
          <SmoothScroll />
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""} />
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ""} />
    </html>
  );
}

