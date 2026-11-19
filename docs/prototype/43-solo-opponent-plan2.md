# 43 Solo opponent: audit Plan 2 results

Date: 2026-11-19. Scope: all of Plan 2 in [`docs/audit/playtest-readiness-audit.md`](../audit/playtest-readiness-audit.md) section 5 (S1 to S5). Designer answers to section 5.7 are in [`docs/audit/OPEN_QUESTIONS.md`](../audit/OPEN_QUESTIONS.md), "Decisions (2026-11-19, Plan 2)".

## 1. Bottom line

You can now play a full campaign against a bot in the app. The bot takes the State by default (your decision); either faction works. Each bot action shows "Why?": the chosen play, the best alternatives with values and the sampled line after it.

| ID | Status | Result |
|:--|:--|:--|
| S1 Bot seat | ✅ Done | Home "Opponent" picker; server route; Play screen auto-steps the bot |
| S2 State retune | ⚠️ Blocked (design) | The 20% Pass target cannot be met by the bot alone (section 3) |
| S3 Search bot | ❌ Not started | Acceptance needs about 400 slow games and a Windows timing run (section 5) |
| S4 Decision review | ✅ Done | Top 3 candidates, value components and sampled line, in Last action and History |
| S5 C3 to C5 positions | ✅ Done | 10 new positions; all 12 qualified bots pass; no retune needed |

## 2. What changed

| Item | Change | Evidence |
|:--|:--|:--|
| Seat logic | `cli/seat.ts`: seat check, `botToAct`, `seatStep`. Joint phases (Redeploy, Legal Politics): a bot State part goes to a human PKK as `partial`; a human State part goes to a PKK bot | `sim/test/bot-seat.test.ts` |
| Shared decision | `decideObserved` in `cli/game-runner.ts` serves experiment games and seats (one pipeline) | experiment tests unchanged and passing |
| Server | `SessionService(db, packages, seatBots)`; `GET /api/seat-players`; `POST /api/sessions/:id/bot-step`; `botToAct` in `GET /api/sessions/:id`; a human command at the bot's decision is refused (409) | `bot-seat.test.ts` |
| Store | Migration 4 (`store/bots.sql`): `sessions.seats`, table `bot_decisions`; JSON export carries `botDecisions` per action | `store.test.ts` |
| UI | Home "Opponent" (default `S-CON@4`); Play bot turn panel; joint-phase forms show only your pieces and answers; Undo goes back past bot actions to your last action; `BotWhy` | `src/ui/play/bot-seat.test.tsx`, `bot-part.test.ts`, e2e smoke |
| Review data | Search players return `ranked` (top 3) and `line` (2-move plays); seat records add each candidate's command | `bot-seat.test.ts` S4 block |
| Qualification | Suite v3: 10 C3 to C5 positions (`checkCard` builder); the independent oracle counts face-down Covert markers at a check (7.2) | `player-qualification.test.ts` |
| State v5 | `S-POL@5` to `S-ADAPT@5`: v4 plus `resources: -0.3`. Development probe only, not the roster | `dev-s2-state-v5` run |

## 3. Findings

1. **State passing is mostly forced.** In `dev-s2-state-v5` (current package, 4 seeds, 128 games), 85 to 95% of v5 State passes come at 0 or 1 Resources. Every State Operation costs 2; Pass gives 2 (rule 2.5). v5 spends almost all Resources (mean 0.06 to 2.1 left) but still passes on 28 to 32% of card choices. Verified (replay of the journals, scratch script).
2. **Spending more loses more.** v5 won 19 of 64 games; v4 won 31 of 64 on the same seeds. Small sample, but the direction matches doc 23 (S-SPEND won 3 of 40 against P-SHIELD).
3. **v4 already rarely passes by choice.** v4 S-CON passed with 2 or more Resources in 117 of about 890 card choices (13%); v5 S-CON in 16 (2%).
4. **The roster passes every new C3 to C5 position.** All 8 State (v4, v5) and 4 PKK v4 players pass the 10 positions; S-RANDOM and P-RANDOM fail the decisive ones. Village Clearance, Covert Action, Reciprocal Restraint breach and C4/C5 checks are handled. No S5 retune was needed.
5. **Default opponent.** S-CON@4 won the most v4 State games on the DD-25 rules (`dd25-v4b` 38 of 60) and tied S-ADAPT@4 in `dev-s2-state-v5` (9 of 16 each). On the 43/38 test package S-ADAPT led (doc 42: 162 against 159 of 200). The difference is small.

## 4. Decide (designer)

1. **S2 Pass target.** Keep "Pass share ≤ 20%" and change the State economy (for example a cheaper Limited Op, more income), or replace the target with "voluntary Pass (2 or more Resources) ≤ 5%", which v4 S-CON nearly meets (13%) and v5 meets (2%)?
2. **S3 scope.** Run the full S3 acceptance (50 seeds per opponent, about 400 games of a slower bot, several hours on one machine) or a smaller first check (10 seeds)? The Windows timing check needs your laptop.

## 5. Not done

- **S3** (determinized 4-ply search). Not started: its acceptance (5.6 items 3 and 4) needs the decision above and a Windows 11 run.
- **5.6 item 3** (Windows response time) needs your laptop: run a short experiment and read decision times from the journals.
- **5.6 item 1 with qualified bots.** The 200 seat games (section 6) used the random baselines (fast; same seat code). Qualified bots played 128 experiment games through the same decision code (`decideObserved`) with 0 rejections and 128/128 identical replays.

## 6. Validation

- **5.6 item 1 (legality):** 200 full campaigns through `SessionService` (100 with a State bot seat, 100 with a PKK bot seat; `S-RANDOM@1` and `P-RANDOM@1` against a scripted human that picks generated candidates; seeds 9001 to 9100): 200 complete, 0 throws, 0 rejected commands, 200 of 200 replay identically. Decision kinds reached: card, pivotal, resume, upkeep, legitimacy, Legal Politics (State and PKK), Civic Action, Agitation, Redeploy (both joint directions). Scratch script, not committed (AGENTS Edits 8).
- **5.6 item 2 (decision quality):** 10 new C3 to C5 positions; qualified bots pass 100%, random baselines fail (`player-qualification.test.ts`).
- **5.6 item 5 (review):** History (H), then "Why?": 2 clicks.
- `make check`, `make test` and `make e2e` pass. All runs are in a Linux container, not Windows 11.

## 7. Two-pass review

| Class | Finding | Outcome |
|:--|:--|:--|
| Fix | A human (stale tab or API) could submit a command at the bot's own decision | `submit` refuses with 409; test fails without the guard |
| Fix | Bot State records of a joint phase were lost when the human PKK committed | Kept per head and attached on commit; test fails without it |
| Fix | Undo of one action let the bot redo its move at once | Undo walks back past bot actions to the human's last action; UI test |
| Fix | A test faked a version 1 store but kept the new column | The fake now drops `seats` and `bot_decisions` |
| Drop | Two tabs on one bot session: the second bot request gets 409 | The existing stale-tab guard; the UI shows the error and Retry |
| Drop | The joint-phase State part is held in server memory | A reload asks the bot again; the search RNG is seeded from the state hash, so the choice repeats |

Pass 2: one decision pipeline (`decideObserved`) replaces the copy inside `runGame`; server code reaches the cli bots only through the `SeatBots` interface wired in `main.ts` (layer rule 03 s5).
