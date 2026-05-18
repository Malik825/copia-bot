"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { verifyAndAdjustTradeSignal, RiskRules } from "@/lib/mirrorEngine";
import { TradePosition, VerifiedTrader } from "@/lib/types";

interface LogEntry {
  time: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
}

export default function Dashboard() {
  // Active copy trades in local state
  const [activeTrades, setActiveTrades] = useState<TradePosition[]>([
    {
      id: "pos-01",
      symbol: "BTC-USDT",
      market: "Crypto",
      side: "BUY",
      entryPrice: 65240,
      currentPrice: 66420,
      size: 1.25,
      leverage: 20,
      pnl: 73.75,
      slippage: 0.04,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: "OPEN",
    },
    {
      id: "pos-02",
      symbol: "EURUSD",
      market: "Forex",
      side: "BUY",
      entryPrice: 1.08200,
      currentPrice: 1.08450,
      size: 2.0,
      leverage: 50,
      pnl: 50.00,
      slippage: 0.08,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: "OPEN",
    },
  ]);

  // Verified Copy Providers from our API simulation
  const [traders, setTraders] = useState<VerifiedTrader[]>([]);

  // Safety & AI Risk Rule States
  const [maxExposurePercent, setMaxExposurePercent] = useState(25);
  const [maxLeverageCap, setMaxLeverageCap] = useState(20);
  const [slippageLimitPercent, setSlippageLimitPercent] = useState(0.15);
  const [maxPositionSizeUsdt, setMaxPositionSizeUsdt] = useState(1000);
  const [orderBlockFilterEnabled, setOrderBlockFilterEnabled] = useState(true);

  // Global Console Stats
  const [totalProfit, setTotalProfit] = useState(32.48);
  const [latency, setLatency] = useState(12);
  const [accountEquity, setAccountEquity] = useState(15000); // Simulated $15,000 balance

  // System states
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: "20:30:00", message: "SYSTEM ONLINE // AI Safeguard Shield initial scan completed successfully.", type: "info" },
    { time: "20:30:02", message: "MIRROR CONNECTED // Signals actively mirroring from Alpha_Strategist.", type: "success" },
  ]);

  const [showApiModal, setShowApiModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState("Binance");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const [apiKeys, setApiKeys] = useState([
    { name: "Main Binance", type: "Binance Futures", status: "Active" },
    { name: "Bybit Personal", type: "Bybit Futures", status: "Active" },
    { name: "MT5 Broker", type: "MetaTrader 5", status: "Active" },
  ]);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Fetch verified copy providers on mount
  useEffect(() => {
    fetch("/api/traders")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setTraders(json.data);
        }
      });
  }, []);

  // Keep logs scrolled down
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // SIMULATE ACTIVE WEBSOCKET COPIER STREAM RUNNING THROUGH THE AI ENGINE
  useEffect(() => {
    const interval = setInterval(() => {
      const times = new Date().toTimeString().split(" ")[0];
      
      // Randomly choose a signal source
      const symbols = ["BTC-USDT", "ETH-USDT", "EURUSD", "GBPUSD", "V75-INDEX"];
      const selectedSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const side = Math.random() > 0.5 ? ("BUY" as const) : ("SELL" as const);
      
      // Leverage ranges from standard 10x to extreme 100x
      const masterLeverage = Math.random() > 0.7 ? 100 : 25;
      
      // Size ranges from small to very high exposure
      const masterSizeUsdt = Math.floor(Math.random() * 1800) + 200;
      
      // Slippage simulated from safe 0.02% to heavy 0.35%
      const slippagePercent = parseFloat((Math.random() * 0.4).toFixed(3));

      const simulatedSignal = {
        symbol: selectedSymbol,
        side,
        masterPrice: selectedSymbol.includes("USD") ? 1.08500 : 66250,
        masterLeverage,
        masterSizeUsdt,
        slippagePercent,
      };

      // Assemble current active rules object
      const activeRules: RiskRules = {
        maxExposurePercent,
        maxLeverageCap,
        slippageLimitPercent,
        maxPositionSizeUsdt,
        orderBlockFilterEnabled,
      };

      // Process copy trade signal through the AI risk mitigation rules
      const validation = verifyAndAdjustTradeSignal(
        simulatedSignal,
        activeTrades,
        accountEquity,
        activeRules
      );

      if (validation.allowed) {
        // Successful mirroring
        const finalLeverage = validation.adjustedLeverage ?? masterLeverage;
        const finalSize = validation.adjustedSize ?? masterSizeUsdt;
        
        const newTrade: TradePosition = {
          id: "pos-" + Math.random().toString(36).substring(2, 7),
          symbol: selectedSymbol,
          market: selectedSymbol.includes("INDEX") ? "Deriv" : selectedSymbol.includes("USD") ? "Forex" : "Crypto",
          side,
          entryPrice: simulatedSignal.masterPrice,
          currentPrice: simulatedSignal.masterPrice * (side === "BUY" ? 1.002 : 0.998),
          size: finalSize,
          leverage: finalLeverage,
          pnl: parseFloat((finalSize * 0.02).toFixed(2)),
          slippage: slippagePercent,
          timestamp: new Date().toISOString(),
          status: "OPEN",
        };

        setActiveTrades((prev) => [...prev, newTrade]);
        
        // Log to terminal feed
        setLogs((prev) => [
          ...prev,
          {
            time: times,
            message: `SIGNAL DETECTED // Master trade ${side} ${selectedSymbol} received.`,
            type: "info",
          },
          {
            time: times,
            message: `AI VERIFIED // Mirror placed! ${validation.adjustedLeverage ? `[Leverage capped at ${finalLeverage}x]` : ""} ${validation.adjustedSize ? `[Size capped at $${finalSize}]` : ""} Executed in 12ms.`,
            type: "success",
          },
        ]);

        // Jitter overall profit and latency metrics
        setLatency(Math.max(8, Math.min(22, 12 + (Math.random() > 0.5 ? 1 : -1))));
        setTotalProfit((prev) => parseFloat((prev + 0.15).toFixed(2)));
      } else {
        // Guard Blocked Trade
        setLogs((prev) => [
          ...prev,
          {
            time: times,
            message: `SIGNAL DETECTED // Master trade ${side} ${selectedSymbol} received.`,
            type: "info",
          },
          {
            time: times,
            message: `🛡️ SHIELD ENGAGED // ${validation.reason}`,
            type: "warning",
          },
        ]);
      }
    }, 9000);

    return () => clearInterval(interval);
  }, [activeTrades, maxExposurePercent, maxLeverageCap, slippageLimitPercent, maxPositionSizeUsdt, orderBlockFilterEnabled, accountEquity]);

  // Settle individual trade exit
  const handleExitTrade = async (id: string) => {
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const json = await res.json();
      if (json.success) {
        // Filter closed trade from dashboard state
        const closedTrade = activeTrades.find((t) => t.id === id);
        setActiveTrades((prev) => prev.filter((t) => t.id !== id));
        
        const times = new Date().toTimeString().split(" ")[0];
        setLogs((prev) => [
          ...prev,
          {
            time: times,
            message: `MANUAL EXIT // Signal closed for ${closedTrade?.symbol}. Mirror settlement executed.`,
            type: "success",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Liquidation Emergency exit
  const handleEmergencyLiquidation = () => {
    const times = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [
      ...prev,
      { time: times, message: "⚠️ EMERGENCY HALT // Dispatching instant liquidations to brokers...", type: "error" },
      { time: times, message: `EMERGENCY COMPLETE // Settled ${activeTrades.length} open copies cleanly. Routing disabled.`, type: "success" },
    ]);
    setActiveTrades([]);
  };

  const handleAddApi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !apiSecret) return;

    setApiKeys((prev) => [
      ...prev,
      { name: `Account-${selectedExchange}`, type: selectedExchange, status: "Active" },
    ]);

    const times = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [
      ...prev,
      { time: times, message: `API VAULT // Secure AES-256 connection built for ${selectedExchange}. Sandbox online.`, type: "success" },
    ]);

    setApiKey("");
    setApiSecret("");
    setShowApiModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen relative pb-16">
      
      {/* ── TOP NAV HEADER ── */}
      <header className="border-b border-border bg-[#0a0a0a]/92 backdrop-blur-xl px-6 md:px-12 py-5 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-heading text-xl tracking-[3px] text-primary hover:opacity-85 transition-opacity">
            3IN1 TRADER CONSOLE
          </Link>
          <span className="hidden md:inline-block w-px h-5 bg-border" />
          <span className="hidden md:inline-flex items-center gap-2 font-mono text-[10px] tracking-[2px] text-green uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            TELEGRAM ROUTER // SECURE_ONLINE
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowApiModal(true)}
            className="font-mono text-[10px] tracking-[2px] uppercase border border-border bg-[#141414] text-[#f5f0e8] px-4 py-2 hover:border-primary hover:text-primary transition-all"
          >
            + Connect API
          </button>
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[2px] uppercase bg-[#1a1a1a] text-muted-foreground hover:text-foreground px-4 py-2 transition-all"
          >
            Log Out
          </Link>
        </div>
      </header>

      {/* ── MAIN VIEWPORT GRID ── */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE SIGNALS & AI RISK CONTROLS */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* SYSTEM STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
            <div className="bg-[#141414] p-6">
              <div className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase">ACCOUNT EQUITY</div>
              <div className="font-heading text-3xl text-primary mt-2">${accountEquity}</div>
              <div className="font-mono text-[8px] text-muted-foreground tracking-wider mt-1 uppercase">USDT Collateral</div>
            </div>

            <div className="bg-[#141414] p-6">
              <div className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase">LIVE PNL RATE</div>
              <div className="font-heading text-3xl text-green mt-2">+{totalProfit}%</div>
              <div className="font-mono text-[8px] text-green tracking-wider mt-1 uppercase">SMC Target Reached</div>
            </div>

            <div className="bg-[#141414] p-6">
              <div className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase">ACTIVE POSITIONS</div>
              <div className="font-heading text-3xl text-foreground mt-2">{activeTrades.length}</div>
              <div className="font-mono text-[8px] text-primary tracking-wider mt-1 uppercase">Copy Mirrored</div>
            </div>

            <div className="bg-[#141414] p-6">
              <div className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase">LATENCY ROUTING</div>
              <div className="font-heading text-3xl text-green mt-2">{latency}ms</div>
              <div className="font-mono text-[8px] text-green tracking-wider mt-1 uppercase">Ultra-Low slip</div>
            </div>
          </div>

          {/* ACTIVE TRADES LIST */}
          <div className="border border-border bg-[#141414] p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="block w-4 h-px bg-primary" />
                <h3 className="font-heading text-lg tracking-[2px] uppercase">Active Copied Positions</h3>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">Replicating Live feeds</span>
            </div>

            {activeTrades.length === 0 ? (
              <div className="py-12 text-center text-sm font-mono text-muted-foreground">
                No active copied positions. Live signal streams are actively scanned.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border pb-3">
                      <th className="pb-3 uppercase tracking-wider text-[10px]">Symbol</th>
                      <th className="pb-3 uppercase tracking-wider text-[10px]">Market</th>
                      <th className="pb-3 uppercase tracking-wider text-[10px]">Side</th>
                      <th className="pb-3 uppercase tracking-wider text-[10px]">Leverage</th>
                      <th className="pb-3 uppercase tracking-wider text-[10px]">Entry Price</th>
                      <th className="pb-3 uppercase tracking-wider text-[10px]">Current Price</th>
                      <th className="pb-3 uppercase tracking-wider text-[10px]">PnL (USDT)</th>
                      <th className="pb-3 uppercase tracking-wider text-[10px] text-right">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                        <td className="py-3.5 font-bold text-foreground">{trade.symbol}</td>
                        <td className="py-3.5 text-muted-foreground">{trade.market}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 text-[10px] border font-bold ${
                            trade.side === "BUY" ? "text-green border-green/30 bg-green/5" : "text-red border-red/30 bg-red/5"
                          }`}>
                            {trade.side}
                          </span>
                        </td>
                        <td className="py-3.5 text-foreground">{trade.leverage}x</td>
                        <td className="py-3.5 text-muted-foreground">${trade.entryPrice}</td>
                        <td className="py-3.5 text-foreground">${trade.currentPrice}</td>
                        <td className={`py-3.5 font-bold ${trade.pnl >= 0 ? "text-green" : "text-red"}`}>
                          +${trade.pnl.toFixed(2)}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleExitTrade(trade.id)}
                            className="font-mono text-[9px] tracking-wider uppercase border border-red/30 text-red px-3 py-1 hover:bg-red/10 transition-all"
                          >
                            Exit Copy
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AI RISK SETTINGS */}
          <div className="border border-border bg-[#141414] p-6 relative">
            <span className="absolute -top-3.5 left-6 bg-[#141414] px-3 text-primary text-xs font-mono uppercase tracking-[2px]">
              🛡️ AI RISK MITIGATION RULES
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-muted-foreground uppercase">1. Max Position Leverage Cap</span>
                    <span className="text-primary font-bold">{maxLeverageCap}x</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={maxLeverageCap}
                    onChange={(e) => setMaxLeverageCap(parseInt(e.target.value))}
                    className="w-full accent-primary bg-black h-1 rounded"
                  />
                  <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                    Auto-caps incoming master copy leverage. Prevents liquidations from aggressive traders.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-muted-foreground uppercase">2. Slippage Safeguard Cap</span>
                    <span className="text-primary font-bold">{(slippageLimitPercent * 100).toFixed(2)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.05"
                    value={slippageLimitPercent}
                    onChange={(e) => setSlippageLimitPercent(parseFloat(e.target.value))}
                    className="w-full accent-primary bg-black h-1 rounded"
                  />
                  <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                    Instantly blocks mirrors where slippage/spread deviation exceeds safe guidelines.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-muted-foreground uppercase">3. Max Absolute Position Sizing</span>
                    <span className="text-primary font-bold">${maxPositionSizeUsdt} USDT</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="2500"
                    step="100"
                    value={maxPositionSizeUsdt}
                    onChange={(e) => setMaxPositionSizeUsdt(parseInt(e.target.value))}
                    className="w-full accent-primary bg-black h-1 rounded"
                  />
                  <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                    Restricts total margin allocated per individual copied mirror asset.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-muted-foreground uppercase">4. Max Account Exposure Limit</span>
                    <span className="text-primary font-bold">{maxExposurePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={maxExposurePercent}
                    onChange={(e) => setMaxExposurePercent(parseInt(e.target.value))}
                    className="w-full accent-primary bg-black h-1 rounded"
                  />
                  <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                    Safety ceiling representing maximum aggregated open position equity.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold font-sans">SMC Institutional Order Block Filters</div>
                <div className="font-mono text-[9px] text-muted-foreground mt-0.5">Filters out trades failing institutional liquidity blocks.</div>
              </div>
              <button
                onClick={() => setOrderBlockFilterEnabled(!orderBlockFilterEnabled)}
                className={`font-mono text-[10px] px-4 py-2 border transition-all uppercase ${
                  orderBlockFilterEnabled
                    ? "border-green/30 text-green bg-green/5"
                    : "border-border text-muted-foreground"
                }`}
              >
                {orderBlockFilterEnabled ? "Active Filters [ON]" : "Filters [OFF]"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WEBSOCKET LOG FEED & EMERGENCY EXIT */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* SAFEGUARD CONTROL */}
          <div className="border border-red/30 bg-[#141414] p-6 relative">
            <span className="absolute -top-3.5 left-6 bg-[#141414] px-3 text-red text-xs font-mono tracking-wider">
              ☢ SYSTEM SAFEGUARD
            </span>
            <h4 className="font-heading text-xl tracking-wider text-red mb-2">Emergency Force Exit</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Instantly liquidation all open trade copy positions across MT5, Deriv indices, and Crypto brokers and halt order routing.
            </p>
            <button
              onClick={handleEmergencyLiquidation}
              disabled={activeTrades.length === 0}
              className={`w-full font-mono text-[10px] tracking-[2px] py-3.5 uppercase font-bold transition-all ${
                activeTrades.length === 0
                  ? "bg-border text-muted-foreground cursor-not-allowed border border-border"
                  : "bg-red text-white hover:bg-red/80 hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(242,90,90,0.15)]"
              }`}
            >
              ☢ Disclose & Liquidate All
            </button>
          </div>

          {/* ENGINE TERMINAL LOGGER */}
          <div className="border border-border bg-[#0c0c0c] p-6 flex flex-col min-h-[380px]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <span className="font-mono text-[10px] tracking-[2px] text-primary uppercase">Websocket Monitor Feed</span>
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            </div>

            <div
              ref={logContainerRef}
              className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-3.5 max-h-[300px] scrollbar-thin scrollbar-thumb-border pr-2"
            >
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <span className="text-muted-foreground shrink-0">[{log.time}]</span>
                  <span
                    className={
                      log.type === "success"
                        ? "text-green"
                        : log.type === "warning"
                        ? "text-primary"
                        : log.type === "error"
                        ? "text-red font-bold animate-pulse"
                        : "text-muted-foreground"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* VERIFIED COPY PROVIDERS */}
          <div className="bg-[#141414] border border-border p-6">
            <h4 className="font-heading text-lg tracking-[2px] text-foreground mb-4">Verified Copy Providers</h4>
            <div className="flex flex-col gap-3">
              {traders.map((trader) => (
                <div key={trader.id} className="p-3.5 border border-border bg-[#080808]">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-foreground flex items-center gap-2 font-sans">
                        <span className="text-primary text-sm">{trader.avatar}</span>
                        {trader.name}
                      </div>
                      <div className="font-mono text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                        {trader.market} Provider · {trader.totalTrades} Trades
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green text-xs font-mono font-bold">+{trader.pnlPercentage}%</div>
                      <div className="font-mono text-[8px] text-muted-foreground mt-0.5">{trader.winRate}% WR</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BROKER CONNECT MODAL ── */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
          <div className="bg-[#141414] border border-border max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowApiModal(false)}
              className="absolute top-4 right-4 font-mono text-muted-foreground hover:text-foreground text-xs"
            >
              [X] Close
            </button>

            <h3 className="font-heading text-2xl tracking-[2px] text-foreground mb-2">Connect Secure API Key</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Connect your exchange key with withdrawal capabilities disabled. API credentials are encrypted with AES-256 standards.
            </p>

            <form onSubmit={handleAddApi} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Select Target Exchange</label>
                <select
                  value={selectedExchange}
                  onChange={(e) => setSelectedExchange(e.target.value)}
                  className="w-full bg-black border border-border text-xs text-foreground font-mono px-3 py-2 outline-none focus:border-primary"
                >
                  <option value="Binance">Binance USDM Futures</option>
                  <option value="Bybit">Bybit Unified Futures</option>
                  <option value="OKX">OKX Futures</option>
                  <option value="Deriv">Deriv MT5 Broker</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Secure Client API ID</label>
                <input
                  type="text"
                  placeholder="Enter sandboxed public client API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-black border border-border text-xs text-foreground font-mono px-3 py-2 outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Secure API signature / Passphrase</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="w-full bg-black border border-border text-xs text-foreground font-mono px-3 py-2 outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 font-mono text-[10px] tracking-[2px] uppercase bg-primary text-primary-foreground py-2.5 hover:bg-gold-light transition-all"
                >
                  Confirm Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => setShowApiModal(false)}
                  className="flex-1 font-mono text-[10px] tracking-[2px] uppercase bg-[#1a1a1a] text-muted-foreground py-2.5 hover:text-foreground transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
