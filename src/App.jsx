import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  CircleHelp,
  Clock3,
  Code2,
  Download,
  GraduationCap,
  Home,
  Menu,
  MessageSquare,
  Music2,
  Sprout,
  Monitor,
  Search,
  Settings,
  WifiOff,
  X,
} from "lucide-react";
import Youtube from "./components/ui/YouTubeMark.jsx";
import { useRoute, navigate, getRoute } from "./hooks/useRoute.js";
import { useStorage } from "./hooks/useStorage.js";
import { isRecord, downloadText } from "./services/storage.js";
import {
  videoList,
  progressValid,
  notesValid,
  settingsValid,
} from "./services/stateValidation.js";
import { extractVideoId, uniqueVideos } from "../shared/video.js";
import { allowedVideos, isAllowedVideo } from "../shared/contentPolicy.js";
import { CATEGORIES, STARTER_VIDEOS, getCategory } from "./data/library.js";
import { GATE_LESSONS } from "./data/gate/index.js";
import { api, getApiKey, setApiKey } from "./services/api.js";
import Discovery from "./components/Discovery.jsx";
import { GateOverview, GateLesson } from "./components/GateTrack.jsx";
import Dialog from "./components/ui/Dialog.jsx";
import VideoCard from "./components/ui/VideoCard.jsx";
import Downloads, { DownloadDialog } from "./components/Downloads.jsx";
import { useDownloadJobs } from "./hooks/useDownloadJobs.js";
import "./App.css";

const WatchPage = lazy(() => import("./components/WatchPage.jsx"));
const defaults = { theme: "light", autoRefresh: true, refreshMinutes: 15 };

export default function App() {
  const route = useRoute();
  const [saved, setSaved, savedError] = useStorage(
    "edubrowse_v2_saved",
    [],
    videoList,
  );
  const [history, setHistory, historyError] = useStorage(
    "edubrowse_v2_history",
    [],
    videoList,
  );
  const [progress, setProgress, progressError] = useStorage(
    "edubrowse_v2_gate",
    {},
    progressValid,
  );
  const [notes, setNotes, notesError] = useStorage(
    "edubrowse_v2_notes",
    {},
    notesValid,
  );
  const [settings, setSettings] = useStorage(
    "edubrowse_v2_settings",
    defaults,
    settingsValid,
  );
  const [jobs, setJobs] = useStorage(
    "edubrowse_v2_downloads",
    [],
    (v) =>
      Array.isArray(v) &&
      v.every(
        (x) =>
          isRecord(x) &&
          /^[a-f0-9-]{36}$/.test(x.id || "") &&
          typeof x.status === "string",
      ),
  );
  const [videoCache, setVideoCache] = useState(() =>
    Object.fromEntries(
      allowedVideos(
        uniqueVideos([...STARTER_VIDEOS, ...saved, ...history]),
      ).map((v) => [v.id, v]),
    ),
  );
  const [search, setSearch] = useState(
    route.path === "/search" ? route.params.q || "" : "",
  );
  const [menu, setMenu] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [download, setDownload] = useState(null);
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [revision, setRevision] = useState(0);
  const searchRef = useRef(null);
  const notify = useCallback((message) => setToast(message), []);
  const cacheVideo = useCallback(
    (video) =>
      setVideoCache((prev) => ({
        ...prev,
        [video.id]: { ...prev[video.id], ...video },
      })),
    [],
  );
  const onPlay = useCallback(
    (video, lessonId) => {
      cacheVideo(video);
      navigate(`/watch/${video.id}${lessonId ? `?lesson=${lessonId}` : ""}`);
    },
    [cacheVideo],
  );
  const onSave = useCallback(
    (video) => {
      if (!video?.id || !isAllowedVideo(video)) return;
      setSaved((prev) =>
        prev.some((v) => v.id === video.id)
          ? prev.filter((v) => v.id !== video.id)
          : [{ ...video, savedAt: new Date().toISOString() }, ...prev].slice(
              0,
              1000,
            ),
      );
    },
    [setSaved],
  );
  const recordWatch = useCallback(
    (video, position, duration, ended = false) => {
      if (!isAllowedVideo(video)) return;
      setHistory((prev) =>
        [
          {
            ...video,
            position: ended ? 0 : Math.floor(position),
            duration: duration || video.duration,
            progress: ended ? 100 : duration ? (position / duration) * 100 : 0,
            watchedAt: new Date().toISOString(),
          },
          ...prev.filter((v) => v.id !== video.id),
        ].slice(0, 200),
      );
    },
    [setHistory],
  );
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const closeMenu = useCallback(() => setMenu(false), []);
  const closeDownload = useCallback(() => setDownload(null), []);
  useDownloadJobs(jobs, setJobs);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () =>
      document.documentElement.setAttribute(
        "data-theme",
        settings.theme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : settings.theme,
      );
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [settings.theme]);
  useEffect(() => {
    const up = () => setOnline(true),
      down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  useEffect(() => {
    const handle = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  useEffect(() => {
    const changed = () => {
      const next = getRoute();
      setMenu(false);
      if (next.path === "/search") setSearch(next.params.q || "");
    };
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  useEffect(() => {
    document.title = `${route.path === "/gate" ? "GATE CS 2027" : route.path === "/saved" ? "Saved videos" : route.path === "/history" ? "Watch history" : route.path.startsWith("/lesson/") ? "GATE lesson" : "Learn computer science"} · EduBrowse`;
  }, [route.path]);
  const doSearch = (e) => {
    e.preventDefault();
    const text = search.trim();
    if (!text) return;
    const id = extractVideoId(text);
    navigate(
      id
        ? `/watch/${id}`
        : `/search?q=${encodeURIComponent(text.slice(0, 250))}`,
    );
    searchRef.current?.blur();
  };
  const addJob = useCallback(
    (job) =>
      setJobs((prev) =>
        [job, ...prev.filter((j) => j.id !== job.id)].slice(0, 30),
      ),
    [setJobs],
  );
  const currentLesson = route.path.startsWith("/lesson/")
    ? route.path.split("/")[2]
    : null;
  const currentVideo = route.path.startsWith("/watch/")
    ? route.path.split("/")[2]
    : null;
  const activeCategory = getCategory(route.params.category)?.id || "all";
  const completed = GATE_LESSONS.filter(
    (l) => progress[l.id]?.completed,
  ).length;
  const navItems = [
    {
      path: "/",
      label: "Explore",
      icon: Home,
      active: route.path === "/" && activeCategory === "all",
    },
    {
      path: "/gate",
      label: "GATE CS 2027",
      icon: GraduationCap,
      active: route.path === "/gate" || !!currentLesson,
    },
    {
      path: "/?category=interview",
      label: "Interview preparation",
      icon: Code2,
      active: activeCategory === "interview",
    },
    {
      path: "/?category=soft-skills",
      label: "Communication & skills",
      icon: MessageSquare,
      active: activeCategory === "soft-skills",
    },
    {
      path: "/?category=self-improvement",
      label: "Lifestyle & self-improvement",
      icon: Sprout,
      active: activeCategory === "self-improvement",
    },
    {
      path: "/?category=music",
      label: "Music & songs",
      icon: Music2,
      active: activeCategory === "music",
    },
  ];
  const libraryItems = [
    {
      path: "/saved",
      label: "Saved videos",
      icon: Bookmark,
      count: allowedVideos(saved).length,
    },
    { path: "/history", label: "Watch history", icon: Clock3 },
    {
      path: "/downloads",
      label: "Downloads",
      icon: Download,
      count: jobs.filter((j) => ["queued", "downloading"].includes(j.status))
        .length,
    },
  ];
  const navigation = (
    <>
      <div className="nav-group">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              href={`#${item.path}`}
              key={item.path}
              className={`nav-item ${item.active ? "active" : ""}`}
              aria-current={item.active ? "page" : undefined}
              onClick={closeMenu}
            >
              <Icon size={20} strokeWidth={item.active ? 2 : 1.65} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>
      <div className="nav-group">
        <span className="nav-label">Your library</span>
        {libraryItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              href={`#${item.path}`}
              key={item.path}
              className={`nav-item ${route.path === item.path ? "active" : ""}`}
              aria-current={route.path === item.path ? "page" : undefined}
              onClick={closeMenu}
            >
              <Icon size={20} strokeWidth={1.65} />
              <span>{item.label}</span>
              {item.count > 0 && (
                <span className="nav-count">{item.count}</span>
              )}
            </a>
          );
        })}
      </div>
      <div className="nav-group nav-subjects">
        <span className="nav-label">Explore subjects</span>
        {CATEGORIES.filter((c) =>
          [
            "algorithms",
            "os",
            "dbms",
            "networks",
            "system-design",
            "ai",
            "web",
          ].includes(c.id),
        ).map((c) => (
          <a
            href={`#/?category=${c.id}`}
            className={`nav-item ${route.path === "/" && activeCategory === c.id ? "active" : ""}`}
            key={c.id}
            onClick={closeMenu}
          >
            <span className="subject-dot" />
            <span>{c.name}</span>
          </a>
        ))}
      </div>
      <div className="sidebar-footer">
        <button
          className="nav-item"
          onClick={() => {
            setSettingsOpen(true);
            setMenu(false);
          }}
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>
        <div className="device-note">
          <Monitor size={15} />
          <span>
            Your progress stays
            <br />
            on this device.
          </span>
        </div>
        <a
          className="youtube-attribution"
          href="https://www.youtube.com"
          target="_blank"
          rel="noreferrer"
        >
          <Youtube size={16} />
          Videos from YouTube
          <ArrowUpRight size={12} />
        </a>
      </div>
    </>
  );
  return (
    <div className="app">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="app-header">
        <div className="brand-area">
          <button
            className="icon-button menu-button"
            aria-label="Open navigation menu"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu size={23} />
          </button>
          <a className="brand" href="#/" aria-label="EduBrowse home">
            <span className="brand-symbol">
              <PlayLogo />
            </span>
            <span>
              EduBrowse<span className="brand-cs">CS</span>
            </span>
          </a>
        </div>
        <form className="global-search" onSubmit={doSearch} role="search">
          <label className="visually-hidden" htmlFor="global-search">
            Search videos, topics or paste a YouTube link
          </label>
          <input
            id="global-search"
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={250}
            placeholder="Search a topic, skill, or YouTube link"
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              className="search-clear icon-button"
              onClick={() => {
                setSearch("");
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}
          <button type="submit" className="search-submit" aria-label="Search">
            <Search size={21} />
          </button>
        </form>
        <div className="header-actions">
          <button
            className="header-track-button"
            onClick={() => navigate("/gate")}
          >
            <GraduationCap size={19} />
            <span>Your study track</span>
          </button>
          <button
            className="icon-button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
          >
            <Settings size={21} />
          </button>
          <span className="profile-avatar" title="Local study workspace">
            CS
          </span>
        </div>
      </header>
      <aside className="app-sidebar">
        <nav aria-label="Main navigation">{navigation}</nav>
      </aside>
      <main id="main-content" className="main-content" tabIndex={-1}>
        {!online && (
          <div className="connectivity-banner">
            <WifiOff size={16} />
            You’re offline. Written lessons and saved progress remain available
            in this session.
          </div>
        )}
        {(savedError || historyError || progressError || notesError) && (
          <div className="connectivity-banner">
            Browser storage is unavailable or full. This session is kept in
            memory; export a backup in Settings before closing.
          </div>
        )}
        <AppErrorBoundary key={route.path}>
          <Suspense
            fallback={
              <div className="page-loading">Loading your workspace…</div>
            }
          >
            {currentVideo ? (
              <WatchPage
                key={currentVideo}
                id={currentVideo}
                lessonId={route.params.lesson}
                videoCache={videoCache}
                cacheVideo={cacheVideo}
                saved={saved}
                onSave={onSave}
                history={history}
                recordWatch={recordWatch}
                notes={notes}
                setNotes={setNotes}
                onPlay={onPlay}
                onDownload={setDownload}
                notify={notify}
              />
            ) : currentLesson ? (
              <GateLesson
                key={currentLesson}
                id={currentLesson}
                tab={route.params.tab}
                progress={progress}
                updateProgress={setProgress}
                onPlay={onPlay}
                saved={saved}
                onSave={onSave}
                revision={revision}
              />
            ) : route.path === "/gate" ? (
              <GateOverview progress={progress} />
            ) : ["/saved", "/history"].includes(route.path) ? (
              <Library
                type={route.path.slice(1)}
                videos={allowedVideos(
                  route.path === "/saved" ? saved : history,
                )}
                saved={saved}
                onSave={onSave}
                onPlay={onPlay}
                clearHistory={() => setHistory([])}
              />
            ) : route.path === "/downloads" ? (
              <Downloads
                jobs={allowedVideos(jobs)}
                setJobs={setJobs}
                notify={notify}
              />
            ) : ["/", "/search"].includes(route.path) ? (
              <Discovery
                key={`${route.path}:${activeCategory}:${route.params.q || ""}`}
                route={route}
                saved={saved}
                onSave={onSave}
                onPlay={onPlay}
                settings={settings}
                progress={progress}
                history={allowedVideos(history)}
                revision={revision}
              />
            ) : (
              <div className="empty-state">
                <CircleHelp size={32} />
                <h1>Page not found</h1>
                <button className="button" onClick={() => navigate("/")}>
                  Back to explore
                </button>
              </div>
            )}
          </Suspense>
        </AppErrorBoundary>
      </main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {[
          {
            path: "/",
            label: "Explore",
            icon: Home,
            active: route.path === "/" || route.path === "/search",
          },
          {
            path: "/gate",
            label: "Study track",
            icon: GraduationCap,
            active: route.path === "/gate" || !!currentLesson,
          },
          {
            path: "/saved",
            label: "Saved",
            icon: Bookmark,
            active: route.path === "/saved",
          },
          {
            path: "/downloads",
            label: "Downloads",
            icon: Download,
            active: route.path === "/downloads",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.path}
              href={`#${item.path}`}
              className={item.active ? "active" : ""}
              aria-current={item.active ? "page" : undefined}
            >
              <Icon size={21} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
      {menu && (
        <Dialog title="Navigation" onClose={closeMenu}>
          <nav className="dialog-navigation" aria-label="Expanded navigation">
            {navigation}
          </nav>
        </Dialog>
      )}
      {settingsOpen && (
        <SettingsDialog
          settings={settings}
          setSettings={setSettings}
          onClose={closeSettings}
          notify={notify}
          backup={{ version: 1, saved, history, progress, notes, settings }}
          onImport={(data) => {
            setSaved(data.saved);
            setHistory(data.history);
            setProgress(data.progress);
            setNotes(data.notes);
            setSettings(data.settings);
            setVideoCache(
              Object.fromEntries(
                uniqueVideos([
                  ...STARTER_VIDEOS,
                  ...data.saved,
                  ...data.history,
                ]).map((v) => [v.id, v]),
              ),
            );
          }}
          onKeyChanged={() => setRevision((v) => v + 1)}
          completed={completed}
        />
      )}
      {download && (
        <DownloadDialog
          video={download}
          onClose={closeDownload}
          addJob={addJob}
          notify={notify}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button
            className="icon-button"
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function PlayLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M6 4.5v9l8-4.5z" fill="currentColor" />
    </svg>
  );
}

function Library({ type, videos, saved, onSave, onPlay, clearHistory }) {
  const [confirm, setConfirm] = useState(false);
  const close = useCallback(() => setConfirm(false), []);
  const isSaved = type === "saved";
  return (
    <div className="library-page page-width">
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR LIBRARY</span>
          <h1>{isSaved ? "Saved for later" : "Watch history"}</h1>
          <p>
            {isSaved
              ? `${videos.length} saved video${videos.length === 1 ? "" : "s"}. Your next learning session starts here.`
              : "Lectures you’ve played. Pick up where you left off."}
          </p>
        </div>
        {!isSaved && videos.length > 0 && (
          <button className="button" onClick={() => setConfirm(true)}>
            Clear history
          </button>
        )}
      </div>
      {videos.length ? (
        <div className="video-grid">
          {videos.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              onPlay={onPlay}
              onSave={onSave}
              saved={saved.some((s) => s.id === v.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {isSaved ? (
            <Bookmark size={36} strokeWidth={1.5} />
          ) : (
            <Clock3 size={36} strokeWidth={1.5} />
          )}
          <h2>
            {isSaved
              ? "Make room for a good lesson"
              : "Your learning starts here"}
          </h2>
          <p>
            {isSaved
              ? "Save a video with the bookmark button to find it here."
              : "Play a lecture and it will appear here with your progress."}
          </p>
          <button className="button button-dark" onClick={() => navigate("/")}>
            Explore videos
          </button>
        </div>
      )}
      {confirm && (
        <Dialog title="Clear watch history?" onClose={close}>
          <p>
            This removes the watch history and resume positions saved on this
            device.
          </p>
          <div className="dialog-actions">
            <button className="button" onClick={close}>
              Keep history
            </button>
            <button
              className="button button-danger"
              onClick={() => {
                clearHistory();
                close();
              }}
            >
              Clear history
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function SettingsDialog({
  settings,
  setSettings,
  onClose,
  notify,
  backup,
  onImport,
  onKeyChanged,
  completed,
}) {
  const [key, setKey] = useState(getApiKey);
  const [health, setHealth] = useState(null);
  const [importError, setImportError] = useState("");
  const fileRef = useRef(null);
  useEffect(() => {
    const c = new AbortController();
    api("/health", { signal: c.signal })
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));
    return () => c.abort();
  }, []);
  const save = (e) => {
    e.preventDefault();
    setApiKey(key);
    onKeyChanged();
    notify("Settings saved");
    onClose();
  };
  const importFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 5_000_000)
        throw new Error("Backup is too large (maximum 5 MB).");
      const data = JSON.parse(await file.text());
      if (
        data.version !== 1 ||
        !videoList(data.saved) ||
        !videoList(data.history) ||
        !progressValid(data.progress) ||
        !notesValid(data.notes) ||
        !settingsValid(data.settings)
      )
        throw new Error("This file is not a valid EduBrowse backup.");
      onImport(data);
      notify("Study backup restored");
      onClose();
    } catch (error) {
      setImportError(error.message);
    }
    e.target.value = "";
  };
  return (
    <Dialog title="Settings" onClose={onClose}>
      <form onSubmit={save}>
        <section className="settings-section">
          <h3>Appearance</h3>
          <label className="field-label">
            Theme
            <select
              value={settings.theme}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, theme: e.target.value }))
              }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">Use device setting</option>
            </select>
          </label>
        </section>
        <section className="settings-section">
          <h3>Fresh videos</h3>
          <label className="setting-switch">
            <span>
              <strong>Refresh automatically</strong>
              <small>
                Check for new results while this app is open and visible.
              </small>
            </span>
            <input
              type="checkbox"
              checked={settings.autoRefresh}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  autoRefresh: e.target.checked,
                }))
              }
            />
          </label>
          <label className="field-label">
            Refresh interval
            <select
              value={settings.refreshMinutes}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  refreshMinutes: +e.target.value,
                }))
              }
              disabled={!settings.autoRefresh}
            >
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
            </select>
          </label>
        </section>
        <section className="settings-section">
          <h3>YouTube connection</h3>
          <p className="field-help">
            Search works through the local helper, or through a YouTube Data API
            key. A key gives official pagination and language preferences.
          </p>
          <label className="field-label">
            YouTube Data API key
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoComplete="off"
              spellCheck="false"
              placeholder="Optional · stored for this browser session"
              maxLength={200}
            />
          </label>
          <p className="field-help">
            Sent only to this app’s backend, then to Google’s YouTube API. For a
            shared deployment, configure YOUTUBE_API_KEY on the server.
          </p>
          <div className="service-status">
            <span className={`status-dot ${health?.ok ? "" : "paused"}`} />
            {health
              ? health.ok
                ? `App server connected${health.apiKeyConfigured ? " · server API key configured" : ""}`
                : "App server unavailable"
              : "Checking app server…"}
          </div>
          <div className="service-status">
            <span
              className={`status-dot ${health?.downloads?.available ? "" : "paused"}`}
            />
            {health?.downloads?.available
              ? `Download helper ready · ${health.downloads.version}`
              : health?.downloads?.message || "Checking download helper…"}
          </div>
        </section>
        <section className="settings-section">
          <h3>Your study data</h3>
          <p className="field-help">
            {completed} completed lessons. Saved videos, notes and progress are
            stored in this browser. Back them up before switching devices.
          </p>
          <div className="data-actions">
            <button
              type="button"
              className="button"
              onClick={() =>
                downloadText(
                  "edubrowse-study-backup.json",
                  JSON.stringify(backup, null, 2),
                  "application/json",
                )
              }
            >
              <Download size={15} />
              Export backup
            </button>
            <button
              type="button"
              className="button"
              onClick={() => fileRef.current?.click()}
            >
              Restore backup
            </button>
            <input
              className="visually-hidden"
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              onChange={importFile}
            />
          </div>
          {importError && (
            <p className="danger-text" role="alert">
              {importError}
            </p>
          )}
        </section>
        <div className="dialog-actions">
          <button type="button" className="button" onClick={onClose}>
            Close
          </button>
          <button className="button button-dark" type="submit">
            Save settings
          </button>
        </div>
      </form>
    </Dialog>
  );
}
class AppErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="empty-state">
          <CircleHelp size={32} />
          <h1>This view couldn’t load</h1>
          <p>Your saved work is still on this device. Reload to try again.</p>
          <button className="button" onClick={() => window.location.reload()}>
            Reload app
          </button>
          <a className="text-button" href="#/">
            Back to explore
          </a>
        </div>
      );
    return this.props.children;
  }
}
