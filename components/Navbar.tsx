"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowRight, BarChart2, LogOut, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState("dark");
  const pathname = usePathname();
  const router = useRouter();

  // Scroll logic
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Closes mobile menu on route change and checks auth status
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsLoggedIn(!!sessionStorage.getItem("token"));
  }, [pathname]);

  // Theme Sync logic on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    router.push("/");
  };

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
    ...(isLoggedIn ? [{ name: "Dashboard", href: "/admin" }] : []),
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/90 border-b border-border/80 backdrop-blur-xl py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
            : "bg-background/40 border-b border-border/30 backdrop-blur-md py-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-heading text-xl tracking-[1px] text-primary hover:text-gold-light transition-all"
            >
              <BarChart2 className="h-5 w-5 text-primary" />
              <span className="font-bold tracking-tight">TruFunder</span>
            </Link>
            
            {/* Live Security Badge */}
            <span className="hidden lg:inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[2px] text-green border border-green/30 px-2 py-0.5 bg-green/5 select-none uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              SECURE ROUTING // LIVE
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.name} className="relative group">
                    <Link
                      href={link.href}
                      className={`font-mono text-[11px] tracking-[2px] uppercase transition-colors duration-300 relative py-1 ${
                        isActive
                          ? "text-primary font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {link.name}
                      {/* Interactive slide underline */}
                      <span
                        className={`absolute bottom-0 left-0 right-0 h-px bg-primary transition-transform duration-300 origin-left ${
                          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <span className="w-px h-4 bg-border" />

            {/* Action CTA buttons */}
            <div className="flex items-center gap-4">
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 border border-border/80 bg-card hover:text-primary transition-all rounded-md cursor-pointer flex items-center justify-center text-muted-foreground outline-none focus:outline-none"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {isLoggedIn ? (
                <>
                  <button
                    onClick={handleLogout}
                    className="font-mono text-[11px] tracking-[2px] uppercase text-muted-foreground hover:text-red transition-colors py-1 flex items-center gap-1.5 cursor-pointer bg-transparent border-0 outline-none"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                  {pathname !== "/admin" && (
                    <Link
                      href="/admin"
                      className="font-mono text-[11px] tracking-[2px] uppercase bg-primary text-primary-foreground px-5 py-2.5 font-bold hover:bg-gold-light hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 shadow-[0_4px_12px_rgba(201,168,76,0.12)] rounded-md"
                    >
                      Console <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </>
              ) : (
                <>
                  {pathname !== "/signin" && (
                    <Link
                      href="/signin"
                      className="font-mono text-[11px] tracking-[2px] uppercase text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      Sign In
                    </Link>
                  )}
                  <Link
                    href="/signup"
                    className="font-mono text-[11px] tracking-[2px] uppercase bg-primary text-primary-foreground px-5 py-2.5 font-bold hover:bg-gold-light hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 shadow-[0_4px_12px_rgba(201,168,76,0.12)] rounded-md"
                  >
                    Get Started <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-foreground hover:text-primary transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-lg md:hidden flex flex-col justify-center px-8 transition-all duration-500 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-4"
        }`}
      >
        <div className="flex flex-col gap-8">
          <ul className="flex flex-col gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`font-heading text-4xl tracking-[2px] uppercase ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="w-full h-px bg-border" />

          <div className="flex flex-col gap-4">
            
            {/* Mobile Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="font-mono text-[12px] tracking-[2px] uppercase py-3 border border-border bg-card text-muted-foreground hover:text-primary flex items-center justify-center gap-2 rounded-md cursor-pointer outline-none"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" /> Dark Mode
                </>
              )}
            </button>

            {isLoggedIn ? (
              <>
                <Link
                  href="/admin"
                  className="font-mono text-[12px] tracking-[2px] uppercase text-center border border-border py-3 hover:border-primary transition-all text-foreground rounded-md"
                >
                  Enter Console
                </Link>
                <button
                  onClick={handleLogout}
                  className="font-mono text-[12px] tracking-[2px] uppercase text-center bg-red/10 border border-red/30 text-red py-3 font-bold hover:bg-red/20 transition-all cursor-pointer rounded-md"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="font-mono text-[12px] tracking-[2px] uppercase text-center border border-border py-3 hover:border-primary transition-all text-foreground rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="font-mono text-[12px] tracking-[2px] uppercase text-center bg-primary text-primary-foreground py-3 font-bold hover:bg-gold-light transition-all rounded-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Telegram Indicator */}
          <div className="flex items-center justify-center gap-2 font-mono text-[9px] tracking-[2px] text-green mt-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            TELEGRAM ROUTER // SECURE_CONNECTED
          </div>
        </div>
      </div>
    </>
  );
}
