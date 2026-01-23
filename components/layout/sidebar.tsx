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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r-4 border-black bg-white sticky top-0">
      <div className="p-8 border-b-4 border-black">
        <h1 className="text-2xl font-black uppercase tracking-tighter">
          Trading <br /> Journal
        </h1>
      </div>
      
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-8 py-4 font-bold uppercase tracking-widest transition-all border-y-2 border-transparent",
                isActive 
                  ? "bg-black text-white border-y-black" 
                  : "text-black hover:bg-zinc-100"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 3 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t-4 border-black">
        <p className="text-xs font-bold uppercase text-zinc-400">
          v0.1.0 - Superflat
        </p>
      </div>
    </aside>
  );
}
