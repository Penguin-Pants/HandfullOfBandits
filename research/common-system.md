# COIN common system

Scope: the rules that most COIN games share. Source: the per-game summaries in `analysis/games/`. Each claim cites the rulebook section of one game. Section numbers differ little between games. Game codes:

| Code | Game | Code | Game |
|---|---|---|---|
| AA | Andean Abyss | PDG | Pendragon |
| CL | Cuba Libre | GAN | Gandhi |
| ADP | A Distant Plain | ABB | All Bridges Burning |
| FITL | Fire in the Lake | PP | People Power |
| LOD | Liberty or Death | RDR | Red Dust Rebellion |
| FS | Falling Sky | CW | China's War |
| CT | Colonial Twilight | BW | The British Way |

Label "inferred" marks a point that no rulebook states. Variation by game is in `variation-matrix.md`.

## 1. Sequence of play and eligibility

Core design, as in AA (1.1, 2.3):

- No hands. One Event card is played. The next card is shown to all (AA 2.2). Exceptions: CT removes the look-ahead (CT Playbook p.12). PP hides the next card (PP Playbook p.44). RDR and ABB show two cards (RDR 4.0, ABB 2.1).
- Each Event card shows Faction symbols in a row. The leftmost Eligible Faction is 1st Eligible. The next is 2nd Eligible (AA 2.3.2; FS 2.3.2).
- Eligible Factions that did not act on the last card stay Eligible. Factions that acted are Ineligible on the next card (AA 2.3.7; FS 2.3.6).
- 1st Eligible options: Pass, Event, or Operation with or without a Special Activity (AA 2.3.4).
- 2nd Eligible options depend on the 1st Eligible:

| 1st Eligible did | 2nd Eligible may do |
|---|---|
| Operation only | Limited Operation |
| Operation plus Special Activity | Limited Operation or Event |
| Event | Operation, with Special Activity if wanted |

- Limited Operation: one space, no Special Activity. Moves that gather from many spaces may use many origins and one destination (AA 2.3.5).
- Pass: the Faction stays Eligible and gains Resources. The amount depends on the Faction (AA 2.3.3: +1, Government +3).
- Free Operations from Events cost nothing and do not change Eligibility (AA 5.5).
- Recurring restriction before each scoring round: FS Frost bans March on the last Event card before each Winter (FS 2.3.8). FITL Monsoon bans Sweep and March, limits Air Lift and Air Strike, and blocks Pivotal Events before every Coup (FITL 2.3.9).
- End-game-only restriction: in AA, CL and ADP the last Event card before the final Propaganda card limits player Operations (AA 2.3.9: Limited Operations, no Sweep, no March; CL 2.3.9: Limited Operations; ADP 2.3.8: Limited Operations, no Sweep, no March). It does not apply in earlier campaigns.
- Sudden scoring option: swap the two showing cards and run the round now (CL 2.3.8; ADP 2.3.7; FS 2.3.8).
- Series changes (from game summaries):
  - Two Factions: CT and BW use an Initiative Track with three boxes (CT 2.3.2; BW 2.3).
  - Three Factions act: PP lets a 3rd Eligible Faction take a Limited Operation. A Limited Operation does not cost Eligibility in PP (PP 2.3.3, 2.3.5). ABB lets all three act and has no order on cards (ABB 2.2.1, 2.2.3).
  - Pivotal or Brilliant Stroke cards held by Factions can cancel an Event card (FITL 2.3.8; LOD 2.3.8; PDG 2.3.8; CT 2.3.7).
  - RDR lets one Faction buy initiative with cards (RDR 4.1).
  - Other changes are small: unequal Pass income (CW 2.3.3), a free Large Offensive (CW 2.3.8), Launder (CL 2.3.6), Ship (AA 2.3.6).

## 2. Faction structure and asymmetry

- Each Faction has its own pieces, Operations, Special Activities, victory formula and aid sheet (AA 1.5; FS 1.5).
- Types seen in the series (inferred from the game summaries): government (COIN), foreign COIN ally, insurgent, nonviolent insurgent, criminal or economic actor, system-run Faction.
- Every Faction has a different victory formula. Typical term sets:
  - Government: Support, Control, Aid or Patronage (AA 7.2; FITL 7.2).
  - Insurgent: Opposition plus Bases (CL 7.2; FITL 7.2).
  - Economic or criminal actor: Resources plus a count of Bases or Casinos (AA 7.2; CL 7.2).
  - Third party: Control of Population, or Allies relative to others (CL 7.2; FS 7.2).
- Two Factions of one side are often rivals, as in FITL (US against ARVN, NVA against VC) (FITL Playbook p.47).
- If one player runs two Factions, the player uses the lower victory margin of the two. Play ends only if both meet their goals (AA 1.5.1; FS 1.5.1). Exception: FS Great Revolt uses the higher margin for Arverni and Belgae (FS 1.5.1).
- Negotiation is open. Binding only inside the current action (FS 1.5.2). Resource transfers are allowed within limits (AA 1.5.2; FS 1.5.2).
- Game-run Factions exist: Germans in FS (FS 1.5, 6.2), Powers in ABB (ABB 1.3.1), EarthGov in RDR (RDR 1.1).
- Asymmetry in play (inferred from the Resources and pass rules):
  - Government Factions have more Resources and weaker visibility tools. They pay per space for most Operations (AA 3.2).
  - Insurgents pay little. Hidden or Underground pieces carry most of their power (AA 1.4.3).
  - Pass rewards differ by Faction (see matrix).

## 3. Operations and Special Activities

Each Faction has four Operations (Commands in LOD and FS; Feats in PDG). Each has a set of Special Activities (Special Abilities in FS). Special Activities run before, during or after their Operation, never on a Limited Operation (AA 4.1; FS 4.1).

Shared Operation families (names change by game):

| Family | Government side | Insurgent side |
|---|---|---|
| Place forces | Train: place cubes and Bases, Civic Action (AA 3.2.1) | Rally: place Guerrillas, build Bases (AA 3.3.1) |
| Move | Patrol, Sweep, Garrison (AA 3.2.2, 3.2.3) | March (AA 3.3.2) |
| Fight | Assault removes Active enemies; Bases last (AA 3.2.4) | Attack: roll at or under Guerrilla count (AA 3.3.3) |
| Shift opinion | Civic Action, Pacify (AA 6.4; FITL 3.2.1) | Terror and Agitation (AA 3.3.4, 6.4) |

Common rules:

- Pay Resources per selected space. Costs are a few Resources per space (AA 3.1).
- Choose spaces first. Select a space once per Operation (FS 3.1).
- Underground (Hidden) and Active (Revealed) status gates Terror, Ambush, Extort and attacks on hidden pieces (AA 1.4.3; FS 1.4.3).
- Bases are removed last (AA 3.2.4).
- Ambush gives an automatic Attack. Limits: one piece removed, or one Guerrilla activated (AA 4.3.2; FITL 4.4.3).
- Special Activity names repeat by role: Extort or Tax (income), Subvert or Infiltrate (turn enemy pieces), Air Lift or Transport (move), Air Strike (remove) (AA 4.0; FITL 4.0).
- FS differs: Commands are Recruit, March, Seize, Battle for Romans, and Rally, March, Raid, Battle for Gauls. Battle has six steps (FS 3.2.4, 3.3.4).
- LOD and FS Battle use dice and Loss Levels. Most other games use a flat removal rule per Troop or Guerrilla (LOD 3.6; FS 3.2.4; AA 3.2.4).

## 4. Event cards and the deck cycle

- A card shows: number, Faction symbol order, title, flavor text, Event text, shaded text when the card is Dual Use (AA 5.0).
- Dual Use: the executor may choose unshaded or shaded text, whatever its Faction. Unshaded often favors the government. Shaded often favors insurgents (AA 5.2).
- Event text beats rules, but not availability, stacking and track caps (AA 5.1.1).
- Lasting effects: Capabilities stay for the rest of the game. Momentum stays until the next scoring round. Which side owns which varies by game (AA 5.3, 5.4; CL 5.3, 5.4).
- Deck build: set scoring cards aside. Deal Event cards into piles of equal size. Shuffle one scoring card into each pile (or into the bottom part). Stack the piles (CL Set Up; FS Setup p.28; PP Setup).
- A scoring round never runs twice in a row (AA 6.0).
- Scoring card name: Propaganda (AA, CL, ADP, CT, ABB, CW, BW), Coup (FITL), Winter Quarters (LOD), Winter (FS), Campaign (GAN), Election (PP), Dust Storm (RDR), Epoch (PDG).
- Historical content: each card has flavor text and a Playbook note with sources (AA 5.0; FS Playbook p.32).
- Special cards by game: Pivotal Events (FITL, CT, PDG), Brilliant Stroke (LOD), Viceroy (GAN), Personality and Act of Desperation (PP), Asset and Flashpoint (RDR), Campaign Events (BW Campaign booklet).

## 5. Control, Support, Opposition and tracks

- Space types: Provinces or Departments, Cities, Lines of Communication, Economic Centers (AA 1.3; CL 1.3; FITL 1.3). Other games use Regions (FS 1.3.1), Sectors (CT 1.3.1) or Districts (BW).
- Population (Pop) is a value per space. It scales Support, Opposition, Resources and scores (AA 1.3).
- Support and Opposition: 5 levels in AA, CL, FITL, LOD (Active and Passive). 3 levels in ADP and CT. 1 step per side in PP and CW (AA 1.6; ADP 1.6.1; CT 1.6; PP 1.6; CW Playbook p.24).
- Total Support = 2 x Pop at Active Support + 1 x Pop at Passive Support. Opposition works the same way (AA 1.6.3).
- Control: a Faction has more pieces in a space than all others combined (AA 1.8). In AA only Government and FARC can Control. In FITL and ADP the two COIN Factions Control together (FITL 1.7; ADP 1.7).
- Stacking: at most 2 Bases per space. No Bases on LoCs (AA 1.4.2).
- Edge track: Resources, victory markers, Aid, Patronage (AA 1.7; FITL 1.8).
- Overflow boxes, Available box, Casualties and Out of Play boxes (FITL 1.4.1).
- Markers: Terror and Sabotage (AA 3.3.4). Capability and Momentum markers (AA 5.3, 5.4).
- Extra tracks by game: Trail (FITL), US Alliance (CL), Islamabad (ADP), France Track (CT), Imperium (PDG), Restraint and Unity (GAN), Polarization (ABB), Political Will (BW).

## 6. Victory, and the Propaganda or Coup round

Victory:

- Each Faction has a threshold. Value above threshold is the margin (AA 7.2, 7.3).
- Check at the start of each scoring round (AA 6.1). One game of the series checks at other times (PP checks first in each Election Round, PP 6.1).
- If a Faction passes, the game ends. After the last scoring card, the highest margin wins (AA 2.4.1, 7.3).
- Ties go to Non-players, then a fixed Faction order (AA 7.1).
- If a Non-player passes, all human players lose (AA 7.1).

Scoring round phases (names vary, order is similar). Order in AA (6.1 to 6.6):

1. Victory check.
2. Sabotage and Resources: income from LoCs, Bases, Aid (AA 6.2, 6.3).
3. Support: Civic Action, Agitation (AA 6.4).
4. Redeploy: government pieces move to safe spaces (AA 6.5).
5. Reset: remove Terror and Sabotage, flip pieces Underground, discard Momentum, make all Factions Eligible (AA 6.6).

Game variants: FS puts Germans, Quarters, Harvest, Senate and Spring in Winter (FS 6.2 to 6.6). FITL adds a Commitment Phase (FITL 6.5). LOD adds Supply and Desertion (LOD 6.2, 6.6). PP adds Newsmakers (PP 6.5). The final round skips Redeploy and Reset in most games (AA 6.6 note; LOD 6.4.3).

## 7. Non-player systems (bots)

- All large COIN volumes include bots for solitaire or for spare seats (AA 8.0; FS 8.0).
- Generation 1 (flowcharts): each Faction has a flowchart. Numbered steps run in order. Lettered steps break ties (AA 8.1.3). Used in AA, CL, ADP, FITL base, LOD, FS, PDG, CT (FLN only).
- Generation 2 (card-based, Jacquard family): each Non-player Faction has 6 cards. Cards are blue condition boxes with green (true) and red (false) arrows. A table set drives Space, Move and Piece priorities. Used in FITL Tru'ng, CL Calixto, FoS Tay Son, SoD Minh Mang, GAN Arjuna, PP Bonifacio, RDR Curiosity, CW Sun Wukong, ABB mini-decks (FITL Trung T5; CL C8.5; GAN 8.3; PP 8.5).
- Shared bot rules:
  - Bots take a full Operation plus Special Activity in place of a Limited Operation, in most flowchart games (AA 8.1; FS 8.1.2).
  - Bots play only Events that have an effect (AA 8.1).
  - Dual Use: Insurgents choose shaded text, government Factions choose unshaded (AA 8.4.1; FS 8.2.2).
  - Ties between spaces use a Random Spaces map. Two dice or three dice pick a space (AA 8.2; FITL 8.2).
  - Bots never remove their own pieces to place them elsewhere (FS 8.4.1; PP 8.2.1).
  - Card-based bots add an Activation Number. After each space, roll 1d6. A roll at or under the number stops the bot (FITL T5.4.1; CL C8.5.4).
  - Bots track few or no Resources (CL C8.2.1; PP 8.5.4).
- Solitaire victory: the player cannot win before the final scoring round. The player must keep all bots below threshold. Result grades follow the gap in margin (AA 8.9; FS 8.9).
- Bots target the human player first, then the leader (ADP 8.2.1; PP 8.12).
- BW has no bot. Both Factions are human (BW 1.5).
