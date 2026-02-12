import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { ThemeProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""} />
    </html>
  );
}
