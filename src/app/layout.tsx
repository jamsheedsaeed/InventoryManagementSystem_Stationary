"use client";
import { useState } from "react";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <body className="antialiased bg-gray-100">
      <SessionProvider>
        <div className="flex">
          {/* Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Main Content */}
          <div className="flex-1 transition-all duration-300">
            {/* Navbar */}
            <Navbar isSidebarOpen={isSidebarOpen} />

            {/* Page Content */}
            <div
              className={`mt-16 p-8 ${
                isSidebarOpen ? "ml-64" : "ml-16"
              } transition-all duration-300`}
            >
              <SessionProviderWrapper>{children}</SessionProviderWrapper>
            </div>
          </div>
        </div>
        </SessionProvider>
      </body>
    </html>
  );
}
