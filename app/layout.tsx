import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TradesProvider } from "@/context/trade-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Trading Journal",
  description: "Superflat Trading Journal App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-inter antialiased bg-white text-black transition-colors duration-200`}>
        <TradesProvider>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1 max-w-7xl mx-auto w-full pb-8 md:pb-8">
              {children}
            </main>
          </div>
        </TradesProvider>
      </body>
    </html>
  );
}
