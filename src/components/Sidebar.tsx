"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiHome,
  FiShoppingCart,
  FiBook,
  FiBarChart2,
  FiBox,
  FiSettings,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { MdAnalytics, MdReport, MdPeople, MdInventory } from "react-icons/md";
import { FaChalkboardTeacher, FaIndustry } from "react-icons/fa";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname(); // Get the current path

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <FiHome /> },
    { name: "Sales", href: "/dashboard/sales", icon: <FiShoppingCart /> },
    { name: "Uniforms", href: "/dashboard/uniforms", icon: <FiBook /> },
    { name: "Sales Report", href: "/dashboard/sales-report", icon: <MdReport /> },
    { name: "Stock Details", href: "/dashboard/low-stock", icon: <MdInventory /> },
    { name: "Stock Adjustments", href: "/dashboard/stock-adjustments", icon: <FiBox /> },
    { name: "Sales Analytics", href: "/dashboard/sales-analytics", icon: <MdAnalytics /> },
    { name: "Suppliers", href: "/dashboard/suppliers", icon: <FaIndustry /> },
  ];

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-16"
      } h-screen bg-gray-900 text-gray-200 flex flex-col justify-between fixed transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <span className={`text-xl font-bold ${isOpen ? "block" : "hidden"}`}>
          IMS
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-200 focus:outline-none"
        >
          {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={`group ${
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-800"
              }`}
            >
              <Link
                href={item.href}
                className="flex items-center p-4 gap-4 rounded-md transition-all duration-200"
              >
                <span className="text-lg">{item.icon}</span>
                <span
                  className={`${
                    isOpen ? "block" : "hidden"
                  } transition-all duration-300`}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4">
        <span
          className={`text-sm text-gray-400 ${
            isOpen ? "block" : "hidden"
          } transition-all duration-300`}
        >
          © 2024 My App
        </span>
      </div>
    </div>
  );
}
