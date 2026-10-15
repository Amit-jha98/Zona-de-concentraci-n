import React, { useState, useMemo } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Flame, 
  Radio, 
  History, 
  Bookmark, 
  Award, 
  Sparkles,
  Search,
  LayoutGrid,
  List
} from 'lucide-react';
import { CS_SUBJECTS, EDUCATIONAL_VIDEOS } from '../data/csCatalog';
import { getStrictRelatedVideos } from '../services/recommendationEngine';

// Mapping channel names to distinct color gradients and initials
const CHANNEL_MAP = {
  'Abdul Bari': { initials: 'AB', bg: 'linear-gradient(135deg, #059669, #10b981)' },
  'Gate Smashers': { initials: 'GS', bg: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
  'take U forward': { initials: 'TF', bg: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
  'NeetCode': { initials: 'NC', bg: 'linear-gradient(135deg, #0891b2, #06b6d4)' },
  'MIT OpenCourseWare': { initials: 'MIT', bg: 'linear-gradient(135deg, #db2777, #ec4899)' },
  'freeCodeCamp.org': { initials: 'FCC', bg: 'linear-gradient(135deg, #d97706, #f59e0b)' },
  'freeCodeCamp': { initials: 'FCC', bg: 'linear-gradient(135deg, #d97706, #f59e0b)' },
  'NPTEL': { initials: 'IIT', bg: 'linear-gradient(135deg, #dc2626, #ef4444)' }
};

function getChannelBadge(channelName = '') {
  for (const [key, val] of Object.entries(CHANNEL_MAP)) {
    if (channelName.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }
  const words = channelName.trim().split(/\s+/);
  const initials = words.length >= 2 
    ? (words[0][0] + words[1][0]).toUpperCase() 
    : channelName.slice(0, 2).toUpperCase() || 'CS';
  return { initials, bg: 'linear-gradient(135deg, #374151, #4b5563)' };
}

// Category filter chips for YouTube header
const FILTER_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'ai-ml', label: 'AI & ML' },
  { id: 'cloud-computing', label: 'Cloud & DevOps' },
  { id: 'cyber-security', label: 'Cyber Security' },
  { id: 'data-science', label: 'Data Science' },
  { id: 'web-dev', label: 'Web Dev' },
  { id: 'mobile-dev', label: 'Mobile Dev' },
  { id: 'software-engineering', label: 'Software Eng' },
  { id: 'blockchain', label: 'Blockchain' },
  { id: 'gate-special', label: 'GATE High-Yield' },
  { id: 'algorithms', label: 'Algorithms & DS' },
  { id: 'os', label: 'Operating Systems' },
  { id: 'networks', label: 'Computer Networks' },
  { id: 'dbms', label: 'Database Systems' },
  { id: 'toc', label: 'Theory of Computation' },
  { id: 'coa', label: 'Computer Organization' },
  { id: 'discrete-math', label: 'Discrete Mathematics' },
  { id: 'abdul-bari', label: 'Abdul Bari' },
  { id: 'gate-smashers', label: 'Gate Smashers' },
  { id: 'striver', label: 'take U forward' },
  { id: 'neetcode', label: 'NeetCode' },
  { id: 'mit', label: 'MIT OCW' },
  { id: 'freecodecamp', label: 'freeCodeCamp' }
];

export default function HomePage({
  videos = EDUCATIONAL_VIDEOS,
  history = [],
  bookmarks = [],
  onSelectVideo,
  onOpenCatalog,
  onOpenSyllabus,
  onSearch
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('edubrowse_home_view_mode') || 'grid';
    } catch {
      return 'grid';
    }
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('edubrowse_home_view_mode', mode);
    } catch {
      // ignore localStorage errors
    }
  };

  // Filter video suggestions based on selected filter chip
  const filteredVideos = useMemo(() => {
    if (selectedFilter === 'all') {
      // If user has watch history, generate personalized suggestions based on their recent interests
      if (history.length > 0) {
        const lastWatched = history[0];
        const related = getStrictRelatedVideos(lastWatched, videos, 12);
        const relatedIds = new Set(related.map(v => v.id));
        const rest = videos.filter(v => !relatedIds.has(v.id) && v.id !== lastWatched.id);
        return [...related, ...rest];
      }
      return videos;
    }

    if (selectedFilter === 'gate-special') {
      return videos.filter(v => v.gateWeightage && v.gateWeightage.includes('High'));
    }

    if (selectedFilter === 'abdul-bari') {
      return videos.filter(v => (v.channel || '').toLowerCase().includes('abdul bari'));
    }

    if (selectedFilter === 'gate-smashers') {
      return videos.filter(v => (v.channel || '').toLowerCase().includes('gate smashers'));
    }

    if (selectedFilter === 'striver') {
      return videos.filter(v => (v.channel || '').toLowerCase().includes('take u forward'));
    }

    if (selectedFilter === 'neetcode') {
      return videos.filter(v => (v.channel || '').toLowerCase().includes('neetcode'));
    }

    if (selectedFilter === 'mit') {
      return videos.filter(v => (v.channel || '').toLowerCase().includes('mit'));
    }

    if (selectedFilter === 'freecodecamp') {
      return videos.filter(v => (v.channel || '').toLowerCase().includes('freecodecamp'));
    }

    // Default to subject match
    return videos.filter(v => v.subject === selectedFilter);
  }, [selectedFilter, videos, history]);

  // Distinct recent watch history items (up to 4)
  const recentHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    const seen = new Set();
    const unique = [];
    for (const v of history) {
      if (!seen.has(v.id)) {
        seen.add(v.id);
        unique.push(v);
        if (unique.length >= 4) break;
      }
    }
    return unique;
  }, [history]);

  return (
    <div className="yt-home-container">
      {/* 1. YouTube Category Filter Pills Bar */}
      <div className="yt-filter-bar">
        <div className="yt-filter-scroll">
          {FILTER_CHIPS.map((chip) => {
            const isActive = selectedFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setSelectedFilter(chip.id)}
                className={`yt-filter-pill ${isActive ? 'active' : ''}`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. "Jump back in" / Continue Watching Shelf (Only if user has history) */}
      {selectedFilter === 'all' && recentHistory.length > 0 && (
        <section className="yt-shelf-section">
          <div className="yt-shelf-header">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-red-500" />
              <h2 className="yt-shelf-title">Jump back in</h2>
            </div>
            <span className="yt-shelf-subtitle">Continue from your recent lectures</span>
          </div>

          <div className="yt-continue-grid">
            {recentHistory.map((video) => {
              const badge = getChannelBadge(video.channel);
              const subjectMeta = CS_SUBJECTS.find(s => s.id === video.subject) || {
                color: '#3b82f6',
                shortName: 'CS'
              };

              return (
                <div
                  key={`history-${video.id}`}
                  onClick={() => onSelectVideo(video)}
                  className="yt-continue-card"
                  role="button"
                  tabIndex={0}
                >
                  <div className="yt-thumb-wrap">
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      className="yt-thumb-img"
                      loading="lazy"
                    />
                    <span className="yt-duration-badge">{video.duration || '18:42'}</span>

                    {/* Progress bar across bottom of thumbnail */}
                    <div className="yt-watch-progress-track">
                      <div className="yt-watch-progress-fill" style={{ width: '65%' }}></div>
                    </div>

                    <div className="yt-thumb-overlay">
                      <div className="yt-play-btn-circle">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="yt-card-content">
                    <h3 className="yt-video-title" title={video.title}>{video.title}</h3>
                    <div className="yt-channel-line">
                      <span>{video.channel}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                    <span className="yt-resume-tag">Resume playback</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Main YouTube Video Grid Suggestions */}
      <section className="yt-feed-section">
        <div className="yt-feed-header">
          <div className="yt-feed-title-wrap">
            <h2 className="yt-feed-title">
              {selectedFilter === 'all' 
                ? (history.length > 0 ? 'Recommended for you' : 'Curated CS Lectures & Masterclasses')
                : FILTER_CHIPS.find(c => c.id === selectedFilter)?.label || 'Video Suggestions'}
            </h2>
            <span className="yt-feed-count">{filteredVideos.length} videos</span>
          </div>

          <div className="yt-view-toggle" role="group" aria-label="Layout View Mode">
            <button
              type="button"
              className={`yt-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('grid')}
              title="Grid View (Compact)"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className={`yt-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('list')}
              title="List View (Dense)"
              aria-label="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className={`yt-videos-grid ${viewMode === 'list' ? 'is-list-view' : ''}`}>
          {filteredVideos.map((video) => {
            const badge = getChannelBadge(video.channel);
            const subjectMeta = CS_SUBJECTS.find(s => s.id === video.subject) || {
              color: '#3b82f6',
              shortName: 'CS'
            };
            const isHighYield = video.gateWeightage && video.gateWeightage.includes('High');

            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="yt-video-card"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectVideo(video);
                  }
                }}
              >
                {/* 16:9 Thumbnail */}
                <div className="yt-thumb-wrap">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    className="yt-thumb-img"
                    loading="lazy"
                  />
                  <span className="yt-duration-badge">{video.duration || '20:00'}</span>

                  {/* GATE High-Yield Badge on Thumbnail */}
                  {isHighYield && (
                    <div className="yt-thumb-gate-badge">
                      <Award className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="yt-badge-text-full">{video.gateWeightage}</span>
                      <span className="yt-badge-text-short">High Yield</span>
                    </div>
                  )}

                  {/* Subject Tag */}
                  <span 
                    className="yt-thumb-subj-badge" 
                    style={{ borderColor: subjectMeta.color }}
                  >
                    <span className="dot" style={{ backgroundColor: subjectMeta.color }}></span>
                    {subjectMeta.shortName}
                  </span>

                  {/* Play Overlay */}
                  <div className="yt-thumb-overlay">
                    <div className="yt-play-btn-circle">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Video Info: Avatar + Details */}
                <div className="yt-card-details">
                  <div 
                    className="yt-channel-avatar" 
                    style={{ background: badge.bg }}
                    title={video.channel}
                  >
                    {badge.initials}
                  </div>

                  <div className="yt-card-meta">
                    <h3 className="yt-video-title" title={video.title}>
                      {video.title}
                    </h3>

                    <div className="yt-channel-line">
                      <span className="yt-channel-name">{video.channel}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>

                    <div className="yt-meta-row">
                      <span>{video.views || '1.2M views'}</span>
                      <span className="yt-meta-dot">•</span>
                      <span>Verified Curriculum</span>
                    </div>

                    {/* Single key takeaway chip */}
                    {video.keyTakeaways && video.keyTakeaways.length > 0 && (
                      <div className="yt-card-takeaway">
                        <span>{video.keyTakeaways[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
