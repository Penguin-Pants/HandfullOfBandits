// Play screen (08 s3). Board and panels come with P2-14 to P2-16.
import { useEffect, useState } from "react";
import type { Api, Head, SessionRow } from "../api.ts";

export function Play({ api, sessionId }: { readonly api: Api; readonly sessionId: string }) {
  const [data, setData] = useState<{ session: SessionRow; head: Head } | null>(null);
  useEffect(() => {
    void api.session(sessionId).then(setData);
  }, [api, sessionId]);
  if (data === null) return <p className="screen">Loading…</p>;
  return (
    <div className="screen">
      <h2>{data.session.name}</h2>
      <p className="muted">
        Phase {data.head.state.turn.phase}, card {data.head.state.deck.currentCard ?? "none"}
      </p>
    </div>
  );
}
