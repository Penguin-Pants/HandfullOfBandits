// UI shell (11 P2-13; 08 s2): Home, package check and play screens.
import { useState } from "react";
import type { Api, PackageSummary } from "./api.ts";
import { PackageCheck } from "./check/PackageCheck.tsx";
import { Home } from "./home/Home.tsx";
import { Play } from "./play/Play.tsx";

type Screen = { readonly name: "home" } | { readonly name: "check"; readonly pkg: PackageSummary } | { readonly name: "play"; readonly sessionId: string };

export function App({ api }: { readonly api: Api }) {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const home = (): void => { setScreen({ name: "home" }); };
  return (
    <>
      <nav>
        <button type="button" onClick={home}>
          Home
        </button>
      </nav>
      {screen.name === "home" && <Home api={api} onOpen={(sessionId) => { setScreen({ name: "play", sessionId }); }} onCheck={(pkg) => { setScreen({ name: "check", pkg }); }} />}
      {screen.name === "check" && <PackageCheck pkg={screen.pkg} onBack={home} />}
      {screen.name === "play" && <Play api={api} sessionId={screen.sessionId} onExit={home} />}
    </>
  );
}
