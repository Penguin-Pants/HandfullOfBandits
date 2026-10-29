// Player-facing text for each Propaganda phase (research 05 s6). Keys are sequence.yaml phase IDs;
// an unknown ID shows its ID only.
export interface PhaseGuide {
  readonly title: string;
  readonly what: string;
  readonly you: string;
}

export const PHASE_GUIDE: Readonly<Record<string, PhaseGuide>> = {
  victory: { title: "Victory", what: "Check both victory scores and Harm counts. Skipped in the first Propaganda round.", you: "Nothing to choose. Press Advance." },
  resources: { title: "Resources", what: "State gets 8 + Legitimacy / 2 + Pop of controlled Mountain or Plain spaces with a State Base. PKK gets income from Bases, Leadership and Europe. Maximum 50.", you: "Nothing to choose. Press Advance." },
  upkeep: { title: "Upkeep", what: "The State pays 1 Resource per 2 Village Guards on the map, rounded up.", you: "If the State can pay, press Advance. If not, select spaces and remove Guards until it can." },
  legitimacy: { title: "Legitimacy and Emergency Rule", what: "Legitimacy drains for Emergency Rule, new Displacement, Reception, Disputed Harm and Covert exposure, then gains are applied.", you: "The State may move Emergency Rule one step, or press Advance to keep it." },
  legalPolitics: { title: "Legal Politics", what: "From C3 only. Skipped while Legal Space is Absent.", you: "Press Advance." },
  civicAction: { title: "Civic Action (State)", what: "The State spends Resources in spaces it Controls with Troops and Police. Total spend is at most half of Legitimacy.", you: "Select spaces, enter the spends, then Spend. Or press Advance to spend nothing." },
  agitation: { title: "Agitation (PKK)", what: "The PKK spends Resources in spaces with a PKK piece and no State Control.", you: "Select spaces, enter the spends, then Spend. Or press Advance to spend nothing." },
  redeploy: { title: "Redeploy", what: "State moves Troops and Police, then PKK moves Guerrillas to Bases. Not in the S0 slice yet.", you: "Not available in S0." },
  reset: { title: "Reset", what: "Remove one Coercion per space, flip Guerrillas Underground, advance the Campaign, reveal the next card. Not in the S0 slice yet.", you: "Not available in S0." },
};

export function guideOf(phase: string): PhaseGuide {
  return PHASE_GUIDE[phase] ?? { title: phase, what: "", you: "" };
}
