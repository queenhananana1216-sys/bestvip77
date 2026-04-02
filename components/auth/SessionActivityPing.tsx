"use client";

import { useEffect } from "react";
import { tryCreateBrowserClient } from "@/lib/supabase/client";

const THROTTLE_MS = 5 * 60 * 1000;
const STORAGE_KEY = "bestvip77.lastActivityPingAt";

function shouldPingNow() {
  if (typeof window === "undefined") return false;
  const last = Number(window.localStorage.getItem(STORAGE_KEY) ?? "0");
  return Number.isFinite(last) ? Date.now() - last >= THROTTLE_MS : true;
}

async function pingActivity() {
  if (typeof window === "undefined" || !shouldPingNow()) return;

  window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  try {
    await fetch("/api/activity/ping", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      cache: "no-store",
    });
  } catch {
    /* activity ping는 실패해도 UX를 막지 않는다 */
  }
}

export function SessionActivityPing() {
  useEffect(() => {
    const client = tryCreateBrowserClient();
    if (!client) return;
    const authClient = client;

    let active = true;
    let intervalId: number | undefined;

    async function init() {
      const {
        data: { user },
      } = await authClient.auth.getUser();

      if (!active || !user) return;

      await pingActivity();

      const onFocus = () => {
        if (document.visibilityState === "visible") {
          void pingActivity();
        }
      };

      const onVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          void pingActivity();
        }
      };

      window.addEventListener("focus", onFocus);
      document.addEventListener("visibilitychange", onVisibilityChange);
      intervalId = window.setInterval(() => {
        void pingActivity();
      }, THROTTLE_MS);

      return () => {
        window.removeEventListener("focus", onFocus);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (intervalId) {
          window.clearInterval(intervalId);
        }
      };
    }

    let cleanup: (() => void) | undefined;
    void init().then((nextCleanup) => {
      cleanup = nextCleanup;
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return null;
}
