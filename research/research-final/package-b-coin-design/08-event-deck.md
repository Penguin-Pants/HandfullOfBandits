# 08 Event Deck

Status: rules draft. Binding decisions: DD-13 as amended by DD-17.1, DD-15 and DD-16. Every card effect is a design hypothesis with status "Candidate; untested; not balanced; not for print". Card text is in `../data/prototype-deck.csv` (deck IDs DK-001 to DK-100). The candidate register is `../data/event-card-candidates.csv` (K-001 to K-159). CT means Colonial Twilight rules.

## 1. What the deck contains

| Item | Count | Where |
|---|---:|---|
| Campaign pool cards (Events, Capabilities, Momentum) | 91 | Five pools, C1 to C5 |
| Deck-eligible pool cards | 91 | `deck_eligible = yes` |
| Research leads used as pool fillers | 0 | DK-013 and DK-014 were verified in R4 (section 3.3) |
| Pivotal Events | 4 | Two per faction, held in hand |
| Propaganda cards | 5 | One per pile |
| Structural (mandatory) cards | 7 | Inside the pools, marked in `design_note` |

A game uses 60 Event cards (5 piles of 12), 5 Propaganda cards and up to 4 Pivotal Events, as in the CT full scenario (CT 10.0). Pool cards that are not dealt stay out of the game unseen.

## 2. Deck structure and build procedure

The build follows 05, section 1.1. This chapter adds the deck data and the rules for structural cards from DD-17.1.

### 2.1 Build each pile

Do this for C1, then C2, C3, C4 and C5:

1. Take the Campaign's structural cards. They are mandatory (DD-17.1).
2. Shuffle the other deck-eligible cards of that Campaign pool. Draw until the pile has 12 Event cards. Do not use research leads, except in a declared playtest (section 3.3).
3. Shuffle the 12 cards. Deal the top 8 face down.
4. If a structural card is in the bottom 4, swap it with the lowest non-structural card of the top 8. If a chain pair in section 8 ends in a structural card, the earlier card of that pair also counts as structural for this step.
5. Apply the order constraints in section 8 now, before the Propaganda card goes in.
6. Shuffle the Propaganda card into the bottom 4. Put the 8 on top. The Propaganda card is now card 9 to 13 of the pile.
7. Stack the piles with C1 on top.

Cards below a Propaganda card are played in the next Campaign (CT 10.0).

### 2.2 Structural cards

| Deck ID | Card | Campaign | Always line (applies on reveal) |
|---|---|---|---|
| DK-003 | Law 3175 | C1 | Move all 16 Village Guards from Out of Play to Available |
| DK-005 | KDP Orders PKK Out | C1 | If KDP is Host, set it to Tolerant |
| DK-019 | Syria Security Protocol | C2 | If Syria is Host, set it to Tolerant |
| DK-020 | OHAL | C2 | If Emergency Rule is Martial Law, set it to OHAL |
| DK-037 | HEP Founded | C3 | Legal Space to Open. Run Legal Politics lines 3 and 4 twice now |
| DK-040 | Northern Iraq Vacuum | C3 | From now on, Tolerant allows Cross-Border and PKK Bases in the KDP Zone and PUK Zone |
| DK-093 | Capture | C5 | If the Leadership is Abroad, apply Capture (07, section 5.2). If it is Present, do nothing |

Rules:

1. The Always lines copy 10, section 6.1 word for word in meaning.
2. The deck CSV has no Always column. The Always line is printed in the `design_note` field, after the words "structural, mandatory". On a printed card it goes above the two event texts.
3. Card type stays "Event" (DD-17.1). The Always line applies whether or not a faction executes the Event (05, section 5.7).
4. A Pivotal Event played on a structural card does not cancel its Always line (05, section 4, step 4).
5. C4 has no structural card (10, section 6.1).

### 2.3 Capture must not be a dead card

The Capture Always line works only while the Leadership is Abroad. Two cards can flip it: the State Pivotal Coercive Diplomacy on Syria (DK-098) and the pool card PKK Leader Leaves Syria (DK-090). The Capture card also has an unshaded branch for a Present Leadership: Syria posture one step toward Hostile. So Capture always changes the board when the State takes it.

### 2.4 Faction order symbols

Each card prints a two-symbol order, S-P or P-S, in the `faction_order` column. Chapter 05 gives this order no rule role. Eligibility comes from the Initiative track (DD-04). The symbols are kept for a future rule or for an optional module. Each pool has an equal or near-equal split (section 6). This is a gap, not a rule (section 10).

## 3. Eligibility rule and counts

### 3.1 The rule

DD-13.3 says a card is deck-eligible when its event confidence is High or Moderate and at least one source with status "Verified source" stands behind the central fact. The rule as computed:

1. The central event is the first E- ID in the card's `event_ids`.
2. Event confidence is the `confidence` value of that event in `historical-events.csv`. It is not the card's own column.
3. The central fact test passes if at least one source ID is in both the card's `source_ids` and the central event's `source_ids`, and that source has `verification_status` "Verified source" in `source-registry.csv`.
4. Background rows are never eligible. They describe a period, not a discrete event: K-082, K-083, K-103, K-104, K-111 and K-112.
5. All other rows are "research lead".

The result is in the `deck_eligibility` column of the register. The `scenarios` column now holds the Campaign tag from the date (C1 to C5). Background rows get the tag of their period (K-111, dated "1990s", gets C3;C4;C5). Only K-112 (the 1982 Constitution) has no tag, because it predates the campaign. The old S1 to S5 tags are gone, because DD-01 replaced those scenarios.

### 3.2 Counts

| Campaign | Register rows | Deck-eligible in register | Pool in deck | Deck-eligible in pool | Pile size | Draw choice |
|---|---:|---:|---:|---:|---:|---|
| C1 | 19 | 16 | 15 | 15 | 12 | 12 of 15 |
| C2 | 22 | 20 | 18 | 18 | 12 | 12 of 18 |
| C3 | 35 | 24 | 18 | 17 | 12 | 12 of 17 (DK-046 is a research lead since E-0082 fell to Low) |
| C4 | 41 | 34 | 20 | 20 | 12 | 12 of 20 |
| C5 | 43 | 33 | 20 | 20 | 12 | 12 of 20 |

The register holds 159 rows. K-111 is counted in three Campaigns and K-112 in none. Eligible rows that are not in a pool stay in the register as reserves. Examples are the Akdivar judgment [K-090], the Saturday Mothers sit-in [K-060] and Article 8 amended [K-061]. The Pivotal source cards (K-006, K-052, K-053, K-072, K-074, K-114, K-115) leave the pools (section 4).

### 3.3 C1 meets the DD-13.2 minimum

C1 has 15 deck-eligible pool cards. DD-13.2 asks for 14. The C1 register has 16 eligible rows. One of them, K-006, is the source of the ARGK Formed Pivotal, so it cannot also be a pool card. The pool grew from 12 to 15 in the R4 verification:

1. DK-013 Border Attack and Air Raid into Northern Iraq [K-123; E-0165]. Raised from Low to Moderate. Two Turkish press retrospectives give the 15 Aug 1986 air raid [S-0532; S-0533] and a CSM report of 2 Sep 1986 gives the Turkish reprisal claim [S-0534]. The Uludere site comes only from Wikipedia. The card prints no casualty total (C-072).
2. DK-014 Human Rights Association Founded [K-124; E-0164]. Moderate. IHD's own page and a bianet history confirm the date and the 98 founders [S-0531; S-0530]. Both are IHD-derived, so the event stays Moderate. Soft effects only.
3. DK-100 Neighbors Condemn the Raid [K-158; E-0340]. New. Moderate. One contemporary report [S-0534].

The pile holds 12 cards, so each C1 game now draws 12 of 15. The leads no longer fill the pool. K-159 (martial law lifted in 11 more provinces, Mar 1985) is a research lead only: the source text could not be read [E-0341; S-0535].

## 4. Pivotal Events

The four Pivotals and their rules come from 05, section 4. Each faction holds both of its Pivotals from setup (10, section 2.3). The procedure is CT 2.3.7 as written in 05.

| Deck ID | Faction | Pivotal | Earliest | Board precondition | Effect | Evidence |
|---|---|---|---|---|---|---|
| DK-015 | PKK | ARGK Formed | C1 | 8 or more Guerrillas in domestic spaces and at least 2 domestic PKK Bases | Place up to 4 Guerrillas in spaces with PKK Bases. Flip all Guerrillas there Underground. PKK +3 Resources | [E-0075] |
| DK-054 | PKK | Serhildan | C3 | Total Opposition 14 or more; Mardin-Batman or Botan at Opposition (DD-19.5) | Shift up to 3 spaces with PKK pieces and no Office one level toward Opposition (Diyarbakır City may be one). Europe +1 | [E-0173; E-0271; E-0272] |
| DK-076 | State | Area Domination | C4 | Emergency Rule is OHAL Extended Powers; Total Opposition 12 or more | Free Sweep, then free Assault, in up to 3 Mountain spaces. Village Clearance may accompany one of them at normal cost | [E-0202; E-0204] |
| DK-098 | State | Coercive Diplomacy on Syria | C5 | Syria is Tolerant or Restricted; Legitimacy 5 or more | Syria to Hostile. Leadership flips to Abroad. PKK pieces in Syria-Bekaa stay but earn nothing | [E-0124; E-0126; E-0127; E-0018; E-0019] |

Notes:

1. The source cards of each Pivotal left the pools to avoid a double count: K-006 (ARGK), K-013 and K-113 to K-115 (Serhildan), K-052 and K-053 (Area Domination), K-072 and K-074 (Syria warnings).
2. K-075 (the leader leaves Syria) and K-076 (Adana minutes) stay as pool cards. They are separate steps with their own decisions, and K-075 gives Capture a second route.
3. The Serhildan source cards K-013 and K-113 are Low. The Pivotal rests on K-114 and K-115, which are Moderate with a verified source.
4. The Area Domination effect includes Village Clearance, a harm tool. Its costs stay as in 06, section 3.4. The Pivotal gives no discount.

## 5. Capabilities and Momentum

### 5.1 Capabilities (last the game; CT 5.3; DD-13.5)

| Deck ID | Card | Side | Capability |
|---|---|---|---|
| DK-004 | ERNK Founded | Shaded (PKK) | Agitate in a Rally may select a City with a PKK Guerrilla without a PKK Base or PKK Control |
| DK-006 | Chiefs Enter the Guard System | Unshaded (State) | Train may place Village Guards without Police (needs Law 3175) |
| DK-009 | Bekaa Training Academy | Shaded (PKK) | While Syria is Host or Tolerant, Rally in Syria-Bekaa places up to 2 extra Guerrillas |
| DK-022 | Special Strike Force Planned | Unshaded (State) | Air Mobility moves up to 6 Troops among up to 4 spaces |
| DK-091 | Adana Minutes | Unshaded (State) | While Syria is Hostile, Host Pressure may not target Syria |

Five Capabilities use 5 of the 12 markers (04, section 4). The split is 3 State and 2 PKK. The PKK Academy capability switches itself off when Syria turns, so the Syria track decides its value.

The Ban marker from DK-064 (Germany Bans PKK and ERNK) is not a Capability marker. It is the track marker in 04, section 3.6. It stays until an event removes it.

### 5.2 Momentum (lasts to the next Reset; CT 5.4)

| Deck ID | Card | Side | Momentum |
|---|---|---|---|
| DK-007 | ERNK Action Campaign | Shaded (PKK) | Each Rally may Agitate in one extra space |
| DK-010 | Rival Groups Form the TSK | Unshaded (State) | PKK Rally in Mountain spaces places 1 fewer Guerrilla |
| DK-011 | PKK Spring Offensive | Shaded (PKK) | Ambush may select up to 3 Attack spaces |
| DK-038 | KHK 430 | Unshaded (State) | Sweep costs 1 per space at any Emergency Rule step |
| DK-050 | Özgür Gündem Begins Publication | Either side | State: Agitation in Diyarbakır City costs 1 more. PKK: each revealed Covert marker costs Legitimacy 1 more |
| DK-072 | EU-Turkey Customs Union | Shaded (PKK) | Village Clearance costs Legitimacy 1 more |
| DK-074 | US Lending Conditions | Shaded (PKK) | Each Village Clearance also costs 2 State Resources |

Seven Momentum cards fit the 8 Momentum markers.

## 6. Ownership balance

### 6.1 Method

1. Each card has one State side and one PKK side, except three legal-politics cards. Their Office side is owned by neither player (DD-10.5; 07, section 6.2): DK-065, DK-067 and DK-094. Either faction may still choose it (05, section 5.1). It is left out of the balance.
2. Each side has a value in `design_note`: 0 (block only), 1 (weak), 2 (moderate) or 3 (strong). The value is a design estimate for testing, not a measured result.
3. A script summed the values per Campaign and counted the stronger side of each card.

### 6.2 Table

| Campaign | Cards | State value | PKK value | State side stronger | PKK side stronger | Equal | S-P | P-S |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| C1 | 15 | 30 | 30 | 4 | 3 | 8 | 7 | 8 |
| C2 | 18 | 35 | 31 | 7 | 3 | 8 | 9 | 9 |
| C3 | 18 | 32 | 36 | 7 | 6 | 5 | 9 | 9 |
| C4 | 20 | 39 | 37 | 7 | 6 | 7 | 10 | 10 |
| C5 | 20 | 45 | 41 | 10 | 6 | 4 | 10 | 10 |
| Total | 91 | 181 | 175 | 35 | 24 | 32 | 45 | 46 |

Neither faction owns a majority of the value: State 181, PKK 175. The State side is stronger on 35 cards and the PKK side on 24. The remaining 32 cards have equal sides.

### 6.3 How the PKK gap was closed

The Claude input found the PKK thin: in its prototype set the PKK owned 11 sides against 31 for the State. Changes in this deck:

1. Every card has a PKK side. Legal-politics sides that move Offices are never PKK sides, so legal cards give the PKK a Europe or Opposition effect that does not touch Offices.
2. New PKK organization cards in C1: ERNK Action Campaign, Bekaa Training Academy and the spring offensive [E-0158; E-0053; E-0162].
3. Host slack: the Syria protocol, the KDP order and the 1992 accord each have a shaded side where the host keeps hosting [E-0170; E-0160; E-0078].
4. Europe: the Paris conference, the Rome arrest and the US designation give a free Rally on the Europe track [E-0305; E-0130; E-0225].
5. Guard strain without violence: Çukurca villagers return weapons, which removes Guards and places no Harm marker [E-0308].
6. State cost cards: custody abuse reports, Newroz 1992, Şırnak, Lice, the Strasbourg judgments and the migration commission give strong PKK sides [E-0295; E-0183; E-0081; E-0096; E-0231; E-0122].

### 6.4 What the balance does not claim

Equal value does not mean equal acts (DD-15.3). A block-only side has value 0 because the harmer may not gain from its own harm event (section 7). The State has 6 block-only sides and the PKK has 7.

## 7. Sensitivity rules

### 7.1 Tiers

| Tier | Meaning | Pool cards |
|---|---|---:|
| T0 | Law, politics, diplomacy | 55 |
| T1 | Armed clash with combatants | 14 |
| T2 | Violence against civilians or unarmed people | 17 |
| T3 | Contested attribution or covert crime | 5 |

By Campaign, T2 and T3 cards number 1 in C1, 6 in C2, 6 in C3, 4 in C4 and 5 in C5. The C2 count is high because the new 1987 to 1989 records document harm by both sides [E-0293; E-0307; E-0295; E-0300; E-0302].

### 7.2 Rules for card text

1. Name the act plainly: killed, burned, displaced. No euphemism and no glory words. Titles use places and roles, not victims' names.
2. No card gives points or Resources for killing. No card removes a piece and then pays for the removal.
3. A T2 card where one faction caused the harm has a block-only side for that faction. The harmer may take the Event to choose where the Harm marker goes, but gains nothing else. Examples: DK-030 İkikaya and DK-059 Bingöl Road Killings for the PKK; DK-033 custody abuse and DK-043 Newroz for the State.
4. The Harm marker names the faction that caused the harm. Where attribution is contested, the marker is Disputed (05, section 5.8; DD-15.4).
5. Cards print no death or displacement totals. The Playbook gives a range with its source [C-006; C-024; C-029].
6. Unattributed killings follow 07, section 10.1. The executing faction does not choose the target (DK-053).
7. Covert reveals follow 07, section 10.2. Up to 2 markers, at random (DK-079, DK-080).
8. Low-confidence events carry no hard effect (DD-15.4). No Low card is in a pool. DK-013 rose to Moderate in R4.
9. A T2 or T3 card needs a content note in the Playbook before any public playtest.

## 8. Chain and order constraints

Inside a pile, if both cards of a pair are dealt, put the first card above the second. Do this at step 5 of section 2.1, before the Propaganda card goes in, so a swap never crosses it. Step 4 has already put the earlier card of a pair that ends in a structural card into the top 8, so a legal order always exists.

| First | Then | Reason |
|---|---|---|
| DK-028 Paris conference | DK-029 SHP expulsions | The expulsions followed the conference [E-0305; E-0171] |
| DK-040 Northern Iraq Vacuum | DK-041 Operation in Northern Iraq | Post-1991 access |
| DK-046 KDP and PUK attack | DK-047 Large operation with KDP help | Sequence of Oct 1992 [C-031] |
| DK-037 HEP Founded | DK-051 Prosecutor files to close HEP | No case before the party |
| DK-056 PKK ceasefire | DK-057, DK-058, DK-059 | Extension, spoiler and collapse need a ceasefire first |
| DK-061 Attacks in Europe | DK-064 German ban | The ban followed the attack waves [E-0194; E-0064] |
| DK-066 DEP immunity | DK-068 DEP dissolved | Arrests before the ban |
| DK-079 Susurluk crash | DK-080 Susurluk commission | Commission formed after the crash |
| DK-090 Leader leaves Syria | DK-092 Arrest in Rome | Rome needs departure first |
| DK-090 Leader leaves Syria, DK-092 Arrest in Rome | DK-093 Capture | Capture needs the Leadership Abroad. Capture is structural, so DK-090 and DK-092 also go to the top 8 at step 4 of section 2.1; then order them above Capture at step 5 |
| DK-037 HEP Founded | DK-042 Election brings HEP deputies | The election card reads Legal Space |

Cards that need a board state (a Declared ceasefire, an Abroad Leadership, a Closure Case marker) do as much as they can if the state is absent (CT 5.1.3). Most such cards have a fallback in the text.

## 9. Cards with contested attribution or contested facts

| Deck ID | Card | Dispute | Treatment |
|---|---|---|---|
| DK-018 | Killings at Pınarcık | Toll and responsibility [C-045] | Neutral title. Disputed Harm marker |
| DK-021 | Attacks on Rival Newroz Gatherings | Gunmen "generally believed" PKK, no C- ID | Disputed Harm marker |
| DK-049 | Journalists and Press Staff Killed | Perpetrators disputed [F-019] | Disputed marker. Role names |
| DK-053 | Unattributed Killings in the Southeast | Reported security links unproven [F-058]; murder count disputed [C-033] | 07, section 10.1. No chosen target. No total printed |
| DK-059 | Bingöl Road Killings | Who ended the ceasefire [C-020; C-026] | PKK Harm for the killings; no claim about the ceasefire cause |
| DK-062 | Deputy Shot Dead in Batman | Perpetrators [C-035] | Disputed marker. Role names |
| DK-079, DK-080 | Susurluk | Report timing; JITEM existence [C-009; C-010] | Random reveal only |
| DK-085, DK-051 | HADEP and HEP cases | Party autonomy [C-025] | No PKK side moves Offices |
| DK-065, DK-067 | DEP and HADEP founded | Successor framing [C-039] | Neither player owns the Office side |
| DK-091 | Adana Minutes | "5 km" clause [C-028] | Card prints no 5 km rule |

Date disputes with no attribution issue: Law 3175 [C-002], KDP break [C-044], HEP ban [C-001], German ban [C-014], 1993 ceasefire start [C-020], Bar Elias [C-027], 1992 Syria accord [C-043], Operation Hammer start [C-058], 1998 ceasefire [C-040], first suicide attack [C-042], leader's departure from Syria [C-003].

Resolved: 10, section 5.2, note 2 now places a Disputed Harm marker in Mardin-Batman for Pınarcık, as DK-018 does (C-045; DD-15.4).

## 10. Gaps per Campaign

### C1 (Aug 1984 to 1986)

1. The pool now holds 15 deck-eligible cards against the 14 minimum. Draw variety is small: 12 of 15.
2. Most C1 cards rest on one source family (MERIP, S-0246). An independent second source for E-0156, E-0158, E-0161, E-0162 and E-0275 would raise confidence.
3. Leads to verify: the 1985 Court review of Law 3175 [E-0006], strategic village plans [E-0276], the 1986 mass trial [E-0277] and the Mar 1985 lifting of martial law in 11 provinces [E-0341; S-0535, text not read]. The Aug 1986 raid [E-0165] and the IHD founding [E-0164] were verified in R4.
4. Two of the three new R4 events rest on one source each (CSM for E-0340). The Uludere site and the 12 Aug date still rest on Wikipedia alone.

### C2 (1987 to 1989)

1. Three 1987 attacks on villages rest on one pro-government press family and are Low [E-0278; E-0279; E-0281]. They stay leads (K-140).
2. Iran's role in 1987 is Low [E-0166]. The Iran box has no card.
3. The 1989 water threat to Syria is Low and its speaker is unclear [E-0306].
4. The harm cards are dense here. Check in playtest that C2 does not feel like a harm list.

### C3 (1990 to 1992)

1. The Nusaybin funeral that started the Serhildan is Low [E-0173]. The Pivotal rests on the Cizre events.
2. The oath crisis [K-023], the Zaleh internment [K-031] and the 1992 blockade [K-102] are Low.
3. Hizbullah evidence stays thin. One card only, with a fixed procedure.

### C4 (1993 to 1995)

1. The Kulp clash [K-039] is Low. The ceasefire collapse rests on DK-058 and DK-059.
2. The Wiesbaden arson [K-105] has no verified source.
3. Village clearance has no discrete card in the pool, because Area Domination and the Village Clearance special activity carry it. The burned-village report [K-051] and the Tunceli operation [K-053] are reserves or Pivotal sources.

### C5 (1996 to 1999)

1. The Sep 1999 halt is Low [E-0135; K-080]. DK-097 carries it through the Aug 1999 call [E-0239].
2. The 1996 death fast [E-0315] and the 1997 lights-out protests [E-0321] have only bibliographically confirmed sources. They stay leads (K-155, K-156).
3. Protests after the capture [K-110] have no verified source. DK-093 uses them only as a shaded option.
4. Turkey-Israel cooperation [E-0213] is Low and has no card.

## 11. Proposed changes for other chapters

These are proposals for the coordinator. This chapter does not change other files. Items 1, 2, 4 and 5 were applied in 05 and 10 before the independent review. Item 3 was applied by that review (`../audit/revisions-after-review.md`). Item 6 stays open.

1. 10, section 6.2, note 1 says the 1988 Iraqi refugee crisis has no event record. Records now exist: E-0289 and E-0290 (High). Proposed change: replace the note with a reference to DK-024.
2. 10, section 5.2, note 2: Pınarcık marker. Proposed change: Disputed Harm marker, to match DD-15.4 and DK-018. Alternative: keep PKK Harm and drop "contested" from the register flag, citing C-045 ("most sources attribute the attack to the PKK").
3. 05, section 1.1, step 2: add that research leads are not drawn outside a declared playtest (section 2.1 above).
4. 05, section 1.1, step 1 and section 5, item 7 cite "10, section 5" for structural cards. They are in 10, section 6.1. Proposed change: correct the reference.
5. 05, section 1.1, steps 3 and 4 conflict: step 3 adds the Propaganda card, step 4 swaps "before you add the Propaganda card". Proposed change: swap first, then add the Propaganda card, as in section 2.1 above.
6. 05: faction order symbols have no rule role. Proposed change: either remove them from the card layout or give them a role in a later decision.

## 12. Tests

1. Deal 20 piles per Campaign. Count how often each chain pair needs a swap. More than 1 swap per pile on average means the chain list is too long.
2. Track Event choices per faction per Campaign. If either faction takes the Event on fewer than 1 card in 4, its sides are too weak.
3. Track Legitimacy across the five Campaigns with only Events and no Village Clearance. If it reaches 0 before C4, reduce the State cost cards in C3 and C4.
4. Check that no block-only side is ever the best choice for the harmer except to block the other side. If it is, the harm cost is too low.
5. DK-090 at Syria Restricted gives the same result as the State Pivotal Coercive Diplomacy on Syria without its Legitimacy precondition. Count how often the State uses DK-090 to skip the Pivotal. If often, add the Legitimacy 5 test to DK-090.
