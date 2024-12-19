"use client";

import { useEffect, useState } from "react";

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

export default function LowStockPage() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [restockQuantities, setRestockQuantities] = useState<{ [key: number]: number }>({}); // State for each input value

  const fetchLowStockItems = async () => {
    const res = await fetch("/api/low-stock");
    const data = await res.json();
    setLowStockItems(data);
  };

  const handleRestock = async (uniformId: number) => {
    try {
      const quantity = restockQuantities[uniformId];
      if (!quantity || quantity <= 0) {
        alert("Please enter a valid restock quantity.");
        return;
      }

      const res = await fetch("/api/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uniformId,
          adjustment: quantity,
          reason: "Restocked by Admin",
        }),
      });

      if (!res.ok) throw new Error("Failed to restock uniform");

      alert("Stock updated successfully!");
      setRestockQuantities((prev) => ({ ...prev, [uniformId]: 0 })); // Reset input for this item
      fetchLowStockItems(); // Refresh the low stock list
    } catch (error) {
      console.error("Error restocking:", error);
      alert("Failed to update stock.");
    }
  };

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Low Stock Alerts
        </h1>

        {lowStockItems.length === 0 ? (
          <p className="text-gray-600">All stock levels are sufficient.</p>
        ) : (
          <ul className="space-y-4">
            {lowStockItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center bg-red-50 p-4 rounded-lg shadow-md"
              >
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {item.name} (Size: {item.size})
                  </p>
                  <p className="text-gray-600">
                    Current Stock: {item.stock} | Threshold:{" "}
                    {item.lowStockThreshold}
                  </p>
                  <p className="text-gray-600">School: {item.school.name}</p>
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    value={restockQuantities[item.id] || ""}
                    onChange={(e) =>
                      setRestockQuantities({
                        ...restockQuantities,
                        [item.id]: parseInt(e.target.value) || 0,
                      })
                    }
                    className="border p-2 rounded w-24 mr-2"
                    placeholder="Qty"
                  />
                  <button
                    onClick={() => handleRestock(item.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Restock
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
