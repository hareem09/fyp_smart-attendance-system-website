import React from "react";
import { useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === "email") {
      setEmail(e.target.value);
    } else if (e.target.name === "password") {
      setPassword(e.target.value);
    }
  };
  const handleSubmit = async (e) => {
       e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
    try {
      const res = await axios.post("/login/admin", { email, password });
      console.log(res.data);
           setSuccess(true);
      alert("Login successful!");
      return <Navigate to="/dashboard" />;
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <h1>AdminLogin</h1>
      <body className="bg-gray-100 h-screen flex items-center justify-center">
        <form
          action="/login"
          method="POST"
          className="border-2  border-black p-1.5"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 dark:text-white/60 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              className="bg-gray-100 border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder:text-gray-400 dark:text-white"
              placeholder="name@company.com"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 dark:text-white/60 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              className="bg-gray-100 border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder:text-gray-400 dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700  text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </body>
    </>
  );
}

export default AdminLogin;
