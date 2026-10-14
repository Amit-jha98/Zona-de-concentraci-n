# EduBrowse CS (FocusTube CS) 🚀
> **Distraction-Free Computer Science & GATE Educational Web Browser with Built-in AdShield**

EduBrowse CS is an industrial-standard, minimalist web browser designed specifically for Computer Science students and GATE aspirants. It eliminates the algorithmic rabbit holes of traditional YouTube by enforcing strict educational relevance, stripping away ads and clickbait, and delivering a focused study workspace.

---

## ✨ Key Features

### 1. 🛡️ Built-in AdShield & Privacy Sandbox
- Employs privacy-enhanced `youtube-nocookie.com` sandboxing with strictly enforced player parameters (`rel=0`, `iv_load_policy=3`, `modestbranding=1`, `enablejsapi=1`).
- Completely blocks pre-roll/mid-roll video ads, external tracking pixels, and distracting promotional cards.
- Real-time AdShield telemetry badge displaying intercepted ads, filtered distractions, and pure CS study time.

### 2. 🎯 Forced Educational CS Recommendations ("Zero-Slop Engine")
- Replaces YouTube's algorithmic feed with a **Strict Knowledge Graph Algorithm**:
  - Calculates relevance scores based on Subject taxonomy (DSA, OS, DBMS, Networks, TOC, Compilers, COA, Discrete Math, Digital Logic), subtopic alignment, and GATE syllabus weightage.
  - Automatically tags related videos with educational context: *"Next in Topic Sequence"*, *"High-Yield GATE PYQ"*, *"Core Subject Module"*.
  - Completely bans clickbait, entertainment, gaming, drama, and shorts.

### 3. 🌐 Desktop Browser Workspace
- **Multi-Tab Navigation**: Keep multiple lectures, the catalog, and the GATE checklist open side-by-side.
- **Smart Omnibox**: Unified address/search bar with `edu://cs` protocol badge. Accepts search keywords, raw 11-char video IDs, or direct YouTube links.
- **Boundary Guard**: Warns and auto-normalizes non-educational queries into their Computer Science conceptual counterparts.
- **Theater / Focus Mode**: Instant distraction-free full-screen layout.

### 4. 📝 Integrated Study Tools
- **Timestamped Lecture Notes Drawer**: Take timecoded notes (`[05:20] - Proof of relaxation condition`) that persist in `localStorage` and can be exported as `.md` Markdown files.
- **Official GATE CS Syllabus Matrix**: Interactive 9-subject syllabus checklist with real-time percentage completion progress and one-click lecture launchers.
- **Study Library**: Local history and bookmarking drawer.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Vanilla CSS Design System (Inter typography, JetBrains Mono accents, Obsidian dark theme, 1px subtle borders)
- **Icons**: `lucide-react`
- **Data & Metadata**: Pre-indexed catalog of 30+ top-tier GATE & CS lectures across all 9 core subjects + public oEmbed resolution for any custom pasted YouTube link.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# Accessible at http://localhost:5173/

# 3. Production build
npm run build
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Focus Smart Omnibox (Search / Paste URL) |
| `Enter` | Submit Omnibox query or navigate to lecture |
| `Space` | Toggle playback in focused video |
