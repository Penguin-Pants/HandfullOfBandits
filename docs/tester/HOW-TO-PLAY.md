# How to play and test the full campaign

The full campaign is the only scenario: five Campaigns (C1 to C5), each with 12 Event cards and one Propaganda card. One game takes more than one sitting. The session saves after each action, so you can stop and use **Resume** on the Home screen. The short S0 test game is archived. You play both factions, State and PKK. You need no other file than this one and [INSTALL.md](INSTALL.md).

Your job: play the full campaign to the end and write a note each time something is unclear, wrong or slow.

## 1. Start a game

1. Start the app (see [INSTALL.md](INSTALL.md)) and open `http://127.0.0.1:5174`.
2. In **Scenario**, **Full campaign (1984-1999)** is the only choice.
3. Keep **Seed** at `1`. Type your name in **Name**.
4. Click **Start**.
5. Click **Reveal first card (Space)**.

## 2. Play one card

Each card has two turns: the First Eligible faction acts, then the Second Eligible faction.

1. Read the top bar: the card, who is 1st and who is 2nd, and the score of each faction.
2. The panel on the right shows the acting faction. Click one box: **Event**, **Limited Op**, **Op Only**, **Op + SA** or **Pass**. Point at a box to see what it leaves open for the other faction.
3. For **Pass**, click **Commit (Enter)**.
4. For an Operation, pick the Operation in the panel. Then click spaces on the map. To move pieces, drag from the start space to the destination. Each drag moves 1 piece.
5. Read the preview in the panel. Click **Commit (Enter)**. Spaces that changed get an amber outline.
6. For the **Event**, use **Execute unshaded (U)** or **Execute shaded (S)** under the card text.
7. Answer each question the panel asks. Then the other faction acts the same way.
8. After both factions have acted, the next card appears by itself.

A mistake: click **Undo (Ctrl+Z)** and confirm. Undo never deletes anything. The History keeps it, struck through.

## 3. The Propaganda card

Each Campaign has one Propaganda card. Rounds 1 to 4 end with Redeploy and Reset, then the next Campaign starts. The fifth Propaganda round ends the game after Agitation. The right panel lists the Propaganda steps: Victory, Resources, Upkeep, Legitimacy and Emergency Rule, Legal Politics, Civic Action, Agitation, Redeploy and Reset.

1. When the panel says "Nothing to choose. Press Advance.", press **Advance (Space)**.
2. When the panel asks for a choice, use the buttons and the − and + counters in the panel. Then press the button the panel shows.
3. The first Propaganda round has no victory check. This is correct.

## 4. Find the rule behind a line

Under **Last action** (right column) and in **History (H)**, each line that cites a rule has a **Rule** button.

1. Click **Rule** next to the line.
2. The text of the research rule opens under the line. Click **Rule** again to close it.
3. A line with no **Rule** button cites no rule.

Open **Help (?)** at any time. It lists how to win, what each action does and the keys.

## 5. Write notes

1. Press **N** or click **Note (N)**.
2. Type what you saw. Press **Enter** to save. Press **Esc** to cancel.
3. The app links the note to the action, the card and the board state. You do not need to describe them.

Write a note when:

- a rule or a line of text is wrong, or you do not understand it
- a choice looks unfair or has no good answer
- a screen is slow, hidden or hard to use
- the **Rule** text does not match what the game did

## 6. End the game

1. After the last Propaganda step, the right panel says **Game complete**. The top bar shows who won.
2. Click **End session**.
3. Type an overall comment (what was hard, what was good). Click **Save debrief and end**. To skip the comment, click **Skip and end**.

## 7. Send your result

1. Click **Home** (top left).
2. In the saved sessions table, find your game. Click **Export**. The browser saves a JSON file.
3. Send that file to the designer.

## Done check

You are done when all four are true:

1. You finished the full campaign and saw **Game complete**.
2. You wrote at least one note, or you wrote the debrief.
3. You opened **Rule** on at least one line.
4. You exported the file.

If you could not finish a step, write which step and what you saw. That is a result too.
