# ⚡ TypePulse — Next-Gen Customizable Typing Experience

**TypePulse** is a feature-rich, high-performance, and deeply customizable typing speed game built with vanilla HTML5, CSS3, and modern JavaScript. Zero external dependencies, 100% offline-ready, with procedural Web Audio keyboard switch synthesis, canvas particle effects, and granular post-test analytics.

---

## 🚀 Features Overview

### 🎨 1. Unrivaled Customization
- **10 Handcrafted Themes**:
  - `Cyberpunk Neon`: High-contrast electric cyan and magenta on void black.
  - `Dracula Midnight`: Classic gothic dark purple with pastel accents.
  - `Forest Matcha`: Organic moss green and warm earthy tones.
  - `Vintage Typewriter`: Nostalgic parchment paper and deep charcoal ink.
  - `Monokai Code`: Iconic IDE palette with vivid green, orange, and pink.
  - `Nord Arctic`: Cool frosty slate and arctic aurora blues.
  - `Sunset Synthwave`: 80s retrowave deep violet and sunset neon gradient.
  - `Warm Coffee Mocha`: Cozy espresso tones and roasted caramel.
  - `Cotton Candy Pastel`: Soft dreamy lavender, mint, and bubblegum pink.
  - `Matrix Terminal`: Retro hacker phosphor green on true black.
- **6 Typography Options**: JetBrains Mono, Fira Code, Inter, Courier Prime, Press Start 2P (8-Bit Arcade), Consolas.
- **Dynamic Font Size**: Real-time slider from 18px to 36px.
- **5 Caret Styles**: Line, Block, Underline, Pulse, or Hidden — with toggleable smooth fluid gliding interpolation.
- **Visual FX & Sparks**: Dynamic canvas particle bursts on correct keystrokes (Sparks, Confetti, Neon Orbs, or Off) + subtle screen shake on mistakes.

---

### 🔊 2. Procedural Mechanical Sound Engine (Web Audio API)
No audio files required! Synthesized in real-time with sub-millisecond latency:
- **Tactile Thock (Holy Panda)**: Deep acoustic resonance with bottom-out pop.
- **Clicky (Cherry MX Blue)**: Crisp high-frequency transient click and mechanical clack.
- **Linear (Cherry MX Red)**: Soft, muffled low-pass keystrokes.
- **Vintage Typewriter**: Heavy mechanical punch + carriage bell chime on spaces.
- **Bubble Pop**: Playful harmonic water droplet sound.
- **8-Bit Arcade**: Nostalgic retro square-wave chimes.
- **Organic Pitch Variation**: Micro-pitch variance per keypress for authentic acoustic feel.
- **Audio Milestone Chimes**: Ascending major triad chimes every 25 combo streak + victory fanfare on test completion.

---

### 🎮 3. Game Modes & Difficulty Curves
- **Test Modes**:
  - `Time Mode`: 15s, 30s, 60s, or 120s sprint.
  - `Words Mode`: 10, 25, 50, or 100 words endurance.
  - `Quote Mode`: Curated famous quotes from icons like Einstein, Steve Jobs, Turing, and Lovelace.
  - `Zen Mode`: Infinite stress-free typing without time or mistake limits.
  - `Sudden Death / Survival Mode`: One typo and game over! How far can you survive?
- **Vocabulary Difficulties**:
  - `Easy`: 200+ clean high-frequency common words (3-5 letters).
  - `Medium`: 350+ everyday expressive vocabulary (5-8 letters).
  - `Hard`: 350+ complex words with finger-twisting patterns (8-14 letters).
  - `Nightmare`: 200+ rare tongue-twisters, archaic and multisyllabic monsters (*sesquipedalian*, *antidisestablishmentarianism*, *floccinaucinihilipilification*).
  - `Code Mode`: Real programming syntax, keywords, operators, and brackets across JS, Python, HTML/CSS.
- **Gameplay Modifiers**:
  - Punctuation toggle (`, . ! ? : ; ' "`)
  - Numbers toggle (`0-9`)
  - Strict Mode (disables backspacing completely)
  - Blind Mode (masks character errors until completion)
  - Custom Text Mode (paste your own article, essay, or code snippet to practice)

---

### 📊 4. Deep Post-Test Analytics
- **Hero Metrics**:
  - Net WPM & Raw WPM (Gross speed vs. error-adjusted speed)
  - Accuracy % & Consistency % (Standard deviation of rhythm)
  - Full Keystrokes Breakdown: `Correct / Incorrect / Extra / Missed`
  - Total Duration & Max Combo Streak
- **Dynamic Rank Badges**:
  - `Turtle Explorer 🐢` (< 30 WPM)
  - `Cadence Walker 🚶` (30 - 49 WPM)
  - `Swift Typist ⚡` (50 - 69 WPM)
  - `Speed Adept 🚀` (70 - 89 WPM)
  - `Keyboard Warrior ⚔️` (90 - 109 WPM)
  - `Speed Demon 🔥` (110 - 129 WPM)
  - `Transcendent 🌪️` (130 - 149 WPM)
  - `Godspeed Deity 👑` (150+ WPM)
- **Interactive Canvas Performance Graph**:
  - Second-by-second Net WPM curve with gradient fill.
  - Dashed Raw WPM curve.
  - Timeline error marks with interactive hover tooltips!
- **Targeted Weakness Drill**:
  - Identifies mistyped words and provides a **"Practice These Words"** drill button that auto-generates a custom exercise targeting those exact problem words.
  - Identifies mistyped characters with error counts.
- **Social Sharing**:
  - 📋 **Copy Summary**: Generates a clean Markdown score card formatted for Discord, Reddit, or Twitter.
  - 🖼️ **Export Card Image**: Instant canvas rendering to download a polished PNG scorecard image.

---

### 🏆 5. Gamification, XP & Achievements
- **Leveling System**: Gain XP after every test based on WPM, accuracy, and difficulty multiplier. Progress from Level 1 (*Novice Typist*) to Level 40+ (*Quantum Scribe*).
- **15 Unlockable Trophies**:
  - First Flight, Fast Lane (50 WPM), Speed Demon (80 WPM), Century Club (100 WPM), Supersonic (120 WPM), Godspeed (150 WPM), Flawless Precision (100% Acc), In the Zone (50 Streak), Unstoppable (100 Streak), Lexicon Scholar (Hard), Daredevil (Nightmare), Hackerman (Code), Survivor (Sudden Death), Ranked Up (Level 5), Keyboard Veteran (Level 10).
- **Persistent Career History**: Lifetime tests, words typed, personal bests, and test history saved safely in browser `localStorage`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Tab` | Quick restart test with fresh words |
| `Esc` | Close any open modal or focus typing area |
| `Ctrl + Backspace` | Delete entire current word |
| Any regular key | Auto-focus typing field and start typing |

---

## 💻 How to Run

Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Brave, Firefox, Safari).
No installation, no node server, and no build step required!
