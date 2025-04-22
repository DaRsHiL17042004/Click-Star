// src/pages/Auth/RegisterPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "client", // default role
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      toast.success("Registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <input name="name" onChange={handleChange} value={form.name} type="text" placeholder="Full Name" required className="w-full p-3 mb-4 border rounded" />
      <input name="email" onChange={handleChange} value={form.email} type="email" placeholder="Email" required className="w-full p-3 mb-4 border rounded" />
      <input name="password" onChange={handleChange} value={form.password} type="password" placeholder="Password" required className="w-full p-3 mb-4 border rounded" />
      <select name="role" onChange={handleChange} value={form.role} className="w-full p-3 mb-4 border rounded">
        <option value="client">Client</option>
        <option value="photographer">Photographer</option>
      </select>
      <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition">Register</button>
      <button type="button"onClick={() => navigate("/")}className="w-full bg-gray-500 text-white p-3 rounded hover:bg-gray-600 transition mt-2">Cancel
      </button>
      <p className="text-sm mt-4 text-center">
        Already have an account? <a href="/login" className="text-blue-500 underline">Login here</a>
      </p>
    </form>
  </div>
  );
};

export default RegisterPage;
