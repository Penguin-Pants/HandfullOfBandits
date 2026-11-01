# DD-21 Attack attrition: TWO-PASS REVIEW

Status: complete, 1 November 2026. The designer approved conditional attrition using the existing Attack die and the explicit wording “less than or equal to”. Current ruleset: R4. Confidence in the verified implementation: high. No claim of historical casualty calibration is made.

## Acceptance

An ordinary Attack rolls once per space. Success uses the Guerrilla count. If Troops are removed, attrition uses that same die against the Troop count before removals. A result less than or equal to that original count removes one Guerrilla per Troop removed. A greater result, a miss or no Troops removed causes no attrition. Removed Guerrillas return to Available, then the existing roll-of-1 bonus resolves. Ambush remains no-roll and no-attrition. Apply the rule to free Event Attacks too.

Research 06, DD-21, the mechanics inventory, the in-game Attack summary and the printable reading edition contain the new procedure. The R4 manifest and refreshed S0/Scenario A goldens identify the deliberate rule change. No probability parameter, extra roll or new effect type is required.

## Pass 1: correctness

Traced ChooseOperation through validation and execution into Attack, and ChooseEvent through the existing free-action runner into the same handler. The Troop snapshot is inside the per-space loop after the separate Ambush branch and before any ordinary Attack removal. All comparisons use the original die; only the conditional that applies Guerrilla removal changes. The hit condition, State removal order, attrition quantity, Available destination and bonus order remain intact.

The six-result fixture for four Guerrillas versus two Troops verifies both equality boundaries, hits without attrition and misses. A separate five-Troop/six-Guerrilla fixture at roll 5 distinguishes the original Troop count from both removed and remaining Troops. Police-only removal and choosing zero removals test that the attrition condition requires actual Troop removal. A mixed Attack/Ambush action and a free Event Attack verify the real callers. RNG state equals exactly one die draw for each ordinary Attack; existing Ambush tests verify no die draw. UI assertions check the explicit comparison wording and reference to original Troops.

- **Fix:** previous automatic attrition removed two Guerrillas on rolls 3 and 4 against two Troops. Both new behavior assertions failed before the handler change and pass afterward.
- **Fix:** the in-game summary still described automatic loss and used “at most”. Its new wording assertion failed before the summary change and passes afterward.
- **Fix:** the PDF template hard-coded R3 and its old date. The cover, running metadata and PDF subject now use existing Pandoc metadata, with the version read from the manifest. The rebuilt PDF identifies R4 and 1 November 2026.
- **Drop:** no second-roll, Ambush or removal-order defect reproduced. Focused tests and the existing regression suite pass.
- **Propose:** retain the existing PKK 9/10 screen flag for designer review; the rerun does not justify balance tuning.
- **Decide:** none added. The designer has supplied the rule and wording. The pre-existing rulebook source differences and IC-3a remain recorded separately.

The changed rules code uses only existing piece-count, RNG and removal primitives. No filesystem or platform-dependent runtime path was added. Linux execution is verified. Windows execution is not available here. PDF source paths retain the existing pathlib and Pandoc build process.

## Pass 2: simplicity

One local Troop snapshot and one added comparison implement the rule. The normal Operation and Event paths share the existing handler; no duplicate attrition calculation or helper is needed. Ambush still exits its dedicated branch before the ordinary roll. No dependency, numeric rule parameter, extra random draw or new UI flow was added.

The three regenerated paired-screen CSVs are byte-identical to the existing `phase3a-results/` files. Removed the duplicate output copies and retained the rerun provenance here and in the plan. Original R3 reports and review records remain historical. Source and PDF metadata share the existing build inputs instead of hard-coded template copies.

## Validation

- Red/green: three failing assertions before implementation (two hit-without-attrition cases and the summary wording), then all 122 focused tests passed across five files.
- `make check`: TypeScript and ESLint pass. `make test`: 819 tests across 62 files pass. Both refreshed golden replays pass; Scenario A CLI replay remains identical across 65 commands.
- `make e2e`: production build and all S0/Scenario A browser assertions pass, including saved game resume, notes and round-metric export. Installed Chromium uses a temporary launcher outside the repository.
- Package validation: R4 hash `1565e7a338b2f810ba612fbf4a297c0d0ba6c19db658b8f4703802b0730b0720`; Scenario A has no blockers. C3–C5/full-campaign exclusions remain expected.
- Thirty paired games, seeds 0–4 with swapped seats: State/PKK wins 1/9, 5/5 and 3/7. All round CSVs are unchanged. Small scripted policies do not establish balance.
- `make rulebook`: 12 A4 portrait pages. Current Attack text, DD-21, R4/date metadata, searchable text, embedded fonts, contents/bookmark destinations and text bounds checked. The rule and example were rendered for reading-size review. No physical printer was used.

Older sessions retain their stored package. Under the existing fingerprint/replay policy, a rules-code change that alters their replay can make them read-only. This change does not silently migrate a stored game to R4. New games use R4. IC-3a remains open for the designer's Scenario A playthrough and export.
