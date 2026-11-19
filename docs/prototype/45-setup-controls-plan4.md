# 45 Setup and playtest controls: audit Plan 4 results

Date: 2026-11-19. Scope: all of Plan 4 in [`docs/audit/playtest-readiness-audit.md`](../audit/playtest-readiness-audit.md) section 7 (V1 to V4). Designer answers to section 7.6 are in [`docs/audit/OPEN_QUESTIONS.md`](../audit/OPEN_QUESTIONS.md), "Decisions (2026-11-19, Plan 4)".

## 1. Bottom line

V1 is done: a variant is a short overlay file next to the package, Available is derived and each variant has its own hash.

| ID | Status | Result |
|:--|:--|:--|
| V1 Overlay loader, derived Available, hash | ✅ Done | `variants/<name>.yaml`; the 5 test variants as overlays play the same scenario as their package copies (section 3) |
| V2 Setup editor | ❌ Not started | |
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
| Goldens | `full-campaign-seed-7.json` and `short-c1-seed-7.json` rewritten (`UPDATE_GOLDEN=1`). Commands and end unchanged; only state hashes changed, because the package hash is in the state. Check: the old full-campaign golden replays identically on the new content with the old package hash put back | |

## 3. Acceptance evidence

1. **V1 (designer decision V-3).** The package copies drifted from the baseline (rules.yaml, assumptions.yaml, the DK-010 title, the manifest note), so no overlay can give their hash. The proof instead: each overlay on today's package compiles to the same full-campaign scenario and piece list as the copy its stored run used (`sim/experiments/runs/dd25-v4b-*/package-content.json`). 5 of 5 equal. The 43/38 overlay is three lines: `base`, `scenario`, `thresholds`. Confidence: high.
2. **Derived Available.** The full campaign derives 14 Troops, 4 Police, 4 State Bases, 14 Guerrillas and 9 PKK Bases (rule 10.2).

## 4. Two-pass review

| Class | Finding | Outcome |
|:--|:--|:--|
| Fix | `variantNames` threw when a file named `variants` takes the folder's place; the base loader ignores it | Returns none; test fails without the fix |
| Fix | `applyVariant`, the overlay type, the name pattern and `setupLine` were exported with no outside caller | Not exported |
| Drop | Derived Available can go negative in a variant record before validation | The same load reports V-PIECES and fails; no stored content has it |

Validation: `make check` and `make test` pass (123 files, 1,788 tests).

## 5. Decisions still open (designer)

None for V1.
