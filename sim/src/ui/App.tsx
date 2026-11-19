// UI shell (11 P2-13; 08 s2): Home, package check and play screens.
import { useState } from "react";
import type { Api, PackageSummary } from "./api.ts";
import { PackageCheck } from "./check/PackageCheck.tsx";
import { Experiments } from "./experiments/Experiments.tsx";
import { Home } from "./home/Home.tsx";
import { Metrics } from "./metrics/Metrics.tsx";
import { Play } from "./play/Play.tsx";
import { Review } from "./review/Review.tsx";
import { Setup } from "./setup/Setup.tsx";
import { StateViewer } from "./state-viewer/StateViewer.tsx";

type Screen =
  | { readonly name: "home" }
  | { readonly name: "check"; readonly pkg: PackageSummary }
  | { readonly name: "play"; readonly sessionId: string }
  | { readonly name: "review" }
  | { readonly name: "metrics" }
  | { readonly name: "experiments" }
  | { readonly name: "setup"; readonly pkg: PackageSummary; readonly scenarioId: string }
  | { readonly name: "state"; readonly sessionId: string; readonly before: string | null; readonly after: string; readonly back: Screen };

export function App({ api }: { readonly api: Api }) {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const home = (): void => { setScreen({ name: "home" }); };
  return (
    <>
      {screen.name !== "play" && (
        <nav>
        <button type="button" onClick={home}>
          Home
        </button>
        <button type="button" onClick={() => { setScreen({ name: "review" }); }}>
          Feedback review (F)
        </button>
        <button type="button" onClick={() => { setScreen({ name: "metrics" }); }}>
          Metrics review
        </button>
        <button type="button" onClick={() => { setScreen({ name: "experiments" }); }}>
          Experiment reports
        </button>
        </nav>
      )}
      {screen.name === "home" && <Home api={api} onOpen={(sessionId) => { setScreen({ name: "play", sessionId }); }} onCheck={(pkg) => { setScreen({ name: "check", pkg }); }} onSetup={(pkg, scenarioId) => { setScreen({ name: "setup", pkg, scenarioId }); }} />}
      {screen.name === "setup" && <Setup api={api} pkg={screen.pkg} scenarioId={screen.scenarioId} onBack={home} />}
      {screen.name === "check" && <PackageCheck pkg={screen.pkg} onBack={home} />}
      {screen.name === "play" && (
        <Play api={api} sessionId={screen.sessionId} onExit={home} onReview={() => { setScreen({ name: "review" }); }} onOpenState={(before, after) => { setScreen({ name: "state", sessionId: screen.sessionId, before, after, back: screen }); }} />
      )}
      {screen.name === "review" && <Review api={api} onOpenState={(sessionId, hash) => { setScreen({ name: "state", sessionId, before: null, after: hash, back: screen }); }} />}
      {screen.name === "metrics" && <Metrics api={api} />}
      {screen.name === "experiments" && <Experiments api={api} onOpen={(sessionId) => { setScreen({ name: "play", sessionId }); }} />}
      {screen.name === "state" && <StateViewer api={api} sessionId={screen.sessionId} before={screen.before} after={screen.after} onBack={() => { setScreen(screen.back); }} />}
    </>
  );
}
