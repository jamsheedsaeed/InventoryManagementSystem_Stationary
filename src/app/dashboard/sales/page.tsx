"use client";

import { useState, useEffect } from "react";
import { Uniform, School } from "@prisma/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SalesPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [uniforms, setUniforms] = useState<Uniform[]>([]);
  const [cart, setCart] = useState<
    { id: number; name: string; price: number; size: string; quantity: number }[]
  >([]);
  const [discount, setDiscount] = useState<number>(0); // Discount percentage

  // Fetch schools
  const fetchSchools = async () => {
    try {
      const res = await fetch("/api/schools");
      const data: School[] = await res.json();
      setSchools(data);

      if (data.length > 0) {
        setSelectedSchoolId(data[0].id);
        fetchUniforms(data[0].id);
      }
    } catch (error) {
      toast.error("Error fetching schools.");
    }
  };

  // Fetch uniforms
  const fetchUniforms = async (schoolId: number) => {
    try {
      const res = await fetch(`/api/uniforms?schoolId=${schoolId}`);
      const data: Uniform[] = await res.json();
      setUniforms(data);
    } catch (error) {
      toast.error("Error fetching uniforms.");
    }
  };

  // Add to Cart
  const addToCart = (uniform: Uniform) => {
    const existingItem = cart.find((item) => item.id === uniform.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === uniform.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: uniform.id,
          name: uniform.name,
          price: uniform.price,
          size: uniform.size,
          quantity: 1,
        },
      ]);
    }
    toast.success(`${uniform.name} added to cart!`);
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      toast.warn("Cart is empty. Cannot complete sale.");
      return;
    }

    try {
      const res = await fetch("/api/uniforms");
      const stockData: Uniform[] = await res.json();

      // Check for out-of-stock items
      const outOfStockItems = cart.filter((cartItem) => {
        const uniform = stockData.find((u) => u.id === cartItem.id);
        return uniform && uniform.stock < cartItem.quantity;
      });

      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems.map((item) => item.name).join(", ");
        toast.error(`Out of stock: ${itemNames}`);
        return;
      }

      // Send sale data
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: selectedSchoolId,
          cart,
          discount,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success("Sale completed successfully!");
      setCart([]);
      fetchUniforms(selectedSchoolId!);
    } catch (error) {
      toast.error("Failed to complete sale.");
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSchoolChange = (schoolId: string) => {
    const id = parseInt(schoolId);
    setSelectedSchoolId(id);
    fetchUniforms(id);
  };

  const calculateTotal = () => {
    const total = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const discountAmount = (total * discount) / 100;
    return total - discountAmount;
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Sales Page</h1>

        {/* School Selection */}
        <div className="mb-6">
          <label className="block text-lg font-medium mb-2">Select School</label>
          <select
            value={selectedSchoolId || ""}
            onChange={(e) => handleSchoolChange(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        {/* Uniform Cards */}
        {selectedSchoolId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniforms.map((uniform) => (
              <div
                key={uniform.id}
                className="flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition p-4"
              >
                {uniform.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      typeof uniform.image === "string"
                        ? uniform.image
                        : `data:image/jpeg;base64,${Buffer.from(uniform.image).toString("base64")}`
                    }
                    alt={uniform.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center mb-4">
                    <span className="text-gray-500">No Image Available</span>
                  </div>
                )}
                <h3 className="text-lg font-bold">{uniform.name}</h3>
                <p className="text-gray-600">Size: {uniform.size}</p>
                <p className="text-gray-600 mb-4">Price: ${uniform.price}</p>
                <button
                  onClick={() => addToCart(uniform)}
                  className="mt-auto bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <div className="w-1/3 bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Cart</h2>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold">{item.name}</h3>
              <p>Size: {item.size}</p>
              <div className="flex mt-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    setCart(
                      cart.map((cartItem) =>
                        cartItem.id === item.id
                          ? { ...cartItem, quantity: Math.max(parseInt(e.target.value), 1) }
                          : cartItem
                      )
                    )
                  }
                  className="w-16 border rounded px-2 mr-2"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    setCart(
                      cart.map((cartItem) =>
                        cartItem.id === item.id
                          ? { ...cartItem, price: Math.max(parseFloat(e.target.value), 0) }
                          : cartItem
                      )
                    )
                  }
                  className="w-20 border rounded px-2"
                />
              </div>
            </div>
            <button
              onClick={() => setCart(cart.filter((cartItem) => cartItem.id !== item.id))}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}

        {/* Discount Selection */}
        <div className="mt-4">
          <label className="block font-bold mb-2">Apply Discount</label>
          <select
            value={discount}
            onChange={(e) => setDiscount(parseInt(e.target.value))}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>No Discount</option>
            <option value={5}>5% Discount</option>
            <option value={10}>10% Discount</option>
            <option value={15}>15% Discount</option>
          </select>
        </div>

        <div className="font-bold mt-6">Total: ${calculateTotal().toFixed(2)}</div>
        <button
          onClick={completeSale}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Complete Sale
        </button>
      </div>
    </div>
  );
}
