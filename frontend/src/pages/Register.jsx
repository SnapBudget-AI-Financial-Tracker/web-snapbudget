import { useState } from "react";
import { Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { evaluatePasswordStrength } from "../utils/passwordStrength";

/**
 * PasswordStrengthIndicator component.
 * Shows a progress bar + label that updates in real-time as user types.
 */
function PasswordStrengthIndicator({ password }) {
  if (!password) return null;
  const { level, color, width } = evaluatePasswordStrength(password);

  const textColors = {
    "Lemah":       "text-rose-600",
    "Cukup":       "text-amber-600",
    "Kuat":        "text-blue-600",
    "Sangat Kuat": "text-emerald-600",
  };

  return (
    <div className="mt-2 space-y-1.5">
      <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${color}`}
          style={{ width }}
          role="progressbar"
          aria-valuenow={parseInt(width)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Kekuatan password: ${level}`}
        />
      </div>
      <p className={`text-xs font-medium ${textColors[level] ?? "text-zinc-500"}`}>
        Kekuatan: {level}
      </p>
    </div>
  );
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await register({ name, email, password });
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred during registration. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Sign up to get started with SnapBudget."
      brandingTitle="Financial freedom.<br/>One step away."
      brandingSubtitle="Detailed tracking, intelligent forecasting, and simple insights that make managing your money feel effortless."
      reverse={true}
    >
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          label="Full Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={User}
          placeholder="John Doe"
          required
        />

        <Input
          label="Email address"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          placeholder="you@example.com"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              placeholder="••••••••"
              required
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <Input
            label="Confirm"
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={Lock}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="pt-3">
          <Button
            type="submit"
            isLoading={isLoading}
            icon={ArrowRight}
            variant="shimmer"
          >
            Create Account
          </Button>
        </div>
      </form>

      <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-zinc-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-[13px] text-zinc-500">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-6">
        <GoogleAuthButton actionText="Sign up" />
      </div>

      <div className="mt-8 text-center text-[13px] text-zinc-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-zinc-900 hover:underline underline-offset-4 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
