import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  Package,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { loginAdmin, loginEmployee } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState(null);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const login = accountType === "employee" ? loginEmployee : loginAdmin;

      await login({
        email,
        password,
      });

      navigate(accountType === "employee" ? "/assets" : "/dashboard");
    } catch (error) {
      setError(
        error?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccountTypeSelect = (type) => {
    setAccountType(type);
    setError("");
  };

  const handleBack = () => {
    setAccountType(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-slate-900 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 md:h-[460px]">
        
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
              Manage your assets
              <br />
              with ease.
            </h1>

            <p className="text-slate-300 text-base leading-7 max-w-md">
              Keep track of company assets, employees and assignments
              from one simple dashboard.
            </p>
          </div>

          {/* <p className="text-sm text-slate-400">
            Asset Tracker Application
          </p> */}
        </div>

        {/* Right Side */}
        <div className="p-8 sm:p-10 md:p-12">
          <div className="max-w-md h-full mx-auto flex flex-col">

            {/* Mobile Logo */}
            <div className="flex items-center gap-3 mb-8 md:hidden">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                <Package size={22} />
              </div>

              <span className="text-xl font-bold text-slate-100">
                Asset Tracker
              </span>
            </div>

            {accountType === null && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-100">
                  Welcome back
                </h2>

                <p className="text-slate-400 mt-2">
                  Login to your account
                </p>
              </div>
            )}

            {accountType === null ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-300">
                  Login as
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAccountTypeSelect("admin")}
                    className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-950 px-4 py-4 text-left text-sm font-semibold text-slate-200 transition hover:border-blue-500 hover:bg-blue-950"
                  >
                    <span className="flex items-center gap-3">
                      <ShieldCheck size={19} className="text-blue-400" />
                      Admin
                    </span>
                    <ArrowRight size={18} className="text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAccountTypeSelect("employee")}
                    className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-950 px-4 py-4 text-left text-sm font-semibold text-slate-200 transition hover:border-blue-500 hover:bg-blue-950"
                  >
                    <span className="flex items-center gap-3">
                      <UserRound size={19} className="text-blue-400" />
                      Employee
                    </span>
                    <ArrowRight size={18} className="text-slate-400" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  className="mb-12 flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-slate-200"
                  aria-label="Choose a different account type"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>

                {error && (
                  <div className="mb-6 rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Logging in..." : "Login"}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </form>
              </>
            )}

            {accountType === null && (
              <p className="text-center text-sm text-slate-400 mt-auto pt-8">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Register
                </Link>
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;