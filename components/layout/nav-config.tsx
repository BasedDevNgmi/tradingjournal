import type { ComponentType } from "react";
import { BookOpen, BarChart3, Clock } from "lucide-react";
import type { TabType } from "@/types";

export const SIDEBAR_NAV_ITEMS: { id: TabType; icon: ComponentType<{ size?: number }>; label: string }[] = [
  { id: "journal", icon: BookOpen, label: "Journal" },
  { id: "missed", icon: Clock, label: "Missed" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
];
