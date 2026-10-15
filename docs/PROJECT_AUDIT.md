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
