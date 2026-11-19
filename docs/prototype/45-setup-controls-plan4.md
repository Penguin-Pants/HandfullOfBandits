# 45 Setup and playtest controls: audit Plan 4 results

Date: 2026-11-19. Scope: all of Plan 4 in [`docs/audit/playtest-readiness-audit.md`](../audit/playtest-readiness-audit.md) section 7 (V1 to V4). Designer answers to section 7.6 are in [`docs/audit/OPEN_QUESTIONS.md`](../audit/OPEN_QUESTIONS.md), "Decisions (2026-11-19, Plan 4)".

## 1. Bottom line

V1 and V2 are done. A variant is a short overlay file next to the package, Available is derived and each variant has its own hash. The app has a setup editor: edit the start position, see live totals and inline errors, save the variant, then start a session on it from Home.

| ID | Status | Result |
|:--|:--|:--|
| V1 Overlay loader, derived Available, hash | ✅ Done | `variants/<name>.yaml`; the 5 test variants as overlays play the same scenario as their package copies (section 3) |
| V2 Setup editor | ✅ Done | Home "Setup editor" and "Setup" picker. Each audit 7.3 error shows in its row; a saved variant starts a session (section 3) |
| V3 Variant in studies | ❌ Not started | |
| V4 Setup sheet | ❌ Not started | |

## 2. What changed

| Item | Change | Evidence |
|:--|:--|:--|
| Derived Available | A scenario without `available` derives it: piece total minus the map minus Out of Play (`package/load.ts` `availablePool`). V-PIECES then reports only an excess. `full-campaign.yaml` no longer stores the pool | `sim/test/variants.test.ts` "derived Available" |
| Overlay file | `schema/variant.ts`: `base`, `scenario`, then only `thresholds`, `tracks`, `spaces` (whole entry per space), `pieces` (totals), `outOfPlay`. File name = variant name. `make schema` wrote `variant.schema.json` | `schema.test.ts` |
| Loader | `package/variant.ts`: `variantNames`, `readVariant`, `resolveVariant`, `loadVariant`. The resolved scenario records `variant: {name, base, changes}`, so stored content names its variant. The `variants` folder is not package content (base hash unchanged, no warning). A new issue on the changed scenario names the variant file. Another base hash gives warning V-VARIANT | `variants.test.ts` |
| Setup diff | `setupChanges` (`package/diff.ts`): thresholds, tracks, levels, pieces and markers per face, both pools, piece totals. `sim diff` prints them per scenario | `variants.test.ts` "lists setup changes" |
| CLI | `sim validate <dir>` also checks each variant and prints `ok variant <name> hash <hash>`; a broken variant exits 1 | `variants.test.ts` |
| Variants | `game-packages/kurdish-coin/0.1.0/variants/`: `dd25-thresholds-43-38`, `dd25-thresholds-46-35`, `dd25-setup-police`, `dd25-variant-a`, `dd25-variant-b` | section 3 |
| Package spec | Doc 04: folder, `available`, `variant`, section 4.11, V-VARIANT | |
| 7.3 checks (V2) | New data, no new engine code. `map.yaml` stacking rules with `setupOnly: true` (checked on setup, kept out of the play ruleset): no Troops in an external box (rule 1.4.4), no Guerrilla or PKK Base in Iran (rule 1.3.3). `pieces.yaml` Guards `requiresFlag: law3175`: Guards on the map or Available without the Law give warning V-PIECES (rule 3.2.1). V-STACK messages now name the rule source | `sim/test/setup-editor.test.ts` "audit 7.3" |
| Server (V2) | `PackageSummary.variants`; `SessionService.checkVariant` (overlay, YAML text or saved name), `saveVariant` (only under the packages root; `base` becomes the package hash; refuses errors, and an existing name unless replace), `createSession({variant})`. Routes `POST /api/variants/check`, `POST /api/variants`; `POST /api/sessions` takes `variant`. Editor data in `server/variants.ts` | `setup-editor.test.ts` |
| UI (V2) | `ui/setup/Setup.tsx`: thresholds and start tracks, piece totals with "on map + Available + Out of Play = total" and editable totals and Out of Play, space by piece table with level and one column per face, issues in their row, change list against the package, Save, Replace, Reset, Open variant, Import YAML, Export YAML. Home: "Setup" picker and "Setup editor" button | `ui/setup/setup.test.tsx`, `home.test.tsx`; browser check (section 3) |
| Goldens | `full-campaign-seed-7.json` and `short-c1-seed-7.json` rewritten (`UPDATE_GOLDEN=1`) in V1 and V2. Commands and end unchanged; only state hashes changed, because the package hash is in the state. Check: the old full-campaign golden replays identically on the new content with the old package hash put back | |

## 3. Acceptance evidence

1. **V1 (designer decision V-3).** The package copies drifted from the baseline (rules.yaml, assumptions.yaml, the DK-010 title, the manifest note), so no overlay can give their hash. The proof instead: each overlay on today's package compiles to the same full-campaign scenario and piece list as the copy its stored run used (`sim/experiments/runs/dd25-v4b-*/package-content.json`). 5 of 5 equal. The 43/38 overlay is three lines: `base`, `scenario`, `thresholds`. Confidence: high.
2. **Derived Available.** The full campaign derives 14 Troops, 4 Police, 4 State Bases, 14 Guerrillas and 9 PKK Bases (rule 10.2).
3. **V2 inline errors.** Each 7.3 item gives an issue on the variant file with the row it belongs to: (1) excess pieces, V-PIECES on the piece row; (2) a third State Base, Guards in a City and a PKK Base in Western Cities, V-STACK on the space row; (3) a Guard on the map or Available before Law 3175, warning; (4) Troops or Police in an external box, a Guerrilla in Iran, a piece in Europe, V-STACK; (5) a level outside −2 to +2 or in an external box, V-RANGE. 12 cases in `setup-editor.test.ts`. Mutation check: without the setup-only filter, Cross-Border Troops no longer fit in the KDP Zone in play; without the flag check, both Guard cases fail.
4. **V2 saved variant starts a session.** Test: save, list, start; the session's package hash is the variant hash, its stored content records the variant, thresholds are 43/38 and Police Available is 3. Real app, built UI (Playwright, 1400 x 900, temporary package copy): Home, Setup editor, Siirt Police 2 (totals "Police: 21 on map + 3 Available + 0 Out of Play = 24 of 24"), a Guerrilla in Iran (V-STACK in the Iran row, Save disabled), removed, State threshold 43, change list "State threshold 49 to 43; Siirt: Police 1 to 2; Available Police 4 to 3", Save as `browser-check`, Home, Setup `browser-check`, Start: session `full-campaign-browser-check-seed1` with the variant hash. No page errors.

## 4. Two-pass review

| Class | Finding | Outcome |
|:--|:--|:--|
| Fix | `variantNames` threw when a file named `variants` takes the folder's place; the base loader ignores it | Returns none; test fails without the fix |
| Fix | `applyVariant`, the overlay type, the name pattern and `setupLine` were exported with no outside caller | Not exported |
| Drop | Derived Available can go negative in a variant record before validation | The same load reports V-PIECES and fails; no stored content has it |
| Fix (V2) | Number cells stretched, so the Guerrilla columns fell off a 1400 px screen | Narrow `input.count`; browser check shows every column |
| Fix (V2) | "Read a saved variant, then resolve it" was written three times (validate, package list, `loadVariant`) | One `loadSavedVariant` |
| Fix (V2) | The editor's YAML comment was built in two places | One `editorYaml` |
| Fix (V2) | `saveVariant` checked the schema after resolving, so its schema branch could not run | Schema first (422 with its issues); test added |
| Drop (V2) | The editor computes live totals itself, beside the server's derivation | The server cannot give totals for a setup that fails to load, which is when they matter; one line of arithmetic, and the server stays the authority for errors |

Validation: `make check` and `make test` pass (125 files, 1,824 tests). `make e2e` passes.

## 5. Not built

Audit section 7.2 asks for "what if" play from a live position: branch into a session marked "edited, not replayable". No milestone (V1 to V4) covers it, so it is not built.

## 6. Decisions still open (designer)

None for V1 and V2.
