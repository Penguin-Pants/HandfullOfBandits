# P-SHIELD: notes for the designer

Date: 2026-11-04. For: the designer, before and during the IC-3a Scenario A playthrough. Sources: [report 23](23-scenario-a-automated-playtest-report.md), [overview 24](24-scenario-a-playtest-overview.md), players [21](21-scenario-a-strategies.md), rules `docs/rules/prototype-rules.md`.

## Bottom line

- One PKK line, **protect every domestic Base with an Underground Guerrilla**, beat every automated State player in all five program runs: the State won 3.0% to 11.5% of games against it.
- It is **not yet a confirmed rules defect**. The State bots plan one move ahead, and the line may only beat that. A human State player, or a bot that plans two moves, could find the answer.
- **Your decision:** is this a rules property to fix, or a planner limit to accept? The IC-3a playthrough is the cheapest test. No rule or threshold has been changed.

## What P-SHIELD does

P-SHIELD is the political PKK player (P-POL) with three extra priorities:

1. Keep at least one Underground Guerrilla in every space with a PKK Base.
2. Avoid Bases that Troops can reach while no Underground Guerrilla is there.
3. Value domestic Bases highly, then score Opposition by Agitation from them.

It uses no Events or tricks that the other PKK players lack. It only changes what it values.

## Evidence

**State win % against P-SHIELD, 200 fresh games per cell in each run:**

| Run (generator) | S-MIL | S-POL | S-CON | S-ADAPT |
|---|---|---|---|---|
| confirmation-1 (cand-1) | 2.5 | 9.5 | 3.0 | 2.5 |
| confirmation-2 (cand-2) | 5.5 | 9.0 | 10.5 | 8.5 |
| confirmation-3 (cand-3) | 3.0 | 9.0 | 11.0 | 8.0 |
| confirmation-4 (cand-4) | 3.0 | 8.0 | 9.0 | 10.5 |
| confirmation-5 (cand-5) | 3.0 | 9.5 | 11.5 | 10.0 |

- **Stable:** the result held through every generator fix, while other matchups moved by up to 57 points.
- **Cancels the strongest State player:** S-MIL, which beats every normal PKK player (64% to 94%), wins only 3% against P-SHIELD.
- **Counter attempts failed:**
  - S-SIEGE, a State player built to expose protected Bases, won 0 to 0.5% (0 of 200 in cand-5).
  - Improved State versions (S-POL@2, S-MIL@2, S-CON@2, S-ADAPT@2) won 3 of 80 development games.
  - A State player forced to spend its Resources (S-SPEND@3) won 3 of 40.

**How P-SHIELD games end (confirmation-5, first play per seed):**

| | PKK win % | Domestic PKK Bases at end | PKK Opposition | State Support | Early victory |
|---|---|---|---|---|---|
| P-SHIELD games (1,000) | 93.2 | 4.8 | 18.6 | 18.2 | 12.6% |
| Other PKK players (600) | 48.2 | 1.4 | 11.1 | 23.3 | 2.0% |

In the main roster, PKK win rate rises from 11.7% with no domestic Bases at the end to 89.7% with four or more. That link is observational, but P-SHIELD is the player that keeps Bases alive.

## Why it may work: rules chain (hypothesis)

Each step cites the prototype rules.

1. **A Base is safe while any Guerrilla shares its space.** Assault removes Active Guerrillas first and may remove a Base "only when no Guerrilla of either state remains". It never removes an Underground Guerrilla (`prototype-rules.md:218`, `:280`).
2. **The State needs two Operations to reach a protected Base.** Sweep or Garrison must activate the Underground Guerrilla first, and a Sweep "cannot then Assault as part of the same Operation" (`:210`). So the Assault comes on a later card.
3. **The PKK can re-hide between those cards.** A Rally at a Base flips all Guerrillas there Underground (`:233`). ARGK flips Guerrillas Underground in every Base space (`:420`). Reset flips all Guerrillas Underground (`:503`).
4. **Mountains halve the State's tools.** Sweep and Garrison activate one Guerrilla per two State pieces, and Assault removes one piece per two Troops (`:180`).
5. **PKK conversion is cheaper.** Agitation costs 1 per shift with no Legitimacy cap (`:298-304`). Civic Action costs 2 per shift, and Propaganda Civic Action is capped at half Legitimacy (`:286-294`).

With one-move planning, the State never values a Sweep whose payoff comes only on a later card. A human might.

## What to test in IC-3a

Play the PKK with the P-SHIELD habit at least once, and the State as hard against it as you can.

- **As the State:** try Sweep or Garrison on a protected Base, then Assault on your next card. Note whether the PKK can always re-hide first (Rally flip, ARGK, Reset), and what it costs the PKK.
- **Count the tempo:** cards per Base removed by the State, against cards per Base protected or rebuilt by the PKK.
- **Watch the economy:** does Agitation from many Bases outpace Civic Action under the half-Legitimacy cap?
- **Record outcomes:** final domestic Bases, final margins, and the first card where the game felt decided.

Helpful findings for the program: whether a two-card Sweep-then-Assault plan works for a human. If it does, the problem is the bots, and the next step is a two-move State planner.

## Levers, if you judge it a rules issue

These are options to consider, not recommendations. Each would need a frozen rerun to measure.

| Lever | Effect on the chain | Risk |
|---|---|---|
| Let Sweep or Garrison be followed by Assault in the same Operation in some cases (for example a Special Activity or high Troop count) | Removes step 2 | Could make the State dominant against all PKK lines |
| Limit re-hiding: Rally flip only where no State pieces are present, or flip one Guerrilla, not all | Weakens step 3 | Changes the PKK's core concealment identity |
| Let Assault remove a Base when Active Guerrillas are cleared and a set number of Troops remain, even with an Underground Guerrilla | Weakens step 1 | Reduces the value of Underground status everywhere |
| Raise Agitation cost or add a cap tied to a PKK track | Weakens step 5 | Shifts overall balance; current average already 55.5% State |
| Score PKK Bases less at the end | Lowers the payoff of the line | Indirect; may push the PKK to other dominant lines |

## Caveats

- All results are bot against bot, one-move search, 600-transition budget.
- The State bots pass on about 39% of their card choices and end with about 4.8 unused Resources, so they likely underplay the State.
- P-SHIELD was found by targeted development on development seeds and then confirmed on fresh evaluation seeds. It is one counter, not a search of all PKK strategies.

## Next steps

1. You: play P-SHIELD in IC-3a and record the items above.
2. Program, if human play shows a working State answer: add a two-move State planner (Sweep-then-Assault) and rerun the confirmation.
3. You: decide whether any lever above becomes a design decision (DD-nn).
