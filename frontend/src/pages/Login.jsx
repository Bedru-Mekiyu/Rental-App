import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
export default function Login() {
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const validate = () => {
    if (!email && !password) {
      return "Email and password are required";
    }

    if (!email) {
      return "Email is required";
    }

    if (!password) {
      return "Password is required";
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Enter a valid email address";
    }

    return null; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const res = await login(email, password, remember);

    if (!res.success) {
      setError(res.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md px-8 py-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center mb-2">
            <span className="text-white font-bold">◆</span>
          </div>
          <p className="text-indigo-500 font-semibold text-sm">
            RMS Enterprise
          </p>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-center text-gray-900">
          Sign In to RMS Enterprise
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Enter your credentials to access your account.
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              placeholder="Enter your Email Address"
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none
    ${
      error.includes("Email")
        ? "border-red-400 focus:ring-red-400"
        : "border-gray-200 focus:ring-indigo-500"
    }`}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" className="rounded border-gray-300" />
            Remember me
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
