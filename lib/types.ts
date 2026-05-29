export interface UserProfile {
  id: string;
  email: string;
  telegramUsername?: string;
  createdAt: string;
}

export interface TradePosition {
  id: string;
  symbol: string;
  market: "Crypto" | "Forex" | "Deriv";
  side: "BUY" | "SELL";
  entryPrice: number;
  currentPrice: number;
  size: number;
  leverage: number;
  pnl: number;
  slippage: number;
  timestamp: string;
  status: "OPEN" | "CLOSED";
}

export interface VerifiedTrader {
  id: string;
  name: string;
  market: "Crypto" | "Forex" | "Deriv";
  winRate: number;
  totalTrades: number;
  followers: number;
  pnlPercentage: number;
  status: "ONLINE" | "OFFLINE";
  avatar: string;
}



export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
