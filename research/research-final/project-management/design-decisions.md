# Binding Design Decisions for the 1984-1999 Prototype

Status: binding for every file in `package-b-coin-design/`. A chapter that needs a change to a decision must record the change here first. All numbers are design hypotheses, not historical measures.

Inputs: `research-final-claude` (Claude), `research-final-sol` (Sol) and `HandfulOfBandits/colonial-twilight-lessons.md` (CT lessons). Colonial Twilight (CT) rule numbers refer to the local rules library `research/rules/md/colonial-twilight--rules.md`.

## DD-01 Scope of the prototype

1. The prototype covers the full campaign from 15 Aug 1984 to the end of 1999.
2. Both inputs chose a short 1993-1995 test scenario. That choice is replaced. The 1993-1995 material stays as one part of the campaign.
3. The game has five Campaigns. A Campaign is the Event cards between two Propaganda rounds, as in CT 2.4.1.

| Campaign | Dates | Main structural changes |
|---|---|---|
| C1 | Aug 1984 to Dec 1986 | Martial law. Village Guards from the Law 3175 event. KDP order to leave frontier bases (1985); the full KDP break is dated 1985, 1987 or 1988 by different sources, so its card may fall in C1 or C2 |
| C2 | 1987 to 1989 | OHAL from Jul 1987. Iraqi refugee crisis 1988. SHP expulsions 1989 |
| C3 | 1990 to 1992 | Serhildan. Legal Politics system switches on (HEP, Jun 1990). Northern Iraq vacuum after 1991 |
| C4 | 1993 to 1995 | Ceasefire and collapse. Party closures. Mass village clearance. Operation Steel |
| C5 | 1996 to 1999 | Hosts turn. Syria crisis 1998. Capture Feb 1999. PKK halt Sep 1999 |

Reason: the user scope is 1984-1999. The campaign must work across structural change, so the structure must be in the rules, not in a fixed snapshot.

## DD-02 Factions: two players

1. Two player factions: **Turkish State** and **PKK**.
2. Legal Kurdish politics is a **non-player Legal Politics system** that switches on in C3.
3. The three-player MOD-3B design (Claude) is kept as an **optional module** for C3 to C5. The split-state MOD-4A design is kept as a documented experiment.

Reasons:

1. No legal pro-Kurdish party existed before HEP (founded 7 Jun 1990) [E-0007; O-030]. A Legal Movement seat would have no historical basis for C1 and C2, about 38 percent of the campaign.
2. C-025 (party autonomy from the PKK) stays open. A non-player system can stay independent of both armed players without the game taking a side.
3. CT keeps institutional tension inside a two-player game (CT playbook p.12; CT lessons). Sol and CT lessons recommend two players.
4. Claude's MOD-3B lead rests on one scorer. Its own sensitivity runs show MOD-2 ahead when balance, complexity and flexibility weigh more. Its own build order builds the MOD-2 core first.

Confidence: Moderate. Flip trigger: if the C3 to C5 playtests show Legal Politics decisions are passive or owned by an armed player, promote the MOD-3B module (Sol fallback and Claude preference agree on this path).

## DD-03 One State faction, few institutional tracks

1. The State is one faction. No Cohesion track in the core game. Institutional friction comes from the Emergency Rule track, Legitimacy, event restrictions and Pivotal Event preconditions.
2. The Claude Cohesion track (M-023) becomes part of the optional MOD-4A experiment.
3. CT Commitment is not copied as "political will". CT lessons rejects that transfer.

Reason: fewest moving parts. Claude finding F-026: the cabinet, MGK and General Staff acted as one on the PKK and Syria.

## DD-04 Sequence of play: CT initiative

1. Use the CT Initiative track (CT 2.3.1 to 2.3.6) with boxes Event, Limited Op, Op Only, Op + Special Activity and Pass.
2. The next-card order follows the **first player's** choice only. Op Only or Op + SA hands first place to the other player. Event, Limited Op or Pass keeps it. Both pass: no change.
3. Responder options follow the box adjacency of the CT track. The play aid prints the full matrix. Where CT text does not state a response (after Event or Pass), the design states its own rule and labels it as a design choice.
4. Pass gives State +2 Resources and PKK +1 Resource (CT 2.3.3). This replaces the Sol ranking procedure. It removes the Sol contradiction that "passing sacrifices initiative" while the procedure rewarded passing with priority (CT lessons, "The largest revision").
5. No next-card preview (CT 2.2).
6. The PKK is First Eligible at the start of every scenario and after each Reset (CT 10.0, 6.5).

## DD-05 Map

Thirteen domestic spaces plus external boxes. Pop values are design weights derived from 1990 province totals (Claude Q-004 to Q-125, Low confidence) and rounded on the grouped total (902,396 for Mardin-Batman gives 3.6, so 4). Domestic Pop totals 29 plus 3 for Western Cities. One Pop is about 250,000 people. They are not counts of Kurds.

| Space | 1990s provinces | Type | Pop | Border |
|---|---|---|---:|---|
| Hakkari | Hakkari | Mountain | 1 | Iraq, Iran |
| Botan | Şırnak, Siirt | Mountain | 2 | Iraq |
| Mardin-Batman | Mardin, Batman | Plain | 4 | Syria |
| Diyarbakır City | Diyarbakır (city) | City | 2 | |
| Diyarbakır Rural | Diyarbakır (rest) | Plain | 2 | |
| Şanlıurfa | Şanlıurfa | Plain | 4 | Syria |
| Adıyaman | Adıyaman | Plain | 2 | |
| Elazığ | Elazığ | Plain | 2 | |
| Dersim | Tunceli | Mountain | 1 | |
| Bingöl-Muş | Bingöl, Muş | Mountain | 3 | |
| Van-Bitlis | Van, Bitlis | Mountain | 4 | Iran |
| Ağrı | Ağrı | Mountain | 2 | Iran |
| Western Cities | Istanbul, Ankara, İzmir, Adana, Mersin (abstract) | City node | 3 | |

External boxes:

1. **Syria-Bekaa**: off-map relationship box. Holds PKK Bases and the PKK Leadership marker. State pieces never enter (CT 1.3.4 and 5.1.8 pattern).
2. **KDP Zone** and **PUK Zone**: restricted Northern Iraq spaces. PKK may enter when the host posture permits. State may enter only by the Cross-Border special activity. Pop 0. Never counted for victory.
3. **Iran**: event-only box. No ordinary movement.
4. **Europe**: off-map track for diaspora resources and international pressure.

Batman (1990) and Şırnak (1990) were not provinces in C1 and C2. The space names stay fixed. The scenario notes explain the change. The map chapter prints the adjacency list and checks it against a province boundary map.

## DD-06 Control, Support and Legitimacy stay separate

1. **Control**: a faction Controls a space if its pieces exceed the other faction's pieces (CT 1.7). Village Guards count only in their home space.
2. **Support and Opposition**: each populated domestic space is Active Support, Passive Support, Neutral, Passive Opposition or Active Opposition. Support and Opposition are abstractions of active minorities and mixed attitudes (CT playbook pp.13-14). They do not measure ethnic preference.
3. **Legitimacy**: one national State track (0 to 20). It records domestic and international acceptance of State conduct.
4. No operation converts Control into Support directly (M-004; F-034). Civic Action needs Control, police presence and resources.
5. PKK coercion moves a space toward Neutral, never toward Opposition (CT 3.3.4 Terror pattern).

## DD-07 Civilian harm and displacement

1. Harm markers record civilian harm in a space. They stay until a specified action or event removes them. Each marker names the faction that caused it or "disputed".
2. **Village Clearance** (State special activity) is available only when Emergency Rule is at OHAL or higher and after the OHAL Powers event (KHK 413, Apr 1990) or from C3. It removes Support or Opposition, places a Displacement marker and a Harm marker and places a Reception marker in Diyarbakır City or Western Cities.
3. Displacement never lowers the Pop of a space for victory. The CT Resettle "Pop 0" rule is rejected (CT lessons). A displaced space stays an obligation.
4. No victory condition counts kills, casualties or displacement as a positive (M-028).

## DD-08 Village Guards

1. Guards are local State pieces. They enter play only after the Law 3175 event (Mar 1985) [E-0004].
2. A Guard stays in its home space. It counts for Control there. It cannot move by Sweep, Air Mobility or Redeploy.
3. Guards cost upkeep each Propaganda round.
4. PKK special activity Strike Collaborators removes Guards and places a PKK Harm marker. A removed Guard never becomes a PKK piece (CT Subvert rejected).

## DD-09 Sanctuary as relationships

1. Three host posture tracks: Syria, KDP and PUK. Each moves on its own. Closing one never moves another automatically.
2. Posture steps: Host, Tolerant, Restricted, Hostile. KDP and PUK add "Aligned with Turkey" at the hostile end.
3. Posture affects PKK Rally, March and Bases in that box and State Cross-Border access.
4. State special activity Diplomacy and events move postures. No automatic reset (A Distant Plain 6.6.1 reset rejected, CT lessons).
5. Loss of a host does not delete existing pieces automatically. It suspends Rally and income there.
6. The PKK Leadership marker sits in Syria-Bekaa. Capture of the Leadership is an event effect only, never an operation result.

## DD-10 Legal Politics (non-player, from C3)

1. Legal Space track: Absent (C1 and C2), Open, Prosecuted, Banned.
2. Office markers sit in domestic spaces. They give no Control and do not count as PKK pieces.
3. A ban removes Offices. A successor returns at the next Propaganda round with fewer Offices (M-007; F-052).
4. The State may file a closure case. A ban costs Legitimacy.
5. The PKK cannot move Legal Space or Offices. Offices block PKK Agitation in their space and add to neither faction's victory score. They change the State Legitimacy rules.
6. The rule set takes the Claude 2-faction non-player table (Claude scenarios file, section 3.4) as its base and revises it.

## DD-11 Ceasefire and talks

1. Ceasefire track: None, Declared, Reciprocal Restraint, Talks.
2. Only the PKK declares a ceasefire. A spoiler event or an attack in the same Campaign can end it.
3. Talks never give an instant win. A negotiated outcome needs restraint across a full Propaganda round (Sol V-B, "Negotiation as an outcome").

## DD-12 Emergency Rule track

1. Steps: Martial Law, OHAL, OHAL Extended Powers, Normalizing.
2. Start: Martial Law (Aug 1984). The OHAL event (Jul 1987) [E-0055] moves it to OHAL.
3. Higher steps unlock coercive tools and drain Legitimacy at each Propaganda round.
4. The State may step it down in a Propaganda round. Province-level OHAL changes (Mardin 1996) are event effects [E-0219].

## DD-13 Event deck

1. Deck structure: five piles, one per Campaign. Each pile has 12 Event cards and one Propaganda card shuffled into its bottom third (CT 10.0 uses whole-pile shuffle; with the bottom-third rule a Campaign after C1 runs 8 to 16 cards, see DD-18.5). Piles stack in Campaign order.
2. Each pile is drawn from a Campaign pool of at least 14 deck-eligible cards, so each game sees a different subset.
3. Deck-eligible means: event confidence High or Moderate, and at least one source with status "Verified source" behind the central fact. Other candidates stay in the register as research leads.
4. Up to two Pivotal Events per faction. Preconditions are board states plus an earliest Campaign. Pivotal rules follow CT 2.3.7.
5. Capabilities last the game. Momentum lasts to the next Reset (CT 5.3, 5.4).
6. Sensitivity tiers T0 to T3 from Claude stay. No card gives points for killing.

## DD-14 Victory

1. One primary system for the prototype, CT pattern: thresholds checked in each Propaganda round except the first, then margins after the final round (CT 7.2, 7.3).
2. State score: Total Support plus Legitimacy, with a Harm gate.
3. PKK score: Total Opposition plus PKK Bases in domestic spaces, with a Harm gate on its own coercion.
4. External Bases never count. Pop of external boxes never counts.
5. The Sol V-B outcome profile is a post-game record, not a second scoring system.
6. Thresholds are computed from the campaign setup and labeled [tune].

## DD-15 Evidence and ethics rules for all design files

1. Every mechanic row cites findings or events and has status Hypothesis.
2. No historical figure becomes a piece count or threshold (M-028).
3. Both armed sides carry harm costs. Equal costs do not claim equal acts.
4. A Low-confidence event carries no hard effect. A contested attribution uses a neutral card title.
5. Use the place-name rule from the location registry: Turkish name first, Kurdish name where sourced.

## DD-16 Optional modules may override core rules

1. An optional module in `package-b-coin-design/13-optional-modules.md` may replace a core rule only inside that module. It must list each override.
2. MOD-3B (Legal Movement player, C3 to C5) replaces DD-04 with People Power three-faction eligibility (PP 2.3) and replaces the non-player successor step in DD-10.3 with a player Refound action. All other DD rules apply.
3. MOD-4A (split state) adds a Cohesion track. It does not change DD-07 or DD-14.4: no faction scores pieces removed.

## DD-17 Changes accepted after the rules draft

Source: "Proposed decision changes" in `package-b-coin-design/05-sequence-of-play.md`.

1. DD-13 amended: structural cards (the events that switch on Guards, OHAL, Legal Politics and similar systems) are mandatory in their Campaign pile and are dealt into the top 8 cards of that pile. Their "Always" line applies when the card is revealed. Reason: a structural change must not fall out of a random draw.
2. DD-05 amended: Botan (Şırnak) also borders Syria. The border is recorded but has no movement effect.
3. DD-11 and DD-04 amended: Declare Ceasefire is a PKK action available from C3. It uses the Limited Op box.
4. DD-12 amended: an explicit table in chapter 07 replaces "higher steps". Village Clearance is legal only at OHAL and OHAL Extended Powers.
5. DD-14.3 amended: the PKK Harm count is PKK Harm markers plus Coercion markers.

Playtest watch items from the same draft: the Event and Pass rows of the responder matrix are design choices; Village Clearance costs Legitimacy 2 x Pop at once and 1 at the next round; Coerce can still shift a score, as CT Terror does.

## DD-18 Changes accepted after the independent desk test

Source: `package-b-coin-design/11-critical-design-review.md` and `audit/independent-critical-review.md` (IR-01, IR-02, IR-03, IR-09, IR-10).

1. DD-14.6 amended: the threshold gap starts from the **easy ceiling** (start Support or Opposition spaces at Active, plus start Legitimacy or start domestic Bases), not from the start score. Campaign thresholds: State 49, PKK 30. Reason: with the old rule the State reached 42 in C1 on paper by shifting its safe spaces only.
2. DD-06.4 amended: Civic Action in the Propaganda phase needs Control, Police and Troops (CT 6.3.1). Total spending in that phase is capped at half of Legitimacy, round down [tune].
3. DD-07.2 amended: Village Clearance shifts the space one level toward Neutral, not straight to Neutral. All costs stay. Reason: it could deny a PKK win at a victory check.
4. DD-10.5 amended: an Office caps its space at Passive Support and at Passive Opposition. Agitation is blocked only beyond Passive Opposition. Reason: the old rule hit the PKK only and leaned on one reading of C-025.
5. DD-13.1 corrected: with the Propaganda card at position 9 to 13, a Campaign after C1 runs 8 to 16 cards; C1 runs 8 to 12.
6. DD-17 watch item updated: the CT playbook confirms the Event row of the responder matrix. The Pass row stays a design choice.

## DD-19 Changes accepted after the Scenario B desk test

Source: section 6 of `package-b-coin-design/11-critical-design-review.md` (IR-31 to IR-53).

1. DD-10.4 amended: the Legal Politics table files a closure case by itself when Offices reach the limit (07, section 6.4, line 6). Reason: closure cases were brought by the Chief Public Prosecutor at the Court of Cassation [O-116], not by the cabinet; without this line the State player had no reason to file and the ban and successor cycle stopped (IR-33; F-052).
2. DD-14.2 ratified: each face-down Covert marker counts as State score -2 and State Harm +1 at every victory check (IR-34).
3. DD-11 amended: under Reciprocal Restraint or Talks the PKK may not place a domestic Base (IR-41). Reason: restraint removed the only State tool against Bases.
4. Coerce costs 2 Resources in a space with Pop 3 or more [tune] (IR-38).
5. The Serhildan Pivotal needs Total Opposition 14 or more (IR-40). Reason: the old precondition was met at the Scenario B setup.
6. DD-02 note: the Scenario B run is one data point toward the flip trigger, not a trigger.
7. Deferred to playtest, not changed: the Scenario B State threshold (IR-37; test 46 only after items 4 and 5 are tested) and a Legitimacy drain at Europe 5 (IR-39).

## Decision record

| ID | Claude input | Sol input | CT lessons | Final |
|---|---|---|---|---|
| DD-01 | 1993-1995 prototype S3-P | 1993-1995 test packet | 1993-1995 | 1984-1999 campaign, five Campaigns |
| DD-02 | MOD-3B, fallback MOD-2 | Two players, fallback legal third player | Two players | Two players; MOD-3B optional module from C3 |
| DD-03 | Cohesion track | Unified constraints | Reject Commitment as political will | No Cohesion in core |
| DD-04 | CT track in 2-faction mode | Ranked-choice procedure | Adopt CT pattern | CT pattern |
| DD-05 | Concept A, 15 provinces | Concept A, 8 regions and 2 nodes | Restricted Iraqi spaces, Syria off-map | 13 domestic spaces grouped from provinces |
| DD-14 | System 1 primary | V-A then V-B | Define precise checkpoints | CT thresholds and margins, V-B as record |
