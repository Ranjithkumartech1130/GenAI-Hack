import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interview Assessor | Smart Hiring Platform",
  description: "AI-powered interview assessment system with aptitude testing, coding challenges, and intelligent performance analysis for smarter hiring decisions.",
  keywords: "interview, assessment, AI, coding test, aptitude, hiring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
