"use client";

import { useState } from "react";
import AddUniform from "@/components/AddUniform";
import UniformList from "@/components/UniformList";

export default function UniformsPage() {
  const [activeTab, setActiveTab] = useState<"add" | "list">("add");

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Uniform Management</h1>

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setActiveTab("add")}
            className={`p-3 font-medium ${
              activeTab === "add"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            Add Uniform
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`p-3 font-medium ${
              activeTab === "list"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            List of Uniforms
          </button>
        </div>

        {/* Content */}
        {activeTab === "add" ? (
          <AddUniform onUniformAdded={() => {}} />
        ) : (
          <UniformList />
        )}
      </div>
    </div>
  );
}
