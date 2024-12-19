import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google"; // Use valid fonts
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Sidebar from "@/components/Sidebar";

// Replace invalid fonts with valid ones
const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "A modern inventory management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interFont.variable} ${robotoMono.variable} antialiased bg-gray-100`}
      >
        {/* Layout with Sidebar and Content */}
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 ml-16 md:ml-64 p-8 bg-gray-100 min-h-screen transition-all duration-300">
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
          </div>
        </div>
      </body>
    </html>
  );
}
