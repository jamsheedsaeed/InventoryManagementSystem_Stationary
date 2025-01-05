"use client";

import { useEffect, useState } from "react";

interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  leadTime: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({
    id: 0, // Include id for updates
    name: "",
    email: "",
    phone: "",
    leadTime: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    const res = await fetch("/api/suppliers");
    const data = await res.json();
    setSuppliers(data);
  };

  // Add or Update supplier
  const handleSubmit = async () => {
    const url = isEditMode ? `/api/suppliers/${form.id}` : "/api/suppliers";
    const method = isEditMode ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ id: 0, name: "", email: "", phone: "", leadTime: "" });
      setIsEditMode(false);
      fetchSuppliers();
    }
  };

  // Delete a supplier
  const deleteSupplier = async (id: number) => {
    const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });

    if (res.ok) {
      fetchSuppliers();
    }
  };

  // Set form for edit
  const editSupplier = (supplier: Supplier) => {
    setForm({
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      leadTime: supplier.leadTime.toString(),
    });
    setIsEditMode(true);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Supplier Management</h1>

        {/* Add/Update Supplier Form */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            {isEditMode ? "Update Supplier" : "Add New Supplier"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {["name", "email", "phone", "leadTime"].map((field) => (
              <div key={field}>
                <label className="block mb-1 capitalize">{field}</label>
                <input
                  type="text"
                  value={form[field as keyof typeof form]}
                  onChange={(e) =>
                    setForm({ ...form, [field]: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditMode ? "Update" : "Add"} Supplier
          </button>
        </div>

        {/* Suppliers Table */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Supplier List</h2>
          <table className="min-w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Lead Time (Days)</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="border p-2">{supplier.name}</td>
                  <td className="border p-2">{supplier.email}</td>
                  <td className="border p-2">{supplier.phone}</td>
                  <td className="border p-2">{supplier.leadTime}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => editSupplier(supplier)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSupplier(supplier.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
