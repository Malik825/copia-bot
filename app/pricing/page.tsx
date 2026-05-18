"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Check, HelpCircle, ArrowRight, Zap, Shield, Sparkles, AlertCircle } from "lucide-react";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: "Sandbox",
      description: "Test the mirror engine risk-free.",
      priceMonthly: 0,
      priceYearly: 0,
      icon: Shield,
      features: [
        "Sandboxed mirror simulator",
        "Up to 2 connected test exchanges",
        "20x leverage safeguard cap",
        "Default slippage cushion rules",
        "Standard Telegram logs feed",
      ],
      cta: "Start Simulating",
      popular: false,
      badge: "Free Trial",
    },
    {
      name: "Starter Router",
      description: "Ideal for growing retail traders.",
      priceMonthly: 29,
      priceYearly: 22,
      icon: Zap,
      features: [
        "Live execution on 1 exchange key",
        "Full SMC order block filtering",
        "Up to 50x leverage cap adjustment",
        "15ms mirror routing latency",
        "Email & Telegram bot alert support",
      ],
      cta: "Connect Starter Link",
      popular: false,
      badge: "Retail",
    },
    {
      name: "Pro Router",
      description: "Maximum efficiency and speed.",
      priceMonthly: 79,
      priceYearly: 59,
      icon: Sparkles,
      features: [
        "Live execution on up to 5 exchanges",
        "Advanced custom AI Safeguard rules",
        "Unlimited leverage capacity",
        "12ms low-latency channels",
        "Priority mirror execution",
        "Dedicated account dashboard access",
      ],
      cta: "Go Professional",
      popular: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      description: "Institutional latency and capacity.",
      priceMonthly: 199,
      priceYearly: 149,
      icon: AlertCircle,
      features: [
        "Unlimited connected exchange keys",
        "VIP parallel websocket threads",
        "8ms ultra-low-latency dedicated node",
        "24/7 custom synthetic MT5 EA support",
        "Direct institutional liquidity access",
        "SLA mirror execution guarantees",
      ],
      cta: "Request Node Access",
      popular: false,
      badge: "Institutional",
    },
  ];

  const featuresMatrix = [
    { category: "Execution Speed", sandbox: "Standard", starter: "15ms Latency", pro: "12ms Priority", enterprise: "8ms Dedicated Node" },
    { category: "Simultaneous Keys", sandbox: "2 Sandbox Keys", starter: "1 Live Key", pro: "5 Live Keys", enterprise: "Unlimited Keys" },
    { category: "SMC Filtering", sandbox: "Default Rules", starter: "Full SMC Filtering", pro: "Advanced block filters", enterprise: "Custom Liquidity blocks" },
    { category: "Leverage Safeguard", sandbox: "Capped at 20x", starter: "Capped at 50x", pro: "Fully Customizable", enterprise: "Fully Customizable" },
    { category: "Dedicated EA Support", sandbox: "✓ None", starter: "✓ None", pro: "Standard Setup", enterprise: "24/7 Personal SLA" },
  ];

  const faqs = [
    {
      q: "How does the non-custodial copy router work?",
      a: "Our system mirrors signals in real-time through secure API connections. By creating API keys with withdrawal privileges disabled on your exchange settings, you make sure that our engine can only execute orders and can never access or withdraw your actual capital.",
    },
    {
      q: "What is the difference between monthly and annual plans?",
      a: "Our annual billing option provides a 25% discount across all paid subscription tiers, billed in a single recurring yearly payment.",
    },
    {
      q: "Can I connect multiple MT5 accounts simultaneously?",
      a: "Yes! With our Pro Router plan you can connect up to 5 accounts (both Forex MT5 and Deriv Synthetic indices), while the Enterprise plan supports unlimited simultaneous connections.",
    },
    {
      q: "What safeguards are active on the Sandbox trial?",
      a: "The Sandbox tier allows you to test the engine with zero capital risk using our paper-trading simulation. It caps leverage at 20x and includes default exposure safeguards to protect test account balances.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans">
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="relative px-6 md:px-12 pt-40 pb-12 overflow-hidden max-w-6xl mx-auto w-full text-center">
        {/* diagonal grid lines background */}
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
            <span className="font-mono text-[10px] tracking-[3px] uppercase text-primary">Pricing Structure</span>
            <span className="block w-5 h-px bg-primary" />
          </div>
          
          <h1 className="font-heading text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-[2px] text-foreground max-w-[900px] mx-auto">
            RELIABLE ROUTING.
            <br />
            TRANSPARENT <span className="text-primary">TIERS</span>.
          </h1>
          
          <p className="text-base font-light text-muted-foreground max-w-xl mx-auto leading-[1.8]">
            Choose the routing bandwidth that matches your trading size. All accounts include our institutional AI Safeguard shield automatically.
          </p>

          {/* Sliding Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <span className={`font-mono text-xs uppercase tracking-wider transition-colors ${billingCycle === "monthly" ? "text-foreground font-bold" : "text-muted-foreground"}`}>
              Monthly
            </span>

            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-border transition-colors duration-200 ease-in-out outline-none"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary shadow transition duration-200 ease-in-out ${
                  billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>

            <span className={`font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-foreground font-bold" : "text-muted-foreground"}`}>
              Yearly <span className="text-[9px] bg-green/10 text-green px-1.5 py-0.5 rounded-lg font-bold border border-green/20">SAVE 25%</span>
            </span>
          </div>
        </div>
      </section>

      {/* ── CARDS TIER GRID ── */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, idx) => {
            const IconComponent = plan.icon;
            const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
            
            return (
              <div 
                key={idx}
                className={`border bg-card p-8 rounded-xl relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm ${
                  plan.popular 
                    ? "border-primary shadow-[0_8px_30px_rgba(201,168,76,0.08)]" 
                    : "border-border hover:border-primary/45"
                }`}
              >
                {/* Popular label badge */}
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-mono text-[9px] tracking-[2px] font-bold px-3 py-1 rounded-full uppercase">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 border border-border bg-background rounded-lg flex items-center justify-center text-primary">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    {!plan.popular && (
                      <span className="font-mono text-[8px] tracking-wider text-muted-foreground border border-border px-2 py-0.5 rounded-lg uppercase">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading text-2xl font-bold text-foreground mt-5 tracking-wide">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-heading text-4xl font-bold text-foreground">
                      ${price}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-3.5">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="font-mono text-[10px] text-foreground/80 flex items-start gap-2.5 leading-relaxed">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={`w-full mt-8 font-mono text-[10px] tracking-[2px] uppercase py-3 rounded-lg font-bold transition-all cursor-pointer outline-none ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-gold-light shadow-md"
                      : "border border-border hover:border-primary hover:text-primary bg-background"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── DETAILED COMPARISON MATRIX ── */}
      <section className="py-16 px-6 md:px-12 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl tracking-[1px] text-foreground font-bold uppercase">
            Feature Comparison
          </h2>
          <p className="text-xs text-muted-foreground mt-2">
            Detailed parameter overview across all copy routing plans.
          </p>
        </div>

        <div className="overflow-x-auto border border-border rounded-xl bg-card shadow-sm">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border bg-background/50 text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Capability</th>
                <th className="p-4">Sandbox</th>
                <th className="p-4">Starter</th>
                <th className="p-4 text-primary font-bold">Pro Router</th>
                <th className="p-4">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {featuresMatrix.map((feat, fIdx) => (
                <tr key={fIdx} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-bold text-foreground">{feat.category}</td>
                  <td className="p-4 text-muted-foreground">{feat.sandbox}</td>
                  <td className="p-4 text-foreground/85">{feat.starter}</td>
                  <td className="p-4 text-primary font-bold">{feat.pro}</td>
                  <td className="p-4 text-foreground/85">{feat.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ BLOCK ── */}
      <section className="py-16 px-6 md:px-12 max-w-4xl mx-auto w-full border-t border-border">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl tracking-[1px] text-foreground font-bold uppercase">
            Pricing FAQs
          </h2>
          <p className="text-xs text-muted-foreground mt-2">
            Answers to common licensing and billing inquiries.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, fIdx) => {
            const isOpen = openFaq === fIdx;
            return (
              <div 
                key={fIdx}
                className="border border-border bg-card rounded-lg overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : fIdx)}
                  className="w-full p-5 flex items-center justify-between text-left font-mono text-xs text-foreground font-bold hover:text-primary transition-all outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <HelpCircle className={`w-4 h-4 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[200px] border-t border-border/40 p-5 bg-background/25" : "max-h-0"
                  }`}
                >
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
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
