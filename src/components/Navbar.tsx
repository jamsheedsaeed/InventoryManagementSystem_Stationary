"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { FiBell, FiUser, FiLogOut, FiLogIn } from "react-icons/fi";

export default function Navbar({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  const { data: session } = useSession(); // Get the user's session data

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

        {/* Log In / Log Out Button */}
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })} // Redirect to the home page after logging out
            className="text-gray-300 hover:text-white focus:outline-none flex items-center"
          >
            <FiLogOut size={20} />
            <span className="hidden md:inline-block ml-2">Logout</span>
          </button>
        ) : (
          <button
            onClick={() => signIn()} // Trigger login process
            className="text-gray-300 hover:text-white focus:outline-none flex items-center"
          >
            <FiLogIn size={20} />
            <span className="hidden md:inline-block ml-2">Login</span>
          </button>
        )}
      </div>
    </div>
  );
}
