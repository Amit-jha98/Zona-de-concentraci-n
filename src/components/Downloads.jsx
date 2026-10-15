import { useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  Download,
  ExternalLink,
  LoaderCircle,
  X,
} from "lucide-react";
import Dialog from "./ui/Dialog.jsx";
import { api } from "../services/api.js";
import { navigate } from "../hooks/useRoute.js";

export function DownloadDialog({ video, onClose, addJob, notify }) {
  const [quality, setQuality] = useState("720");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const start = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const job = await api("/downloads", {
        method: "POST",
        body: { videoId: video.id, quality },
      });
      addJob({ ...job, title: video.title, thumbnail: video.thumbnail });
      notify("Download added to your queue");
      onClose();
      navigate("/downloads");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog title="Download video" onClose={onClose}>
      <div className="download-video-summary">
        <img
          src={
            video.thumbnail ||
            `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
          }
          alt=""
        />
        <strong>{video.title}</strong>
      </div>
      <form onSubmit={start}>
        <label className="field-label">
          Maximum quality
          <select value={quality} onChange={(e) => setQuality(e.target.value)}>
            <option value="360">360p · Smaller file</option>
            <option value="720">720p · Standard</option>
            <option value="1080">1080p · Higher quality</option>
          </select>
        </label>
        <p className="field-help">
          The best available quality up to this resolution, with audio included.
          Actual quality depends on the video.
        </p>
        <p className="field-help">
          Save videos you own or have permission to download. Files are
          temporarily kept by the local app server.
        </p>
        {error && (
          <div className="notice error">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}
        <div className="dialog-actions">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button button-dark" disabled={busy}>
            {busy ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <Download size={16} />
            )}
            {busy ? "Starting…" : "Download video"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export default function Downloads({ jobs, setJobs, notify }) {
  const cancel = async (id) => {
    try {
      await api(`/downloads/${id}`, { method: "DELETE" });
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: "cancelled" } : j)),
      );
    } catch (e) {
      notify(e.message);
    }
  };
  return (
    <div className="library-page page-width">
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR LIBRARY</span>
          <h1>Downloads</h1>
          <p>
            Follow downloads here, then save the finished file to your device.
          </p>
        </div>
      </div>
      {jobs.length ? (
        <div className="download-list">
          {jobs.map((job) => (
            <article className="download-row" key={job.id}>
              <img
                src={
                  job.thumbnail ||
                  `https://i.ytimg.com/vi/${job.videoId}/hqdefault.jpg`
                }
                alt=""
              />
              <div className="download-row-copy">
                <h2>{job.title || job.videoId}</h2>
                <span className="download-status">
                  {job.status === "complete" ? (
                    <CheckCircle2 size={15} className="success-text" />
                  ) : job.status === "downloading" ? (
                    <LoaderCircle size={15} className="spin" />
                  ) : null}
                  {job.status === "complete"
                    ? "Ready to save"
                    : job.status === "downloading"
                      ? `Downloading · ${Math.round(job.progress)}%`
                      : job.status === "failed"
                        ? "Download failed"
                        : job.status === "cancelled"
                          ? "Cancelled"
                          : job.status === "expired"
                            ? "Expired"
                            : "Queued"}{" "}
                  · up to {job.quality}p
                </span>
                {["downloading", "queued"].includes(job.status) && (
                  <progress
                    max="100"
                    value={job.progress}
                    aria-label={`Download progress for ${job.title}`}
                  />
                )}
                {job.error && (
                  <p className="danger-text small-text">{job.error}</p>
                )}
              </div>
              {job.status === "complete" ? (
                <a
                  className="button button-dark"
                  href={`/api/downloads/${job.id}/file`}
                  download
                >
                  <ArrowDownToLine size={16} />
                  Save file
                </a>
              ) : ["queued", "downloading"].includes(job.status) ? (
                <button
                  className="icon-button"
                  onClick={() => cancel(job.id)}
                  aria-label={`Cancel download ${job.title}`}
                >
                  <X size={19} />
                </button>
              ) : (
                <button
                  className="text-button"
                  onClick={() =>
                    setJobs((prev) => prev.filter((j) => j.id !== job.id))
                  }
                >
                  Dismiss
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Download size={36} strokeWidth={1.5} />
          <h2>Take a lesson with you</h2>
          <p>Open a video and choose Download to add it here.</p>
          <button className="button button-dark" onClick={() => navigate("/")}>
            Explore videos
          </button>
        </div>
      )}
      <p className="source-caption">
        The server keeps files temporarily and cleans expired files after 24
        hours. Downloads can fail for private, restricted or unavailable videos.
        For YouTube’s offline viewing,{" "}
        <a
          href="https://www.youtube.com/premium"
          target="_blank"
          rel="noreferrer"
        >
          visit YouTube
          <ExternalLink size={12} />
        </a>
        .
      </p>
    </div>
  );
}
