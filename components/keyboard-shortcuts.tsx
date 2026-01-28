"use client";

import { useEffect } from "react";

const OPEN_ADD_TRADE_EVENT = "journal:open-add-trade";
const TOGGLE_SIDEBAR_EVENT = "journal:toggle-sidebar";

export function KeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const activeElement = document.activeElement;
      const isTyping = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA";

      if (isTyping) return;

      const mod = e.metaKey || e.ctrlKey;

      // Mod+N for New Trade — opens add-trade modal (handled by page listener)
      if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent(OPEN_ADD_TRADE_EVENT));
        return;
      }

      // Mod+B to toggle sidebar (handled by page listener)
      if (mod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent(TOGGLE_SIDEBAR_EVENT));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}

export { OPEN_ADD_TRADE_EVENT, TOGGLE_SIDEBAR_EVENT };
