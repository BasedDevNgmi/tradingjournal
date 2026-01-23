import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TradesProvider } from "@/context/trade-context";
import { Toaster } from "sonner";

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
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: "brutalist-card !p-4 !rounded-none !border-4 !border-black !bg-white !text-black !shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
            }}
          />
        </TradesProvider>
      </body>
    </html>
  );
}
