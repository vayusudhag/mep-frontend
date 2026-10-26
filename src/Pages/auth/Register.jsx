import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, Phone, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { validateRegister } from "../../utils/validation";
import { registerAPI } from "../../services/auth/index";

const normalizeMobile = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
};

export default function Register() {
  // LOCAL FORM STATE (CORRECT)
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateRegister({
      username,
      mobileNumber,
      password,
    });

    setErrors(errors);
    if (!isValid) return;

    try {
      setLoading(true);
      const response = await registerAPI({
        username,
        mobileNumber: normalizeMobile(mobileNumber),
        password,
      });
      const user = response.data.user;
      // console.log("user details registered  :", user);
      toast.success("Registration successful");
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <motion.div
        key="register"
        initial={{ opacity: 0, x: 100, rotateY: -90 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        exit={{ opacity: 0, x: -100, rotateY: 90 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-linear-to-br from-amber-950/90 to-orange-950/90 
        backdrop-blur-xl rounded-3xl  w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl
      p-4 sm:p-6 md:p-8 mt-6 sm:mt-10
 shadow-2xl border-2 border-amber-700/50 
       mx-auto flex flex-col"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-3 text-center"
        >
          <motion.h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-100 my-3">
            MANAEDLAPANDALU
          </motion.h1>
          <h2 className="text-amber-100">Register</h2>
        </motion.div>
        <button
          type="button"
          className="w-full text-left  text-amber-300/70 hover:text-amber-200 transition-colors mb-3"
        >
          <Link to="/"> Back to Home</Link>
        </button>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full Name */}
          <InputField
            label="Full Name"
            icon={<User />}
            value={username}
            onChange={setUsername}
            error={errors.username}
          />

          <InputField
            label="Mobile Number"
            icon={<Phone />}
            value={mobileNumber}
            onChange={setMobileNumber}
            maxLength={10}
            type="tel"
            error={errors.mobileNumber}
          />

          <InputField
            label="Password"
            icon={<Lock />}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            error={errors.password}
            rightIcon={showPassword ? <Eye /> : <EyeOff />}
            onRightIconClick={() => setShowPassword((prev) => !prev)}
            rightIconAriaLabel={
              showPassword ? "Hide password" : "Show password"
            }
          />

          {/* Submit */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 pt-2"
          >
            <motion.button
              disabled={loading}
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full bg-linear-to-r from-red-700 to-orange-700 
              text-white rounded-2xl py-3 px-4 sm:py-4 sm:px-6
text-sm sm:text-base
 flex items-center justify-center gap-3 
              border-2 border-red-600 
              focus:outline-none focus:ring-2 focus:ring-red-500`}
            >
              {loading ? "Creating Account..." : "Sign Up"}{" "}
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <button
              type="button"
              className="w-full text-amber-300/70 hover:text-amber-200 transition-colors"
            >
              <Link to="/login"> Have a account?Login.</Link>
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

/* ---------------- Reusable Input ---------------- */

function InputField({
  label,
  icon,
  value,
  onChange,
  type = "text",
  maxLength,
  error,
  rightIcon,
  onRightIconClick,
  rightIconAriaLabel = "Toggle field visibility",
}) {
  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <label className="text-amber-200">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400">
          {icon}
        </span>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type={type}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-amber-900/50 border-2 rounded-2xl pl-12 ${rightIcon ? "pr-12" : "pr-3"} py-2 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm sm:text-base
          ${error ? "border-red-500" : "border-amber-600"}`}
        />
        {rightIcon && onRightIconClick ? (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-300 hover:text-amber-100"
            aria-label={rightIconAriaLabel}
          >
            {rightIcon}
          </button>
        ) : null}
      </div>

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </motion.div>
  );
}
