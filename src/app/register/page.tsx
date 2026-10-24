"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Feather,
  User,
  Mail,
  Lock,
  CheckCircle2,
  UserPlus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "Design Systems",
    "Technology",
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const availableTopics = [
    "Design Systems",
    "Technology",
    "Engineering",
    "Artificial Intelligence",
    "Productivity",
    "Culture",
  ];

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = "Full name is required.";
    } else if (fullName.trim().length < 2) {
      errs.fullName = "Name must be at least 2 characters.";
    }

    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (!agreeTerms) {
      errs.agreeTerms = "You must agree to the editorial code and terms.";
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
      // 1. Call real registration API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(data.error || "Unable to register account. Please try again.");
        setIsLoading(false);
        return;
      }

      setServerSuccess("Account created successfully! Signing you in...");

      // 2. Automatically log the user in to issue session cookie
      try {
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

        if (loginRes.ok) {
          setTimeout(() => {
            window.location.href = "/";
          }, 600);
          return;
        }
      } catch {
        // Fall back to login page if auto-login network fails
      }

      // If auto-login didn't complete, redirect to login page with notice
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 800);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setServerError("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-xs mx-auto"
          >
            <Feather className="w-6 h-6 text-amber-300" />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Join BlogSpace
          </h1>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Become a contributor or reader in an editorial community that values substance.
          </p>
        </div>

        {/* Server Feedback Alerts */}
        {serverError && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 text-xs flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Registration Failed</p>
              <p className="mt-0.5 text-rose-700">{serverError}</p>
            </div>
          </div>
        )}

        {serverSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-xs flex items-start gap-3 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Account Created</p>
              <p className="mt-0.5 text-emerald-700">{serverSuccess}</p>
            </div>
          </div>
        )}

        {/* Card Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E4DA] shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="register-name"
              label="Full Name"
              type="text"
              placeholder="e.g. Julian Thorne"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({ ...errors, fullName: "" });
                if (serverError) setServerError(null);
              }}
              leftIcon={<User className="w-4 h-4" />}
              errorMessage={errors.fullName}
              required
              disabled={isLoading}
            />

            <Input
              id="register-email"
              label="Email Address"
              type="email"
              placeholder="julian@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
                if (serverError) setServerError(null);
              }}
              leftIcon={<Mail className="w-4 h-4" />}
              errorMessage={errors.email}
              required
              disabled={isLoading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="register-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                  if (serverError) setServerError(null);
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                errorMessage={errors.password}
                helperText="Min. 8 characters"
                required
                disabled={isLoading}
              />

              <Input
                id="register-confirm-password"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                  if (serverError) setServerError(null);
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                errorMessage={errors.confirmPassword}
                required
                disabled={isLoading}
              />
            </div>

            {/* Topic Interests */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Topics of Interest (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTopics.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      disabled={isLoading}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 font-medium"
                          : "bg-[#F3F0E8] text-slate-700 border-[#E2DDD2] hover:bg-[#EAE4D7]"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="space-y-1 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: "" });
                  }}
                  disabled={isLoading}
                  className="mt-0.5 rounded border-[#D8D4CA] text-slate-900 focus:ring-slate-800"
                />
                <span>
                  I agree to BlogSpace&apos;s Editorial Standards, Privacy Policy, and Terms of Publication.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-rose-600 font-medium pl-6">
                  {errors.agreeTerms}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isLoading}
              rightIcon={
                isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )
              }
            >
              {isLoading ? "Creating Account..." : "Create Contributor Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#F0ECE2] text-center text-xs text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-slate-900 font-semibold hover:underline"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
