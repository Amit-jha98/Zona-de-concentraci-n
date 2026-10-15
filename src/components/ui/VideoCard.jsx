import { useState } from "react";
import { Bookmark, BookmarkCheck, Play, ImageOff } from "lucide-react";
import Youtube from "./YouTubeMark.jsx";
import { formatDuration, relativeDate } from "../../../shared/video.js";
export default function VideoCard({
  video,
  onPlay,
  saved,
  onSave,
  compact = false,
}) {
  const [failed, setFailed] = useState(false);
  const duration = formatDuration(video.duration);
  const views =
    Number.isFinite(Number(video.views)) && video.views != null
      ? `${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(video.views)} views`
      : "";
  return (
    <article className={`video-card ${compact ? "video-card-compact" : ""}`}>
      <button
        className="thumbnail-button"
        onClick={() => onPlay(video)}
        aria-label={`Watch ${video.title}`}
      >
        {failed ? (
          <div className="thumbnail-fallback">
            <ImageOff size={28} />
            <span>{video.channel}</span>
          </div>
        ) : (
          <img
            src={
              video.thumbnail ||
              `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
            }
            alt=""
            loading="lazy"
            width="480"
            height="270"
            onError={() => setFailed(true)}
          />
        )}
        <span className="thumbnail-play">
          <Play size={24} fill="currentColor" />
        </span>
        {duration && <span className="duration">{duration}</span>}
        {video.progress > 0 && (
          <span
            className="watch-progress"
            style={{ width: `${Math.min(100, video.progress)}%` }}
          />
        )}
      </button>
      <div className="video-details">
        {!compact && (
          <span className="channel-avatar" aria-hidden="true">
            {(video.channel || "YT")
              .replace(/[^a-zA-Z]/g, "")
              .slice(0, 2)
              .toUpperCase()}
          </span>
        )}
        <div className="video-copy">
          <button className="video-title" onClick={() => onPlay(video)}>
            {video.title}
          </button>
          <p className="video-channel">{video.channel || "YouTube"}</p>
          <p className="video-meta">
            {[views, relativeDate(video.publishedAt)]
              .filter(Boolean)
              .join(" · ") || (
              <>
                <Youtube size={12} /> YouTube
              </>
            )}
          </p>
        </div>
        <button
          className={`icon-button save-button ${saved ? "is-saved" : ""}`}
          onClick={() => onSave(video)}
          aria-label={saved ? `Unsave ${video.title}` : `Save ${video.title}`}
          aria-pressed={saved}
        >
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>
    </article>
  );
}
export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="video-grid" aria-label="Loading videos" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="video-skeleton" key={i}>
          <div className="skeleton-thumb shimmer" />
          <div className="skeleton-line shimmer" />
          <div className="skeleton-line short shimmer" />
        </div>
      ))}
    </div>
  );
}
