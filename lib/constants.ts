export const PSYCHO_TAGS = [
  'Disciplined', 
  'FOMO', 
  'Revenge Trade', 
  'Hesitant', 
  'Early Exit', 
  'Chasing', 
  'Boredom'
] as const;

export type PsychoTag = typeof PSYCHO_TAGS[number];

export const AOC_CONFLUENCES = [
  "Daily bias clear (PO3+DOL)",
  "Clear H1 PD Arrays in direction of bias",
  "News impact check",
  "SMT divergence (tradfi only)",
  "Clear session profiles (AMDX/ABC)",
  "M5 CISD confirmation at H1 PD array",
  "Strong high/low",
  "Trading within killzone"
] as const;

export const TRADING_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT"] as const;
