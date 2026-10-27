# 09 Victory and Scoring

Status: rules draft. Binding decision: DD-14, with DD-07.4 and DD-15.2. All thresholds and limits are design values marked [tune]. No threshold comes from a casualty, displacement or vote figure [F-047; F-032; M-028].

## 1. Victory scores

| Faction | Score | Notes |
|---|---|---|
| State | Total Support + Legitimacy | DD-14.2. Total Support = Pop at Passive Support + 2 x Pop at Active Support |
| PKK | Total Opposition + PKK Bases in domestic spaces | DD-14.3. Total Opposition = Pop at Passive Opposition + 2 x Pop at Active Opposition |

Rules:

1. Count only the 13 domestic spaces. External boxes and their Bases never count (DD-14.4).
2. Displaced spaces keep their Pop (DD-07.3). A displaced space keeps the level that Village Clearance left (one level toward Neutral, DD-18.3) and scores at that level.
3. No term counts kills, casualties, removed pieces or displacement (DD-07.4; M-028).
4. Control is not in either score. A controlled space can stay politically unsettled (CT 1.6 to 1.7; F-049).

Basis: CT 1.9 and 7.2 (Support + Commitment against Opposition + Bases), with Legitimacy in place of Commitment. CT lessons reject Commitment as "political will"; Legitimacy here records acceptance of State conduct, not willingness to fight (DD-03.3).

## 2. Thresholds

### 2.1 Method

1. **Easy ceiling.** Take the start board. Move every space that starts at Support (State) or Opposition (PKK) to the Active level. Add start Legitimacy (State) or start domestic Bases (PKK). This is the score a faction can reach without winning any contested space.
2. **Threshold** = easy ceiling + (rough maximum - easy ceiling) / 3, round down [tune].

Reason: the first draft measured the gap from the start score. The desk test in 11 showed that the State then reached 42 in the first Campaign only by moving its four safe Passive Support spaces to Active (IR-01, IR-02 in `../audit/independent-critical-review.md`). Measuring from the easy ceiling makes each faction win about one third of the contested headroom. Confidence: Moderate; this is one paper run.

### 2.2 Campaign (Aug 1984 setup in 10, section 2)

Rough maximums:

1. Total Support or Total Opposition: every domestic space at the Active level = 2 x 32 = 64.
2. State: 64 + Legitimacy 20 = 84.
3. PKK: 64 + 12 domestic Bases (all 12 PKK Bases; stacking allows 2 in each of 12 spaces, Western Cities excluded) = 76.

Start scores:

1. State: Passive Support in Western Cities (3), Şanlıurfa (4), Elazığ (2) and Adıyaman (2) = Total Support 11. Legitimacy 10. Score 21.
2. PKK: Passive Opposition in Botan (2) and Hakkari (1) = Total Opposition 3. Domestic Bases 1 (Botan). Score 4.

| Faction | Start | Easy ceiling | Maximum | Headroom | Headroom / 3 | Threshold [tune] |
|---|---:|---:|---:|---:|---:|---:|
| State | 21 | 2 x 11 + 10 = 32 | 84 | 52 | 17 | 49 |
| PKK | 4 | 2 x 3 + 1 = 7 | 76 | 69 | 23 | 30 |

Example boards that reach a threshold (illustration, not prediction):

1. State 49: Legitimacy 12 and Total Support 37, for example Active Support in Western Cities (6), Şanlıurfa (8), Elazığ (4) and Adıyaman (4), plus Passive Support in Mardin-Batman (4), Diyarbakır City (2), Diyarbakır Rural (2), Van-Bitlis (4) and Ağrı (2) and Dersim (1).
2. PKK 30: Active Opposition in Botan (4), Hakkari (2) and Diyarbakır City (4), Passive Opposition in Mardin-Batman (4), Bingöl-Muş (3), Van-Bitlis (4) and Dersim (1) = 22, plus 8 domestic Bases.

### 2.3 Short scenarios

Short scenarios use the same method on their own setups (10, sections 3 to 5).

| Scenario | State start | State easy ceiling | State threshold | PKK start | PKK easy ceiling | PKK threshold |
|---|---:|---:|---:|---:|---:|---:|
| Campaign and A (1984-1989) | 21 | 32 | 32 + 52/3 = 49 | 4 | 7 | 7 + 69/3 = 30 |
| B (1990-1995) | 20 | 2 x 11 + 9 = 31 | 31 + 53/3 = 48 | 14 | 2 x 10 + 4 = 24 | 24 + 52/3 = 41 |
| C (1993-1999) | 16 | 2 x 9 + 7 = 25 | 25 + 59/3 = 44 | 23 | 2 x 15 + 5 = 35 | 35 + 41/3 = 48 |

In Scenario C, Hakkari and Botan already start at Active Opposition; the easy ceiling counts them once at the Active level. All divisions round down.

## 3. Victory check (each Propaganda round except the first)

At the Victory phase (05, section 6.1), skipped in the first Propaganda round of every scenario (CT 6.1):

1. Compute both scores and both Harm counts. Count each face-down Covert marker as revealed for this check: State score -2 and State Harm count +1 per marker. Do not flip the markers. Reason: Scenario B has its only check before the final reveal, so hidden markers escaped their cost at a winning check (11, section 6; IR-34).
2. A faction qualifies if its score reaches or exceeds its threshold and its Harm count is at or below its Harm limit.
3. If exactly one faction qualifies, it wins. The game ends.
4. If both qualify, the higher margin wins (CT 7.1). Margin = score - threshold.
5. If neither qualifies, play on.

### 3.1 Harm gate

Harm limit: 6 for each faction [tune].

1. State Harm count = State Harm markers on the map.
2. PKK Harm count = PKK Harm markers + Coercion markers on the map (04, section 4.2).
3. Disputed markers count for neither.
4. Face-down Covert markers count at a victory check as step 1 says. All are revealed before final scoring (05, section 6.6).

A faction above its limit cannot win at a check (DD-14.2, DD-14.3). It can still lower its count by Redress (07, section 1.3).

## 4. Final scoring

After phase 6.6 of the final Propaganda round:

1. Reveal all Covert markers. Each becomes a State Harm marker and costs Legitimacy 2.
2. Recompute scores and Harm counts.
3. Final margin = score - threshold - 2 x (Harm count - Harm limit, if above 0) [tune].
4. The higher final margin wins (CT 7.3). Negative margins still rank.
5. Ties: the faction with the lower Harm count wins. If still tied, the PKK wins (CT 7.1, ties to the insurgent).

Result labels for the record sheet: a difference of 5 or less is a "narrow" result; 6 or more is a "clear" result (CT 8.6 pattern).

## 5. Negotiated Outcome

If a Negotiated Outcome ends the game (07, section 7.4):

1. Apply the concessions first.
2. Compute final margins as in section 4, without the Covert reveal penalty if Talks held two full Campaigns [tune]; otherwise with it.
3. Label: "Negotiated outcome favorable to State" or "favorable to PKK" by the higher margin. A difference of 2 or less is "Negotiated outcome, balanced".

A Negotiated Outcome is not an instant win. It needs restraint across a full Propaganda round and both factions' consent (DD-11.3).

## 6. Outcome record sheet (Sol V-B, record only)

Fill this in after every game. It does not change who won (DD-14.5). Each line uses board conditions only. Compare the end board with the scenario setup.

| Dimension | Board measure | Improving | Mixed | Deteriorating |
|---|---|---|---|---|
| Protected civilian life | All Harm markers + Displacement markers + Reception markers | End total at least 2 below setup | Within 1 of setup | End total at least 2 above setup |
| Legitimate political access | Legal Space and Offices | Open with 2+ Offices | Prosecuted, or Open with fewer than 2 Offices | Banned or Absent |
| State institutional effectiveness | Pop of State-Controlled domestic spaces | At least 3 above setup | Within 2 of setup | At least 3 below setup |
| PKK organizational leverage | All PKK Bases (domestic and external) + Total Opposition | At least 3 above setup | Within 2 of setup | At least 3 below setup |

Also record:

| Item | Entry |
|---|---|
| Scenario and deck seed | |
| Winner, label and round of the end | |
| Final scores, thresholds, margins | State / PKK |
| Harm counts at the end | State / PKK / Disputed |
| Covert markers revealed at the end | |
| Emergency Rule step at the end | |
| Host postures at the end | Syria / KDP / PUK |
| Leadership | Present / Abroad / Captured |
| Ceasefire step at the end; Negotiated Outcome yes or no | |
| Closure bans and successor returns | |
| First round in which a faction qualified (if any) | |
| Village Clearance uses; Strike Collaborators uses; Coerce uses | |

Write the result plainly. If a faction won with deteriorating civilian life, record "faction success under those conditions", not "peace" (Sol political systems file).

## 7. Perverse incentive check

Test: does any harmful action raise its user's margin relative to the opponent? Relative change = change in own margin - change in opponent's margin.

### 7.1 Emptying spaces (Village Clearance)

Target Pop P. Village Clearance shifts the space one level toward Neutral (DD-18.3). From Passive Opposition the PKK loses P; from Active Opposition it loses P (the space falls to Passive). The State loses 2P Legitimacy at once and 1 more at the next Propaganda round (06, section 3.4).

| Case | State margin change | PKK margin change | Relative change for the State |
|---|---:|---:|---:|
| P = 4, Active Opposition | -8 now, -9 by next round | -4 | -4 now, -5 by next round |
| P = 4, Passive Opposition | -8 now, -9 | -4 | -4, then -5 |
| P = 1, Active Opposition | -2 now, -3 | -1 | -1, then -2 |
| P = 3, Neutral | -6 now, -7 | 0 | -6, then -7 |

The relative change is never positive. The State Harm marker adds to the Harm gate and, beyond the limit, costs 2 margin at the end. The Reception marker can add a further -1 Legitimacy. Pop never falls, so thresholds never fall (DD-07.3). The legality floor (Legitimacy at least 2P + 1) stops the State from clearing at zero cost when Legitimacy is near 0. Result: emptying a space never pays in relative score. Its gain is military: activation and a Rally block. Limit of this test: a victory check is a threshold test, not a relative test. When the PKK is within P of its threshold, Village Clearance can still deny a PKK win at the next check although the State loses more points. DD-18.3 halved this effect against Active Opposition. It stays a watch item (11, section 3).

### 7.2 Rewarding killing

| Action | Score effect for the user | Cost | Verdict |
|---|---|---|---|
| Assault removing Guerrillas | 0 | Resources | No reward for removal |
| Assault removing a domestic PKK Base | PKK -1 | Resources | Infrastructure loss, not a kill count. No State gain |
| PKK Attack | 0 | Resources, attrition | No reward for removal |
| Strike Collaborators | 0 | 1 Resource, PKK Harm marker, Europe -1 | Net negative |
| Covert Action | 0 now; -2 Legitimacy on reveal, and -2 per face-down marker at every victory check (section 3, step 1) | Harm marker | Net negative |
| Cross-Border Assault | 0 (external Bases never count) | Resources, Disputed marker | No score reward |

No action adds points for removing pieces or for harm. Indirect effect: Strike Collaborators, Covert Action, Attack and Assault can change Control, and Control opens or closes Civic Action and Agitation in a space. The PKK Harm marker from Strike Collaborators blocks shifts toward Opposition in its own space, which closes that route there. Playtest must log any Control flip from a harm action that leads to a score shift in the same Campaign.

### 7.3 Coercion (watch item)

Coerce on a Pop P space at Support lowers the State score by P. The PKK pays 1 Resource and takes a Coercion marker, which counts toward its Harm gate until Reset removes it. This is the CT Terror pattern (CT 3.3.4) and DD-06.5 allows it. It is intimidation, not killing. Bound: 8 Coercion markers exist; with the limit at 6, a PKK that holds 7 or more Harm points cannot win at a check and loses 2 margin per point at the end. Playtest must log Coerce use. If Coerce is the cheapest PKK path to victory in more than one game in three, raise its cost or make the marker last two Resets.

### 7.4 Other checks

1. Banning the legal party lifts the Passive Support and Passive Opposition caps in Office spaces (DD-18.4); it opens the same room for PKK Agitation. State gain is at most 2 (Diyarbakır City) + 3 (Western Cities) Total Support and needs Civic Action spending. Cost: Legitimacy -2, Europe +1, loss of the Open-Space gain. This is a political trade-off, not a harm reward. Log it.
2. Stalling: ties go to the PKK, so the State cannot win by passing.
3. Displacement into cities never moves Pop, so the State cannot raise Pop in spaces it controls (Claude harm file, section 5).

## 8. Failure modes to test

| Failure | Test | Fix to try |
|---|---|---|
| State wins by Support alone in Western Cities and the west | Log the share of State score from Western Cities, Şanlıurfa, Elazığ and Adıyaman | Cap Civic Action in Western Cities |
| PKK cannot reach its threshold after hosts turn | Log PKK margin at each check in C4 and C5 | Lower the C5 Harm limit effect, not the threshold |
| Harm gate never binds | Log Harm counts | Lower the limit to 5 |
| Margins tie often | Log ties | Finer tie-break |
| Early sudden victory in C2 | Log first qualifying round | Raise the threshold by 2 |
