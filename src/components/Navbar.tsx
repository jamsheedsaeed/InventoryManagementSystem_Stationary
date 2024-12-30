"use client";

import { FiBell, FiUser } from "react-icons/fi";

export default function Navbar({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  return (
    <div
      className={`fixed top-0 ${
        isSidebarOpen ? "left-64" : "left-16"
      } right-0 h-16 bg-[#111c44] text-white flex items-center justify-between px-4 shadow z-20 transition-all duration-300`}
    >
      {/* Logo or Placeholder */}
      <div className="flex items-center space-x-4">
        <span className="text-lg font-bold hidden md:block">Welcome</span>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-300 hover:text-white focus:outline-none">
          <FiBell size={20} />
        </button>
        <button className="text-gray-300 hover:text-white focus:outline-none">
          <FiUser size={20} />
        </button>
      </div>
    </div>
  );
}
