import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/context";

export const metadata: Metadata = {
  title: "Lantiai — AI Educational Ecosystem",
  description: "The AI-first educational ecosystem that unifies Teacher Productivity, Student Inquiry, and Parent Updates. Powered by Pedagogy over Prompting.",
  keywords: "AI education, EdTech, K-12, pedagogical AI, student safety, multilingual education",
  openGraph: {
    title: "Lantiai — Pedagogy over Prompting",
    description: "The only AI educational platform built on pedagogical science, not just prompting.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#0A0B1A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LantiAI" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-512x512.png" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
