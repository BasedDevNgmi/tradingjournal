"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, PlusSquare, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: BookOpen, label: "Journal" },
  { href: "/add", icon: PlusSquare, label: "Add Trade" },
  { href: "/stats", icon: BarChart3, label: "Stats" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-4 border-black bg-white md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "bg-black text-white" : "text-black hover:bg-zinc-100"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 3 : 2} />
              <span className="text-xs font-bold uppercase tracking-tighter">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
