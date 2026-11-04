# Scenario A automated playtest: one-page overview

Date: 2026-11-04. Source: [report 23](23-scenario-a-automated-playtest-report.md) and the `cand-5` runs in `sim/experiments/runs/`. Players: [21](21-scenario-a-strategies.md). These are bot results for this roster only, not human win probabilities.

## Bottom line

- **Balance:** across the 16 matchups of the main roster, the State wins **55.5%** [53.7, 57.4] and the PKK **44.5%**. No side passes the 60% review trigger.
- **Matchups decide more than sides:** single cells range from 13% to 98% State wins.
- **One dominant line:** the PKK counter **P-SHIELD** beats every State player (State wins 3.0% to 11.5%). Confirmed on fresh seeds in all five program runs.
- **Reliability:** 40,000 frozen games in five runs, 39,999 complete, all replayed identically. The one failure was a rules gap, now closed by DEC-62.

## Player types

| Player | Side | Plays for |
|---|---|---|
| S-POL | State | Political: Control and Police in high-Pop spaces, Support via Civic Action, Legitimacy |
| S-MIL | State | Military: hunts exposed Guerrillas and removes domestic PKK Bases |
| S-CON | State | Containment: denies the PKK Bases, Control and Agitation room |
| S-ADAPT | State | Balanced; checks the opponent's best reply before choosing |
| P-POL | PKK | Political: Bases or Control, then Opposition by Agitation |
| P-EXP | PKK | Expansion: a spread network in larger-Pop spaces |
| P-SURV | PKK | Survival: preserves Guerrillas, Resources and camps, converts late |
| P-ADAPT | PKK | Balanced; checks the opponent's best reply before choosing |
| P-SHIELD | PKK counter | P-POL plus Base protection: keeps an Underground Guerrilla with each Base |
| S-SIEGE | State counter | S-MIL plus value for exposing protected Bases |

All players search one move ahead (one-ply) with a 600-transition budget. Six weak legacy control bots also played; they lost all 480 games.

## Who beat whom (State win %, 200 games per cell, `baseline-5`)

| State \ PKK | P-POL | P-EXP | P-SURV | P-ADAPT | State row avg |
|---|---|---|---|---|---|
| S-POL | 35.0 | 33.5 | 75.5 | 63.5 | 51.9 |
| S-MIL | 67.0 | 64.0 | **93.5** | 73.5 | **74.5** |
| S-CON | 31.0 | **13.0** | 40.0 | 81.0 | 41.3 |
| S-ADAPT | 40.0 | 41.0 | 43.0 | **98.0** | 55.5 |
| PKK win % (column) | 56.8 | **62.1** | 37.0 | 21.0 | |

- Strongest State player: **S-MIL** (74.5%). Strongest PKK player: **P-EXP** (62.1% PKK wins).
- Weakest: **P-ADAPT** (21.0% PKK wins) and **S-CON** (41.3% State wins).

## Counters (`confirmation-5`, 200 games per cell)

| | vs S-MIL | vs S-POL | vs S-CON | vs S-ADAPT |
|---|---|---|---|---|
| P-SHIELD (State win %) | 3.0 | 9.5 | 11.5 | 10.0 |

S-SIEGE, built to break P-SHIELD, won 0 of 200. With P-SHIELD included, the PKK wins 76.3% of the confirmation cells. *Hypothesis:* protected Base networks beat one-ply State planning; it is not yet shown to be a rules imbalance.

## Trend across generator versions (State roster average)

cand-1 48.0% → cand-2 53.7% → cand-3 52.2% → cand-4 56.3% → **cand-5 55.5%**. The average stays within 48-57%, but single cells moved up to 57 points between versions (S-ADAPT vs P-EXP: 90.0% under cand-2, 41.0% now).

## Other trends

- **Scoring:** State winners average Support 30.1 + Legitimacy 10.2. PKK winners average Opposition 16.3 + domestic Bases 2.4.
- **Bases decide games:** PKK win rate by final domestic Bases: 0: 11.7%, 1: 34.6%, 2: 61.4%, 3: 80.3%, 4+: 89.7% (observational).
- **Ties:** 2.6% of games end on equal margins; the PKK wins 79 of 91 through the tie order.
- **Options barely matter:** without hot pursuit 56.9%, Syria closed 55.9%, both 57.9%, all overlapping the 55.5% baseline. The options were rarely exercised.
- **Randomness:** in 34 of 160 repeated seeds (21%), only the player's random choices changed the winner.

## Caveats

- Bots, not humans: one-ply search, no multi-card plans.
- The State passes on 39.5% of its card choices (PKK 17.8%) and ends with 4.8 unused Resources, so State results are likely underestimates.
- Sanctuary play beyond Restricted, Cross-Border and hot pursuit never occurred naturally.

## Open decisions

1. **P-SHIELD:** is it a rules issue or a planner limit? Needs a two-ply State planner or human play. Recommended: include a protected-Base line in the IC-3a notes.
2. **DEC-62** (resolved 2026-11-04): Host Pressure with no legal, affordable replacement ends the Operation.
3. **Human IC-3a** is still open; automation does not close it.
