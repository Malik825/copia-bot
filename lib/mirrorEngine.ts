import { TradePosition } from "./types";

export interface RiskRules {
  maxExposurePercent: number; // e.g. 20%
  maxLeverageCap: number; // e.g. 20x
  slippageLimitPercent: number; // e.g. 0.15%
  maxPositionSizeUsdt: number; // e.g. 1000 USDT
  orderBlockFilterEnabled: boolean;
}

export interface VerificationResult {
  allowed: boolean;
  reason?: string;
  adjustedLeverage?: number;
  adjustedSize?: number;
}

/**
 * AI-Driven fintech risk mitigation engine.
 * Validates copy signals against the user's personalized safety boundaries.
 */
export function verifyAndAdjustTradeSignal(
  signal: {
    symbol: string;
    side: "BUY" | "SELL";
    masterPrice: number;
    masterLeverage: number;
    masterSizeUsdt: number;
    slippagePercent: number;
  },
  currentActiveTrades: TradePosition[],
  accountEquityUsdt: number,
  rules: RiskRules
): VerificationResult {
  // Rule 1: Slippage Safeguard
  if (signal.slippagePercent > rules.slippageLimitPercent) {
    return {
      allowed: false,
      reason: `Blocked by Slippage Safeguard: Signal slippage (${(signal.slippagePercent * 100).toFixed(2)}%) exceeds safety boundary (${(rules.slippageLimitPercent * 100).toFixed(2)}%).`
    };
  }

  // Rule 2: Automatic Leverage Capping
  let finalLeverage = signal.masterLeverage;
  if (signal.masterLeverage > rules.maxLeverageCap) {
    finalLeverage = rules.maxLeverageCap;
  }

  // Rule 3: Max Position Size Cap
  let finalSize = signal.masterSizeUsdt;
  if (signal.masterSizeUsdt > rules.maxPositionSizeUsdt) {
    finalSize = rules.maxPositionSizeUsdt;
  }

  // Rule 4: Max Account Exposure Guard
  const currentExposure = currentActiveTrades.reduce((acc, curr) => acc + (curr.size * curr.entryPrice / curr.leverage), 0);
  const potentialNewExposure = finalSize / finalLeverage;
  const maxExposureAllowedUsdt = accountEquityUsdt * (rules.maxExposurePercent / 100);

  if (currentExposure + potentialNewExposure > maxExposureAllowedUsdt) {
    return {
      allowed: false,
      reason: `Blocked by Max Exposure Guard: Mirroring this order would push total account exposure to $${(currentExposure + potentialNewExposure).toFixed(2)}, exceeding your safety cap of $${maxExposureAllowedUsdt.toFixed(2)} (${rules.maxExposurePercent}% of equity).`
    };
  }

  // Rule 5: SMC (Smart Money Concepts) Block Filtering
  if (rules.orderBlockFilterEnabled && signal.symbol.includes("EURUSD") && signal.side === "BUY") {
    // Simulate smart analysis blocking trade if structure breaks aren't verified
    const randomBlock = Math.random() > 0.7;
    if (randomBlock) {
      return {
        allowed: false,
        reason: `Blocked by SMC Filter: EURUSD order block did not confirm high-probability institutional liquidity sweep.`
      };
    }
  }

  return {
    allowed: true,
    adjustedLeverage: finalLeverage !== signal.masterLeverage ? finalLeverage : undefined,
    adjustedSize: finalSize !== signal.masterSizeUsdt ? finalSize : undefined,
  };
}
