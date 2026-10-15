import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Check, 
  Award, 
  ShieldCheck, 
  BookMarked, 
  Clock, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileEdit,
  CheckCircle2,
  Maximize2,
  Minimize2,
  RotateCw
} from 'lucide-react';
import { buildAdFreeEmbedUrl } from '../services/adBlockerService';
import { CS_SUBJECTS, EDUCATIONAL_VIDEOS } from '../data/csCatalog';

export default function VideoPlayer({
  video,
  isBookmarked,
  onToggleBookmark,
  onOpenNotes,
  isFocusMode
}) {
  const [copied, setCopied] = useState(false);
  const [showTakeaways, setShowTakeaways] = useState(true);
  const [useStandardEmbed, setUseStandardEmbed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSimulatedHorizontal, setIsSimulatedHorizontal] = useState(false);
  const [isRotatedLandscape, setIsRotatedLandscape] = useState(false);

  const playerFrameRef = useRef(null);

  // Guarantee an authentic, 100% playable 11-character YouTube video ID
  const isSynthetic = !video?.id || !/^[a-zA-Z0-9_-]{11}$/.test(video.id);
  const effectiveVideo = useMemo(() => {
    if (!video) return null;
    if (!isSynthetic) return video;
    const fallback = EDUCATIONAL_VIDEOS.find(v => v.subject === video.subject && /^[a-zA-Z0-9_-]{11}$/.test(v.id))
      || EDUCATIONAL_VIDEOS[0];
    return {
      ...video,
      id: fallback.id,
      title: fallback.title,
      channel: fallback.channel,
      duration: fallback.duration
    };
  }, [video, isSynthetic]);

  // Screen Orientation Helpers: Lock to Horizontal (Landscape) Mode
  const requestLandscapeOrientation = useCallback(async () => {
    try {
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        await screen.orientation.lock('landscape');
        return true;
      } else if (screen.lockOrientation) {
        return screen.lockOrientation('landscape');
      } else if (screen.webkitLockOrientation) {
        return screen.webkitLockOrientation('landscape');
      } else if (screen.mozLockOrientation) {
        return screen.mozLockOrientation('landscape');
      } else if (screen.msLockOrientation) {
        return screen.msLockOrientation('landscape');
      }
    } catch (err) {
      // Permission denied or not supported by browser/OS
      console.log('Screen orientation lock not permitted or supported:', err);
    }
    return false;
  }, []);

  const unlockScreenOrientation = useCallback(() => {
    try {
      if (screen.orientation && typeof screen.orientation.unlock === 'function') {
        screen.orientation.unlock();
      } else if (screen.unlockOrientation) {
        screen.unlockOrientation();
      } else if (screen.webkitUnlockOrientation) {
        screen.webkitUnlockOrientation();
      } else if (screen.mozUnlockOrientation) {
        screen.mozUnlockOrientation();
      } else if (screen.msUnlockOrientation) {
        screen.msUnlockOrientation();
      }
    } catch (err) {
      console.log('Screen orientation unlock error:', err);
    }
  }, []);

  // Fullscreen change & Orientation listeners
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const fsElem = document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      const isFs = Boolean(fsElem);
      setIsFullscreen(isFs);

      if (isFs) {
        // Automatically request landscape orientation on ANY fullscreen trigger (native YouTube or our button)
        const locked = await requestLandscapeOrientation();
        const isPortrait = window.matchMedia('(orientation: portrait)').matches || window.innerHeight > window.innerWidth;
        
        // If orientation lock was not applied on mobile portrait, force CSS rotation to guarantee horizontal mode
        if (isPortrait && window.innerWidth <= 1024) {
          setIsRotatedLandscape(!locked);
        } else {
          setIsRotatedLandscape(false);
        }
      } else {
        // Exiting fullscreen: restore normal orientation
        unlockScreenOrientation();
        setIsRotatedLandscape(false);
        setIsSimulatedHorizontal(false);
      }
    };

    const handleResizeOrOrientation = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        isSimulatedHorizontal
      );
      if (isFs) {
        const isLandscape = window.innerWidth > window.innerHeight;
        if (isLandscape) {
          // Device physically rotated to horizontal, CSS forced rotation not needed
          setIsRotatedLandscape(false);
        } else if (window.innerWidth <= 1024) {
          setIsRotatedLandscape(true);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('orientationchange', handleResizeOrOrientation);
    window.addEventListener('resize', handleResizeOrOrientation);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('orientationchange', handleResizeOrOrientation);
      window.removeEventListener('resize', handleResizeOrOrientation);
    };
  }, [requestLandscapeOrientation, unlockScreenOrientation, isSimulatedHorizontal]);

  // Toggle Fullscreen & Automatic Horizontal Mode
  const toggleFullscreenHorizontal = async () => {
    const frame = playerFrameRef.current;
    if (!frame) return;

    const isFs = Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      isSimulatedHorizontal
    );

    if (!isFs) {
      let nativeFsSuccess = false;
      try {
        if (frame.requestFullscreen) {
          await frame.requestFullscreen();
          nativeFsSuccess = true;
        } else if (frame.webkitRequestFullscreen) {
          await frame.webkitRequestFullscreen();
          nativeFsSuccess = true;
        } else if (frame.mozRequestFullScreen) {
          await frame.mozRequestFullScreen();
          nativeFsSuccess = true;
        } else if (frame.msRequestFullscreen) {
          await frame.msRequestFullscreen();
          nativeFsSuccess = true;
        }
      } catch (err) {
        console.warn('Native requestFullscreen failed:', err);
      }

      const locked = await requestLandscapeOrientation();
      const isPortrait = window.matchMedia('(orientation: portrait)').matches || window.innerHeight > window.innerWidth;

      // Fallback to simulated horizontal mode if fullscreen was blocked or mobile device did not rotate
      if (!nativeFsSuccess || (isPortrait && !locked && window.innerWidth <= 1024)) {
        setIsSimulatedHorizontal(true);
        if (isPortrait) {
          setIsRotatedLandscape(true);
        }
      }
    } else {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        try {
          if (document.exitFullscreen) await document.exitFullscreen();
          else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
        } catch (e) {}
      }
      unlockScreenOrientation();
      setIsSimulatedHorizontal(false);
      setIsRotatedLandscape(false);
      setIsFullscreen(false);
    }
  };

  if (!effectiveVideo) {
    return (
      <div className="player-empty-state">
        <p className="text-secondary">Select an educational lecture to begin playback.</p>
      </div>
    );
  }

  const embedUrl = buildAdFreeEmbedUrl(effectiveVideo.id, { autoplay: 1, useStandardEmbed });
  const subjectMeta = CS_SUBJECTS.find(s => s.id === effectiveVideo.subject) || {
    name: 'Computer Science',
    color: '#3b82f6'
  };

  // Deduplicate subtopic if it repeats subjectMeta.name
  const shouldShowSubtopic = useMemo(() => {
    if (!effectiveVideo?.subtopic || !subjectMeta?.name) return false;
    const sub = effectiveVideo.subtopic.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
    const subj = subjectMeta.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
    if (sub === subj) return false;
    const wordsSub = sub.split(/\s+/).filter(Boolean).sort().join(' ');
    const wordsSubj = subj.split(/\s+/).filter(Boolean).sort().join(' ');
    if (wordsSub === wordsSubj) return false;
    return true;
  }, [effectiveVideo?.subtopic, subjectMeta?.name]);

  const handleShare = () => {
    const url = `https://youtube.com/watch?v=${effectiveVideo.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getChannelInitials = (name = '') => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase() || 'CS';
  };

  const isAnyFullscreen = isFullscreen || isSimulatedHorizontal;

  return (
    <div className={`video-player-wrapper ${isFocusMode ? 'focus-mode' : ''}`}>
      {/* 16:9 Aspect Ratio IFrame Container with Fullscreen & Automatic Horizontal Mode */}
      <div 
        ref={playerFrameRef}
        className={`player-aspect-frame ${isAnyFullscreen ? 'is-fullscreen' : ''} ${isSimulatedHorizontal ? 'simulated-horizontal' : ''} ${isRotatedLandscape ? 'force-landscape-rotate' : ''}`}
      >
        <iframe
          key={`${effectiveVideo.id}-${useStandardEmbed}`}
          src={embedUrl}
          title={effectiveVideo.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; screen-wake-lock"
          allowFullScreen
          className="player-iframe"
          loading="eager"
        ></iframe>

        {/* Floating Quick Controls Overlay in Horizontal/Fullscreen Mode */}
        {(isAnyFullscreen || isRotatedLandscape) && (
          <div className="player-fullscreen-controls-overlay">
            <button
              type="button"
              className="player-fullscreen-ctrl-btn rotate"
              onClick={() => setIsRotatedLandscape(prev => !prev)}
              title="Rotate 90° for Horizontal Display"
              aria-label="Rotate Orientation 90°"
            >
              <RotateCw size={14} />
              <span>Rotate 90°</span>
            </button>
            <button
              type="button"
              className="player-fullscreen-ctrl-btn exit"
              onClick={toggleFullscreenHorizontal}
              title="Exit Horizontal Mode"
              aria-label="Exit Horizontal Fullscreen Mode"
            >
              <Minimize2 size={14} />
              <span>Exit Horizontal</span>
            </button>
          </div>
        )}
      </div>

      {/* Playback Controls & Direct Mirror Bar */}
      <div className="player-mirror-bar">
        <div className="mirror-status-row">
          <div className="mirror-status">
            <span className="mirror-dot"></span>
            <span>{useStandardEmbed ? 'Standard Player' : 'AdShield Protected'}</span>
          </div>
          <button
            type="button"
            onClick={toggleFullscreenHorizontal}
            className="mirror-fullscreen-btn"
            title="Watch in Horizontal Fullscreen (Auto-Rotates)"
          >
            {isAnyFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            <span>{isAnyFullscreen ? 'Exit Full' : 'Landscape'}</span>
          </button>
        </div>

        <div className="mirror-actions-row">
          <button
            type="button"
            onClick={() => setUseStandardEmbed(!useStandardEmbed)}
            className="mirror-toggle-btn"
            title="Switch player if video has playback restrictions"
          >
            {useStandardEmbed ? 'Shield Mode' : 'Switch Player'}
          </button>

          <a
            href={`https://www.youtube.com/watch?v=${effectiveVideo.id}`}
            target="_blank"
            rel="noreferrer noopener"
            className="mirror-link-btn"
            title="Open lecture directly on YouTube"
          >
            Direct YouTube <ExternalLink size={11} className="inline-block" />
          </a>
        </div>
      </div>

      {/* Video Details & Modern Clutter-Free Meta Header */}
      <div className="player-metadata-panel">
        <h1 className="player-video-title">{effectiveVideo.title}</h1>

        {/* Unified Channel & Action Bar (Clean single-row UX on desktop & mobile) */}
        <div className="player-channel-bar">
          <div className="player-channel-info">
            <div className="channel-avatar-circle">
              {getChannelInitials(effectiveVideo.channel)}
            </div>
            <div className="channel-text-col">
              <div className="channel-name-row">
                <span className="channel-name">{effectiveVideo.channel}</span>
                <span className="verified-check" title="Verified Educator">✓</span>
              </div>
              <div className="channel-meta-sub">
                <span>{effectiveVideo.views || 'Active'}</span>
                {effectiveVideo.duration && <span>• {effectiveVideo.duration}</span>}
                {effectiveVideo.year && <span>• {effectiveVideo.year}</span>}
              </div>
            </div>
          </div>

          {/* Action buttons in a unified responsive horizontal carousel */}
          <div className="player-actions-strip">
            <button
              onClick={() => onToggleBookmark(effectiveVideo)}
              className={`player-action-pill ${isBookmarked ? 'saved' : ''}`}
              title={isBookmarked ? 'Remove Bookmark' : 'Save for Revision'}
            >
              {isBookmarked ? (
                <BookmarkCheck size={14} className="action-pill-icon text-blue-400" />
              ) : (
                <Bookmark size={14} className="action-pill-icon" />
              )}
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={onOpenNotes}
              className="player-action-pill notes"
              title="Open Lecture Notes Drawer"
            >
              <FileEdit size={14} className="action-pill-icon text-emerald-400" />
              <span>Notes</span>
            </button>

            <button
              onClick={handleShare}
              className="player-action-pill"
              title="Copy YouTube Link"
            >
              {copied ? (
                <Check size={14} className="action-pill-icon text-emerald-400" />
              ) : (
                <Share2 size={14} className="action-pill-icon" />
              )}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreenHorizontal}
              className={`player-action-pill fullscreen-pill ${isAnyFullscreen ? 'active' : ''}`}
              title="Enter Horizontal Fullscreen Mode"
            >
              {isAnyFullscreen ? (
                <Minimize2 size={14} className="action-pill-icon text-amber-400" />
              ) : (
                <Maximize2 size={14} className="action-pill-icon text-blue-400" />
              )}
              <span>{isAnyFullscreen ? 'Exit' : 'Landscape'}</span>
            </button>

            <a
              href={`https://www.youtube.com/watch?v=${effectiveVideo.id}`}
              target="_blank"
              rel="noreferrer noopener"
              className="player-action-pill"
              title="Watch directly on YouTube"
            >
              <ExternalLink size={14} className="action-pill-icon text-slate-400" />
              <span>YouTube</span>
            </a>
          </div>
        </div>

        {/* Clean Taxonomy & Feature Tags */}
        <div className="player-tags-row">
          <div className="player-tag-pill" style={{ '--tag-color': subjectMeta.color }}>
            <span className="tag-dot" style={{ backgroundColor: subjectMeta.color }}></span>
            <span>{subjectMeta.name}</span>
          </div>

          {shouldShowSubtopic && (
            <span className="player-tag-subtopic">{effectiveVideo.subtopic}</span>
          )}

          {effectiveVideo.gateWeightage && (
            <span className="player-tag-gate">
              <Award size={13} className="text-amber-400" />
              <span>{effectiveVideo.gateWeightage}</span>
            </span>
          )}

          <span className="player-adshield-pill">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>AdShield Protected</span>
          </span>
        </div>

        {/* Collapsible Key Takeaways Card */}
        {effectiveVideo.keyTakeaways && effectiveVideo.keyTakeaways.length > 0 && (
          <div className="takeaways-card">
            <div 
              className="takeaways-header"
              onClick={() => setShowTakeaways(!showTakeaways)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowTakeaways(!showTakeaways);
                }
              }}
            >
              <div className="takeaways-title-group">
                <CheckCircle2 size={16} className="takeaways-header-icon" />
                <span className="takeaways-header-title">
                  Core Exam Concepts & Key Takeaways ({effectiveVideo.keyTakeaways.length})
                </span>
              </div>
              <button 
                className="takeaways-toggle" 
                aria-label="Toggle takeaways"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTakeaways(!showTakeaways);
                }}
              >
                {showTakeaways ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {showTakeaways && (
              <ul className="takeaways-list">
                {effectiveVideo.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="takeaway-item">
                    <span className="takeaway-bullet">✓</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Clean Video Description */}
        {effectiveVideo.description && (
          <div className="video-description-box">
            <p className="description-text">{effectiveVideo.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
