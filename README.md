# EduBrowse CS

A React learning app for computer science, exam and interview preparation, soft skills, lifestyle and self-improvement, and music. The interface uses a familiar video grid, search, a study sidebar on desktop, and bottom navigation on mobile.

## Run locally

Requires **Node.js 22.12+**.

```sh
npm ci
npm run setup:downloads
npm run dev
```

Open the Local URL printed by Vite, normally http://localhost:5173. The setup command downloads the official platform-specific yt-dlp binary into ignored `.tools/` and verifies its SHA-256 checksum.

Install **FFmpeg** and make `ffmpeg` available on PATH for downloads with separate audio and video streams. It is already available on the machine used for this rebuild. An optional `FFMPEG_PATH` can point to its executable.

For a production build with working search and download endpoints:

```sh
npm run build
npm start
```

The production server defaults to http://127.0.0.1:4173. Serving only `dist/` from an unrelated static server does **not** provide the backend features.

For **Vercel**, deploy this same repository with the committed `vercel.json` and `npm run build:vercel`. Connect a **Private Vercel Blob store** and configure `CRON_SECRET`, then redeploy. The serverless API prepares files within the request, stores media and manifests in Blob, and redirects file saves to signed storage URLs. See [the exact Vercel setup and verification steps](docs/VERCEL_SETUP.md). The deployed site is not updated by editing this local workspace.

## YouTube discovery and updates

- Search and subject pages query YouTube across creators, rather than cycling a fixed video array.
- Search pages use real continuation information, deduplicate overlapping videos and stop when a provider returns no next page.
- Without a key, the server uses yt-dlp’s YouTube search implementation. Local search ranges are bounded at 1,000 results per query to keep requests controlled.
- With a YouTube Data API key, the server uses official search cursors and hydrates actual durations, view counts and embed availability. Language preference uses this provider.
- “Newest” sorts searches by upload date. Automatic refresh runs at the selected interval while the app is open and visible, and checks when connectivity or visibility returns.
- The homepage includes live music, institutional lifestyle/self-improvement and soft-skills sections, plus recent uploads from six learning channels and the CS starter library. Each live section refreshes while the app is open, using the selected refresh interval.
- Lifestyle and self-improvement searches original **TED, YaleCourses and Royal Institution** channels. Videos must match relevant topics and last at least five minutes; Shorts, reels, compilations, impersonated channel names and unverified reuploads are excluded. The interface offers Habits, Focus, Learning, Sleep, Stress and Happiness topic filters. The channel registry and its primary references are in `shared/selfImprovement.js`. Publisher identity and duration are checked again before playback/download; this is a publisher/format filter, not a claim that every talk has been editorially reviewed.
- Each institutional channel has its own real pagination cursor. Results are interleaved across publishers; a failed source can retry without restarting exhausted ones. Without an API key, channel search pages are relevance ranked; the Newest option sorts available dates within loaded results and explains this limitation. The old motivation category link resolves to the replacement.
- A shared content policy filters both search providers and every channel feed. Only CS (including its mathematical foundations), exam preparation, approved self-improvement, soft skills and music qualify. Explicitly unrelated queries are rejected before contacting YouTube. Ambiguous queries still search, but do not approve their results.
- Direct links and downloads require server-side metadata approval. Cached bookmarks cannot bypass this check, and playback waits for approval. Music with an ambiguous title can be identified using YouTube's music category. Unverifiable videos do not play. Old saved/history items outside the categories are hidden without deleting the underlying backup data.
- Filtering uses title and category evidence, not the actual audio/video contents. It is conservative and can exclude legitimate videos or misclassify misleading metadata; it is not a parental-control system. YouTube controls its embedded player and external website.
- Identical requests share in-flight work; successful results are cached briefly. Network, quota and setup failures are shown as failures, never relabelled as fresh videos.

YouTube determines search coverage, regional availability and result limits. This app cannot enumerate or guarantee every video on the platform. The starter library is labelled separately from live results. Updates require a running server and connection; they are not push notifications or a background service when the app is closed.

Optional configuration:

```sh
# Copy .env.example to .env and configure values on your machine.
YOUTUBE_API_KEY=your_server_side_key
YT_DLP_PATH=
FFMPEG_PATH=
```

Do not prefix a server key with `VITE_`. A key entered in Settings is kept in session storage, sent in a request header to this app’s backend, then used only for Google’s YouTube API. It is excluded from study backups.

## Mobile playback

- Fullscreen from the app or YouTube player requests landscape orientation on touch devices. Exiting restores portrait where the browser permits it and releases the orientation lock. The app fullscreen view has a dedicated exit control and respects device safe areas.
- While video plays (including buffering after playback starts), a screen wake lock prevents automatic screen sleep. Pausing, ending, errors, leaving the player or hiding the page releases it. Returning to a visible page reacquires it if playback is still active.
- These features use browser APIs on HTTPS (including Vercel) or localhost. Browser/OS support, rotation settings and battery restrictions can prevent orientation or wake locking; playback continues normally when a request is denied. Native iPhone fullscreen inside YouTube is controlled by Safari and cannot be forced by the parent app.

## GATE CS preparation

**146 individual lessons across all 10 supplied sections**, each with:

- Three concept explanations and a key relationship.
- A step-by-step worked example and a common misconception.
- Topic-specific lecture candidates between **2 and 30 minutes**.
- Live search for additional focused lectures.
- An original multiple-choice practice question, correct solution and explanation.
- A revision note, Markdown export, and saved completion state.

All 146 lessons have short lecture candidates checked against YouTube metadata. Title matching is not an editorial review of complete lecture contents; availability can change. The written guides are concept notes and worked examples, not a replacement for a full textbook or a collection of official past papers.

A correct practice response enables completion. Missed questions appear in the revision prompt. No lessons are pre-completed. General Aptitude is not in the supplied PDF and is not presented as covered.

See [the complete topic mapping](docs/syllabus-coverage.md), [the extracted PDF text](docs/syllabus-source.txt), and [the video coverage report](docs/topic-video-report.json).

Refresh the initial topic-video candidates and regenerate the coverage report:

```sh
npm run videos:verify
npm run coverage:syllabus
```

The verifier fills missing entries or entries whose queries changed. Live searches continue to provide new candidates without rebuilding the app.

## Downloads

The Download action creates a real server-side job. It chooses the best available quality up to 360p, 720p or 1080p, downloads audio and video, and uses FFmpeg to merge separate streams into a file.

The queue supports progress, cancellation, two concurrent transfers and a bounded pending queue. Completed files have a separate **Save file** action that returns actual media bytes. Job metadata survives server restarts; interrupted transfers report that they need retrying.

That persistent queue is for local hosting. On Vercel, preparation is awaited before reporting completion, media and job manifests are stored in private Blob storage, and Save file redirects to a short-lived signed URL. The cloud path is bounded to 150 MiB merged media and 270 seconds of preparation, with lower per-source-stream bounds for safe merging. It does not depend on instance memory or persistent local disk. See [Vercel setup](docs/VERCEL_SETUP.md) for prerequisites, expiration and upstream limitations.

Files live in ignored `.downloads/`, with a 24-hour cleanup policy. Transfers have a 30-minute timeout, a source-duration limit and a per-stream file-size limit. Private, restricted or rate-limited videos can fail; errors remain visible. Download only videos you own or have permission to save. YouTube’s own offline viewing is available through its supported services.

## Playback, study data and offline use

The official YouTube iframe API drives playback. History records a video when it actually plays, and resume positions come from the player. Notes use the actual playback time and can seek to that point.

Embedding uses YouTube’s privacy-enhanced domain. It does **not** promise to remove ads or all tracking. The fake ad-block counters and unsupported ad-free claims from the original project have been removed.

Saved videos, watch history, personal notes, quiz answers and progress are browser-local. Settings provides JSON backup and restore. Existing legacy bookmarks, history and timestamped notes migrate without deleting the originals. The old pre-populated completion checklist is not treated as evidence that the new lessons were completed.

The production build includes an installable web-app manifest and a service worker that caches the written study app, topic-video metadata and syllabus. After initial loading, written lessons can be reopened offline. YouTube playback, live updates and downloads still need a connection and the app server. API responses, credentials and downloaded media are never stored in the service-worker cache.

## Checks

```sh
npm test
npm run test:e2e
npm run lint
npm run build
```

Unit/service tests cover curriculum completeness, short video coverage, real API cursor forwarding, quota errors, RSS parsing, URL validation, malformed state, legacy migration and blocked browser storage. Browser tests cover desktop and mobile navigation, pagination, quiz progression, saved videos, notes, settings and download states with deterministic provider fixtures.

Browser tests use installed Chrome on Windows; on other platforms install Playwright Chromium first with `npx playwright install chromium`.

Live verification scripts are separate from deterministic tests:

```sh
node scripts/check-live.mjs --record
node scripts/check-channels.mjs
node scripts/check-download.mjs
node scripts/check-content.mjs --record
node scripts/check-self-improvement.mjs --record
```

See [the audit and verification notes](docs/PROJECT_AUDIT.md). Format source using `npm run format`.

## Main files

- `src/App.jsx`: application shell, routes, library and settings.
- `src/components/GateTrack.jsx`: section overview, lessons and explained practice.
- `src/data/gate/`: authored concept notes, examples and questions.
- `public/gate-topic-videos.json`: real initial short lecture candidates.
- `server/youtube.mjs`: discovery providers, feed parsing, caching and metadata.
- `server/downloads.mjs`: bounded download jobs and durable file metadata.
- `server/api.mjs`: validated same-origin API.
- `server/index.mjs`: production static and API server.
