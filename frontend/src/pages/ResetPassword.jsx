import { useState } from "react";
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import authService from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid or expired reset token. Please request a new one.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Password reset"
        subtitle="Your password has been successfully reset."
        brandingTitle="Welcome back.<br/>To clarity."
        brandingSubtitle="We've updated your security credentials. You can now use your new password to sign in and continue your financial journey."
      >
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center p-3 bg-green-50 rounded-full mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <p className="text-zinc-600 text-sm mb-8">
            Success! Redirecting you to the login page in a few seconds...
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
      title="Set new password"
      subtitle="Enter a new password for your account."
      brandingTitle="Security first.<br/>Simplicity always."
      brandingSubtitle="We ensure that resetting your account is as secure as it is easy, so you can get back to managing what matters."
    >
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          placeholder="••••••••"
          required
        />

        <Input
          label="Confirm New Password"
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={Lock}
          placeholder="••••••••"
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isLoading}
            icon={ArrowRight}
            className="mt-4"
          >
            Reset password
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center text-[13px] text-zinc-500">
        Back to{" "}
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
