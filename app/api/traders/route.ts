import { NextResponse } from "next/server";
import { ApiResponse, VerifiedTrader } from "@/lib/types";

const mockTraders: VerifiedTrader[] = [
  {
    id: "trd-01",
    name: "Alpha_Strategist",
    market: "Crypto",
    winRate: 88,
    totalTrades: 412,
    followers: 840,
    pnlPercentage: 32.48,
    status: "ONLINE",
    avatar: "₿"
  },
  {
    id: "trd-02",
    name: "SMC_OrderBlocker",
    market: "Forex",
    winRate: 74,
    totalTrades: 198,
    followers: 512,
    pnlPercentage: 18.25,
    status: "ONLINE",
    avatar: "📈"
  },
  {
    id: "trd-03",
    name: "Deriv_Synthetics_King",
    market: "Deriv",
    winRate: 82,
    totalTrades: 620,
    followers: 1240,
    pnlPercentage: 45.60,
    status: "OFFLINE",
    avatar: "⚡"
  }
];

export async function GET() {
  return NextResponse.json<ApiResponse<VerifiedTrader[]>>({
    success: true,
    data: mockTraders
  });
}
