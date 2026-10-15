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
  CheckCircle2,
  Brain,
  Cloud,
  ShieldCheck,
  BarChart3,
  Globe,
  Smartphone,
  Terminal,
  Coins,
  ArrowUpDown,
  SlidersHorizontal,
  List,
  LayoutGrid
} from 'lucide-react';
import { CS_SUBJECTS } from '../data/csCatalog';
import { sortAndFilterVideos } from '../services/youtubeService';
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
  Flame,
  Brain,
  Cloud,
  ShieldCheck,
  BarChart3,
  Globe,
  Smartphone,
  Terminal,
  Coins
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
  streamPage = 1,
  onOpenMenu
}) {
  const [sortBy, setSortBy] = React.useState('popular');
  const [durationFilter, setDurationFilter] = React.useState('all');
  const [viewMode, setViewMode] = React.useState('grid');

  const activeSubjectObj = CS_SUBJECTS.find(s => s.id === selectedSubject);
  const activeSubjectName = activeSubjectObj ? activeSubjectObj.name : 'All CS Subjects';

  const displayedVideos = React.useMemo(() => {
    return sortAndFilterVideos(videos, { sortBy, durationFilter });
  }, [videos, sortBy, durationFilter]);

  return (
    <div className="catalog-container">
      {/* Floating Live Update Notification Toast */}
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

      {/* Active Filter or Search Status Banner - Clean & Uncluttered */}
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
              <span className="font-semibold text-slate-100">
                {feedMode === 'popular'
                  ? `Popular CS Masterclasses - ${activeSubjectName}`
                  : feedMode === 'live'
                  ? `Live YouTube Stream - ${activeSubjectName}`
                  : `${activeSubjectName} - Complete YouTube Curriculum`}
              </span>
              <span className="count-badge">{displayedVideos.length} Available Videos</span>

              {/* Dynamic live fetching indicator */}
              {isSubjectLoading && (
                <span className="subject-syncing-badge">
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                  <span>Fetching live YouTube videos...</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Clean Mode & Menu Pill on the right */}
        {feedMode !== 'curated' && onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="feed-mode-indicator-chip"
            title="Active Feed Mode - Tap to adjust in menu"
          >
            {feedMode === 'popular' ? (
              <Flame className="w-3 h-3 text-amber-400" />
            ) : (
              <Radio className="w-3 h-3 text-emerald-400" />
            )}
            <span>{feedMode === 'popular' ? 'Popular Mode' : 'Live Stream'}</span>
          </button>
        )}
      </div>

      {/* Sleek Industry-Standard Sort & Filter Toolbar */}
      <div className="catalog-toolbar">
        {/* Sort Options Group */}
        <div className="toolbar-sort-group">
          <span className="toolbar-label">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <span>Sort:</span>
          </span>
          <div className="toolbar-pills-row">
            <button
              onClick={() => setSortBy('popular')}
              className={`toolbar-pill ${sortBy === 'popular' ? 'active' : ''}`}
              title="Sort by most viewed YouTube videos"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Most Viewed</span>
            </button>
            <button
              onClick={() => setSortBy('longest')}
              className={`toolbar-pill ${sortBy === 'longest' ? 'active' : ''}`}
              title="Sort by full courses and longest lectures first"
            >
              <Clock className="w-3 h-3 text-blue-400" />
              <span>Full Courses</span>
            </button>
            <button
              onClick={() => setSortBy('shortest')}
              className={`toolbar-pill ${sortBy === 'shortest' ? 'active' : ''}`}
              title="Sort by quick concept tutorials"
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Quick Concepts</span>
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`toolbar-pill ${sortBy === 'newest' ? 'active' : ''}`}
              title="Sort by newest uploads"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Newest First</span>
            </button>
            <button
              onClick={() => setSortBy('relevant')}
              className={`toolbar-pill ${sortBy === 'relevant' ? 'active' : ''}`}
              title="Sort by core curriculum & exam yield"
            >
              <Award className="w-3 h-3 text-cyan-400" />
              <span>Syllabus Order</span>
            </button>
          </div>
        </div>

        {/* Right Controls: Duration Filter & View Mode */}
        <div className="toolbar-right-group">
          <div className="duration-filter-pills">
            <button
              onClick={() => setDurationFilter('all')}
              className={`duration-pill ${durationFilter === 'all' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setDurationFilter('course')}
              className={`duration-pill ${durationFilter === 'course' ? 'active' : ''}`}
              title="Full courses longer than 1 hour"
            >
              &gt; 1h
            </button>
            <button
              onClick={() => setDurationFilter('lecture')}
              className={`duration-pill ${durationFilter === 'lecture' ? 'active' : ''}`}
              title="Lectures between 20 and 60 minutes"
            >
              20-60m
            </button>
            <button
              onClick={() => setDurationFilter('quick')}
              className={`duration-pill ${durationFilter === 'quick' ? 'active' : ''}`}
              title="Quick lessons under 20 minutes"
            >
              &lt; 20m
            </button>
          </div>

          <div className="view-mode-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
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
      ) : displayedVideos.length === 0 ? (
        <div className="empty-catalog-state">
          <Search className="w-8 h-8 text-slate-500 mb-2" />
          <h3 className="text-sm font-semibold text-slate-300">No CS Lectures Matched</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            No videos matched the current duration filter. Click Reset Filters or pull more real-time videos from YouTube.
          </p>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setDurationFilter('all')} className="pill-btn primary">
              Show All Durations
            </button>
            <button onClick={onContinueUpdate} className="pill-btn">
              Load More From YouTube
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={`video-cards-grid ${viewMode === 'list' ? 'is-list-view' : ''}`}>
            {displayedVideos.map((video) => {
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

          {/* Streamlined Compact Load More Section */}
          <div className="load-more-section">
            <button
              id="btn-continue-update"
              onClick={onContinueUpdate}
              disabled={isContinueLoading}
              className={`load-more-pill-btn ${isContinueLoading ? 'loading' : ''}`}
              title="Load more computer science lectures for this subject"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isContinueLoading ? 'animate-spin' : ''}`} />
              <span>
                {isContinueLoading 
                  ? `Loading Page ${streamPage + 1}...` 
                  : `Load More Lectures · Page ${streamPage + 1}`}
              </span>
            </button>

            <span className="load-more-counter">
              Showing {videos.length} Lectures
            </span>

            {updateNotification && (
              <div className="stream-update-alert compact">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{updateNotification}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
