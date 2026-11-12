# Test scenarios

One or more concrete game states for the Blocker and each Major finding in `AUDIT_REPORT.md`. Each state says what to set up, what to do and which results differ.

None of these was run in the simulator. They come from the rules text and the engine source. Use them as bot or manual test cases.

Section numbers refer to `docs/rules/prototype-rules.md`.

## B-01 Negotiated Outcome cannot happen before the final round

**T-B01-a: Scenario B, best case**

1. Setup: Scenario B (10.6). Ceasefire None.
2. C3, card 1: the PKK is First Eligible and Declares Ceasefire in the Limited Op box. Ceasefire is Declared. Europe 3.
3. No breach for the rest of C3. HEP Founded is revealed, so Legal Space is Open.
4. Round 1, ceasefire step 1: the State accepts. Ceasefire is Reciprocal Restraint.
5. No breach in C4.
6. Round 2 (final), step 2: both vote yes. Ceasefire is Talks.
7. Step 3 does not apply (Talks were not in force at round 1).

- **Expected by the rules**: the game ends by final scoring. A Negotiated Outcome was never possible.
- **Check**: no sequence of legal choices reaches step 3 in Scenario B or C.

**T-B01-b: full campaign, best case**

1. Setup: full campaign. Play to C3 with Ceasefire None.
2. C3: the PKK Declares Ceasefire. No breach.
3. Round 3: the State accepts. Round 4: both vote yes. Round 5 (final): step 3 opens.
4. Both accept the Outcome.

- **Rule 6.0**: "A Negotiated Outcome (8.6) can end the game in any round before the final one." Round 5 is the final one.
- **Engine**: resolves the Outcome in round 5 and skips Civic Action and Agitation.
- **Check also**: the Covert waiver. With one Covert marker on the map, the engine reveals it (Talks held one Campaign, the waiver needs two). No game can reach two.

## M-01 Acceptance after a State Restraint Broken marker

**T-M01**

1. Setup: Scenario B. C3, card 1: the PKK Declares Ceasefire.
2. C3, a later card: the State Assaults in Botan. The State Restraint Broken marker goes in Botan. Ceasefire stays Declared.
3. Round 1, step 1: the State cannot accept. The PKK keeps Declared.
4. Reset removes the marker (6.9 step 4).
5. C4: the State does no Assault, Village Clearance, Cross-Border or Covert Action.
6. Round 2, step 1: the State wants to accept.

- **Reading from 8.6** ("can then no longer accept that ceasefire"): refused.
- **Reading from 6.9 and the engine**: accepted. Ceasefire is Reciprocal Restraint.

## M-02 Ban marker

**T-M02**

1. Setup: full campaign in C4. Europe 3. Legal Space Prosecuted. Closure Case marker on the track. Three Offices. DK-064 has not been played.
2. Propaganda, Legal Politics line 1 resolves.

- **Reader A** (8.4 lists Ban as a Legal Politics marker): places the Ban marker. Europe is capped at 3, so the "Europe +1" of line 1 is lost. Europe Rally now costs 2.
- **Reader B and the engine**: no marker. Europe 4. Next round the State loses 1 Legitimacy for Europe 4 (6.4 step 6).

## M-03 March group

**T-M03**

1. Setup: Scenario A position. Add 3 Guerrillas to Mardin-Batman so it has 4, all Underground. Şanlıurfa has 2 Police and is at Passive Support (as at setup). PKK Resources 5.
2. The PKK Marches 4 Guerrillas from Mardin-Batman to Şanlıurfa.

- **Plan A, one group of 4**: 4 + 2 State pieces = 6, more than three. All 4 arrive Active.
- **Plan B, four groups of 1 from the same origin**: each group is 1 + 2 = 3, not more than three. All 4 arrive Underground. The engine accepts this plan.
- **Result that differs**: 4 Active or 4 Underground Guerrillas in a Support space. With 4 Underground the PKK Controls Şanlıurfa (4 against 2) and can Extort and Coerce there next card with no exposure.

## M-04 Strike Collaborators timing

**T-M04**

1. Setup: Scenario A after Law 3175. Diyarbakır Rural has 1 Police and 1 Guard, no Guerrilla, Neutral. PKK Resources 3. Europe 1.
2. The PKK takes Op + SA: Rally in Diyarbakır Rural (place 1 Guerrilla) with Strike Collaborators in Diyarbakır Rural, timing "after".

- **Rules (2.7, 4.3.3)**: illegal. The Strike uses before timing and no Underground Guerrilla is there before the Rally.
- **Engine**: legal. Result: the Guard is removed, the Guerrilla is Active, a PKK Harm marker is placed, Europe 0, PKK Resources 1.

## M-05 Reception and Event shifts

**T-M05**

1. Setup: Scenario B in C3. Diyarbakır City is Neutral with State Control and Police. Put 1 Reception marker there (for example from DK-045). The current card is DK-039 Law 3713.
2. The State executes the unshaded side and picks Diyarbakır City.

- **Rule 1.6** ("Reception also blocks Support shifts until relieved"): Legitimacy +2, no shift.
- **Engine**: Legitimacy +2 and Diyarbakır City goes to Passive Support. State score is 2 higher.

## M-06 Coerce with a PKK Harm marker

**T-M06**

1. Setup: Scenario A position. Elazığ is at Passive Support (as at setup). Add 1 Underground Guerrilla and 1 PKK Harm marker to Elazığ (the marker as from DK-025). No Coercion marker. PKK Resources 2.
2. The PKK Coerces in Elazığ (Pop 2, cost 1).

- **Reading 1** (3.3.4 names only Coercion as a block): Elazığ goes to Neutral. Coercion placed. State score falls by 2.
- **Reading 2 and the engine**: no shift. Coercion placed. Guerrilla Active. PKK Harm count rises by 1 for no political gain.

## M-07 Op Only with one location

**T-M07**

1. Setup: Scenario A, card 1. The PKK is First Eligible with 5 Resources.
2. The PKK Rallies in Botan only (flip or place), with no Special Activity.

- **Declared as Limited Op**: the State may take Op Only, Op + SA or Pass. The PKK stays First Eligible.
- **Declared as Op Only**: the State may take only Limited Op or Pass. The State becomes First Eligible.
- **Reference pattern**: this action is always a Limited Op.
- **Check**: the engine accepts both declarations for the same plan.

## M-08 Legal Politics timer

**T-M08-a: full campaign with no card effect on Offices**

1. Setup: full campaign. HEP Founded is revealed in C3 and places 2 Offices. Its Event side is not executed. No other card touches Offices, Legal Space or the Closure Case marker. The State never files. In each round one space or more in the line 4 order is eligible (Pop 2 or more, no Office, no PKK Control, no Active level).
2. Round 3: line 4 places a third Office. Line 6 does nothing (3 is below 4).
3. Round 4: line 4 places a fourth Office. Line 6 files. Legal Space stays Open.
4. Round 5 (final): line 1 bans. Legitimacy -2, Europe +1, all Offices removed.

- **Check**: the State score at final scoring is 2 lower with no direct decision by any player.
- **Counter case**: before round 4, give every listed space with no Office either PKK Control or an Active level. Line 4 places nothing, the count stays 3 and line 6 does not file.
- **Second check (line 6 reading)**: after step 3, is Legal Space Open (engine) or Prosecuted (same as a State filing)? At Open the State still gets gain 7(a) in round 5 before the ban.

**T-M08-b: Scenario C**

1. Setup: Scenario C (10.7). No card resolves the Closure Case before round 1.
2. Round 1: line 1 bans. Legitimacy 7 falls by 2 in the Legal Politics phase (after the 6.4 changes). Europe +1.
3. Round 2 (final): line 2 returns the Successor with 2 Offices.

- **Check**: the ban in round 1 happens in every game of Scenario C.

## M-09 Capture before the Leadership can be Abroad

**T-M09**

1. Setup: full campaign at the start of C5. Syria is Restricted. Leadership Present. Legitimacy 6. The State holds DK-098. The first C5 card is DK-093.
2. DK-093 is revealed. Its Always line finds the Leadership Present: nothing happens.
3. Pivotal window: the State plays DK-098. Syria is Hostile. Leadership goes Abroad.

- **Result**: Capture can no longer happen in this game (8.1.5). The PKK income penalty never applies.
- **Compare**: the same game with DK-093 revealed one card later gives Capture.

## M-10 Event box with no effect

**T-M10**

1. Setup: Scenario A, C1. The State is First Eligible. The current card is DK-011 PKK Spring Offensive.
2. The State takes the Event box, unshaded side ("free Sweep in up to 2 Mountain spaces") and declines the free Sweep.

- **Reading 1**: illegal. The State must Pass or do something else.
- **Reading 2 and the engine**: legal. No board change. The PKK may take only Op + SA or Pass. The State stays First Eligible on the next card. The State gets no Pass income.

## M-11 Rally with too few Available Guerrillas

**T-M11**

1. Setup: any scenario. PKK Available Guerrillas: 2. Botan has 2 PKK Bases (Pop 2, so the allowance is 4). Hakkari has no Displacement marker. PKK Resources 4.
2. The PKK plans Rally in Botan (place 4 at the Base) and Hakkari (place 1). The plan needs 5 Guerrillas.

- **Rule 1.4.2**: illegal, the Operation does not meet its placement requirement.
- **Engine**: legal. Botan gets 2. Hakkari gets none but still counts as a paid location, so the Rally has two locations.
- **Compare**: a Train that plans more Troops than Available is refused by the engine.

## M-12 DK-005 in C1 or C2

**T-M12**

1. Setup: full campaign, C1. KDP is Host. The PKK has 3 Guerrillas and 1 Base in the KDP Zone.
2. Game A: DK-005 is revealed as card 2 of C1. KDP is Tolerant for the rest of C1. The PKK cannot build a second Base there by Rally (8.1.2).
3. Game B: the card is in C2 (a 1987 date). KDP stays Host through C1. The PKK can build the second Base and gets its income at round 1.

- **Check**: PKK income at round 1 and the number of external Bases differ between the two dates. This measures how much the disputed date matters.
