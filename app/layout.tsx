import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PitchPilot — AI Stadium Assistant | FIFA World Cup 2026",
  description:
    "GenAI-powered stadium operations and fan experience platform for the FIFA World Cup 2026 at MetLife Stadium. Real-time crowd analytics, wait times, and personalized recommendations.",
  keywords: ["FIFA", "World Cup 2026", "Stadium", "AI Assistant", "PitchPilot"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
