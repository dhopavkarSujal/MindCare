import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register() {

  const navigate = useNavigate();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all the fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");

      const data = await register(
        formData.email,
        formData.password,
        formData.fullName
      );

      if (data.session) {
        navigate("/dashboard");
      } else {
        setError(
          "Account created. Please verify your email before signing in."
        );
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error?.message ||
          "Unable to create account."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left */}
        <div className="relative hidden overflow-hidden bg-[#0F766E] lg:flex">

          <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute bottom-[-100px] right-[-100px] h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" />

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

            <div>

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles size={25} />
              </div>

              <h1 className="max-w-md text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Create your
                <br />
                personal space.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-teal-50/75">
                Start with a simple account and explore a calm space
                for conversations, mood check-ins, journaling and
                support.
              </p>

              <div className="mt-8 space-y-3">

                {[
                  "Private personal space",
                  "Mood and wellbeing tracking",
                  "Supportive conversations",
                  "Access to helpful resources",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-teal-50/90"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                      <Check size={12} />
                    </div>

                    {item}
                  </div>
                ))}

              </div>

            </div>

            <p className="text-xs text-teal-100/50">
              MindCare • Supportive digital wellbeing
            </p>

          </div>

        </div>

        {/* Form */}
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
                Create your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Set up your MindCare space in a few seconds.
              </p>

            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Full name */}
              <div>

                <label className="text-sm font-medium text-slate-700">
                  Full name
                </label>

                <div className="relative mt-2">

                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-300 focus:border-[#0F766E] focus:ring-4 focus:ring-[#DFF5F1]/70"
                  />

                </div>

              </div>

              {/* Email */}
              <div>

                <label className="text-sm font-medium text-slate-700">
                  Email address
                </label>

                <div className="relative mt-2">

                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
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

                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative mt-2">

                  <LockKeyhole
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-300 focus:border-[#0F766E] focus:ring-4 focus:ring-[#DFF5F1]/70"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Confirm Password */}
              <div>

                <label className="text-sm font-medium text-slate-700">
                  Confirm password
                </label>

                <div className="relative mt-2">

                  <LockKeyhole
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-300 focus:border-[#0F766E] focus:ring-4 focus:ring-[#DFF5F1]/70"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 pt-1 text-xs leading-5 text-slate-500">

                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#0F766E]"
                />

                <span>
                  I understand that MindCare is a supportive digital
                  wellbeing platform and not a replacement for
                  professional healthcare.
                </span>

              </label>

              {/* Submit */}
              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F766E] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59] hover:shadow-md active:scale-[0.99]"
              >
                Create Account
                <ArrowRight size={17} />
              </button>

            </form>

            <p className="mt-7 text-center text-sm text-slate-500">

              Already have an account?

              <Link
                to="/login"
                className="ml-1 font-semibold text-[#0F766E] hover:underline"
              >
                Sign in
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}