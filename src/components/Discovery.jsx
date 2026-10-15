import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  BookOpen,
  RefreshCw,
  Radio,
  Search,
  SlidersHorizontal,
  AlertCircle,
  ChevronRight,
  WifiOff,
  Music2,
  Sprout,
  MessageSquare,
} from "lucide-react";
import { useVideos } from "../hooks/useVideos.js";
import VideoCard, { SkeletonGrid } from "./ui/VideoCard.jsx";
import { CATEGORIES, STARTER_VIDEOS, getCategory } from "../data/library.js";
import { SELF_IMPROVEMENT_TOPICS } from "../../shared/selfImprovement.js";
import { GATE_LESSONS } from "../data/gate/index.js";
import { navigate } from "../hooks/useRoute.js";
import { api } from "../services/api.js";
import { allowedVideos } from "../../shared/contentPolicy.js";

const HOME_FEEDS = [
  {
    category: "music",
    title: "Music for your break",
    caption: "Songs, new releases and something to unwind with.",
    icon: Music2,
  },
  {
    category: "self-improvement",
    title: "Build a better everyday life",
    caption:
      "Habits, happiness and sleep. Full talks from TED, YaleCourses and the Royal Institution; at least 5 minutes.",
    icon: Sprout,
  },
  {
    category: "soft-skills",
    title: "Build skills beyond the screen",
    caption: "Communication, confidence and interview conversations.",
    icon: MessageSquare,
  },
];

function HomeFeed({ feed, saved, onSave, onPlay, settings, revision }) {
  const category = getCategory(feed?.category);
  const videos = useVideos(category?.query || "", {
    scope: category?.scope || "all",
    revision,
    enabled: Boolean(category?.query),
  });
  const refreshRef = useRef(videos.refresh);
  useEffect(() => {
    refreshRef.current = videos.refresh;
  });
  useEffect(() => {
    if (!category?.query || !settings.autoRefresh) return;
    const refresh = () => {
      if (document.visibilityState === "visible" && navigator.onLine)
        refreshRef.current();
    };
    const timer = setInterval(refresh, (settings.refreshMinutes || 15) * 60000);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [category?.query, settings.autoRefresh, settings.refreshMinutes]);
  if (!category) return null;
  const Icon = feed.icon;
  return (
    <section className="feed-section" aria-label={feed.title}>
      <div className="section-heading small">
        <div className="inline-title">
          <Icon size={20} />
          <h2>{feed.title}</h2>
        </div>
        <button
          className="text-button"
          onClick={() => navigate(`/?category=${category.id}`)}
        >
          View all <ChevronRight size={16} />
        </button>
      </div>
      <p className="section-caption">{feed.caption}</p>
      {videos.loading && !videos.items.length ? (
        <SkeletonGrid count={3} />
      ) : videos.items.length ? (
        <div className="video-grid">
          {videos.items.slice(0, 3).map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={onPlay}
              onSave={onSave}
              saved={saved.some((v) => v.id === video.id)}
            />
          ))}
        </div>
      ) : (
        <div className="feed-unavailable">
          <Icon size={22} />
          <div>
            <strong>
              {videos.error
                ? "This section couldn't refresh"
                : "No matching videos returned"}
            </strong>
            <p>
              {videos.error ||
                "Explore this category for more results from YouTube."}
            </p>
          </div>
          <button
            className="button"
            disabled={videos.loading}
            onClick={videos.refresh}
          >
            Retry
          </button>
        </div>
      )}
      {videos.error && videos.items.length > 0 && (
        <p className="inline-warning">
          <AlertCircle size={16} />
          {videos.error}
        </p>
      )}
    </section>
  );
}

export default function Discovery({
  route,
  saved,
  onSave,
  onPlay,
  settings,
  progress,
  history,
  revision,
}) {
  const search = route.path === "/search";
  const category = getCategory(route.params.category) || CATEGORIES[0];
  const [order, setOrder] = useState(
    route.params.latest ? "date" : "relevance",
  );
  const [duration, setDuration] = useState("any");
  const [language, setLanguage] = useState("");
  const [filters, setFilters] = useState(false);
  const [uploads, setUploads] = useState({
    items: [],
    loading: false,
    error: "",
    fetchedAt: null,
  });
  const uploadBusy = useRef(false);
  const home = !search && category.id === "all";
  const query = search
    ? route.params.q || "computer science"
    : category.id === "self-improvement"
      ? route.params.topic || category.query
      : category.query;
  const videos = useVideos(query, {
    order,
    duration,
    language,
    revision,
    scope: search
      ? "all"
      : category.scope ||
        (category.id === "gate"
          ? "exam"
          : category.id === "interview"
            ? "all"
            : "cs"),
    enabled: !home,
  });
  const done = GATE_LESSONS.filter(
    (item) => progress[item.id]?.completed,
  ).length;
  const nextLesson =
    GATE_LESSONS.find((item) => !progress[item.id]?.completed) ||
    GATE_LESSONS[0];
  const uploadsAbort = useRef(null);
  const refreshUploads = async () => {
    if (uploadBusy.current) return;
    uploadBusy.current = true;
    const controller = new AbortController();
    uploadsAbort.current = controller;
    setUploads((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const result = await api("/uploads", { signal: controller.signal });
      if (!controller.signal.aborted)
        setUploads({
          ...result,
          items: allowedVideos(result.items),
          loading: false,
          error: "",
        });
    } catch (error) {
      if (!controller.signal.aborted)
        setUploads((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
    } finally {
      if (uploadsAbort.current === controller) uploadBusy.current = false;
    }
  };
  useEffect(() => {
    if (!home) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) refreshUploads();
    });
    return () => {
      cancelled = true;
      uploadsAbort.current?.abort();
      uploadBusy.current = false;
    };
  }, [home]);
  const refreshRef = useRef(null);
  useEffect(() => {
    refreshRef.current = home ? refreshUploads : videos.refresh;
  });
  useEffect(() => {
    if (!settings.autoRefresh) return;
    const refresh = () => {
      if (document.visibilityState === "visible" && navigator.onLine)
        refreshRef.current?.();
    };
    const id = setInterval(refresh, (settings.refreshMinutes || 15) * 60000);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [settings.autoRefresh, settings.refreshMinutes]);
  const visibleStarter =
    duration === "any"
      ? STARTER_VIDEOS
      : STARTER_VIDEOS.filter(
          (v) => v.duration && (duration !== "concept" || v.duration <= 1800),
        );
  return (
    <div className="discovery page-width">
      <div className="category-scroll" aria-label="Video subjects">
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            className={`category-chip ${!search && category.id === item.id ? "active" : ""}`}
            onClick={() =>
              navigate(item.id === "all" ? "/" : `/?category=${item.id}`)
            }
            aria-pressed={!search && category.id === item.id}
          >
            {item.name}
          </button>
        ))}
      </div>
      {home && (
        <>
          <div className="section-heading">
            <div>
              <h1>Explore</h1>
              <p>Learn, get inspired, or take a music break.</p>
            </div>
            <span className="desktop-only quiet-label">
              <span
                className={`status-dot ${settings.autoRefresh ? "" : "paused"}`}
              />
              {settings.autoRefresh ? "Auto-refresh on" : "Auto-refresh paused"}
            </span>
          </div>
          <section className="track-banner" aria-label="GATE preparation">
            <div className="track-banner-icon">
              <BookOpen size={30} strokeWidth={1.5} />
            </div>
            <div className="track-banner-copy">
              <span className="eyebrow">GATE CS 2027</span>
              <h2>Your GATE CS study track</h2>
              <p>
                {GATE_LESSONS.length} concept lessons · Notes, focused videos &
                explained practice
              </p>
            </div>
            <div className="track-banner-progress">
              <span>
                {done} / {GATE_LESSONS.length} completed
              </span>
              <div className="progress-track">
                <span
                  style={{ width: `${(done / GATE_LESSONS.length) * 100}%` }}
                />
              </div>
            </div>
            <button
              className="button button-dark"
              onClick={() =>
                navigate(done ? `/lesson/${nextLesson.id}` : "/gate")
              }
            >
              {done ? "Continue learning" : "Explore the track"}
              <ChevronRight size={17} />
            </button>
          </section>
          {history.length > 0 && (
            <section className="feed-section">
              <div className="section-heading small">
                <h2>Continue watching</h2>
                <button
                  className="text-button"
                  onClick={() => navigate("/history")}
                >
                  View history <ChevronRight size={16} />
                </button>
              </div>
              <div className="video-grid">
                {history.slice(0, 3).map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={onPlay}
                    saved={saved.some((v) => v.id === video.id)}
                    onSave={onSave}
                  />
                ))}
              </div>
            </section>
          )}
          {HOME_FEEDS.filter((feed) => getCategory(feed.category)).map(
            (feed) => (
              <HomeFeed
                key={feed.category}
                feed={feed}
                saved={saved}
                onSave={onSave}
                onPlay={onPlay}
                settings={settings}
                revision={revision}
              />
            ),
          )}
          <section className="feed-section">
            <div className="section-heading small">
              <div className="inline-title">
                <Radio size={19} />
                <h2>Fresh from your learning channels</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Refresh new uploads"
                disabled={uploads.loading}
                onClick={refreshUploads}
              >
                <RefreshCw
                  size={18}
                  className={uploads.loading ? "spin" : ""}
                />
              </button>
            </div>
            <p className="section-caption">
              Recent uploads from {uploads.channelsTotal || 6} educational
              channels. Search reaches beyond these channels.
            </p>
            {uploads.loading && !uploads.items.length ? (
              <SkeletonGrid count={3} />
            ) : uploads.items.length ? (
              <>
                <div className="video-grid">
                  {uploads.items.slice(0, 6).map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onPlay={onPlay}
                      saved={saved.some((v) => v.id === video.id)}
                      onSave={onSave}
                    />
                  ))}
                </div>
                {uploads.channelsAvailable < uploads.channelsTotal && (
                  <p className="muted">
                    Some channel feeds are unavailable. Showing{" "}
                    {uploads.channelsAvailable} of {uploads.channelsTotal}{" "}
                    channels.
                  </p>
                )}
              </>
            ) : (
              <div className="feed-unavailable">
                <WifiOff size={20} />
                <div>
                  <strong>
                    {uploads.error
                      ? "Fresh uploads are temporarily unavailable"
                      : "No uploads returned yet"}
                  </strong>
                  <p>
                    {uploads.error ||
                      "Try refreshing in a moment. You can still explore the starter library below."}
                  </p>
                </div>
                <button className="button" onClick={refreshUploads}>
                  Retry
                </button>
              </div>
            )}
            {uploads.error && uploads.items.length > 0 && (
              <p className="inline-warning">
                <AlertCircle size={16} />
                {uploads.error}
              </p>
            )}
          </section>
          <section className="feed-section">
            <div className="section-heading small">
              <h2>Start with the fundamentals</h2>
              <button
                className="text-button"
                onClick={() =>
                  navigate("/search?q=computer%20science%20concept%20tutorial")
                }
              >
                Explore YouTube <ArrowUpRight size={16} />
              </button>
            </div>
            <p className="section-caption">
              A small starting library. Use search or a subject above for live
              results from more creators.
            </p>
            <div className="video-grid">
              {visibleStarter.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={onPlay}
                  saved={saved.some((v) => v.id === video.id)}
                  onSave={onSave}
                />
              ))}
            </div>
          </section>
        </>
      )}
      {!home && (
        <>
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {search ? "YOUTUBE SEARCH" : "EXPLORE A SUBJECT"}
              </span>
              <h1>
                {search
                  ? `Results for “${route.params.q || "computer science"}”`
                  : category.name}
              </h1>
              <p>
                CS education, exam preparation, lifestyle and self-improvement,
                soft skills and music. Results are filtered to these categories.
              </p>
            </div>
            <button
              className={`button ${filters ? "selected" : ""}`}
              onClick={() => setFilters(!filters)}
              aria-expanded={filters}
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>
          </div>
          {category.id === "self-improvement" && !search && (
            <section aria-label="Self-improvement topics">
              <p className="section-caption">
                Original talks from TED, YaleCourses and the Royal Institution.
                We verify channel IDs and require at least 5 minutes; Shorts and
                compilations are excluded.
              </p>
              <div className="category-scroll" aria-label="Lifestyle topics">
                <button
                  className={`category-chip ${!route.params.topic ? "active" : ""}`}
                  onClick={() => navigate("/?category=self-improvement")}
                >
                  All topics
                </button>
                {SELF_IMPROVEMENT_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    className={`category-chip ${route.params.topic === topic ? "active" : ""}`}
                    onClick={() =>
                      navigate(
                        `/?category=self-improvement&topic=${encodeURIComponent(topic)}`,
                      )
                    }
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </section>
          )}
          <div className="results-toolbar">
            <div className="segmented">
              <button
                className={order === "relevance" ? "active" : ""}
                onClick={() => setOrder("relevance")}
              >
                Relevant
              </button>
              <button
                className={order === "date" ? "active" : ""}
                onClick={() => setOrder("date")}
              >
                Newest
              </button>
            </div>
            <div className="results-status">
              {videos.loading
                ? "Searching YouTube…"
                : `${videos.items.length} videos loaded`}
              <button
                className="icon-button"
                aria-label="Refresh video search"
                onClick={videos.refresh}
                disabled={videos.loading || videos.loadingMore}
              >
                <RefreshCw size={16} className={videos.loading ? "spin" : ""} />
              </button>
            </div>
          </div>
          {filters && (
            <div className="filter-panel">
              <label>
                Video length
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="any">Any length</option>
                  <option value="concept">
                    Focused concepts (up to 30 min)
                  </option>
                  {category.id !== "self-improvement" && (
                    <option value="short">Under 4 minutes</option>
                  )}
                  <option value="medium">4–20 minutes</option>
                  <option value="long">Over 20 minutes</option>
                </select>
              </label>
              <label>
                Preferred language
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="">Any language</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </label>
              <p>
                Language preference uses YouTube’s API. Focused results exclude
                long courses.
              </p>
            </div>
          )}
          {videos.error && (
            <div className="notice error">
              <AlertCircle size={20} />
              <div>
                <strong>
                  {videos.errorCode === "CONTENT_NOT_ALLOWED"
                    ? "This search is outside your categories"
                    : "Search couldn’t be completed"}
                </strong>
                <p>{videos.error}</p>
              </div>
              {videos.errorCode !== "CONTENT_NOT_ALLOWED" && (
                <button className="button" onClick={videos.refresh}>
                  Try again
                </button>
              )}
            </div>
          )}
          {videos.loading && !videos.items.length ? (
            <SkeletonGrid />
          ) : videos.items.length ? (
            <div className="video-grid">
              {videos.items.map((video) => (
                <VideoCard
                  key={video.id}
                  video={{ ...video, subject: category.id }}
                  onPlay={onPlay}
                  saved={saved.some((v) => v.id === video.id)}
                  onSave={onSave}
                />
              ))}
            </div>
          ) : (
            !videos.error && (
              <div className="empty-state">
                <Search size={32} />
                <h2>No matching videos</h2>
                <p>
                  Only CS education, exam preparation, lifestyle and
                  self-improvement, soft skills and music are shown. Try a more
                  specific topic, another length filter, or the next page.
                </p>
              </div>
            )
          )}
          {videos.nextPageToken && (
            <div className="load-more">
              <button
                className="button"
                disabled={videos.loadingMore}
                onClick={videos.loadMore}
              >
                {videos.loadingMore ? (
                  <>
                    <RefreshCw size={17} className="spin" />
                    Loading more…
                  </>
                ) : (
                  "Load more videos"
                )}
              </button>
            </div>
          )}
          {!videos.loading &&
            videos.items.length > 0 &&
            !videos.nextPageToken && (
              <p className="end-message">
                You’ve reached the end of this search. Try a related term to
                explore further.
              </p>
            )}
          {videos.notice && <p className="muted">{videos.notice}</p>}
          <p className="source-caption">
            Videos provided by YouTube
            {videos.provider ? ` · ${videos.provider}` : ""}. Results depend on
            availability, region and the selected filters.
          </p>
        </>
      )}
    </div>
  );
}
