"use client";

import { useEffect, useState, useRef } from "react";
import { Uniform } from "@prisma/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Barcode from "react-barcode";

export default function UniformList() {
  const [uniforms, setUniforms] = useState<Uniform[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUniform, setCurrentUniform] = useState<Uniform | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const barcodeContainerRef = useRef<HTMLDivElement>(null);

  // Fetch uniforms from the API
  const fetchUniforms = async () => {
    try {
      const res = await fetch("/api/uniforms");
      if (!res.ok) throw new Error("Failed to fetch uniforms");
      const data: Uniform[] = await res.json();
      console.log(data);
      setUniforms(data);
    } catch (error) {
      console.error("Error fetching uniforms:", error);
      toast.error("Error fetching uniforms");
    }
  };

  // Print All Barcodes
  const printAllBarcodes = () => {
    if (barcodeContainerRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const htmlContent = `
          <html>
            <head>
              <title>Print All Barcodes</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>All Barcodes</h2>
              ${barcodeContainerRef.current.innerHTML}
              <script>
                window.print();
                window.onafterprint = () => window.close();
              </script>
            </body>
          </html>
        `;
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      }
    }
  };

  // Delete uniform
  const deleteUniform = async (id: number) => {
    try {
      const res = await fetch(`/api/uniforms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete uniform");
      toast.success("Uniform deleted successfully");
      fetchUniforms();
    } catch (error) {
      console.error("Error deleting uniform:", error);
      toast.error("Failed to delete uniform");
    }
  };

  // Handle edit button click
  const handleEdit = (uniform: Uniform) => {
    setCurrentUniform(uniform);
    setIsEditing(true);
  };

  // Update uniform
  const updateUniform = async () => {
    if (!currentUniform) return;

    try {
      const res = await fetch(`/api/uniforms/${currentUniform.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUniform),
      });

      if (!res.ok) throw new Error("Failed to update uniform");

      toast.success("Uniform updated successfully");
      setIsEditing(false);
      setCurrentUniform(null);
      fetchUniforms();
    } catch (error) {
      console.error("Error updating uniform:", error);
      toast.error("Failed to update uniform");
    }
  };

  useEffect(() => {
    fetchUniforms();
  }, []);

  // Filter uniforms based on search term
  const filteredUniforms = uniforms.filter((uniform) =>
    uniform.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-3xl font-bold text-gray-800 mb-6">Uniforms</h2>

      {/* Search and Print Buttons */}
      <div className="flex justify-end mb-6 space-x-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={printAllBarcodes}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
        >
          Print All Barcodes
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUniforms.map((uniform) => (
          <div
            key={uniform.id}
            className="bg-white shadow-md rounded-lg overflow-hidden transition transform hover:scale-105"
          >
            {/* Uniform Image */}
            {uniform.image ? (
              <img
                src={
                  typeof uniform.image === "string"
                    ? uniform.image // If the image is already a URL
                    : `data:image/jpeg;base64,${Buffer.from(uniform.image).toString(
                        "base64"
                      )}` // If the image is stored as binary
                }
                alt={uniform.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}

            {/* Uniform Details */}
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">{uniform.name}</h3>
              <p className="text-gray-600">
                <strong>Size:</strong> {uniform.size}
              </p>
              <p className="text-gray-600">
                <strong>Price:</strong> PKR {uniform.costPrice}
              </p>
              <p className="text-gray-600">
                <strong>Stock:</strong> {uniform.stock}
              </p>

              {/* Barcode */}
              <div className="mt-4">
                <h4 className="text-gray-600 mb-2">Barcode:</h4>
                <Barcode width={2} format="CODE128" value={uniform.barcode} height={50} />
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(uniform)}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteUniform(uniform.id)}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden Barcodes for Printing */}
      <div className="hidden" ref={barcodeContainerRef}>
        {filteredUniforms.map((uniform) => (
          <div key={uniform.id} className="mb-4 text-center">
            <h4>{uniform.name}</h4>
            <Barcode width={2} format="CODE128" value={uniform.barcode} height={50} />
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditing && currentUniform && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Uniform</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={currentUniform.name}
                  onChange={(e) =>
                    setCurrentUniform({ ...currentUniform, name: e.target.value })
                  }
                  className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Size</label>
                <input
                  type="text"
                  value={currentUniform.size}
                  onChange={(e) =>
                    setCurrentUniform({ ...currentUniform, size: e.target.value })
                  }
                  className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Cost Price</label>
                <input
                  type="number"
                  value={currentUniform.costPrice}
                  onChange={(e) =>
                    setCurrentUniform({
                      ...currentUniform,
                      costPrice: parseFloat(e.target.value),
                    })
                  }
                  className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Stock</label>
                <input
                  type="number"
                  value={currentUniform.stock}
                  onChange={(e) =>
                    setCurrentUniform({
                      ...currentUniform,
                      stock: parseInt(e.target.value),
                    })
                  }
                  className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentUniform(null);
                }}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={updateUniform}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
