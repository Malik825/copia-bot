"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Shield, 
  Zap, 
  Coins, 
  Check, 
  X, 
  TrendingUp, 
  Activity, 
  Search, 
  Filter, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  Star, 
  BarChart2, 
  LogOut,
  Sliders,
  Bell
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

// Define Types for Admin Dashboard
interface UserAccount {
  id: string;
  email: string;
  plan: "Free" | "Starter" | "Pro" | "Enterprise";
  connectedKeys: number;
  joinedDate: string;
  status: "active" | "suspended";
}

interface PendingPayment {
  id: string;
  userEmail: string;
  plan: string;
  billingCycle: string;
  amount: number;
  method: "momo" | "crypto";
  details: string; // e.g., TxID or Tx hash
  senderNumber?: string;
  timestamp: string;
  status: "pending" | "approved" | "declined";
}

interface ProviderConfig {
  id: string;
  name: string;
  avatar: string;
  market: "Crypto" | "Forex" | "Deriv";
  winRate: number;
  stars: number;
  aum: number;
  mdd: number; // Max Drawdown
  status: "active" | "paused";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "payments" | "providers">("overview");
  
  // Real-time system logs
  const [logs, setLogs] = useState([
    { time: new Date().toTimeString().split(" ")[0], message: "SYSTEM SECURE // Admin panel initialized.", type: "info" },
  ]);

  // Live database state for managing Users (fetched from Supabase)
  const [users, setUsers] = useState<UserAccount[]>([]);

  // Live database state for managing Payments (fetched from Supabase invoices table)
  const [payments, setPayments] = useState<PendingPayment[]>([]);

  // Platform Copy Providers (admin-managed, kept locally for now)
  const [providers, setProviders] = useState<ProviderConfig[]>([
    { id: "prov-01", name: "Martin", avatar: "🪐", market: "Crypto", winRate: 88, stars: 196, aum: 1313234.78, mdd: 7.31, status: "active" },
    { id: "prov-02", name: "Larry", avatar: "🔮", market: "Forex", winRate: 82, stars: 190, aum: 31432.54, mdd: 14.50, status: "active" },
    { id: "prov-03", name: "Nancy", avatar: "⚡", market: "Deriv", winRate: 91, stars: 110, aum: 45543.84, mdd: 30.20, status: "active" }
  ]);

  // Search/Filters states
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("pending");

  // New Provider form state
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [newProvName, setNewProvName] = useState("");
  const [newProvMarket, setNewProvMarket] = useState<"Crypto" | "Forex" | "Deriv">("Crypto");
  const [newProvWinRate, setNewProvWinRate] = useState("85");
  const [newProvAum, setNewProvAum] = useState("50000");

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const validEmails = ["raedax77@gmail.com", "superadmin@raedax.com"];
      if (user && user.email && validEmails.includes(user.email.toLowerCase())) {
        // Hydrate sessionStorage for compatibility
        sessionStorage.setItem("admin_email", user.email.toLowerCase());
        sessionStorage.setItem("admin_token", "admin-session-verified");
        setAuthorized(true);
      } else {
        // Check sessionStorage fallback
        const sessionEmail = sessionStorage.getItem("admin_email");
        const sessionToken = sessionStorage.getItem("admin_token");
        if (sessionEmail && validEmails.includes(sessionEmail) && sessionToken === "admin-session-verified") {
          setAuthorized(true);
        } else {
          router.push("/signin");
        }
      }
    };

    checkAuth();
  }, [router]);

  // Fetch real invoices from Supabase
  useEffect(() => {
    if (!authorized) return;
    const fetchData = async () => {
      const supabase = createClient();

      const sessionEmail = sessionStorage.getItem("admin_email");
      const isSuperAdmin = sessionEmail === "superadmin@raedax.com";

      // SuperAdmin doesn't need to load user auth directory
      if (!isSuperAdmin) {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (!authError && authUsers?.users) {
          const mappedUsers: UserAccount[] = authUsers.users.map((u: any) => ({
            id: u.id,
            email: u.email || "unknown",
            plan: "Free" as const,
            connectedKeys: 0,
            joinedDate: new Date(u.created_at).toLocaleDateString(),
            status: "active" as const,
          }));
          setUsers(mappedUsers);
          addLog(`DB LINK // Loaded ${mappedUsers.length} registered users from Supabase Auth.`, "success");
        } else {
          addLog(`AUTH NOTE // Admin user listing requires service role. Showing invoiced users.`, "warning");
        }
      }

      // --- Fetch real invoices ---
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        addLog(`DB ERROR // Failed to fetch invoices: ${error.message}`, "error");
        return;
      }

      if (data) {
        const dbPayments = data.map((inv: any) => {
          const isCrypto = inv.provider_id?.startsWith("CRYPTO_TX:");
          const isMomo = inv.provider_id?.startsWith("MOMO_TX:");
          let methodStr = inv.provider_id ? "crypto" : "momo";
          let detailsStr = inv.provider_id ? `Ref: ${inv.provider_id}` : "Local MoMo";
          let senderNumber = undefined;

          if (isCrypto) {
            methodStr = "crypto";
            detailsStr = `TxID: ${inv.provider_id.replace("CRYPTO_TX:", "")}`;
          } else if (isMomo) {
            methodStr = "momo";
            const parts = inv.provider_id.split("_NUM:");
            detailsStr = `Ref: ${parts[0].replace("MOMO_TX:", "")}`;
            if (parts.length > 1) senderNumber = parts[1];
          }

          return {
            id: inv.id,
            userEmail: inv.user_id,
            plan: inv.plan_name,
            billingCycle: inv.billing_cycle,
            amount: parseFloat(inv.amount),
            method: methodStr as any,
            details: detailsStr,
            senderNumber: senderNumber,
            timestamp: inv.created_at,
            status: (inv.status as "pending" | "approved" | "declined") ?? "pending"
          };
        });
        setPayments(dbPayments);
        addLog(`DB LINK // Loaded ${data.length} invoices from Supabase.`, "success");

        // Build a user list from invoice user_ids if auth listing was unavailable
        if (users.length === 0 && data.length > 0) {
          const invoiceUserIds = [...new Set(data.map((inv: any) => inv.user_id))];
          const fallbackUsers: UserAccount[] = invoiceUserIds.map((uid: string, idx: number) => ({
            id: uid,
            email: uid,
            plan: "Free" as const,
            connectedKeys: 0,
            joinedDate: "—",
            status: "active" as const,
          }));
          setUsers(fallbackUsers);
        }
      }
    };

    fetchData();
  }, [authorized]);

  // Trigger System Log helper
  const addLog = (message: string, type: "success" | "warning" | "info" | "error" = "info") => {
    const time = new Date().toTimeString().split(" ")[0];
    setLogs(prev => [...prev, { time, message, type }]);
  };

  // Admin Actions: Approve MoMo or Crypto Invoice manually
  const handleApprovePayment = async (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("invoices")
      .update({ status: "approved" })
      .eq("id", paymentId);

    if (error) {
      addLog(`DB UPDATE ERROR // Failed to approve payment: ${error.message}`, "error");
      return;
    }

    // Update payment status
    setPayments(prev => 
      prev.map(p => p.id === paymentId ? { ...p, status: "approved" as const } : p)
    );

    // Automatically upgrade the corresponding user's tier
    const mappedPlan = payment.plan.includes("Pro") ? "Pro" : payment.plan.includes("Enterprise") ? "Enterprise" : "Starter";
    setUsers(prev => 
      prev.map(u => u.email === payment.userEmail || u.id === payment.userEmail ? { ...u, plan: mappedPlan as any } : u)
    );

    addLog(`APPROVED // Successfully approved invoice ${paymentId} (Tier unlocked).`, "success");
  };

  const handleDeclinePayment = async (paymentId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("invoices")
      .update({ status: "declined" })
      .eq("id", paymentId);

    if (error) {
      addLog(`DB UPDATE ERROR // Failed to decline payment: ${error.message}`, "error");
      return;
    }

    setPayments(prev => 
      prev.map(p => p.id === paymentId ? { ...p, status: "declined" as const } : p)
    );
    addLog(`DECLINED // Declined payment transaction ID: ${paymentId}`, "error");
  };

  // Admin Actions: Modify User Sub Tier manually
  const handleChangeUserPlan = (userId: string, newPlan: any) => {
    setUsers(prev => 
      prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u)
    );
    const user = users.find(u => u.id === userId);
    addLog(`USER UPDATE // Manually adjusted ${user?.email}'s license tier to ${newPlan}.`, "info");
  };

  // Admin Actions: Toggle User Active/Suspended status
  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => 
      prev.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === "active" ? ("suspended" as const) : ("active" as const);
          addLog(`USER ACCOUNT STATUS // account ${u.email} status toggled to ${nextStatus.toUpperCase()}`, nextStatus === "active" ? "success" : "warning");
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Admin Actions: Toggle copy provider active status
  const handleToggleProviderStatus = (provId: string) => {
    setProviders(prev => 
      prev.map(p => {
        if (p.id === provId) {
          const nextStatus = p.status === "active" ? ("paused" as const) : ("active" as const);
          addLog(`PROVIDER STATE // Copy provider ${p.name} status updated to ${nextStatus.toUpperCase()}`, nextStatus === "active" ? "success" : "warning");
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  // Create new Signal Provider
  const handleCreateProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName) return;

    const newProvider: ProviderConfig = {
      id: "prov-" + Math.random().toString(36).substring(2, 5),
      name: newProvName,
      avatar: newProvMarket === "Crypto" ? "🪐" : newProvMarket === "Forex" ? "🔮" : "⚡",
      market: newProvMarket,
      winRate: parseInt(newProvWinRate) || 85,
      stars: Math.floor(Math.random() * 50) + 100,
      aum: parseFloat(newProvAum) || 25000,
      mdd: parseFloat((Math.random() * 8 + 4).toFixed(2)),
      status: "active"
    };

    setProviders(prev => [...prev, newProvider]);
    setShowAddProviderModal(false);
    setNewProvName("");
    addLog(`PROVIDER NEW // Registered new strategy provider: ${newProvName} under ${newProvMarket} routing.`, "success");
  };

  // Sign out admin
  const handleAdminLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.removeItem("admin_email");
    sessionStorage.removeItem("admin_token");
    router.push("/signin");
  };

  const currentEmail = typeof window !== "undefined" ? sessionStorage.getItem("admin_email") || "" : "";
  const isSuperAdmin = currentEmail === "superadmin@raedax.com";

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Verifying Admin clearance...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-foreground flex flex-col font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-6 pt-32 pb-16 flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* ========================================================
            ADMIN SIDEBAR
           ======================================================== */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <div className="p-6 rounded-xl border border-primary/20 bg-card/45 backdrop-blur-md space-y-6">
            
            {/* Header info */}
            <Link href="/dashboard" className="block p-3 rounded-lg border border-border/40 bg-background/30 hover:border-primary/50 transition-all group">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-mono text-[9px] tracking-[2px] uppercase text-red-400 font-bold border border-red-500/25 px-2 py-0.5 rounded bg-red-500/5">
                  {isSuperAdmin ? "Super Admin" : "Elvis Strategy"}
                </span>
              </div>
              <h3 className="font-heading text-base font-bold text-foreground mt-2 group-hover:text-primary transition-colors">
                {isSuperAdmin ? "Approvals Access" : "Elvis Control"}
              </h3>
              <p className="font-mono text-[10px] text-muted-foreground truncate group-hover:text-muted-foreground/80 transition-colors">{currentEmail}</p>
            </Link>

            {/* Sidebar Buttons */}
            <nav className="flex flex-col gap-1.5 font-mono text-[11px] uppercase tracking-wider">
              {!isSuperAdmin && (
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all flex items-center justify-between outline-none cursor-pointer border-0 ${
                    activeTab === "overview" 
                      ? "bg-primary text-primary-foreground font-bold shadow-md" 
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  <span>Overview</span>
                  <TrendingUp className="w-3.5 h-3.5" />
                </button>
              )}

              {!isSuperAdmin && (
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all flex items-center justify-between outline-none cursor-pointer border-0 ${
                    activeTab === "users" 
                      ? "bg-primary text-primary-foreground font-bold shadow-md" 
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  <span>User Directory</span>
                  <Users className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setActiveTab("payments")}
                className={`w-full text-left py-3 px-4 rounded-lg transition-all flex items-center justify-between outline-none cursor-pointer border-0 ${
                  (activeTab as string) === "payments" || isSuperAdmin
                    ? "bg-primary text-primary-foreground font-bold shadow-md" 
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                }`}
              >
                <span>Approvals</span>
                <Coins className="w-3.5 h-3.5" />
              </button>

              {!isSuperAdmin && (
                <button
                  onClick={() => setActiveTab("providers")}
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all flex items-center justify-between outline-none cursor-pointer border-0 ${
                    activeTab === "providers" 
                      ? "bg-primary text-primary-foreground font-bold shadow-md" 
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  <span>Providers & Trends</span>
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              )}
            </nav>

            <div className="pt-4 border-t border-border/50">
              <button
                onClick={handleAdminLogout}
                className="w-full font-mono text-[10px] tracking-[2px] uppercase py-3 border border-border hover:border-red-500 hover:text-red-400 bg-background/50 hover:bg-red-500/5 transition-all rounded-lg font-bold cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out Control
              </button>
            </div>

          </div>
        </aside>

        {/* ========================================================
            ADMIN WORKSPACE PANELS
           ======================================================== */}
        <main className="flex-1 flex flex-col gap-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && !isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 border border-border bg-card/30 backdrop-blur-md rounded-xl space-y-2">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest block">Total Traders</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-heading text-3xl font-bold">{users.length}</span>
                    <span className="font-mono text-[10px] text-green font-bold">+12% new</span>
                  </div>
                </div>
                
                <div className="p-5 border border-border bg-card/30 backdrop-blur-md rounded-xl space-y-2">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest block">Active Subscriptions</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-heading text-3xl font-bold">
                      {users.filter(u => u.plan !== "Free").length}
                    </span>
                    <span className="font-mono text-[10px] text-primary font-bold">
                      {Math.round((users.filter(u => u.plan !== "Free").length / users.length) * 100)}% ratio
                    </span>
                  </div>
                </div>

                <div className="p-5 border border-border bg-card/30 backdrop-blur-md rounded-xl space-y-2">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest block">Total Invoiced (USD)</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-heading text-3xl font-bold">
                      ${payments.filter(p => p.status === "approved").reduce((sum, p) => sum + p.amount, 0)}
                    </span>
                    <span className="font-mono text-[10px] text-green font-bold">USD Live</span>
                  </div>
                </div>

                <div className="p-5 border border-primary/30 bg-primary/5 rounded-xl space-y-2">
                  <span className="font-mono text-[9px] text-primary uppercase tracking-widest block">Pending Approvals</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-heading text-3xl font-bold text-primary">
                      {payments.filter(p => p.status === "pending").length}
                    </span>
                    <span className="font-mono text-[10px] text-primary font-bold animate-pulse">Needs Review</span>
                  </div>
                </div>
              </div>

              {/* Chart Mock & Signal Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Platform Growth overview */}
                <div className="p-6 border border-border bg-card/25 rounded-xl lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-base font-bold uppercase tracking-wider text-foreground">Platform Growth & PnL Trend</h4>
                    <span className="font-mono text-[9px] text-muted-foreground border border-border px-2 py-0.5 rounded">Real-time Feed</span>
                  </div>
                  <div className="h-48 border border-border/60 bg-background/50 rounded-lg flex items-center justify-center text-center p-4">
                    <div className="space-y-2">
                      <TrendingUp className="w-8 h-8 text-primary mx-auto animate-bounce" />
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">Dynamic Mirror Ledger Network Active</p>
                      <p className="font-sans text-xs text-foreground/80">Average latency: <span className="text-primary font-bold">12ms</span> · Signal Success Ratio: <span className="text-green font-bold">89.4%</span></p>
                    </div>
                  </div>
                </div>

                {/* System Audit logs */}
                <div className="p-6 border border-border bg-card/25 rounded-xl space-y-4 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-base font-bold uppercase tracking-wider text-foreground">Audit Log Stream</h4>
                    <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                  </div>

                  <div className="flex-1 bg-background/45 border border-border/80 rounded-lg p-4 font-mono text-[10px] space-y-3 overflow-y-auto max-h-40">
                    {logs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-muted-foreground shrink-0">{log.time}</span>
                        <span className={`font-bold shrink-0 ${
                          log.type === "success" ? "text-green" : log.type === "error" ? "text-red-400" : "text-primary"
                        }`}>
                          [{log.type.toUpperCase()}]
                        </span>
                        <span className="text-foreground/90">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: USER DIRECTORY */}
          {activeTab === "users" && !isSuperAdmin && (
            <div className="p-6 border border-border bg-card/25 rounded-xl space-y-6 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase tracking-wide">Traders Ledger</h3>
                  <p className="text-xs text-muted-foreground mt-1">Manage standard user accounts, connection capacities, and subscription plans.</p>
                </div>

                {/* Filter and Search Inputs */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search traders..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="bg-background border border-border/85 rounded-lg pl-9 pr-4 py-2 text-xs font-mono focus:border-primary focus:outline-none text-foreground w-48"
                    />
                  </div>

                  <div className="flex items-center gap-2 border border-border bg-background px-3 py-2 rounded-lg">
                    <Filter className="w-3.5 h-3.5 text-primary" />
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="bg-transparent border-0 text-xs font-mono outline-none text-foreground cursor-pointer"
                    >
                      <option value="all">All Plans</option>
                      <option value="Free">Free</option>
                      <option value="Starter">Starter</option>
                      <option value="Pro">Pro</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users table */}
              <div className="overflow-x-auto border border-border rounded-lg bg-background/50">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border bg-background text-[10px] text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">User Account</th>
                      <th className="p-4">Registration</th>
                      <th className="p-4">Active Plan</th>
                      <th className="p-4">Linked Keys</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {users
                      .filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase()))
                      .filter(u => userFilter === "all" || u.plan === userFilter)
                      .map((user) => (
                        <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-foreground font-sans">{user.email}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">UID: {user.id}</div>
                          </td>
                          <td className="p-4 text-muted-foreground">{user.joinedDate}</td>
                          <td className="p-4">
                            <select
                              value={user.plan}
                              onChange={(e) => handleChangeUserPlan(user.id, e.target.value as any)}
                              className="bg-background border border-border/80 text-xs font-mono p-1 rounded outline-none text-foreground font-bold cursor-pointer"
                            >
                              <option value="Free">Free</option>
                              <option value="Starter">Starter</option>
                              <option value="Pro">Pro</option>
                              <option value="Enterprise">Enterprise</option>
                            </select>
                          </td>
                          <td className="p-4 font-bold text-primary">{user.connectedKeys} API Keys</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              user.status === "active" ? "bg-green/10 text-green border border-green/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`font-mono text-[9px] uppercase font-bold px-3 py-1.5 rounded transition-all cursor-pointer outline-none border-0 ${
                                user.status === "active" 
                                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                                  : "bg-green/10 text-green hover:bg-green/20"
                              }`}
                            >
                              {user.status === "active" ? "Suspend Account" : "Activate Account"}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: PAYMENT APPROVALS */}
          {activeTab === "payments" && (
            <div className="p-6 border border-border bg-card/25 rounded-xl space-y-6 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase tracking-wide">Manual Billing Ledger</h3>
                  <p className="text-xs text-muted-foreground mt-1">Review, approve, and verify local Mobile Money (MoMo) payments and Crypto webhooks.</p>
                </div>

                <div className="flex items-center gap-2 border border-border bg-background px-3 py-2 rounded-lg shrink-0">
                  <Filter className="w-3.5 h-3.5 text-primary" />
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="bg-transparent border-0 text-xs font-mono outline-none text-foreground cursor-pointer"
                  >
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              </div>

              {/* Payments Ledger table */}
              <div className="overflow-x-auto border border-border rounded-lg bg-background/50">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border bg-background text-[10px] text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">Sender Profile</th>
                      <th className="p-4">Requested Tier</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Ledger Ref / TxID</th>
                      {!isSuperAdmin && <th className="p-4">Amount Due</th>}
                      <th className="p-4 text-right">Verification Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {payments
                      .filter(p => p.status === paymentFilter)
                      .map((pay) => (
                        <tr key={pay.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-foreground font-sans">{pay.userEmail}</div>
                            {pay.senderNumber && (
                              <div className="text-[10px] text-muted-foreground mt-0.5">MoMo Tel: {pay.senderNumber}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-foreground uppercase">{pay.plan}</div>
                            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{pay.billingCycle} billing</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-background border border-border text-foreground">
                              {pay.method}
                            </span>
                          </td>
                          <td className="p-4 text-primary font-bold">{pay.details}</td>
                          {!isSuperAdmin && <td className="p-4 font-heading text-sm font-bold text-foreground">${pay.amount}</td>}
                          <td className="p-4 text-right">
                            {pay.status === "pending" ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleDeclinePayment(pay.id)}
                                  className="p-1.5 border border-red-500/20 hover:border-red-500/50 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all rounded outline-none cursor-pointer"
                                  title="Decline Payment"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleApprovePayment(pay.id)}
                                  className="px-3 py-1.5 bg-green text-green-foreground font-bold hover:bg-green-light transition-all rounded flex items-center gap-1 cursor-pointer outline-none border-0 text-[10px] uppercase tracking-wider"
                                >
                                  <Check className="w-3 h-3" /> Approve & Unlock
                                </button>
                              </div>
                            ) : (
                              <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
                                pay.status === "approved" ? "bg-green/10 text-green border border-green/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}>
                                {pay.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    {payments.filter(p => p.status === paymentFilter).length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                          No transactions found in this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: PROVIDERS & PLATFORM TRENDS */}
          {activeTab === "providers" && (
            <div className="p-6 border border-border bg-card/25 rounded-xl space-y-6 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase tracking-wide">Copy Providers & Trends</h3>
                  <p className="text-xs text-muted-foreground mt-1">Configure signal providers, override success metrics, and adjust platform statistics.</p>
                </div>

                <button
                  onClick={() => setShowAddProviderModal(true)}
                  className="font-mono text-[10px] tracking-[1.5px] uppercase font-bold py-2.5 px-4 bg-primary hover:bg-gold text-primary-foreground transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer outline-none border-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Register Provider
                </button>
              </div>

              {/* Provider grid list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {providers.map((prov) => (
                  <div 
                    key={prov.id}
                    className={`p-6 border rounded-xl bg-card/45 backdrop-blur-md relative space-y-4 flex flex-col justify-between transition-all ${
                      prov.status === "active" ? "border-border" : "border-border/40 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border border-border bg-background rounded-full flex items-center justify-center text-lg">
                            {prov.avatar}
                          </div>
                          <div>
                            <h4 className="font-heading text-base font-bold text-foreground leading-tight">{prov.name}</h4>
                            <span className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase">{prov.market} Specialist</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                          prov.status === "active" ? "bg-green/10 text-green border-green/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        }`}>
                          {prov.status}
                        </span>
                      </div>

                      {/* Performance values adjustment table */}
                      <div className="mt-6 space-y-2 border-t border-b border-border/40 py-4 font-mono text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Win Rate (Platform display):</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={prov.winRate}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, winRate: val } : p));
                              }}
                              className="w-12 bg-background border border-border/80 rounded p-1 text-center font-bold text-foreground text-[10px]"
                            />
                            <span className="text-foreground">%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Assets Under Management:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">$</span>
                            <input
                              type="number"
                              value={Math.round(prov.aum)}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, aum: val } : p));
                              }}
                              className="w-20 bg-background border border-border/80 rounded p-1 text-center font-bold text-foreground text-[10px]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Max Drawdown (MDD):</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={prov.mdd}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, mdd: val } : p));
                              }}
                              className="w-14 bg-background border border-border/80 rounded p-1 text-center font-bold text-foreground text-[10px]"
                            />
                            <span className="text-foreground">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleProviderStatus(prov.id)}
                      className={`w-full font-mono text-[9px] uppercase font-bold py-2.5 rounded transition-all cursor-pointer outline-none border-0 ${
                        prov.status === "active" 
                          ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" 
                          : "bg-green/10 text-green hover:bg-green/20"
                      }`}
                    >
                      {prov.status === "active" ? "Pause Signals" : "Activate Signals"}
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ── CREATE PROVIDER MODAL ── */}
      {showAddProviderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <h3 className="font-heading text-lg font-bold uppercase tracking-wide">Register Strategy Provider</h3>
              <button 
                onClick={() => setShowAddProviderModal(false)}
                className="p-1 text-muted-foreground hover:text-primary transition-all cursor-pointer border-0 bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProvider} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground">Provider Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alpha Scalper"
                  value={newProvName}
                  onChange={(e) => setNewProvName(e.target.value)}
                  className="w-full bg-background border border-border/85 rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground">Routing Speciality</label>
                <select
                  value={newProvMarket}
                  onChange={(e) => setNewProvMarket(e.target.value as any)}
                  className="w-full bg-background border border-border/85 rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none text-foreground cursor-pointer"
                >
                  <option value="Crypto">Crypto Markets</option>
                  <option value="Forex">Forex Markets</option>
                  <option value="Deriv">Deriv Synthetics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground">Win Rate (%)</label>
                  <input
                    type="number"
                    max="100"
                    placeholder="85"
                    value={newProvWinRate}
                    onChange={(e) => setNewProvWinRate(e.target.value)}
                    className="w-full bg-background border border-border/85 rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground">Starting AUM ($)</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={newProvAum}
                    onChange={(e) => setNewProvAum(e.target.value)}
                    className="w-full bg-background border border-border/85 rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full font-mono text-[10px] tracking-[2px] uppercase py-3 rounded-lg font-bold bg-primary text-primary-foreground hover:bg-gold transition-all cursor-pointer border-0 mt-4 outline-none shadow"
              >
                Confirm Registration
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
