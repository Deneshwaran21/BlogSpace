"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Feather,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(
    registered ? "Account created successfully! Please sign in with your credentials." : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (!password) {
      errs.password = "Password is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(data.error || "Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      setServerSuccess(`Welcome back, ${data.user?.name || "Author"}! Redirecting...`);

      // Refresh and redirect to target page or feed
      setTimeout(() => {
        let target = "/";
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get("redirect");
          if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
            target = redirect;
          }
        }
        window.location.href = target;
      }, 600);
    } catch (err: unknown) {
      console.error("Login submission error:", err);
      setServerError("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-xs mx-auto"
        >
          <Feather className="w-6 h-6 text-amber-300" />
        </Link>
        <h1 className="text-3xl font-serif font-bold text-slate-900">
          Welcome back to BlogSpace
        </h1>
        <p className="text-sm text-slate-600">
          Enter your credentials to manage your publications and drafts.
        </p>
      </div>

      {/* Server Alerts */}
      {serverError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Unable to sign in</p>
            <p className="mt-0.5 text-rose-700">{serverError}</p>
          </div>
        </div>
      )}

      {serverSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-xs flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Success</p>
            <p className="mt-0.5 text-emerald-700">{serverSuccess}</p>
          </div>
        </div>
      )}

      {/* Card Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E4DA] shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="login-email"
            label="Email Address"
            type="email"
            placeholder="your-email@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
              if (serverError) setServerError(null);
            }}
            leftIcon={<Mail className="w-4 h-4" />}
            errorMessage={errors.email}
            required
            disabled={isLoading}
          />

          <div className="space-y-1.5">
            <Input
              id="login-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
                if (serverError) setServerError(null);
              }}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              errorMessage={errors.password}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#D8D4CA] text-slate-900 focus:ring-slate-800"
                disabled={isLoading}
              />
              Remember this device
            </label>

            <span className="text-slate-400 font-medium">
              Password protected
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={isLoading}
            rightIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          >
            {isLoading ? "Signing in..." : "Sign In to BlogSpace"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#F0ECE2] text-center text-xs text-slate-600">
          Don&apos;t have an author profile yet?{" "}
          <Link
            href="/register"
            className="text-slate-900 font-semibold hover:underline"
          >
            Apply to write
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={<div className="text-center text-slate-500">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
