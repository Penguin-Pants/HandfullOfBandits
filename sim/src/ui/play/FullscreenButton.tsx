import { useEffect, useState } from "react";

/** Fullscreen the document so body portals, tooltips and every overlay stay visible. */
export function FullscreenButton() {
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
  return <div className="fullscreen-control">
    <button type="button" disabled={pending} onClick={() => void toggle()}>{active ? "Exit fullscreen" : "Fullscreen"}</button>
    {message !== null && <span role="status">{message}</span>}
  </div>;
}
