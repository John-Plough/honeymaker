# The Honeymaker (Frontend)

A cute, snake-inspired browser game where you collect honey, avoid honeypots, and compete for high scores!

---

## Features

- Playable snake-style game with a honey/bee theme
- Animated UI and sound effects
- Responsive controls
- Login and signup modals
- OAuth login buttons (Google, GitHub)
- Score display and leaderboards (fetched from backend API)

---

## Getting Started

### Prerequisites

- You need the backend API running (see the `snake-api` project)
- Node.js and npm (optional, for static server)

### Running the Game

1. **Clone this repo and enter the `snake` folder:**
   ```bash
   cd snake
   ```
2. **Start a local server:**

   - Easiest: Use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VSCode
   - Or run:
     ```bash
     npx serve .
     ```
   - Or just open `index.html` in your browser (some features may require a server)

3. **Configure API endpoint:**
   - Edit `config.js` if your backend API is not on `localhost:3000`

---

## Controls

- **Start:** Press any arrow key
- **Pause:** Press the spacebar
- **Move:** Arrow keys
- **Collect honey:** Visit flowers, avoid honeypots and walls!

---

## Authentication

- Sign up or log in with email/password, Google, or GitHub
- All authentication and score data is handled by the backend API

---

## Development Notes

- Pure HTML, CSS, and JavaScript (no frameworks)
- All game logic is in `game.js`
- UI and modals in `index.html` and styled in `styles.css`
- OAuth buttons trigger backend API routes for Google/GitHub login

---

## License

MIT License.  
(c) 2025 House of Plough
