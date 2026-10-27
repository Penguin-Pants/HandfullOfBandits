# Independent Critical Review

Scope: `package-b-coin-design/03` to `10`, `data/prototype-deck.csv`, binding decisions DD-01 to DD-17 and a factual sample of `package-a-historical-research/`. Method: a Stage 0 desk test of Scenario A (first 8 C1 cards and the first Propaganda round), arithmetic checks of all setups and thresholds, and a review from eight perspectives. The narrative and the desk-test log are in `../package-b-coin-design/11-critical-design-review.md`. Fixes and proposed decision changes are in `revisions-after-review.md`.

Severity: Critical (breaks the game or its ethics rule), Major (strong distortion or dominant line), Moderate (ambiguity or bias that changes play), Minor (text, label or reference). Line numbers are after the fixes.

## 1. Findings

| ID | Perspective | Severity | File:line | Defect | Action |
|---|---|---|---|---|---|
| IR-01 | Playtester, COIN designer | Critical | 07-political-civilian-and-sanctuary-systems.md:23 | Propaganda Civic Action needed only Control and Police. Desk test: State score 43 in round 1 against a threshold of 42. 07 cites CT 6.3.1, which needs Troops and Police | Partly fixed: Troops needed in the Propaganda phase [tune] for CT fidelity; 05:165 and play aid updated. A State that plans for the rule still scores 42 in round 1, so the pace risk stays (IR-02) |
| IR-02 | Quantitative | Critical | 09-victory-and-scoring.md:25 | One-third rule gives equal gaps, not equal difficulty. State Support sits in safe spaces. With the IR-01 fix the State still reaches 42 in round 1 on paper | Open. Thresholds are [tune] (DD-14.6). Test Civic Action cap Legitimacy / 2 or a contested-maximum threshold (11, section 5) |
| IR-03 | Ethics | Major | 06-operations-and-special-activities.md:123 | Village Clearance sets a space to Neutral. Relative score never rises, but at a threshold check it can deny a PKK win: emptying a space pays in outcome | 09:154 now names the limit. Proposed DD-07.2 change: shift one level toward Neutral |
| IR-04 | COIN designer | Major | 03-map-and-spaces.md:46 | Western Cities lockout: no March, City Rally only at Neutral or Opposition, starts at Passive Support, no card touches it. 3 to 6 State points safe all game | Fixed: PKK may Rally in Western Cities at Passive Support [tune]; 06:156 |
| IR-05 | COIN designer | Major | 05-sequence-of-play.md:97 | ARGK precondition "8 or more Guerrillas on the map" counts external boxes (10 setup totals), so the 1986 Pivotal was legal on card 1 of Aug 1984 | Ambiguity fixed in 05, 08:105 and deck row DK-015: 8 Guerrillas "in domestic spaces". "Domestic" alone left ARGK legal and dominant on card 2, so 2 domestic PKK Bases are now also needed. Timing stays a watch item |
| IR-06 | Quantitative, playtester | Major | 05-sequence-of-play.md:132 | Income gap about 19 v 6 per round at start, against a 2 to 1 cost gap. The State runs dry by card 4 of C1, then floods | Open watch item. Log income per Campaign (11, section 5) |
| IR-07 | COIN designer | Major | 06-operations-and-special-activities.md:26 | Train option 3 turns 2 Police into a State Base for 2 Resources. In a Pop 4 Plain space it adds 4 income at every round | Open. Test "State Control, a State Base and Troops" for the income term |
| IR-08 | COIN designer | Moderate | 05-sequence-of-play.md:151 | Martial Law and OHAL drain -1, always offset by the +1 restraint gain while no Displacement marker flips. Emergency Rule costs nothing in C1 and C2 | Open proposal: restraint gain only if the State placed no Harm marker this Campaign |
| IR-09 | Kurdish studies | Moderate | 07-political-civilian-and-sanctuary-systems.md:18 | Offices block all PKK Agitation but only cap State Support at Passive. The mechanic leans on the open question C-025 | Proposed DD-10.5 change: cap both sides at Passive |
| IR-10 | Quantitative | Moderate | project-management/design-decisions.md:139 | DD-13.1 says a Campaign has about 9 to 12 cards. With Propaganda at position 9 to 13, Campaigns 2 to 5 have 8 to 16 cards | Proposed DD-13.1 text change |
| IR-11 | Playtester | Moderate | 10-scenarios-and-setup.md:18 | Setup did not state whether Guerrillas start Underground or Active | Fixed: all start Underground (CT 1.4.3) |
| IR-12 | Playtester | Moderate | 06-operations-and-special-activities.md:72 | Air Mobility "among up to 3 spaces" did not say whether origins count | Fixed: origins and destinations count (CT 4.2.2 pattern) |
| IR-13 | Ethics | Moderate | 09-victory-and-scoring.md:167 | 09, section 7.2 scored only direct effects. Harm actions can flip Control and so open Civic Action or Agitation | Fixed: indirect effect named, log rule added |
| IR-14 | Traceability | Moderate | 05-sequence-of-play.md:17 | Deck-build step claimed a pool of at least 14; C1 has 12 (DD-13.2 shortfall) | Fixed: C1 exception and research-lead rule added |
| IR-15 | Traceability | Minor | 05-sequence-of-play.md:51 | Event row of the responder matrix labeled "design choice". The CT playbook twelfth-card example confirms Op + SA or Pass | Fixed label. Proposed DD-17 watch-item text change |
| IR-16 | COIN designer | Minor | 05-sequence-of-play.md:61 | Note 1 offered "take the Event box and then pass", a British Way option (BW 2.3.3) that the CT track does not have | Fixed |
| IR-17 | COIN designer | Minor | 05-sequence-of-play.md:62 | Responder location count after a Limited Op follows CT 2.3.2, but the CT 2.3.5 clarification can be read as one location | Labeled as design choice |
| IR-18 | Traceability | Minor | 03-map-and-spaces.md:19 | Botan border cell pointed to "note 3" (terrain) and omitted Syria; note 2 said DD-05 lists Iraq only, but DD-17.2 accepted the Syria border | Fixed both |
| IR-19 | Traceability | Minor | 03-map-and-spaces.md:12 | Pop source list omitted Q-012, which the Ağrı row cites | Fixed |
| IR-20 | Traceability | Minor | 08-event-deck.md:245 | "Known mismatch" on Pınarcık was resolved in 10 but still listed; section 11 items 1 to 5 already applied | Fixed: 08:245 and 08:283 |
| IR-21 | Traceability | Minor | data/prototype-deck.csv:19 | DK-018 note said 10 uses a PKK Harm marker; DK-024 note (line 25) said 10 predates E-0289 and E-0290 | Fixed both notes |
| IR-22 | Traceability | Minor | 05-sequence-of-play.md:256 | "Proposed decision changes" still read as open; all five are DD-17 | Fixed: status line |
| IR-23 | COIN designer | Minor | 06-operations-and-special-activities.md:188 | Attack with 6 or more Guerrillas always succeeds (same as CT 3.3.3) | Logged only |
| IR-24 | Ethics | Minor | data/prototype-deck.csv:19 | DK-018 PKK side (contested killings) allows a Redress anywhere for 2 Resources. Same price as Agitation Redress, so no discount | Logged only |
| IR-25 | Historian | Minor | data/prototype-deck.csv:27 | Three C2 cards each give Legitimacy +2 (DK-026, DK-032, DK-024). Each is sourced, but together they tilt 1987 to 1989 toward State Legitimacy | Watch in play |
| IR-26 | Traceability | Minor | data/historical-events.csv:101 | E-0082 confidence field is Moderate; its notes say Low until a primary source is seen | Fixed by the coordinator: confidence set to Low; conflict-analysis 02 updated |
| IR-27 | Traceability | Moderate | package-a: conflict-analysis/02-pkk-strategy-and-instruments.md:66 | Stated that the Dec 1995 ceasefire "had not formally ended". E-0112 notes record the duration as disputed | Fixed: disagreement stated, F-039 added |
| IR-28 | Traceability | Minor | package-a: causal-model/02-feedback-loops.md:149 | HRW link from the Mumcu killing to a commission stated flat; E-0088 notes could not confirm it | Fixed |
| IR-29 | Traceability | Minor | package-a: civilian-and-political-dynamics/03-turkish-politics-and-civil-military-relations.md:79 | NSC reform package "rests on tertiary and press reports"; E-0091 notes say no source confirms an NSC presentation | Fixed |
| IR-30 | Traceability | Minor | package-a: civilian-and-political-dynamics/02-legal-politics-and-party-closures.md:12 | Article 8 amendment date stated flat; E-0211 notes give a one-day uncertainty | Fixed |
| IR-31 | Ethics, COIN designer | Major | 05-sequence-of-play.md:112 | Scenario B desk test, card 6: either faction could execute either event side, so the PKK took DK-051 unshaded, filed the closure case and forced a ban that cost the State Legitimacy. DK-060, DK-066 and DK-068 allow the same. This breaks DD-10.5 | Fixed: 05, section 5.1 exception; the PKK may not execute sides that file, ban, remove Offices or move Legal Space. Non-player Office sides stay open (08, section 6) |
| IR-32 | Kurdish studies | Moderate | 07-political-civilian-and-sanctuary-systems.md:155 | Line 4 excluded spaces at Active Support but not at Active Opposition. Card 5 placed an Office in Mardin-Batman at Active Opposition, and the text did not say what the cap does on arrival. Under one reading the system cut the PKK by 4 only | Fixed: no Office in a space at either Active level; 07:18 states that the cap stops later shifts |
| IR-33 | COIN designer | Major | 07-political-civilian-and-sanctuary-systems.md:142 | After IR-31, only the State holds a Legal Politics decision. With Offices paying it Legitimacy +1, a sensible State never files unless a cap blocks a space it needs. Card 15: nobody took the non-player successor side of DK-067. Evidence toward the DD-02 flip trigger | Open. Proposed DD-10.4 change (automatic filing line) in `revisions-after-review.md` |
| IR-34 | Ethics | Major | 09-victory-and-scoring.md:69 | Face-down Covert markers did not count at a victory check. Scenario B has its only check before the final reveal, so a State could win with unpaid Covert costs. 09, section 7.2 said "always by the end" | Fixed: each face-down marker counts as -2 State score and +1 State Harm at a check; 05:128 and 09 section 7.2 updated |
| IR-35 | Ethics, playtester | Major | 04-pieces-tracks-markers.md:62 | Legitimacy stops at 0. In the C3 round the ban cost 1 of its 2 points; on card 15 a State breach of Reciprocal Restraint at Legitimacy 0 cost nothing. A State at 0 has no restraint cost | Fixed: an unpaid Legitimacy point costs the State 2 Resources [tune] |
| IR-36 | COIN designer | Major | 03-map-and-spaces.md:46 | The IR-04 fix allowed PKK Rally in Western Cities at Passive Support only. Card 2 put Western Cities at Active Support, and after that no PKK action could reach it: 6 safe State points | Fixed: Rally at Passive or Active Support; 06:156 [tune] |
| IR-37 | Quantitative | Major | 09-victory-and-scoring.md:60 | Scenario B State threshold 48 was out of reach: State 26 at card 2, 14 at the C3 Victory phase point, 10 after the C3 round. PKK 26 against 41. Estimate without the harm tools and the PKK filing: State about 18 to 24 | Open. Do not retune before IR-38 and IR-39 are tested; proposal in `revisions-after-review.md` |
| IR-38 | COIN designer | Major | 06-operations-and-special-activities.md:195 | Card 8: two Coerce actions for 2 Resources moved Şanlıurfa and Van-Bitlis to Neutral, -8 State. The markers then block recovery. Coerce is the cheapest way to deny the State threshold (09, section 7.3 watch item) | Open. Proposal [tune]: Coerce costs 1 more in a space with Pop 3 or more |
| IR-39 | Quantitative | Moderate | 04-pieces-tracks-markers.md:76 | Europe reached 5 by card 10 and stayed. Levels 4 and 5 have the same effects, so later gains are lost. Diplomacy on Europe needs a natural 6 at Legitimacy 5 or less; Diplomacy on Syria before C5 cannot succeed at that Legitimacy (needs 7) | Open. Proposal: Europe 5 drains Legitimacy 2 [tune]; print the Syria odds on the aid |
| IR-40 | COIN designer | Moderate | 05-sequence-of-play.md:98 | Serhildan precondition is met at the Scenario B setup (Total Opposition 10, Mardin-Batman at Opposition). Card 1 play before any Office gave +11 for 0 Resources. Same pattern as IR-05 | Open. Proposal needs 08, section 4 to change with 05 and DK-054 |
| IR-41 | COIN designer | Moderate | 07-political-civilian-and-sanctuary-systems.md:176 | Reciprocal Restraint removes State Assault, the only tool against a domestic PKK Base, and leaves the PKK Rally, Agitate and Extort open. Cards 12 to 14: the PKK added 2 Bases under restraint | Open. Proposal [tune]: under Reciprocal Restraint or Talks the PKK may not place Bases |
| IR-42 | COIN designer | Moderate | 07-political-civilian-and-sanctuary-systems.md:183 | Declare Ceasefire costs no Resources, keeps the PKK First Eligible, gives Europe +1 and could be ended at the step for free, then declared again | Fixed: the PKK pays Europe -1 when it ends a ceasefire it declared [tune] |
| IR-43 | COIN designer | Moderate | 06-operations-and-special-activities.md:90 | Cross-Border with Sweep has no lasting effect at Tolerant or Restricted: Op + SA hands the PKK the next card, and one Rally at the zone Base flips the Guerrillas back. Card 16: Cross-Border Assault worked only because Extort had activated the zone | Open. Proposal [tune]: after a Cross-Border Sweep the State may Assault in the same zone at normal cost |
| IR-44 | Traceability | Moderate | 07-political-civilian-and-sanctuary-systems.md:213 | The step list left out OHAL to OHAL Extended Powers (allowed by 8.2, item 2 and 10, section 6.2). "(free)" had no clear scope. "Never back to Martial Law (DD-12.4)" cited a DD that does not say it | Fixed: full step list, cost stated, citation replaced by "design choice" |
| IR-45 | Traceability | Moderate | 06-operations-and-special-activities.md:163 | Rally option 2 allowed external Bases only at Host, against the Northern Iraq Vacuum Always line and 07, section 5.1 | Fixed: Tolerant in the KDP Zone and PUK Zone after the Vacuum |
| IR-46 | Historian, ethics | Moderate | 06-operations-and-special-activities.md:110 | Card 4: Village Clearance in Hakkari cost Legitimacy 2 now, 1 later and the +1 restraint gain, for PKK -1 and a Rally block that was never tested. Outside threshold denial it is always dominated, so the game cannot make the 1992 to 1995 clearance campaign a rational choice | Logged. Intended by DD-07 and DD-18.3. Record its use per game (09, section 6) |
| IR-47 | Playtester | Minor | 07-political-civilian-and-sanctuary-systems.md:227 | DK-053 and 07, section 10.1: "eligible space" was undefined and three Pop-2 spaces could tie | Fixed: Office priority across the four spaces, then Guerrilla; tie order stated |
| IR-48 | Traceability | Minor | 07-political-civilian-and-sanctuary-systems.md:142 | DK-037, DK-065 and DK-068 place the Closure Case marker but do not set Legal Space to Prosecuted, unlike 07, section 6.3 and DK-051 | Fixed: rule in 07, section 6.3 covers every event that places the marker |
| IR-49 | Playtester | Minor | 07-political-civilian-and-sanctuary-systems.md:179 | Card 12: whether an event-granted free Attack with Ambush (DK-052 shaded) breaks a ceasefire was not stated | Fixed: free actions from events count |
| IR-50 | Traceability | Minor | 04-pieces-tracks-markers.md:108 | Office row said "Blocks PKK Agitation", stale after DD-18.4 | Fixed |
| IR-51 | Traceability | Minor | 06-operations-and-special-activities.md:48 | Sweep allowed domestic spaces only, but Cross-Border conducts a Sweep in the KDP Zone or PUK Zone | Fixed: exception stated |
| IR-52 | Playtester | Minor | data/prototype-deck.csv, DK-057 | DK-057 unshaded: unclear whether Legitimacy +1 applies when the Ceasefire is not Declared | Fixed: +1 only with the acceptance |
| IR-53 | Ethics | Minor | 09-victory-and-scoring.md:166 | Card 8: Strike Collaborators removed the Bingöl-Muş Guard and gave the PKK Control there. Extort in that space then paid 1 Resource on cards 12, 14 and 15. Harm paid in Resources (IR-13 pattern) | Logged. Count in the 09, section 7.2 log |

Counts: Critical 2, Major 5, Moderate 8, Minor 15 (30 findings). Fixed 19 (IR-01 and IR-05 partly). Open 8 (IR-02, IR-03, IR-06, IR-07, IR-08, IR-09, IR-10, IR-26). Logged only 3 (IR-23, IR-24, IR-25). Scenario B desk test block (IR-31 to IR-53, 11 section 6): Major 7, Moderate 9, Minor 7 (23 findings). Fixed 14, Open 7 (IR-33, IR-37, IR-38, IR-39, IR-40, IR-41, IR-43), Logged only 2 (IR-46, IR-53). All 53 findings: Critical 2, Major 12, Moderate 17, Minor 22.

## 2. Determinism, false balance and the atrocity rule

1. Determinism: seven mandatory structural cards fix the institutional changes. Host and capture cards are conditional or two-sided. Risk moderate. Do not tune toward the historical outcome.
2. False balance: the inventory ratio (about 2 to 1) and equal Harm limits are labeled as design, and DD-15.3 is stated. Risk moderate. Card text must keep the evidence level of each act.
3. Atrocity rule: no direct score for removal or harm (09, section 7). Two indirect routes found: threshold denial by Village Clearance (IR-03) and Control flips from harm actions (IR-13). Neither adds points. Both can change outcomes.

## 3. Factual sample

Thirty sentences from 20 files of `package-a-historical-research/` were checked against their cited rows in `historical-events.csv`, `findings.csv`, `quantitative-claims.csv`, `sources/contested-claims.md` and `sources/source-registry.csv`. Every cited ID exists. No date or number differs from its row.

| # | File:line | Claim (short) | IDs | Verdict |
|---|---|---|---|---|
| 1 | civilian-and-political-dynamics/01-kurdish-civilians-and-identity.md:55 | Nine houses at Kelekçi burned 10 Nov 1992, accepted by the ECtHR | E-0191; E-0218; Q-220 | Match |
| 2 | actor-encyclopedia/08-other-kurdish-and-islamist-groups.md:37 | 1978 KDP attack on a PUK unit damaged KDP-linked parties | F-004; E-0038 | Match |
| 3 | actor-encyclopedia/08-other-kurdish-and-islamist-groups.md:50 | Apr 1995 commission reported links; HRW first called for inquiry in 1992 | E-0109; E-0087 | Match (E-0109 notes a 1993 v 1995 date question) |
| 4 | chronology/04-chronology-1994-1999.md:227 | Duma backs the asylum request, 4 Nov 1998 | E-0333; S-0485 | Match |
| 5 | chronology/04-chronology-1994-1999.md:180 | Akdivar judgment 16 Sep 1996 | E-0218; S-0113; S-0285 | Match |
| 6 | civilian-and-political-dynamics/05-diaspora-and-international-networks.md:43 | US designation covered 30 organizations | Q-378; E-0213 | Match |
| 7 | civilian-and-political-dynamics/04-media-law-and-language-rights.md:11 | Law 2932 of 19 Oct 1983 | E-0051; S-0242 | Match |
| 8 | actor-encyclopedia/07-neighboring-and-external-states.md:43 | Arrest in Rome 12 Nov 1998 on a German warrant | E-0130 | Match |
| 9 | causal-model/02-feedback-loops.md:149 | Mumcu killing prompted a commission | E-0088 | Overstated; fixed (IR-28) |
| 10 | conflict-analysis/02-pkk-strategy-and-instruments.md:111 | KDP and PUK attacked the PKK on 4 Oct 1992 (Moderate) | E-0080; E-0082; F-041 | Minor mismatch; data fix proposed (IR-26) |
| 11 | conflict-analysis/02-pkk-strategy-and-instruments.md:66 | 1996 attack fell inside a ceasefire that had not ended | E-0116; E-0112 | Overstated; fixed (IR-27) |
| 12 | conflict-analysis/04-violence-and-human-rights.md:30 | Menteş judgment: Art 8 violation | E-0226 | Match |
| 13 | historical-background/02-kurdish-question-to-1978.md:150 | Law 2935 adopted 25 Oct, published 27 Oct 1983 | E-0052; C-019 | Match |
| 14 | historical-background/02-kurdish-question-to-1978.md:39 | Faik Bucak killed by unknown attackers in 1966 | E-0028; E-0027 | Match |
| 15 | chronology/03-chronology-1990-1993.md:123 | Extraordinary MGK in Diyarbakır, 27 Aug 1992 | E-0188; S-0323 | Match |
| 16 | historical-synthesis/01-synthesis.md:54 | Force doubled to 110,000 by Aug 1989; 258 incidents | E-0301; Q-421; Q-422 | Match |
| 17 | historical-synthesis/01-synthesis.md:68 | UN Res 688 Apr 1991; strikes Aug 1991 and Oct 1992 | E-0310; E-0077; E-0083; C-022 | Match |
| 18 | actor-encyclopedia/09-individuals.md:144 | Cem Foreign Minister 1997 to 2002 | A-063; S-0014; E-0019 | Match |
| 19 | chronology/01-chronology-1920-1983.md:104 | Feb 1983 frontier agreement with hot pursuit; expired 1988 | E-0154 | Match |
| 20 | actor-encyclopedia/01-turkish-state-institutions.md:47 | MGK discussed options against Syria, 30 Sep 1998 | E-0126; S-0089 | Match |
| 21 | conflict-analysis/05-ceasefires-and-negotiation-attempts.md:78 | 33 soldiers killed 24 May 1993 | E-0093 | Match |
| 22 | actor-encyclopedia/02-armed-forces-gendarmerie-and-special-units.md:12 | Steel 20 Mar 1995, about 35,000 troops | E-0108; Q-342; E-0120; E-0121 | Match |
| 23 | actor-encyclopedia/02-armed-forces-gendarmerie-and-special-units.md:42 | 2,500 special team members in Feb 1992 | Q-181; E-0173 | Match |
| 24 | geography-and-economy/03-economy-and-displacement-economics.md:120 | Köylüoğlu figure of 2,000,000 to Oct 1994 (Low) | Q-277; Q-386 | Match |
| 25 | chronology/05-aftermath-after-1999.md:40 | 2015 Eskişehir acquittal of eight | E-0249; S-0151 | Match |
| 26 | actor-encyclopedia/03-pkk-and-affiliates.md:46 | Ceasefires 1993, 1995, 1998; none recognized | E-0089; E-0112; E-0123; F-039 | Match |
| 27 | actor-encyclopedia/05-village-guards-and-tribes.md:43 | About 90 percent of guards from tribes (Low) | Q-346 | Match |
| 28 | civilian-and-political-dynamics/02-legal-politics-and-party-closures.md:12 | Article 8 amended 27 Oct 1995 | E-0211; Q-374 | Minor mismatch; fixed (IR-30) |
| 29 | civilian-and-political-dynamics/03-turkish-politics-and-civil-military-relations.md:79 | Özal died 17 Apr 1993; NSC package | E-0091 | Minor mismatch; fixed (IR-29) |
| 30 | geography-and-economy/02-demography-and-province-data.md:30 | Bingöl 1990 population 250,966 | Q-023; Q-026 | Match |

Result: 24 Match, 3 Minor mismatch, 3 Overstated, 0 Mismatch, 0 missing IDs.
