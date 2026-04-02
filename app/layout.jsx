// app/layout.jsx

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// Font Setup
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata SEO
export const metadata = {
  title: "Gerbang Cinema - Nonton Drama & Film Terbaru",
  description: "Portal streaming drama dan film terbaru ala Netflix by Samsul.",
  keywords: ["drama china", "dracin", "streaming drama", "film online"],
  authors: [{ name: "Samsul Hidayat" }],
};

// Layout Root
export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning={true}
        className="min-h-screen flex flex-col bg-[#141414] text-white"
      >

        {/* Navbar Global */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-400 py-5 border-t border-zinc-800">
          © {new Date().getFullYear()} Gerbang Cinema — By Samsul
        </footer>

      </body>
    </html>
  );
}