# Paired player-version comparison

Sources: experiments/runs/pilot-1, experiments/runs/dev-compare-v2. Pairs share condition, opponent and game seed; bootstrap over seeds (2,000 draws, seed 1).

| Seat | Newer | Older | Opponent | Paired seeds | State win diff (newer - older) | 95% CI |
|---|---|---|---|---|---|---|
| pkk | P-ADAPT@2 | P-ADAPT@1 | S-ADAPT@1 | 20 | -15.0 pts | [-40.0, 10.0] |
| pkk | P-ADAPT@2 | P-ADAPT@1 | S-CON@1 | 20 | -30.0 pts | [-55.0, -5.0] |
| pkk | P-ADAPT@2 | P-ADAPT@1 | S-MIL@1 | 20 | 0.0 pts | [0.0, 0.0] |
| pkk | P-ADAPT@2 | P-ADAPT@1 | S-POL@1 | 20 | -50.0 pts | [-80.0, -20.0] |
| pkk | P-EXP@2 | P-EXP@1 | S-ADAPT@1 | 20 | -10.0 pts | [-30.0, 10.0] |
| pkk | P-EXP@2 | P-EXP@1 | S-CON@1 | 20 | 10.0 pts | [0.0, 25.0] |
| pkk | P-EXP@2 | P-EXP@1 | S-MIL@1 | 20 | -5.0 pts | [-20.0, 10.0] |
| pkk | P-EXP@2 | P-EXP@1 | S-POL@1 | 20 | 10.0 pts | [-10.0, 35.0] |
| pkk | P-POL@2 | P-POL@1 | S-ADAPT@1 | 20 | 0.0 pts | [-15.0, 15.0] |
| pkk | P-POL@2 | P-POL@1 | S-CON@1 | 20 | 10.0 pts | [0.0, 25.0] |
| pkk | P-POL@2 | P-POL@1 | S-MIL@1 | 20 | 0.0 pts | [-15.0, 15.0] |
| pkk | P-POL@2 | P-POL@1 | S-POL@1 | 20 | -5.0 pts | [-20.0, 10.0] |
| pkk | P-SURV@2 | P-SURV@1 | S-ADAPT@1 | 20 | -5.0 pts | [-20.0, 10.0] |
| pkk | P-SURV@2 | P-SURV@1 | S-CON@1 | 20 | -10.0 pts | [-40.0, 20.0] |
| pkk | P-SURV@2 | P-SURV@1 | S-MIL@1 | 20 | 5.0 pts | [-10.0, 20.0] |
| pkk | P-SURV@2 | P-SURV@1 | S-POL@1 | 20 | 10.0 pts | [-15.0, 35.0] |
| state | S-ADAPT@2 | S-ADAPT@1 | P-ADAPT@1 | 20 | -30.0 pts | [-55.0, -5.0] |
| state | S-ADAPT@2 | S-ADAPT@1 | P-EXP@1 | 20 | -80.0 pts | [-95.0, -60.0] |
| state | S-ADAPT@2 | S-ADAPT@1 | P-POL@1 | 20 | 15.0 pts | [-15.0, 45.0] |
| state | S-ADAPT@2 | S-ADAPT@1 | P-SURV@1 | 20 | 15.0 pts | [-15.0, 45.0] |
| state | S-CON@2 | S-CON@1 | P-ADAPT@1 | 20 | -15.0 pts | [-35.0, 5.0] |
| state | S-CON@2 | S-CON@1 | P-EXP@1 | 20 | 0.0 pts | [0.0, 0.0] |
| state | S-CON@2 | S-CON@1 | P-POL@1 | 20 | 5.0 pts | [0.0, 15.0] |
| state | S-CON@2 | S-CON@1 | P-SURV@1 | 20 | 5.0 pts | [-20.0, 30.0] |
| state | S-MIL@2 | S-MIL@1 | P-ADAPT@1 | 20 | 0.0 pts | [0.0, 0.0] |
| state | S-MIL@2 | S-MIL@1 | P-EXP@1 | 20 | -10.0 pts | [-30.0, 10.0] |
| state | S-MIL@2 | S-MIL@1 | P-POL@1 | 20 | -20.0 pts | [-40.0, -5.0] |
| state | S-MIL@2 | S-MIL@1 | P-SURV@1 | 20 | 10.0 pts | [0.0, 25.0] |
| state | S-POL@2 | S-POL@1 | P-ADAPT@1 | 20 | -10.0 pts | [-40.0, 20.0] |
| state | S-POL@2 | S-POL@1 | P-EXP@1 | 20 | 30.0 pts | [0.0, 55.0] |
| state | S-POL@2 | S-POL@1 | P-POL@1 | 20 | 30.0 pts | [10.0, 50.0] |
| state | S-POL@2 | S-POL@1 | P-SURV@1 | 20 | 5.0 pts | [-20.0, 30.0] |
