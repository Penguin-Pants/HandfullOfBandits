// End session dialog (08 s1 item 2; T-UI-06): optional debrief text. Save stores one debrief note;
// Skip stores none.
import { useState } from "react";

export function EndSession({ onEnd, onCancel }: { readonly onEnd: (debrief: string | null) => void; readonly onCancel: () => void }) {
  const [text, setText] = useState("");
  return (
    <div role="dialog" aria-label="End session" className="panel">
      <p>End this session? Add an overall comment (debrief) if you want.</p>
      <textarea aria-label="Debrief" rows={4} style={{ width: "100%" }} value={text} onChange={(e) => { setText(e.target.value); }} />
      <div className="row">
        <button type="button" disabled={text.trim() === ""} onClick={() => { onEnd(text); }}>
          Save debrief and end
        </button>
        <button type="button" onClick={() => { onEnd(null); }}>
          Skip and end
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
