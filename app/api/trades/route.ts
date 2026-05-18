import { NextResponse } from "next/server";
import { ApiResponse, TradePosition } from "@/lib/types";

let mockTrades: TradePosition[] = [
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
    symbol: "ETH-USDT",
    market: "Crypto",
    side: "SELL",
    entryPrice: 3480,
    currentPrice: 3450,
    size: 10.5,
    leverage: 10,
    pnl: 90.90,
    slippage: 0.02,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: "OPEN",
  },
  {
    id: "pos-03",
    symbol: "EURUSD",
    market: "Forex",
    side: "BUY",
    entryPrice: 1.08200,
    currentPrice: 1.08450,
    size: 2.0,
    leverage: 100,
    pnl: 50.00,
    slippage: 0.08,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: "OPEN",
  },
];

export async function GET() {
  return NextResponse.json<ApiResponse<TradePosition[]>>({
    success: true,
    data: mockTrades.filter((t) => t.status === "OPEN"),
  });
}

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Position ID is required." },
        { status: 400 }
      );
    }

    const tradeIndex = mockTrades.findIndex((t) => t.id === id);

    if (tradeIndex === -1) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Position not found." },
        { status: 404 }
      );
    }

    mockTrades[tradeIndex].status = "CLOSED";
    mockTrades[tradeIndex].currentPrice = mockTrades[tradeIndex].entryPrice * 1.01; // Settle position PnL

    return NextResponse.json<ApiResponse<TradePosition>>({
      success: true,
      data: mockTrades[tradeIndex],
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
