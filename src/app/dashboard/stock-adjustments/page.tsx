"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface StockAdjustment {
  id: number;
  adjustment: number;
  reason: string;
  createdAt: string;
  uniform: {
    name: string;
    size: string;
  };
}

export default function StockAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [sortedField, setSortedField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAdjustments = async () => {
    const res = await fetch("/api/stock-adjustments");
    const data = await res.json();
    setAdjustments(data);
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  // Sort Data
  const sortData = (field: string) => {
    const direction = sortedField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortedField(field);
    setSortDirection(direction);

    const sorted = [...adjustments].sort((a: any, b: any) => {
      if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
      if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setAdjustments(sorted);
  };

  // Paginated Adjustments
  const paginatedAdjustments = adjustments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Generate PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Stock Adjustment Log", 14, 10);

    const tableData = adjustments.map((item) => [
      new Date(item.createdAt).toLocaleDateString(),
      item.uniform.name,
      item.uniform.size,
      item.adjustment > 0 ? `+${item.adjustment}` : item.adjustment,
      item.reason,
    ]);

    (doc as any).autoTable({
      head: [["Date", "Uniform", "Size", "Adjustment", "Reason"]],
      body: tableData,
      startY: 20,
    });

    doc.save("stock_adjustments.pdf");
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Stock Adjustment Log
        </h1>

        {/* Export Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={exportToPDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export to PDF
          </button>
        </div>

        {/* Adjustments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th
                  className="border px-4 py-2 text-left cursor-pointer"
                  onClick={() => sortData("createdAt")}
                >
                  Date {sortedField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="border px-4 py-2 text-left">Uniform</th>
                <th className="border px-4 py-2 text-left">Size</th>
                <th
                  className="border px-4 py-2 text-left cursor-pointer"
                  onClick={() => sortData("adjustment")}
                >
                  Adjustment {sortedField === "adjustment" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="border px-4 py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No stock adjustments found.
                  </td>
                </tr>
              ) : (
                paginatedAdjustments.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border px-4 py-2">{item.uniform.name}</td>
                    <td className="border px-4 py-2">{item.uniform.size}</td>
                    <td
                      className={`border px-4 py-2 font-bold ${
                        item.adjustment > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.adjustment > 0 ? `+${item.adjustment}` : item.adjustment}
                    </td>
                    <td className="border px-4 py-2">{item.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded mr-2"
          >
            Previous
          </button>
          <span className="py-2">
            Page {currentPage} of {Math.ceil(adjustments.length / itemsPerPage)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, Math.ceil(adjustments.length / itemsPerPage))
              )
            }
            disabled={currentPage === Math.ceil(adjustments.length / itemsPerPage)}
            className="px-4 py-2 bg-gray-300 rounded ml-2"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
