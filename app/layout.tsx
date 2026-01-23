import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
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
      <body className={`${inter.variable} font-inter antialiased bg-white`}>
        <TradesProvider>
          <div className="flex min-h-screen flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <Sidebar />
            
            <main className="flex-1 pb-20 md:pb-0">
              {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
          </div>
        </TradesProvider>
      </body>
    </html>
  );
}
