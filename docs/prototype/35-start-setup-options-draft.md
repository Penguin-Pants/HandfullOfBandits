# 35 Start Setup Options (Draft)

Status: decided, 17 Nov 2026 (DD-25). Sections 1 to 11 are the draft as reviewed. Section 0 records the decision.
Scope: full campaign 1984 to 1999, 18-space map (DD-22).

## 0. Decision (DD-25)

The designer adopted a setup that is none of H, B or T. It extends H.

| Space | Added pieces | Level | Control | Part A verdict for C1 |
|---|---|---|---|---|
| Siirt | 1 Police, 1 Guerrilla | Passive Opposition | none | supported (Moderate) |
| Batman hinterland | 1 Guerrilla | Passive Opposition | PKK | trace (partisan source) |
| Batman City | 1 Police | Neutral | State | none |
| Van City | 1 Police | Neutral | State | none |
| Van hinterland | 1 Guerrilla | Passive Opposition | State | trace (Low) |
| Bitlis | 1 Police, 1 Guerrilla | Neutral | none | no record |
| Şanlıurfa | 1 Guerrilla | Passive Support | State | trace (1979 only) |
| KDP Zone | 1 Guerrilla | n/a | n/a | consistent with KDP host (Moderate) |

Thresholds: State 49, PKK 32 (method values 50 and 33; 09 section 2.2). Start scores 21 and 6, margins -28 and -26.

Applied to `full-campaign.yaml`, rules 6.2, 7.1, 7.3, 10.1 and 10.2, chapters 09 and 10, the golden replays and the tests. Mechanic tests now pin the board they need, so later setup changes do not break them. The qualification fixtures were adjusted to the PKK threshold 32, so the suite hash changed: re-run qualification before the next experiment.

## 1. Bottom line

1. **Part A:** the evidence supports "no PKK at the 1984 start" in Şanlıurfa, Adıyaman, Elazığ, Batman City, Van City and the PUK Zone. Confidence: Moderate for the PUK Zone, Low for the others (the result rests mostly on absence of evidence).
2. **Two start values conflict with the evidence.** Siirt is empty although the 15 and 17 Aug 1984 attacks were in Siirt (Moderate). Van hinterland has no PKK although Çatak (Van) was a planned third target on 15 Aug 1984 (Low).
3. **Recommended setup: H (Historical).** It adds 1 Police and 1 Guerrilla in Siirt. It is the smallest change and the only one where each piece traces to a record. Confidence: Moderate for the direction, Low for the size.
4. **Thresholds:** PKK 30 fits the 18-space map. State 49 is 1 below the value (50) that the method in 09 section 2.1 gives for Pop 33. No threshold is changed here.
5. **Batch screens gave no usable signal.** The legacy policies returned the same result for all four setups.

Status labels in this file:

| Label | Meaning |
|---|---|
| verified | The source text was read (repo file and line, or a fetched page) |
| inferred | Derived from other facts. Also used for a search summary of a page that was not read |
| unverified | Chapter 10 cites an evidence ID, but the register that holds it is not in the repo |

## 2. Repo facts and conflicts

| # | Fact | Status |
|---|---|---|
| 1 | Campaign years: C1 Aug 1984 to 1986, C2 1987 to 1989, C3 1990 to 1992, C4 1993 to 1995, C5 1996 to 1999 | verified, `08-event-deck.md` section 10 headings |
| 2 | Inventory: Troops 30, Police 24, State Bases 8, Guerrillas 30, PKK Bases 12. Start: 16, 16, 4, 10 and 3 on the map | verified, `pieces.yaml`, `full-campaign.yaml` |
| 3 | Start scores State 21 and PKK 4. Start income State 16 and PKK 5 | verified by count; income 16 agrees with DD-22 item 10 |
| 4 | The PKK is First Eligible | verified, 10 section 1 step 6 |
| 5 | A faction Controls an empty space with 1 piece. Agitation needs a PKK Base or PKK Control. Rally then Agitate in one action is legal | verified, rules 1.5, 3.3.1, 3.6.2; `sim/src/engine/coin/ops/pkk/rally.ts:112` |
| 6 | The E-, F- and L- registers are not in the repo. `research/research-final/data/` holds only the deck CSV and the mechanic links | verified by listing the folder |

Conflicts:

1. The task brief says chapter 10 section 2.3 gives the reasons. Section 2.3 lists the Pivotal Events. The reasons are the basis notes in section 2.2, the track table in 2.1 and DD-22 item 6.
2. Chapter 10 gives no reason for Passive Support in Elazığ. Basis note 3 covers Şanlıurfa and Adıyaman only.
3. Chapter 10 gives no historical reason for the empty Batman, Van City and Bitlis spaces. They are empty because DD-22 item 6 moved the old region pieces to one part of each region.
4. Basis note 1 puts the PKK pieces for the Eruh attack in Şırnak. Eruh is in the Siirt space (03 section 7 rule 4).

## 3. Part A: PKK presence audit

Verdict scale: none, trace, contested, strong. Source keys are in section 9.

### 3.1 Test of the chapter 10 reasons

| Reason (chapter 10) | Result of the test | Confidence |
|---|---|---|
| Şanlıurfa and Adıyaman Support: state-allied landlord networks, Bucak at Siverek [E-0041; L-013; F-006; F-057] (IDs unverified) | Direction holds for Siverek: Bucak was a landlord the PKK attacked in 1979 (W1, verified). The same record shows PKK activity there before the 1980 coup. Nothing was found for Adıyaman | Low |
| Elazığ Support and State Base | No reason is given. The Base is a "design post" (note 5) | n/a |
| PUK Tolerant and empty [F-022] (unverified) | Holds. In 1983 to 1985 the PKK facilities were in KDP areas (W1, verified) | Moderate |
| Batman, Van City and Bitlis empty | Not a historical reason (DD-22 item 6). Holds for 1984 only because no evidence of presence was found | Low |
| Siirt at Passive Opposition with no pieces | Does not hold. The attacks of 15 and 17 Aug 1984 were in Siirt | Moderate |

### 3.2 Şanlıurfa

| Campaign | Verdict | Evidence | Status |
|---|---|---|---|
| C1 | trace | 1979 offensive against Bucak in Siverek (W1). Nothing found for 1984 to 1986 | verified for 1979; inferred for C1 |
| C2 | trace | No record found | inferred |
| C3 | trace | DK-044 (1992) lets Guerrillas move from Syria-Bekaa to Mardin or Şanlıurfa | verified as a repo card (Moderate) |
| C4 | trace | Not in the HRW list of evacuated villages by province, 1990 to 1993 (W2). The list is partial | verified |
| C5 | trace | DK-090 (Oct 1998) dispersal from Syria to Mardin or Şanlıurfa | verified as a repo card (High) |

Recommendation: keep none.

### 3.3 Adıyaman

| Campaign | Verdict | Evidence | Status |
|---|---|---|---|
| C1 | none | No record found | inferred |
| C2 | none | "Neighbouring province" of the emergency region from Jul 1987 (W7) | inferred |
| C3 | trace | No record of PKK activity found | inferred |
| C4 | trace | Listed under the emergency rule decree in 1994 (W2) | verified |
| C5 | none | No record found | inferred |

Recommendation: keep none.

### 3.4 Elazığ

| Campaign | Verdict | Evidence | Status |
|---|---|---|---|
| C1 | none | No record found | inferred |
| C2 | trace | DK-025: attacks on village schools, Nov 1988, names Elazığ (E-0293, Moderate) | verified as a repo card |
| C3 | trace | No record found | inferred |
| C4 | trace | 24 May 1993 attack on the road "between Elazığ and Bingöl" (W3). DK-059 puts it in Bingöl-Tunceli | verified |
| C5 | none | Left the emergency region about 1994 (W7) | inferred |

Recommendation: keep none. Add a basis note for the Passive Support (Decide 5).

### 3.5 Batman (hinterland / City)

| Campaign | Verdict | Evidence | Status |
|---|---|---|---|
| C1 | trace / none | A PKK-aligned account names a planned front "from Şırnak through Eruh, Baykan, Kozluk to Sason" (W8). Batman was a district of Siirt | inferred (partisan source, summary only) |
| C2 | trace / none | No record found | inferred |
| C3 | contested / contested | 29 Batman villages evacuated, 1990 to 1993 (W2). DK-042 (Oct 1991 votes) names Batman. Journalists killed in Batman in 1992 (W9) | verified (W2, card); inferred (W9) |
| C4 | contested / contested | Deputy shot dead in Batman, 4 Sep 1993 (DK-062, E-0098 High). PKK killing on the Batman-Kozluk road, 12 Jul 1994 (W2) | verified |
| C5 | trace / trace | No record found | inferred |

Recommendation: keep none in 1984. C3 presence already comes from DK-042, DK-054 and DK-062. No new rule is necessary. Note: the archived B and C setups (empty Batman in 1990 and 1993) do not agree with the C3 and C4 evidence.

### 3.6 Van (hinterland / City)

| Campaign | Verdict | Evidence | Status |
|---|---|---|---|
| C1 | trace / none | Çatak (Van) was a planned third target on 15 Aug 1984. The attack did not occur (W8, two source families). DK-010 (1986) can place a Guerrilla in Van hinterland | inferred (summaries only); card verified |
| C2 | trace / none | Van was one of the eight emergency provinces of Jul 1987 (W7) | inferred |
| C3 | contested / trace | 36 Van villages evacuated, 1990 to 1993 (W2) | verified |
| C4 | contested / trace | Van under the emergency rule decree in 1994 (W2). Displaced people moved into Van (W10) | verified (W2); inferred (W10) |
| C5 | contested / trace | A Van hamlet evacuated in 1996 (W10) | inferred |

Recommendation: Van City, keep none. Van hinterland, possible change to the 1984 start (Decide 2).

### 3.7 PUK Zone

| Campaign | Verdict | Evidence | Status |
|---|---|---|---|
| C1 | none | "The KDP gave the PKK facilities in its areas of Iran and northern Iraq." The KDP ordered the PKK out of frontier camps in autumn 1985 (W1) | verified |
| C2 | trace | "by 1988 ... the PKK shifted to the PUK" (W4, no citation there). No source was found for a 1988 PKK-PUK agreement | verified as a tertiary text (Low) |
| C3 | contested | Truce of the KDP, PUK and PKK on 17 Nov 1992 (W3). DK-046, the Oct 1992 attack, is Low (E-0082) and not deck-eligible | verified |
| C4 | contested | Talabani attended the Mar 1993 ceasefire statement (W5). DK-057 and DK-070 place or move pieces to the PUK Zone | verified |
| C5 | strong | In 1997 the PKK was "on friendly terms with the PUK" and later moved to Qandil (W5). DK-082, DK-084 and DK-089 | verified (Low for W5) |

Recommendation: keep none and Tolerant in 1984. Later presence already comes from cards (DK-005 in C1, DK-017 in C2, then C3 to C5).

## 4. Part B: the six spaces

Score swing = the most points one faction can gain there (2 x Pop). Steps = links to the nearest host box.

| Space | Terrain, Pop | Links | Score swing | Steps to a host box | Effect in the first turns |
|---|---|---|---:|---|---|
| Siirt | Mountain, 1 | 4: Şırnak, Batman hinterland, Van hinterland, Bitlis | 2 (1 already PKK) | 2 to KDP | DK-001 and DK-002 (C1) act here. With no State piece, the DK-002 free Attack has no target |
| Batman hinterland | Plain, 1 | 6: the hub of the south | 2 | 2 to Syria-Bekaa | The only way into Batman City. A State Base here adds 1 income |
| Batman City | City, 1 | 1: Batman hinterland | 2 | 3 to Syria-Bekaa | State Train works at once (City). No Guards |
| Van City | City, 2 | 2: Van hinterland, Hakkari | 4 | 2 to KDP | The largest swing of the six. 2 Guerrillas in Hakkari are adjacent |
| Bitlis | Mountain, 1 | 5: links south (Siirt, Batman) to north (Muş, Ağrı-Iğdır) | 2 | 3 to KDP | No State Base, so no Train of regular forces |
| PUK Zone | external | 1: KDP Zone | 0 | n/a | Rally of Guerrillas only at Tolerant. Refuge when the KDP posture closes |

The five domestic spaces hold Pop 6 of 33. All are verified from `map.yaml` and 03 section 4.1.

Key first-turn fact (verified from the rules, not played): on card 1 the PKK can Rally 1 Guerrilla into empty Van City and Agitate twice. Cost 3 of its 5 Resources. Van City goes to Active Opposition and the PKK score goes from 4 to 8. The State needs 6 Resources (Train 2, two shifts 4) to bring it back to Neutral.

### 4.1 Comparison with CT and BW

| Point | Source | Status |
|---|---|---|
| CT Full scenario starts with Support 0 + Commitment 25 and Opposition 5 + Bases 4. Thresholds: more than 35 and more than 30 | CT rules May 2018, Scenario Guide pp. 19-20, rule 7.2 | verified (fetched PDF) |
| Most CT Full sectors are listed "– empty" (18 of 30 by my count from a column-mixed text extract) | same | verified; the count is Moderate |
| Each CT Full sector with an Oppose marker also holds 1 FLN Guerrilla and 1 Base (Phillippeville, Tizi Ouzou, Tlemcen). No sector starts at Support | same | verified |
| CT Short uses a thin contested pair: "Barika: Oppose", 1 Police against 1 Guerrilla | same | verified |
| CT has an Open Deployment option: markers fixed, players place the forces | same | verified |
| The FLN is First Eligible in all CT scenarios | same | verified |
| BW has no Support track and, in Palestine and Cyprus, no Control | `variation-matrix.md` section 4 | verified |
| BW start setups | not in the repo, not fetched | not checked |

Inferred from this table:

1. Empty, unmarked spaces are the CT norm for thin areas. The empty Batman, Van City and Bitlis follow it.
2. Siirt does not follow it: it has an Opposition marker and no PKK piece.
3. The State starts farther from its threshold (21 against 49) than the CT Government (25 against 35).

## 5. The three setups

Rules common to all three:

1. All added pieces come from Available. No other space changes.
2. No Support or Opposition level changes and no track changes. Reason: a level change moves the easy ceiling in 09 section 2.1, which sets the thresholds.
3. All added Guerrillas start Underground (10 section 1 step 3).

### 5.1 Diff against `full-campaign.yaml`

| Space | Current | H Historical | B Balance | T Tempo (favors the PKK) |
|---|---|---|---|---|
| Siirt (Passive Opposition) | empty, no Control | +1 Police, +1 Guerrilla; no Control (1 v 1) | no change | +2 Guerrillas; PKK Control |
| Batman hinterland (Neutral) | empty | no change | +1 Guerrilla; PKK Control | +1 Guerrilla; PKK Control |
| Batman City (Neutral) | empty | no change | no change | no change |
| Van City (Neutral) | empty | no change | +1 Police; State Control | no change |
| Bitlis (Neutral) | empty | no change | +1 Guerrilla; PKK Control | no change |
| PUK Zone (Tolerant) | empty | no change | no change | +1 Guerrilla |
| Tracks | | none | none | none |

Piece totals (map + Available = inventory):

| Piece | Current | H | B | T |
|---|---|---|---|---|
| Police | 16 + 8 | 17 + 7 | 17 + 7 | 16 + 8 |
| Guerrillas | 10 + 20 | 11 + 19 | 12 + 18 | 14 + 16 |
| Domestic Guerrillas | 5 | 6 | 7 | 8 |
| Start scores, State / PKK | 21 / 4 | 21 / 4 | 21 / 4 | 21 / 4 |

Troops, State Bases, PKK Bases and Guards do not change.

### 5.2 Why each piece is there

| Setup | Choice | Traces to |
|---|---|---|
| H | Siirt +1 Guerrilla | Eruh attack, 15 Aug 1984 (DK-001, E-0003 Moderate; 03 section 7 rule 4) |
| H | Siirt +1 Police | Raid "on a police station in Siirt on 17 August" (W6; DK-002, E-0073 Moderate) |
| H | No other change | Part A verdict "none" for Batman City, Van City and the PUK Zone in C1; "trace" on a partisan source only for Batman hinterland |
| B | Van City +1 Police | Rules 1.5 and 3.6.2: stops the one-piece, one-card PKK gain of 4 in the largest swing space. The PKK then needs 2 pieces and 2 actions |
| B | Bitlis and Batman hinterland +1 Guerrilla each | Equal Pop under Control at the start: State 2 (Van City), PKK 2. Not historical (Part A gives none and trace) |
| T | Siirt +2 Guerrillas | Rule 3.3.1: 2 Guerrillas become a Base with one Rally. A second domestic Base is half of the ARGK Formed precondition (DK-015) |
| T | Batman hinterland and PUK Zone +1 Guerrilla each | Hub Control on card 1; a piece already in the refuge when DK-005 closes the KDP. Not historical |

### 5.3 Comparison

All entries are inferred from the rules. None was played.

| | H | B | T |
|---|---|---|---|
| PKK, first turns | Rally 1 more Guerrilla in Siirt for Control, then Agitate (same cost as now). DK-002 Attack now has a target | Rally and Agitate in Bitlis or Batman hinterland with Control already there. Van City needs a March of 2 from Hakkari first | Base in Siirt on card 1 (score 5, income 6). Agitation in two spaces at the first Propaganda round |
| State, first turns | Garrison or Sweep into Siirt keeps a Police there for Civic Action | Train plus Civic Action in Van City from a safe start: +4 for 6 Resources | Must Sweep Siirt and Batman hinterland early or lose both |
| Margin direction against the current setup | Near zero | Toward the State (Van City is safe), partly offset in Bitlis and Batman hinterland | Toward the PKK |
| Main risk | The Siirt Guerrilla plus the DK-001 Guerrilla counts the same raid twice | It is not historical. "Equal Pop" is not proof of fair play | ARGK Formed can come before its Oct 1986 date (the defect in 11 section 1.6 item 1) |
| Confidence in the direction | Moderate | Low | Moderate |

## 6. Validation in a temporary copy

1. The package was copied four times to `/tmp/hob-setup-check` (current, H, B, T). Each copy passed `make validate`.
2. A copy with a wrong Available count failed with `V-PIECES`, so the validator checks the inventory.
3. Paired batch screens: 40 games each, `--swap-seats`, seed 0, four policy pairs (`concentration,sanctuary`; `civic-action,concealment`; `emergency-rule,coerce-only`; `scripted,scripted`).
4. The copy is deleted.

Signals only:

| Signal | Value |
|---|---|
| PKK wins | 40 of 40 in all 16 cells, the current setup included |
| Round 1 margin difference | The same in all four setups for each pair |
| Largest change of the mean end margin against the current setup | 1.5 points toward the PKK (H and B, `civic-action,concealment`) |

Reading: the legacy policies do not act differently in the six spaces, so these screens cannot rank the setups. They also disagree with the `dd22-pilot-after` record (State 65.8% roster average with qualified players). No direction of balance is claimed.

## 7. Thresholds 49 and 30 on the 18-space map

| Faction | Easy ceiling | Maximum (Pop 33) | Headroom / 3 | Method value | In use |
|---|---:|---:|---:|---:|---:|
| State | 32 | 66 + 20 = 86 | 18 | 50 | 49 |
| PKK | 7 | 66 + 12 = 78 | 23 | 30 | 30 |

1. PKK 30 fits. State 49 is 1 low by the method. Cause: 09 section 2.2 still computes with Pop 32 ("2 x 32 = 64") and section 1 still says "13 domestic spaces". DD-22 item 11 kept the thresholds on purpose. Status: verified by arithmetic.
2. H, B and T keep every level, Legitimacy and the domestic Base count. They do not move either easy ceiling.
3. Not changed here (Decide 4).

## 8. Decisions and proposals

Decide:

1. Which setup: keep the current one, H, B or T? Recommended: H.
2. Add 1 Guerrilla in Van hinterland for the Çatak unit? It is outside the Part B scope. Recommended: no, until a readable source confirms the plan.
3. If the current setup stays: accept Siirt at Passive Opposition with no piece, against the CT pattern?
4. State threshold: keep 49 or use the method value 50?
5. Elazığ Passive Support: add a basis note or review the level?

Propose (defects outside this task; no file was edited):

1. `docs/rules/prototype-rules.md` section 6.2 example: "income is 19" and "31" should be 16 and 28 (DD-22 item 10).
2. `09-victory-and-scoring.md`: "13 domestic spaces", "2 x 32 = 64" and "2 in each of 12 spaces" are from the old map.
3. `design-decisions.md` has two headings numbered DD-22 (the map and Ambush).
4. Deck CSV row K-138: the note "Siirt lies in Şırnak" is from the old Botan space.

Files that change if a setup is approved:

1. `game-packages/kurdish-coin/0.1.0/scenarios/full-campaign.yaml`.
2. `docs/rules/prototype-rules.md` section 10.2 (table, Available line, Control sentence).
3. `10-scenarios-and-setup.md` section 2.2 (table, totals, basis notes), then `make rules DIR=<package-dir>`.
4. `sim/test/golden/full-campaign-seed-7.json` plus the piece-count and start-state tests (check `sim/test/kurdish.test.ts`, `sim/test/full-campaign.test.ts`, `sim/src/package/load.test.ts`, `sim/src/server/view.test.ts`).
5. `docs/prototype/README.md` (index row for this file). The package hash changes, so a new experiment manifest is necessary.

## 9. Sources

Repo: chapters 03, 08, 09, 10 and 11, `design-decisions.md`, `prototype-deck.csv`, `map.yaml`, `full-campaign.yaml`, `pivotal.yaml`, `prototype-rules.md`.

| Key | Source | How it was read |
|---|---|---|
| W1 | MERIP, "Between Guerrilla Warfare and Political Murder", 1988. https://merip.org/1988/07/between-guerrilla-warfare-and-political-murder/ | Fetched, quoted |
| W2 | Human Rights Watch, "Forced Displacement of Ethnic Kurds from Southeastern Turkey", Oct 1994, Vol. 6 No. 12. https://www.hrw.org/reports/TURKEY94O.PDF | Fetched, text read. The province list follows the page 6 marker |
| W3 | Wikipedia, timeline of the PKK insurgency (1978 to 2015). https://en.wikipedia.org/wiki/Timeline_of_the_Kurdistan_Workers%27_Party_insurgency_(1978%E2%80%932015) | Fetched, first two thirds only |
| W4 | Wikipedia, "Kurdistan Region-PKK conflict". https://en.wikipedia.org/wiki/Kurdistan_Region%E2%80%93PKK_conflict | Fetched |
| W5 | Wikipedia, "History of the Kurdistan Workers' Party". https://en.wikipedia.org/wiki/History_of_the_Kurdistan_Workers%27_Party | Fetched, first two thirds only |
| W6 | Wikipedia, "1984 PKK attacks". https://en.wikipedia.org/wiki/1984_PKK_attacks | Fetched |
| W7 | Wikipedia, "OHAL region". https://en.wikipedia.org/wiki/OHAL_region | Search summary only |
| W8 | Serbestiyet (https://serbestiyet.com/?p=39304) and an ANF text at Autonomy News (https://autonomynews.org/?p=3485) | Search summaries only |
| W9 | MERIP, "Turkey's Death Squads", 1999. https://merip.org/1999/06/turkeys-death-squads/ | Search summary only |
| W10 | Human Rights Watch, "Displaced and Disregarded", 2002. https://www.hrw.org/legacy/reports/2002/turkey/Turkey1002-11.htm | Search summary only |
| CT | GMT Games, Colonial Twilight rules, May 2018. https://s3-us-west-2.amazonaws.com/gmtwebsiteassets/colonialtwilight/ColTwi-RULES-LR-May2018.pdf | Fetched, text read |

Gaps: no source was found for three items: PKK activity in Adıyaman in any Campaign, Van in 1985 to 1989 and a PKK-PUK agreement in 1988. W3, W4, W5 and W6 are tertiary.

## 10. Verification

| Check | Result |
|---|---|
| Each setup choice traces to a Part A verdict, a repo rule or an axiom | Pass (section 5.2). The B and T pieces trace to rules, not to history |
| Piece counts stay in the inventory | Pass (`V-PIECES` in `make validate`) |
| No "verified" claim without a source | Pass. Search summaries are marked inferred |
| The three setups differ on the stated axes only | Pass. They differ in pieces and Control. No level or track changes |
| The temporary copy validated and was deleted | Pass. Note: `make install` needs Node 24; the default Node 22 of this machine failed |
| Batch screen gives a signal | Fail. The legacy policies are not sensitive to these spaces |

## 11. Next step

Answer Decide 1 (current, H, B or T). After that, the first file to change is `game-packages/kurdish-coin/0.1.0/scenarios/full-campaign.yaml`.
