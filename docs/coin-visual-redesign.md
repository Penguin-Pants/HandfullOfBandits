# Handful of Bandits: GMT COIN Visual Redesign

## Mission
Implement a complete visual redesign of the existing browser-based Handful of Bandits game. Make it resemble a professionally produced physical GMT COIN-series board game, with a detailed printed map and realistic painted wooden pieces. This is an implementation task, not a request for mockups or a new game. Preserve all gameplay logic, state, region identities, geographic geometry and adjacency.

This specification is authoritative for the visual redesign. Existing `docs/ux-overhaul-plan.md` and `docs/prototype/11-build-plan.md` may be consulted for architecture and constraints but are not the task to execute. Do not restart those plans.

## Locked decisions
- Pieces: pre-rendered 3D-looking sprites, not real-time 3D objects.
- Map: hybrid detailed cartography and physical printed-board appearance.
- Layout: board-first, viewport-filling browser application with contextual/collapsible controls.
- Geography: preserve existing gameplay-region geometry, identifiers, coordinates and adjacency.
- View: fixed overhead map, with 3D-looking pieces viewed from a consistent slightly elevated angle.
- Target screens: 1920 x 1080 primary, 1366 x 768 secondary.
- Existing application architecture: reuse unless a small, justified change is required.
- Refinement budget: at most two visual refinement passes after initial implementation.

## Visual reference
Use the six user-supplied photos of physical GMT COIN games (including A Distant Plain, Fire in the Lake and Colonial Twilight) as visual references if accessible in the working session. If the images are unavailable, this specification is sufficient to proceed. Recreate the physical visual language, not copyrighted map artwork, branding or exact proprietary graphic assets.

## Initial audit and architecture
Read `AGENTS.md` where present, relevant design/requirements files and the existing map, rendering, piece, state and interaction code. Identify the framework, map geometry source, coordinate transforms, current piece types, faction colors, region data, UI controls, test commands and screenshot/browser tooling. Treat repository game data as authoritative. Do not invent piece types, faction colors, historical locations or map geometry. Select one minimal rendering architecture and identify exact files/components to change. Prefer static/cached map layers and transparent sprites over a 3D engine. Do not replace the framework or rewrite game logic.

## Map visual requirements
- Make the map the dominant element: muted natural earth tones, restrained shaded relief, mountain/valley texture, plains, vegetation and major water features only where supported by existing geographic data or trustworthy available assets.
- Appearance: high-quality historical printed board, not satellite photography, generic online maps or an arcade strategy game. Subtle paper texture, restrained relief and crisp region lines.
- Suggested palette: muted ochre and olive plains, warm brown/tan highlands, brown-gray mountains, subdued olive vegetation, desaturated blue-gray water, neutral external areas. Tune for contrast.
- Preserve all gameplay-region shapes and boundaries exactly at the data/interaction level. Styling, antialiasing and line weights may change, but do not alter geometry, adjacency, identifiers or region membership. National borders should differ visibly from internal borders. Do not fabricate roads, rivers, labels or features.
- Labels: readable hierarchy for countries, gameplay regions, cities and secondary geography. Prioritize region names at default zoom. Use placement, halos and zoom-dependent secondary detail to reduce collisions. Every region must remain identifiable and selectable.
- Render layers in stable order: terrain, geographic lines/features, labels/printed information, pieces, selection overlays and contextual UI. Adapt to the existing renderer.

## Wooden pieces and assets
- Inspect the game definitions and reproduce every existing component shape, faction color and identifying marking. Typical COIN pieces may include cubes, cylinders and discs, but the repository decides the actual list.
- Create reusable transparent sprites or sprite atlases with visible depth, subtle bevels, matte painted wood, mild surface variation and consistent light direction. Include soft contact shadows. Avoid plastic, glossy highlights, cartoon effects and exaggerated grain.
- Keep scale and projection consistent across types. Support high-density displays and reasonable asset sizes. Do not rerender wood textures on each frame.
- Preserve each piece's region and game-state relationship. Use deterministic, stable within-region placement, without implying pieces belong to neighboring regions. Handle crowded areas through grouping or contextual inspection, not by hiding counts or shrinking pieces beyond readability.
- Selected pieces and regions need subtle, clear feedback without neon glow. Existing click/select/action behavior must remain functional.

## Full-screen browser layout
- Fill the available browser viewport without requiring the Fullscreen API; optional true fullscreen control only if easy to support.
- Keep the board visually dominant, aiming for approximately 85-90% of the available viewport when nonessential panels are closed, subject to map aspect ratio.
- Preserve access to all existing information and controls, including active faction, turn, resources, available forces, casualties, event cards, actions and selection details where those features exist.
- Use compact collapsible/contextual panels styled like printed player aids or event cards. Do not permanently cover important regions with large dashboard cards.
- Support wheel zoom, drag pan, region selection, piece inspection, fit-to-board and browser resizing. Prefer pointer-centered zoom if the current renderer supports it. Avoid page scroll while interacting with the board.
- Maintain readable labels, clear click targets, distinguishable pieces and accessible inspection at both target resolutions. Do not change rules or action availability.

## Scope boundaries
In scope: map appearance, terrain art, line/label styling, piece sprite assets, piece presentation and clustering, full-screen layout, visual treatment of existing information, pan/zoom/selection usability, rendering optimizations directly needed for the redesign.

Out of scope: rules, victory conditions, faction design, event/card content, gameplay calculations, game-state schemas, region geometry/adjacency, unrelated refactoring, unrelated UX or prototype roadmap items and speculative features.

## Model orchestration and cost control
The lead model owns the audit, architecture, visual specification, task decomposition, integration decisions and final visual approval. Delegate bounded routine work to lower-cost agents when supported by the environment: sprite generation, isolated components, CSS, specified map-layer changes, tests, screenshot capture and documentation. Prefer Haiku-class agents for simple work and Sonnet-class agents for substantial coding when available. Do not assume a model can be selected unless the tool actually supports it. If delegation is unavailable, proceed with the available model.

**Mandatory report after audit, before implementation:** Print one concise Task Assignment and Model Allocation Report with columns: task, assigned model/agent, reason, files or components, dependencies and measurable acceptance criteria. State which tasks can run in parallel, which decisions remain with the lead model and any unavailable delegation capabilities. Do not wait for user approval. Immediately proceed with implementation. Do not regenerate this report unless a material technical discovery changes the plan. Avoid parallel agents editing the same files.

Use targeted context, bounded assignments and concise agent summaries. Do not duplicate completed work or repeatedly reopen settled architecture decisions. Reserve the lead model for difficult integration and final quality review.

## Execution: four phases
1. **Audit and specification:** inspect the repository; select one architecture; identify relevant files and assets; define final palette, typography, layer order, sprite variants and tests. Produce the mandatory model-allocation report and continue automatically.
2. **Map and pieces:** implement terrain/printed-board styling, boundaries, labels, sprites, stable piece placement and selection visuals. Prioritize these over secondary controls.
3. **Layout and interaction:** implement viewport-filling board-first layout, contextual/collapsible existing information and reliable navigation. Preserve gameplay behavior.
4. **Validation and refinement:** run available tests, exercise the app in a browser if tooling exists and capture 1920x1080 and 1366x768 screenshots. Test overview, zoomed map, crowded region, selected region/piece, visible controls and an actual gameplay interaction. Compare to the visual reference and make no more than two targeted refinement passes. Fix concrete defects, not subjective redesign cycles.

## Acceptance criteria
- [ ] Map resembles a professionally printed historical COIN board, with detailed but restrained terrain.
- [ ] Existing geographic geometry, region identities and adjacency remain unchanged.
- [ ] Borders and gameplay-region labels remain clear and every region remains selectable.
- [ ] Every existing game-piece type has a coherent realistic painted-wood sprite with visible volume and shadow.
- [ ] Faction colors, piece counts, ownership and state remain correct.
- [ ] Piece positions are stable and crowded regions can be inspected without losing information.
- [ ] Application fills the desktop browser viewport and map remains dominant.
- [ ] Existing information and controls remain available without excessive map obstruction.
- [ ] Pan, zoom, fit-to-board, selection and relevant gameplay interactions work.
- [ ] Screens at 1920x1080 and 1366x768 are usable without horizontal page scrolling.
- [ ] Existing rules, calculations, game state and victory conditions are unchanged.
- [ ] Relevant automated tests pass and no new console errors occur in tested flows.
- [ ] Rendering remains responsive at both target resolutions.
- [ ] No known gameplay regression is introduced.

Do not claim a check passed unless tested. Report any unverified criteria and the reason.

## Deliverables
- Working changes in the existing application and necessary visual assets/source.
- Updated `design.md` or existing canonical design document describing the implemented visual system.
- Before-and-after screenshots at 1920x1080 and an after screenshot at 1366x768, if browser screenshot tooling is available.
- Concise summary of changed files, architecture, actual model/agent assignments, test results and known limitations.
- Work on the current development branch unless repository instructions say otherwise. Do not require a GitHub connector or pull request to complete local implementation; report any push/PR limitations separately.

## Completion behavior
Do not stop after the audit, report or mockups. Do not ask for routine approvals. Continue through implementation and validation. Stop only for genuinely missing essential information that cannot be recovered from the repository or this specification, or for a change that would violate the locked constraints. When acceptance criteria are met or remaining blockers are documented, report results and stop.
