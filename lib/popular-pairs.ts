/**
 * Popular FOREX and Crypto pairs for pair autocomplete in the add-trade modal.
 * Ordered for good prefix match (e.g. "B" -> BTC/USDT, "E" -> EUR/USD).
 * User can still enter any custom pair not in this list.
 */

/** Major crypto spot pairs (USDT), most common first. */
export const CRYPTO_PAIRS: readonly string[] = [
  "BTC/USDT",
  "ETH/USDT",
  "BNB/USDT",
  "SOL/USDT",
  "XRP/USDT",
  "ADA/USDT",
  "DOGE/USDT",
  "AVAX/USDT",
  "DOT/USDT",
  "MATIC/USDT",
  "LINK/USDT",
  "UNI/USDT",
  "LTC/USDT",
  "ATOM/USDT",
  "ETC/USDT",
  "XLM/USDT",
  "BCH/USDT",
  "ALGO/USDT",
  "FIL/USDT",
  "TRX/USDT",
  "APT/USDT",
  "ARB/USDT",
  "OP/USDT",
  "INJ/USDT",
  "SUI/USDT",
  "SEI/USDT",
  "NEAR/USDT",
  "TIA/USDT",
  "STX/USDT",
  "PEPE/USDT",
  "WIF/USDT",
  "BONK/USDT",
  "SHIB/USDT",
  "FET/USDT",
  "RENDER/USDT",
  "IMX/USDT",
  "AAVE/USDT",
  "MKR/USDT",
  "CRV/USDT",
  "SAND/USDT",
  "MANA/USDT",
] as const;

/** Major FOREX pairs (majors then crosses). */
export const FOREX_PAIRS: readonly string[] = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "AUD/USD",
  "NZD/USD",
  "USD/CAD",
  "EUR/GBP",
  "EUR/JPY",
  "GBP/JPY",
  "EUR/CHF",
  "AUD/JPY",
  "NZD/JPY",
  "EUR/AUD",
  "GBP/CHF",
  "AUD/NZD",
  "EUR/NZD",
  "GBP/AUD",
  "CAD/JPY",
  "EUR/CAD",
  "GBP/CAD",
  "AUD/CAD",
  "CHF/JPY",
  "USD/TRY",
  "USD/MXN",
  "USD/ZAR",
] as const;

/** Combined list: crypto first (most typed in trading apps), then FOREX. */
export const POPULAR_PAIRS: string[] = [
  ...CRYPTO_PAIRS,
  ...FOREX_PAIRS,
];
