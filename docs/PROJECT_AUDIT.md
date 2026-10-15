# Project audit and verification

## Issues addressed

| Original issue                                                                          | Result                                                                                                                         |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Pagination rotated query strings and eventually recycled the same curated videos.       | Real provider cursors/ranges, cross-page deduplication and an explicit end state.                                              |
| Search and RSS relied on development-only proxies and third-party CORS relays.          | A first-party Node API runs in development, preview and production.                                                            |
| Two educational channel IDs were invalid.                                               | IDs resolved from the actual takeUforward and NeetCode channel pages and corrected.                                            |
| Static metadata and generated fallbacks claimed more certainty than available evidence. | Real metadata, labelled starter references and explicit upstream errors. One unavailable starter was removed after checking.   |
| The GATE checklist omitted parts of the supplied PDF and shipped with completed topics. | All 10 supplied sections mapped to 146 concept lessons; completion starts at zero.                                             |
| Topic links selected one arbitrary lecture for a whole subject.                         | Every lesson has short topic-video candidates plus its own live query; 146/146 initial coverage.                               |
| No real video download pipeline existed.                                                | Bounded native jobs, FFmpeg audio/video merging, progress, cancellation, persisted metadata and an actual media-file endpoint. |
| Fake AdShield counters and unsupported ad-free claims.                                  | Removed, with accurate YouTube playback attribution.                                                                           |
| History recorded selection rather than playback; notes contained invented timestamps.   | Official player events and actual playback times.                                                                              |
| Corrupted or unavailable browser storage could break views or lose session data.        | Nested validation, memory fallback, visible persistence errors, JSON backup and restore.                                       |
| Legacy notes/bookmarks could be lost in a rewrite.                                      | One-time migration preserves valid data and leaves original keys intact.                                                       |
| React Strict Mode could abort the first refresh and strand the loading state.           | Cancellation-aware requests, stale-result guards and coalesced initial refreshes.                                              |
| The UI mimicked a browser window and disabled mobile zoom.                              | Responsive video interface, real browser history, keyboard focus, native modal focus handling and restored zoom.               |

## Verification scope

The homepage crash follow-up fixes a missing-category dereference: the motivation entry had been commented out while `HomeFeed` still read its query. Home feed lookups now use the shared registry, missing categories are skipped safely, and the replacement has a legacy alias. A browser regression removes the category from the served module and confirms that other homepage sections still work without a React error.

The motivation feed is replaced by lifestyle/self-improvement talks from verified original TED, YaleCourses and Royal Institution channel IDs. Both search providers and playback metadata enforce relevant topics, a five-minute minimum, and exclusions for Shorts/reels/compilations. Live verification returned 19 qualifying talks across all three sources and independently rechecked a sample's original publisher/duration before playback. See `self-improvement-verification.json`. The pasted missing-package errors occurred during dependency installation; package resolution, clean Vite build and development browser startup now succeed.

The Vercel download follow-up adds a real serverless API entry point and rewrite. The previous public deployment's `/api/health` returned 404. Hosted media preparation is awaited within its invocation, followed by multipart upload and a private job manifest in Vercel Blob. File access issues a scoped signed URL, so video bytes bypass the function response body. The local persistent queue remains available for local hosting.

Cloud regressions cover fresh function instances, failed uploads, cancellation, expiry, cleanup, content reapproval, parsed Vercel request bodies, redirects and JSON file links. A real short CS download produced a 4,935,896-byte MP4 containing video and audio. Production redeployment and a real Blob transfer require the project's storage connection; no account credentials were available here. Setup, operational bounds and verification steps are in `VERCEL_SETUP.md`.

The content-scope follow-up adds one shared policy for CS education, exam preparation, motivation, soft skills and music. It filters both search providers, all channel feeds, old library items, topic candidates and related videos. Server metadata approval gates playback and new downloads; existing download files are checked again before serving. A cached title or pasted link cannot skip approval. Unexpected navigation inside the embedded player stops playback.

The homepage now has independent live music, motivation and soft-skills sections, with category navigation and automatic refresh. Live verification returned 24 music results, 22 motivation results and 19 soft-skills results; explicit sports, gameplay and cooking queries were rejected. See `content-verification.json`. All 146 GATE lessons retain approved short-video candidates.

This follow-up passed 25 unit/service tests and 26 browser tests across desktop and mobile. New regressions cover unrelated metadata, misleading descriptions and labels, search scopes, blocked direct links and downloads, delayed approval, embedded player navigation, library filtering and timed homepage refresh. Production screenshots were refreshed; both viewports fit without horizontal overflow and written lessons remain available offline.

The policy classifies YouTube metadata, not audiovisual contents. It can reject legitimate videos with insufficient evidence and cannot guarantee perfect classification of misleading titles. The app does not control external YouTube pages.

The test suite checks authored content structure and data integrity. It cannot certify every educational claim or replace expert review of curriculum depth.

Each initial topic-video entry contains actual YouTube IDs, titles and durations. Every lesson has at least one result between 120 and 1,800 seconds. Topic matching uses titles and is documented as such. The complete lecture contents were not watched.

The YouTube Data API path is exercised with provider fixtures because no real API key was supplied. Keyless search, channel feeds and video metadata were exercised against YouTube. Live search and download behavior remain dependent on upstream availability and rate limits.

A real download was checked using a short public video. FFmpeg merged separate audio/video streams and the result had an MP4 file signature; see download-verification.json. The browser suite separately tests queue-to-file interface states using fixtures.

The production app is designed to run with its Node backend on the local loopback interface. This task does not deploy the app or create native App Store/Windows packages. The installable web app uses the same responsive interface.

## Evidence files

- syllabus-source.txt — text extracted from the supplied PDF.
- syllabus-coverage.md — all sections, groups and lesson IDs.
- topic-video-report.json — short candidate coverage for all lessons.
- library-verification.json — starter metadata checks.
- live-verification.json — live search/feed/metadata check results.
- download-verification.json — actual downloaded media-file check.

## Final check results

- 18 unit/service tests passed.
- 18 browser tests passed across desktop and mobile.
- 4 affected discovery/layout tests passed again after final visual polish.
- Oxlint completed with no warnings or errors.
- Production build completed.
- Production desktop/mobile checks: no horizontal overflow or page exceptions, four focused lecture candidates on the checked lesson, written notes reload offline.
- Live feeds: all six configured channels responded; 83 relevant recent entries returned.
- Real MP4 download: 533,915 bytes, with an AV1 video stream and AAC audio stream. The persisted file endpoint returned the same bytes after restart.
