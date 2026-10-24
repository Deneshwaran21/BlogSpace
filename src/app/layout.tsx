import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "BlogSpace — Ideas, Stories & Perspectives",
  description: "A modern editorial platform for thoughtful engineering, design systems, and creative culture.",
  keywords: ["blog", "editorial", "technology", "design", "development", "nextjs"],
  authors: [{ name: "BlogSpace Editorial Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1E232A] antialiased selection:bg-amber-200 selection:text-amber-900 font-sans">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
