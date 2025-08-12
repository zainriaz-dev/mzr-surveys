"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import toast from "react-hot-toast";

function LoginContent() {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const [pwd, setPwd] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Wrap access to search params with Suspense boundary to satisfy Next.js CSR bailout
  // In this client component, reading search params is fine at runtime
  const next = sp?.get("next") || "/admin";

  const submit = async () => {
    if (!pwd.trim()) {
      toast.error("Please enter a password");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Signing in...");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });

      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success("🎉 Welcome back! Redirecting to admin dashboard...", {
          duration: 2000,
        });
        setTimeout(() => {
          router.push(next);
        }, 1000);
      } else {
        toast.error("❌ Invalid password. Please try again.");
        setPwd("");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("🚫 Connection error. Please check your internet and try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      submit();
    }
  };

  return (
    <main className="min-h-screen grid place-items-center ghibli-bg text-white p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="blob bg-emerald-500/10 h-32 w-32 top-20 left-20" />
      <div className="blob bg-blue-400/10 h-40 w-40 bottom-20 right-20" />
      
      <div className="w-full max-w-md space-y-6">
        {/* Login Card */}
        <div className="glass rounded-2xl p-8 space-y-6 animate-slide-in-up border border-white/10">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-white/70 text-sm">Enter your password to access the dashboard</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">Password</label>
              <input 
                type="password" 
                value={pwd} 
                onChange={(e) => setPwd(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="w-full rounded-xl bg-black/20 border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 disabled:opacity-50" 
                placeholder="Enter admin password" 
                autoFocus
              />
            </div>

            <button 
              onClick={submit}
              disabled={isLoading || !pwd.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 py-3 px-4 font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-[1.02] relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  Sign In
                </div>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-white/50">
              Secure admin access for survey management
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-white/60 text-sm space-y-1">
          <p>Need help? Check your environment variables.</p>
          <p className="text-xs">ADMIN_PASSWORD should be set in .env.local</p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  // Wrap the client that reads useSearchParams in Suspense per Next.js requirement
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center ghibli-bg text-white">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}


