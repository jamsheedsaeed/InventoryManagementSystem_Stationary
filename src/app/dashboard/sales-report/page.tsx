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
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales report:", error);
    } finally {
      setLoading(false);
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
                  <th className="border px-4 py-2 text-left">Total ($)</th>
                  <th className="border px-4 py-2 text-left">Profit ($)</th>
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
                    <td className="border px-4 py-2">${sale.total.toFixed(2)}</td>
                    <td className="border px-4 py-2">${sale.profit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
