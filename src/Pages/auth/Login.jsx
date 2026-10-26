import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Phone, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { validateLogin } from "../../utils/validation";
import { loginAPI, forgotPasswordAPI } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";

const normalizeMobile = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
};

export default function Login() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotMobile, setForgotMobile] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const { initAuth } = useAuth();

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateLogin({ mobileNumber, password });
    setErrors(errors);
    if (!isValid) return;

    try {
      setLoading(true);
      await loginAPI({ mobileNumber: normalizeMobile(mobileNumber), password });
      const authenticated = await initAuth();
      if (!authenticated) {
        toast.error(
          "Login succeeded but session was not established. Please try again.",
        );
        return;
      }

      toast.success("Login successful");
      navigate("/owners");
    } catch (err) {
      const message = err?.response?.data?.message
        ? err.response.data.message
        : "Unable to reach login service. Check backend and CORS/proxy config.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async () => {
    const normalizedForgotMobile = normalizeMobile(forgotMobile);

    if (!/^[6-9]\d{9}$/.test(normalizedForgotMobile)) {
      toast.error("Enter valid 10-digit mobile number");
      return;
    }

    try {
      setForgotLoading(true);

      await forgotPasswordAPI(normalizedForgotMobile);

      toast.success("If registered, OTP has been sent");
      navigate(`/reset-password?mobile=${normalizedForgotMobile}`);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-amber-950/90 backdrop-blur-xl rounded-3xl p-8 border border-amber-700/50 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-amber-100">MANAEDLAPANDALU</h2>
          <p className="text-amber-300/80 mt-1">Login to continue</p>
        </div>

        <button
          type="button"
          className="w-full text-left  text-amber-300/70 hover:text-amber-200 transition-colors mb-3"
        >
          <Link to="/"> Back to Home</Link>
        </button>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Mobile */}
          <div>
            <label className="text-sm text-amber-200">Mobile Number</label>
            <div className="relative mt-1">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4" />
              <input
                type="tel"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full bg-amber-900/50 border border-amber-700/50 rounded-xl pl-12 py-3 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm sm:text-base"
              />
            </div>
            {errors.mobileNumber && (
              <p className="text-red-400 text-sm mt-1">{errors.mobileNumber}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-amber-200">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-amber-900/50 border border-amber-700/50 rounded-xl pl-12 pr-12 py-3 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-300 hover:text-amber-100"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Forgot toggle */}
          <button
            type="button"
            onClick={() => setShowForgot((v) => !v)}
            className="w-full text-right text-sm text-amber-300/80 hover:text-amber-200"
          >
            {showForgot ? "Close forgot password" : "Forgot password?"}
          </button>

          {/* FORGOT PASSWORD EXPAND */}
          {showForgot && (
            <div className="space-y-3 border-t border-amber-700/30 pt-4">
              <input
                type="tel"
                maxLength={10}
                value={forgotMobile}
                onChange={(e) => setForgotMobile(e.target.value)}
                placeholder="Enter mobile number"
                className="w-full px-4 py-3 rounded-xl bg-amber-900/50 border border-amber-700/50 text-amber-100"
              />

              <button
                type="button"
                disabled={forgotLoading}
                onClick={handleForgotPassword}
                className="w-full py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 text-white disabled:opacity-60 hover:brightness-150 transition-all duration-300"
              >
                {forgotLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          )}

          {/* Submit */}
          {showForgot ? null : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-amber-600 to-orange-600 text-white py-3 rounded-xl border border-amber-500 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}

          {/* Register */}
          <div className="text-center">
            <Link
              to="/register"
              className="text-sm text-amber-300/70 hover:text-amber-200"
            >
              Don&apos;t have an account?
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
