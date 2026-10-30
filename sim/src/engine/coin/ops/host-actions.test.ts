import { expect, it } from "vitest";
import { codes, op, play, setTrack, turnOf, withRoll } from "../../../../test/board.ts";
const pressure = op("pkk", "opSa", {op: "pkk.rally", locations: ["kdp-zone"], sa: {action: "pkk.host-pressure", timing: "before", locations: ["kdp-zone"]}});
it("retains the Host Pressure backfire and cost while waiting for a legal replacement Rally", () => {
  const state = withRoll(setTrack(turnOf("pkk"), "posture.kdp", "tolerant"), 1);
  const first = play(state, pressure);
  expect(first.state.pending?.resume?.op).toBe("pkk.rally");
  expect(first.state.tracks["posture.kdp"]).toBe("restricted");
  expect(first.state.tracks["resources.pkk"]).toBe(3);
  expect(codes(first.state, pressure)).toContain("resumeOperation");
  const next = play(first.state, op("pkk", "opSa", {op: "pkk.rally", locations: ["botan"]}));
  expect(next.state.pending).toBeNull();
  expect(next.state.tracks["resources.pkk"]).toBe(2);
  expect(next.state.rng).toEqual(first.state.rng);
  expect(next.entries.some(e => e.kind === "DieRolled")).toBe(false);
  expect(next.state.initiative.actedThisCard).toEqual(["pkk"]);
});
it("Diplomacy uses modified totals, the Syria cap and posture consequences", () => {
  const command = (loc: string) => op("state", "opSa", {op: "state.train", locations: ["diyarbakir-city"], perLocation: {"diyarbakir-city": {option: "place", police: 1}}, sa: {action: "state.diplomacy", timing: "after", locations: [loc]}});
  const state = withRoll(setTrack(turnOf("state"), "legitimacy", 5), 6);
  expect(play(state, command("syria-bekaa")).state.tracks["posture.syria"]).toBe("host");
  const hostile = withRoll(setTrack(setTrack(turnOf("state"), "posture.syria", "hostile"), "legitimacy", 12), 6);
  expect(play(hostile, command("syria-bekaa")).state.tracks["posture.syria"]).toBe("hostile");
  const aligned = withRoll(setTrack(setTrack(turnOf("state"), "posture.kdp", "hostile"), "legitimacy", 12), 5);
  expect(play(aligned, command("kdp-zone")).state.tracks["posture.kdp"]).toBe("aligned");
});
it("Cross-Border checks the planned Assault on the board after the Troop move", () => {
  const state = setTrack(turnOf("state"), "posture.kdp", "aligned");
  const command = op("state", "opSa", {op: "state.assault", locations: ["kdp-zone"], sa: {action: "state.cross-border", timing: "before", locations: ["kdp-zone"], perLocation: {"kdp-zone": {moves: [{from: "hakkari", count: 2}]}}}});
  expect(codes(state, command)).toContain("assaultTargets");
});
it("checks every Cross-Border posture, PUK transit and the early hot pursuit exception", () => {
  const border = (box: string, count = 1) => op("state", "opSa", {op: "state.sweep", locations: [box], sa: {action: "state.cross-border", timing: "before", locations: [box], perLocation: {[box]: {moves: [{from: "hakkari", count}]}}}});
  for (const p of ["host","tolerant","restricted","hostile","aligned"]) {
    const base = setTrack(turnOf("state"),"posture.kdp",p);
    expect(codes(base,border("kdp-zone"))).toEqual([]);
    const later = {...base,turn: {...base.turn,campaign: "C3"}};
    expect(codes(later,border("kdp-zone")).includes("crossBorderAccess")).toBe(p === "host" || p === "tolerant");
    const vacuum = {...later,flags: {...later.flags,northernIraqVacuum: true}};
    expect(codes(vacuum,border("kdp-zone")).includes("crossBorderAccess")).toBe(p === "host");
  }
  const puk = setTrack(turnOf("state"),"posture.puk","restricted");
  expect(codes(puk,border("puk-zone"))).toContain("crossBorderAccess");
  expect(codes(setTrack(puk,"posture.kdp","restricted"),border("puk-zone"))).toEqual([]);
});
it("Aligned Assault ignores Mountain, pays no extra SA cost and adds only one Disputed Harm", async () => {
  const {setPieces, setMarkers} = await import("../../../../test/board.ts");
  let base = setPieces(setPieces(turnOf("state"),"kdp-zone","guerrilla",0),"kdp-zone","guerrilla",3,"active");
  const command = op("state","opSa",{op: "state.assault",locations: ["kdp-zone"],sa: {action: "state.cross-border",timing: "before",locations: ["kdp-zone"],perLocation: {"kdp-zone": {moves: [{from: "hakkari",count: 2}]}}}});
  const normal = play(setTrack(base,"posture.kdp","restricted"),command).state;
  expect(normal.tracks["resources.state"]).toBe(8);
  expect(normal.spaces["kdp-zone"]?.pieces["guerrilla"]?.["active"]).toBe(2);
  expect(normal.spaces["kdp-zone"]?.markers["disputedHarm"]?.["default"]).toBe(1);
  base = setMarkers(setTrack(base,"posture.kdp","aligned"),"kdp-zone","disputedHarm",1);
  const aligned = play(base,command).state;
  expect(aligned.tracks["resources.state"]).toBe(10);
  expect(aligned.spaces["kdp-zone"]?.pieces["guerrilla"]?.["active"]).toBe(1);
  expect(aligned.spaces["kdp-zone"]?.markers["disputedHarm"]?.["default"]).toBe(1);
});
it("rejects hot pursuit overflow, forbidden boxes, extra Op entry and wrong timing", async () => {
  const {setPieces, engine, ruleset} = await import("../../../../test/board.ts");
  const border = (box: string, n: number, timing = "before", moves: unknown[] = []) => op("state","opSa",{op: "state.sweep",locations: [box],perLocation: {[box]: {moves}},sa: {action: "state.cross-border",timing,locations: [box],perLocation: {[box]: {moves: [{from: "hakkari",count: n}]}}}});
  const base = setPieces(turnOf("state"),"hakkari","troops",7);
  expect(codes(base,border("kdp-zone",4))).toContain("crossBorderAccess");
  expect(codes(base,border("kdp-zone",7))).toContain("crossBorderTroops");
  expect(codes(base,border("syria-bekaa",1))).toContain("crossBorderTarget");
  expect(codes(base,border("kdp-zone",1,"after"))).toContain("saTiming");
  expect(codes(base,border("kdp-zone",1,"before",[{from: "hakkari",count: 1}]))).toContain("crossBorderMoves");
  const scenario = ruleset.scenarios["s0"];
  if (scenario === undefined) throw new Error("s0");
  const deny = {...ruleset,scenarios: {...ruleset.scenarios,s0: {...scenario,options: {...scenario.options,hotPursuit: "deny"}}}};
  expect(engine.validate(deny,base,border("kdp-zone",1)).violations.map(v => v.code)).toContain("crossBorderAccess");
});
it("Host Pressure requires a PKK piece and Leadership in Syria; KDP backfires on 2", async () => {
  const {setMarkers, setPieces} = await import("../../../../test/board.ts");
  const inSyria = op("pkk","opSa",{op: "pkk.rally",locations: ["botan"],sa: {action: "pkk.host-pressure",timing: "after",locations: ["syria-bekaa"]}});
  const abroad = setMarkers(setMarkers(turnOf("pkk"),"syria-bekaa","leadership",0,"present"),"syria-bekaa","leadership",1,"abroad");
  expect(codes(abroad,inSyria)).toContain("leadershipAbroad");
  const empty = setPieces(setPieces(turnOf("pkk"),"kdp-zone","guerrilla",0),"kdp-zone","pkkBase",0);
  expect(codes(empty,pressure)).toContain("hostPressureTarget");
  const backfire = play(withRoll(setTrack(turnOf("pkk"),"posture.kdp","restricted"),2),op("pkk","opSa",{op: "pkk.rally",locations: ["botan"],sa: {action: "pkk.host-pressure",timing: "after",locations: ["kdp-zone"]}})).state;
  expect(backfire.tracks["posture.kdp"]).toBe("hostile");
  expect(backfire.spaces["kdp-zone"]?.pieces["guerrilla"]?.["active"]).toBe(3);
});
it("a free Strike Collaborators pays no Resource cost (05 s5 item 4)", async () => {
  const {engine, ruleset, setPieces, withCard} = await import("../../../../test/board.ts");
  const card = ruleset.cards["DK-001"];
  if (card?.shaded === undefined || card.shaded === null) throw new Error("DK-001");
  const r = {...ruleset,cards: {...ruleset.cards,"DK-001": {...card,shaded: {...card.shaded,effects: [{type: "freeAction" as const,action: "pkk.strike-collaborators",constraints: {}}]}}}};
  const base = turnOf("pkk");
  const state = setPieces({...withCard(base,"DK-001"),flags: {...base.flags,law3175: true},pools: {...base.pools,guards: {available: 16,outOfPlay: 0}}},"hakkari","guards",1);
  const result = engine.apply(r,state,{type: "ChooseEvent",faction: "pkk",side: "shaded",answers: [{locations: ["hakkari"],perLocation: {hakkari: {guards: 1}}}]});
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error("free Strike");
  expect(result.transition.state.tracks["resources.pkk"]).toBe(5);
  expect(result.transition.state.spaces["hakkari"]?.pieces["guards"]?.["default"]).toBe(0);
});
it("replans March after Host Pressure closes its destination, retaining the roll and SA cost", () => {
  const state = withRoll(setTrack(turnOf("pkk"),"posture.kdp","restricted"),1);
  const command = op("pkk","opSa",{op: "pkk.march",locations: ["kdp-zone"],perLocation: {"kdp-zone": {moves: [{from: "hakkari",count: 1}]}},sa: {action: "pkk.host-pressure",timing: "before",locations: ["kdp-zone"]}});
  const first = play(state,command);
  expect(first.state.pending?.prompt).toMatch(/March destinations/);
  expect(first.state.pending?.resume?.op).toBe("pkk.march");
  expect(first.state.tracks["posture.kdp"]).toBe("hostile");
  expect(first.state.tracks["resources.pkk"]).toBe(3);
  const next = play(first.state,op("pkk","opSa",{op: "pkk.march",locations: ["botan"],perLocation: {botan: {moves: [{from: "hakkari",count: 1}]}}}));
  expect(next.state.rng).toEqual(first.state.rng);
  expect(next.state.tracks["resources.pkk"]).toBe(2);
  expect(next.state.spaces["botan"]?.pieces["guerrilla"]?.["underground"]).toBe(3);
  expect(next.entries.filter(e => e.kind === "DieRolled")).toHaveLength(0);
  expect(next.state.initiative.actedThisCard).toEqual(["pkk"]);
});
it("PA-02 caps a multi-step Syria posture effect at Hostile", async () => {
  const {createExec} = await import("../../core/exec.ts");
  const {shiftHost} = await import("./sa/host-actions.ts");
  const {ruleset} = await import("../../../../test/board.ts");
  const ctx = createExec(ruleset,setTrack(turnOf("state"),"posture.syria","restricted"));
  shiftHost(ctx,"syria-bekaa",2,"PA-02");
  expect(ctx.state.tracks["posture.syria"]).toBe("hostile");
  expect(ctx.state.spaces["syria-bekaa"]?.markers["leadership"]?.["abroad"]).toBe(1);
  expect(() => {shiftHost(ctx,"iran",1,"PA-02");}).toThrow(/No host/);
});
