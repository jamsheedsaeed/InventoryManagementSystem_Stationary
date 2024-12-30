"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FaBoxes, FaMoneyBillWave, FaChartLine, FaDollarSign } from "react-icons/fa";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface OverviewData {
  totalStock: number;
  totalSalesToday: number;
  totalRevenueToday: number;
  totalProfitToday: number;
}

interface LowStockItem {
  id: number;
  name: string;
  stock: number;
  lowStockThreshold: number;
}

interface SalesTrendsData {
  dates: string[];
  sales: number[];
}

interface TopSellingItem {
  id: number;
  name: string;
  quantitySold: number;
}

export default function Dashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [salesTrends, setSalesTrends] = useState<SalesTrendsData | null>(null);
  const [topSelling, setTopSelling] = useState<TopSellingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const [overviewRes, lowStockRes, salesTrendsRes, topSellingRes] =
          await Promise.all([
            fetch("/api/dashboard/overview"),
            fetch("/api/dashboard/low-stock"),
            fetch("/api/dashboard/sales-trends"),
            fetch("/api/dashboard/top-selling"),
          ]);

        if (!overviewRes.ok) throw new Error("Failed to fetch overview data");
        if (!lowStockRes.ok) throw new Error("Failed to fetch low-stock items");
        if (!salesTrendsRes.ok)
          throw new Error("Failed to fetch sales trends");
        if (!topSellingRes.ok)
          throw new Error("Failed to fetch top-selling items");

        const overviewData: OverviewData = await overviewRes.json();
        const lowStockData: LowStockItem[] = await lowStockRes.json();
        const salesTrendsData: SalesTrendsData = await salesTrendsRes.json();
        const topSellingData: TopSellingItem[] = await topSellingRes.json();

        setOverview(overviewData);
        setLowStockItems(lowStockData);
        setSalesTrends(salesTrendsData);
        setTopSelling(topSellingData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          "Unable to load dashboard data. Please refresh or try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-screen-xl">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {overview && (
            <>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105">
                <FaBoxes className="text-4xl mb-4" />
                <h2 className="text-lg font-semibold">Total Stock</h2>
                <p className="text-3xl font-bold">{overview.totalStock}</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105">
                <FaMoneyBillWave className="text-4xl mb-4" />
                <h2 className="text-lg font-semibold">Total Sales Today</h2>
                <p className="text-3xl font-bold">{overview.totalSalesToday}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105">
                <FaDollarSign className="text-4xl mb-4" />
                <h2 className="text-lg font-semibold">Revenue Today</h2>
                <p className="text-3xl font-bold">PKR {overview.totalRevenueToday}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105">
                <FaChartLine className="text-4xl mb-4" />
                <h2 className="text-lg font-semibold">Profit Today</h2>
                <p className="text-3xl font-bold">PKR {overview.totalProfitToday}</p>
              </div>
            </>
          )}
        </div>

        {/* Low-Stock Items */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Low-Stock Items</h2>
          <div className="bg-white shadow rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600 font-medium">
                    Item
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-medium">
                    Stock
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-medium">
                    Threshold
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.stock}</td>
                    <td className="px-4 py-2">{item.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales Trends Chart */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Sales Trends</h2>
          {salesTrends && (
            <Line
              data={{
                labels: salesTrends.dates,
                datasets: [
                  {
                    label: "Sales",
                    data: salesTrends.sales,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                },
              }}
            />
          )}
        </div>

        {/* Top-Selling Items */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Top-Selling Items</h2>
          <div className="bg-white shadow rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600 font-medium">
                    Item
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-medium">
                    Quantity Sold
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSelling.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.quantitySold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
