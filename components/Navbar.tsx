"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowRight, BarChart2, LogOut, Sun, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("👤");
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Scroll logic
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Closes mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Auth State Listener
  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      try {
        const { data } = await supabase.from("user_profiles").select("display_name, avatar_url").eq("user_id", userId).single();
        if (data) {
          setDisplayName(data.display_name ?? "User");
          let loadedAvatar = data.avatar_url ?? "👤";
          if (loadedAvatar === "local_avatar") {
            const cached = localStorage.getItem(`local_avatar_${userId}`);
            if (cached) loadedAvatar = cached;
          }
          setAvatarUrl(loadedAvatar);
        }
      } catch (err) {
        console.error("Error fetching navbar profile:", err);
      }
    };

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      setIsAdmin(user?.email === "raedax77@gmail.com");
      if (user) fetchProfile(user.id);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setIsAdmin(session?.user?.email === "raedax77@gmail.com");
      if (session?.user) fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.refresh();
    router.push("/");
  };

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
    ...(isLoggedIn ? [{ name: "Dashboard", href: isAdmin ? "/admin" : "/dashboard" }] : []),
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
              className="flex items-center gap-2.5 font-heading text-xl tracking-[1px] text-primary hover:text-gold-light transition-all"
            >
              <img src="/Raedax.jpeg" alt="Raedax Logo" className="h-6 w-6 rounded-md object-cover border border-primary/20" />
              <span className="font-bold tracking-tight">Raedax</span>
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
                <div className="relative group/dropdown py-1">
                  {/* User Profile Chip trigger */}
                  <button
                    className="flex items-center gap-2.5 border border-border/60 bg-card hover:border-primary/50 transition-all rounded-full pl-1 pr-4 py-1 group cursor-pointer outline-none focus:outline-none"
                  >
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-primary/10 border border-primary/30 flex items-center justify-center text-sm shrink-0 relative">
                      {avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("data:")) ? (
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>{avatarUrl || "👤"}</span>
                      )}
                      {/* Online indicator */}
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green border border-card" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-mono text-[10px] font-bold tracking-[1px] text-foreground group-hover:text-primary transition-colors leading-tight truncate max-w-[100px]">
                        {displayName || "Dashboard"}
                      </span>
                      <span className="font-mono text-[8px] tracking-wider text-muted-foreground uppercase leading-tight">
                        {isAdmin ? "Admin" : "Live"}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full pt-2 w-48 opacity-0 translate-y-2 pointer-events-none group-hover/dropdown:opacity-100 group-hover/dropdown:translate-y-0 group-hover/dropdown:pointer-events-auto transition-all duration-300 z-50">
                    <div className="bg-[#0b0b12] border border-border/80 rounded-lg p-2 shadow-xl flex flex-col gap-1">
                      <Link
                        href="/dashboard"
                        className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted-foreground hover:text-primary hover:bg-white/[0.03] px-3 py-2 rounded transition-all text-left"
                      >
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted-foreground hover:text-primary hover:bg-white/[0.03] px-3 py-2 rounded transition-all text-left border-t border-border/40"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/pricing"
                        className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted-foreground hover:text-primary hover:bg-white/[0.03] px-3 py-2 rounded transition-all text-left"
                      >
                        Pricing & Plans
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="font-mono text-[10px] tracking-[1.5px] uppercase text-left text-red-400 hover:text-red-300 hover:bg-red-500/[0.05] px-3 py-2 rounded transition-all cursor-pointer border-0 bg-transparent outline-none border-t border-border/40 w-full"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
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
        className={`fixed inset-0 z-40 bg-background/98 dark:bg-black/98 backdrop-blur-xl md:hidden flex flex-col justify-center px-8 transition-all duration-500 ${
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
              className="font-mono text-[12px] tracking-[2px] uppercase py-3.5 border border-border bg-card text-muted-foreground hover:text-primary flex items-center justify-center gap-2 rounded-md cursor-pointer outline-none"
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
                {/* Mobile Profile Chip */}
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="flex items-center gap-3 border border-border/60 bg-card hover:border-primary/50 transition-all rounded-xl px-4 py-3 group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border border-primary/30 flex items-center justify-center text-xl shrink-0 relative">
                    {avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("data:")) ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{avatarUrl || "👤"}</span>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green border-2 border-card" />
                  </div>
                  <div>
                    <div className="font-mono text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {displayName || "Dashboard"}
                    </div>
                    <div className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase">
                      {isAdmin ? "Admin Console" : "Live Dashboard"}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="font-mono text-[12px] tracking-[2px] uppercase text-center bg-red-500/10 border border-red-500/30 text-red-400 py-3.5 font-bold hover:bg-red-500/20 transition-all cursor-pointer rounded-md"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="font-mono text-[12px] tracking-[2px] uppercase text-center border border-border py-3.5 hover:border-primary transition-all text-foreground rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="font-mono text-[12px] tracking-[2px] uppercase text-center bg-primary text-primary-foreground py-3.5 font-bold hover:bg-gold-light transition-all rounded-md"
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
