import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Package,
} from "lucide-react";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    email,
    password,
    confirmPassword,
  } = formData;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        email,
        password,
      });

      navigate("/login");
    } catch (error) {
      setError(
        error?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-slate-900 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left Side */}
        <div className="hidden md:flex border-r border-slate-700 bg-slate-900 text-white p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center">
                <Package size={24} />
              </div>

              <span className="text-xl font-bold">
                Asset Tracker
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight mb-5">
              Start managing
              <br />
              your assets.
            </h1>

            <p className="text-slate-300 text-base leading-7 max-w-md">
              Create your account and manage employees, assets and
              assignments from one place.
            </p>
          </div>

          <p className="text-sm text-slate-400">
            Asset Tracker Application
          </p>
        </div>

        {/* Right Side */}
        <div className="p-8 sm:p-10 md:p-12">
          <div className="max-w-md mx-auto">

            {/* Mobile Logo */}
            <div className="flex items-center gap-3 mb-8 md:hidden">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                <Package size={22} />
              </div>

              <span className="text-xl font-bold text-slate-100">
                Asset Tracker
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-100">
                Create an account
              </h2>

              <p className="text-slate-400 mt-2">
                Register to use Asset Tracker
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-950 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-950 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <User
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-950 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}

                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Login */}
            <p className="text-center text-sm text-slate-400 mt-8">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Login
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;