# EduBrowse CS

> Distraction-Free Computer Science Education Platform and Web Browser

EduBrowse CS is a specialized web platform engineered for Computer Science undergraduate education, software engineering preparation, and GATE examination candidates. The platform eliminates engagement-driven recommendation algorithms and advertising telemetry by enforcing strict educational scoping, sandboxed playback, and curriculum-aligned progression.

---

## Architecture Overview

```
+-------------------------------------------------------------------------------+
|                            Omnibox & Navigation Bar                           |
+-------------------------------------------------------------------------------+
|   Core CS Curriculum   |   Popular CS Masterclasses   |   Live YouTube Sync   |
+-------------------------------------------------------------------------------+
|  Taxonomy Filter (DSA, OS, DBMS, Networks, COA, TOC, System Design, etc.)    |
+-------------------------------------------------------------------------------+
|                                                                               |
|   +------------------------------------+   +-------------------------------+  |
|   |        AdShield Sandboxed          |   |       Strict Educational      |  |
|   |         Player Container           |   |       Curriculum Sidebar      |  |
|   |      (No Cookies / No Ads)         |   |    (Graph-Based Progression)  |  |
|   +------------------------------------+   +-------------------------------+  |
|   | Full-Width Title & Action Controls |                                      |
|   | Key Takeaways & Exam Points Card   |                                      |
|   +------------------------------------+                                      |
|                                                                               |
+-------------------------------------------------------------------------------+
|   Mobile Bottom Bar: Catalog | Player | Syllabus Matrix | Notes | Bookmarks   |
+-------------------------------------------------------------------------------+
```

---

## Core Systems and Technical Capabilities

### 1. AdShield Privacy Sandbox
- Embedded playback utilizes `youtube-nocookie.com` with restrictive operational parameters (`rel=0`, `iv_load_policy=3`, `modestbranding=1`, `playsinline=1`).
- Eliminates pre-roll, mid-roll, and post-roll video advertisements.
- Blocks tracking cookies, third-party promotional cards, and algorithmic sidebar suggestions.
- Embedded telemetry system tracks filtered distractions, blocked advertisements, and total focused study minutes.

### 2. Knowledge-Graph Educational Recommendation Engine
- Replaces engagement-optimized algorithmic feeds with a deterministic computer science taxonomy scoring system.
- Calculates relevance metrics based on:
  - Subject classification (Algorithms, Operating Systems, Database Systems, Computer Networks, Computer Organization, Compiler Design, Theory of Computation, Discrete Mathematics, System Design, Interview Preparation, Technical Communication).
  - Subtopic alignment and prerequisite sequencing.
  - Examination weightage (High-Yield GATE pyqs and foundational modules).
- Queries falling outside computer science and engineering disciplines are automatically flagged and redirected to relevant foundational concepts.

### 3. Real-Time Educational Channel Synchronization
- Continuous live synchronization with accredited computer science channels (including MIT OpenCourseWare, Gate Smashers, freeCodeCamp, Striver takeUforward, NeetCode, Computerphile, and Abdul Bari).
- Dual ingestion pipeline supporting InnerTube extraction (`videoRenderer` and `lockupViewModel` formats) and RSS syndication proxies.
- Background polling mechanism detects and categorizes newly uploaded academic content without disrupting active viewing sessions.

### 4. Interactive Study Tools
- **Timestamped Note Taking**: Capture time-indexed study notes synchronized with playback, saved locally and exportable as standard Markdown (`.md`).
- **Interactive GATE Syllabus Matrix**: Comprehensive checklist covering the entire Graduate Aptitude Test in Engineering CS syllabus with real-time progress calculations and direct lecture links.
- **Persistent Bookmarks and History**: Session history and revision bookmarks stored locally without remote tracking requirements.

### 5. Multi-Platform Responsive Design
- **Desktop Interface**: Dual-pane workspace layout featuring collapsible sidebars, multi-tab browsing, keyboard hotkeys (`Ctrl+K` for instant search), and theater focus mode.
- **Mobile Application Layout**: Specialized viewport adaptation incorporating an app-style bottom navigation bar, single-column responsive media layout, touch targets exceeding 40px, and dedicated action strips.
- **Color Architecture**: Pure OLED black (`#000000`) foundation with zinc-neutral surfaces (`#09090b`, `#111113`, `#18181b`) and high-contrast typography, avoiding color fatigue.

---

## Technology Stack

- **Application Framework**: React 19
- **Build Tooling**: Vite 8
- **Typography**: Inter, JetBrains Mono
- **Iconography**: Lucide React
- **Styling Architecture**: Native CSS Custom Properties (CSS variables design system, no CSS-in-JS overhead)
- **Data Protocols**: Public oEmbed API, YouTube XML RSS Syndication, InnerTube Search JSON Parser

---

## Directory Structure

```
yt/
|-- src/
|   |-- components/
|   |   |-- AdShieldBadge.jsx           # Privacy status indicator
|   |   |-- BookmarksDrawer.jsx         # Saved lectures manager
|   |   |-- BrowserChrome.jsx           # Top omnibox and navigation header
|   |   |-- GateSyllabusTracker.jsx     # Interactive syllabus checklist
|   |   |-- MobileBottomNav.jsx         # Mobile-first app navigation bar
|   |   |-- RelatedEducationalVideos.jsx# Knowledge-graph recommendations
|   |   |-- SettingsModal.jsx           # Telemetry and API key settings
|   |   |-- StudyNotes.jsx              # Timestamped lecture notes drawer
|   |   |-- TabNav.jsx                  # Desktop browser tab strip
|   |   |-- VideoGrid.jsx               # Filterable lecture catalog
|   |   |-- VideoPlayer.jsx             # Sandboxed ad-free media player
|   |   `-- VideoThumbnail.jsx          # Optimized thumbnail component
|   |-- data/
|   |   `-- csCatalog.js                # Core curated syllabus curriculum
|   |-- services/
|   |   |-- adBlockerService.js         # Sandboxing and telemetry logic
|   |   |-- recommendationEngine.js     # Taxonomy ranking algorithm
|   |   `-- youtubeService.js           # Multi-source YouTube ingestion
|   |-- App.css                         # Formal dark theme and mobile styles
|   |-- App.jsx                         # Main application controller
|   |-- index.css                       # Global tokens and OLED black palette
|   `-- main.jsx                        # React root entrypoint
|-- index.html                          # HTML5 shell with mobile viewport meta
|-- package.json                        # Dependencies and script definitions
`-- vite.config.js                      # Vite server and local proxy configuration
```

---

## Local Development and Installation

### Prerequisites
- Node.js (version 18.0.0 or higher recommended)
- npm (version 9.0.0 or higher)

### Installation Steps

1. Clone or navigate to the project directory:
   ```bash
   cd d:/yt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   The local application will be available at `http://localhost:5173/`.

4. Generate production distribution:
   ```bash
   npm run build
   ```

---

## Keyboard Shortcuts

| Shortcut | Context | Function |
| :--- | :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Global | Focus and select the Omnibox search field |
| `Enter` | Omnibox | Execute educational search or navigate to video ID / URL |
| `Alt + Left` | Global | Return to previous browsing view |
| `Ctrl + R` / `Cmd + R` | Global | Synchronize current lecture feed |

---

## Configuration and Custom API Keys

EduBrowse CS operates completely out-of-the-box without requiring an API key. For environments with high request volume or corporate firewall proxy restrictions, an optional YouTube Data API v3 key can be configured:

1. Open the **Settings** modal via the gear icon in the navigation header.
2. Enter your Google Cloud YouTube Data API v3 key in the designated input field.
3. Select **Save Settings**. The key is stored locally in browser `localStorage` and never transmitted to external servers.

---

## License

Distributed under the MIT License. Academic and non-commercial educational use encouraged.
