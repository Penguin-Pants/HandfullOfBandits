# Open questions for the designer

Only decisions that need you. Each question names its finding in `AUDIT_REPORT.md`. Options and trade-offs are in the report.

## Decisions (2026-11-12)

Items 1 to 14 are decided. Rule text is updated in `prototype-rules.md`. The Pending column shows the engine, data and test state of each row.

| # | Finding | Decision | Rules text | Pending |
|:--|:--|:--|:--|:--|
| 1 | B-01 | No Negotiated Outcome. Ceasefires stay (None, Declared, Reciprocal Restraint). No permanent settlement, because Turkish territorial integrity and Kurdish independence are directly opposed. Talks and the Outcome are removed. | 6.0, 6.5, 7.4, 7.5 (deleted), 8.6, 9.0, B.3 | Done: engine, data, tests (`ceasefire-step.test.ts`), research documents 04, 05, 07, 09, 11, 12, 13 and `rules.yaml` |
| 2 | B-01 | Moot. The Outcome and its removals no longer exist. | 8.6 | None |
| 3 | M-01 | Block lasts until the next Reset. | 8.6 | None. Test: `sim/test/decisions.test.ts` |
| 4 | M-03 | One group is all Guerrillas from one origin to one destination. | 3.3.2 | Done: `march.ts`, test in `decisions.test.ts` |
| 5 | M-07 | Replaced 2026-11-19: Op Only takes any number of locations, including one. Was: Op Only needs two or more locations. | 2.3, B.3 | Done: `choose-operation.ts` (First Eligible only, research 05 §2.3), test in `decisions.test.ts` |
| 6 | M-02 | The cap marker is permanent and is renamed "Europe Ban marker". | 1.7, 3.3.1, 8.4 | Done: marker id `europeBan`, card DK-064 text, UI name, test in `decisions.test.ts` |
| 7 | M-08 | Keep the line 6 timer. A line 6 filing sets Legal Space to Prosecuted. | 8.5 | Done: `legal-politics.ts`, test in `decisions.test.ts` |
| 8 | M-09 | Capture is not certain. Say so. | 8.1.5 | None. Test: `sim/src/engine/coin/structural.test.ts` (Capture, Leadership Present) |
| 9 | M-10 | A faction may take the Event box and apply nothing. | 2.3 | None. Test: `decisions.test.ts` |
| 10 | M-04 | Strike Collaborators may go before or after. | 2.7, 4.3.3 | None (engine already allows it). Test: `decisions.test.ts` |
| 11 | M-05 | Reception blocks every shift toward Support. | 8.4 | Done: `markers.yaml`, test in `decisions.test.ts` |
| 12 | M-06 | PKK Harm blocks the Coerce shift toward Neutral. | 3.3.4 | None (engine already does it). Test: `decisions.test.ts` |
| 13 | M-11 | Rally places as many Guerrillas as are Available. Limited 2026-11-19 by decision 18: each selected location must still change. | 1.4.2, 3.3.1 | None (engine already does it). Test: `decisions.test.ts` |
| 14 | M-12 | Keep DK-005 in C1 and print the evidence grade. | 5.4 | Done: note in the Always line of DK-005 (`cards/c1.yaml`), test in `decisions.test.ts` |

Open from these decisions: none. Item 1 replaced the earlier "shorten one step" answer.

## Decisions (2026-11-19)

Items 15 to 23 and three print-set approvals. Rule text is in `prototype-rules.md`. Tests: `sim/test/decisions-2026-11-19.test.ts` and the Decision 5 block of `sim/test/decisions.test.ts`.

| # | Finding | Decision | Rules text | Pending |
|:--|:--|:--|:--|:--|
| 5 (revised) | M-07 | Op Only takes any number of locations, including one, for both factions. A Limited Op takes one location. | 2.3, B.3 | Done: engine check and bot filter removed |
| 15 | m-16 | Guard Abuse counts every Harm marker, PKK Harm included. | 5.5 | None (engine already does it) |
| 16 | m-26 (c) | Moot: Talks were removed (item 1). | none | None |
| 17 | m-26 (a) | The PKK Restraint Broken marker is a record only. | 8.6 | None (engine already does it) |
| 18 | m-17 | Each selected location must change, by the Operation or its Special Activity there. It wins over decision 13 when supply runs out (2026-11-19). | 3.1, 3.3.1, 4.1 | Done: one generic dry-run check for every Operation (`locationNoEffect`; skipped when the dry run rolls a die), plus the Diplomacy track-end check |
| 19 | m-13 | The Leadership never returns to Present. | 8.1.5 | None (engine already does it) |
| 20 | m-11 | Police move any distance. The State chooses how many Guerrillas Garrison activates, up to the maximum. | 3.2.2 | Done: plan field `activate`; bots still activate the maximum |
| 21 | m-10 | No decision needed: rule 3.3.3 already reads "choose Troops or Police first", as the engine does. | 3.3.3 | None |
| 22 | m-24 | At Redeploy, Guerrillas in Western Cities may move to any domestic space with a PKK Base. | 1.3.4, 6.8 | Done: engine |
| 23 | m-27 | DK-010 gets a neutral title: "Rival Kurdish Groups (1986)". | Appendix A | Done: package title, print set. Research 08 keeps the old title as history |
| P-1 | #122 | Approved: DK-037, DK-040 and DK-093 print the rule 5.4 Always text; DK-016 prints the standard Propaganda line. | 5.4 | None |
| P-2 | #122 | Approved: Pivotals print the rule 5.3 text. | 5.3 | None |
| T-1 | docs 41, 42 | Keep thresholds 49/32 until human games test 43/38. | 7.1 | A human 43/38 game needs a selectable variant (audit Plan 4) |

Open from these decisions: none.

## Original questions

## Decide first

1. **Negotiated Outcome (B-01).** Must a Negotiated Outcome be reachable before the final round? If yes: which step gets shorter, or does Declare Ceasefire open earlier? If no: does the Covert waiver (7.5) stay?
2. **Negotiated Outcome removals (B-01, `docs/rules/review.md:56`).** Who chooses which domestic Guerrillas the PKK removes?
3. **State acceptance after a breach (M-01).** After a State action during Declared, is the block on acceptance for the Campaign only (until Reset) or for the life of that ceasefire?
4. **March group (M-03).** What is one group: all Guerrillas into one destination, all from one origin to one destination, or any set the PKK names?
5. **First Eligible box (M-07).** Does the box follow the action done, or may First Eligible name a one-location Operation "Op Only"? This is the open item in Appendix B.3.

## Decide next

6. **Ban marker (M-02).** Is the Europe cap marker permanent? Do you want a different name from the Legal Politics ban?
7. **Legal Politics timer (M-08).** Is the automatic filing at the Office limit (line 6) intended to ban the party on a schedule that players can delay only by making every Office space ineligible? Does a line 6 filing set Legal Space to Prosecuted, as the other filings do?
8. **Capture (M-09).** Must Capture be possible in every full game, or is a game with no Capture acceptable?
9. **Event with no effect (M-10).** May a faction take the Event box and apply nothing, to keep First Eligible?
10. **Strike Collaborators timing (M-04).** Before only (rule) or before and after (engine)?
11. **Reception (M-05).** Does Reception block every shift toward Support, or only Civic Action shifts?
12. **Coerce and PKK Harm (M-06).** Does a PKK Harm marker block the Coerce shift from Support toward Neutral?
13. **Rally supply (M-11).** Is a Rally that plans more Guerrillas than Available legal (place what there is) or illegal?
14. **DK-005 date (M-12).** Keep the KDP break in C1 (October 1985), move it to C2, or make it an option?

## Smaller decisions

15. **Guard Abuse (m-16).** Does PKK Harm in a Guard space trigger Guard Abuse against the State?
16. **Ceasefire step 4 (m-26).** May one faction leave Talks and Reciprocal Restraint in the same step?
17. **PKK Restraint Broken marker (m-26).** Does it have an effect, or is it a record only?
18. **No-effect actions (m-17).** May a faction pay for a location where the action can do nothing (Rally in Europe at 5 with no Ban marker, Diplomacy against Europe at 0)?
19. **Leadership (m-13).** Can the Leadership return to Present?
20. **Garrison (m-11).** Do Police move any distance? May the State activate fewer Guerrillas than the maximum?
21. **Attack removal (m-10).** May the PKK mix one Troop and one Police? May it remove fewer pieces than the maximum?
22. **Western Cities (m-24).** Are Guerrillas there meant to stay for the game?
23. **DK-010 title (m-27).** Is "TSK" the name you want for the rival coalition?

## Not a rules question, but needs you

24. **Repository visibility.** The GitHub API reports `Penguin-Pants/HandfullOfBandits` as public (checked 2026-11-12). The request expected a private repository. You chose to push the audit as it is. Open point: do you want the repository made private?
