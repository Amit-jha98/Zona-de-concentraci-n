import React from 'react';
import { 
  Play, 
  Award, 
  Clock, 
  Eye, 
  Search, 
  BookOpen, 
  Layers, 
  Sparkles, 
  Cpu, 
  Database, 
  Network, 
  Code2, 
  Boxes, 
  GitBranch, 
  Sigma, 
  Binary, 
  Workflow, 
  Briefcase,
  MessageSquareCode,
  Flame,
  Radio,
  RefreshCw,
  X,
  ExternalLink,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { CS_SUBJECTS } from '../data/csCatalog';
import VideoThumbnail from './VideoThumbnail';

const ICON_MAP = {
  Layers,
  Award,
  GitBranch,
  Cpu,
  Database,
  Network,
  Boxes,
  Code2,
  Server: Cpu,
  Sigma,
  Binary,
  Workflow,
  Briefcase,
  MessageSquareCode,
  Flame
};

export default function VideoGrid({
  videos = [],
  selectedSubject = 'all',
  onSelectSubject,
  searchQuery = '',
  onClearSearch,
  onSelectVideo,
  onOpenSyllabus,
  feedMode = 'curated', // 'curated' | 'popular' | 'live'
  onToggleFeedMode,
  isLiveLoading = false,
  isSubjectLoading = false,
  onRefreshLive,
  isSearchingLive = false,
  onToggleSearchLive,
  autoUpdateEnabled = true,
  onToggleAutoUpdate,
  updateNotification = null,
  onContinueUpdate,
  isContinueLoading = false,
  streamPage = 1
}) {
  const activeSubjectObj = CS_SUBJECTS.find(s => s.id === selectedSubject);
  const activeSubjectName = activeSubjectObj ? activeSubjectObj.name : 'All CS Subjects';

  return (
    <div className="catalog-container">
      {/* Feed Mode Switcher (Curated Curriculum vs Popular CS Videos vs Live YouTube Feed) */}
      <div className="feed-mode-switcher-bar">
        <div className="feed-mode-toggle-group">
          {/* 1. Core CS Curriculum */}
          <button
            onClick={() => onToggleFeedMode('curated')}
            className={`feed-mode-btn ${feedMode === 'curated' ? 'active' : ''}`}
            title="Curated, vetted CS and GATE curriculum syllabus"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Core CS Curriculum</span>
          </button>

          {/* 2. Popular CS Videos */}
          <button
            onClick={() => onToggleFeedMode('popular')}
            className={`feed-mode-btn ${feedMode === 'popular' ? 'active' : ''}`}
            title="Top viewed, viral masterclasses and legendary CS courses across YouTube"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Popular CS Videos</span>
            <span className="popular-hot-tag">Hot</span>
          </button>

          {/* 3. Live YouTube Feed (New Uploads) */}
          <button
            onClick={() => onToggleFeedMode('live')}
            className={`feed-mode-btn ${feedMode === 'live' ? 'active' : ''}`}
            title="Real-time live feed of latest uploads from top CS channels"
          >
            <span className="live-pulse-dot"></span>
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Live YouTube Feed (New Uploads)</span>
          </button>
        </div>

        {/* Right Action Controls: Auto-Update & Refresh */}
        <div className="feed-controls-right">
          <button
            onClick={onToggleAutoUpdate}
            className={`feed-autoupdate-btn ${autoUpdateEnabled ? 'active' : ''}`}
            title={autoUpdateEnabled ? 'Auto-Update is ON (Checks YouTube channels every 45s)' : 'Auto-Update is paused'}
          >
            <Zap className={`w-3.5 h-3.5 ${autoUpdateEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Auto-Update: {autoUpdateEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={onRefreshLive}
            disabled={isLiveLoading || isSubjectLoading}
            className="feed-refresh-btn"
            title="Fetch latest updates from YouTube now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveLoading || isSubjectLoading ? 'animate-spin' : ''}`} />
            <span>{isLiveLoading || isSubjectLoading ? 'Syncing...' : 'Check New Uploads'}</span>
          </button>
        </div>
      </div>

      {/* Floating Auto-Update Notification Banner */}
      {updateNotification && (
        <div className="live-update-toast">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{updateNotification}</span>
        </div>
      )}

      {/* Subject Filter Pills Bar */}
      <div className="subject-pills-bar">
        {CS_SUBJECTS.map((subject) => {
          const IconComponent = ICON_MAP[subject.icon] || Layers;
          const isActive = selectedSubject === subject.id;

          return (
            <button
              key={subject.id}
              onClick={() => onSelectSubject(subject.id)}
              className={`subject-pill ${isActive ? 'active' : ''}`}
              style={{
                '--pill-accent': subject.color
              }}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{subject.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Active Filter or Search Status Banner */}
      <div className="catalog-status-bar">
        <div className="flex items-center gap-2 flex-wrap">
          {searchQuery ? (
            <div className="search-status-tag">
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>Results for: <strong>"{searchQuery}"</strong></span>
              <button onClick={onClearSearch} className="clear-search-btn" title="Clear Search">
                <X className="w-3 h-3" />
              </button>

              {/* Toggle Live YouTube Search */}
              <button
                onClick={onToggleSearchLive}
                className={`search-live-chip ${isSearchingLive ? 'active' : ''}`}
                title="Search entire YouTube live with CS filter"
              >
                <Radio className="w-3 h-3 text-emerald-400" />
                <span>{isSearchingLive ? 'Live YouTube Search' : 'Search Live on YouTube'}</span>
              </button>
            </div>
          ) : (
            <div className="subject-headline">
              <span className="font-medium text-slate-200">
                {feedMode === 'popular'
                  ? `🔥 Popular CS Masterclasses • ${activeSubjectName}`
                  : feedMode === 'live'
                  ? `⚡ Live YouTube Stream • ${activeSubjectName}`
                  : `${activeSubjectName} • Core CS Curriculum`}
              </span>
              <span className="count-badge">{videos.length} Lectures</span>

              {/* Dynamic live fetching indicator */}
              {isSubjectLoading && (
                <span className="subject-syncing-badge">
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                  <span>Syncing live YouTube videos...</span>
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onOpenSyllabus}
          className="syllabus-cta-btn"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive GATE Syllabus Checklist</span>
        </button>
      </div>

      {/* Video Grid Cards */}
      {isLiveLoading ? (
        <div className="empty-catalog-state">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">Syncing with YouTube Channels...</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Fetching the freshest uploads from Gate Smashers, Striver, NeetCode, freeCodeCamp, and MIT OpenCourseWare.
          </p>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-catalog-state">
          <Search className="w-8 h-8 text-slate-500 mb-2" />
          <h3 className="text-sm font-semibold text-slate-300">No CS Lectures Matched</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Try a different filter or click Continue Updating to pull real-time videos from YouTube.
          </p>
          <div className="flex gap-2 mt-4">
            <button onClick={onContinueUpdate} className="pill-btn primary">
              ⚡ Fetch from YouTube
            </button>
            <button onClick={onClearSearch} className="pill-btn">
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="video-cards-grid">
            {videos.map((video) => {
              const subject = CS_SUBJECTS.find(s => s.id === video.subject) || {
                color: '#3b82f6',
                shortName: 'CS'
              };
              const isHighYield = video.gateWeightage && video.gateWeightage.includes('High');
              const isNewUpload = video.tags?.includes('new-upload');
              const isPopular = video.tags?.includes('popular') || feedMode === 'popular';

              return (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo(video)}
                  className="video-card"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectVideo(video);
                    }
                  }}
                >
                  {/* Thumbnail with Overlay & Badges */}
                  <div className="video-card-thumb">
                    <VideoThumbnail 
                      videoId={video.id} 
                      title={video.title} 
                      duration={video.duration} 
                      subjectColor={subject.color} 
                    />

                    {/* Subject Tag */}
                    <span 
                      className="card-subject-badge" 
                      style={{ borderColor: subject.color }}
                    >
                      <span className="dot" style={{ backgroundColor: subject.color }}></span>
                      {subject.shortName}
                    </span>

                    {/* Popular Tag or Live New Upload Badge */}
                    {isNewUpload ? (
                      <span className="card-live-badge">
                        <span className="live-pulse-dot small"></span>
                        NEW
                      </span>
                    ) : isPopular ? (
                      <span className="card-popular-badge">
                        <Flame className="w-2.5 h-2.5 text-amber-400" />
                        POPULAR
                      </span>
                    ) : null}
                  </div>

                  {/* Card Content Details */}
                  <div className="video-card-body">
                    {/* GATE High-Yield or Career Tag */}
                    {isHighYield && (
                      <div className="card-gate-tag">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>{video.gateWeightage}</span>
                      </div>
                    )}

                    <h3 className="card-title" title={video.title}>
                      {video.title}
                    </h3>

                    <div className="card-author-row">
                      <span className="author-name">{video.channel}</span>
                      <span className="author-dot">•</span>
                      <span className="card-views">{video.views || video.duration}</span>
                    </div>

                    {/* Short takeaways preview */}
                    {video.keyTakeaways && video.keyTakeaways.length > 0 && (
                      <div className="card-takeaway-preview">
                        <span className="takeaway-chip">
                          {video.keyTakeaways[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Update / Continuous Load More Stream Bar */}
          <div className="continue-update-stream-container">
            <div className="continue-stream-stats">
              <span className="stats-dot"></span>
              <span>Showing <strong>{videos.length} Lectures</strong> across <strong>Page {streamPage}</strong></span>
            </div>

            <button
              id="btn-continue-update"
              onClick={onContinueUpdate}
              disabled={isContinueLoading}
              className={`continue-update-btn ${isContinueLoading ? 'loading' : ''}`}
              title="Continuously fetch and update the feed with more YouTube CS lectures"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${isContinueLoading ? 'animate-spin' : ''}`} />
              <span>
                {isContinueLoading 
                  ? `Syncing Page ${streamPage + 1} with YouTube...` 
                  : '⚡ Continue Updating • Load More CS Videos'}
              </span>
              <span className="page-counter-badge">
                {isContinueLoading ? 'Loading...' : `Page ${streamPage}`}
              </span>
            </button>

            {updateNotification && (
              <div className="stream-update-alert">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{updateNotification}</span>
              </div>
            )}

            <p className="continue-update-subtext">
              Continuous live stream active • Real-time YouTube educational sync with AdShield privacy protection
            </p>
          </div>
        </>
      )}
    </div>
  );
}
