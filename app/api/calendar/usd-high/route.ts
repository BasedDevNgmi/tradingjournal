import { NextResponse } from "next/server";

/**
 * Static list of common high-impact USD economic events for the calendar.
 * Used by NewsEventInput to suggest event types (CPI, FOMC, NFP, etc.).
 * No external API or key required.
 */
const USD_HIGH_IMPACT_EVENTS: { title: string; date?: string }[] = [
  { title: "CPI" },
  { title: "Core CPI" },
  { title: "FOMC Statement" },
  { title: "FOMC Minutes" },
  { title: "Federal Funds Rate" },
  { title: "NFP" },
  { title: "Non-Farm Payrolls" },
  { title: "PPI" },
  { title: "Core PPI" },
  { title: "Retail Sales" },
  { title: "Core Retail Sales" },
  { title: "GDP" },
  { title: "Unemployment Rate" },
  { title: "ISM Manufacturing PMI" },
  { title: "ISM Non-Manufacturing PMI" },
  { title: "Consumer Confidence" },
  { title: "Building Permits" },
  { title: "Housing Starts" },
  { title: "Durable Goods Orders" },
  { title: "Trade Balance" },
];

export async function GET() {
  return NextResponse.json({
    events: USD_HIGH_IMPACT_EVENTS,
  });
}
