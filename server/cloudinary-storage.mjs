import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const PREFIX = "edubrowse-downloads/";
export function cloudinaryCredentials() {
  if (process.env.CLOUDINARY_URL) {
    try {
      const url = new URL(process.env.CLOUDINARY_URL);
      if (url.protocol === "cloudinary:" && url.hostname && url.username && url.password)
        return { cloud_name: url.hostname, api_key: decodeURIComponent(url.username), api_secret: decodeURIComponent(url.password), secure: true };
    } catch { /* Invalid configuration is reported without exposing its value. */ }
    return null;
  }
  const { CLOUDINARY_CLOUD_NAME: cloud_name, CLOUDINARY_API_KEY: api_key, CLOUDINARY_API_SECRET: api_secret } = process.env;
  return cloud_name && api_key && api_secret ? { cloud_name, api_key, api_secret, secure: true } : null;
}
export const cloudinaryConfigured = () => Boolean(cloudinaryCredentials());
const missing = () => Object.assign(new Error("Storage object not found"), { name: "BlobNotFoundError" });
const storageError = (cause) => {
  const config = cloudinaryCredentials();
  const diagnostic = String(cause?.message || "").replaceAll(config?.api_key || "__absent__", "[redacted]").replaceAll(config?.api_secret || "__absent__", "[redacted]");
  return Object.assign(new Error("Cloudinary storage is unavailable. Check the server credentials and account limits, then retry."), { name: "BlobCloudinaryError", upstreamStatus: cause?.http_code, diagnostic });
};
function asset(pathname) {
  if (typeof pathname !== "string" || !pathname.startsWith(PREFIX) || pathname.includes("..") || /[?#\\]/.test(pathname)) throw storageError();
  const video = pathname.endsWith(".mp4");
  return { public_id: video ? pathname.slice(0, -4) : pathname, resource_type: video ? "video" : "raw", type: "authenticated" };
}

export function createCloudinaryStorage({ client = cloudinary, fetchImpl = fetch } = {}) {
  const credentials = () => {
    const value = cloudinaryCredentials();
    if (!value) throw storageError();
    return value;
  };
  const remove = async (pathname) => {
    const { public_id, ...options } = asset(pathname);
    await client.uploader.destroy(public_id, { ...credentials(), ...options, invalidate: true, timeout: 15000 });
  };
  return {
    async put(pathname, body, { abortSignal } = {}) {
      abortSignal?.throwIfAborted();
      const options = { ...credentials(), ...asset(pathname), overwrite: false, unique_filename: false, timeout: 60000, chunk_size: 6 * 1024 * 1024 };
      const source = typeof body === "string" ? Readable.from([body]) : body instanceof Readable ? body : Readable.fromWeb(body);
      let upload;
      let abort;
      try {
        return await new Promise((resolve, reject) => {
          const callback = (error, result) => {
            if (abortSignal?.aborted) {
              if (result?.public_id) void remove(pathname).catch(() => {});
              reject(abortSignal.reason);
            } else if (error) reject(storageError(error));
            else resolve({ pathname, size: result.bytes });
          };
          upload = options.resource_type === "video" ? client.uploader.upload_chunked_stream(options, callback) : client.uploader.upload_stream(options, callback);
          abort = () => { source.destroy(); upload.destroy(); reject(abortSignal.reason); };
          abortSignal?.addEventListener("abort", abort, { once: true });
          if (abortSignal?.aborted) return abort();
          void pipeline(source, upload).catch((error) => reject(abortSignal?.aborted ? abortSignal.reason : error));
        });
      } finally {
        abortSignal?.removeEventListener("abort", abort);
        source.destroy();
      }
    },
    async get(pathname, { abortSignal } = {}) {
      const { public_id, ...options } = asset(pathname);
      const url = client.url(public_id, { ...credentials(), ...options, sign_url: true });
      const response = await fetchImpl(url, { signal: abortSignal, cache: "no-store" });
      if (response.status === 404) return null;
      if (!response.ok) throw storageError();
      return { stream: response.body };
    },
    async head(pathname) {
      const { public_id, ...options } = asset(pathname);
      try {
        return await client.api.resource(public_id, { ...credentials(), ...options, timeout: 15000 });
      } catch (error) {
        if (error.error?.http_code === 404 || error.http_code === 404) throw missing();
        throw storageError();
      }
    },
    async del(paths) {
      await Promise.all(paths.map(remove));
    },
    async issueSignedToken({ pathname, validUntil }) {
      asset(pathname);
      return { pathname, validUntil };
    },
    async presignUrl(token, { pathname }) {
      if (pathname !== token.pathname || token.validUntil <= Date.now()) throw storageError();
      const { public_id, ...options } = asset(pathname);
      const url = client.utils.private_download_url(public_id, "mp4", { ...credentials(), ...options, attachment: true, expires_at: Math.floor(token.validUntil / 1000) });
      return { presignedUrl: url };
    },
    getDownloadUrl(url) { return url; },
    async list({ prefix, cursor, limit = 200 }) {
      if (prefix !== PREFIX) throw storageError();
      let state = { kind: "video" };
      if (cursor) {
        try { state = JSON.parse(Buffer.from(cursor, "base64url").toString()); } catch { throw storageError(); }
      }
      if (!["video", "raw"].includes(state.kind)) throw storageError();
      const result = await client.api.resources({ ...credentials(), resource_type: state.kind, type: "authenticated", prefix: PREFIX, max_results: Math.min(limit, 500), next_cursor: state.next, timeout: 15000 });
      const next = result.next_cursor ? { kind: state.kind, next: result.next_cursor } : state.kind === "video" ? { kind: "raw" } : null;
      return { blobs: result.resources.map((entry) => ({ pathname: entry.public_id + (state.kind === "video" ? ".mp4" : ""), url: entry.public_id + (state.kind === "video" ? ".mp4" : ""), uploadedAt: entry.created_at })), hasMore: Boolean(next), cursor: next ? Buffer.from(JSON.stringify(next)).toString("base64url") : undefined };
    },
  };
}
export const cloudinaryStorage = createCloudinaryStorage();
