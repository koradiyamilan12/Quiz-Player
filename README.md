# QuizVerse 🧠✨

A clean, responsive, and beautifully animated React.js Quiz Player application built using **Vite**, **Tailwind CSS (v4)**, **Framer Motion**, and **Firebase Firestore** (with a fully functional simulated database fallback).

---

## 🚀 Live Demo & Repository
- **GitHub Repository**: (Provide your URL here)
- **Live Deployment**: (Provide your Vercel/Netlify URL here)

---

## ✨ Features
1. **Quiz Dashboard (Listing)**:
   - Browse quizzes with sleek category cards.
   - Dynamic gradients and custom category iconography.
   - Search by quiz title or description.
   - Filter by specific categories and difficulty levels (Easy, Medium, Hard).
   - Stats summary counter showing overall questions and quiz quantities.
2. **Quiz Lobby (Setup Screen)**:
   - Before starting, toggle settings: Shuffle Questions, Shuffle Options, Sound Synthesizer, and Keyboard Shortcuts.
3. **Interactive Quiz Player**:
   - Circular SVG Countdown Timer that shifts color from Indigo to Amber to Rose as time ticks away.
   - Automatic question advancement if the timer reaches zero.
   - Smooth horizontal slide transitions using Framer Motion when shifting between questions.
   - Visual progress bar.
   - Disabled "Next" action until a selection is confirmed.
   - No backward navigation allowed.
4. **Retro Sound Synthesizer (Bonus)**:
   - Retro sound effects (Tick beep when time runs low, rise chime for correct answers, low buzz for incorrect/timeouts, and a major-chord arpeggio upon quiz completion).
   - Synthesized using the browser’s native **Web Audio API** (no heavy external audio files needed!).
5. **Keyboard Navigation (Bonus)**:
   - Answer options mapped to keys `[1-4]` or `[A-D]`.
   - Submit answers and advance by pressing `[Enter]`.
6. **Result Screen & Confetti**:
   - Interactive score breakdown (Accuracy percentage, points scored, correct vs. incorrect count).
   - Tailored performance summaries.
   - Celebratory confetti showers powered by `canvas-confetti` for high-scoring achievements (>= 80%).
7. **Firestore Leaderboard**:
   - Nickname registration form to record high scores.
   - Instantly fetch and display the **Top 10 High Scores** for the current quiz, sorted by score (descending) and completion date (newest first).
   - **Simulated DB Fallback**: If Firebase credentials are not supplied, the app automatically switches to an offline database backed by LocalStorage, allowing full functionality out-of-the-box.
8. **Dark Mode Theme (Bonus)**:
   - Beautiful dark mode integration with a sticky glassmorphic navigation header.

---

## 🛠️ Tech Stack
- **Framework**: React 18+ (Vite)
- **Styling**: Tailwind CSS v4 (incorporating `@import "tailwindcss"` and native CSS `@theme` variables)
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Database**: Firebase Firestore (w/ local offline fallback)
- **Assets & Icons**: Lucide React

---

## 💻 Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd interview-prep
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Create a `.env` file in the root directory to enable live Firebase integration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   *Note: If these env variables are not set, the app will gracefully run using the Simulated Database fallback.*

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🤖 AI Usage Disclosure

### AI Tools Used
- **Gemini 3.5 Flash** (via Antigravity IDE)

### Where AI Helped
- **Web Audio API Synth**: Gemini generated the browser AudioContext oscillator synthesizer helper to produce sound effects without requiring external static audio files.
- **Tailwind CSS v4 Configuration**: Assisted in refactoring standard Tailwind config JSON syntax into standard Tailwind CSS v4 CSS variables (`@theme` directive and custom `@variant dark` rules).
- **Simulated DB Architecture**: Helped build the seamless failover code in `src/firebase.js` to ensure the leaderboard is fully functional on local storage if the database config is absent.
- **SVG Timer Calculations**: Guided the SVG path length calculation and `strokeDashoffset` math to create the fluid countdown clock.

### What Was Handcrafted
- The game loop and timer integration, ensuring that countdown intervals clear correctly on unmount or question changes to prevent memory leaks.
- CSS glassmorphic styles and custom dynamic gradient rules for various quiz categories.
- Dashboard filtering algorithms that perform joint search, category filtering, and difficulty filtering.
- In-memory descending order sorting for quiz scores to render ranking ranks (Gold, Silver, Bronze badges) cleanly.
