# Playtest results: S0 Opening (October 2026)

Status: findings for the designer. No rule changes are made in this file.

## 1. Summary

- 3 full S0 games were played. PKK won all 3 on final scoring (margin), and in all 3 the State had the higher raw score.
- No engine crash and no illegal state was found. Replay and JSON export passed (game 1).
- The main design problem: S0 is too short for scores to move. Both factions end far below their thresholds, so the result comes from the threshold gap (State 49, PKK 30), not from play.
- The main simulator problem: the Propaganda steps that hold a real choice (Civic Action, Agitation, Emergency Rule) are easy to skip with Advance.

## 2. Games

| Game | Seed | Players | State score | PKK score | Margins (State / PKK) | Winner |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 agent, both sides, in the browser (UC-9 test) | 23 of 49 | 6 of 30 | -26 / -24 | PKK |
| A | 11 | 2 agents: State aggressive, PKK conservative | 21 of 49 | 7 of 30 | -28 / -23 | PKK |
| B | 23 | 2 agents: State conservative, PKK aggressive | 23 of 49 | 9 of 30 | -26 / -21 | PKK |

Method:

- Game 1 used the browser UI at 1600 x 900. Its 6 high and medium UI defects are fixed in UC-9 (PR #30).
- Games A and B used the server API through a helper script, with one agent per faction. Each agent tried to win for its own side. These games test rules and balance, not the browser UI.
- Limits: 3 games, 3 seeds, S0 only (8 event cards and 1 Propaganda round). Agents are not expert COIN players. Treat balance findings as signals to test, not as proof.

## 3. Game design findings

Priority order. "Seen in" names the games that show the finding.

### High

**D1. S0 is too short to decide the game by play.** Seen in: 1, A, B.
- Scores moved by +2 to +5 in 9 cards. No faction came near its threshold.
- Final scoring compares margins. The State starts at margin -28 and PKK at -26, so PKK starts ahead by 2 and only has to keep that lead.
- Result: PKK won all 3 games, including the one where the State played aggressively.
- Options to test: (1) score S0 by change from the start score; (2) set S0-only thresholds near the start scores; (3) accept S0 as a rules test only and do not read its winner.

**D2. Propaganda Resources arrive after the last card.** Seen in: A, B.
- The State gets +19 to +20 and PKK +5 to +7 in the Resources step. In S0 the game ends in the same Propaganda round, so most of this income is never used.
- In Game A the State was at 0 Resources from card 7, then got 19 it could not spend.
- Options: in S0, skip the Resources step, or score unspent Resources. In the full game this is normal COIN pacing; check it again in a multi-round scenario.

### Medium

**D3. The State economy is tight and Sweep alone is wasted.** Seen in: A.
- Ops cost 2 per space against a start of 12 Resources. An aggressive State was at 0 by card 7.
- Sweep flips Guerrillas Active, but PKK Rally ("flip") turns them Underground again on its next action. Assault only pays off on a later card.
- Option: test Sweep at 1 per space, or let Assault follow Sweep in the same Op (as some COIN games allow).

**D4. Assault on Active Guerrillas has no die roll; PKK has no defense.** Seen in: A.
- Removing Active Guerrillas for 2 Resources with no roll is the standard COIN pattern. Combined with D3 it gives a "Sweep, then Assault" rhythm with no PKK reply except re-hiding.
- Decision needed: keep it as standard COIN, or give PKK a reply (for example a cheap flip with Extort).

**D5. Ambush removes a State piece even when the Attack roll fails.** Seen in: B.
- This is how prototype assumption PA-06 reads ("resolve Attack as normal and also remove 1 extra State piece").
- With Attack at 1 Resource per space, Attack plus Ambush in 2 spaces removed 3 State pieces for 2 Resources.
- Decision needed: should the extra removal need a hit? Update PA-06 when decided.

**D6. Agitation is rarely possible.** Seen in: B.
- Agitation needs a space with a PKK piece and no State Control. In Game B every space with PKK pieces had State Control, so 8 PKK Resources could not be spent.
- Option: allow Agitation in spaces with a PKK Base even under State Control, or count Bases more strongly for Control.

**D7. Strike Collaborators blocks PKK's own Agitation.** Seen in: B.
- Strike places a PKK Harm marker. That marker then blocks Agitation in the same space, and removing it costs 2 more.
- The action text does not warn about this. Decide whether this trap is intended, and if so add a warning to the action summary.

**D8. Village Guards are weak against Strike Collaborators.** Seen in: B.
- DK-003 placed Guards, and PKK removed 2 of them for 1 Resource on the next card.
- Option: raise the cost of Strike, or limit it to 1 Guard per space.

**D9. Several shaded Events are dead in practice.** Seen in: A, 1.
- DK-002 shaded (free Attack with Ambush) needs an Underground Guerrilla, but the State had just flipped them Active.
- DK-100 shaded shifts Syria toward Host when Syria is already Host.
- DK-008 shaded is "block only".
- Option: give each dead side a fallback effect so the Event box is a real choice.

### Low

**D10. Emergency Rule cannot move from Martial Law in the Legitimacy step.** Seen in: A.
- The engine follows 07 s8.2 item 3: from Martial Law there is no move. An aggressive State expected to step to OHAL.
- Decision needed: confirm that only Events or other rules leave Martial Law.

**D11. Eligibility: the State stayed 1st Eligible from card 3 to card 9.** Seen in: 1.
- The State took each Event, and PKK passed as 2nd Eligible each time.
- Confirm this matches the intended sequence of play.

## 4. Simulator findings

### Medium

**S1. Propaganda choice steps are easy to skip with Advance.** Seen in: A, B (helper), and the same pattern exists in the UI.
- Both State agents pressed Advance at Civic Action and lost the chance to spend 19 to 20 Resources on Support.
- The UI says "Or press Advance to spend nothing", but nothing stops an accidental skip.
- Fix: when a choice step has a legal spend, make Advance ask "Skip Civic Action?", or show the spend form first.

### Low

**S2. Rally ignores `count` for the "place" option without a warning.** Seen in: A, B.
- The engine places 1 Guerrilla, as the rules say. The UI labels the field "Grow count", but the API accepts the extra field silently.
- Fix: give a warning when a field does not apply to the selected option.

**S3. The preview hides the results of rolls.** Seen in: B.
- The preview of Attack shows the Active flip but not the removals. The cause is by design: the preview stops at the first die roll (05).
- Fix: add a line "then roll: removes up to N on a hit".

**S4. Event questions take one round trip per answer.** Seen in: B.
- DK-005 needed 2 validations (option, then count). This is fine in the UI and slow over the API only.

**S5. Posture names read differently before and after DK-005.** Seen in: A.
- The Always line moves KDP from Host to Tolerant at reveal, then the unshaded side moves it to Restricted.
- Fix: show the posture change in the reveal message ("KDP posture: Host to Tolerant (Always line)"). The log already holds it; the card panel does not.

**S6. Remaining UI items from game 1 (not in UC-9).**
- The "Click to reveal" text cannot be clicked; only the deck image works.
- Card face text does not fit ("PROPAGAND / A", long titles clipped).
- DK-008 shaded text repeats "block only: Block only".
- The host posture tracks on the map have no name labels.
- Home shows "Check: 19 errors"; all of them are in the full-campaign scenario, which is expected but looks alarming.

## 5. What worked

- Every legal move the agents tried was accepted, and every illegal move got a clear message with a rule reference.
- The free-action plan shape (DK-002 Garrison and Attack) and the SA timing ("before") worked as specified.
- Resume, undo, replay ("identical") and JSON export passed in game 1.

## 6. Suggested next steps

1. Designer: decide D1 and D2 (how S0 is scored). Without that, more S0 games will not give useful balance data.
2. Designer: decide D5, D7 and D11 (rule questions with a clear yes or no).
3. Simulator: fix S1 (protect Propaganda choice steps), then the S6 items.
4. Play the manual S0 session (IC-2 items 2 and 3). Phase 3 is blocked until then.

## Sources

- Agent notes from games A and B (session scratchpad, not committed).
- Rules: `docs/prototype/10-mvp-scope.md`, `game-packages/kurdish-coin/0.1.0/assumptions.yaml` (PA-06), `sim/src/engine/coin/propaganda/legitimacy.ts:20` (Emergency Rule moves), `sim/src/server/forms.ts:40` (Rally fields), `sim/src/ui/propaganda/phases.ts:16` (Agitation text).
