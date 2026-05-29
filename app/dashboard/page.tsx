"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BarChart2, 
  ArrowRight, 
  Clock, 
  Flame, 
  TrendingUp, 
  Activity, 
  Users, 
  Lock, 
  Shield, 
  Zap, 
  AlertTriangle, 
  LogOut, 
  Check, 
  Settings,
  HelpCircle,
  TrendingDown,
  Coins,
  Copy,
  Plus,
  Terminal,
  Filter,
  Search,
  Globe,
  ArrowLeft,
  MessageSquare,
  Calendar,
  Bell,
  BookOpen,
  Menu,
  X
} from "lucide-react";
import { verifyAndAdjustTradeSignal, RiskRules } from "@/lib/mirrorEngine";
import { TradePosition, VerifiedTrader } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface LogEntry {
  time: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
}

interface ActivityLog {
  time: string;
  provider: string;
  symbol: string;
  market: string;
  side: "BUY" | "SELL";
  status: "APPROVED" | "BLOCKED";
  reason: string;
  leverage: number;
  size: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("user@example.com");
  const [displayName, setDisplayName] = useState<string>("Jordan Smith");
  const [avatarUrl, setAvatarUrl] = useState<string>("👤");
  const [activePlan, setActivePlan] = useState<string>("Sandbox");
  const [pendingPlanName, setPendingPlanName] = useState<string | null>(null);

  // Core navigation status (Mapped to sidebar categories)
  // Vault -> Portfolio, Trade -> Watchlist, Activity -> News Feed, Compete -> Copy Trade, Referrals -> Guide, Settings -> Risk / Settings
  const [activeSubTab, setActiveSubTab] = useState("Vault");
  const [chartTab, setChartTab] = useState("Account Value");
  const [depositTab, setDepositTab] = useState("Deposit");
  const [aboutTab, setAboutTab] = useState("About");

  // User financial states
  const [accountEquity, setAccountEquity] = useState(0); 
  const [depositAmount, setDepositAmount] = useState("");
  const [lockingPeriod, setLockingPeriod] = useState(30);

  // AI Risk Safeguard parameters
  const [maxExposurePercent, setMaxExposurePercent] = useState(25);
  const [maxLeverageCap, setMaxLeverageCap] = useState(20);
  const [slippageLimitPercent, setSlippageLimitPercent] = useState(0.15);
  const [maxPositionSizeUsdt, setMaxPositionSizeUsdt] = useState(1000);
  const [orderBlockFilterEnabled, setOrderBlockFilterEnabled] = useState(true);

  // Real-time metric states
  const [totalProfit, setTotalProfit] = useState(0);
  const [latency, setLatency] = useState(12);

  // Manual trade form state
  const [tradeSymbol, setTradeSymbol] = useState("BTC-USDT");
  const [tradeSide, setTradeSide] = useState<"BUY" | "SELL">("BUY");
  const [tradeSize, setTradeSize] = useState("500");
  const [tradeLeverage, setTradeLeverage] = useState(20);
  const [tradeSlippage, setTradeSlippage] = useState("0.10");

  // Referral states
  const [refCopied, setRefCopied] = useState(false);

  // Activity search/filter
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("ALL");

  // Theme settings in sidebar
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Active copied positions (starts empty — populated by live copy engine)
  const [activeTrades, setActiveTrades] = useState<TradePosition[]>([]);

  // Copy providers list matching Futures copy trading grid
  const [providers, setProviders] = useState<any[]>([
    {
      id: "prov-01",
      name: "Martin",
      avatar: "ðŸª",
      market: "Crypto",
      totalTrades: 342,
      winRate: 88,
      pnlPercentage: 110,
      stars: 196,
      maxParticipants: 200,
      aum: 1313234.78,
      mdd: 7.31,
      sharpe: 7.63
    },
    {
      id: "prov-02",
      name: "Larry",
      avatar: "ðŸ”®",
      market: "Forex",
      totalTrades: 198,
      winRate: 82,
      pnlPercentage: 85,
      stars: 190,
      maxParticipants: 200,
      aum: 31432.54,
      mdd: 14.50,
      sharpe: 1.22
    },
    {
      id: "prov-03",
      name: "Nancy",
      avatar: "âš¡",
      market: "Deriv",
      totalTrades: 512,
      winRate: 91,
      pnlPercentage: 142,
      stars: 110,
      maxParticipants: 150,
      aum: 45543.84,
      mdd: 30.20,
      sharpe: 4.15
    }
  ]);

  const [copiedProviders, setCopiedProviders] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardView, setDashboardView] = useState<"default" | "box" | "wide" | "panel">("default");
  const [showApiModal, setShowApiModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState("Binance");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [apiKeys, setApiKeys] = useState<{ name: string; type: string; status: string }[]>([]);

  // Terminal log stream (starts with welcome message only)
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: new Date().toTimeString().split(" ")[0], message: "SYSTEM ONLINE // Waiting for copy engine initialization...", type: "info" },
  ]);

  // Historical Signals Center log (starts empty — populated by simulation)
  const [historicalSignals, setHistoricalSignals] = useState<ActivityLog[]>([]);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Client Session and Theme check
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setAuthorized(true);
        setUserEmail(user.email ?? "Unknown User");
        
        // Fetch invoices
        const { data: invoices } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (invoices && invoices.length > 0) {
          // Check for any pending
          const pending = invoices.find((inv: any) => inv.status === "pending");
          if (pending) {
            setPendingPlanName(pending.plan_name);
          }
          // Find latest approved to determine active plan
          const approved = invoices.find((inv: any) => inv.status === "approved");
          if (approved) {
            setActivePlan(approved.plan_name);
            setPendingPlanName(null); // clear banner if approved
          }
        }

        // Fetch Providers
        const { data: provs } = await supabase.from("providers").select("*");
        if (provs && provs.length > 0) setProviders(provs);

        // Fetch User Profile
        const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();
        if (profile) {
          setDisplayName(profile.display_name ?? "Jordan Smith");
          setAvatarUrl(profile.avatar_url ?? "👤");
          setAccountEquity(profile.account_equity);
          setMaxExposurePercent(profile.max_exposure_percent);
          setMaxLeverageCap(profile.max_leverage_cap);
          setSlippageLimitPercent(profile.slippage_limit_percent);
          setMaxPositionSizeUsdt(profile.max_position_size_usdt);
          setOrderBlockFilterEnabled(profile.order_block_filter_enabled);
        } else {
          await supabase.from("user_profiles").insert({ user_id: user.id });
        }

        // Fetch API Keys
        const { data: keys } = await supabase.from("exchange_keys").select("*").eq("user_id", user.id);
        if (keys) setApiKeys(keys.map(k => ({ name: k.exchange_name, type: k.exchange_name, status: k.status })));

        // Fetch Subscriptions
        const { data: subs } = await supabase.from("user_subscriptions").select("provider_id").eq("user_id", user.id);
        if (subs) setCopiedProviders(subs.map(s => s.provider_id));

      } else {
        const token = sessionStorage.getItem("token");
        if (token) {
          setAuthorized(true);
        } else {
          router.push("/signin");
        }
      }
    };

    checkAuth();

    const savedTheme = (localStorage.getItem("theme") || "dark") as "dark" | "light";
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, [router]);

  // Debounced Auto-Save for Profile Settings
  useEffect(() => {
    if (!authorized) return;
    const saveProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_profiles").update({
          display_name: displayName,
          avatar_url: avatarUrl,
          max_leverage_cap: maxLeverageCap,
          slippage_limit_percent: slippageLimitPercent,
          max_position_size_usdt: maxPositionSizeUsdt,
          order_block_filter_enabled: orderBlockFilterEnabled
        }).eq("user_id", user.id);
      }
    };
    const timer = setTimeout(saveProfile, 1000);
    return () => clearTimeout(timer);
  }, [displayName, avatarUrl, maxLeverageCap, slippageLimitPercent, maxPositionSizeUsdt, orderBlockFilterEnabled, authorized]);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Dynamic websocket copy trading simulation
  useEffect(() => {
    if (!authorized) return;

    const interval = setInterval(() => {
      const times = new Date().toTimeString().split(" ")[0];
      
      // Select source provider
      const activeProviderNames = copiedProviders.length > 0 ? copiedProviders : ["Martin", "Larry", "Nancy"];
      const randomProvider = activeProviderNames[Math.floor(Math.random() * activeProviderNames.length)];
      
      const symbols = ["BTC-USDT", "ETH-USDT", "EURUSD", "GBPUSD", "V75-INDEX"];
      const selectedSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const side = Math.random() > 0.5 ? ("BUY" as const) : ("SELL" as const);
      const masterLeverage = Math.random() > 0.85 ? 100 : 25;
      const masterSizeUsdt = Math.floor(Math.random() * 1600) + 200;
      const slippagePercent = parseFloat((Math.random() * 0.35).toFixed(3));

      const simulatedSignal = {
        symbol: selectedSymbol,
        side,
        masterPrice: selectedSymbol.includes("USD") ? 1.08500 : 66250,
        masterLeverage,
        masterSizeUsdt,
        slippagePercent,
      };

      const activeRules: RiskRules = {
        maxExposurePercent,
        maxLeverageCap,
        slippageLimitPercent,
        maxPositionSizeUsdt,
        orderBlockFilterEnabled,
      };

      const validation = verifyAndAdjustTradeSignal(
        simulatedSignal,
        activeTrades,
        accountEquity,
        activeRules
      );

      if (validation.allowed) {
        const finalLeverage = validation.adjustedLeverage ?? masterLeverage;
        const finalSize = validation.adjustedSize ?? masterSizeUsdt;
        
        const newTrade: TradePosition = {
          id: "pos-" + Math.random().toString(36).substring(2, 7),
          symbol: selectedSymbol,
          market: selectedSymbol.includes("INDEX") ? "Deriv" : selectedSymbol.includes("USD") ? "Forex" : "Crypto",
          side,
          entryPrice: simulatedSignal.masterPrice,
          currentPrice: simulatedSignal.masterPrice * (side === "BUY" ? 1.0018 : 0.9982),
          size: finalSize,
          leverage: finalLeverage,
          pnl: parseFloat((finalSize * 0.015).toFixed(2)),
          slippage: slippagePercent,
          timestamp: new Date().toISOString(),
          status: "OPEN",
        };

        setActiveTrades((prev) => [...prev, newTrade]);
        
        setLogs((prev) => [
          ...prev,
          {
            time: times,
            message: `SIGNAL // Master signal detected from @${randomProvider} [${side} ${selectedSymbol}].`,
            type: "info",
          },
          {
            time: times,
            message: `MIRROR // Executed successfully in 12ms. Size: $${finalSize} cap, Leverage: ${finalLeverage}x.`,
            type: "success",
          },
        ]);

        // Add to historical signal list
        setHistoricalSignals((prev) => [
          {
            time: times,
            provider: randomProvider,
            symbol: selectedSymbol,
            market: selectedSymbol.includes("INDEX") ? "Deriv" : selectedSymbol.includes("USD") ? "Forex" : "Crypto",
            side,
            status: "APPROVED",
            reason: "All filters check out.",
            leverage: finalLeverage,
            size: finalSize
          },
          ...prev
        ]);

        setLatency(Math.max(7, Math.min(20, 12 + (Math.random() > 0.5 ? 1 : -1))));
        setTotalProfit((prev) => parseFloat((prev + 0.12).toFixed(2)));
      } else {
        setLogs((prev) => [
          ...prev,
          {
            time: times,
            message: `SIGNAL // Master signal detected from @${randomProvider} [${side} ${selectedSymbol}].`,
            type: "info",
          },
          {
            time: times,
            message: `ðŸ›¡ï¸ BLOCKED // AI Safeguard shield engaged: ${validation.reason}`,
            type: "warning",
          },
        ]);

        // Add to historical signal list
        setHistoricalSignals((prev) => [
          {
            time: times,
            provider: randomProvider,
            symbol: selectedSymbol,
            market: selectedSymbol.includes("INDEX") ? "Deriv" : selectedSymbol.includes("USD") ? "Forex" : "Crypto",
            side,
            status: "BLOCKED",
            reason: validation.reason ?? "Blocked by rule.",
            leverage: masterLeverage,
            size: masterSizeUsdt
          },
          ...prev
        ]);
      }
    }, 11000);

    return () => clearInterval(interval);
  }, [authorized, activeTrades, maxExposurePercent, maxLeverageCap, slippageLimitPercent, maxPositionSizeUsdt, orderBlockFilterEnabled, accountEquity, copiedProviders]);

  const handleExitTrade = (id: string) => {
    const closedTrade = activeTrades.find((t) => t.id === id);
    setActiveTrades((prev) => prev.filter((t) => t.id !== id));
    
    const times = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [
      ...prev,
      {
        time: times,
        message: `MANUAL EXIT // Settled mirrored copy position for ${closedTrade?.symbol} instantly.`,
        type: "success",
      },
    ]);
  };

  const handleEmergencyLiquidation = () => {
    const times = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [
      ...prev,
      { time: times, message: "âš ï¸ EMERGENCY HALT // Initiating global margin exit router...", type: "error" },
      { time: times, message: `EMERGENCY COMPLETE // Settled ${activeTrades.length} open copied positions. Signal listening disabled.`, type: "success" },
    ]);
    setActiveTrades([]);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    setAccountEquity((prev) => prev + amount);
    const times = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [
      ...prev,
      {
        time: times,
        message: `DEPOSIT VAULT // Collateralized +$${amount.toLocaleString()} wUSDT into security routing vault.`,
        type: "success",
      },
    ]);
    setDepositAmount("");
  };

  const handleToggleCopyProvider = async (name: string) => {
    const times = new Date().toTimeString().split(" ")[0];
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (copiedProviders.includes(name)) {
      if (user) {
        await supabase.from("user_subscriptions").delete().match({ user_id: user.id, provider_id: name });
      }
      setCopiedProviders((prev) => prev.filter((n) => n !== name));
      setLogs((prev) => [
        ...prev,
        {
          time: times,
          message: `PROVIDER UNLINKED // Disconnected signal mirroring path for @${name}.`,
          type: "warning",
        },
      ]);
    } else {
      if (user) {
        await supabase.from("user_subscriptions").insert({ user_id: user.id, provider_id: name });
      }
      setCopiedProviders((prev) => [...prev, name]);
      setLogs((prev) => [
        ...prev,
        {
          time: times,
          message: `PROVIDER LINKED // Connected secure signal mirroring path for @${name}! Scanning SMC blocks...`,
          type: "success",
        },
      ]);
    }
  };

  const handleManualTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const size = parseFloat(tradeSize);
    if (isNaN(size) || size <= 0) return;

    const times = new Date().toTimeString().split(" ")[0];

    const simulatedSignal = {
      symbol: tradeSymbol,
      side: tradeSide,
      masterPrice: tradeSymbol.includes("USD") ? 1.08500 : 66250,
      masterLeverage: tradeLeverage,
      masterSizeUsdt: size,
      slippagePercent: parseFloat(tradeSlippage),
    };

    const activeRules: RiskRules = {
      maxExposurePercent,
      maxLeverageCap,
      slippageLimitPercent,
      maxPositionSizeUsdt,
      orderBlockFilterEnabled,
    };

    // Run manual order through the AI Safeguards
    const validation = verifyAndAdjustTradeSignal(
      simulatedSignal,
      activeTrades,
      accountEquity,
      activeRules
    );

    if (validation.allowed) {
      const finalLeverage = validation.adjustedLeverage ?? tradeLeverage;
      const finalSize = validation.adjustedSize ?? size;

      const newTrade: TradePosition = {
        id: "pos-" + Math.random().toString(36).substring(2, 7),
        symbol: tradeSymbol,
        market: tradeSymbol.includes("INDEX") ? "Deriv" : tradeSymbol.includes("USD") ? "Forex" : "Crypto",
        side: tradeSide,
        entryPrice: simulatedSignal.masterPrice,
        currentPrice: simulatedSignal.masterPrice * (tradeSide === "BUY" ? 1.0012 : 0.9988),
        size: finalSize,
        leverage: finalLeverage,
        pnl: parseFloat((finalSize * 0.01).toFixed(2)),
        slippage: parseFloat(tradeSlippage),
        timestamp: new Date().toISOString(),
        status: "OPEN",
      };

      setActiveTrades((prev) => [...prev, newTrade]);
      setLogs((prev) => [
        ...prev,
        { time: times, message: `MANUAL ORDER // Routing manual trade: ${tradeSide} ${tradeSymbol}...`, type: "info" },
        { time: times, message: `MANUAL SUCCESS // Executed safely. Mirror placed at capping specs.`, type: "success" },
      ]);

      setHistoricalSignals((prev) => [
        {
          time: times,
          provider: "Manual Client",
          symbol: tradeSymbol,
          market: tradeSymbol.includes("INDEX") ? "Deriv" : tradeSymbol.includes("USD") ? "Forex" : "Crypto",
          side: tradeSide,
          status: "APPROVED",
          reason: "Manual command verification authorized.",
          leverage: finalLeverage,
          size: finalSize
        },
        ...prev
      ]);
    } else {
      setLogs((prev) => [
        ...prev,
        { time: times, message: `MANUAL ORDER // Routing manual trade: ${tradeSide} ${tradeSymbol}...`, type: "info" },
        { time: times, message: `ðŸ›¡ï¸ SHIELD BLOCKED // Manual order blocked: ${validation.reason}`, type: "warning" },
      ]);

      setHistoricalSignals((prev) => [
        {
          time: times,
          provider: "Manual Client",
          symbol: tradeSymbol,
          market: tradeSymbol.includes("INDEX") ? "Deriv" : tradeSymbol.includes("USD") ? "Forex" : "Crypto",
          side: tradeSide,
          status: "BLOCKED",
          reason: validation.reason ?? "Blocked by manual rule check.",
          leverage: tradeLeverage,
          size: size
        },
        ...prev
      ]);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://trufunder.com/ref/0x034553c53244fe3555829224d");
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 2000);
  };

  const handleAddApiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !apiSecret) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("exchange_keys").insert({
        user_id: user.id,
        exchange_name: selectedExchange,
        api_key: apiKey,
        api_secret: apiSecret
      });
    }

    setApiKeys((prev) => [
      ...prev,
      { name: `Account-${selectedExchange}`, type: selectedExchange, status: "Active" },
    ]);

    const times = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [
      ...prev,
      { time: times, message: `API VAULT // Connected secure API signatures for ${selectedExchange}. Sandbox active.`, type: "success" },
    ]);

    setApiKey("");
    setApiSecret("");
    setShowApiModal(false);
  };

  const toggleThemeInSidebar = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.clear();
    router.push("/signin");
  };

  // Filter historical signals based on query and filters
  const filteredSignals = historicalSignals.filter((sig) => {
    const matchesSearch = sig.symbol.toLowerCase().includes(activitySearch.toLowerCase()) || 
                          sig.provider.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesFilter = activityFilter === "ALL" || sig.status === activityFilter;
    return matchesSearch && matchesFilter;
  });

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans text-foreground">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs tracking-[2px] text-muted-foreground uppercase">Verifying sandboxed security token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative flex overflow-hidden">

      {/* â”€â”€ Mobile Sidebar Overlay Backdrop â”€â”€ */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* â”€â”€ 1. LEFT STICKY SIDEBAR (JORDAN SMITH LOOK) â”€â”€ */}
      <aside className={`w-64 border-r border-border bg-card flex flex-col justify-between p-6 fixed left-0 top-0 bottom-0 z-50 select-none transition-transform duration-300 md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="space-y-7">
          
          {/* Logo brand banner block */}
          <div className="flex items-center justify-between py-3.5 px-4 bg-[#c9a84c] dark:bg-[#0c0c0c] border border-[#c9a84c]/20 dark:border-border text-white rounded-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 dark:bg-primary/20 flex items-center justify-center font-bold text-lg text-primary-foreground dark:text-primary">
                â–²
              </div>
              <div>
                <div className="font-mono text-xs font-black tracking-[2px] capitalize">TRUFUNDER</div>
                <div className="font-mono text-[8px] tracking-[1px] text-white/50 dark:text-primary/70 capitalize">SMC Auto-Router</div>
              </div>
            </div>
            
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-white/80 hover:text-white transition-colors cursor-pointer outline-none"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Active User slot */}
          <div className="flex items-center gap-3.5 px-2.5 py-1.5 border-b border-border/40 pb-5">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center text-xl relative shrink-0">
              {avatarUrl}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green border-2 border-card" />
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-bold font-sans text-foreground truncate" title={displayName}>{displayName}</div>
              <div className="text-[9px] font-sans text-muted-foreground truncate animate-pulse" title={userEmail}>{userEmail}</div>
              <div className="font-mono text-[8px] text-primary capitalize mt-0.5 tracking-wider">✓ {activePlan} {activePlan === "Sandbox" ? "Trial" : "Node"}</div>
            </div>
          </div>

          {/* Navigation Links mapped precisely */}
          <nav className="flex flex-col gap-1.5">
            {[
              { id: "Vault", label: "Portfolio", icon: BarChart2 },
              { id: "Trade", label: "Watchlist", icon: Clock },
              { id: "Activity", label: "News Feed", icon: Activity },
              { id: "Compete", label: "Copy Trade", icon: Users },
              { id: "Referrals", label: "Guide", icon: BookOpen },
              { id: "Settings", label: "Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSubTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-md font-mono text-[10px] tracking-wider capitalize text-left transition-all outline-none cursor-pointer ${
                    isActive 
                      ? "bg-[#c9a84c]/10 dark:bg-primary/10 text-[#c9a84c] dark:text-primary font-bold shadow-[inset_3px_0_0_#c9a84c] dark:shadow-[inset_3px_0_0_#c9a84c]" 
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Sidebar bottom block (Dark mode toggle, logout, promos) */}
        <div className="space-y-5">
          
          {/* Promo offer box */}
          <div className="bg-muted/40 dark:bg-[#0c0c0c] border border-border p-4 text-center rounded-md">
            <div className="text-[10px] font-sans text-foreground dark:text-white/90 leading-tight">
              Invite a friend and receive <strong className="text-primary font-bold">$10</strong>
            </div>
            <button
              onClick={() => {
                setActiveSubTab("Referrals");
                setSidebarOpen(false);
              }}
              className="w-full mt-3 font-mono text-[8px] tracking-[1.5px] capitalize font-bold bg-[#141414] hover:bg-[#1a1a1a] text-primary border border-border/60 py-2 transition-all cursor-pointer rounded-md outline-none"
            >
              Send Invitation
            </button>
          </div>

          {/* Dark Mode Switch Row matching Jordan Smith toggle */}
          <div className="flex items-center justify-between font-mono text-[10px] capitalize text-muted-foreground pt-4 border-t border-border">
            <span>Dark mode</span>
            <button
              type="button"
              onClick={toggleThemeInSidebar}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                theme === "dark" ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Logout element */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 font-mono text-[10px] tracking-wider capitalize text-red hover:bg-red/5 transition-all outline-none rounded-md cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red" />
            Logout
          </button>

        </div>
      </aside>

      {/* ── 2. MAIN SCROLLABLE CONTENT BODY (pl-64) ── */}
      <main className="flex-1 pl-0 md:pl-64 flex flex-col min-h-screen bg-background relative z-10 w-full overflow-hidden">

        {/* Pending Payment Banner */}
        {pendingPlanName && (
          <div className="bg-[#c9a84c]/10 border-b border-[#c9a84c]/20 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-[#c9a84c] uppercase tracking-wider font-mono">Payment Processing</h4>
              <p className="text-xs text-[#c9a84c]/80 mt-0.5 leading-relaxed">
                Your payment for the <strong className="font-bold">{pendingPlanName}</strong> tier is currently under review by our billing team.
                Your upgraded node access will automatically unlock once verified.
              </p>
            </div>
          </div>
        )}

        {/* ── STICKY SEARCH HEADER ── */}
        <header className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border z-20 py-4 px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 md:gap-5 flex-1 max-w-xl">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2.5 border border-border bg-card text-foreground hover:text-primary rounded-md cursor-pointer outline-none focus:outline-none shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setActiveSubTab("Vault")} 
              className="p-2.5 border border-border bg-card rounded-md text-muted-foreground hover:text-foreground hover:border-primary transition-all cursor-pointer outline-none"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Input Search matches exactly Jordan Smith UI */}
            <div className="relative w-full">
              <span className="absolute left-3.5 top-3.5 text-muted-foreground">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search for trader, stock, etc..."
                className="w-full bg-card border border-border text-xs text-foreground font-sans pl-10 pr-4 py-3 outline-none focus:border-primary focus:bg-background transition-all rounded-md"
              />
            </div>
          </div>

          {/* Top Actions Row */}
          <div className="flex items-center gap-5">
            {/* Display View Toggle controls */}
            <div className="hidden md:flex items-center gap-1 border border-border bg-card/60 p-0.5 rounded-md">
              {[
                { id: "default", label: "Default" },
                { id: "box", label: "Box" },
                { id: "wide", label: "Wide" },
                { id: "panel", label: "Panel" }
              ].map((viewOpt) => {
                const isViewActive = dashboardView === viewOpt.id;
                return (
                  <button
                    key={viewOpt.id}
                    onClick={() => setDashboardView(viewOpt.id as any)}
                    className={`px-2.5 py-1.5 font-mono text-[8px] tracking-[1px] uppercase rounded-sm transition-all cursor-pointer border-0 outline-none ${
                      isViewActive
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "text-muted-foreground hover:text-foreground bg-transparent"
                    }`}
                  >
                    {viewOpt.label}
                  </button>
                );
              })}
            </div>

            <span className="w-px h-4 bg-border hidden md:block" />

            <div className="hidden lg:flex items-center gap-2">
              <button className="p-2.5 border border-border bg-card rounded-md text-muted-foreground hover:text-foreground transition-all cursor-pointer outline-none">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button className="p-2.5 border border-border bg-card rounded-md text-muted-foreground hover:text-foreground transition-all cursor-pointer outline-none">
                <Calendar className="w-4 h-4" />
              </button>
              <button className="p-2.5 border border-border bg-card rounded-md text-muted-foreground hover:text-foreground transition-all cursor-pointer outline-none">
                <Bell className="w-4 h-4" />
              </button>
            </div>

            {/* Wallet Hash and Faucet Gateway triggers */}
            <div className="flex items-center gap-3.5">
              <div className="hidden md:flex items-center gap-2.5 bg-card border border-border px-4 py-2 rounded-md font-mono text-[9px] tracking-wider">
                <span className="text-primary font-bold">{accountEquity.toLocaleString()} USDT</span>
                <span className="w-px h-3 bg-border" />
                <span className="text-muted-foreground">0xAesw...1234</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              </div>

              <button
                onClick={() => setShowApiModal(true)}
                className="font-mono text-[9px] tracking-[1.5px] uppercase border border-border bg-primary/10 text-primary px-5 py-2.5 hover:bg-primary/20 transition-all rounded-md cursor-pointer outline-none"
              >
                Faucet Gateway
              </button>
            </div>
          </div>
        </header>

        {/* â”€â”€ MODULE PANEL WRAPPER â”€â”€ */}
        <div className="flex-1 flex gap-0 w-full transition-all duration-500">
          {/* Main content column dynamically bounded by view mode */}
          <div className={`flex-1 transition-all duration-300 w-full ${
            dashboardView === "box" 
              ? "max-w-5xl mx-auto p-4 md:p-10 bg-muted/20 border border-border rounded-xl shadow-lg my-0 md:my-6"
              : dashboardView === "wide"
              ? "max-w-none px-4 md:px-8 py-4 md:py-8 w-full"
              : "max-w-7xl mx-auto w-full p-4 md:p-8"
          } space-y-8`}>
          
          {/* ========================================================
              TAB 1: PORTFOLIO (VAULT) - MODULATED LAYOUT MATCHING IMAGE
             ======================================================== */}
          {activeSubTab === "Vault" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (col-span-8): High fidelity charts & tables */}
              <div className="lg:col-span-8 space-y-8">

                {/* 1. PERFORMANCE CHART CARD (Profit vs Loss columns) */}
                <div className="border border-border bg-card p-6 rounded-lg relative shadow-sm">
                  <div className="flex items-center justify-between pb-6 mb-4 border-b border-border">
                    <h3 className="font-heading text-xl tracking-[1px] text-foreground font-bold">Performance</h3>
                    
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-[8px] text-muted-foreground uppercase flex items-center gap-1.5 border border-border px-2.5 py-1.5 bg-background rounded-md">
                        <span>Jan - Aug, 2026</span>
                        <span className="text-primary">â–¾</span>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Bar SVG Chart comparing Profit & Loss */}
                  <div className="relative h-[280px] w-full mt-4">
                    
                    {/* SVG Multi bar grids */}
                    <svg className="w-full h-full" viewBox="0 0 780 240" preserveAspectRatio="none">
                      <pattern id="chart-grids" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border/40" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#chart-grids)" />
                      
                      {/* Grid Y Axis values */}
                      <text x="10" y="25" fill="currentColor" className="text-[10px] font-mono text-muted-foreground" textAnchor="start">100%</text>
                      <text x="10" y="70" fill="currentColor" className="text-[10px] font-mono text-muted-foreground" textAnchor="start">80%</text>
                      <text x="10" y="115" fill="currentColor" className="text-[10px] font-mono text-muted-foreground" textAnchor="start">60%</text>
                      <text x="10" y="160" fill="currentColor" className="text-[10px] font-mono text-muted-foreground" textAnchor="start">40%</text>
                      <text x="10" y="205" fill="currentColor" className="text-[10px] font-mono text-muted-foreground" textAnchor="start">20%</text>
                      <text x="10" y="235" fill="currentColor" className="text-[10px] font-mono text-muted-foreground" textAnchor="start">0%</text>

                      {/* Grouped Bars: Profit vs Loss
                          Jan: Profit 40 (y: 150), Loss 65 (y: 100)
                          Feb: Profit 30 (y: 170), Loss 25 (y: 180)
                          Mar: Profit 15 (y: 200), Loss 10 (y: 210)
                          Apr: Profit 75 (y: 70), Loss 45 (y: 130)  <-- Active April tooltip
                          May: Profit 38 (y: 155), Loss 32 (y: 165)
                          Jun: Profit 50 (y: 130), Loss 20 (y: 190)
                          Aug: Profit 60 (y: 110), Loss 30 (y: 170)
                      */}
                      
                      {/* January */}
                      <rect x="75" y="130" width="18" height="90" fill="#a78bfa" className="opacity-70" rx="2" />
                      <rect x="96" y="90" width="18" height="130" fill="#334155" className="opacity-80" rx="2" />

                      {/* February */}
                      <rect x="165" y="170" width="18" height="50" fill="#a78bfa" className="opacity-70" rx="2" />
                      <rect x="186" y="180" width="18" height="40" fill="#334155" className="opacity-80" rx="2" />

                      {/* March */}
                      <rect x="255" y="200" width="18" height="20" fill="#a78bfa" className="opacity-70" rx="2" />
                      <rect x="276" y="210" width="18" height="10" fill="#334155" className="opacity-80" rx="2" />

                      {/* April (Highlighted in Tooltip) */}
                      <rect x="345" y="70" width="18" height="150" fill="#c9a84c" className="shadow-lg" rx="2" />
                      <rect x="366" y="130" width="18" height="90" fill="#334155" className="opacity-85" rx="2" />

                      {/* May */}
                      <rect x="435" y="155" width="18" height="65" fill="#a78bfa" className="opacity-70" rx="2" />
                      <rect x="456" y="165" width="18" height="55" fill="#334155" className="opacity-80" rx="2" />

                      {/* June */}
                      <rect x="525" y="130" width="18" height="90" fill="#a78bfa" className="opacity-70" rx="2" />
                      <rect x="546" y="190" width="18" height="30" fill="#334155" className="opacity-80" rx="2" />

                      {/* August */}
                      <rect x="615" y="110" width="18" height="110" fill="#a78bfa" className="opacity-70" rx="2" />
                      <rect x="636" y="170" width="18" height="50" fill="#334155" className="opacity-80" rx="2" />
                    </svg>

                    {/* Tooltip Overlay centered above April bars (x ~ 340-380, y ~ 10-60) */}
                    <div className="absolute top-[20px] left-[315px] bg-[#141414] dark:bg-[#1a1a1a] light:bg-white border border-primary/40 dark:border-primary/30 light:border-[#e2e8f0] px-4 py-2.5 rounded-lg shadow-xl text-left z-10 w-[120px]">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">April</div>
                      <div className="space-y-1 mt-1 font-mono text-[9px] uppercase">
                        <div className="flex justify-between items-center">
                          <span className="text-[#a78bfa] dark:text-primary">Profit</span>
                          <span className="text-green font-bold">52.31% â†‘</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-border pb-1">
                          <span className="text-muted-foreground">Loss</span>
                          <span className="text-red font-bold">45.67% â†“</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 font-bold text-foreground">
                          <span>Total</span>
                          <span className="text-green">06.64% â†‘</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 font-mono text-[9px] text-muted-foreground uppercase px-[80px] tracking-widest">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Aug</span>
                    </div>
                  </div>

                  {/* Profit / Loss ledger row below the chart */}
                  <div className="flex justify-center items-center gap-6 mt-6 font-mono text-[10px] tracking-wider text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#a78bfa] dark:bg-[#c9a84c] rounded-md inline-block" />
                      <span>Profit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#334155] rounded-md inline-block" />
                      <span>Loss</span>
                    </div>
                  </div>
                </div>

                {/* 2. COPIERS GROWTH line chart module */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-border border border-border rounded-lg overflow-hidden shadow-sm">
                  
                  {/* Line Chart */}
                  <div className="md:col-span-8 bg-card p-6">
                    <h4 className="font-heading text-lg text-foreground tracking-[1px] uppercase mb-4">Funded Accounts</h4>
                    
                    <div className="relative h-[120px] w-full">
                      <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3ecf8e" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#3ecf8e" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path 
                          d="M 10 90 Q 60 70, 110 50 T 210 65 T 310 25 T 390 10 L 390 90 Z" 
                          fill="url(#wave-grad)" 
                        />
                        <path 
                          d="M 10 90 Q 60 70, 110 50 T 210 65 T 310 25 T 390 10" 
                          fill="none" 
                          stroke="#3ecf8e" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                        />
                      </svg>
                      
                      <div className="flex justify-between items-center mt-2 font-mono text-[8px] text-muted-foreground uppercase px-1">
                        <span>2015</span>
                        <span>2017</span>
                        <span>2019</span>
                        <span>2021</span>
                        <span>2022</span>
                        <span>2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Growth Metrics */}
                  <div className="md:col-span-4 bg-card p-6 flex flex-col justify-center divide-y divide-border/60">
                    <div className="pb-4">
                      <div className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground">Active Accounts Last 7d</div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-heading text-2xl font-bold text-foreground">194</span>
                        <span className="font-mono text-[9px] text-green bg-green/10 border border-green/20 px-2 py-0.5 rounded-md font-bold">
                          +11.27% (7d)
                        </span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground">Total active replications</div>
                      <div className="font-heading text-2xl font-bold text-foreground mt-1">2,585</div>
                    </div>
                  </div>
                </div>

                {/* 3. FREQUENTLY TRADED TABLE */}
                <div className="border border-border bg-card p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                    <h4 className="font-heading text-lg tracking-[1.5px] uppercase text-foreground">Frequently Traded</h4>
                    <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Router feeds</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="text-muted-foreground border-b border-border pb-3 uppercase text-[9px] tracking-wider">
                          <th className="pb-3">Name/Symbol</th>
                          <th className="pb-3 text-center">Number of trades</th>
                          <th className="pb-3 text-center">Avg. Profit</th>
                          <th className="pb-3 text-center">Avg. Loss</th>
                          <th className="pb-3 text-right">Avg. Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          { symbol: "EURUSD", name: "Euro / US Dollar", count: "145 trades (5.64%)", profit: "+47.21%", loss: "-07.36%", risk: "1.8", color: "text-green" },
                          { symbol: "GBPUSD", name: "British Pound / US Dollar", count: "272 trades (7.39%)", profit: "+07.31%", loss: "-04.42%", risk: "2.2", color: "text-[#e8c97a]" },
                          { symbol: "XAUUSD", name: "Gold / US Dollar", count: "62 trades (4.26%)", profit: "+20.53%", loss: "-21.97%", risk: "3.2", color: "text-red" },
                          { symbol: "BTC-USDT", name: "Bitcoin Spot/Futures", count: "180 trades (8.15%)", profit: "+30.48%", loss: "-0.15%", risk: "1.5", color: "text-green" }
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3.5">
                              <div className="font-bold text-foreground">{row.symbol}</div>
                              <div className="text-[9px] text-muted-foreground mt-0.5 font-sans">{row.name}</div>
                            </td>
                            <td className="py-3.5 text-center text-foreground font-bold">{row.count}</td>
                            <td className="py-3.5 text-center text-green font-bold">{row.profit}</td>
                            <td className="py-3.5 text-center text-red font-bold">{row.loss}</td>
                            <td className="py-3.5 text-right font-bold">
                              <span className={`px-2 py-0.5 rounded-md bg-muted text-[10px] ${row.color}`}>
                                {row.risk}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. ACTIVE COPIED POSITIONS LEDGER */}
                <div className="border border-border bg-card p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="block w-4 h-px bg-primary" />
                      <h4 className="font-heading text-lg tracking-[2px] uppercase text-foreground">Active Copied Positions</h4>
                    </div>
                    <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Websocket connected</span>
                  </div>

                  {activeTrades.length === 0 ? (
                    <div className="py-12 text-center text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      No active copied positions. Router listening online.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="text-muted-foreground border-b border-border pb-3 uppercase text-[9px] tracking-wider">
                            <th className="pb-3">Symbol</th>
                            <th className="pb-3">Market</th>
                            <th className="pb-3 text-center">Side</th>
                            <th className="pb-3 text-center">Leverage</th>
                            <th className="pb-3 text-center">Allocated Size</th>
                            <th className="pb-3 text-center">PnL (USDT)</th>
                            <th className="pb-3 text-right">Settlement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {activeTrades.map((trade) => (
                            <tr key={trade.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-3.5 font-bold text-foreground">{trade.symbol}</td>
                              <td className="py-3.5 text-muted-foreground">{trade.market}</td>
                              <td className="py-3.5 text-center">
                                <span className={`px-2 py-0.5 text-[9px] border font-bold ${
                                  trade.side === "BUY" ? "text-green border-green/30 bg-green/5" : "text-red border-red/30 bg-red/5"
                                }`}>
                                  {trade.side}
                                </span>
                              </td>
                              <td className="py-3.5 text-center text-foreground">{trade.leverage}x</td>
                              <td className="py-3.5 text-center text-muted-foreground">${trade.size.toLocaleString()}</td>
                              <td className="py-3.5 text-center font-bold text-green">
                                +${trade.pnl.toFixed(2)}
                              </td>
                              <td className="py-3.5 text-right">
                                <button
                                  onClick={() => handleExitTrade(trade.id)}
                                  className="font-mono text-[9px] tracking-wider uppercase border border-red/30 text-red px-3 py-1 hover:bg-red/10 transition-all rounded-md cursor-pointer outline-none"
                                >
                                  Exit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column (col-span-4): Eva James profile details & asset distributions */}
              <div className="lg:col-span-4 space-y-8">

                {/* 1. EVA JAMES DETAIL CARD */}
                <div className="border border-border bg-card p-6 rounded-lg relative shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl relative shrink-0">
                        ðŸ‘©â€ðŸ’¼
                      </div>
                      <div>
                        <div className="text-xs font-bold font-sans text-foreground">Elvis</div>
                        <div className="font-mono text-[9px] text-muted-foreground mt-0.5 tracking-wider uppercase">
                          8 years of experience
                        </div>
                        <div className="font-mono text-[8px] text-[#c9a84c] mt-0.5 font-bold uppercase tracking-wider">
                          ðŸ“ United Kingdom
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4 font-sans text-xs">
                    <div>
                      <h5 className="font-bold text-foreground">Biography</h5>
                      <p className="text-muted-foreground text-[11px] leading-relaxed mt-1">
                        My name is Elvis and I have been trading for more than 8 years of investing experience. I am here to mirror ICT setups...
                      </p>
                    </div>

                    <div>
                      <h5 className="font-bold text-foreground">Strategy</h5>
                      <p className="text-muted-foreground text-[11px] leading-relaxed mt-1">
                        My strategy is to maintain a well-balanced portfolio trading the short, medium, and long-term order block imbalances...
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleCopyProvider("Elvis")}
                    className="w-full mt-6 font-mono text-[10px] tracking-[2.5px] uppercase font-bold bg-[#c9a84c] hover:bg-[#dfc57b] text-white py-3.5 rounded-md transition-all shadow-[0_4px_12px_rgba(201,168,76,0.2)] cursor-pointer outline-none"
                  >
                    Copy Trader
                  </button>
                </div>

                {/* 2. TRADING HISTORY DOUGHNUT ALLOCATION */}
                <div className="border border-border bg-card p-6 rounded-lg shadow-sm">
                  <h4 className="font-heading text-lg tracking-[1.5px] uppercase text-foreground pb-4 border-b border-border mb-6">
                    Trading History
                  </h4>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    
                    {/* SVG Concentric Doughnut chart Allocation */}
                    <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Concentric stroke parts: Total circumference = 2 * PI * r (r=40 -> C=251.3)
                            Crypto (31%): 78 length, dashOffset: 0
                            Stock (35%): 88 length, dashOffset: 78
                            Commodities (19%): 48 length, dashOffset: 166
                            ETFs (15%): 38 length, dashOffset: 214
                        */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
                        
                        {/* Crypto - Gold/Green */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#3ecf8e" strokeWidth="9" strokeDasharray="78 251.3" strokeDashoffset="0" />
                        
                        {/* Stock - Burgundy/Charcoal */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#4c0519" strokeWidth="9" strokeDasharray="88 251.3" strokeDashoffset="-78" />

                        {/* Commodities - Copper/Gold */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#c9a84c" strokeWidth="9" strokeDasharray="48 251.3" strokeDashoffset="-166" />

                        {/* ETFs - Red */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f25a5a" strokeWidth="9" strokeDasharray="38 251.3" strokeDashoffset="-214" />
                      </svg>

                      {/* Doughnut center statistics */}
                      <div className="absolute text-center flex flex-col items-center justify-center">
                        <span className="font-heading text-2xl font-bold text-foreground leading-none">859</span>
                        <span className="font-mono text-[7px] text-muted-foreground uppercase tracking-wider mt-0.5">Total Trades</span>
                      </div>
                    </div>

                    {/* Ratios Legenda */}
                    <div className="flex-1 font-mono text-[9px] uppercase tracking-wider space-y-2.5 w-full">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#4c0519] inline-block" />
                          <span className="text-muted-foreground">Forex Major</span>
                        </div>
                        <span className="font-bold text-foreground">35%</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#f25a5a] inline-block" />
                          <span className="text-muted-foreground">Synthetics</span>
                        </div>
                        <span className="font-bold text-foreground">15%</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#c9a84c] inline-block" />
                          <span className="text-muted-foreground">Metals (Gold)</span>
                        </div>
                        <span className="font-bold text-foreground">19%</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block" />
                          <span className="text-muted-foreground">Crypto</span>
                        </div>
                        <span className="font-bold text-foreground">31%</span>
                      </div>
                    </div>

                  </div>

                  {/* Summary performance block */}
                  <div className="grid grid-cols-2 gap-4 border-t border-border mt-6 pt-5 font-mono text-center">
                    <div className="bg-background/40 p-2.5 border border-border/80">
                      <div className="text-[7px] text-muted-foreground uppercase tracking-wider">Avg Profit</div>
                      <div className="text-xs text-green font-bold mt-1">+47.31%</div>
                    </div>
                    <div className="bg-background/40 p-2.5 border border-border/80">
                      <div className="text-[7px] text-muted-foreground uppercase tracking-wider">Avg Loss</div>
                      <div className="text-xs text-red font-bold mt-1">-19.92%</div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================
              TAB 2: WATCHLIST (TRADE CONSOLE & GATEWAYS)
             ======================================================== */}
          {activeSubTab === "Trade" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Manual execution */}
              <div className="lg:col-span-8 space-y-6">
                <div className="border border-border bg-card p-6 rounded-lg relative shadow-sm">
                  <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border">
                    <span className="block w-4 h-px bg-primary animate-pulse" />
                    <h3 className="font-heading text-lg tracking-[2px] uppercase text-foreground">SMC Execution Router</h3>
                  </div>

                  <form onSubmit={handleManualTradeSubmit} className="space-y-6">
                    
                    {/* Symbol / Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Target Instrument</label>
                        <select
                          value={tradeSymbol}
                          onChange={(e) => setTradeSymbol(e.target.value)}
                          className="w-full bg-black border border-border text-xs text-foreground font-mono px-3 py-3 outline-none focus:border-primary rounded-md dark:bg-black light:bg-background"
                        >
                          <option value="BTC-USDT">BTC-USDT (Crypto Spot/Futures)</option>
                          <option value="ETH-USDT">ETH-USDT (Crypto Spot/Futures)</option>
                          <option value="EURUSD">EURUSD (Forex Major)</option>
                          <option value="GBPUSD">GBPUSD (Forex Major)</option>
                          <option value="V75-INDEX">V75-INDEX (Deriv Synthetics)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Order Direction</label>
                        <div className="grid grid-cols-2 gap-px bg-border border border-border rounded-md">
                          <button
                            type="button"
                            onClick={() => setTradeSide("BUY")}
                            className={`font-mono text-[10px] tracking-[2px] py-3 uppercase font-bold text-center transition-all cursor-pointer ${
                              tradeSide === "BUY" ? "bg-green/10 text-green font-bold" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Long (BUY)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTradeSide("SELL")}
                            className={`font-mono text-[10px] tracking-[2px] py-3 uppercase font-bold text-center transition-all cursor-pointer ${
                              tradeSide === "SELL" ? "bg-red/10 text-red font-bold" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Short (SELL)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Margin size & leverage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Margin Sizing (USDT)</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={tradeSize}
                            onChange={(e) => setTradeSize(e.target.value)}
                            className="w-full bg-black border border-border text-xs text-foreground font-mono px-3 py-3 outline-none focus:border-primary rounded-md dark:bg-black light:bg-background"
                          />
                          <button
                            type="button"
                            onClick={() => setTradeSize("2000")}
                            className="absolute right-3 top-3 text-[9px] font-mono text-primary font-bold hover:text-gold-light cursor-pointer"
                          >
                            TEST MAX
                          </button>
                        </div>
                        <span className="text-[8px] font-mono text-muted-foreground mt-1 block">Subject to dynamic AI Exposure filters.</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-muted-foreground uppercase">Order Leverage</span>
                          <span className="text-primary font-bold">{tradeLeverage}x</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="5"
                          value={tradeLeverage}
                          onChange={(e) => setTradeLeverage(parseInt(e.target.value))}
                          className="w-full accent-primary bg-black h-1 rounded-lg"
                        />
                        <span className="text-[8px] font-mono text-muted-foreground mt-1 block">Leverage limit capped dynamically by Shield rules.</span>
                      </div>
                    </div>

                    {/* Place Order Solid Button */}
                    <button
                      type="submit"
                      className="w-full font-mono text-[10px] tracking-[2px] py-4 uppercase font-bold transition-all bg-primary text-primary-foreground hover:bg-gold-light rounded-md shadow-[0_4px_12px_rgba(201,168,76,0.15)] flex items-center justify-center gap-2 cursor-pointer outline-none"
                    >
                      <Zap className="w-4 h-4" /> Place Manual Router Order
                    </button>

                  </form>
                </div>

                {/* Connected exchange accounts */}
                <div className="border border-border bg-card p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="block w-4 h-px bg-primary" />
                      <h3 className="font-heading text-lg tracking-[2px] uppercase">Exchange API Gateways</h3>
                    </div>
                    <button
                      onClick={() => setShowApiModal(true)}
                      className="font-mono text-[9px] text-primary hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
                    >
                      <Plus className="w-3.5 h-3.5" /> Link New Gateway
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {apiKeys.map((key, i) => (
                      <div key={i} className="border border-border bg-background p-4 font-mono text-xs rounded-md">
                        <div className="flex justify-between items-center pb-2 border-b border-border mb-3">
                          <span className="font-bold text-foreground">{key.name}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                        </div>
                        <div className="space-y-1.5 text-[10px] text-muted-foreground uppercase">
                          <div>Type: <strong className="text-foreground">{key.type}</strong></div>
                          <div>Status: <strong className="text-green">{key.status}</strong></div>
                          <div className="truncate">Key Hash: <strong className="text-foreground">AES256//0x81fa...</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connected Telemetry simulator console and Liquidators */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Websocket Logger */}
                <div className="border border-border bg-black/90 dark:bg-black/90 light:bg-[#0c0c0c]/5 p-5 flex flex-col min-h-[300px] rounded-lg shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                    <span className="font-mono text-[9px] tracking-[2px] text-primary uppercase font-bold">Secure Router Stream</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                  </div>

                  <div
                    ref={logContainerRef}
                    className="flex-1 overflow-y-auto font-mono text-[9px] leading-relaxed space-y-3 max-h-[240px] scrollbar-thin scrollbar-thumb-border pr-1"
                  >
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-2 items-start">
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

                {/* Emergency exit liquidator button */}
                <div className="border border-red/30 bg-[#120a0a] p-5 relative rounded-lg shadow-sm">
                  <span className="absolute -top-3.5 left-5 bg-[#120a0a] border border-red/30 px-3 text-red text-[9px] font-mono tracking-wider uppercase rounded-md">
                    â˜¢ SAFEGUARD TRIGGER
                  </span>
                  <p className="font-sans text-[10px] text-red/80 mb-4 leading-relaxed">
                    Trigger margin liquidator to close all open copies across connected broker accounts immediately.
                  </p>
                  <button
                    onClick={handleEmergencyLiquidation}
                    disabled={activeTrades.length === 0}
                    className={`w-full font-mono text-[9px] tracking-[2px] py-3.5 uppercase font-bold transition-all rounded-md cursor-pointer outline-none ${
                      activeTrades.length === 0
                        ? "bg-border/30 text-muted-foreground border border-border/40 cursor-not-allowed"
                        : "bg-red text-white hover:bg-red/80 shadow-[0_4px_12px_rgba(242,90,90,0.15)]"
                    }`}
                  >
                    â˜¢ Emergency Halt & Liquidate
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================
              TAB 3: NEWS FEED (ROUTING TRANSACTIONS AUDIT)
             ======================================================== */}
          {activeSubTab === "Activity" && (
            <div className="border border-border bg-card p-6 rounded-lg shadow-sm relative">
              
              {/* Header title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="block w-4 h-px bg-primary animate-pulse" />
                  <h3 className="font-heading text-lg tracking-[2px] uppercase text-foreground">Signals Transactions Audit</h3>
                </div>
                
                {/* Filters row */}
                <div className="flex gap-2">
                  {["ALL", "APPROVED", "BLOCKED"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setActivityFilter(f)}
                      className={`font-mono text-[9px] tracking-wider uppercase px-3 py-1.5 border rounded-md transition-all cursor-pointer outline-none ${
                        activityFilter === f
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search query box */}
              <div className="relative mb-6">
                <span className="absolute left-3.5 top-3.5 text-muted-foreground">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search by instrument or provider..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="w-full bg-black border border-border text-xs text-foreground font-mono pl-10 pr-4 py-3 outline-none focus:border-primary rounded-md dark:bg-black light:bg-background"
                />
              </div>

              {/* Signals logs table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border pb-3 uppercase text-[9px] tracking-wider">
                      <th className="pb-3">Time</th>
                      <th className="pb-3">Provider</th>
                      <th className="pb-3">Symbol</th>
                      <th className="pb-3 text-center">Side</th>
                      <th className="pb-3 text-center">Leverage / Size</th>
                      <th className="pb-3 text-right">Validation Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSignals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs uppercase tracking-widest">
                          No logs found matching your query criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredSignals.map((sig, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 text-muted-foreground">[{sig.time}]</td>
                          <td className="py-3 font-bold text-foreground">@{sig.provider}</td>
                          <td className="py-3 text-foreground font-bold">{sig.symbol}</td>
                          <td className="py-3 text-center">
                            <span className={`px-1.5 py-0.5 text-[9px] border font-bold ${
                              sig.side === "BUY" ? "text-green border-green/30 bg-green/5" : "text-red border-red/30 bg-red/5"
                            }`}>
                              {sig.side}
                            </span>
                          </td>
                          <td className="py-3 text-center text-muted-foreground">{sig.leverage}x // ${sig.size}</td>
                          <td className="py-3 text-right">
                            <div className="flex flex-col items-end">
                              <span className={`text-[10px] font-bold ${
                                sig.status === "APPROVED" ? "text-green" : "text-red"
                              }`}>
                                {sig.status === "APPROVED" ? "ðŸŸ¢ APPROVED" : "ðŸ›¡ï¸ BLOCKED"}
                              </span>
                              <span className="text-[8px] text-muted-foreground mt-0.5 leading-relaxed max-w-[280px]">
                                {sig.reason}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 4: COPY TRADE (LEADERBOARD CHANNELS)
             ======================================================== */}
          {activeSubTab === "Compete" && (
            <div className="border border-border bg-card p-6 rounded-lg shadow-sm relative">
              <div className="flex items-center gap-3 pb-6 mb-6 border-b border-border">
                <span className="block w-4 h-px bg-primary animate-pulse" />
                <h3 className="font-heading text-lg tracking-[2px] uppercase text-foreground">Champions Leaderboard</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border pb-3 uppercase text-[9px] tracking-wider">
                      <th className="pb-3 text-center">Rank</th>
                      <th className="pb-3">Provider</th>
                      <th className="pb-3">Market Archetype</th>
                      <th className="pb-3 text-center">Followers</th>
                      <th className="pb-3 text-center">ROI Yield (30D)</th>
                      <th className="pb-3 text-center">Win Streak</th>
                      <th className="pb-3 text-right">Mirror Connection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { rank: "01", name: "Elvis", avatar: "💼", market: "Crypto SMC Order Block", followers: "196 / 200", roi: "+110%", winrate: "88%", streak: "9 Wins", aum: "$1.3M" },
                      { rank: "02", name: "Nancy", avatar: "⚡", market: "Synthetics Low-Latency Scalp", followers: "110 / 150", roi: "+142%", winrate: "91%", streak: "14 Wins", aum: "$45.5K" },
                      { rank: "03", name: "Larry", avatar: "🔮", market: "Forex Institutional Liquidity", followers: "190 / 200", roi: "+85%", winrate: "82%", streak: "4 Wins", aum: "$31.4K" },
                      { rank: "04", name: "Alpha_Strategist", avatar: "🔥", market: "Multi-Asset Momentum Grid", followers: "85 / 100", roi: "+76%", winrate: "78%", streak: "3 Wins", aum: "$120.0K" },
                      { rank: "05", name: "SMC_Sniper", avatar: "💀", market: "Deriv Synthetics Smart Money", followers: "50 / 80", roi: "+92%", winrate: "85%", streak: "6 Wins", aum: "$15.8K" },
                    ].map((lead, i) => {
                      const isCurrentlyCopying = copiedProviders.includes(lead.name);
                      return (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="py-4 text-center font-bold text-primary">#{lead.rank}</td>
                          <td className="py-4 font-bold text-foreground">
                            <span className="mr-2 text-base">{lead.avatar}</span>
                            {lead.name}
                          </td>
                          <td className="py-4 text-muted-foreground">{lead.market}</td>
                          <td className="py-4 text-center font-bold text-foreground">{lead.followers}</td>
                          <td className="py-4 text-center text-green font-bold">{lead.roi}</td>
                          <td className="py-4 text-center text-primary font-bold">{lead.streak}</td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleToggleCopyProvider(lead.name)}
                              className={`font-mono text-[9px] tracking-wider uppercase px-4 py-2 rounded-md font-bold transition-all cursor-pointer outline-none ${
                                isCurrentlyCopying
                                  ? "bg-red text-white hover:bg-red/80"
                                  : "bg-[#3ecf8e] text-black hover:bg-[#3ecf8e]/80"
                              }`}
                            >
                              {isCurrentlyCopying ? "Stop" : "Mirror"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 5: GUIDE (EXNESS SETUP + AFFILIATE PROGRAM)
             ======================================================== */}
          {activeSubTab === "Referrals" && (
            <div className="space-y-8">

              {/* â”€â”€ EXNESS FOREX COPY TRADING SETUP GUIDE â”€â”€ */}
              <div className="border border-border bg-card p-6 rounded-lg relative shadow-sm">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border">
                  <span className="block w-4 h-px bg-primary" />
                  <h3 className="font-heading text-lg tracking-[2px] uppercase">Exness Forex Copy Trading Setup</h3>
                  <span className="font-mono text-[8px] tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md font-bold">Forex Guide</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-sans">
                  Follow these steps to connect your Exness account for automated Forex copy trading via our signal mirroring router. This is the recommended broker for our Forex vertical.
                </p>

                {/* Step-by-step cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      step: "01",
                      title: "Verify Your Exness Account",
                      description: "Complete full KYC verification on your Exness Personal Area. This is mandatory â€” without it, you cannot access copy trading or withdraw funds.",
                      badge: "Required",
                      badgeColor: "text-red border-red/30 bg-red/5",
                    },
                    {
                      step: "02",
                      title: "Download Copy Trading App",
                      description: "Download the official Exness Copy Trading app from the App Store or Google Play. Log in using your existing Exness Personal Area email and password.",
                      badge: "Mobile",
                      badgeColor: "text-primary border-primary/30 bg-primary/5",
                    },
                    {
                      step: "03",
                      title: "Fund Your Investment Wallet",
                      description: "The Investment Wallet is separate from your standard MT4/MT5 accounts. Fund this wallet specifically â€” it's where your capital sits before copying strategies.",
                      badge: "Important",
                      badgeColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5",
                    },
                    {
                      step: "04",
                      title: "Start Copying a Strategy",
                      description: "Navigate to the Strategy section, review available providers â€” study their statistics, trading style, and historical performance. Click \"Start Copying\" to connect.",
                      badge: "Final Step",
                      badgeColor: "text-green border-green/30 bg-green/5",
                    },
                  ].map((item) => (
                    <div key={item.step} className="border border-border bg-background p-5 rounded-lg hover:border-primary/40 transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-heading text-2xl font-bold text-primary/30">{item.step}</span>
                          <h4 className="font-sans text-xs font-bold text-foreground">{item.title}</h4>
                        </div>
                        <span className={`font-mono text-[7px] tracking-wider uppercase px-2 py-0.5 rounded-md font-bold border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Important notes */}
                <div className="mt-6 p-4 border border-primary/20 bg-primary/5 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="font-mono text-[10px] text-muted-foreground leading-relaxed space-y-1.5">
                      <p><strong className="text-foreground">Important:</strong> The Exness Copy Trading app uses an Investment Wallet that is entirely separate from your MT4/MT5 trading accounts. Ensure you deposit funds into the correct wallet before attempting to copy any strategy.</p>
                      <p>For questions about Exness account verification or wallet funding, visit the <span className="text-primary font-bold">Exness Help Center</span> or contact our Telegram support channel.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* â”€â”€ AFFILIATE REFERRAL PROGRAM â”€â”€ */}

              {/* Metrics affiliates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border/60 border border-border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-card p-5">
                  <div className="font-mono text-[8px] tracking-[2px] text-muted-foreground uppercase">Affiliate Partners</div>
                  <div className="font-heading text-xl text-foreground font-bold mt-1.5">12 Members</div>
                </div>

                <div className="bg-card p-5">
                  <div className="font-mono text-[8px] tracking-[2px] text-muted-foreground uppercase">Commission Earned</div>
                  <div className="font-heading text-xl text-green font-bold mt-1.5">$2,430.50 USDT</div>
                </div>

                <div className="bg-card p-5">
                  <div className="font-mono text-[8px] tracking-[2px] text-muted-foreground uppercase">Active Rank Tier</div>
                  <div className="font-heading text-xl text-primary font-bold mt-1.5">Gold Router</div>
                </div>
              </div>

              {/* Referral Link Generator card */}
              <div className="border border-border bg-card p-6 relative rounded-lg shadow-sm">
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
                  <span className="block w-4 h-px bg-primary" />
                  <h3 className="font-heading text-lg tracking-[2px] uppercase">Unique Affiliate Channel</h3>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  Earn up to 15% recurring commission payouts on all vault deposit fees and trade settlement parameters from users you refer.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-black/60 border border-border px-4 py-3 text-xs font-mono text-muted-foreground rounded-md flex items-center justify-between dark:bg-black/60 light:bg-background">
                    <span>https://trufunder.com/ref/0x034553c53244fe3555829224d</span>
                    <span className="text-[10px] text-primary select-none">Secure SSL</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="font-mono text-[10px] tracking-[2px] uppercase bg-primary text-primary-foreground px-6 py-3 font-bold hover:bg-gold-light transition-all rounded-md flex items-center justify-center gap-2 cursor-pointer outline-none"
                  >
                    <Copy className="w-3.5 h-3.5" /> {refCopied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Commissions distributions list */}
              <div className="border border-border bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                  <h4 className="font-heading text-base tracking-wider uppercase text-foreground">Recent Commission Yields</h4>
                  <span className="font-mono text-[9px] text-muted-foreground">Updated in real-time</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border pb-3 uppercase text-[9px] tracking-wider">
                        <th className="pb-3">Partner Hash</th>
                        <th className="pb-3">Referral Rank</th>
                        <th className="pb-3">Volume Deposited</th>
                        <th className="pb-3 text-right">Commission (USDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { hash: "0x82f1...19a2", rank: "Silver", volume: "$10,000", reward: "+$150.00" },
                        { hash: "0xe294...cf3b", rank: "Bronze", volume: "$5,000", reward: "+$75.00" },
                        { hash: "0x19cf...fa12", rank: "Gold", volume: "$25,000", reward: "+$375.00" },
                        { hash: "0x4012...88cc", rank: "Bronze", volume: "$2,000", reward: "+$30.00" },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 text-foreground font-bold">{item.hash}</td>
                          <td className="py-3 text-primary">{item.rank} Member</td>
                          <td className="py-3 text-muted-foreground">{item.volume} USDT</td>
                          <td className="py-3 text-right text-green font-bold">{item.reward}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 6: SETTINGS (RISK SAFEGUARDS PANEL & FAUCETS)
             ======================================================== */}
          {activeSubTab === "Settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Deposit parameters */}
              <div className="lg:col-span-8 space-y-6">

                {/* ── PROFILE EDITOR ── */}
                <div className="border border-border bg-card p-6 rounded-lg relative shadow-sm">
                  <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border">
                    <span className="block w-4 h-px bg-primary" />
                    <h3 className="font-heading text-lg tracking-[2px] uppercase text-foreground">User Profile Settings</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block font-bold">Display Name</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-black border border-border text-xs text-foreground font-mono px-4 py-3 outline-none focus:border-primary rounded-md dark:bg-black light:bg-background"
                          placeholder="e.g. Jordan Smith"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block font-bold">Profile Avatar (Emoji)</label>
                        <select
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="w-full bg-black border border-border text-xs text-foreground font-mono px-4 py-3 outline-none focus:border-primary rounded-md dark:bg-black light:bg-background"
                        >
                          <option value="👤">👤 Classic User</option>
                          <option value="🦊">🦊 Neon Fox</option>
                          <option value="⚡">⚡ Speed Trader</option>
                          <option value="🤖">🤖 Algo Bot</option>
                          <option value="🦁">🦁 Lion Bull</option>
                          <option value="👑">👑 Gold Maker</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-[9px] font-mono text-muted-foreground uppercase">Changes are automatically saved and synced to your database.</p>
                  </div>
                </div>
              
                {/* wUSDT Collateral Faucet deposit */}
                <div className="border border-border bg-card p-6 rounded-lg relative shadow-sm">
                  
                  {/* Tabs Deposit / Withdraw */}
                  <div className="grid grid-cols-2 gap-px bg-border border border-border mb-6 rounded-md">
                    {["Deposit", "Withdraw"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setDepositTab(tab)}
                        className={`font-mono text-[10px] tracking-[2px] uppercase py-3 font-bold transition-all text-center rounded-md cursor-pointer outline-none ${
                          depositTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground bg-transparent"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleDepositSubmit} className="space-y-5">
                    
                    {/* Available balance check info */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground border-b border-border pb-2">
                      <span>Available to Deposit</span>
                      <span className="text-foreground">$10,000.00 wUSDT</span>
                    </div>

                    {/* Amount input block */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-muted-foreground uppercase">Amount</span>
                        <button
                          type="button"
                          onClick={() => setDepositAmount("10000")}
                          className="text-primary font-bold hover:text-gold-light cursor-pointer bg-transparent border-0 outline-none"
                        >
                          MAX
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="0.00 USDT"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-black border border-border text-xs text-foreground font-mono px-3 py-3 outline-none focus:border-primary rounded-md dark:bg-black light:bg-background"
                      />
                    </div>

                    {/* Locking period range selector widget */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-muted-foreground uppercase">Locking Period</span>
                        <span className="text-primary font-bold">{lockingPeriod} Days</span>
                      </div>
                      <input
                        type="range"
                        min="7"
                        max="360"
                        step="7"
                        value={lockingPeriod}
                        onChange={(e) => setLockingPeriod(parseInt(e.target.value))}
                        className="w-full accent-primary bg-black h-1 rounded-lg"
                      />
                    </div>

                    {/* Statistical status lines */}
                    <div className="space-y-2.5 pt-3 font-mono text-[9px] uppercase text-muted-foreground">
                      <div className="flex justify-between items-center">
                        <span>Lock Boost</span>
                        <span className="text-foreground font-bold">12%</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-border pt-2.5">
                        <span>You will receive</span>
                        <span className="text-green font-bold font-sans text-xs">
                          {depositAmount ? `${(parseFloat(depositAmount) * 1.12).toFixed(2)}` : "0"} USDT
                        </span>
                      </div>
                    </div>

                    {/* Deposit solid button */}
                    <button
                      type="submit"
                      className="w-full font-mono text-[10px] tracking-[2px] py-4 uppercase font-bold transition-all bg-[#3ecf8e] text-black hover:bg-[#3ecf8e]/80 rounded-md shadow-[0_4px_12px_rgba(62,207,142,0.12)] cursor-pointer outline-none"
                    >
                      Deposit Collateral
                    </button>

                  </form>
                </div>
              </div>

              {/* Right Column: AI Safeguards details */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* AI Safeguards settings */}
                <div className="border border-border bg-card p-6 rounded-lg shadow-sm">
                  
                  {/* Tabs About / Performance info */}
                  <div className="grid grid-cols-2 gap-px bg-border border border-border mb-6 rounded-md">
                    {["About", "Performance"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setAboutTab(tab)}
                        className={`font-mono text-[10px] tracking-[2px] uppercase py-2.5 font-bold transition-all text-center rounded-md cursor-pointer outline-none ${
                          aboutTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground bg-transparent"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {aboutTab === "About" ? (
                    <div className="space-y-5">
                      <div className="font-mono text-[9px] tracking-wider text-primary uppercase font-bold flex items-center gap-1.5">
                        <Shield className="w-4 h-4" /> AI Risk Safeguards
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-muted-foreground uppercase">Leverage Cap</span>
                          <span className="text-foreground font-bold">{maxLeverageCap}x</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="5"
                          value={maxLeverageCap}
                          onChange={(e) => setMaxLeverageCap(parseInt(e.target.value))}
                          className="w-full accent-primary bg-black h-1 rounded-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-muted-foreground uppercase">Slippage Cushion</span>
                          <span className="text-foreground font-bold">{(slippageLimitPercent * 100).toFixed(2)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="0.5"
                          step="0.05"
                          value={slippageLimitPercent}
                          onChange={(e) => setSlippageLimitPercent(parseFloat(e.target.value))}
                          className="w-full accent-primary bg-black h-1 rounded-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-muted-foreground uppercase">Max Margin Size</span>
                          <span className="text-foreground font-bold">${maxPositionSizeUsdt}</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="2000"
                          step="100"
                          value={maxPositionSizeUsdt}
                          onChange={(e) => setMaxPositionSizeUsdt(parseInt(e.target.value))}
                          className="w-full accent-primary bg-black h-1 rounded-lg"
                        />
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold font-sans">Institutional SMC Filter</div>
                          <div className="font-mono text-[8px] text-muted-foreground mt-0.5 uppercase">Skip low liquidity spikes.</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOrderBlockFilterEnabled(!orderBlockFilterEnabled)}
                          className={`font-mono text-[9px] px-3 py-1 border transition-all uppercase rounded-md cursor-pointer outline-none ${
                            orderBlockFilterEnabled
                              ? "border-green/30 text-green bg-green/5 font-bold"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {orderBlockFilterEnabled ? "ON" : "OFF"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Latency and Profit metrics */}
                      <div className="grid grid-cols-2 gap-4 font-mono text-center">
                        <div className="border border-border p-3 bg-black/20 dark:bg-black/20 light:bg-background">
                          <div className="text-[8px] text-muted-foreground uppercase tracking-widest">Routing Ping</div>
                          <div className="text-xs text-green font-bold mt-1">{latency}ms</div>
                        </div>
                        <div className="border border-border p-3 bg-black/20 dark:bg-black/20 light:bg-background">
                          <div className="text-[8px] text-muted-foreground uppercase tracking-widest">Shield Yield</div>
                          <div className="text-xs text-primary font-bold mt-1">+{totalProfit}%</div>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                        TruFunderâ€™s mirror engine performs visual signal parsing through a dedicated Telegram websocket, validating order triggers against institutional liquidity blocks prior to execution.
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          </div>

          {/* Right Panel View Sidebar (opens dynamically on larger screens) */}
          {dashboardView === "panel" && (
            <aside className="w-[340px] border-l border-border bg-card/40 backdrop-blur-md p-6 hidden xl:flex flex-col justify-between shrink-0 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">SMC Telemetry</h4>
                  </div>
                  <button 
                    onClick={() => setDashboardView("default")}
                    className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors cursor-pointer outline-none"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* AI Safeguard Shield Status */}
                <div className="border border-border/80 bg-background/50 p-4 rounded-lg space-y-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">AI Safeguard</span>
                    <span className="font-mono text-[9px] text-green font-bold uppercase tracking-widest">Shield: Active</span>
                  </div>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                    <div className="bg-green h-full w-[94%]" />
                  </div>
                  <div className="font-sans text-[10px] text-muted-foreground leading-normal">
                    Risk allocation limits set to <strong>1% per trade</strong>. Master replication slippage threshold: <strong>2.5ms</strong>.
                  </div>
                </div>

                {/* Live Order Blocks Parsing logs */}
                <div className="space-y-3">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider block">Signal stream terminal</span>
                  
                  <div className="space-y-2 max-h-[260px] overflow-y-auto font-mono text-[9px] leading-relaxed divide-y divide-border/40 bg-[#0c0c0c] text-green p-3 rounded border border-border/50 shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]">
                    <div className="pt-2 text-green/90">
                      [21:40:02] PARSED // BUY BYBIT BTCUSDT @ $67,234.10
                    </div>
                    <div className="pt-2 text-green/90">
                      [21:42:15] REPLICATED // SLIPPAGE: +1.2ms
                    </div>
                    <div className="pt-2 text-muted-foreground">
                      [21:44:50] MONITORING // EVA JAMES ACTIVE POSITION
                    </div>
                    <div className="pt-2 text-yellow-500">
                      [21:48:10] RISK GATE // BLOCK MARGIN LIMIT OK
                    </div>
                    <div className="pt-2 text-[#c9a84c]">
                      [21:50:33] SYNC // ACCOUNT EQUITY +$45.20 PNL
                    </div>
                  </div>
                </div>

                {/* Instant Safeguard Switch */}
                <div className="border border-red/20 bg-red/5 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-red font-bold uppercase tracking-wider">Safe Mode</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                  </div>
                  <p className="font-sans text-[10px] text-muted-foreground leading-normal">
                    Force automatic exit on all copied positions if equity drawdowns exceed 5% across any exchange.
                  </p>
                  <button className="w-full font-mono text-[9px] uppercase tracking-wider font-bold bg-red text-white py-2.5 rounded-md hover:bg-red/80 transition-all cursor-pointer outline-none">
                    Arm Emergency Stop
                  </button>
                </div>

              </div>

              {/* Footer status */}
              <div className="pt-4 border-t border-border flex items-center justify-between font-mono text-[8px] text-muted-foreground tracking-wider mt-6">
                <span>BUFFER: 100MB</span>
                <span>NODE: 0xAesw</span>
              </div>
            </aside>
          )}

        </div>

        {/* â”€â”€ FOOTER BAR â”€â”€ */}
        <footer className="border-t border-border px-8 py-5 flex items-center justify-between flex-wrap gap-4 bg-card/40 mt-auto">
          <div className="font-heading text-base tracking-[3px] text-primary">
            TRUFUNDER
          </div>
          <div className="font-mono text-[9px] tracking-[1px] text-muted-foreground uppercase">
            Â© 2026 TruFunder Â· sandboxed replication engine Â· not financial advice
          </div>
        </footer>

      </main>

      {/* â”€â”€ 3. BROKER CONNECT MODAL â”€â”€ */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
          <div className="bg-card border border-border max-w-md w-full p-8 relative rounded-md shadow-2xl">
            <button
              onClick={() => setShowApiModal(false)}
              className="absolute top-4 right-4 font-mono text-muted-foreground hover:text-foreground text-xs cursor-pointer bg-transparent border-0 outline-none"
            >
              [X] Close
            </button>

            <h3 className="font-heading text-2xl tracking-[2px] text-foreground mb-2">Connect Secure API Key</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-sans">
              Connect your exchange key with withdrawal capabilities disabled. API credentials are encrypted with AES-256 standards.
            </p>

            <form onSubmit={handleAddApiKeys} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Select Target Exchange</label>
                <select
                  value={selectedExchange}
                  onChange={(e) => setSelectedExchange(e.target.value)}
                  className="w-full bg-black border border-border text-xs text-foreground font-mono px-3 py-3 outline-none focus:border-primary dark:bg-black light:bg-background rounded-md"
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
                  className="w-full bg-black border border-border text-xs text-foreground font-mono px-3 py-3 outline-none focus:border-primary dark:bg-black light:bg-background rounded-md"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block">Secure API signature</label>
                <input
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="w-full bg-black border border-border text-xs text-foreground font-mono px-3 py-3 outline-none focus:border-primary dark:bg-black light:bg-background rounded-md"
                  required
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 font-mono text-[10px] tracking-[2px] uppercase bg-primary text-primary-foreground py-3 hover:bg-gold-light transition-all cursor-pointer outline-none rounded-md font-bold"
                >
                  Confirm Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => setShowApiModal(false)}
                  className="flex-1 font-mono text-[10px] tracking-[2px] uppercase bg-[#1a1a1a] text-muted-foreground py-3 hover:text-foreground transition-all cursor-pointer outline-none rounded-md"
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

