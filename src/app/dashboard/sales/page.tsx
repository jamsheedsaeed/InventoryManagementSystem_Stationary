"use client";

import React, { useState, useEffect, useRef } from "react";
import { Uniform } from "@prisma/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SalesPage() {
  const [uniforms, setUniforms] = useState<Uniform[]>([]);
  const [cart, setCart] = useState<
    {
      id: number;
      name: string;
      costPrice: number;
      price: number;
      size: string;
      quantity: number;
    }[]
  >([]);
  const [discount, setDiscount] = useState<number>(0);
  const [scannedCode, setScannedCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ---------------------
  // Fetch Uniforms
  // ---------------------
  const fetchUniforms = async () => {
    try {
      const res = await fetch(`/api/uniforms`);
      const data: Uniform[] = await res.json();
      setUniforms(data);
    } catch (error) {
      toast.error("Error fetching uniforms.");
    }
  };

  // ---------------------
  // Cart Persistence (Local Storage)
  // ---------------------
  useEffect(() => {
    const savedCart = localStorage.getItem("salesCart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    const savedDiscount = localStorage.getItem("salesDiscount");
    if (savedDiscount) {
      setDiscount(parseFloat(savedDiscount));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("salesCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("salesDiscount", discount.toString());
  }, [discount]);

  // ---------------------
  // Cart Logic
  // ---------------------
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
          costPrice: uniform.costPrice,
          price: uniform.price,
          size: uniform.size,
          quantity: 1,
        },
      ]);
    }
    toast.success(`${uniform.name} added to cart!`);
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const increaseQuantity = (itemId: number) => {
    setCart(
      cart.map((item) =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (itemId: number) => {
    setCart(
      cart.map((item) =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // ---------------------
  // Sale Completion
  // ---------------------
  const completeSale = async () => {
    if (cart.length === 0) {
      toast.warn("Cart is empty. Cannot complete sale.");
      return;
    }

    try {
      const res = await fetch("/api/uniforms");
      const stockData: Uniform[] = await res.json();

      const outOfStockItems = cart.filter((cartItem) => {
        const uniform = stockData.find((u) => u.id === cartItem.id);
        return uniform && uniform.stock < cartItem.quantity;
      });

      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems.map((i) => i.name).join(", ");
        toast.error(`Out of stock: ${itemNames}`);
        return;
      }

      console.log(JSON.stringify(cart));

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, discount }),
      });

      if (!response.ok) throw new Error();

      toast.success("Sale completed successfully!");
      setCart([]);
      fetchUniforms();
    } catch (error) {
      toast.error("Failed to complete sale.");
    }
  };

  // ---------------------
  // Barcode Scanner Input
  // ---------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScannedCode(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const barcode = scannedCode.trim();

      if (barcode) {
        const matchingUniform = uniforms.find((u) => u.barcode === barcode);
        if (matchingUniform) {
          addToCart(matchingUniform);
        } else {
          toast.error("Product not found in the system.");
        }
      }
      setScannedCode("");
    }
  };

  const calculateTotal = () => {
    // Calculate the subtotal first
    const subTotal = cart.reduce((total, item) => {
      // If you actually want to use costPrice for final calculation:
      return total + item.costPrice * item.quantity;
    }, 0);
  
    // Calculate the discount amount
    const discountAmount = (subTotal * discount) / 100; 
  
    // Apply the discount
    const totalAfterDiscount = subTotal - discountAmount;
  
    return totalAfterDiscount;
  };
  

  useEffect(() => {
    fetchUniforms();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} />

      <header className="px-6 py-4 bg-white shadow-sm flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Sales</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-base font-medium mb-1 text-gray-600">
              Scan Barcode
            </label>
            <input
              ref={inputRef}
              type="text"
              value={scannedCode}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="Scan here..."
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-1 text-gray-600">
              Discount (%)
            </label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 10"
              min={0}
              max={99}
            />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
                  #
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
                  Product Name
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
                  Size
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
                  Price
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
                  Qty
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
                  Subtotal
                </th>
                <th scope="col" className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cart.map((item, index) => {
                const subtotal = item.costPrice * item.quantity;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-semibold">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.size}</td>
                    <td className="px-4 py-3">PKR {item.costPrice}</td>
                    <td className="px-4 py-3 flex items-center space-x-2">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="px-2 py-1 border rounded text-gray-700 hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="px-2 py-1 border rounded text-gray-700 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      PKR {subtotal}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
              {cart.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                    No items in cart
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-xl font-bold">
            Total: PKR {calculateTotal().toFixed(2)}
          </div>
          <button
            onClick={completeSale}
            className="bg-green-600 text-white py-2 px-6 rounded-lg shadow hover:bg-green-700"
          >
            Complete Sale
          </button>
        </div>
      </main>
    </div>
  );
}
