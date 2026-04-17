import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your details to access your dashboard."
      brandingTitle="Master your money.<br/>Without the effort."
      brandingSubtitle="Join thousands of users taking control of their finances through intelligent tracking and predictive budgeting."
      reverse={false}
    >
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label
            className="text-[13px] font-medium text-zinc-700 block"
            htmlFor="email"
          >
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-zinc-400" strokeWidth={2.5} />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 placeholder-zinc-400 transition-all outline-none text-sm"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center">
            <label
              className="text-[13px] font-medium text-zinc-700 block"
              htmlFor="password"
            >
              Password
            </label>
            <a
              href="#"
              className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-zinc-400" strokeWidth={2.5} />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 placeholder-zinc-400 transition-all outline-none text-sm"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="flex items-center pt-1 pb-3">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 bg-white border-zinc-300 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer"
          />
          <label
            htmlFor="remember-me"
            className="ml-2.5 block text-sm text-zinc-600 cursor-pointer select-none"
          >
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 group"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
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
        <GoogleAuthButton actionText="Sign in" />
      </div>

      <div className="mt-8 text-center text-[13px] text-zinc-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-zinc-900 hover:underline underline-offset-4 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
}
