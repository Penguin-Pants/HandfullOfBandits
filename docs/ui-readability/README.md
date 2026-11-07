# Readable play and browser fullscreen

This change preserves the approved resource badges, expanded political tracks and Game status panel in the right column. It does not restore the old global status row or the removed faction score summaries.

PR #82 is merged. This branch is stacked on the still-open PR #84 (`codex/compact-sidebar-status`, commit `a3a77be`). Merge #84 first, then retarget this PR to main. No PR was merged as part of this task.

## Behavior

Play uses 16 px standard text, 18 px instructions, 22 px task headings, 44 px primary action controls and 36 px secondary controls. Resource values stay at 20 px. Compact padding is retained. Eligibility labels sit above their choices so the larger text fits without overlap. The toolbar wraps independent controls without reducing their text size.

Fullscreen / Exit fullscreen is in the map toolbar, separate from Full (the display layer). It requests native fullscreen for the document so body portals and overlays are included. Its label follows fullscreenchange. Unsupported or rejected requests produce an inline message. There is no automatic fullscreen entry, Escape interception or saved fullscreen preference.

Hide actions narrows the approved sidebar to a 280 px Game status column and expands the map. Status, resources and forces remain accessible. The action panels stay mounted, preserving operation and Event drafts. The restore control stays in the toolbar and receives focus if actions are hidden. M retains its separate map-only behavior.

Card presentation, the Propaganda sequence list and detailed last-action output use native disclosures with useful summaries. Current Propaganda instructions and decisions remain outside the sequence disclosure. Setup's Reveal first card remains exposed. Event, Pivotal and Propaganda choices, previews, validation and commit controls are not put in supporting disclosures. Active cards remain discoverable outside the decorative card disclosure. History is reused.

Initial map zoom provides readable names and counts at the tested window sizes. Fit map remains an overview and can show smaller content. Zoom, pan, geometry, selection and legal adjacency are unchanged. Existing SVG sizing responds to layout changes while retaining the camera; no resize observer was needed.

## Browser measurements

Real sessions with seed 7 were captured before and after the change, both during a normal turn and at the Propaganda Emergency Rule decision. Full measurements are in [baseline.json](baseline.json) and [after.json](after.json).

| Viewport | Before name / count px | After name / count px | After initial zoom | Toolbar height |
| --- | --- | --- | --- | --- |
| 1366 × 768 | 15.9 / 13.0 | 21.2 / 17.3 | 250% | 91 px |
| 1536 × 864 | 17.0 / 13.9 | 21.3 / 17.5 | 200% | 91 px |
| 1920 × 1080 | 18.7 / 15.3 | 25.2 / 20.6 | 150% | 91 px |
| 2560 × 1440 | 27.0 / 22.1 | 26.8 / 21.9 | 100% | 49 px |

These are rendered SVG pixel sizes, measured using the screen transform. All four default windowed layouts have no horizontal page overflow, vertical page overflow or clipped toolbar controls. The 1366 px map grows from 347 px to about 370 px high. The wider sidebar and larger controls trade some desktop map area for readability. Hiding actions releases sidebar width. Narrow or short windows use ordinary page scrolling when needed.

## Validation

- `make check`: TypeScript and ESLint passed.
- `npm --prefix sim test -- src/ui`: all 225 UI tests passed across 25 files.
- `make test`: 1,481 passed and one failed across 106 files. The failure is `sim/test/experiment-cli.test.ts:94`, “records a game that exceeds its wall limit as a timeout with a replayable prefix, and continues”: expected replay exit code 0, received 1.
- Baseline `make test` before edits: all 1,475 passed. The timeout failure is intermittent: the same assertion was reproduced on the unchanged selected base `a3a77be` with `npm --prefix sim test -- test/experiment-cli.test.ts -t 'records a game that exceeds its wall limit'` in a separate worktree (one failed, 14 skipped). No experiment or engine files changed. Proposed follow-up: investigate replay failure after the one-second worker timeout; keep that repair outside this UI PR.
- `HOB_CHROMIUM=/usr/bin/chromium make e2e`: passed, including setup, plan by drag, preview, commit, note, undo, export, session resume and the full Scenario A flow.
- `DISPLAY=:99 HOB_SCREENSHOTS=/workspace/work/readable-evidence/after-ux make ux`: passed. [browser-checks.json](browser-checks.json) records the individual checks.
- Production builds and `git diff --check` passed.

The old smoke test's fixed 600 px map-height requirement was replaced with a usable-height check plus the requested rendered location-name target. Its check now loads a fresh default view at that viewport. Fit map is still checked separately as an overview. The UX suite no longer labels deviceScaleFactor emulation as browser zoom.

Headed Chromium on the installed Xorg dummy display verified native fullscreen entry, button exit and native Escape exit. Native Control-plus zoom produced devicePixelRatio 1.25 and 1.5 while outerWidth stayed fixed and innerWidth scaled accordingly. No deviceScaleFactor, CSS zoom or page-scale emulation was used. Both zoom levels had no sideways page scroll, including the short viewport at 150%.

The headed run also verified that a March draft, camera, selection, display layer and open card disclosure survive sidebar and fullscreen changes. Help, History, rule lookups, tooltip portals and notes work in fullscreen. A real Propaganda Emergency Rule choice was submitted and its resulting track value checked. Dense/empty contents and legacy coordinates remain covered by the existing UX cases. Existing phase-specific unit tests cover Event and Pivotal decisions.

The optional native check in `sim/e2e/native.mjs` needs DISPLAY, xwininfo, Python, libX11 and libXtst. Without DISPLAY, make ux records that headed checks were not run. Headless Escape did not exit native fullscreen in this environment; the headed run verified the actual behavior instead. Browser coverage here is Chromium on Linux; unsupported browsers receive the tested inline fallback.

## Screenshots

| Layout | Before | After |
| --- | --- | --- |
| 1366 × 768 | [Before](screenshots/before-1366.png) | [After](screenshots/after-1366.png) |
| 1920 × 1080 | [Before](screenshots/before-1920.png) | [After](screenshots/after-1920.png) |

[Actions hidden](screenshots/after-1366-collapsed.png) · [Native fullscreen](screenshots/fullscreen.png) · [Required decision in fullscreen](screenshots/fullscreen-decision.png)

## Review

Correctness: traced toolbar actions, fullscreen errors and listener cleanup, draft/selection retention, setup and all decision panels. Browser review found an event/render timing race in the new native assertions; those assertions now wait for the button label after fullscreenchange.

Simplicity: retained the existing map camera and disclosure patterns, consolidated the touched play layout rules and removed obsolete overrides. No new dependency, framework, server setting or stored preference was added.
