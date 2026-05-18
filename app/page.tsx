"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";

/* ─────────────────────────────────────────────
   SECTION TAG
   ───────────────────────────────────────────── */
function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="block w-5 h-px bg-primary" />
      <span className="font-mono text-[10px] tracking-[3px] uppercase text-primary">
        {children}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REVEAL ON SCROLL
   ───────────────────────────────────────────── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   TICKER
   ───────────────────────────────────────────── */
function Ticker() {
  const items = [
    { name: "Binance USDM", tag: "✓ Supported" },
    { name: "Bybit Futures", tag: "✓ Supported" },
    { name: "OKX", tag: "✓ Supported" },
    { name: "Bitget", tag: "✓ Supported" },
    { name: "KuCoin Futures", tag: "✓ Supported" },
    { name: "MetaTrader 5", tag: "✓ Forex" },
    { name: "Deriv MT5", tag: "✓ Synthetics" },
  ];

  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-border py-4 bg-card">
      <div
        className="flex gap-16 whitespace-nowrap"
        style={{ animation: "ticker 20s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 font-mono text-xs tracking-[2px] uppercase text-muted-foreground shrink-0"
          >
            <span className="w-[5px] h-[5px] rounded-full bg-primary inline-block" />
            {item.name} <span className="text-primary">{item.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────── */
export default function Home() {
  const stats = [
    { num: "70%", label: "Win Rate" },
    { num: "3", label: "Asset Classes" },
    { num: "5+", label: "Exchanges Supported" },
    { num: "24/7", label: "Automated Execution" },
  ];

  const products = [
    {
      num: "01",
      icon: "₿",
      label: "Module One",
      name: "Crypto Futures Bot",
      desc: "One signal fires across all your connected exchanges at once. No manual switching, no missed entries. Set your risk once — the bot handles the rest.",
      features: [
        "Binance, Bybit, OKX, Bitget, KuCoin",
        "Percentage-risk or fixed USDT sizing",
        "Automated SL/TP on every trade",
        "Multi-exchange simultaneous execution",
        "Fully managed via Telegram",
      ],
      cta: "Join Bot →",
    },
    {
      num: "02",
      icon: "📈",
      label: "Module Two",
      name: "Forex EA (MT5)",
      desc: "An Expert Advisor built on Smart Money Concepts. Identifies institutional order blocks, structure breaks, and high-probability setups — then executes without emotion.",
      features: [
        "Smart Money Concepts (ICT-based)",
        "Runs on MetaTrader 5",
        "Automated entry, SL, and partial TP",
        "Works on all major forex pairs",
        "Signal-based — plug in and run",
      ],
      cta: "Get the EA →",
    },
    {
      num: "03",
      icon: "⚡",
      label: "Module Three",
      name: "Deriv Synthetic Indices",
      desc: "Trade the markets that never sleep. Synthetic indices run 24/7 — no news events, no liquidity gaps. Our EA handles 31+ Deriv symbols with full automation.",
      features: [
        "31+ Deriv synthetic symbols",
        "Volatility, Crash, Boom indices",
        "Runs directly on Deriv MT5",
        "No market hours — always active",
        "Smart filling mode with auto-retry",
      ],
      cta: "Get the EA →",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Join & Connect",
      desc: "Access the Telegram bot and follow the setup wizard to connect your exchange API keys. Your keys are encrypted and stored securely — we never touch your funds directly.",
    },
    {
      num: "02",
      title: "Set Your Risk",
      desc: "Define your position sizing — either a fixed USDT amount or a percentage of your account. The system respects your limits on every single trade, automatically.",
    },
    {
      num: "03",
      title: "Receive Signals",
      desc: "Signals are sent directly through the bot. One command triggers simultaneous execution across all your connected exchanges with SL and TP placed instantly.",
    },
    {
      num: "04",
      title: "Track & Scale",
      desc: "Monitor open positions, review performance, and scale up as you grow. Add more exchanges anytime — all managed from Telegram without touching a single line of code.",
    },
  ];

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 pb-20 overflow-hidden"
      >
        {/* diagonal grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(201,168,76,0.02) 60px, rgba(201,168,76,0.02) 61px)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="flex items-center gap-3 mb-2 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 fill-mode-both">
              <span className="block w-8 h-px bg-primary" />
              <span className="font-mono text-[11px] tracking-[3px] uppercase text-primary">
                Automated Trading System
              </span>
              <span className="inline-flex items-center gap-[7px] font-mono text-[10px] tracking-[2px] uppercase text-green border border-green/30 px-3 py-1 ml-3 bg-green/5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"
                />
                Live Relay
              </span>
            </div>

            <h1 className="font-heading text-[clamp(48px,6vw,96px)] leading-[0.95] tracking-[2px] text-foreground animate-in fade-in slide-in-from-bottom-6 duration-800 delay-350 fill-mode-both uppercase">
              THREE
              <br />
              MARKETS.
              <br />
              <span className="text-primary">ONE</span> EDGE.
            </h1>

            <p className="text-base font-light text-muted-foreground max-w-[500px] leading-[1.8] animate-in fade-in slide-in-from-bottom-6 duration-800 delay-500 fill-mode-both">
              Forex, Crypto Futures, and Synthetic Indices — fully automated,
              signal-driven execution across multiple exchanges and platforms
              simultaneously.
            </p>

            <div className="flex gap-4 mt-8 flex-wrap animate-in fade-in slide-in-from-bottom-6 duration-800 delay-650 fill-mode-both">
              <a
                href="https://t.me/YOUR_BOT_LINK"
                className="font-mono text-xs tracking-[2px] uppercase bg-primary text-primary-foreground px-9 py-4 font-bold inline-flex items-center gap-2.5 hover:bg-gold-light hover:-translate-y-0.5 transition-all rounded-md shadow-lg"
              >
                → Join on Telegram
              </a>
              <a
                href="#products"
                className="font-mono text-xs tracking-[2px] uppercase bg-transparent text-foreground border border-border px-9 py-4 inline-flex items-center gap-2.5 hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all rounded-md"
              >
                Explore Products
              </a>
            </div>
          </div>

          {/* Right Column: Dynamic Interactive HUD Console */}
          <div className="lg:col-span-5 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400 fill-mode-both">
            <div className="border border-border bg-card/60 backdrop-blur-xl p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
              {/* Decorative glows */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                  <span className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase ml-2">
                    REPLICATION_ENGINE_V16
                  </span>
                </div>
                <span className="font-mono text-[8px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-md">
                  PING: 0.8ms
                </span>
              </div>

              {/* Price streams HUD */}
              <div className="space-y-4">
                <div className="border border-border/80 bg-background/50 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary text-xs font-mono font-bold">
                      BTC
                    </span>
                    <div className="text-left">
                      <div className="font-mono text-xs font-bold">BTCUSD.P</div>
                      <div className="font-sans text-[9px] text-muted-foreground">Binance Futures</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-green animate-pulse">$67,249.50</div>
                    <div className="font-sans text-[9px] text-green">+2.48%</div>
                  </div>
                </div>

                <div className="border border-border/80 bg-background/50 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary text-xs font-mono font-bold">
                      EUR
                    </span>
                    <div className="text-left">
                      <div className="font-mono text-xs font-bold">EURUSD</div>
                      <div className="font-sans text-[9px] text-muted-foreground">MetaTrader 5 Relay</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-primary">1.08492</div>
                    <div className="font-sans text-[9px] text-muted-foreground">Spread: 0.2 pips</div>
                  </div>
                </div>

                {/* Live execution logs stream */}
                <div className="border border-border bg-[#0c0c0c]/80 p-4 rounded-xl font-mono text-[9px] leading-relaxed text-muted-foreground shadow-inner">
                  <div className="text-primary font-bold uppercase tracking-wider text-[8px] pb-2 mb-2 border-b border-border/50 flex justify-between items-center">
                    <span>&gt;&gt; Live Router Feed</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <div className="flex gap-2">
                      <span className="text-primary">INFO</span>
                      <span>Signal node parsed from master Telegram.</span>
                    </div>
                    <div className="flex gap-2 text-green">
                      <span className="font-bold">EXEC</span>
                      <span>Dispatched to 5 active API sub-keys.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary">LATENCY</span>
                      <span>Order fill accomplished in 41ms.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── STAT STRIP ── */}
      <div className="flex flex-wrap border-y border-border animate-in fade-in slide-in-from-bottom-6 duration-800 delay-800 fill-mode-both">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`flex-1 min-w-[160px] px-6 md:px-10 py-7 ${
              i < stats.length - 1 ? "border-r border-border" : ""
            }`}
          >
            <div className="font-heading text-[44px] leading-none tracking-[1px] text-primary">
              {stat.num}
            </div>
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-muted-foreground mt-1.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── PRODUCTS ── */}
      <section id="products" className="py-20 md:py-28 px-6 md:px-12 bg-card">
        <SectionTag>What We Offer</SectionTag>
        <h2 className="font-heading text-[clamp(42px,6vw,80px)] tracking-[2px] leading-none text-foreground mb-4">
          The 3-in-1 System
        </h2>
        <p className="text-base text-muted-foreground max-w-[520px] leading-[1.75] mb-16">
          Three fully automated trading solutions. Each built for a specific
          market. All running simultaneously under one strategy framework.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
          {products.map((product, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="bg-background p-10 md:p-12 relative overflow-hidden group dark:hover:bg-[#181818] light:hover:bg-[#eef0f2] transition-colors">
                {/* gold top line on hover */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-400" />

                {/* faded number */}
                <div className="absolute top-6 right-8 font-heading text-[72px] leading-none tracking-[-2px] text-gold-dim group-hover:text-[rgba(201,168,76,0.2)] transition-colors">
                  {product.num}
                </div>

                <div className="w-11 h-11 border border-border flex items-center justify-center mb-7 text-lg rounded-lg">
                  {product.icon}
                </div>

                <div className="font-mono text-[10px] tracking-[3px] uppercase text-primary mb-3">
                  {product.label}
                </div>

                <div className="font-heading text-[32px] tracking-[1px] leading-[1.1] text-foreground mb-4">
                  {product.name}
                </div>

                <p className="text-sm text-muted-foreground leading-[1.75] mb-8">
                  {product.desc}
                </p>

                <ul className="flex flex-col gap-2.5 mb-9">
                  {product.features.map((feat, j) => (
                    <li
                      key={j}
                      className="font-mono text-[11px] text-foreground/70 flex items-center gap-2.5"
                    >
                      <span className="text-primary text-[10px]">▸</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <a
                  href="https://t.me/YOUR_BOT_LINK"
                  className="font-mono text-[11px] tracking-[2px] uppercase text-primary inline-flex items-center gap-2 border-b border-gold-dim pb-1 hover:gap-3.5 hover:border-primary transition-all"
                >
                  {product.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 md:px-12">
        <SectionTag>The Process</SectionTag>
        <h2 className="font-heading text-[clamp(42px,6vw,80px)] tracking-[2px] leading-none text-foreground mb-4">
          How It Works
        </h2>
        <p className="text-base text-muted-foreground max-w-[520px] leading-[1.75] mb-16">
          Getting set up takes minutes, not days. No coding knowledge required.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {steps.map((step, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="relative">
                {/* connecting line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-6 w-12 h-px bg-border" />
                )}
                <div className="font-heading text-[80px] leading-none text-gold-dim mb-3">
                  {step.num}
                </div>
                <div className="font-heading text-[22px] tracking-[1px] text-foreground mb-3">
                  {step.title}
                </div>
                <p className="text-sm text-muted-foreground leading-[1.75]">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── RISK DISCLOSURE ── */}
      <section
        id="risk"
        className="py-20 md:py-28 px-6 md:px-12 bg-card border-t border-border"
      >
        <SectionTag>Important</SectionTag>
        <h2 className="font-heading text-[clamp(42px,6vw,80px)] tracking-[2px] leading-none text-foreground mb-10">
          Risk Disclosure
        </h2>
        <Reveal>
          <div className="border border-border p-10 max-w-3xl bg-background relative rounded-xl">
            <span className="absolute -top-3.5 left-10 bg-background px-3 text-primary text-base">
              ⚠
            </span>
            <div className="font-heading text-xl tracking-[2px] text-foreground mb-3.5">
              Trading involves significant risk of loss
            </div>
            <p className="text-[13px] text-muted-foreground leading-[1.8]">
              Automated trading systems, including this one, do not guarantee
              profits. Past performance and stated win rates are not indicative
              of future results. Crypto futures, forex, and synthetic indices all
              carry substantial risk, including the potential loss of your entire
              invested capital. Leverage amplifies both gains and losses. Only
              trade with capital you can afford to lose. This system is a tool —
              not financial advice. You are solely responsible for your trading
              decisions. Please ensure you understand the risks fully before
              participating.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ── */}
      <section
        id="cta"
        className="py-28 md:py-36 px-6 md:px-12 text-center relative overflow-hidden"
      >
        {/* watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[28vw] text-[rgba(201,168,76,0.03)] pointer-events-none tracking-[8px] whitespace-nowrap select-none">
          3IN1
        </div>

        <div className="relative z-10">
          <SectionTag>
            <span className="mx-auto">Ready to Start</span>
          </SectionTag>
          <h2 className="font-heading text-[clamp(42px,6vw,80px)] tracking-[2px] leading-none text-foreground mb-4">
            ONE SYSTEM.
            <br />
            THREE MARKETS.
          </h2>
          <p className="text-base text-muted-foreground max-w-[520px] leading-[1.75] mx-auto mb-12">
            Join traders already running the 3-in-1 system. Get access through
            Telegram and be live within minutes.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://t.me/YOUR_BOT_LINK"
              className="font-mono text-xs tracking-[2px] uppercase bg-primary text-primary-foreground px-9 py-4 font-bold inline-flex items-center gap-2.5 hover:bg-gold-light hover:-translate-y-0.5 transition-all rounded-md"
            >
              → Get Access on Telegram
            </a>
            <a
              href="https://t.me/YOUR_CONTACT"
              className="font-mono text-xs tracking-[2px] uppercase bg-transparent text-foreground border border-border px-9 py-4 inline-flex items-center gap-2.5 hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all rounded-md"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-6 md:px-12 py-9 flex items-center justify-between flex-wrap gap-4">
        <div className="font-heading text-lg tracking-[3px] text-primary">
          3IN1 TRADER
        </div>
        <div className="font-mono text-[10px] tracking-[1px] text-muted-foreground">
          © 2025 3IN1 Trader · Trading involves risk · Not financial advice
        </div>
      </footer>
    </>
  );
}
