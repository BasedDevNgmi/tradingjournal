"use client";

import * as React from "react";
import { toast } from "sonner";

const INSTALL_DISMISSED_KEY = "trading-journal-install-dismissed";

export function InstallPrompt() {
  const installRef = React.useRef<{ prompt: () => Promise<{ outcome: string }> } | null>(null);
  const shownRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(INSTALL_DISMISSED_KEY)) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      installRef.current = e as unknown as { prompt: () => Promise<{ outcome: string }> };
      if (shownRef.current) return;
      shownRef.current = true;
      toast.info("Install Journal for quick access", {
        description: "Add to your home screen and open like an app.",
        action: {
          label: "Install",
          onClick: async () => {
            if (!installRef.current) return;
            try {
              await installRef.current.prompt();
              sessionStorage.setItem(INSTALL_DISMISSED_KEY, "1");
            } catch {
              // User dismissed or prompt not available
            }
            toast.dismiss();
          },
        },
        duration: 10000,
        onDismiss: () => sessionStorage.setItem(INSTALL_DISMISSED_KEY, "1"),
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  return null;
}
