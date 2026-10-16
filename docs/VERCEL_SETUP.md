# Deploy EduBrowse as one Vercel project

Keep the Vercel root directory at the repository root. This project includes the React frontend and the Node API in one deployment; a frontend-only upload cannot run downloads or the tutor.

## Server environment

Set these in Vercel Project → Settings → Environment Variables for the environments you use, then redeploy:

- `CLOUDINARY_URL`: the complete value from your Cloudinary dashboard, or all three of `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- `GEMINI_API_KEY`: a standard Gemini API key. The service-account `keys.json` is not used.
- `GEMINI_MODEL`: optional; defaults to `gemini-3.1-flash-lite`.
- `GEMINI_DAILY_REQUEST_LIMIT`: optional; defaults to 18 upstream doubt requests per UTC day per running server instance. Set 0 to disable new requests. This is a conservative local budget, not a distributed account-wide quota.
- `CRON_SECRET`: a random server secret for the daily expired-download cleanup route.
- `YOUTUBE_API_KEY`: optional, for official live discovery instead of keyless search.

Never use a `VITE_` prefix for these secrets. Local `.env`, service-account files and credential files are excluded from Vercel uploads and blocked by the development file server. Local `.env` values are not automatically copied into your Vercel environment.

## Build settings

Use Vite, Node 22.12 or newer, build command `npm run build:vercel`, output `dist`. The committed `vercel.json` configures the API function and routing. The build installs a checksum-verified Linux yt-dlp executable and packages FFmpeg. Remove any dashboard override that builds only the frontend. Do not set Windows executable paths on Vercel.

Commit/deploy `public/gate-pyq-bank.json`, all files in `public/gate-exam-notes/`, and `public/pyq/` together. Vercel bundles the bank and note JSON for server-side tutor context; question images are frontend static assets. PDFs and authoring documents in `docs/` are not required in the function bundle. Standard builds use the committed material and make no Gemini content-generation calls.

## Cloudinary downloads

Downloads use authenticated Cloudinary video assets and authenticated raw JSON manifests under `edubrowse-downloads/`. The function finishes media preparation and upload before publishing a completed job. Other instances can read the durable manifest. Save file returns a short-lived signed attachment URL; video bytes do not pass through the Vercel response.

The hosted limit is 100 MiB merged media, 75 MiB per source stream, and 270 seconds of preparation in a function configured for 300 seconds. Closing preparation cancels the request; failures remove temporary and partially published files. Jobs expire after 24 hours; daily authenticated cleanup removes expired assets. Account storage/upload limits still apply. Lower quality or shorter lessons may be necessary.

Cloudinary credentials were verified locally with an authenticated JSON round trip, a real small MP4 upload and signed download; temporary verification assets were deleted. See `cloudinary-verification.json`. The chunked uploader ignores intermediate `done:false` responses and publishes only after final completion.

YouTube may reject a particular download from a cloud-server IP or change available formats. Those failures are reported; storing in Cloudinary cannot bypass an upstream restriction. Save only media you own or are permitted to download.

## Gemini use and limits

Only pressing Send in the doubt tutor calls Gemini. Opening a topic, opening chat, clicking a suggested prompt, taking a quiz, reviewing static explanations and building the app make no Gemini request. Suggested prompts only populate the editor.

Successful identical conversations cache for six hours, and simultaneous duplicates share one upstream request. Failed requests are not cached or automatically retried. Replies use at most 1536 output tokens. Topic IDs and review-question membership are verified server-side; the browser cannot submit a replacement system prompt or API credential. Request and concurrency limits bound abuse.

The in-memory cache and daily budget are per instance and reset on cold starts; they are not an account-wide quota on Vercel. Google's configured project quota remains the final limit. Keep the project on the intended free tier and use its account quota controls if a global ceiling is needed. There is no automatic paid-provider fallback. Tutor tests use mocked responses and consume no quota.

## Verify after deployment

1. Open `/api/health`: expect JSON, `hosting: "vercel"`, `downloads.mode: "cloud"`, `downloads.storage: "cloudinary"`, `downloads.available: true`, and `tutor.configured: true`.
2. Open `/#/mocks` and a lesson: ten mocks, the question images and expanded notes should load.
3. For a permitted short video, prepare 360p and use Downloads → Save file. The resulting signed Cloudinary URL should save an actual MP4.
4. Send one real topic doubt when you want to verify the live tutor. Opening the panel alone is deliberately not a test of the key.

Read-only route check:

```sh
node scripts/check-vercel.mjs https://study-zone-gamma.vercel.app
```

These local source changes have not been deployed automatically. End-to-end production checks must follow redeployment with the server environment configured.
