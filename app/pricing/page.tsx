"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { Check, HelpCircle, ArrowRight, Zap, Shield, Sparkles, AlertCircle, Copy, ExternalLink, Coins, QrCode, Wallet, DollarSign, CheckCircle2, Loader2, X } from "lucide-react";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "crypto">("momo");
  const [cryptoCurrency, setCryptoCurrency] = useState<"usdt" | "usdc" | "btc">("usdt");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [cryptoTxId, setCryptoTxId] = useState("");
  const [isSubmittingMomo, setIsSubmittingMomo] = useState(false);
  const [isSubmittingCrypto, setIsSubmittingCrypto] = useState(false);
  const [momoSuccess, setMomoSuccess] = useState(false);
  const [cryptoSuccess, setCryptoSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const plans = [
    {
      name: "Yearly Access Pass",
      description: "Complete access to Elvis's Exness copy trading routing strategy.",
      priceMonthly: 300,
      priceYearly: 300,
      icon: Sparkles,
      features: [
        "Full connection to Elvis's master strategy",
        "Non-custodial API-based routing execution",
        "SMC order block liquidity safeguards",
        "Real-time Telegram signal log tracking",
        "Dedicated onboarding support guide",
      ],
      cta: "Activate Yearly Pass",
      popular: true,
      badge: "50% OFF ACTIVE",
    }
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
      q: "What is included in the Yearly Access Pass?",
      a: "The Yearly Access Pass grants you 12 full months of access to all automated trades executed on Elvis's strategy, along with step-by-step connection guides.",
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

  const handleCryptoCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!selectedPlan || !cryptoTxId) return;
    setIsSubmittingCrypto(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setErrorMessage("Please sign in to proceed with the payment.");
        setTimeout(() => window.location.href = "/signin", 2000);
        return;
      }

      const amount = billingCycle === "monthly" ? selectedPlan.priceMonthly : selectedPlan.priceYearly;
      const { error } = await supabase.from("invoices").insert({
        user_id: user.id,
        plan_name: selectedPlan.name,
        billing_cycle: billingCycle,
        amount: amount,
        status: "pending",
        provider_id: "CRYPTO_TX:" + cryptoTxId,
      });

      if (error) {
        console.error(error);
        setErrorMessage("Failed to submit verification. Please try again.");
      } else {
        setCryptoSuccess(true);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setIsSubmittingCrypto(false);
    }
  };

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
            Get absolute access to the Exness copying framework with our yearly plans.
          </p>

          {/* Sliding Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <span className={`font-mono text-xs uppercase tracking-wider transition-colors text-foreground font-bold`}>
              Yearly Pass (50% Off Applied)
            </span>
          </div>
        </div>
      </section>

      {/* ── CARDS TIER GRID ── */}
      <section className="py-12 px-6 md:px-12 max-w-xl mx-auto w-full">
        {plans.map((plan, idx) => {
          const IconComponent = plan.icon;
          const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
          
          return (
            <div 
              key={idx}
              className="border border-primary bg-card p-10 rounded-2xl relative flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] shadow-[0_12px_40px_rgba(201,168,76,0.08)] bg-gradient-to-b from-card to-background/50"
            >
              {/* Popular label badge */}
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-mono text-[10px] tracking-[2.5px] font-bold px-4 py-1.5 rounded-full uppercase">
                {plan.badge}
              </span>

              <div>
                <div className="flex items-center justify-between border-b border-border/40 pb-6">
                  <div>
                    <h3 className="font-heading text-3xl font-bold text-foreground tracking-wide">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">
                      {plan.description}
                    </p>
                  </div>
                  <div className="w-12 h-12 border border-primary/30 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <IconComponent className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div className="mt-8 flex items-baseline gap-2 justify-center py-4 bg-muted/10 rounded-xl border border-border/30">
                  <span className="font-mono text-lg text-muted-foreground line-through opacity-50">$600</span>
                  <span className="font-heading text-5xl font-bold text-foreground">
                    ${price}
                  </span>
                  <span className="font-mono text-sm text-primary font-bold">
                    /year
                  </span>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="font-mono text-xs text-foreground/80 flex items-start gap-3 leading-relaxed">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan(plan);
                  setPaymentMethod("momo");
                  setMomoSuccess(false);
                  setSenderNumber("");
                  setTransactionId("");
                  setErrorMessage(null);
                }}
                className="w-full mt-10 font-mono text-xs tracking-[2px] uppercase py-4 rounded-xl font-bold transition-all cursor-pointer outline-none bg-primary text-primary-foreground hover:bg-gold-light shadow-md border-0"
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
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
          RAEDAX
        </div>
        <div className="font-mono text-[10px] tracking-[1px] text-muted-foreground">
          © 2026 Raedax · Trading involves risk · Not financial advice
        </div>
      </footer>

      {/* ── CHECKOUT / PAYMENT MODAL ── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <span className="font-mono text-[9px] tracking-[2px] text-primary uppercase font-bold border border-primary/30 px-2 py-0.5 rounded bg-primary/5">
                  Secure Checkout
                </span>
                <h3 className="font-heading text-xl font-bold text-foreground mt-2">
                  Upgrade to {selectedPlan.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedPlan(null)}
                className="p-1.5 border border-border/80 bg-background hover:text-primary transition-all rounded-md cursor-pointer text-muted-foreground outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mx-6 mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2 font-mono text-[11px] animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{errorMessage}</p>
                <button onClick={() => setErrorMessage(null)} className="ml-auto opacity-70 hover:opacity-100 cursor-pointer outline-none">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Order Summary Panel */}
              <div className="p-4 rounded-lg bg-background border border-border/80 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Selected Plan</p>
                  <p className="font-heading text-base font-bold text-foreground mt-0.5">{selectedPlan.name} Tier</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Amount Due</p>
                  <p className="font-heading text-xl font-bold text-primary mt-0.5">
                    ${billingCycle === "monthly" ? selectedPlan.priceMonthly : selectedPlan.priceYearly}
                    <span className="font-mono text-xs text-muted-foreground font-light">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-background border border-border rounded-lg">
                <button
                  onClick={() => setPaymentMethod("momo")}
                  className={`py-2.5 font-mono text-[11px] uppercase tracking-wider font-bold rounded-md transition-all cursor-pointer outline-none flex items-center justify-center gap-2 ${
                    paymentMethod === "momo"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Mobile Money (MoMo)
                </button>
                <button
                  onClick={() => setPaymentMethod("crypto")}
                  className={`py-2.5 font-mono text-[11px] uppercase tracking-wider font-bold rounded-md transition-all cursor-pointer outline-none flex items-center justify-center gap-2 ${
                    paymentMethod === "crypto"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" /> Crypto Payment
                </button>
              </div>

              {/* Tab Contents */}
              {paymentMethod === "momo" ? (
                /* ── MOBILE MONEY TAB ── */
                <div className="space-y-5">
                  {momoSuccess ? (
                    <div className="p-6 rounded-lg bg-green/5 border border-green/20 text-center space-y-4 py-8 animate-in zoom-in-95 duration-200">
                      <div className="w-12 h-12 bg-green/10 border border-green/25 rounded-full flex items-center justify-center text-green mx-auto">
                        <CheckCircle2 className="w-6 h-6 animate-bounce" />
                      </div>
                      <h4 className="font-heading text-lg font-bold text-foreground uppercase tracking-wide">
                        Verification Request Submitted
                      </h4>
                      <p className="font-mono text-[11px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Our compliance system has logged your transaction (Ref: <span className="text-primary font-bold">{transactionId}</span>) for immediate ledger check. Your routing node access will be automatically unlocked within 10-15 minutes once confirmed.
                      </p>
                      <button
                        onClick={() => setSelectedPlan(null)}
                        className="font-mono text-[10px] tracking-[1.5px] uppercase border border-border hover:border-primary hover:text-primary px-6 py-2.5 rounded-lg bg-background font-bold transition-all cursor-pointer mt-4 outline-none"
                      >
                        Return to Pricing
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-border/40">
                          <span className="uppercase">Merchant Account Details</span>
                          <span className="text-primary">MTN MoMo / Multi-Network</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-1">
                          <span className="text-muted-foreground">Merchant Name:</span>
                          <span className="text-foreground font-bold font-sans">RAEDAX SYSTEMS LTD</span>
                        </div>

                        {/* Number Display with Copy */}
                        <div className="flex items-center justify-between py-1">
                          <span className="text-muted-foreground">Mobile Money Number:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-bold font-mono tracking-wider">0535427636</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText("0535427636");
                                setCopiedField("number");
                                setTimeout(() => setCopiedField(null), 2000);
                              }}
                              type="button"
                              className="p-1 border border-border/80 bg-background hover:text-primary transition-all rounded hover:scale-105 cursor-pointer text-muted-foreground"
                              title="Copy Number"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedField === "number" && (
                              <span className="text-[9px] text-green font-bold uppercase animate-fade-in">Copied!</span>
                            )}
                          </div>
                        </div>

                        {/* Dynamic Reference with Copy */}
                        <div className="flex items-center justify-between py-1">
                          <span className="text-muted-foreground">Payment Reference:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-bold font-mono font-bold">TF-{selectedPlan.name.toUpperCase().replace(/\s+/g, "")}-TEST-1GHS</span>
                            <button
                              onClick={() => {
                                const refStr = `TF-${selectedPlan.name.toUpperCase().replace(/\s+/g, "")}-TEST-1GHS`;
                                navigator.clipboard.writeText(refStr);
                                setCopiedField("ref");
                                setTimeout(() => setCopiedField(null), 2000);
                              }}
                              type="button"
                              className="p-1 border border-border/80 bg-background hover:text-primary transition-all rounded hover:scale-105 cursor-pointer text-muted-foreground"
                              title="Copy Reference"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedField === "ref" && (
                              <span className="text-[9px] text-green font-bold uppercase animate-fade-in">Copied!</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-2">
                        <h4 className="font-heading text-xs font-bold text-foreground uppercase tracking-wider">How to Complete Your MoMo Payment:</h4>
                        <ol className="font-mono text-[10px] text-muted-foreground space-y-1.5 list-decimal pl-4 leading-relaxed">
                          <li>Send exactly <strong className="text-foreground">GH₵ 1.00 (1 Cedi)</strong> to the MoMo number above (<strong className="text-foreground">0535427636</strong>).</li>
                          <li>Ensure you enter the **Payment Reference** in the payment reason/reference box.</li>
                          <li>Once the money transfer is complete, submit your details below to activate your account.</li>
                        </ol>
                      </div>

                      {/* Verification Form */}
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setErrorMessage(null);
                          if (!senderNumber || !transactionId) return;
                          setIsSubmittingMomo(true);
                          
                          try {
                            const supabase = createClient();
                            const { data: { user } } = await supabase.auth.getUser();
                            
                            if (!user) {
                              setErrorMessage("Please sign in to proceed with the payment.");
                              setTimeout(() => window.location.href = "/signin", 2000);
                              return;
                            }

                            const amount = billingCycle === "monthly" ? selectedPlan.priceMonthly : selectedPlan.priceYearly;
                            const { error } = await supabase.from("invoices").insert({
                              user_id: user.id,
                              plan_name: selectedPlan.name,
                              billing_cycle: billingCycle,
                              amount: amount,
                              status: "pending",
                              provider_id: "MOMO_TX:" + transactionId + "_NUM:" + senderNumber,
                            });

                            if (error) {
                              console.error(error);
                              setErrorMessage("Failed to submit verification. Please try again.");
                            } else {
                              setMomoSuccess(true);
                            }
                          } catch (error) {
                            console.error(error);
                            setErrorMessage("An unexpected error occurred.");
                          } finally {
                            setIsSubmittingMomo(false);
                          }
                        }}
                        className="space-y-4 pt-2 border-t border-border/40"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">Your MoMo Number</label>
                            <input
                              type="text"
                              required
                              value={senderNumber}
                              onChange={(e) => setSenderNumber(e.target.value)}
                              placeholder="e.g. +233 24 000 0000"
                              className="w-full bg-background border border-border/85 rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors text-foreground"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">Transaction ID / TxID</label>
                            <input
                              type="text"
                              required
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              placeholder="e.g. 58392019482"
                              className="w-full bg-background border border-border/85 rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors text-foreground"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingMomo || !senderNumber || !transactionId}
                          className="w-full font-mono text-[10px] tracking-[2px] uppercase py-3 rounded-lg font-bold transition-all bg-primary text-primary-foreground hover:bg-gold-light shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none border-0"
                        >
                          {isSubmittingMomo ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying Ledger...
                            </>
                          ) : (
                            "Submit for Activation"
                          )}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              ) : (
                /* ── CRYPTO PAYMENT TAB (NOWPAYMENTS) ── */
                <div className="space-y-6 animate-in fade-in duration-200">
                  {cryptoSuccess ? (
                    <div className="p-6 rounded-lg bg-green/5 border border-green/20 text-center space-y-4 py-8 animate-in zoom-in-95 duration-200">
                      <div className="w-12 h-12 bg-green/10 border border-green/25 rounded-full flex items-center justify-center text-green mx-auto">
                        <CheckCircle2 className="w-6 h-6 animate-bounce" />
                      </div>
                      <h4 className="font-heading text-lg font-bold text-foreground uppercase tracking-wide">
                        Crypto Verification Submitted
                      </h4>
                      <p className="font-mono text-[11px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Our system has logged your transaction (TxID: <span className="text-primary font-bold">{cryptoTxId}</span>) for on-chain verification. Your routing node access will be automatically unlocked once confirmed.
                      </p>
                      <button
                        onClick={() => setSelectedPlan(null)}
                        className="font-mono text-[10px] tracking-[1.5px] uppercase border border-border hover:border-primary hover:text-primary px-6 py-2.5 rounded-lg bg-background font-bold transition-all cursor-pointer mt-4 outline-none"
                      >
                        Return to Pricing
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 rounded-lg bg-background border border-border flex flex-col space-y-4">
                      <div className="flex flex-col items-center justify-center text-center mb-2">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 mb-4">
                          <Wallet className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="font-heading text-lg font-bold text-foreground">
                          Pay securely with USDT (TRC20)
                        </h4>
                        <p className="font-mono text-[11px] text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                          Please send the exact USD amount to the wallet address below. Once sent, provide the Transaction Hash (TxID) to verify your payment.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-border/40">
                          <span className="uppercase">Network</span>
                          <span className="text-primary font-bold">TRON (TRC20)</span>
                        </div>
                        <div className="flex flex-col gap-2 py-1">
                          <span className="text-muted-foreground">USDT Deposit Address:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-bold font-mono tracking-wider break-all text-[10px]">Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText("Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
                                setCopiedField("crypto_addr");
                                setTimeout(() => setCopiedField(null), 2000);
                              }}
                              type="button"
                              className="p-1 border border-border/80 bg-background hover:text-primary transition-all rounded hover:scale-105 cursor-pointer text-muted-foreground shrink-0"
                              title="Copy Address"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedField === "crypto_addr" && (
                              <span className="text-[9px] text-green font-bold uppercase animate-fade-in shrink-0">Copied!</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleCryptoCheckout} className="space-y-4 pt-4 border-t border-border/40">
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">Transaction Hash (TxID)</label>
                          <input
                            type="text"
                            required
                            value={cryptoTxId}
                            onChange={(e) => setCryptoTxId(e.target.value)}
                            placeholder="e.g. 8a9b23..."
                            className="w-full bg-background border border-border/85 rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors text-foreground"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmittingCrypto || !cryptoTxId}
                          className="w-full font-mono text-[10px] tracking-[2px] uppercase py-3.5 rounded-lg font-bold transition-all bg-primary text-primary-foreground hover:bg-gold-light shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none border-0 mt-4"
                        >
                          {isSubmittingCrypto ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Verifying On-Chain...
                            </>
                          ) : (
                            <>
                              <Coins className="w-4 h-4" /> Submit Payment Hash
                            </>
                          )}
                        </button>
                      </form>
                      
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-2 w-full justify-center opacity-80">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green" /> Automated Check</span>
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-primary" /> Encrypted</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between text-right">
              <span className="font-mono text-[9px] text-muted-foreground uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" /> SSL 256-Bit Encrypted Routing
              </span>
              <button
                onClick={() => setSelectedPlan(null)}
                className="font-mono text-[10px] tracking-[1px] uppercase bg-background border border-border hover:border-foreground text-foreground px-4 py-2 rounded font-bold transition-all cursor-pointer outline-none"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
