import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function GoogleAuthButton() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");
    try {
      await googleLogin(credentialResponse.credential);
      navigate("/dashboard");
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex justify-center w-full">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500 py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.error("GSI_ERROR: Google Sign-In failed. This is usually due to an 'Origin Mismatch' in the Google Cloud Console.");
              setError("Google login failed. Please check your console settings and try again.");
            }}
            theme="outline"
            size="large"
            shape="rectangular"
            text="continue_with"
          />
        )}
      </div>
    </div>
  );
}
