# Faction Architecture Decision

Status: records the reasons for DD-02 in [design-decisions.md](../project-management/design-decisions.md). Scores are designer judgments on a 1 to 5 scale. They are not evidence about history and not balance data. No architecture was played.

Inputs merged: Claude `faction-architectures/01-08`, `data/faction-comparison.csv`, `audit/scoring-output/faction_scores.json` and `audit/reviews/R5-coin-designer.md`. Sol `03-faction-configurations.md`, `14-architecture-comparison.md`, `data/faction-comparison.csv` and `audit/independent-critical-review.md`.

## 1. The architectures

Claude scored seven models. Sol scored four configurations and wrote a fifth "challenge model". The table maps them.

| Claude ID | Factions | Sol name | Sol status | Claude status |
|---|---|---|---|---|
| MOD-2 | State, PKK. Legal politics, hosts and Guards as systems | Two factions; Architecture A | Preferred | Fallback |
| MOD-3A | Ankara, Security, PKK | Three factions Ankara-Security-PKK; Challenge model D | Experimental | Rejected |
| MOD-3B | State, PKK, Legal Movement | Three factions State-PKK-Legal; Architecture B | Credible fallback, from 1991 | Recommended |
| MOD-3C | State, PKK, KDP and PUK as one host player | "Joint KDP-PUK player" (prose only) | Rejected: erases rivalry | Rejected |
| MOD-3D | State, PKK, Village Guards and tribes | "Village Guards" (prose only) | Rejected: no common strategy | Rejected |
| MOD-4A | Ankara, Security, PKK, Legal Movement | Four factions; Architecture C | Research experiment | Variant |
| MOD-4B | State, PKK, KDP, PUK | "KDP player" (prose only) | Rejected: moves the game to Iraq | Rejected |

Sol also rejected an "external patrons" player and a Hizbullah seat (Sol `03`, "Three factions: State, PKK and Legal Politics"). Claude has no ID for either. Both stay outside the seat list.

**Attribution conflict.** Sol calls Challenge model D "Claude's preferred architecture" (Sol `14-architecture-comparison.md`, "Challenge model D"). That refers to an older Claude Opus package, which recommended Ankara-Security-PKK at 69 of 85 (row for MOD-3 in `research-final-sol/data/faction-comparison.csv`). The consolidated Claude package renamed it MOD-3A and rejected it at 2.87 of 5. The final record uses the consolidated Claude position.

## 2. Scoring results side by side

### 2.1 Criteria and weights

Both inputs used the same eleven criteria with almost the same weights.

| Criterion | Claude weight | Sol weight |
|---|---:|---:|
| Fidelity | 18 | 20 |
| Agency | 14 | 15 |
| Objectives | 10 | 10 |
| Decisions | 10 | 12 |
| Interaction | 8 | 10 |
| Asymmetry | 6 | 5 |
| Balance | 4 | 5 |
| Replay | 5 | 5 |
| Complexity (5 = lightest) | 10 | 8 |
| Ethics | 10 | 6 |
| Flexibility | 5 | 4 |

### 2.2 Cell scores and totals

| Model | Rater | Fid | Agy | Obj | Dec | Int | Asy | Bal | Rep | Cmp | Eth | Flx | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|
| MOD-2 | Claude | 3 | 4 | 3 | 3 | 3 | 4 | 4 | 3 | 5 | 3 | 5 | 3.54 |
| MOD-2 | Sol | 4 | 5 | 4 | 4 | 4 | 4 | 3 | 4 | 5 | 3 | 5 | 4.16 |
| MOD-3B | Claude | 4 | 3 | 5 | 4 | 4 | 5 | 2 | 4 | 3 | 5 | 3 | 3.89 |
| MOD-3B | Sol | 4 | 3 | 5 | 4 | 4 | 5 | 3 | 4 | 3 | 5 | 3 | 3.89 |
| MOD-4A | Claude | 3 | 3 | 4 | 4 | 5 | 5 | 1 | 5 | 2 | 4 | 2 | 3.45 |
| MOD-4A | Sol | 3 | 2 | 4 | 4 | 5 | 5 | 2 | 4 | 2 | 4 | 2 | 3.31 |
| MOD-3A | Claude | 2 | 3 | 3 | 3 | 4 | 4 | 2 | 4 | 3 | 2 | 3 | 2.87 |
| MOD-3A | Sol | 3 | 3 | 4 | 4 | 5 | 5 | 2 | 4 | 2 | 3 | 3 | 3.44 |
| MOD-4B | Claude | 2 | 3 | 4 | 3 | 4 | 4 | 1 | 4 | 2 | 2 | 1 | 2.73 |
| MOD-3C | Claude | 2 | 2 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | 2 | 2 | 2.49 |
| MOD-3D | Claude | 1 | 1 | 2 | 2 | 2 | 3 | 2 | 2 | 3 | 2 | 3 | 1.89 |

Sources: Claude `data/faction-comparison.csv`; Sol `03-faction-configurations.md` table. Sol totals are the corrected values. The Sol independent review found the first printed means (4.15, 3.96, 3.46, 3.33) did not match the table. It recomputed 4.16, 3.89, 3.44 and 3.31. The ranking did not change (`research-final-sol/audit/independent-critical-review.md`, finding GD01). Sol did not score MOD-3C, MOD-3D or MOD-4B.

### 2.3 What the two scorecards show

1. **The weights do not drive the gap.** Claude cells with Sol weights give MOD-2 3.49 and MOD-3B 3.84. Sol cells with Claude weights give MOD-2 4.15 and MOD-3B 3.93. The order stays with each rater's cells (recomputed for this chapter).
2. **The raters agree on MOD-3B.** Both give 3.89. They differ by one point only on balance.
3. **The raters disagree on MOD-2.** Sol scores it one point higher on fidelity, agency, objectives, decisions, interaction and replay. Claude scores it one point higher on balance. This one row decides the order.
4. **The raters disagree on MOD-3A.** Sol gives 3.44, Claude 2.87. Sol credits it with more objectives and decisions. Claude marks fidelity down because the State acted as one on the PKK [F-026].

### 2.4 Claude sensitivity and perturbation

Claude ran four alternative weight sets (`audit/scoring-output/faction_scores.json`).

| Run | MOD-2 | MOD-3B | MOD-4A | Leader |
|---|---:|---:|---:|---|
| Base | 3.54 | 3.89 | 3.45 | MOD-3B |
| History-heavy | 3.44 | 3.97 | 3.39 | MOD-3B |
| Playability-heavy | 3.64 | 3.70 | 3.42 | MOD-3B by 0.06 |
| Ethics-heavy | 3.42 | 4.17 | 3.57 | MOD-3B |
| Equal | 3.64 | 3.82 | 3.45 | MOD-3B |

A perturbation test changed every cell by -1, 0 or +1 and repeated 5,000 times. MOD-3B ranked first in 79.4 percent of draws, MOD-2 in 13.6 percent and MOD-4A in 6.9 percent (`tools/faction_scoring.py`; `audit/scoring-output/perturb.json`). With uniform noise MOD-3B led in 73.1 percent. Claude's additional runs found two views where MOD-2 leads (Claude `01-evaluation-method.md`, section 7):

1. Balance, complexity and flexibility counted three times: MOD-2 3.88, MOD-3B 3.59.
2. Objectives, asymmetry and ethics dropped (they all reward one addition): MOD-2 3.65, MOD-3B 3.50.

A swap on fidelity alone (MOD-3B 3, MOD-2 4) also reverses the lead. Sol's own fidelity score for MOD-2 is 4.

### 2.5 Single-rater caveat

Each scorecard has one rater. Each rater also proposed the models it scored. The two raters are not independent of each other: both are AI consolidations that read the same inherited packages. Their agreement on MOD-3B is therefore weak evidence. The perturbation tests add random noise per cell. They cannot detect one rater's correlated bias (Claude `08-recommendation.md`, section 3; R5 D12). Objectives, asymmetry and ethics overlap. All three reward the Legal Movement, so one idea may count three times.

Judgment (High): neither scorecard can decide between MOD-2 and MOD-3B. The scores only rule out MOD-3A, MOD-3C, MOD-3D and MOD-4B as main options. Those trail in every Claude run.

## 3. Why the full-campaign scope changes the decision

Both inputs scored their models for a 1993-1995 first test. DD-01 replaces that scope with the full 1984-1999 campaign. Four facts follow.

1. **The legal seat is absent for about 38 percent of the campaign.** No legal pro-Kurdish party existed before HEP, founded 7 Jun 1990 [E-0007; O-030; F-015]. Aug 1984 to Jun 1990 is about 70 of 185 months. In C1 and C2 a Legal Movement player would have no historical basis. Claude's own CSV note says the Legal Movement exists only from 1990. Sol restricted its fallback to 1991 or later.
2. **The C1 and C2 structure needs no third seat.** C1 and C2 hold martial law, the Law 3175 Guards, the KDP break and the move to OHAL [E-0004; E-0160; E-0055]. All of these are State, PKK or host matters.
3. **Flexibility and agency weigh more over fifteen years.** A seat that sits idle for two Campaigns loses agency and flexibility. As an illustration, cut MOD-3B by one point on each. Under Claude cells it falls from 3.89 to 3.70, still above MOD-2 at 3.54. So the scorecard alone does not flip under Claude cells. Under Sol cells MOD-2 already leads.
4. **The split-state models get weaker.** Ankara has little to do in 1984-1987 (Claude CSV note on MOD-3A). The open civil-military splits concern Iraq and Islamism [F-026; F-060]. In C1 and C2, MOD-4A would play as MOD-3A.

Judgment (Moderate): the decision rests on the DD-02 reasons, not on the scorecard. Those reasons are scope (fact 1), the open status of C-025, the CT precedent for keeping institutional tension inside two players and the fragile margin of the MOD-3B lead.

## 4. Final decision (DD-02)

| Role | Architecture | Scope |
|---|---|---|
| Core game | MOD-2: Turkish State and PKK | C1 to C5 |
| Non-player system | Legal Politics (DD-10) | Switches on in C3 |
| Optional module | MOD-3B Legal Movement player | C3 to C5 only |
| Documented experiment | MOD-4A split state with Cohesion track | C3 to C5 only. See 13-optional-modules.md |
| Later map experiment | Concept B hybrid map | Any architecture |
| Rejected | MOD-3A, MOD-3C, MOD-3D, MOD-4B | None |

**Confidence: Moderate.** It is Moderate, not High, because the two scorecards disagree on MOD-2 and neither has a second blind rater.

### 4.1 Why each input moves

1. **Claude** recommended MOD-3B and kept MOD-2 as fallback. Its own build order builds the MOD-2 core first and tests it in Stage 0 (Claude `08-recommendation.md`, section 6). The final decision keeps that order and stops at a decision point after the core.
2. **Sol** recommended MOD-2 and kept a legal third player as fallback. Its promotion test (political outcomes stay passive) becomes the DD-02 flip trigger.
3. Both inputs agree on the path. They disagree only on which side of the decision point to expect.

### 4.2 What the non-player system must do

Sol named the main weakness of MOD-2: the legal actors have no human advocate. The armed players may use the system as a score adjustment (Sol `03`, "Two factions"). The Legal Politics system must therefore:

1. Act on its own schedule each Propaganda round (DD-10; Claude `scenarios-and-victory/03-scenarios.md`, section 3.4 as the base).
2. Not be movable by the PKK (DD-10.5).
3. Charge the State Legitimacy for a ban, at every board state (DD-10.4).
4. Return a successor at the next Propaganda round with fewer Offices (DD-10.3) [F-052].
5. Add to neither armed player's victory score (DD-10.5).

## 5. Flip triggers

### 5.1 Promote MOD-3B to the default for C3 to C5

1. C3 to C5 playtests show Legal Politics decisions are passive or owned by an armed player (DD-02). Measure: in more than half of recorded Propaganda rounds, neither player changes a decision because of the Legal Space or Office state.
2. A post-test review asks which major actor had decisions shown only as an automatic reaction (Sol `03`). Legal politics is named in most sessions.
3. The MOD-3B module passes its own promotion tests (13-optional-modules.md, section A.9).

### 5.2 Keep MOD-2 and retire the MOD-3B module

1. A source set shows the legal parties acted as PKK organs. C-025 would close against autonomy [F-018].
2. The module test shows fewer than four distinct legal options per turn (Claude spec, section 5.3 threshold).
3. The Legal Movement player becomes a routine kingmaker (Sol `14`, "Architecture B").

### 5.3 Reopen the split state (MOD-4A)

1. Primary sources show durable, separate aims for civil and security centers on the Kurdish question [F-026].
2. A review of the 1993 decisions shows institutional, not personal, causes (M-003).
3. Unified State choices repeatedly need policy coordination that institutional constraints cannot show economically (Sol `03`, "Decision and rejection tests").

### 5.4 Revisit the scorecard

1. A second, blind rater scores MOD-2, MOD-3B and MOD-4A with the criteria in section 2.1.
2. Each weight gets a written reason in `tools/faction_scoring.py`.
3. A decision count replaces opinion scores: list the real choices each faction has on a sample turn in 1985, 1993 and 1998 (Claude `08-recommendation.md`, section 3).

## 6. Build order

1. **MOD-2 core, Scenario A first.** Build the State and PKK, the host posture tracks, Guards, Legitimacy, Emergency Rule and Ceasefire. Test Scenario A (C1 and C2) with the CT Initiative track (DD-04), as the playtest plan orders (12). Scenario A has the fewest systems switched on. The 1993-1995 material from both inputs follows in Scenario B (DD-01.2).
2. **Add the other Campaigns.** Add C1 and C2 (no Legal Space) and C3 and C5. Test that the structure changes by rule at each Reset (DD-01).
3. **Add the non-player Legal Politics system** from C3 (DD-10). Test the ban and successor cycle.
4. **Decision point.** Apply the flip triggers in section 5.1 and 5.2.
5. **Test the MOD-3B module** in C3 to C5 (13-optional-modules.md, part A).
6. **Only then test MOD-4A** (13-optional-modules.md, part B). Do not change map, pieces and scoring in the same test (Sol `14`, "Architecture A").
7. **Concept B map** last, against the DD-05 map with the same card sequence (13-optional-modules.md, part C).

This order keeps a working game at every step. If step 5 fails, the project keeps the core from steps 1 to 3. Judgment confidence: High for core-first. Moderate for Scenario A first, because it has the fewest systems but the thinnest card evidence (C1 pool, see 08).

## 7. What this decision does not claim

1. It does not claim the conflict had only two meaningful actors (Sol `03`, "Method and scope").
2. It does not claim the legal parties were or were not independent of the PKK [F-018; C-025].
3. It does not claim the State was unified on every matter. The unity finding covers the PKK and Syria [F-026].
4. It does not claim that either scorecard is evidence.
