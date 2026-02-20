import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
