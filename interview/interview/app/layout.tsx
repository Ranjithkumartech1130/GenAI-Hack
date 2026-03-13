import type { Metadata, Viewport } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "PrepWise | AI Mock Interview Platform",
  description: "Prepare for your next job interview with PrepWise. Practice with AI-powered mock interviews, get real-time feedback, and improve your communication and technical skills.",
  keywords: ["mock interview", "AI interview", "job preparation", "interview practice", "technical interview", "behavioral interview"],
  authors: [{ name: "PrepWise Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${monaSans.className} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
