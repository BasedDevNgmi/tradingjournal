import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TradesProvider } from "@/context/trade-context";
import { Toaster } from "sonner";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Trading Journal",
  description: "Superflat Trading Journal App",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Journal",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import { GlobalErrorBoundary } from "@/components/ui/error-boundary";
import { CommandPalette } from "@/components/command-palette";
import { InstallPrompt } from "@/components/install-prompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalErrorBoundary>
            <TradesProvider>
              <KeyboardShortcuts />
              <CommandPalette />
              <InstallPrompt />
              <div className="flex min-h-screen flex-col">
                <main className="flex-1 w-full">
                  {children}
                </main>
              </div>
              <Toaster 
                position="top-right" 
                toastOptions={{
                  className: "rounded-lg border border-border bg-card text-foreground shadow-md p-4 font-medium",
                }}
              />
            </TradesProvider>
          </GlobalErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
