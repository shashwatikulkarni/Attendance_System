"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();

  const token =
    typeof params.token === "string" ? params.token : "";

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setMessage("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-white relative px-4">

      {/* Back */}
      <div className="absolute top-6 left-6 text-sm text-gray-500">
        <Link href="/login" className="hover:text-indigo-600 transition">
          ← Back to home
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-4 rounded-xl">
            <ShieldCheck className="text-indigo-600 w-8 h-8" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-2">
          Reset your password
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter a new password for your account.
        </p>

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              New password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          {message && (
            <p className="text-center text-sm mt-3 text-gray-600">
              {message}
            </p>
          )}
        </form>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Secured with end-to-end encryption
      </p>
    </div>
  );
}
