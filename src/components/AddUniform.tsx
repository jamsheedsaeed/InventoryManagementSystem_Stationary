"use client";

import { useState, useEffect } from "react";

interface AddUniformProps {
  onUniformAdded: () => void; // Callback to refresh uniforms
}

interface School {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

export default function AddUniform({ onUniformAdded }: AddUniformProps) {
  const [form, setForm] = useState({
    name: "",
    size: "",
    price: "",
    stock: "",
    schoolId: "",
    supplierId: "",
  });

  const [image, setImage] = useState<File | null>(null); // State for image file
  const [schools, setSchools] = useState<School[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Fetch schools list
  const fetchSchools = async () => {
    try {
      const res = await fetch("/api/schools");
      if (!res.ok) throw new Error("Failed to fetch schools");
      const data: School[] = await res.json();
      setSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  // Fetch suppliers list
  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers");
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      const data: Supplier[] = await res.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!form.name || !form.size || !form.price || !form.stock || !form.schoolId) {
      alert("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("size", form.size);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("schoolId", form.schoolId);
    if (form.supplierId) formData.append("supplierId", form.supplierId);
    if (image) formData.append("image", image);

//     const formData = new FormData();
// formData.append("name", "School Uniform");
// formData.append("size", "M");
// formData.append("price", "25.5");
// formData.append("stock", "10");
// formData.append("schoolId", "1");
// formData.append("supplierId", "1");
// if (image) { // Check that image is not null
//   console.log("Image to upload:", image); // Log the image file

//   formData.append("image", image);
// } else {
//   console.warn("No image selected for upload");
// }
    try {
      const res = await fetch("/api/uniforms", {
        method: "POST",
        body: formData, // Send FormData instead of JSON
      });

      if (!res.ok) throw new Error("Failed to add uniform");

      alert("Uniform added successfully!");
      setForm({ name: "", size: "", price: "", stock: "", schoolId: "", supplierId: "" });
      setImage(null);
      onUniformAdded();
    } catch (error) {
      console.error("Error adding uniform:", error);
      alert("Failed to add uniform.");
    }
  };

  useEffect(() => {
    fetchSchools();
    fetchSuppliers();
  }, []);

  return (
    <div className="mb-6 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Add a New Uniform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Fields */}
        {["name", "size", "price", "stock"].map((field) => (
          <div key={field}>
            <label className="block mb-1 capitalize">{field}</label>
            <input
              type={field === "price" || field === "stock" ? "number" : "text"}
              value={form[field as keyof typeof form]}
              onChange={(e) =>
                setForm({ ...form, [field]: e.target.value })
              }
              className="w-full border p-2 rounded"
              placeholder={`Enter ${field}`}
            />
          </div>
        ))}

        {/* School Dropdown */}
        <div>
          <label className="block mb-1">School</label>
          <select
            value={form.schoolId}
            onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="">Select School</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        {/* Supplier Dropdown */}
        <div>
          <label className="block mb-1">Supplier</label>
          <select
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        {/* File Input for Image Upload */}
        <div>
          <label className="block mb-1">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Uniform
      </button>
    </div>
  );
}
