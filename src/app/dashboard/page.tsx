"use client";

import { useState, useEffect } from "react";
import { School } from "@prisma/client";

interface LowStockItem {
  id: number;
  name: string;
  size: string;
  stock: number;
  lowStockThreshold: number;
  school: {
    name: string;
  };
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    principal: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"add" | "list">("add");

  // Fetch schools from the API
  async function fetchSchools() {
    setLoading(true);
    try {
      const res = await fetch("/api/schools");
      if (!res.ok) throw new Error("Failed to fetch schools");
      const data: School[] = await res.json();
      setSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
      setError("Unable to load schools. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch low stock items
  async function fetchLowStockItems() {
    try {
      const res = await fetch("/api/low-stock");
      if (!res.ok) throw new Error("Failed to fetch low stock items");
      const data: LowStockItem[] = await res.json();
      setLowStockItems(data);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
    }
  }

  // Add a new school
  async function addSchool() {
    setError("");
    setSuccess("");
    if (!form.name || !form.address || !form.phone || !form.principal) {
      setError("Please fill out all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add school");

      setForm({ name: "", address: "", phone: "", principal: "" });
      setSuccess("School added successfully!");
      fetchSchools();
    } catch (error) {
      console.error("Error adding school:", error);
      setError("Failed to add school. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Delete a school
  async function deleteSchool(id: number) {
    try {
      const res = await fetch(`/api/schools/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete school");
      fetchSchools();
    } catch (error) {
      console.error("Error deleting school:", error);
      setError("Failed to delete school. Please try again.");
    }
  }

  useEffect(() => {
    fetchSchools();
    fetchLowStockItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Schools Management</h1>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "add"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("add")}
        >
          Add School
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "list"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("list")}
        >
          List of Schools
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "add" && (
        <>
          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md mb-6 shadow-sm">
              <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Low Stock Alerts</h2>
              <ul className="space-y-2">
                {lowStockItems.map((item) => (
                  <li key={item.id} className="text-gray-700">
                    {item.name} (Size: {item.size}) - <strong>Stock: {item.stock}</strong> | School:{" "}
                    <strong>{item.school.name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add School Form */}
          <div className="bg-white p-6 shadow-md rounded-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add a New School</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.keys(form).map((field) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="block text-gray-700 font-medium mb-2 capitalize"
                  >
                    {field}
                  </label>
                  <input
  type="text"
  id={field}
  value={form[field as keyof typeof form]} // Assert as a key of form
  onChange={(e) =>
    setForm({
      ...form,
      [field as keyof typeof form]: e.target.value,
    })
  }
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
  placeholder={`Enter ${field}`}
/>

                </div>
              ))}
            </div>
            <button
              onClick={addSchool}
              disabled={isSubmitting}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {isSubmitting ? "Adding..." : "Add School"}
            </button>
          </div>
        </>
      )}

      {activeTab === "list" && (
        <>
          {/* Schools List */}
          <h2 className="text-3xl font-bold text-gray-800 mb-6">List of Schools</h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="bg-white p-6 rounded-md shadow-md hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{school.name}</h3>
                  <p className="text-gray-600 mb-1">
                    <strong>Address:</strong> {school.address}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Phone:</strong> {school.phone}
                  </p>
                  <p className="text-gray-600 mb-4">
                    <strong>Principal:</strong> {school.principal}
                  </p>
                  <button
                    onClick={() => deleteSchool(school.id)}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
