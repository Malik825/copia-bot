"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiResponse, AuthSession } from "@/lib/types";
import Navbar from "@/components/Navbar"; // Keep temporary or remove once fully replaced
import { Shield, Key, Terminal, ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "SYS_STATUS // READY FOR SECURE ENTRY",
    "TLS_PORT   // GATEWAY_ACTIVE_PORT_443",
  ]);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTelemetryLogs([
      "SECURE_GATE // Initializing TLS handshake...",
      "CIPHER_CHK // Negotiating AES-256 GCM tunnels...",
    ]);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json: ApiResponse<AuthSession> = await res.json();

      if (json.success && json.data) {
        setTelemetryLogs((prev) => [
          ...prev,
          "DECRYPT    // Decrypted session telemetry ✓",
          "SYS_GRANT  // Permission node mapped! Redirecting...",
        ]);
        
        // Cache session token
        sessionStorage.setItem("token", json.data.token);
        sessionStorage.setItem("user", JSON.stringify(json.data.user));
        
        // Redirect to admin console
        setTimeout(() => {
          router.push("/admin");
        }, 1200);
      } else {
        setError(json.error || "Authentication failed.");
        setTelemetryLogs((prev) => [
          ...prev,
          "FAIL_VAL   // Security credentials rejected. Access blocked.",
        ]);
      }
    } catch (err) {
      setError("Unable to connect to signin service. Please try again.");
      setTelemetryLogs((prev) => [
        ...prev,
        "ERR_CONN   // Parallel routing link broken.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-6 pt-28 pb-12 relative overflow-hidden font-sans">
      {/* Floating Back Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 font-mono text-[10px] tracking-[2px] uppercase text-muted-foreground hover:text-primary transition-all flex items-center gap-1.5 border border-border/60 bg-card/50 backdrop-blur-sm px-3 py-1.5 rounded-md hover:border-primary/50"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      {/* diagonal grid lines background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(201,168,76,0.02) 60px, rgba(201,168,76,0.02) 61px)",
        }}
      />

      <div className="w-full max-w-md relative z-10 space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary mb-2 animate-pulse">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="font-heading text-3xl tracking-[3px] text-foreground font-bold uppercase">
            Tru<span className="text-primary">Funder</span> Node
          </h2>
          <p className="font-mono text-[9px] tracking-[2.5px] uppercase text-muted-foreground">
            AUTOMATED REPLICATION CONSOLE
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-card border border-border p-8 md:p-10 rounded-xl relative shadow-lg backdrop-blur-xl dark:bg-black/50 transition-all duration-300">
          <span className="absolute -top-3.5 left-6 bg-card px-3 text-primary text-[10px] font-mono uppercase tracking-[2.5px] border border-border rounded-md shadow-sm">
            [ SECURE SIGNIN ]
          </span>

          {error && (
            <div className="border border-red/30 bg-red/5 p-4 mb-6 text-red font-mono text-xs leading-relaxed rounded-lg">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email input */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">
                Account Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border border-border text-xs text-foreground font-sans px-4 py-3 outline-none focus:border-primary rounded-lg dark:bg-black/40 transition-all"
                required
              />
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-card border border-border text-xs text-foreground font-sans pl-4 pr-10 py-3 outline-none focus:border-primary rounded-lg dark:bg-black/40 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Simulated Secure Handshake Logs */}
            <div className="border border-border/80 bg-black/40 p-4 rounded-lg flex flex-col font-mono text-[9px] leading-normal space-y-1.5 text-muted-foreground select-none">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
                <span className="text-primary font-bold flex items-center gap-1.5 uppercase tracking-widest text-[8px]">
                  <Terminal className="w-3 h-3 animate-pulse" /> Handshake Status
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-primary animate-pulse" : "bg-green animate-pulse"}`} />
              </div>
              {telemetryLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span>&gt;</span>
                  <span className={log.includes("GRANT") || log.includes("✓") ? "text-green font-bold" : log.includes("FAIL") ? "text-red" : ""}>
                    {log}
                  </span>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-mono text-xs tracking-[2px] uppercase bg-primary text-primary-foreground py-4 hover:bg-gold-light hover:-translate-y-0.5 transition-all font-bold disabled:opacity-50 rounded-lg shadow-md cursor-pointer flex items-center justify-center gap-2 outline-none"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Decrypting Vault...
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" /> Authenticate Account <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Licensing Link */}
          <div className="mt-8 pt-6 border-t border-border/40 text-center">
            <p className="font-mono text-[10px] text-muted-foreground">
              Don't have an active license?{" "}
              <Link href="/signup" className="text-primary hover:underline font-bold">
                Activate Console License
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
