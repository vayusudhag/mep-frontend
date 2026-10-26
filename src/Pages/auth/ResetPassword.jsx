import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, ArrowRight, Hash } from "lucide-react";
import toast from "react-hot-toast";
import { resetPasswordAPI } from "../../services/auth";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const mobileNumber = params.get("mobile");
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!mobileNumber) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) return toast.error("Enter valid 6-digit OTP");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      await resetPasswordAPI({ mobileNumber, otp, newPassword: password });
      toast.success("Password reset successful");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#6c3b1c] via-[#3b261a] to-[#1a120c] p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl bg-[#4a2316]/90 backdrop-blur-xl border border-amber-800/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-8 text-[#f5efe6]"
      >
        <h1 className="text-2xl font-semibold text-center mb-2">
          Reset Password
        </h1>
        <p className="text-center text-sm text-amber-200/70 mb-6">
          Secure your account with a new password
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mobile */}
          <input
            value={mobileNumber}
            disabled
            className="w-full rounded-xl px-4 py-3 bg-[#2a1a12] text-amber-100 border border-amber-900/40 cursor-not-allowed"
          />

          {/* OTP */}
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f5efe6] text-[#3b261a]
              placeholder:text-[#9c7b5a]
              focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          {/* New Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f5efe6] text-[#3b261a]
              placeholder:text-[#9c7b5a]
              focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          {/* Confirm */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f5efe6] text-[#3b261a]
              placeholder:text-[#9c7b5a]
              focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3
            bg-linear-to-r from-amber-600 to-orange-600
            hover:from-amber-500 hover:to-orange-500
            text-white font-medium shadow-lg transition disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
            <ArrowRight size={18} />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
