"use client";

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

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative px-6 md:px-12 pt-40 pb-20 overflow-hidden max-w-6xl mx-auto w-full">
        {/* diagonal grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(201,168,76,0.02) 60px, rgba(201,168,76,0.02) 61px)",
          }}
        />

        <div className="relative z-10 text-center md:text-left">
          <SectionTag>Platform Philosophy</SectionTag>
          <h1 className="font-heading text-[clamp(48px,8vw,100px)] leading-[0.95] tracking-[2px] text-foreground max-w-[800px] mb-8">
            NON-CUSTODIAL.
            <br />
            ZERO-TRUST <span className="text-primary">ROUTING</span>.
          </h1>
          <p className="text-base font-light text-muted-foreground max-w-[620px] leading-[1.8] mt-6">
            We believe that trading systems should prioritize absolute security. With the 3IN1 Trader non-custodial copy router, your funds never leave your exchange accounts. We never touch your assets directly.
          </p>
        </div>
      </section>

      {/* ── TRUST SANDBOX THREE-COLUMN GRID ── */}
      <section className="py-16 px-6 md:px-12 max-w-6xl mx-auto w-full border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="font-mono text-[11px] tracking-[3px] text-primary uppercase mb-3">01 // Security Sandbox</div>
            <h3 className="font-heading text-2xl tracking-[1px] text-foreground mb-4">Withdrawals Locked</h3>
            <p className="text-xs text-muted-foreground leading-[1.75]">
              Our system connects exclusively through secure API channels. By turning off withdrawal privileges in your exchange settings, you make sure that our bot can only mirror copy signals and cannot access or transfer your capital.
            </p>
          </div>

          <div>
            <div className="font-mono text-[11px] tracking-[3px] text-primary uppercase mb-3">02 // Low-Latency Mirrors</div>
            <h3 className="font-heading text-2xl tracking-[1px] text-foreground mb-4">Milliseconds Performance</h3>
            <p className="text-xs text-muted-foreground leading-[1.75]">
              Replicated signals are pushed to connected accounts within 12 milliseconds of detection. Utilizing custom parallel websocket execution threads, we reduce entry slippage to less than 0.02% on average.
            </p>
          </div>

          <div>
            <div className="font-mono text-[11px] tracking-[3px] text-primary uppercase mb-3">03 // Public Audits</div>
            <h3 className="font-heading text-2xl tracking-[1px] text-foreground mb-4">No Fake Metrics</h3>
            <p className="text-xs text-muted-foreground leading-[1.75]">
              All displayed statistics, followers, total trade numbers, and monthly return curves are queried in real-time from our public exchange read APIs, preventing manually altered images or theoretical returns.
            </p>
          </div>
        </div>
      </section>

      {/* ── TECHNICAL INFRASTRUCTURE ── */}
      <section className="py-20 bg-card border-y border-border px-6 md:px-12 w-full">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <SectionTag>System Architecture</SectionTag>
            <h2 className="font-heading text-[clamp(32px,5vw,60px)] tracking-[2px] leading-[1.1] text-foreground mb-6">
              Three Markets.
              <br />
              One Connected Engine.
            </h2>
            <p className="text-xs text-muted-foreground leading-[1.8] max-w-lg mb-6">
              The 3IN1 Mirror Engine uses custom parallel connection threads to translate a single expert action into simultaneous copies on your personal accounts:
            </p>
            <ul className="flex flex-col gap-3 font-mono text-[11px] text-foreground/80">
              <li className="flex items-center gap-3">
                <span className="text-primary">▸</span>
                <strong>Crypto Futures Bot</strong>: Parallel websocket calls to Binance, Bybit, and OKX futures endpoints.
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary">▸</span>
                <strong>Forex EA (MT5)</strong>: MetaTrader 5 institutional SMC algorithms utilizing structure breakout nodes.
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary">▸</span>
                <strong>Deriv Synthetic Indices</strong>: Constant copy execution on Volatility, Crash, and Boom indices 24/7.
              </li>
            </ul>
          </div>

          <div className="md:col-span-5 border border-border p-8 bg-card relative rounded-xl">
            <span className="absolute -top-3 left-6 bg-card px-3 font-mono text-[9px] tracking-[2px] text-primary uppercase">
              Latency Benchmarks
            </span>
            <div className="space-y-4">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-muted-foreground">Binance USDM Gateway</span>
                <span className="text-green font-bold">12ms (avg)</span>
              </div>
              <div className="w-full bg-black/20 dark:bg-black/80 h-1 rounded-lg overflow-hidden">
                <div className="bg-primary h-full w-[90%]" />
              </div>

              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-muted-foreground">Bybit Unified API</span>
                <span className="text-green font-bold">15ms (avg)</span>
              </div>
              <div className="w-full bg-black/20 dark:bg-black/80 h-1 rounded-lg overflow-hidden">
                <div className="bg-primary h-full w-[85%]" />
              </div>

              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-muted-foreground">Deriv MT5 Gateway</span>
                <span className="text-green font-bold">22ms (avg)</span>
              </div>
              <div className="w-full bg-black/20 dark:bg-black/80 h-1 rounded-lg overflow-hidden">
                <div className="bg-primary h-full w-[70%]" />
              </div>

              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-muted-foreground">MetaTrader 5 Client</span>
                <span className="text-green font-bold">18ms (avg)</span>
              </div>
              <div className="w-full bg-black/20 dark:bg-black/80 h-1 rounded-lg overflow-hidden">
                <div className="bg-primary h-full w-[78%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-6 md:px-12 py-9 flex items-center justify-between flex-wrap gap-4 max-w-6xl mx-auto w-full">
        <div className="font-heading text-lg tracking-[3px] text-primary">
          3IN1 TRADER
        </div>
        <div className="font-mono text-[10px] tracking-[1px] text-muted-foreground">
          © 2025 3IN1 Trader · Trading involves risk · Not financial advice
        </div>
      </footer>
    </div>
  );
}
