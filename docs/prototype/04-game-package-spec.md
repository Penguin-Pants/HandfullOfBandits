# 04 Game Package Specification

Status: planning document. Examples below are data format illustrations, not application code.

## 1. Principles

1. A package is a folder of YAML files. It holds data only.
2. Every element has a stable ID. IDs never change meaning between versions. A changed meaning gets a new ID.
3. Every number marked `[tune]` in the research is a named parameter.
4. Every rule element can carry `source` (research references) and `status` (01-mechanics-inventory.md, section 4).
5. Procedures live in handlers and modules. The package selects them and gives their parameters.

## 2. Folder structure

```
game-packages/
  kurdish-coin/
    0.1.0/
      manifest.yaml
      parameters.yaml
      factions.yaml
      pieces.yaml
      map.yaml
      tracks.yaml
      markers.yaml
      sequence.yaml
      actions.yaml
      cards/
        c1.yaml
        c2.yaml
        c3.yaml
        c4.yaml
        c5.yaml
        pivotal.yaml
        propaganda.yaml
      victory.yaml
      scenarios/
        full-campaign.yaml
        scenario-a.yaml
        scenario-b.yaml
        scenario-c.yaml
        test-slice.yaml
      assumptions.yaml
      CHANGELOG.md
```

One folder per version. Old version folders stay in the repository. The database also keeps a content copy of each version used by a session (section 10.3).

## 3. manifest.yaml

| Field | Type | Required | Meaning |
|---|---|---|---|
| `packageId` | string | yes | Stable ID, for example `kurdish-coin` |
| `version` | semver | yes | Human version, for example `0.3.1` |
| `rulesetVersion` | string | yes | Changes when any rule or value changes. Format `R<integer>` |
| `schemaVersion` | integer | yes | Package format version the loader must support |
| `parent` | `{version, rulesetVersion}` | no | The version this one derives from |
| `changeDescription` | string | yes | Short summary. Details in `CHANGELOG.md` |
| `title` | string | yes | Display name |
| `modules` | list of `id@major` | yes | Rule modules this package needs |
| `options` | map | no | Named competing options with allowed values (ALT and PA choices) |
| `researchBase` | string | no | Path of the research folder the package cites |

`rulesetVersion` and `version` differ on purpose. A text or layout fix changes `version` only. Replay compatibility depends on `rulesetVersion` plus content hash.

## 4. Core files

Schemas: `sim/src/package/schema/` (P1-04, DEC-37). JSON Schema for editors: `game-packages/_schema/`, written by `make schema`. Every object rejects unknown keys. Every number is an integer, so the package hash is canonical (05 s8 item 6). A field is required unless this section says "optional".

### 4.1 factions.yaml

| Field | Meaning |
|---|---|
| `id` | `state`, `pkk` |
| `name`, `color` | Display. Defaults (DEC-30): State red, PKK green |
| `kind` | `player` or `nonPlayer` |
| `resourcesTrack` | Track ID |
| `pivotalHand` | Default Pivotal card IDs (scenario may override) |

Two, three or four `player` factions are legal. The selected `SequenceModel` declares how many it supports. Validation checks the match.

### 4.2 pieces.yaml

| Field | Meaning |
|---|---|
| `id` | `troops`, `police`, `guards`, `stateBase`, `guerrilla`, `pkkBase` |
| `faction` | Owner |
| `count` | Total in the game |
| `isBase` | Base stacking and scoring flag |
| `states` | Optional flip states, for example `[underground, active]` with `placedAs: underground` |
| `countsForControl` | true or false |
| `movable` | false for Guards and Bases |
| `startPool` | `available` or `outOfPlay` |
| `shape` | Board icon: `cube`, `cylinder`, `disc` or `octagon`. Unknown value fails V-SCHEMA |
| `colorVariant` | Optional. `base` (default) or `light`: lighter shade of the faction color |
| `emblem` | Optional. `crescentStar` or `starCircle`. Unknown value fails V-SCHEMA |
| `emblemState` | Optional. Show the emblem only in this flip state, for example `active`. Unknown state fails V-REF |

Default shapes (DEC-29): Troops `cube`; Police `cube` with `colorVariant: light`; Village Guards `cylinder`; State Bases `disc`; Guerrillas `octagon`; PKK Bases `disc`.

Default emblems (DEC-30): State Bases `crescentStar`; Guerrillas `starCircle` with `emblemState: active`. All other pieces have none.

### 4.3 map.yaml

| Field | Meaning |
|---|---|
| `spaces[].id` | `hakkari`, `botan`, ... `western-cities` |
| `spaces[].name` | Display name, for example `Diyarbakır City` |
| `spaces[].kind` | `domestic` or `external` |
| `spaces[].terrain` | `mountain`, `plain`, `city`. Required for domestic spaces. Optional for external boxes (Cross-Border) |
| `spaces[].pop` | Integer |
| `spaces[].hasSupportScale` | true for domestic spaces |
| `spaces[].layout` | `{x, y}` for the schematic board |
| `spaces[].confidence` | Optional. Research confidence note (GAP-I09) |
| `spaces[].tags` | Optional. Free tags used by rules, for example `noLandLinks`, `receptionTarget` |
| `links[]` | `{a, b, kind}` where kind is `land` or `external` |
| `links[].gate` | Optional posture gate `{track, steps}`: the link is open only while the track is at one of the steps |
| `supportLevels` | Level IDs from Opposition to Support, odd length, middle item is Neutral. Range is ±(length - 1) / 2 (DEC-39). Example: `[activeOpposition, passiveOpposition, neutral, passiveSupport, activeSupport]`. Optional, but required when a space has a support scale (V-RANGE) |
| `stacking[]` | `{pieces, max}` plus optional filters `spaceKind`, `terrain[]`, `spaces[]`. At most `max` of the listed piece types in each space that matches every filter. Example: `{pieces: [guards], max: 3, terrain: [mountain, plain]}` |

### 4.4 tracks.yaml and markers.yaml

Tracks: `id`, `kind` (`numeric` or `ordinal`), `min` and `max` (`min` <= `max`) or `steps[]` (2 or more), optional `owner` (faction ID), `display` (display name). Numeric tracks may set `overflow: {track, costParam}`: a loss the track cannot pay costs the `costParam` value per unpaid point on another numeric track (Legitimacy, research 04 s3.2, DEC-41).
Markers: `id`, `count`, optional `sides` (2 or more, for example `[new, old]` or `[faceDown, revealed]`), optional `hidden` flag, optional `blocks` (shift directions blocked in its space: `support`, `opposition` or both), optional `capsLevel` (no shift takes a level past ±`capsLevel` in its space; Office: 1; DEC-39). Harm counts are in `victory.yaml` only (DEC-38).

### 4.5 parameters.yaml

All tunable values in one file. Each entry:

| Field | Meaning |
|---|---|
| `id` | `sweep.costPerSpace`, `harm.limit`, `civicAction.capDivisor` |
| `value` | Number, string or list |
| `tune` | true if the research marks it `[tune]` |
| `source` | Research reference |

A handler reads a value only through its parameter ID. No handler holds a game number in code. A lint test checks handlers for numeric literals other than 0, 1 and 2 used as counters (P1-08).

### 4.6 sequence.yaml

| Field | Meaning |
|---|---|
| `model` | `ct-two-faction@1` |
| `boxes` | Box IDs and labels |
| `adjacency` | Responder graph (05 s2.3) |
| `eligibilityRules` | Which choices hand First Eligible to the other faction |
| `passIncome` | Per faction |
| `firstEligibleAtStart` | `pkk` |
| `propagandaPhases` | Ordered list of phase handler IDs with parameters |
| `pivotal` | Priority rule, box placement |

### 4.7 actions.yaml

One entry per Operation and Special Activity.

| Field | Meaning |
|---|---|
| `id` | `state.sweep`, `pkk.rally`, `state.village-clearance` |
| `faction` | Owner |
| `type` | `op` or `sa` |
| `handler` | `coin.sweep@1` or `kurdish-coin.village-clearance@1` |
| `params` | Parameter IDs or inline values the handler needs |
| `accompanies` | For SAs: Op IDs, or `any` |
| `availability` | Closed condition terms (section 8), for example `campaignAtLeast: C3` |
| `ruleRefs` | Rule IDs shown in logs and tooltips |
| `source` | Research reference |
| `status` | Inventory status |
| `provisional` | Optional PA reference list |

### 4.8 cards/*.yaml

| Field | Meaning |
|---|---|
| `id` | `DK-001` (deck CSV ID) |
| `campaign`, `title`, `date` | From the deck CSV |
| `type` | `event`, `capability`, `momentum`, `pivotal`, `propaganda` |
| `mandatory` | Structural card flag |
| `always` | Effect list applied on reveal |
| `unshaded`, `shaded` | `{text, owner, effects, blockOnly, tier}` |
| `chainAfter` | Card ID this card must follow |
| `pivotal` | `{faction, earliestCampaign, precondition}` |
| `encoding` | `{status: encoded or notEncoded, encodedBy, reviewedAgainstText}` |
| `eventConfidence`, `deckEligible` | From the deck CSV |
| `sources` | Event and source IDs |

`text` is the exact prose from the CSV. It is never edited by the encoder.

### 4.9 victory.yaml

1. `scores`: per faction, a list of formula terms. The value is their sum. Every player faction needs one (V-VICTORY).
2. `harmCount`: per faction, a list of formula terms, for example `countMarkers`. The only source of Harm counts (DEC-38). Every player faction needs one (V-VICTORY). A marker type a `countMarkers` term counts here is a Harm marker for the PA-09 warning (DEC-43).
3. `totals`: optional named lists of formula terms, for example `totalSupport` (05 s9 item 1).
4. `harmLimit`, `checkSkipFirstRound`, `tieOrder`, `finalMargin` terms (P3a; not in the schema yet).
5. `recordSheet`: dimensions from 09 s6, as derived metrics (record only; P3a).

Thresholds live in scenario files, because they differ per scenario.

### 4.10 scenarios/*.yaml

| Field | Meaning |
|---|---|
| `id`, `title`, `campaigns` | For example `[C1, C2]` |
| `finalRound` | Propaganda round that ends the game |
| `tracks` | Start values |
| `spaces` | Pieces, levels and markers per space. Counts per flip state or side, for example `guerrilla: {underground: 2}`. A bare count places pieces on their `placedAs` face. A marker with sides always needs counts per side (DEC-40) |
| `available`, `outOfPlay` | Pools. A piece type not listed has 0 in that pool. Validation checks totals against `pieces.yaml` |
| `pivotals` | Per faction |
| `flags` | For example `law3175: true`, `northernIraqVacuum: true` |
| `thresholds` | Per faction |
| `options` | Values for every competing option in `manifest.options` |
| `excludedCards` | Optional list with reason |
| `testOnly` | true for designer test scenarios not taken from research |

## 5. Effect primitives (card and module output)

| Primitive | Parameters |
|---|---|
| `placePieces` | faction, piece, count, space or choice, state |
| `removePieces` | piece filter, count, space or choice, destination |
| `movePieces` | piece filter, count, from, to |
| `forEachSpace` | filter (condition terms), min, max, nested effect list. The executing faction picks min to max matching spaces. With `all: true`, run automatically once in every matching space; min and max apply only to choices. The nested effects run once per space, in pick order (or map order for all) |
| `forEachPiece` | `piece`, optional `state`, `where`, `min`, `max`, `effects`. Pick a count, then one piece location per pick. A location can repeat up to its original piece inventory. Nested effects use `selected` |
| `setPieceState` | piece, from state, to state, space, count or all |
| `shiftLevel` | space or choice, direction, steps |
| `adjustTrack` | track, delta |
| `setTrack` | track, value or `ifEquals` guard |
| `stepOrdinal` | track, direction, steps |
| `placeMarker` / `removeMarker` / `flipMarker` | marker, space or choice, side |
| `setFlag` | flag, value |
| `freeAction` | action ID, constraints (spaces, extra rules) |
| `addModifier` | modifier ID, duration (`game` or `untilReset`), parameters |
| `revealHidden` | marker, count, selection (`random` or choice) |
| `runProcedure` | module procedure ID, parameters |
| `choice` | chooser (default PA-01), options, each option a nested effect list |
| `conditional` | condition terms, then and else effect lists |

`count` is an integer or `{min, max}` for "up to N" text. `{min, max}` lives in the card effect schema (P2-05); the event runner resolves it to an integer before a core primitive runs (DEC-41). The executing faction picks the number (PA-01). Inside `forEachSpace` or `forEachPiece`, `space: selected` refers to the current pick (DEC-33).

Rule: every primitive is applied by core code that enforces stacking, supply, clamps and shift blocks. "Do as much as you can" (05 s5.3) is implemented by applying each primitive in order and logging the parts that could not apply.

## 6. Example card encoding

```yaml
- id: DK-001
  campaign: C1
  title: Eruh and Şemdinli (15 Aug 1984)
  type: event
  unshaded:
    owner: state
    text: "Martial law reinforcement: place 2 Troops from Available in Hakkari or Botan. State Resources +2."
    effects:
      - choice:
          options:
            - [{placePieces: {piece: troops, count: 2, space: hakkari}}]
            - [{placePieces: {piece: troops, count: 2, space: botan}}]
      - adjustTrack: {track: resources.state, delta: 2}
  shaded:
    owner: pkk
    text: "Opening raids: place 2 Underground Guerrillas in Hakkari and 1 in Botan. Shift Botan one level toward Opposition."
    effects:
      - placePieces: {piece: guerrilla, count: 2, space: hakkari, state: underground}
      - placePieces: {piece: guerrilla, count: 1, space: botan, state: underground}
      - shiftLevel: {space: botan, direction: opposition, steps: 1}
  encoding: {status: encoded, encodedBy: designer, reviewedAgainstText: true}
```

## 7. Provisional rules and assumptions

`assumptions.yaml` lists each PA from 02-rules-gap-analysis.md:

| Field | Meaning |
|---|---|
| `id` | `PA-05` |
| `gap` | `GAP-B05` |
| `text` | The provisional rule |
| `appliesTo` | Rule or action IDs |
| `status` | `provisional`, `accepted` or `replaced` |

Any rule element may set `status: missing`. Validation then blocks a session that can reach that element.

## 8. Condition and formula terms (closed set)

Conditions: `campaignAtLeast`, `campaignIn`, `trackAtLeast`, `trackAtMost`, `trackIn`, `flag`, `spaceHas`, `spaceLevelIn`, `control`, `countAtLeast`, `optionEquals`, `terrainIn`, `spaceKind`, `adjacentTo`, `selected`, `all`, `any`, `not`.
Formula terms: `sumPopWhere`, `countPieces`, `countMarkers`, `trackValue`, `divideFloor`, `multiply`, `add`, `constant`, `moduleTerm`.

There is no expression string. A new term type needs a code change and a schema version bump.

Shapes built in P1-09 (DEC-43). Each term is an object with a `type` key. Pieces and markers count on the map only, never in pools.

| Term | Fields |
|---|---|
| `sumPopWhere` | `where`: space condition. Sum of Pop of matching spaces |
| `countPieces` | `pieces`: piece IDs, optional `where` (absent: every space). Every face counts |
| `countMarkers` | `markers`: marker IDs, optional `sides` (absent: every side), optional `where` |
| `trackValue` | `track`: numeric track ID |
| `divideFloor` | `of`: term, `by`: integer 1 or more. Rounds down |
| `multiply` | `of`: term, `by`: integer |
| `add` | `terms`: list of terms |
| `constant` | `value`: integer |

Space conditions built in P1-09: `spaceKind` (`kind`), `terrainIn` (`terrain` list), `spaceLevelIn` (`levels`: signed levels, never matches a space with no support scale), `control` (`faction`), `spaceHas` (`pieces` and/or `markers`: at least one of a listed type), `all` and `any` (`of`: list), `not` (`of`: condition). The other conditions and `moduleTerm` come with their first users (P2-05, rule modules).

## 9. Validation

Validation runs on load, before a session starts, and in the CLI (`sim validate <path>`).

| Code | Check | Level |
|---|---|---|
| V-SCHEMA | Each file matches its schema version. A file the loader does not read gives a warning (DEC-40) | error |
| V-REF | Every referenced ID exists (spaces, pieces, tracks, markers, actions, cards, parameters, modules) | error |
| V-MODULE | Each module `id@major` exists in the registry | error |
| V-FACTIONS | 2 to 4 player factions (s4.1). The match with the sequence model comes with P2-03 | error |
| V-PIECES | Scenario pieces plus pools equal totals. Markers on the map do not exceed their count | error |
| V-RANGE | Scenario track values within `min` and `max`. Levels within the `supportLevels` range and only on spaces with a support scale. A space with a support scale needs `supportLevels` (DEC-39, DEC-40) | error |
| V-STACK | Scenario setup obeys stacking | error |
| V-LINKS | Adjacency is symmetric. No link to an unknown space | error |
| V-CARDS | Each pile has enough eligible cards and one Propaganda card (scenario-scoped, DEC-51). Card IDs are unique. Chain pairs refer to real cards | error |
| V-ENCODE | Each card a scenario can draw is encoded or excluded | error, scenario-scoped: blocks that scenario only (DEC-51) |
| V-EFFECT | Each effect primitive has valid parameters | error |
| V-VICTORY | Score terms resolve. Thresholds set for each player faction | error |
| V-OPTIONS | Every competing option has a value in each scenario | error |
| V-PARAM | Every `tune` parameter has a value | error |
| V-MISSING | A reachable rule has `status: missing` | error |
| V-PROVISIONAL | A rule uses a PA | warning |
| V-SCORE-CHECK | Computed start scores equal the scenario's stated start scores | warning |

Each message gives file, path inside the file, the ID and a plain sentence. Example: `scenarios/scenario-b.yaml spaces.botan.pieces.guards: 2 Guards exceed the limit of 3 when added to 2 from events.flags`.

## 10. Versioning

### 10.1 Rules

1. Any change to a value, effect, handler choice or module version raises `rulesetVersion`.
2. A schema change raises `schemaVersion`. The loader supports the current and previous schema version.
3. `parent` names the previous version. The package diff tool compares two versions (P4-05).

### 10.2 Content hash

The loader computes a SHA-256 hash of the canonical package content (sorted keys, normalized YAML). The hash identifies the exact rules of a session.

### 10.3 Preservation

1. When a session starts, the store saves the full package content under its hash, if not already saved. The content is `packageContent(data)` in `sim/src/package/load.ts`: the normalized files by path, the same value the hash covers. `loadPackage({files: content, issues: []})` loads it again (IC-1).
2. A session can always reload its own package from the database, even if the folder is deleted.
3. Rule modules and shared handlers are code. Each session records its own app version, each module full semver and a `code_fingerprint`: one SHA-256 over all rules-execution code (`engine/core`, `engine/coin`, `engine/modules`), computed at build time.
4. On resume, if the `code_fingerprint` differs, the app runs a replay check before resume. Replay identical: resume. Replay differs: read-only with "rules code changed since this session".
5. If a module major version is gone, the session opens read-only and reports "module version unavailable".

Next step: read 05-rules-engine-spec.md.

Schema 2 (Phase 3a): `spaceIn {spaces: [...]}` tests explicit space IDs. Card effects add `addModifier` and `forEachPiece`. The loader also accepts schema 1 packages. Kurdish ruleset R2 adds Scenario A execution. R3 integrates the DD-20 designer rule and C1 Event changes.
