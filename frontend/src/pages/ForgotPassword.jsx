import { useState } from "react";
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import authService from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`We've sent a password reset link to ${email}`}
        brandingTitle="Secure and private.<br/>Always."
        brandingSubtitle="We use industry-standard encryption and security practices to ensure your financial data and account remain protected."
      >
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center p-3 bg-green-50 rounded-full mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <p className="text-zinc-600 text-sm mb-8">
            Please check your inbox and follow the instructions to reset your password. The link will expire in 1 hour.
          </p>
          <Link to="/login">
            <Button>Back to login</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="No worries, we'll send you reset instructions."
      brandingTitle="Master your money.<br/>Without the effort."
      brandingSubtitle="Join thousands of users taking control of their finances through intelligent tracking and predictive budgeting."
    >
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <Button
          type="submit"
          isLoading={isLoading}
          icon={ArrowRight}
        >
          Send reset link
        </Button>
      </form>

      <div className="mt-8 text-center text-[13px] text-zinc-500">
        Remember your password?{" "}
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
