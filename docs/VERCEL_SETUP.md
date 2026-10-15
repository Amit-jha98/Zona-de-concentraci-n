# Deploy EduBrowse as one Vercel project

The existing deployment at https://study-zone-gamma.vercel.app returned `404 NOT_FOUND` for `/api/health` on 15 October 2026. It deployed the Vite frontend without the app's Node API. Running `npm start` on a laptop cannot fix that deployment.

The repository now includes `api/handler.js`, a same-origin API rewrite, a Vercel build command that installs the official checksum-verified Linux yt-dlp executable, and packaged FFmpeg. Keep the project root at the repository root, not `src` or `dist`.

## Configure and redeploy

1. Commit and push the complete updated project, including `api/`, `server/`, `shared/`, `vercel.json`, `package.json` and `package-lock.json`.
2. In **Vercel → Project → Storage**, create a **Private Blob** store and connect it to this project for Production (and Preview if used). Keep its generated environment variables server-side. The SDK supports the store's automatic OIDC configuration (`BLOB_STORE_ID`) or `BLOB_READ_WRITE_TOKEN`. Do not prefix any of these with `VITE_`.
3. In **Settings → Environment Variables**, set `CRON_SECRET` to a new random secret of at least 32 characters. Vercel's daily cleanup cron uses it to authenticate. Keep it out of Git. Optional: add `YOUTUBE_API_KEY` for official live search instead of keyless search.
4. In **Settings → Build and Deployment**, use **Vite**, root **repository root**, build command **`npm run build:vercel`**, output directory **`dist`**. Remove any dashboard override that uses only `npm run build`; the committed configuration supplies the correct command. Use Node 22 or newer and Fluid Compute. Leave the FFmpeg/yt-dlp path variables unset so the bundled Linux tools are selected.
5. Redeploy the new commit. If an old dependency cache contains a binary from another platform, redeploy without the build cache. Do not upload Windows `.exe` files.

## Verify after redeployment

Open `/api/health` on the deployed domain. It should return JSON with `hosting: "vercel"`, `downloads.mode: "cloud"`, and `downloads.available: true`. A missing storage connection or missing tools produces a specific setup message.

Open an allowed video, select 360p for the first check, and choose **Download video**. Keep the preparation window open. After preparation finishes, **Downloads → Save file** requests a short-lived signed URL and downloads directly from private Blob storage. The API returns a small JSON response or redirect; it never proxies the video bytes.

To check the deployment with a script:

```sh
node scripts/check-vercel.mjs https://study-zone-gamma.vercel.app
```

The script checks routing/configuration without creating billable download jobs. It exits unsuccessfully if a required capability is missing.

## Download behavior and limits

The hosted path awaits media preparation and multipart upload within the same function request. It publishes a completed job only after both media and its private manifest are stored. Subsequent requests can read the job on any function instance. No background queue, local job file, sticky session or separate backend service is needed.

Downloads are bounded to **150 MiB** of merged media and **270 seconds** of total preparation inside a function configured for 300 seconds. Each source stream is bounded to 75 MiB to leave room for merging in temporary storage. Some files below 150 MiB can therefore still exceed the per-stream bound. Try 360p or a shorter lesson if a limit is reached. Quality means the best available resolution up to the selection. Audio is included.

Closing the preparation dialog aborts the request. Failed preparations remove local temporary files and any partially published storage objects. Files expire in the app after 24 hours; an authenticated daily cron removes old stored objects, so physical retention can be up to roughly 48 hours. Blob storage and function usage follow the connected Vercel plan's pricing. The cleanup route only touches the `edubrowse-downloads/` prefix.

YouTube can block data-center IPs, require authentication, remove videos or change formats. These return explicit errors rather than a false completed job. A YouTube Data API key supports discovery, but does not grant media-download access or fix an upstream IP block. The application cannot guarantee that every YouTube video will download.

Local `npm run dev` / `npm start` still use the existing persistent local queue. Hosted and local job records are separate.

## Validation performed here

- Unit/service tests exercise durable storage across fresh instances, approval before downloading, cleanup after upload failure, expiry, cancellation, signed-file routing, Vercel-parsed JSON bodies and missing configuration.
- Desktop/mobile browser tests cover preparation, actionable setup failures and the file redirect.
- The final suite passed **32 unit/service tests and 32 browser tests**, plus lint and production build.
- The real hosted media-preparation command was exercised locally using a short CS lesson, producing a 4,935,896-byte MP4 with AV1 video and AAC audio. See `cloud-media-verification.json`.
- The production build and Vercel build pipeline passed locally using the existing verified downloader. Fresh tool downloads hit intermittent GitHub connection timeouts in this Windows workspace; the installer now retries and uses GitHub's official asset API. The fresh Linux tool installation must still run in Vercel's build environment.
- No Vercel account or connected Blob credentials were available in this workspace. This source update has not been redeployed, and an end-to-end production Blob transfer remains to be verified after the connection and redeploy.

References: [Vercel function limits](https://vercel.com/docs/functions/limitations), [Blob SDK and storage setup](https://vercel.com/docs/vercel-blob/using-blob-sdk), [private signed URLs](https://vercel.com/docs/vercel-blob/vercel-signed-urls).
