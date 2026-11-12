# Open questions for the designer

Only decisions that need you. Each question names its finding in `AUDIT_REPORT.md`. Options and trade-offs are in the report.

## Decisions (2026-11-12)

Items 1 to 14 are decided. Rule text is updated in `prototype-rules.md`. Engine and data changes are pending and are not in this change.

| # | Finding | Decision | Rules text | Pending |
|:--|:--|:--|:--|:--|
| 1 | B-01 | No Negotiated Outcome. Ceasefires stay (None, Declared, Reciprocal Restraint). No permanent settlement, because Turkish territorial integrity and Kurdish independence are directly opposed. Talks and the Outcome are removed. | 6.0, 6.5, 7.4, 7.5 (deleted), 8.6, 9.0, B.3 | Engine: remove Talks, the Outcome and the Covert waiver. Tests |
| 2 | B-01 | Moot. The Outcome and its removals no longer exist. | 8.6 | None |
| 3 | M-01 | Block lasts until the next Reset. | 8.6 | None |
| 4 | M-03 | One group is all Guerrillas from one origin to one destination. | 3.3.2 | Engine |
| 5 | M-07 | The box follows the action. Op Only needs two or more locations. | 2.3, B.3 | Engine |
| 6 | M-02 | The cap marker is permanent and is renamed "Europe Ban marker". | 1.7, 3.3.1, 8.4 | Engine strings |
| 7 | M-08 | Keep the line 6 timer. A line 6 filing sets Legal Space to Prosecuted. | 8.5 | Engine |
| 8 | M-09 | Capture is not certain. Say so. | 8.1.5 | None |
| 9 | M-10 | A faction may take the Event box and apply nothing. | 2.3 | None |
| 10 | M-04 | Strike Collaborators may go before or after. | 2.7, 4.3.3 | None (engine already allows it) |
| 11 | M-05 | Reception blocks every shift toward Support. | 8.4 | Data: `blocks: [support]` in `markers.yaml` |
| 12 | M-06 | PKK Harm blocks the Coerce shift toward Neutral. | 3.3.4 | None (engine already does it) |
| 13 | M-11 | Rally places as many Guerrillas as are Available. | 1.4.2, 3.3.1 | None (engine already does it) |
| 14 | M-12 | Keep DK-005 in C1 and print the evidence grade. | 5.4 | Print the grade on the card |

Open from these decisions: none. Item 1 replaced the earlier "shorten one step" answer.

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
