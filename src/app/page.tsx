"use client";

import { useState, useEffect } from 'react';

type Product = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  sku: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]); // Explicitly define the type here
  const [form, setForm] = useState<Product>({
    id: 0, // Optional if you don't use it for form submission
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    sku: '',
  });
    useEffect(() => {
        fetch('/api/products')
            .then((res) => res.json())
            .then((data) => setProducts(data));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        setForm({id:0, name: '', category: '', quantity: 0, price: 0, sku: '' });
        const data = await fetch('/api/products').then((res) => res.json());
        setProducts(data);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Stationary Shop Inventory</h1>
            <form onSubmit={handleSubmit} className="mb-8">
                <input
                    className="border p-2 mr-2"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    className="border p-2 mr-2"
                    placeholder="Category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                <input
                    className="border p-2 mr-2"
                    type="number"
                    placeholder="Quantity"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                />
                <input
                    className="border p-2 mr-2"
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
                <input
                    className="border p-2 mr-2"
                    placeholder="SKU"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
                <button className="bg-blue-500 text-white p-2" type="submit">Add Product</button>
            </form>
            <table className="border-collapse border border-gray-400 w-full">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2">Name</th>
                        <th className="border border-gray-300 p-2">Category</th>
                        <th className="border border-gray-300 p-2">Quantity</th>
                        <th className="border border-gray-300 p-2">Price</th>
                        <th className="border border-gray-300 p-2">SKU</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product?.id}>
                            <td className="border border-gray-300 p-2">{product.name}</td>
                            <td className="border border-gray-300 p-2">{product.category}</td>
                            <td className="border border-gray-300 p-2">{product.quantity}</td>
                            <td className="border border-gray-300 p-2">{product.price}</td>
                            <td className="border border-gray-300 p-2">{product.sku}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}