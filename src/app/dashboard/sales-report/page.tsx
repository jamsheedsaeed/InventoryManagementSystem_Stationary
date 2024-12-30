"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Sale {
  id: number;
  date: string;
  total: number;
  profit: number;
  school: {
    name: string;
  };
  uniforms: {
    quantity: number;
    price: number;
    uniform: {
      name: string;
      size: string;
    };
  }[];
}

export default function SalesReportPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null); // For delete confirmation

  // Fetch sales data
  const fetchSales = async () => {
    setLoading(true);
    try {
      let query = "/api/sales/report";
      if (startDate && endDate) {
        query += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(query);
      const data: Sale[] = await res.json();
      console.log(data);
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete sale
  const deleteSale = async (id: number) => {
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete sale");
      setSelectedSale(null); // Close confirmation popup
      setSales(sales.filter((sale) => sale.id !== id)); // Update state
    } catch (error) {
      console.error("Error deleting sale:", error);
    }
  };

  // Generate PDF Report
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 10);

    const tableData = sales.map((sale) => [
      sale.date.split("T")[0],
      sale.school.name,
      sale.uniforms
        .map((item) => `${item.uniform.name} (x${item.quantity})`)
        .join(", "),
      `$${sale.total.toFixed(2)}`,
      `$${sale.profit.toFixed(2)}`,
    ]);

    // Add table
    (doc as any).autoTable({
      head: [["Date", "School", "Items Sold", "Total", "Profit"]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("sales_report.pdf");
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Sales Report</h1>

        {/* Date Filters */}
        <div className="flex space-x-4 mb-6">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="self-end">
            <button
              onClick={fetchSales}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Filter
            </button>
          </div>
          <div className="self-end">
            <button
              onClick={generatePDF}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Export to PDF
            </button>
          </div>
        </div>

        {/* Sales Table */}
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : sales.length === 0 ? (
          <p className="text-center text-gray-600">No sales data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2 text-left">Date</th>
                  <th className="border px-4 py-2 text-left">School</th>
                  <th className="border px-4 py-2 text-left">Items</th>
                  <th className="border px-4 py-2 text-left">Total (PKR)</th>
                  <th className="border px-4 py-2 text-left">Profit (PKR)</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition">
                    <td className="border px-4 py-2">{sale.date.split("T")[0]}</td>
                    <td className="border px-4 py-2">{sale.school.name}</td>
                    <td className="border px-4 py-2">
                      {sale.uniforms.map((item, index) => (
                        <div key={index}>
                          {item.uniform.name} (x{item.quantity})
                        </div>
                      ))}
                    </td>
                    <td className="border px-4 py-2">{sale.total.toFixed(2)}</td>
                    <td className="border px-4 py-2">{sale.profit.toFixed(2)}</td>
                    <td className="border px-4 py-2">
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => setSelectedSale(sale)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the sale for{" "}
              <strong>{selectedSale.school.name}</strong>? <br />
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setSelectedSale(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => deleteSale(selectedSale.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
