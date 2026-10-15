import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { buildAdFreeEmbedUrl } from '../services/adBlockerService';
import { CS_SUBJECTS } from '../data/csCatalog';

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

  if (!video) {
    return (
      <div className="player-empty-state">
        <p className="text-secondary">Select an educational lecture to begin playback.</p>
      </div>
    );
  }

  const embedUrl = buildAdFreeEmbedUrl(video.id, { autoplay: 1, useStandardEmbed });
  const subjectMeta = CS_SUBJECTS.find(s => s.id === video.subject) || {
    name: 'Computer Science',
    color: '#3b82f6'
  };

  const handleShare = () => {
    const url = `https://youtube.com/watch?v=${video.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getChannelInitials = (name = '') => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase() || 'CS';
  };

  return (
    <div className={`video-player-wrapper ${isFocusMode ? 'focus-mode' : ''}`}>
      {/* 16:9 Aspect Ratio IFrame Container - Clean with NO overlapping overlays */}
      <div className="player-aspect-frame">
        <iframe
          key={`${video.id}-${useStandardEmbed}`}
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="player-iframe"
          loading="eager"
        ></iframe>
      </div>

      {/* Video Details & Modern Clutter-Free Meta Header */}
      <div className="player-metadata-panel">
        <h1 className="player-video-title">{video.title}</h1>

        {/* Unified Channel & Action Bar (Clean single-row UX on desktop & mobile) */}
        <div className="player-channel-bar">
          <div className="player-channel-info">
            <div className="channel-avatar-circle">
              {getChannelInitials(video.channel)}
            </div>
            <div className="channel-text-col">
              <div className="channel-name-row">
                <span className="channel-name">{video.channel}</span>
                <span className="verified-check" title="Verified Educator">✓</span>
              </div>
              <div className="channel-meta-sub">
                <span>{video.views || 'Active'}</span>
                {video.duration && <span>• {video.duration}</span>}
                {video.year && <span>• {video.year}</span>}
              </div>
            </div>
          </div>

          {/* Action buttons in a unified horizontal pill strip */}
          <div className="player-actions-strip">
            <button
              onClick={() => onToggleBookmark(video)}
              className={`player-action-pill ${isBookmarked ? 'saved' : ''}`}
              title={isBookmarked ? 'Remove Bookmark' : 'Save for Revision'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={onOpenNotes}
              className="player-action-pill notes"
              title="Open Lecture Notes Drawer"
            >
              <FileEdit className="w-3.5 h-3.5 text-emerald-400" />
              <span>Notes</span>
            </button>

            <button
              onClick={handleShare}
              className="player-action-pill"
              title="Copy YouTube Link"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noreferrer noopener"
              className="player-action-pill"
              title="Watch directly on YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
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

          {video.subtopic && (
            <span className="player-tag-subtopic">{video.subtopic}</span>
          )}

          {video.gateWeightage && (
            <span className="player-tag-gate">
              <Award className="w-3 h-3 text-amber-400" />
              <span>{video.gateWeightage}</span>
            </span>
          )}

          <span className="player-adshield-pill">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>AdShield Protected</span>
          </span>
        </div>

        {/* Collapsible Key Takeaways Card */}
        {video.keyTakeaways && video.keyTakeaways.length > 0 && (
          <div className="takeaways-card">
            <div 
              className="takeaways-header"
              onClick={() => setShowTakeaways(!showTakeaways)}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-xs text-slate-200">
                  Core Exam Concepts & Key Takeaways ({video.keyTakeaways.length})
                </span>
              </div>
              <button className="takeaways-toggle" aria-label="Toggle takeaways">
                {showTakeaways ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showTakeaways && (
              <ul className="takeaways-list">
                {video.keyTakeaways.map((takeaway, idx) => (
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
        {video.description && (
          <div className="video-description-box">
            <p className="description-text">{video.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
