import React from "react";
import Link from "next/link";
import { Feather, Heart } from "lucide-react";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-[#F3F0E6] border-t border-[#E5E1D7] mt-20 text-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <Feather className="w-4 h-4 text-amber-300" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-slate-900">
                BlogSpace
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              An independent editorial publication dedicated to deep thoughts on software engineering, product design, thoughtful productivity, and modern culture.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              Designed with care for discerning readers and writers.
            </div>
          </div>

          {/* Editorial Columns */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-900">
              Explore Categories
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Design Systems
                </Link>
              </li>
              <li>
                <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Engineering & Performance
                </Link>
              </li>
              <li>
                <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Artificial Intelligence
                </Link>
              </li>
              <li>
                <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Productivity & Deep Work
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-900">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/create" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Write a Story
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Join the Community
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#E5E1D7] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} BlogSpace Publishing. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for great writers
            </span>
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
