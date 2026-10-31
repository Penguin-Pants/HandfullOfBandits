# A Handful of Bandits: Turkey and the PKK, 1984-1999


## Development

Needs Node.js 24 LTS or later and GNU Make. The simulator lives in `sim/`.

1. `make install`
2. `make check` (typecheck and lint)
3. `make test`
4. `make start`
5. `make schema` after a change to a package schema in `sim/src/package/schema/`
6. `make validate DIR=<package-dir>` to check a game package

Windows without Make: run `npm ci`, `npm run check`, `npm test` or `npm start` inside `sim/`.

## Scenario A playtest

Start the app with `make start`, then select **Scenario A: 1984-1989**. It uses C1 and C2, ends at the second Propaganda round and includes ARGK Formed. The designer UI playthrough and notes export are the remaining IC-3a checkpoint.

Run a paired policy screen with `cd sim` then `npm run sim -- batch --games 10 --strategy concentration,sanctuary --swap-seats --out metrics.csv`. Each adjacent pair uses the same seed with the policies assigned to opposite factions. A faction-specific policy uses the scripted legal fallback as its other faction. Use `--seed N`, `--scenario scenario-a` or `--package <dir>` when needed.

Policies from research 12 section 7: State `concentration` (no Civic Action), `civic-action` (least security first) and `emergency-rule`; PKK `sanctuary`, `concealment` and `coerce-only`. `scripted` is also available. Village Clearance, talks cycling and Legal Politics policies wait for their later-phase rules. CSV holds round scores, margins, Harm, income, Resources and political tracks. The report flags an 80% faction win rate across at least ten games. These runs screen for exploits; they do not establish balance.

The draft physical map is [draft-map.svg](game-packages/kurdish-coin/0.1.0/map/draft-map.svg). The simulator keeps its schematic board (DEC-47 and DEC-48).
