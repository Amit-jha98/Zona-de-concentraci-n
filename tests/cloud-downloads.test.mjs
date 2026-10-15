import test from "node:test";
import assert from "node:assert/strict";
import { writeFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { createServer } from "node:http";
import {
  createCloudDownloadService,
  CLOUD_DOWNLOAD_LIMITS,
} from "../server/cloud-downloads.mjs";
import { ServiceError } from "../server/youtube.mjs";
import handler from "../api/handler.js";
import { cloudDownloads } from "../server/cloud-downloads.mjs";

const VIDEO = "XB4MIexjvY0";
const mediaBytes = Buffer.from(
  "00000018667479706d703432000000006d70343269736f6d",
  "hex",
);

function fixture() {
  let time = Date.now();
  const records = new Map(),
    calls = [],
    workspaces = [];
  const blob = {
    async put(path, body, options) {
      calls.push({ method: "put", path, options });
      const bytes =
        typeof body === "string"
          ? Buffer.from(body)
          : Buffer.from(await new Response(body).arrayBuffer());
      records.set(path, {
        bytes,
        uploadedAt: new Date(time),
        pathname: path,
        url: `https://example.private.blob.vercel-storage.com/${path}`,
      });
      return { pathname: path };
    },
    async get(path) {
      const entry = records.get(path);
      return entry ? { stream: new Response(entry.bytes).body } : null;
    },
    async head(path) {
      if (!records.has(path))
        throw Object.assign(new Error("Missing"), {
          name: "BlobNotFoundError",
        });
    },
    async del(paths) {
      calls.push({ method: "del", paths });
      for (const path of paths)
        records.delete(
          path.startsWith("https:") ? new URL(path).pathname.slice(1) : path,
        );
    },
    async issueSignedToken(options) {
      calls.push({ method: "sign", options });
      return {
        clientSigningToken: "server-only-secret",
        delegationToken: "read-one-file",
      };
    },
    async presignUrl(_token, options) {
      return {
        presignedUrl: `https://example.private.blob.vercel-storage.com/${options.pathname}?signed=one-file-only`,
      };
    },
    getDownloadUrl(url) {
      return url + "&download=1";
    },
    async list({ prefix }) {
      return {
        blobs: [...records.values()].filter((r) =>
          r.pathname.startsWith(prefix),
        ),
        hasMore: false,
      };
    },
  };
  const dependencies = {
    blob,
    isConfigured: () => true,
    tools: async () => {},
    now: () => time,
    approve: async (id) => ({ id, title: "Dijkstra algorithm explained" }),
    render: async (_id, _quality, { directory }) => {
      workspaces.push(directory);
      const path = join(directory, "video.mp4");
      await writeFile(path, mediaBytes);
      return { path };
    },
  };
  return {
    dependencies,
    records,
    calls,
    workspaces,
    advance: (ms) => {
      time += ms;
    },
  };
}

test("cloud preparation waits for the file and stores private media and a durable manifest; a fresh instance can serve it", async () => {
  const f = fixture();
  const render = f.dependencies.render;
  let release;
  const ready = new Promise((resolve) => {
    release = resolve;
  });
  let rendering;
  const started = new Promise((resolve) => {
    rendering = resolve;
  });
  const service = createCloudDownloadService({
    ...f.dependencies,
    render: async (...args) => {
      rendering();
      await ready;
      return render(...args);
    },
  });
  let resolved = false;
  const preparation = service.create(VIDEO, "720").then((job) => {
    resolved = true;
    return job;
  });
  await started;
  assert.equal(resolved, false);
  assert.equal(f.records.size, 0);
  await assert.rejects(
    service.create(VIDEO, "360"),
    (e) => e.code === "DOWNLOAD_BUSY",
  );
  release();
  const job = await preparation;
  assert.equal(job.status, "complete");
  assert.equal(job.size, mediaBytes.length);
  assert.equal(job.filePath, undefined);
  assert.equal(f.records.size, 2);
  assert.ok(
    f.calls
      .filter((c) => c.method === "put")
      .every((c) => c.options.access === "private"),
  );
  assert.equal(await stat(f.workspaces[0]).catch(() => null), null);

  const fresh = createCloudDownloadService(f.dependencies);
  assert.equal((await fresh.get(job.id)).status, "complete");
  const file = await fresh.file(job.id);
  assert.match(file.redirect, /private\.blob\.vercel-storage\.com\//);
  assert.match(file.redirect, /download=1/);
  assert.ok(!JSON.stringify(file).includes("server-only-secret"));
  const sign = f.calls.find((c) => c.method === "sign");
  assert.deepEqual(sign.options.operations, ["get"]);
  assert.match(sign.options.pathname, new RegExp(job.id));
  assert.ok(sign.options.validUntil - Date.now() <= 15 * 60000);
});

test("failed metadata upload rolls back the media and temp files, and releases capacity for retry", async () => {
  const f = fixture();
  const put = f.dependencies.blob.put;
  f.dependencies.blob.put = async (path, ...rest) => {
    if (path.endsWith(".json"))
      throw Object.assign(new Error("Storage failed"), {
        name: "BlobServiceNotAvailable",
      });
    return put(path, ...rest);
  };
  const service = createCloudDownloadService(f.dependencies);
  await assert.rejects(
    service.create(VIDEO, "720"),
    (e) => e.code === "DOWNLOAD_STORAGE_ERROR",
  );
  assert.equal(f.records.size, 0);
  assert.equal(await stat(f.workspaces[0]).catch(() => null), null);
  f.dependencies.blob.put = put;
  assert.equal((await service.create(VIDEO, "360")).status, "complete");
});

test("missing storage, invalid input and rejected content never start a download", async () => {
  const f = fixture();
  const unconfigured = createCloudDownloadService({
    ...f.dependencies,
    isConfigured: () => false,
  });
  assert.equal((await unconfigured.status()).mode, "cloud");
  assert.equal((await unconfigured.status()).available, false);
  await assert.rejects(unconfigured.create("--exec"), (e) => e.status === 400);
  await assert.rejects(
    unconfigured.create(VIDEO),
    (e) => e.code === "DOWNLOAD_STORAGE_REQUIRED",
  );
  const blocked = createCloudDownloadService({
    ...f.dependencies,
    approve: async () => {
      throw new ServiceError(
        "Outside allowed categories",
        403,
        "CONTENT_NOT_ALLOWED",
      );
    },
  });
  await assert.rejects(
    blocked.create(VIDEO),
    (e) => e.code === "CONTENT_NOT_ALLOWED",
  );
  assert.equal(f.workspaces.length, 0);
  assert.equal(f.records.size, 0);
});

test("cancelling preparation cleans up without publishing a job", async () => {
  const f = fixture();
  const controller = new AbortController();
  const render = f.dependencies.render;
  const service = createCloudDownloadService({
    ...f.dependencies,
    render: async (...args) => {
      const media = await render(...args);
      controller.abort();
      return media;
    },
  });
  await assert.rejects(
    service.create(VIDEO, "720", "", { signal: controller.signal }),
    (e) => e.code === "DOWNLOAD_CANCELLED",
  );
  assert.equal(f.records.size, 0);
  assert.equal(await stat(f.workspaces[0]).catch(() => null), null);
});

test("expired downloads cannot be signed; cleanup only removes old app-owned objects", async () => {
  const f = fixture();
  const service = createCloudDownloadService(f.dependencies);
  const job = await service.create(VIDEO);
  f.records.set("other-project/private.txt", {
    pathname: "other-project/private.txt",
    uploadedAt: new Date(0),
    url: "https://example.private.blob.vercel-storage.com/other-project/private.txt",
  });
  f.advance(CLOUD_DOWNLOAD_LIMITS.retentionMs + 1);
  assert.equal((await service.get(job.id)).status, "expired");
  await assert.rejects(service.file(job.id), (e) => e.status === 410);
  assert.equal(f.calls.filter((c) => c.method === "sign").length, 0);
  assert.equal((await service.cleanup()).deleted, 2);
  assert.equal(f.records.size, 1);
  await assert.rejects(service.get(job.id), (e) => e.code === "JOB_NOT_FOUND");
});

test("file access rechecks the content policy and deletion works across instances", async () => {
  const f = fixture();
  const first = createCloudDownloadService(f.dependencies);
  const job = await first.create(VIDEO);
  const changedPolicy = createCloudDownloadService({
    ...f.dependencies,
    approve: async () => {
      throw new ServiceError("Blocked", 403, "CONTENT_NOT_ALLOWED");
    },
  });
  await assert.rejects(changedPolicy.file(job.id), (e) => e.status === 403);
  await createCloudDownloadService(f.dependencies).cancel(job.id);
  await assert.rejects(first.get(job.id), (e) => e.code === "JOB_NOT_FOUND");
  assert.equal(f.records.size, 0);
});

test("the Vercel adapter preserves API paths, returns cloud setup errors, and accepts Vercel-parsed request bodies", async () => {
  const previous = Object.fromEntries(
    [
      "VERCEL",
      "BLOB_READ_WRITE_TOKEN",
      "BLOB_STORE_ID",
      "VERCEL_OIDC_TOKEN",
      "CRON_SECRET",
    ].map((name) => [name, process.env[name]]),
  );
  process.env.VERCEL = "1";
  for (const name of Object.keys(previous).filter((name) => name !== "VERCEL"))
    delete process.env[name];
  const server = createServer(async (req, res) => {
    if (req.method === "POST") {
      for await (const _chunk of req) {
      }
      req.body = { videoId: VIDEO, quality: "720" };
    }
    await handler(req, res);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/handler?__path=`;
  const originalFile = cloudDownloads.file;
  try {
    const health = await (await fetch(base + "health")).json();
    assert.equal(health.hosting, "vercel");
    assert.equal(health.downloads.mode, "cloud");
    const download = await fetch(base + "downloads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    assert.equal(download.status, 503);
    assert.equal((await download.json()).code, "DOWNLOAD_STORAGE_REQUIRED");
    const blocked = await fetch(base + "search&q=cricket+highlights");
    assert.equal(blocked.status, 403);
    const cron = await fetch(base + "maintenance/downloads");
    assert.equal(cron.status, 401);
    const unknown = await fetch(base + "not-a-real-endpoint");
    assert.equal(unknown.status, 404);
    assert.match(unknown.headers.get("content-type"), /json/);
    cloudDownloads.file = async () => ({
      redirect:
        "https://files.private.blob.vercel-storage.com/lesson.mp4?signed=one-file",
    });
    const fileRoute = "downloads/00000000-0000-4000-8000-000000000001/";
    const file = await fetch(base + fileRoute + "file", { redirect: "manual" });
    assert.equal(file.status, 302);
    assert.match(file.headers.get("location"), /^https:\/\/files.private.blob/);
    const link = await fetch(base + fileRoute + "link");
    assert.equal(link.status, 200);
    assert.match((await link.json()).url, /^https:\/\/files.private.blob/);
  } finally {
    cloudDownloads.file = originalFile;
    await new Promise((resolve) => server.close(resolve));
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
