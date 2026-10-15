import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Download,
  FileText,
  LoaderCircle,
  Maximize2,
  Play,
  Share2,
  AlertCircle,
} from "lucide-react";
import Youtube from "./ui/YouTubeMark.jsx";
import { api } from "../services/api.js";
import { navigate } from "../hooks/useRoute.js";
import { LESSON_BY_ID } from "../data/gate/index.js";
import { rankRelated, formatDuration, VIDEO_ID } from "../../shared/video.js";
import { downloadText } from "../services/storage.js";
import VideoCard from "./ui/VideoCard.jsx";
import Dialog from "./ui/Dialog.jsx";

let iframeApi;
function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!iframeApi)
    iframeApi = new Promise((resolve, reject) => {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const timer = setTimeout(() => {
        iframeApi = null;
        reject(
          new Error(
            "The YouTube player could not load. Check your connection or open this video on YouTube.",
          ),
        );
      }, 20000);
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timer);
        resolve(window.YT);
      };
      tag.onerror = () => {
        clearTimeout(timer);
        tag.remove();
        iframeApi = null;
        reject(
          new Error(
            "YouTube is unreachable. Open the video on YouTube or retry.",
          ),
        );
      };
      document.head.appendChild(tag);
    });
  return iframeApi;
}

export default function WatchPage({
  id,
  lessonId,
  videoCache,
  cacheVideo,
  saved,
  onSave,
  history,
  recordWatch,
  notes,
  setNotes,
  onPlay,
  onDownload,
  notify,
}) {
  const known =
    videoCache[id] ||
    saved.find((v) => v.id === id) ||
    history.find((v) => v.id === id);
  const [video, setVideo] = useState(known || null);
  const [error, setError] = useState(() =>
    VIDEO_ID.test(id || "") ? "" : "This is not a valid YouTube video ID.",
  );
  const [playerError, setPlayerError] = useState("");
  const [ready, setReady] = useState(false);
  const [theater, setTheater] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [playerRevision, setPlayerRevision] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const videoRef = useRef(video);
  const watchRef = useRef(recordWatch);
  useEffect(() => {
    videoRef.current = video;
    watchRef.current = recordWatch;
  }, [video, recordWatch]);
  const [hadInitialMetadata] = useState(Boolean(known));
  const resume = useRef(history.find((v) => v.id === id)?.position || 0);
  const playing = useRef(false);
  const lesson = LESSON_BY_ID[lessonId];
  const isSaved = saved.some((v) => v.id === id);
  const currentNotes = notes[id] || [];
  const related = rankRelated(video || { id }, Object.values(videoCache));
  useEffect(() => {
    const controller = new AbortController();
    if (!VIDEO_ID.test(id || "")) {
      return;
    }
    api(`/video/${id}`, { signal: controller.signal })
      .then((item) => {
        setVideo((v) => ({ ...v, ...item }));
        cacheVideo(item);
      })
      .catch((e) => {
        if (!controller.signal.aborted && !hadInitialMetadata)
          setError(e.message);
      });
    return () => controller.abort();
  }, [id, cacheVideo, hadInitialMetadata]);
  useEffect(() => {
    if (!VIDEO_ID.test(id || "")) return;
    let cancelled = false,
      timer;
    loadYouTubeAPI()
      .then((YT) => {
        if (cancelled || !mountRef.current) return;
        const target = document.createElement("div");
        mountRef.current.replaceChildren(target);
        playerRef.current = new YT.Player(target, {
          videoId: id,
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 0,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
            start: Math.floor(resume.current),
          },
          events: {
            onReady: () => {
              if (!cancelled) setReady(true);
            },
            onStateChange: (event) => {
              if (cancelled) return;
              playing.current = event.data === YT.PlayerState.PLAYING;
              if (playing.current && videoRef.current)
                watchRef.current(
                  videoRef.current,
                  playerRef.current.getCurrentTime(),
                  playerRef.current.getDuration(),
                );
              if (event.data === YT.PlayerState.ENDED && videoRef.current)
                watchRef.current(
                  videoRef.current,
                  0,
                  playerRef.current.getDuration(),
                  true,
                );
            },
            onError: (event) => {
              if (cancelled) return;
              playing.current = false;
              setPlayerError(
                [101, 150].includes(event.data)
                  ? "The creator disabled embedded playback. Watch this lecture on YouTube."
                  : event.data === 100
                    ? "This video is private or no longer available."
                    : event.data === 153
                      ? "YouTube could not verify the player origin. Open the video on YouTube."
                      : "YouTube could not play this video. Retry or open it on YouTube.",
              );
            },
          },
        });
        timer = setInterval(() => {
          if (!playing.current || !playerRef.current?.getCurrentTime) return;
          const position = playerRef.current.getCurrentTime(),
            duration = playerRef.current.getDuration();
          setCurrentTime(position);
          if (videoRef.current)
            watchRef.current(videoRef.current, position, duration);
        }, 5000);
      })
      .catch((e) => {
        if (!cancelled) setPlayerError(e.message);
      });
    return () => {
      cancelled = true;
      clearInterval(timer);
      playing.current = false;
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = null;
    };
  }, [id, playerRevision]);
  const share = async () => {
    const url = `https://www.youtube.com/watch?v=${id}`;
    try {
      if (navigator.share) await navigator.share({ title: video?.title, url });
      else {
        await navigator.clipboard.writeText(url);
        notify("Video link copied");
      }
    } catch (e) {
      if (e.name !== "AbortError")
        notify(
          "Couldn’t copy the link. Use “Open on YouTube” to get the address.",
        );
    }
  };
  const addNote = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const position = playerRef.current?.getCurrentTime?.() || currentTime;
    const item = {
      id: crypto.randomUUID(),
      text: draft.trim(),
      seconds: Math.floor(position),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => ({ ...prev, [id]: [...(prev[id] || []), item] }));
    setDraft("");
  };
  const exportNotes = () =>
    downloadText(
      `${id}-notes.md`,
      [
        `# ${video?.title || "Video notes"}`,
        `https://www.youtube.com/watch?v=${id}`,
        "",
        ...currentNotes.map(
          (n) => `- [${formatDuration(n.seconds) || "0:00"}] ${n.text}`,
        ),
      ].join("\n"),
    );
  const closeNotes = useCallback(() => setNotesOpen(false), []);
  if (error && !video)
    return (
      <div className="empty-state">
        <AlertCircle size={32} />
        <h1>Video unavailable</h1>
        <p>{error}</p>
        <a
          className="button"
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noreferrer"
        >
          Check on YouTube
          <ArrowUpRight size={16} />
        </a>
        <button className="text-button" onClick={() => navigate("/")}>
          Back to explore
        </button>
      </div>
    );
  return (
    <div className={`watch-page page-width ${theater ? "theater" : ""}`}>
      <div className="watch-topline">
        <button
          className="back-link"
          onClick={() =>
            lesson
              ? navigate(`/lesson/${lesson.id}?tab=videos`)
              : window.history.length > 1
                ? window.history.back()
                : navigate("/")
          }
        >
          <ArrowLeft size={16} />
          {lesson ? "Return to lesson" : "Back"}
        </button>
        <span className="quiet-label">
          <Youtube size={15} />
          YouTube
        </span>
      </div>
      <div className="watch-layout">
        <div className="watch-main">
          <div className="player-frame">
            <div ref={mountRef} className="youtube-mount" />
            {!ready && !playerError && (
              <div className="player-loading">
                <LoaderCircle size={28} className="spin" />
                <span>Loading YouTube player…</span>
              </div>
            )}
            {playerError && (
              <div className="player-error">
                <AlertCircle size={28} />
                <p>{playerError}</p>
                <div>
                  <button
                    className="button"
                    onClick={() => {
                      setReady(false);
                      setPlayerError("");
                      setPlayerRevision((v) => v + 1);
                    }}
                  >
                    Retry player
                  </button>
                  <a
                    className="button button-dark"
                    href={`https://www.youtube.com/watch?v=${id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open on YouTube
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>
            )}
          </div>
          <h1 className="watch-title">
            {video?.title || "Loading video details…"}
          </h1>
          <div className="watch-actions-row">
            <div className="watch-channel">
              <span className="channel-avatar">
                {(video?.channel || "YT").slice(0, 2).toUpperCase()}
              </span>
              <div>
                <strong>{video?.channel || "YouTube"}</strong>
                <span>Educational video · YouTube</span>
              </div>
            </div>
            <div className="watch-actions">
              <button
                className={`button ${isSaved ? "selected" : ""}`}
                disabled={!video}
                onClick={() => onSave(video)}
                aria-pressed={isSaved}
              >
                {isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                {isSaved ? "Saved" : "Save"}
              </button>
              <button className="button" onClick={share}>
                <Share2 size={17} />
                Share
              </button>
              <button
                className="button"
                disabled={!video}
                onClick={() => onDownload(video)}
              >
                <Download size={17} />
                Download
              </button>
              <button
                className="icon-button desktop-only"
                onClick={() => setTheater(!theater)}
                aria-label={theater ? "Exit theater mode" : "Theater mode"}
                aria-pressed={theater}
              >
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
          {lesson && (
            <div className="watch-lesson-link">
              <BookOpenLabel />
              <div>
                <span>PART OF YOUR GATE TRACK</span>
                <strong>{lesson.title}</strong>
              </div>
              <button
                className="text-button"
                onClick={() => navigate(`/lesson/${lesson.id}?tab=practice`)}
              >
                Practice this concept
                <ArrowUpRight size={15} />
              </button>
            </div>
          )}
          <div className="watch-description">
            {video?.description && <p>{video.description.slice(0, 2500)}</p>}
            <a
              href={`https://www.youtube.com/watch?v=${id}`}
              target="_blank"
              rel="noreferrer"
            >
              Open on YouTube
              <ArrowUpRight size={14} />
            </a>
            <span>
              Playback is provided by YouTube. Ads and availability are
              controlled by YouTube and the creator.
            </span>
          </div>
          <section className="watch-notes-preview">
            <div className="section-heading small">
              <div>
                <h2>Your lecture notes</h2>
                <p>Capture an idea at the current playback time.</p>
              </div>
              <button
                className="button"
                onClick={() => {
                  setCurrentTime(
                    playerRef.current?.getCurrentTime?.() || currentTime,
                  );
                  setNotesOpen(true);
                }}
              >
                <FileText size={16} />
                {currentNotes.length
                  ? `View ${currentNotes.length} notes`
                  : "Add a note"}
              </button>
            </div>
            {currentNotes.slice(-2).map((n) => (
              <p key={n.id}>
                <button
                  className="timestamp"
                  onClick={() => playerRef.current?.seekTo?.(n.seconds, true)}
                >
                  {formatDuration(n.seconds) || "0:00"}
                </button>
                {n.text}
              </p>
            ))}
          </section>
        </div>
        {!theater && (
          <aside className="watch-related">
            <div className="section-heading small">
              <h2>Keep learning</h2>
            </div>
            {related.length ? (
              related.map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  compact
                  onPlay={onPlay}
                  onSave={onSave}
                  saved={saved.some((s) => s.id === v.id)}
                />
              ))
            ) : (
              <div className="related-empty">
                <p>Explore more lectures on this topic.</p>
                <button
                  className="button"
                  onClick={() =>
                    navigate(
                      `/search?q=${encodeURIComponent(lesson?.title || video?.title || "computer science")}`,
                    )
                  }
                >
                  Find related videos
                  <Play size={15} />
                </button>
              </div>
            )}
          </aside>
        )}
      </div>
      {notesOpen && (
        <Dialog title="Your lecture notes" onClose={closeNotes}>
          <p className="muted">{video?.title}</p>
          <form className="note-form" onSubmit={addNote}>
            <label htmlFor="lecture-note">
              Your note{" "}
              <span className="timestamp">
                {formatDuration(currentTime) || "0:00"}
              </span>
            </label>
            <textarea
              id="lecture-note"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              maxLength={10000}
              placeholder="What do you want to remember?"
              required
            />
            <button className="button button-dark" disabled={!draft.trim()}>
              Save timestamped note
            </button>
          </form>
          <div className="notes-list">
            {currentNotes.map((n) => (
              <div key={n.id}>
                <button
                  className="timestamp"
                  onClick={() => {
                    playerRef.current?.seekTo?.(n.seconds, true);
                    setNotesOpen(false);
                  }}
                >
                  {formatDuration(n.seconds) || "0:00"}
                </button>
                <p>{n.text}</p>
                <button
                  className="text-button danger-text"
                  onClick={() =>
                    setNotes((prev) => ({
                      ...prev,
                      [id]: (prev[id] || []).filter((item) => item.id !== n.id),
                    }))
                  }
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          {currentNotes.length > 0 && (
            <button className="button" onClick={exportNotes}>
              <Download size={15} />
              Export notes as Markdown
            </button>
          )}
        </Dialog>
      )}
    </div>
  );
}
function BookOpenLabel() {
  return <FileText size={23} />;
}
