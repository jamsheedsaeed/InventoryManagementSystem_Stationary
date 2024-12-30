"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  BrowserMultiFormatReader,
  NotFoundException,
} from "@zxing/library";
import { Uniform, School } from "@prisma/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Enhanced SalesPage with:
 *  1) Mobile-friendly styling
 *  2) A floating mini-cart (sticky)
 *  3) Live scanning status feedback
 */
export default function SalesPage() {
  // ---------------------------
  // 1) STATE + REFS
  // ---------------------------
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [uniforms, setUniforms] = useState<Uniform[]>([]);
  const [cart, setCart] = useState<
    {
      id: number;
      name: string;
      price: number;
      size: string;
      quantity: number;
    }[]
  >([]);

  const [discount, setDiscount] = useState<number>(0);

  // ZXing scanning
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Visual/UX states
  const [isCodeDetected, setIsCodeDetected] = useState(false);
  const [scanningStatus, setScanningStatus] = useState<"idle" | "scanning" | "scanned">("idle");

  // For the mini-cart drawer
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ---------------------------
  // 2) FETCH DATA
  // ---------------------------
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

  const fetchUniforms = async (schoolId: number) => {
    try {
      const res = await fetch(`/api/uniforms?schoolId=${schoolId}`);
      const data: Uniform[] = await res.json();
      setUniforms(data);
    } catch (error) {
      toast.error("Error fetching uniforms.");
    }
  };

  // ---------------------------
  // 3) CART LOGIC
  // ---------------------------
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

      const outOfStockItems = cart.filter((cartItem) => {
        const uniform = stockData.find((u) => u.id === cartItem.id);
        return uniform && uniform.stock < cartItem.quantity;
      });

      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems.map((i) => i.name).join(", ");
        toast.error(`Out of stock: ${itemNames}`);
        return;
      }

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
      if (selectedSchoolId) fetchUniforms(selectedSchoolId);
    } catch (error) {
      toast.error("Failed to complete sale.");
    }
  };

  // ---------------------------
  // 4) UTILITY
  // ---------------------------
  const handleSchoolChange = (schoolId: string) => {
    const id = parseInt(schoolId);
    setSelectedSchoolId(id);
    fetchUniforms(id);
  };

  const calculateTotal = () => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmount = (total * discount) / 100;
    return total - discountAmount;
  };

  // Toggle the mini-cart drawer
  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  // ---------------------------
  // 5) ZXing LIVE SCANNING
  // ---------------------------
  const startScanning = () => {
    if (!codeReaderRef.current) return;
    if (!selectedDeviceId) {
      toast.error("Please select a camera first.");
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) {
      toast.error("Video element not found.");
      return;
    }

    setScanningStatus("scanning"); // show user we are actively scanning

    codeReaderRef.current.decodeFromVideoDevice(
      selectedDeviceId,
      videoElement,
      (result, err) => {
        if (result) {
          // Barcode found
          setIsCodeDetected(true);
          setScanningStatus("scanned");

          // Revert bounding box color + status after a second or so
          setTimeout(() => {
            setIsCodeDetected(false);
            setScanningStatus("scanning");
          }, 1000);

          const scannedBarcode = result.getText();
          toast.success(`Barcode: ${scannedBarcode}`);

          // Match with uniform if possible
          const matchingUniform = uniforms.find((u) => u.barcode === scannedBarcode);
          if (matchingUniform) {
            addToCart(matchingUniform);
          } else {
            toast.error("Product not found in the system.");
          }
        }

        if (err && !(err instanceof NotFoundException)) {
          console.error("Scan error:", err);
        }
      }
    );
    console.log(`Started scanning on device ID: ${selectedDeviceId}`);
  };

  const stopScanning = () => {
    if (codeReaderRef.current) codeReaderRef.current.reset();
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      videoRef.current.srcObject = null;
    }
    setIsCodeDetected(false);
    setScanningStatus("idle");
    toast.info("Stopped scanning.");
  };

  // ---------------------------
  // 6) INITIALIZE
  // ---------------------------
  useEffect(() => {
    fetchSchools();

    codeReaderRef.current = new BrowserMultiFormatReader();
    codeReaderRef.current
      .listVideoInputDevices()
      .then((devices) => {
        setVideoInputDevices(devices);
        if (devices.length > 0) setSelectedDeviceId(devices[0].deviceId);
      })
      .catch((err) => console.error("Error listing camera devices:", err));

    return () => {
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // 7) RENDER
  // ---------------------------
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
          Sales Page
        </h1>

        {/* School selection */}
        <div className="mb-4 md:mb-6">
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

        {/* Camera selection */}
        <div className="mb-4 md:mb-6">
          <label className="block text-lg font-medium mb-2">Select Camera</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            {videoInputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || device.deviceId}
              </option>
            ))}
          </select>
        </div>

        {/* Scanning Status / Instructions */}
        <div className="mb-2 text-gray-700">
          {scanningStatus === "idle" && (
            <p className="text-sm">Click "Start Live Scanning" to begin.</p>
          )}
          {scanningStatus === "scanning" && (
            <p className="text-sm text-blue-700">Scanning... Point your camera at a barcode.</p>
          )}
          {scanningStatus === "scanned" && (
            <p className="text-sm text-green-700">Barcode detected!</p>
          )}
        </div>

        {/* Video + Overlay for scanning */}
        <div className="relative w-full max-w-md mb-4 md:mb-6">
          <video ref={videoRef} className="w-full rounded shadow" id="zxingVideo" />
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-center items-center">
            <div
              className="border-4 border-dashed"
              style={{
                width: "80%",
                height: "40%",
                borderColor: isCodeDetected ? "green" : "white",
              }}
            />
            <p className="text-white mt-2 text-sm">
              Align the barcode within this box
            </p>
          </div>
        </div>

        {/* Start/Stop Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={startScanning}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Start Live Scanning
          </button>
          <button
            onClick={stopScanning}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
          >
            Stop Scanning
          </button>
        </div>

        {/* Uniforms Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {uniforms.map((uniform) => (
            <div
              key={uniform.id}
              className="bg-white shadow-md rounded-lg overflow-hidden transition transform hover:scale-105"
            >
              {uniform.image && (
                <img
                  src={`data:image/jpeg;base64,${Buffer.from(
                    uniform.image
                  ).toString("base64")}`}
                  alt={uniform.name}
                  className="w-full h-40 md:h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-base md:text-lg font-bold">{uniform.name}</h3>
                <p className="text-gray-600 text-sm md:text-base">Size: {uniform.size}</p>
                <p className="text-gray-600 text-sm md:text-base">
                  Price: PKR {uniform.price}
                </p>
                <button
                  onClick={() => addToCart(uniform)}
                  className="mt-2 bg-blue-600 text-white py-1 px-2 md:py-2 md:px-4 rounded-lg hover:bg-blue-700 text-sm md:text-base"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MINI CART ICON (sticky) */}
      <button
        className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg"
        onClick={toggleCart}
      >
        {cart.length}
      </button>

      {/* CART Drawer (Side Panel) */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Cart</h2>
            <button
              onClick={toggleCart}
              className="text-xl font-bold text-gray-600 hover:text-gray-900"
            >
              &times;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="mb-4 border-b pb-2">
                <h3 className="font-bold">{item.name}</h3>
                <p>Size: {item.size}</p>
                <p>Price: PKR {item.price}</p>
                <p>Quantity: {item.quantity}</p>
              </div>
            ))}
            {cart.length === 0 && (
              <p className="text-gray-500">Your cart is empty.</p>
            )}
          </div>

          <div className="mt-4">
            <div className="font-bold mb-2">
              Total: PKR {calculateTotal().toFixed(2)}
            </div>
            <button
              onClick={completeSale}
              className="bg-green-600 w-full text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP CART (shows on MD+) */}
      <div className="hidden md:block w-1/3 bg-white p-6 shadow-lg overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Cart</h2>
        {cart.map((item) => (
          <div key={item.id} className="mb-4 border-b pb-2">
            <h3 className="font-bold">{item.name}</h3>
            <p>Size: {item.size}</p>
            <p>Price: PKR {item.price}</p>
            <p>Quantity: {item.quantity}</p>
          </div>
        ))}
        {cart.length === 0 && (
          <p className="text-gray-500">Your cart is empty.</p>
        )}

        <div className="font-bold mt-4 mb-2">
          Total: PKR {calculateTotal().toFixed(2)}
        </div>
        <button
          onClick={completeSale}
          className="mt-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Complete Sale
        </button>
      </div>
    </div>
  );
}
