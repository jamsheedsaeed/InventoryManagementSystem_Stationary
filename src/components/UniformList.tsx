"use client";

import { useEffect, useState } from "react";
import { Uniform } from "@prisma/client";

export default function UniformList() {
  const [uniforms, setUniforms] = useState<Uniform[]>([]);

  // Fetch uniforms from the API
  const fetchUniforms = async () => {
    try {
      const res = await fetch("/api/uniforms");
      if (!res.ok) throw new Error("Failed to fetch uniforms");
      const data: Uniform[] = await res.json();
      setUniforms(data);
    } catch (error) {
      console.error("Error fetching uniforms:", error);
    }
  };

  useEffect(() => {
    fetchUniforms();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">List of Uniforms</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniforms.map((uniform) => (
          <div
            key={uniform.id}
            className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition relative"
          >
            {/* Uniform Image */}
            {uniform.image ? (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={
      typeof uniform.image === "string"
        ? uniform.image // If it's already a Base64 string
        : `data:image/jpeg;base64,${Buffer.from(uniform.image).toString("base64")}` // Convert Uint8Array to Base64
    }
    alt={uniform.name}
    className="w-full h-48 object-cover rounded-md mb-4"
  />
) : (
  <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center mb-4">
    <span className="text-gray-500">No Image Available</span>
  </div>
)}


            {/* Uniform Details */}
            <h3 className="text-lg font-bold text-gray-800">{uniform.name}</h3>
            <p className="text-gray-600">
              <strong>Size:</strong> {uniform.size}
            </p>
            <p className="text-gray-600">
              <strong>Price:</strong> ${uniform.price}
            </p>
            <p className="text-gray-600">
              <strong>Stock:</strong> {uniform.stock}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
