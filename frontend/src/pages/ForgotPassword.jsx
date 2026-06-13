// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Mail } from "lucide-react";
import logoImage from "../assets/Screenshot.png";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/forgot-password", { email });
      setSubmitted(true);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send reset link";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-transition relative flex min-h-screen w-screen items-start justify-center overflow-y-auto bg-linear-to-br from-[#d2eceb] via-[#e8eff2] to-[#cdeaf4] p-1 sm:items-center">
<div className="flex min-h-[calc(100vh-8px)] h-auto w-[calc(100vw-8px)] flex-col overflow-visible rounded-[1.9rem] border border-slate-200/80 bg-[#f4f6f7] shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)] lg:h-[calc(100vh-8px)] lg:grid lg:grid-cols-2 lg:overflow-hidden">
          <section className="relative flex min-h-45 items-center justify-center p-0 sm:min-h-55 lg:min-h-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_32%)]" />
            <div className="relative z-10 flex h-full max-h-65 w-full items-center justify-center bg-[#f8f8f8] p-6 sm:max-h-80 sm:p-8 lg:max-h-none lg:p-12">
              <img
                src={logoImage}
                alt="Ethiopia islamic affairs superm counsil logo"
                className="h-full w-full max-w-136 object-contain"
              />
            </div>
          </section>

          <section className="flex min-h-0 items-center justify-center bg-[#f8f8f8] p-0">
            <div className="h-full w-full p-6 sm:p-8 lg:py-12 lg:pl-6 lg:pr-12 lg:translate-y-20">
              <div className="mb-6 border-b border-slate-100 pb-5 sm:mb-7 sm:pb-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Password Reset
                </div>
                <h1 className="text-[2.2rem] font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[2.7rem]">
                  Check your email
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  We've sent a password reset link to {email}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-800">
                  Didn't receive the email? Check your spam filter, or{" "}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="font-semibold text-emerald-700 underline hover:text-emerald-800"
                  >
                    try again
                  </button>
                </p>
              </div>

              <div className="mt-6 max-w-sm border-t border-slate-100 pt-4 text-left">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition relative flex min-h-screen w-screen items-start justify-center overflow-y-auto bg-linear-to-br from-[#d2eceb] via-[#e8eff2] to-[#cdeaf4] p-1 sm:items-center">
      <div className="grid min-h-[calc(100vh-8px)] h-auto w-[calc(100vw-8px)] grid-rows-[auto_1fr] overflow-visible rounded-[1.9rem] border border-slate-200/80 bg-[#f4f6f7] shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)] lg:h-[calc(100vh-8px)] lg:grid-cols-2 lg:grid-rows-1 lg:overflow-hidden">
        <section className="relative hidden lg:flex min-h-45 items-center justify-center p-0 lg:min-h-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_32%)]" />
          <div className="relative z-10 flex h-full max-h-65 w-full items-center justify-center bg-[#f8f8f8] p-6 lg:max-h-none lg:p-12">
            <img
              src={logoImage}
              alt="Ethiopia islamic affairs superm counsil logo"
              className="h-full w-full max-w-136 object-contain"
            />
          </div>
        </section>

        <section className="flex min-h-0 items-center justify-center bg-[#f8f8f8] p-0">
          <div className="h-full w-full p-6 sm:p-8 lg:py-12 lg:pl-6 lg:pr-12 lg:translate-y-20">
            <div className="mb-6 border-b border-slate-100 pb-5 sm:mb-7 sm:pb-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Password Reset
              </div>
              <h1 className="text-[2.2rem] font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[2.7rem]">
                Forgot password?
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-sm space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input h-11 pl-10 sm:h-12"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn-primary w-full justify-center py-2 text-sm sm:py-2.5 ${
                  loading ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-6 max-w-sm border-t border-slate-100 pt-4 text-left">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}