# Install the playtest app (Windows and Mac)

Time to install: one download and 4 commands. You need no other files.

## What you need

1. A Windows 10 or later PC, or a Mac.
2. Node.js 24 or later. Get it from https://nodejs.org (choose the **LTS** download).
3. The project folder `HandfullOfBandits`. The designer sends it as a ZIP file. Unzip it to a folder you can find, for example your Documents folder.

## Install

1. Open a terminal in the `sim` folder inside `HandfullOfBandits`.
   - **Windows:** open the `sim` folder in File Explorer. Click the address bar, type `powershell` and press Enter.
   - **Mac:** open Terminal. Type `cd ` (with a space), drag the `sim` folder into the window and press Enter.
2. Check the Node.js version. The answer must start with `v24` or a higher number.

   ```
   node -v
   ```

3. Install the parts the app needs.

   ```
   npm ci
   ```

4. Build the screens.

   ```
   npm run build
   ```

## Start the app

1. In the same terminal, run:

   ```
   npm start
   ```

2. The terminal prints `handful-of-bandits-sim: http://127.0.0.1:5174`. Open that address in Chrome, Edge, Firefox or Safari.
3. Leave the terminal open while you play. To stop the app, click the terminal and press Ctrl+C.

Your games and notes are in the file `sim/playtest.sqlite`. Stop the app before you copy or delete that file.

## Start again later

1. Open a terminal in the `sim` folder (step 1 of Install).
2. Run `npm start`.

You do not need `npm ci` or `npm run build` again, unless the designer sends a new version.

## If something fails

| Symptom | Fix |
|---|---|
| `node` or `npm` is not found | Close the terminal and open a new one after the Node.js install. If it still fails, install Node.js again. |
| `node -v` shows a number below 24 | Install Node.js 24 or later. |
| `npm ci` stops with a compile error (`gyp`) | A part of the app (`better-sqlite3`) needs a build tool on your computer. **Mac:** run `xcode-select --install`, then `npm ci` again. **Windows:** install "Desktop development with C++" from the Visual Studio Build Tools, then `npm ci` again. |
| The page says `UI not built` | Run `npm run build`, then `npm start`. |
| `address already in use` | Another program uses port 5174. Windows PowerShell: `$env:PORT=5175; npm start`. Mac: `PORT=5175 npm start`. Open the address the terminal prints. |

Next: [HOW-TO-PLAY.md](HOW-TO-PLAY.md).
