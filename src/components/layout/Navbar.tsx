"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PenSquare,
  Menu,
  X,
  Feather,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import Button from "../ui/Button";

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  // Check authentication session on mount and route change
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.user) {
            setCurrentUser(data.user);
            return;
          }
        }
        if (isMounted) {
          setCurrentUser(null);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setCurrentUser(null);
      setMobileMenuOpen(false);
      window.location.href = "/login";
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { name: "Feed", href: "/" },
    { name: "Write", href: "/create" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#E8E5DE] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
              aria-label="BlogSpace Home"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:bg-slate-800 transition-colors">
                <Feather className="w-5 h-5 text-amber-300 transform group-hover:-rotate-12 transition-transform duration-300" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors leading-none">
                BlogSpace
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-[#E5E1D8]">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      active
                        ? "text-slate-900 bg-black/5 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-black/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              href="/create"
              variant="outline"
              size="sm"
              leftIcon={<PenSquare className="w-4 h-4" />}
            >
              Draft Story
            </Button>
            <div className="h-5 w-px bg-[#E5E1D8] mx-1" />

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EDE9DE] rounded-full text-xs font-semibold text-slate-800 border border-[#DDD8CB]">
                  {currentUser.name.toLowerCase().includes("deneshwaran") ? (
                    <img
                      src="/authors/deneshwaran.jpg"
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400 shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-amber-300 flex items-center justify-center text-[10px]">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  leftIcon={<LogOut className="w-4 h-4 text-slate-500" />}
                >
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </Button>
              </div>
            ) : (
              <>
                <Button
                  href="/login"
                  variant="ghost"
                  size="sm"
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  Sign In
                </Button>
                <Button
                  href="/register"
                  variant="primary"
                  size="sm"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/create"
              className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none"
              aria-label="Write a story"
            >
              <PenSquare className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-slate-900"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8E5DE] bg-[#FAF9F6] px-4 pt-3 pb-6 space-y-3 transition-all animate-in slide-in-from-top-2">
          {currentUser && (
            <div className="p-3 bg-[#EDE9DE]/70 rounded-xl border border-[#DDD8CB] flex items-center gap-2.5 text-xs text-slate-800">
              {currentUser.name.toLowerCase().includes("deneshwaran") ? (
                <img
                  src="/authors/deneshwaran.jpg"
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    active
                      ? "text-slate-900 bg-black/5 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-black/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E8E5DE] flex flex-col gap-2">
            {currentUser ? (
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={handleLogout}
                disabled={isLoggingOut}
                leftIcon={<LogOut className="w-4 h-4 text-slate-500" />}
              >
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            ) : (
              <>
                <Button
                  href="/login"
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => setMobileMenuOpen(false)}
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  Sign In
                </Button>
                <Button
                  href="/register"
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => setMobileMenuOpen(false)}
                  leftIcon={<UserPlus className="w-4 h-4" />}
                >
                  Create Account
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
