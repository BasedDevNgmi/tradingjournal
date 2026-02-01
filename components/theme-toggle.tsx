"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={cn("w-10 h-10 border-2 border-border bg-muted/30 rounded-xl", className)} />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-xl border-2 border-border bg-card hover:border-foreground/20 transition-all active:scale-90 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="text-muted-foreground" size={18} />
      ) : (
        <Moon className="text-muted-foreground" size={18} />
      )}
    </button>
  );
}
