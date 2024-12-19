"use client";

import { useState, useEffect } from "react";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function SalesAnalyticsPage() {
  const [totalSales, setTotalSales] = useState(0);
  const [topSelling, setTopSelling] = useState<{ name: string; quantity: number }[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchSalesData = async () => {
    let query = `/api/sales`;
    if (startDate && endDate) query += `?startDate=${startDate}&endDate=${endDate}`;

    const res = await fetch(query);
    const data = await res.json();
    setTotalSales(data.totalSales);
    setTopSelling(data.topSellingUniforms);
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 10);

    const tableData = topSelling.map((item) => [item.name, item.quantity]);
    (doc as any).autoTable({
      head: [["Uniform", "Quantity Sold"]],
      body: tableData,
      startY: 20,
    });

    doc.save("sales_report.pdf");
  };

  const chartData = {
    labels: topSelling.map((item) => item.name),
    datasets: [
      {
        label: "Top Selling Uniforms",
        data: topSelling.map((item) => item.quantity),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Sales Analytics</h1>

        {/* Date Filter */}
        <div className="flex space-x-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded w-full"
            />
          </div>
          <div className="self-end">
            <button
              onClick={fetchSalesData}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Total Sales */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Total Sales: ${totalSales.toFixed(2)}</h2>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <Bar data={chartData} />
        </div>

        {/* Export to PDF */}
        <div className="flex justify-end">
          <button
            onClick={exportToPDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
}
