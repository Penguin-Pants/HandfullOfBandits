# 12 Playtest Plan

Status: plan. No test has happened. Every mechanic in this package has status Hypothesis or Optional module in [mechanic-evidence-links.csv](../data/mechanic-evidence-links.csv). M- IDs below refer to that file. Binding decisions are in [design-decisions.md](../project-management/design-decisions.md).

Inputs merged: Claude `preliminary-design-spec/03-playtest-plan.md` and `04-next-phase.md`, Sol `16-next-development-phase.md` and the test questions in the CT lessons file (`HandfulOfBandits/colonial-twilight-lessons.md`). All three inputs targeted the 1993-1995 prototype. This plan re-targets them to the 1984-1999 campaign (DD-01).

## 1. Purpose

1. Find missing procedures and dominant strategies before more content work.
2. Check that harmful actions never pay in score (M-028; 09, section 7).
3. Decide between the CT initiative track and the Sol alternative on recorded evidence (DD-04).
4. Decide whether the MOD-3B module becomes the default for C3 to C5 (DD-02 flip trigger).

The plan does not measure balance. Ten games can show severe exploits, not equal win chances between asymmetric sides (Sol 16; 13, section A.9). All counts are pass or fail screens.

## 2. Order of scenarios and a change to the build order

Test order:

1. **Stage 0: desk test of Scenario A (1984-1989, C1 and C2).**
2. **Stage 1: desk tests of Scenario B (1990-1995) and Scenario C (1993-1999).**
3. **Stage 2: two-player sessions of A, B and C.**
4. **Stage 3: the full campaign (C1 to C5).**
5. **Stage 4: optional modules (MOD-3B, then MOD-4A, then Concept B).**
6. **Stage 5: outside readers.**

Reason for Scenario A first:

1. It has the fewest systems. Legal Politics, Covert Action, Declare Ceasefire, Serhildan and both State Pivotals are off (10, section 6.2). Errors in the core engine show without noise from late systems.
2. A broken C1 breaks every campaign.
3. It tests the structural switch rules early: Law 3175 and OHAL are mandatory cards in C1 and C2 (M-032).

This differs from 02, section 6, step 1 (C4 slice first). C4 holds the most structural change and is the worst place to find core errors. Chapter 02, section 6 needs a matching change, recorded in the decisions file, before this order is binding.

## 3. Stages

### 3.1 Stage 0: desk test of Scenario A

1. One facilitator plays both sides with open information. This is a rules walkthrough, not a blind test. Do not report it as one (Sol 16).
2. Use the full campaign setup (10, section 2) and piles C1 and C2 (05, section 1.1).
3. After each action, write down the best alternative and why it was worse (Sol 16).
4. Fix each missing procedure through a written design decision, never by a ruling at the table (Sol 16).
5. Play at least 3 deck seeds in each initiative arm (6 games). Plot Legitimacy by round for all games before any tuning (Claude 03, Stage 0).
6. Run the CT initiative comparison (section 6) in this stage, before any other value change.
7. Exit: two clean games with no new missing procedure and the checks in section 5.1 all passed.

### 3.2 Stage 1: desk tests of Scenarios B and C

1. Same method as Stage 0. Scenario B adds Legal Politics, Village Clearance, Covert Action, Declare Ceasefire, Serhildan and (in C4) Area Domination. Scenario C adds Coercive Diplomacy on Syria, Return and Capture (10, sections 4 and 5).
2. Play adversarial strategies (section 7) against each new system.
3. Exit: two clean games per scenario.

### 3.3 Stage 2: two-player sessions

1. Two players with a recorder. Swap sides between games (10, section 8).
2. Minimum: 4 games of A, 4 of B, 4 of C.
3. Fill the logging sheet (section 4) for every game.
4. Do not tune toward the historical result. Keep unexpected results in the log (Claude 03; Sol 16).

### 3.4 Stage 3: full campaign

1. At least 4 full campaigns with sides swapped.
2. Record the first round in which a faction qualifies. A win before the C3 Propaganda round in more than one game in five suggests thresholds are too low (10, section 8).
3. Check that each mandatory card's Always line fires once and only once (10, section 8).
4. Apply the DD-02 passivity measure (02, section 5.1) to every C3 to C5 Propaganda round.

### 3.5 Stage 4: optional modules

1. MOD-3B in C3 to C5 only, with the same card sequences as Stage 2 and 3 (section 8).
2. MOD-4A only after MOD-3B passes (02, section 6, step 6). Tests in 13, section B.5.
3. Concept B map last. Play the same eight-card sequence on both maps (13, section C.5).
4. Change one thing per test (13, rule for all parts).

### 3.6 Stage 5: outside readers

1. Invite readers with knowledge of modern Turkey, Kurdish politics or conflict studies, then readers with relevant civilian perspectives (Claude 03, Stage 3; Sol 16). These are recommended reviewers, not people who have agreed to take part.
2. Review T2 and T3 cards. This stage does not start until an opt-out rule for T2 cards and a survivor-aware review plan exist (Claude 03).

## 4. Logging sheet

One sheet per game. Fields marked (A) are per action; (P) per Propaganda round; (G) per game.

| Field | Level | Purpose |
|---|---|---|
| Scenario, rules version, setup version, deck seed, card order | G | Reproduce the game (Sol 16) |
| Initiative variant (CT or ranked) | G | Section 6 |
| Card, First Eligible, both choices and boxes | A | Streaks, Pass share, responder use |
| Best alternative and why it was worse | A | Meaningful choice (Sol 16; CT lessons) |
| Rules question asked and answer source | A | Clarity |
| Resources, Legitimacy, Europe | P | M-024; M-031; M-013 |
| Emergency Rule step and State step choice | P | M-010 |
| Host postures and Leadership side | P | M-001; M-015; M-030 |
| Legal Space, Offices, Closure filings, successor returns | P | M-007 |
| Ceasefire step, Restraint Broken markers | P | M-008; M-041 |
| Harm counts (State, PKK, Disputed), Coercion, Displacement, Reception, Covert markers | P | M-039; M-040; M-005; M-018; M-009 |
| Both scores, thresholds and margins | P | M-035 |
| Did either player change a decision because of Legal Space or Offices? (yes or no) | P | DD-02 passivity measure |
| Village Clearance, Strike Collaborators, Coerce, Covert Action uses | G | Atrocity test |
| Pieces left in Available at each Reset | P | 04, section 6 |
| Winner, label, round of the end, Negotiated Outcome | G | M-035; M-041 |
| Outcome record sheet (09, section 6) | G | Record only (DD-14.5) |
| Play time and setup time | G | Load |
| Content comments; "Did any card feel wrong?"; "What do you want to check against a source?" | G | Tone (Claude 03, Debrief) |

## 5. Test questions per mechanic

### 5.1 Live from Scenario A

| ID | Question | Pass signal | Source |
|---|---|---|---|
| M-029 | Does the CT track give clear choices without lockouts? | Two readers find the same legal responses for every matrix row. No streak over 4 cards in more than one game in three | 05, section 10; CT lessons |
| M-029 | Is Pass a real option, not a default? | PKK passes no more than half its turns | 05, section 10 |
| M-037 | Does a hidden network have counterplay without being invulnerable? | Both blanket search and sanctuary stacking fail as dominant strategies | CT lessons; Sol 16 |
| M-004 | Can a Controlled space stay politically unsettled? | At least one Controlled space below Passive Support at most Propaganda rounds | CT lessons; 07 |
| M-038 | Does money alone buy consent? | Civic Action is limited by Control, Police or the Legitimacy cap in at least some rounds | CT lessons |
| M-002 | Do Guards add local Control with costs? | Guard upkeep shapes State spending in some games; Strike Collaborators and Guard abuse both occur | Claude M-002 |
| M-006 | Does Strike Collaborators stay net negative in score? | Net score effect 0 or less in every logged use | 06, section 8; 09, section 7.2 |
| M-040 | Is Coerce the cheapest PKK path to victory? | Not in more than one game in three | 09, section 7.3 |
| M-001 | Does closing one host change only that host? | No posture moves except by its own cause | CT lessons example 3 |
| M-012 | Is C1 and C2 hot pursuit too strong? | It cannot end the game by itself | 06, section 8 |
| M-013, M-031 | Does Europe move for reasons both sides feel? | Europe changes by the harm comparison in some games | 07, section 9 |
| M-010 | Does Emergency Rule create a choice? | The State steps the track at least once in some games | 07, section 8 |
| M-032 | Do structural cards fire on time? | Law 3175 and OHAL Always lines fire once each | 10, section 8 |
| M-033 | No anachronism | No C3 tool appears in Scenario A | Sol 16 ("1984 anachronism") |
| M-043 | Is the map readable and reachable? | Two readers produce the same adjacency; Diyarbakır City and Western Cities see play | 03, section 8 |
| M-034 | Is ARGK Formed ever playable? | Playable in at least some games | 05, section 4 |
| M-035 | Do two readers compute the same result? | Same scores, Harm counts and margins from the same board | CT lessons; 09 |
| M-039 | Does the Harm gate bind? | It blocks a win in some games or Harm counts approach the limit | 09, section 8 |

### 5.2 Live from Scenario B (C3 onward)

| ID | Question | Pass signal | Source |
|---|---|---|---|
| M-005 | Does emptying a space ever pay in score? | Relative score change never positive (09, section 7.1 arithmetic on real boards) | CT lessons example 2 |
| M-018 | Do Reception markers create an urban obligation? | Relief spending occurs in some games | 07, section 3.2 |
| M-009 | Is Covert Action a free tool? | Net score effect 0 or less once revealed | 09, section 7.2 |
| M-007 | Is the Legal Politics table mechanical? | Two readers place the same Offices; the State files at least once in some games | 07, section 11 |
| M-027 | Does Legal Politics stay off in C1 and C2? | Never runs before HEP Founded | 10, section 6.1 |
| M-008 | Does the ceasefire path create choices? | Different games reach different ceasefire steps | Claude 03 Q3 |
| M-041 | Is a Negotiated Outcome too easy? | Not more than one game in three ends this way | 07, section 11 |
| M-016, M-044 | Do event-only actors stay outside player control? | No player strategy relies on a Hizbullah or reveal card | Sol 16 |
| M-034 | Is Serhildan playable and not automatic? | Played in some games, not all | 05, section 4 |

### 5.3 Live from Scenario C (C4 and C5)

| ID | Question | Pass signal | Source |
|---|---|---|---|
| M-030 | Are Diplomacy odds sane? | No posture moves more than twice per Campaign by Diplomacy | 06, section 8 |
| M-015 | Does Capture fire correctly and not end the game? | Fires only if Abroad; PKK keeps playing | 10, section 8 |
| M-033 | Is 1998 inevitable? | Syria is not forced to Hostile before C5 by rule | Sol 16 ("1998 inevitability") |
| M-035 | Can the PKK still score after hosts turn? | PKK margin logged at each check in C4 and C5; it is not hopeless in every game | 09, section 8 |
| M-025 | Do judgment cards appear late? | No judgment card before its case | Claude M-025 |

### 5.4 Questions for the debrief

1. Which major actor had decisions shown only as an automatic reaction? (Sol 03; feeds 02, section 5.1)
2. Which State dilemma felt missing? (M-036; 02, section 5.3)
3. Did any rule let one side command an actor that it did not command in history? (Sol 16)

## 6. CT initiative versus the alternative

The CT lessons file calls the initiative system the largest revision. It asks for a test that isolates initiative.

| Item | Arm A (core) | Arm B (comparator) |
|---|---|---|
| Rule | CT track (M-029; 05, section 2) | Sol ranked choice (M-045; Sol 15, "Original test initiative procedure"): Pass below Limited below Event below Full, the smaller choice goes first, equal choices reverse, Pass +1 |
| Everything else | Same setup, deck seed, card order, costs and scoring | Same |

Procedure:

1. Use Scenario A in Stage 0. Play each deck seed once in each arm. Minimum 3 seeds.
2. Change nothing else between arms. Do not change combat, costs or victory in the same test (CT lessons).
3. Record for each arm: longest First Eligible streak, Pass share per faction, number of cards where a player had only one sensible choice and rules questions about eligibility.
4. Run the two-reader matrix check on Arm A (05, section 10).
5. Watch items for Arm A: the Event row and the Pass row of the responder matrix are design choices (05, section 2.3; DD-17). Log every use of those rows and any dispute.
6. Check the Pass contradiction in Arm B: count cards where a pass won priority.

Decision rule:

1. Keep Arm A if it has no streak over 4 cards in more than one game in three and readers agree on the matrix.
2. Switch to Arm B only if Arm A fails both checks and Arm B passes them. Record the change in the decisions file first (DD-04).
3. If both fail, revise the Event and Pass rows of Arm A before any other change.

## 7. Adversarial strategies

Play each one at least once in Stage 0 or Stage 1 (Sol 16):

1. State: force concentration with no Civic Action; Civic Action with minimal security; repeated Emergency Rule steps; Village Clearance at every legal chance.
2. PKK: sanctuary stacking; perpetual concealment; Coerce-only; talks cycling.
3. Legal Politics (B and C): State closure at every chance.
4. MOD-3B: permanent alignment with each armed player; a continuity-only strategy.

For each exploit, decide whether it is numerical (tune it) or representational (redesign it), for example a rule that lets the PKK command a legal party (Sol 16).

## 8. MOD-3B promotion criteria

Run the module only in C3 to C5 (13, section A.1): at least 10 games, as test 3 needs, with the same card sequences as the core games it is compared with.

Promote MOD-3B to the default for C3 to C5 only if all three hold (02, section 5.1):

1. Core games show Legal Politics is passive: in more than half of recorded C3 to C5 Propaganda rounds, neither player changed a decision because of Legal Space or Offices.
2. In most debriefs, legal politics is named as the actor shown only as an automatic reaction.
3. The module passes its own tests (13, section A.9):

| # | Test | Pass |
|---|---|---|
| 1 | Distinct legal options per turn | Mean of 4 or more |
| 2 | Special activity use | Op + SA in at least one third of Legal Movement 1st or 2nd Eligible actions |
| 3 | Own win path | Top margin in at least 2 of 10 games, with a positive PKK margin in at least one |
| 4 | Kingmaker | Fewer than 1 in 4 games where it has no path to win and its later actions change the State and PKK order |
| 5 | Neutrality on C-025 | No State or PKK strategy depends on Legal Movement pieces as its own asset |
| 6 | Load | C3 to C5 play time rises by no more than 25 percent [tune] |
| 7 | Core comparison | The same card sequence in core mode fails the passivity test |

Retire the module and keep the core (02, section 5.2) if tests 1, 3 or 5 fail, if it becomes a routine kingmaker or if a source set shows the legal parties acted as PKK organs.

## 9. Stop rules

Stop play and fix before the next game when:

1. A missing procedure needs a table ruling. Write the decision first (Sol 16).
2. The same rules error occurs three times. Rewrite the rule (Claude 03).
3. Any harmful action shows a positive net score change for its user. Stop all tests until fixed (M-028; 09, section 7).
4. A faction wins with a Harm count above its limit. Treat it as a rules error.
5. A tester reports distress with a card. Mark the card, review its tier and take it to Stage 5 readers (Claude 03).
6. A player has no useful action on three cards in a row more than once per game (Sol 16).
7. Scores cannot be reproduced by a second reader (Sol 16).
8. An exploit found in section 7 wins two games in a row.

Win-rate screen: with two players the chance rate is 50 percent. Flag a side for review if it wins 8 or more of 10 games across swapped seats. This is a screen for a severe problem only. It is not a balance test, and the Claude 60 percent rule for three seats is not used (Sol 16).

## 10. Materials

1. Draft map, generic counters and tracks for the DD-05 map (03; 04).
2. Piles C1 to C5 built under 05, section 1.1. The event chapter (08) is not yet written. Until it exists, use the mandatory structural cards (10, section 6.1) plus clearly labeled fictional neutral prompts. Fictional prompts never count toward the supported-card target (Sol 16).
3. One-page play aid (05, section 8) with the full responder matrix.
4. Logging sheet (section 4) and outcome record sheet (09, section 6).

## 11. Exit criteria and audit trail

The prototype phase ends when:

1. Section 5 questions pass in at least two thirds of the games where they are live.
2. No unresolved ethics issue remains.
3. The initiative decision (section 6) and the MOD-3B decision (section 8) are recorded in the decisions file.

Each test version records which source-based constraint changed, which value changed and why. Factual corrections go to the historical register. Balance changes go to the design log. A mechanical change must not rewrite the history to justify itself (Sol 16).

## Threshold pace test (added after DD-18)

The desk test found a State threshold in C1. DD-18 added two brakes at once: the easy-ceiling threshold (49 / 30) and the Propaganda Civic Action cap (Legitimacy / 2). Test them as separate variables, not together.

1. Run Scenario A with both brakes. Log both scores at rounds 1 and 2.
2. If no faction can reach its threshold by round 5 of the campaign in three games, relax the cap first (back to full Legitimacy) and keep the threshold rule. Reason: the cap is the CT deviation; the threshold rule only fixes how the number is computed.
3. If the State wins at round 2 in more than one game in three, keep both brakes and test a smaller Legitimacy gain on C2 cards (DK-024, DK-026, DK-032) before any other change.
4. Change one variable per test series (CT lessons: isolate the effect).
