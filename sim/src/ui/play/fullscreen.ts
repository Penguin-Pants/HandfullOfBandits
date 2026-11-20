// Browser fullscreen for the View menu: the whole document goes fullscreen, so body portals,
// tooltips and every overlay stay visible. `message` explains a refused or unsupported request.
import { useEffect, useState } from "react";

export interface Fullscreen {
  readonly active: boolean;
  readonly pending: boolean;
  readonly message: string | null;
  readonly toggle: () => Promise<void>;
}

export function useFullscreen(): Fullscreen {
  const [active, setActive] = useState(() => Boolean(document.fullscreenElement));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const changed = (): void => { setActive(Boolean(document.fullscreenElement)); setMessage(null); };
    document.addEventListener("fullscreenchange", changed);
    return () => { document.removeEventListener("fullscreenchange", changed); };
  }, []);
  const toggle = async (): Promise<void> => {
    setMessage(null);
    const exiting = Boolean(document.fullscreenElement);
    if (!exiting && (typeof document.documentElement.requestFullscreen !== "function" || !document.fullscreenEnabled)) {
      setMessage("Fullscreen is not supported here. Keep playing in this window.");
      return;
    }
    setPending(true);
    try {
      if (exiting) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setMessage(exiting ? "Could not exit fullscreen. Use the browser's fullscreen control." : "Could not enter fullscreen. Keep playing in this window.");
    } finally {
      setPending(false);
    }
  };
  return { active, pending, message, toggle };
}
