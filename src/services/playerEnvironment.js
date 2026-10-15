// Keep browser privileges scoped to the active player. Requests can settle after
// playback stops, so a late wake lock must be released rather than retained.
export function createPlaybackWakeLock({ document, navigator, window }) {
  let playing = false;
  let disposed = false;
  let pageActive = true;
  let sentinel = null;
  let pending = false;
  let revision = 0;
  const wanted = () =>
    playing && !disposed && pageActive && document.visibilityState !== "hidden";
  const releaseSentinel = async (lock) => {
    try {
      await lock?.release();
    } catch {
      // The browser may already have revoked the lock.
    }
  };
  const release = () => {
    revision++;
    const previous = sentinel;
    sentinel = null;
    void releaseSentinel(previous);
  };
  const acquire = async () => {
    if (!wanted() || sentinel || pending || !navigator.wakeLock?.request)
      return;
    pending = true;
    const requestRevision = revision;
    try {
      const lock = await navigator.wakeLock.request("screen");
      if (!wanted() || requestRevision !== revision) {
        await releaseSentinel(lock);
      } else {
        sentinel = lock;
        lock.addEventListener(
          "release",
          () => {
            if (sentinel === lock) sentinel = null;
          },
          { once: true },
        );
        if (lock.released) sentinel = null;
      }
    } catch {
      // Unsupported browsers, battery policy and denied permission must not
      // interrupt playback. Retry on a later play/visibility event, not a loop.
    } finally {
      pending = false;
      if (requestRevision !== revision && wanted() && !sentinel) void acquire();
    }
  };
  const visibilityChanged = () => {
    if (wanted()) void acquire();
    else release();
  };
  const pageHidden = () => {
    pageActive = false;
    release();
  };
  const pageShown = () => {
    pageActive = true;
    visibilityChanged();
  };
  document.addEventListener("visibilitychange", visibilityChanged);
  window.addEventListener("pagehide", pageHidden);
  window.addEventListener("pageshow", pageShown);
  return {
    setPlaying(value) {
      playing = Boolean(value);
      if (playing) void acquire();
      else release();
    },
    destroy() {
      disposed = true;
      playing = false;
      release();
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.removeEventListener("pagehide", pageHidden);
      window.removeEventListener("pageshow", pageShown);
    },
  };
}

export function createPlayerFullscreen({
  frame,
  document,
  window,
  navigator,
  screen,
  onChange,
}) {
  let disposed = false;
  let fullscreen = false;
  let orientationOwned = false;
  let restoringOrientation = false;
  let orientationRevision = 0;
  const orientation = screen.orientation;
  const mobile =
    navigator.maxTouchPoints > 0 &&
    window.matchMedia("(pointer: coarse)").matches;
  const fullscreenElement = () =>
    document.fullscreenElement || document.webkitFullscreenElement;
  // A fullscreen element inside YouTube appears as its iframe in the parent
  // document. This also catches YouTube's own fullscreen button.
  const ownsFullscreen = () => {
    const element = fullscreenElement();
    return Boolean(element && (element === frame || frame.contains(element)));
  };
  const unlock = () => {
    try {
      orientation?.unlock?.();
    } catch {
      // Some browsers expose the interface without implementing locking.
    }
  };
  const restorePortrait = () => {
    if (!orientationOwned) return;
    orientationOwned = false;
    restoringOrientation = true;
    const revision = ++orientationRevision;
    unlock(); // Cancel any landscape request still pending at fullscreen exit.
    try {
      // Installed apps may allow this outside fullscreen. Other browsers restore
      // their natural orientation when the landscape lock is released.
      Promise.resolve(orientation.lock("portrait"))
        .catch(() => {})
        .finally(() => {
          if (!disposed && revision === orientationRevision) {
            restoringOrientation = false;
            unlock();
          }
        });
    } catch {
      restoringOrientation = false;
      unlock();
    }
  };
  const changed = () => {
    if (disposed) return;
    const next = ownsFullscreen();
    if (next === fullscreen) return;
    fullscreen = next;
    onChange(next);
    if (next && mobile && orientation?.lock) {
      restoringOrientation = false;
      orientationOwned = true;
      orientationRevision++;
      try {
        Promise.resolve(orientation.lock("landscape")).catch(() => {});
      } catch {
        // Fullscreen remains usable when orientation locking is unsupported.
      }
    } else if (!next) restorePortrait();
  };
  const exit = async () => {
    if (!ownsFullscreen()) return;
    restorePortrait();
    const method = document.exitFullscreen || document.webkitExitFullscreen;
    await method?.call(document);
  };
  document.addEventListener("fullscreenchange", changed);
  document.addEventListener("webkitfullscreenchange", changed);
  return {
    supported: Boolean(
      (frame.requestFullscreen && document.fullscreenEnabled !== false) ||
        (frame.webkitRequestFullscreen &&
          document.webkitFullscreenEnabled !== false),
    ),
    async toggle() {
      if (disposed) return false;
      try {
        if (ownsFullscreen()) await exit();
        else {
          const request =
            frame.requestFullscreen || frame.webkitRequestFullscreen;
          if (!request) return false;
          await request.call(frame);
          if (disposed) {
            if (ownsFullscreen()) {
              const leave =
                document.exitFullscreen || document.webkitExitFullscreen;
              await leave?.call(document);
            }
            return false;
          }
        }
        changed();
        return true;
      } catch {
        return false;
      }
    },
    destroy() {
      disposed = true;
      document.removeEventListener("fullscreenchange", changed);
      document.removeEventListener("webkitfullscreenchange", changed);
      orientationRevision++;
      if (orientationOwned || restoringOrientation) unlock();
      orientationOwned = false;
      if (ownsFullscreen()) {
        const leave = document.exitFullscreen || document.webkitExitFullscreen;
        try {
          Promise.resolve(leave?.call(document)).catch(() => {});
        } catch {
          // Removing the fullscreen element also exits fullscreen.
        }
      }
      if (fullscreen) onChange(false);
    },
  };
}
