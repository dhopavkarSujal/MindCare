import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setError("");

      await login(email, password);

      navigate("/dashboard", {
        state: {
          successMessage: "Login successful. Welcome back!",
        },
      });
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error?.message ||
          "Unable to sign in. Please check your credentials."
      );
    }
  }; 

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left visual panel */}
        <div className="relative hidden overflow-hidden bg-[#0F766E] lg:flex">

          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            <Link
              to="/"
              className="flex w-fit items-center gap-3 text-white"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Sparkles size={20} />
              </div>

              <div>
                <p className="font-semibold">
                  MindCare
                </p>

                <p className="text-[10px] text-teal-100/70">
                  Your space to breathe
                </p>
              </div>

            </Link>

            <div className="max-w-lg text-white">

              <p className="text-sm font-medium text-teal-100">
                Welcome back
              </p>

              <h1 className="mt-4 text-4xl font-semibold leading-tight xl:text-5xl">
                Take a moment.
                <br />
                Start where you are.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-teal-50/75">
                Continue your MindCare journey and use your private
                space to reflect, talk, and check in with yourself.
              </p>

              <div className="mt-8 flex gap-3">

                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-lg font-semibold">Private</p>
                  <p className="mt-1 text-[10px] text-teal-50/60">
                    Personal wellbeing space
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-lg font-semibold">Simple</p>
                  <p className="mt-1 text-[10px] text-teal-50/60">
                    Designed for everyday use
                  </p>
                </div>

              </div>

            </div>

            <p className="text-xs text-teal-100/50">
              MindCare • Supportive digital wellbeing
            </p>

          </div>

        </div>

        {/* Right form */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#0F766E] lg:hidden"
            >
              <ArrowLeft size={16} />
              Back
            </Link>

            <div className="mb-8">

              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#DFF5F1]">
                <Sparkles
                  size={20}
                  className="text-[#0F766E]"
                />
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to continue to your MindCare space.
              </p>

            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>

                <label htmlFor="login-email" className="text-sm font-medium text-slate-700">
                  Email address
                </label>

                <div className="relative mt-2">

                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-300 focus:border-[#0F766E] focus:ring-4 focus:ring-[#DFF5F1]/70"
                  />

                </div>

              </div>

              {/* Password */}
              <div>

                <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative mt-2">

                  <LockKeyhole
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-300 focus:border-[#0F766E] focus:ring-4 focus:ring-[#DFF5F1]/70"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Options */}
              {/* <div className="flex items-center justify-between">

                <label className="flex items-center gap-2 text-xs text-slate-500">

                 <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#0F766E]"
                  />

                  Remember me

                </label>

                <Link to="/login">
                  Forgot password?
                </Link>

              </div> */}

              {/* Submit */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F766E] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59] hover:shadow-md active:scale-[0.99]"
              >
                Sign In
                <ArrowRight size={17} />
              </button>

            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs text-slate-400">
                or
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <span className="font-bold text-[#4285F4]">
                G
              </span>
              Continue with Google
            </button>

            <p className="mt-7 text-center text-sm text-slate-500">

              Don't have an account?

              <Link
                to="/register"
                className="ml-1 font-semibold text-[#0F766E] hover:underline"
              >
                Create one
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}