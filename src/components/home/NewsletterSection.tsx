"use client";

import React, { useState } from "react";
import { Feather, CheckCircle2 } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="bg-[#EDE9DE]/70 border border-[#DDD8CB] rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto my-12 space-y-5">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center shadow-xs">
        <Feather className="w-6 h-6 text-amber-300" />
      </div>
      <div className="space-y-2 max-w-lg mx-auto">
        <h3 className="text-2xl font-serif font-bold text-slate-900">
          Read BlogSpace in your inbox
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Every Sunday, we deliver three long-form essays, two design teardowns, and one architectural case study. No promotional noise.
        </p>
      </div>

      {submitted ? (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/70 text-emerald-800 rounded-full text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          Thank you! You have been added to the weekly editorial dispatch list.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="w-full sm:w-auto flex-1 px-4 py-2.5 text-sm rounded-lg border border-[#D1CDC2] bg-white text-slate-900 focus:outline-none focus:border-slate-900"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            Subscribe
          </button>
        </form>
      )}

      <p className="text-[11px] text-slate-500">
        Unsubscribe anytime with a single click. Respecting your inbox since 2026.
      </p>
    </section>
  );
}

export default NewsletterSection;
