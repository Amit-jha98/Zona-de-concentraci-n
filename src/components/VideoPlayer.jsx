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
  Sparkles
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

  return (
    <div className={`video-player-wrapper ${isFocusMode ? 'focus-mode' : ''}`}>
      {/* 16:9 Aspect Ratio IFrame Container with AdShield Privacy Sandbox */}
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

        {/* Subtle Watermark Badge inside frame showing AdShield status */}
        <div className="player-shield-watermark" aria-hidden="true">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>{useStandardEmbed ? 'Direct Embed Mode' : 'AdShield Clean Stream'}</span>
        </div>
      </div>

      {/* Video Details & Meta Header */}
      <div className="player-metadata-panel">
        <div className="player-title-row">
          <h1 className="player-video-title">{video.title}</h1>
          
          <div className="player-quick-actions">
            <button
              onClick={() => onToggleBookmark(video)}
              className={`pill-btn ${isBookmarked ? 'bookmarked' : ''}`}
              title={isBookmarked ? 'Remove Bookmark' : 'Save for Revision'}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Bookmark</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenNotes}
              className="pill-btn primary"
              title="Open Lecture Notes Drawer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Study Notes</span>
            </button>

            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noreferrer noopener"
              className="pill-btn"
              title="Watch directly on YouTube (if embed is restricted)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>YouTube</span>
            </a>

            <button
              onClick={handleShare}
              className="pill-btn icon-only"
              title="Copy YouTube Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Taxonomy Badges */}
        <div className="player-badges-strip">
          <div className="badge-subject" style={{ borderColor: subjectMeta.color }}>
            <span className="badge-dot" style={{ backgroundColor: subjectMeta.color }}></span>
            <span>{subjectMeta.name}</span>
          </div>

          {video.subtopic && (
            <span className="badge-subtopic">{video.subtopic}</span>
          )}

          {video.gateWeightage && (
            <span className="badge-gate">
              <Award className="w-3 h-3 text-amber-400" />
              <span>GATE: {video.gateWeightage}</span>
            </span>
          )}

          <span className="badge-channel">
            <span>By {video.channel}</span>
          </span>

          {video.duration && (
            <span className="badge-duration">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{video.duration}</span>
            </span>
          )}
        </div>

        {/* Collapsible Key Takeaways & Revision Notes Card */}
        {video.keyTakeaways && video.keyTakeaways.length > 0 && (
          <div className="takeaways-card">
            <div 
              className="takeaways-header"
              onClick={() => setShowTakeaways(!showTakeaways)}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-xs text-slate-200">
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
                    <span className="takeaway-bullet">›</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Video Description */}
        {video.description && (
          <div className="video-description-box">
            <p className="description-text">{video.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
