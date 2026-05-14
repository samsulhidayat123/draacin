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
  title: "Gudang Film",
  description: "Portal streaming film terbaru dengan tampilan katalog ala Netflix by Samsul.",
  keywords: ["film terbaru", "streaming film", "film online", "katalog film"],
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
        className="flex min-h-screen flex-col bg-[#050505] text-white"
      >

        {/* Navbar Global */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-black py-5 text-center text-sm text-zinc-500">
          (c) {new Date().getFullYear()} Gudang Film - By Samsul
        </footer>

      </body>
    </html>
  );
}
