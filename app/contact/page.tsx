"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Send, Terminal, Shield, MessageSquare, Mail, AlertTriangle, Check } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    telegram: "",
    category: "Technical Router Support",
    broker: "Binance Futures",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [routingLogs, setRoutingLogs] = useState<string[]>([]);
  const [isRouting, setIsRouting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.telegram || !formData.message) return;

    setIsRouting(true);
    setRoutingLogs([
      "INITIALIZING GATEWAY // Handshaking secure bot helpdesk API...",
      "PACKET ENCRYPTING // AES-256 wrapping user credentials...",
    ]);

    setTimeout(() => {
      setRoutingLogs((prev) => [
        ...prev,
        "ROUTING PACKET // Mirroring telemetry request to Telegram dispatch...",
      ]);
    }, 1200);

    setTimeout(() => {
      setRoutingLogs((prev) => [
        ...prev,
        "ROUTING LOG // SECURE DISPATCH TO BOT HELPDESK SUCCESSFUL ✓",
        "✓ Ticket #ID-" + Math.floor(Math.random() * 900000 + 100000) + " generated.",
      ]);
      setIsRouting(false);
      setSubmitted(true);
      
      // Reset form fields
      setFormData({
        name: "",
        telegram: "",
        category: "Technical Router Support",
        broker: "Binance Futures",
        message: "",
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans">
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="relative px-6 md:px-12 pt-40 pb-10 overflow-hidden max-w-6xl mx-auto w-full text-center">
        {/* diagonal grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(201,168,76,0.02) 60px, rgba(201,168,76,0.02) 61px)",
          }}
        />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="block w-5 h-px bg-primary" />
            <span className="font-mono text-[10px] tracking-[3px] uppercase text-primary">Secure Communications</span>
            <span className="block w-5 h-px bg-primary" />
          </div>
          
          <h1 className="font-heading text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-[2px] text-foreground max-w-[900px] mx-auto">
            SECURE DISPATCH.
            <br />
            DIRECT <span className="text-primary">SUPPORT</span>.
          </h1>
          
          <p className="text-base font-light text-muted-foreground max-w-xl mx-auto leading-[1.8]">
            Encountering latency anomalies or have integration questions? Dispatch an encrypted request directly to our Telegram Bot Helpdesk.
          </p>
        </div>
      </section>

      {/* ── MAIN SECTION: FORM vs CHANNELS ── */}
      <section className="py-8 px-6 md:px-12 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column (col-span-7): Encrypted Contact Form */}
        <div className="lg:col-span-7 border border-border bg-card p-8 rounded-xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
            <span className="block w-4 h-px bg-primary animate-pulse" />
            <h3 className="font-heading text-lg tracking-[2px] uppercase text-foreground">Secure Router Dispatch</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Your Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jordan Smith"
                  className="w-full bg-card border border-border text-xs text-foreground font-sans px-4 py-3 outline-none focus:border-primary rounded-lg dark:bg-black/40 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Telegram Username (@)</label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  placeholder="@jordan_smith"
                  className="w-full bg-card border border-border text-xs text-foreground font-sans px-4 py-3 outline-none focus:border-primary rounded-lg dark:bg-black/40 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Inquiry Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-card border border-border text-xs text-foreground font-mono px-4 py-3.5 outline-none focus:border-primary rounded-lg dark:bg-black/40 transition-all"
                >
                  <option value="Technical Router Support">Technical Router Support</option>
                  <option value="API Integration setup">API Integration Setup</option>
                  <option value="Billing & Licenses">Billing & Licenses</option>
                  <option value="Partnership Tier request">Partnership Request</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Broker / Platform Type</label>
                <select
                  name="broker"
                  value={formData.broker}
                  onChange={handleChange}
                  className="w-full bg-card border border-border text-xs text-foreground font-mono px-4 py-3.5 outline-none focus:border-primary rounded-lg dark:bg-black/40 transition-all"
                >
                  <option value="Binance Futures">Binance USDM Futures</option>
                  <option value="Bybit Futures">Bybit Unified Futures</option>
                  <option value="OKX Futures">OKX Unified Futures</option>
                  <option value="Deriv MT5 Broker">Deriv MT5 Broker</option>
                  <option value="MetaTrader 5 Client">MetaTrader 5 Client</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Telemetry Issue Description</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Detail your request or router error logs..."
                rows={5}
                className="w-full bg-card border border-border text-xs text-foreground font-sans px-4 py-3.5 outline-none focus:border-primary rounded-lg dark:bg-black/40 transition-all resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isRouting}
              className="w-full font-mono text-[10px] tracking-[2.5px] py-4 uppercase font-bold transition-all bg-primary text-primary-foreground hover:bg-gold-light rounded-lg shadow-[0_4px_12px_rgba(201,168,76,0.15)] flex items-center justify-center gap-2 cursor-pointer outline-none"
            >
              {isRouting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Routing Packet...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Dispatch Secure Packet
                </>
              )}
            </button>
          </form>

          {/* Form success banner / logs simulator */}
          {(isRouting || submitted) && (
            <div className="border border-border bg-[#0c0c0c] p-5 rounded-lg flex flex-col font-mono text-[10px] leading-relaxed shadow-inner">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/80">
                <span className="text-primary font-bold flex items-center gap-1.5 uppercase tracking-widest">
                  <Terminal className="w-3.5 h-3.5" /> SECURE DISPATCH MATRIX
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${isRouting ? "bg-primary animate-pulse" : "bg-green animate-pulse"}`} />
              </div>
              <div className="space-y-2 text-muted-foreground">
                {routingLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <span>&gt;&gt;</span>
                    <span className={log.includes("SUCCESSFUL") || log.includes("✓") ? "text-green font-bold" : ""}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (col-span-5): Official Support Channels */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Direct channels */}
          <div className="border border-border bg-card p-6 rounded-xl shadow-sm space-y-6">
            <h4 className="font-heading text-lg tracking-[1.5px] uppercase text-foreground pb-3 border-b border-border">
              Support Pathways
            </h4>

            <div className="space-y-4">
              <Link
                href="/admin"
                className="flex items-start gap-4 p-4 border border-border bg-background/50 hover:border-primary rounded-lg transition-all"
              >
                <div className="w-9 h-9 border border-border rounded-lg flex items-center justify-center text-primary shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-foreground">Console Helpdesk</div>
                  <div className="font-sans text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                    Open a high-priority support ticket directly from your secure admin dashboard console.
                  </div>
                </div>
              </Link>

              <a
                href="mailto:support@trufunder.com"
                className="flex items-start gap-4 p-4 border border-border bg-background/50 hover:border-primary rounded-lg transition-all"
              >
                <div className="w-9 h-9 border border-border rounded-lg flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-foreground">Email Communications</div>
                  <div className="font-sans text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                    Send detailed diagnostics, custom EA scripts, or licensing inquiries to support@trufunder.com.
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Google Map High-Frequency Node */}
          <div className="border border-border bg-card p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h4 className="font-heading text-xs tracking-[1.5px] uppercase text-foreground font-bold">
                02 // Canary Wharf Router Node
              </h4>
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            </div>
            <p className="font-sans text-[10px] text-muted-foreground leading-relaxed">
              Our master latency replication relay is physically co-located in the high-frequency server hubs of Canary Wharf, London.
            </p>
            <div className="w-full h-[220px] rounded-lg overflow-hidden border border-border/80 relative bg-muted shadow-inner group">
              <iframe
                title="Canary Wharf Master Node Map"
                src="https://maps.google.com/maps?q=One%20Canada%20Square,%20Canary%20Wharf,%20London&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 filter dark:invert-[90%] dark:hue-rotate-[180deg] opacity-75 group-hover:opacity-100 transition-opacity duration-300"
                allowFullScreen={false}
                loading="lazy"
              />
            </div>
            <div className="flex justify-between items-center font-mono text-[9px] text-muted-foreground">
              <span>LATENCY: 1.2ms to LD4</span>
              <span>GPS: 51.5048° N, 0.0249° W</span>
            </div>
          </div>

          {/* Secure gateway alert */}
          <div className="border border-primary/20 bg-primary/5 p-6 rounded-xl shadow-sm flex items-start gap-4">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h5 className="font-mono text-xs font-bold text-primary uppercase tracking-wider">AES-256 Encrypted</h5>
              <p className="font-sans text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                All communications sent through this router dashboard are wrapped in secure TLS protocols and dispatched directly to sandboxed support instances. We will never ask for your private keys or trade secrets.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-6 md:px-12 py-9 flex items-center justify-between flex-wrap gap-4 max-w-6xl mx-auto w-full">
        <div className="font-heading text-lg tracking-[3px] text-primary">
          TRUFUNDER
        </div>
        <div className="font-mono text-[10px] tracking-[1px] text-muted-foreground">
          © 2026 TruFunder · Trading involves risk · Not financial advice
        </div>
      </footer>
    </div>
  );
}
