# Memory Game

A two-player browser-based memory card matching game. Players take turns flipping cards to find matching image pairs.

## How to Run

Use a local server to start playing
- **Local server (recommended if using file paths):**
  ```bash
  python3 -m http.server 8080
  ```
  Then open `http://localhost:8080`

## How to Play

### Setup
1. Choose the **number of pairs** from the dropdown (4, 6, 8, 10, 12, or 15).
2. Load images — either:
   - Click **Pick Images** and select files from your computer (one image per pair), or
   - Paste a comma-separated list of image URLs into the text box.
3. Click **Load & Start Game**.

### Gameplay
- Players alternate turns. The active player is highlighted on the scoreboard.
- Click any face-down card to flip it, then click a second card.
  - **Match:** Both cards stay face-up, the current player scores a point and keeps their turn.
  - **No match:** Both cards flip back over and the turn passes to the other player.
- The game ends when all pairs are found. The player with the most pairs wins.

### Controls
| Button | Action |
|---|---|
| **Edit Team Names** | Rename the two players/teams |
| **Restart Game** | Shuffle and restart with the same images |

## Grid Sizes

| Pairs | Grid |
|---|---|
| 4 | 2 × 4 |
| 6 | 3 × 4 |
| 8 | 4 × 4 |
| 10 | 5 × 4 |
| 12 | 6 × 4 |
| 15 | 6 × 5 |

## File Structure

```
memory/
├── index.html   # Page structure
├── style.css    # Styles
├── script.js    # Game logic
└── images/      # Optional: store local images here
```
