import React from 'react';
import { 
  X, 
  Home, 
  LayoutGrid, 
  BookOpen, 
  Bookmark, 
  History, 
  Flame, 
  Radio, 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  Settings, 
  Maximize2, 
  Minimize2, 
  ExternalLink,
  GraduationCap,
  Brain,
  Cloud,
  BarChart3,
  Globe,
  Smartphone,
  Terminal,
  Coins,
  Cpu,
  Database,
  Network,
  Award,
  GitBranch,
  Boxes,
  Code2,
  Sigma,
  Binary,
  Workflow,
  Briefcase,
  MessageSquareCode
} from 'lucide-react';
import { getAdShieldStats } from '../services/adBlockerService';
import { CS_SUBJECTS } from '../data/csCatalog';

const SIDEBAR_ICON_MAP = {
  Brain,
  Cloud,
  ShieldCheck,
  BarChart3,
  Globe,
  Smartphone,
  Terminal,
  Coins,
  Cpu,
  Database,
  Network,
  Award,
  GitBranch,
  Boxes,
  Code2,
  Sigma,
  Binary,
  Workflow,
  Briefcase,
  MessageSquareCode,
  Flame,
  Layers: LayoutGrid
};

export default function AppSidebar({
  isOpen,
  onClose,
  activeTabType,
  onNavigateHome,
  onNavigateCatalog,
  onOpenSyllabus,
  onOpenBookmarks,
  onOpenSettings,
  bookmarkCount = 0,
  feedMode = 'curated',
  onToggleFeedMode,
  autoUpdateEnabled = true,
  onToggleAutoUpdate,
  onRefreshLive,
  isLiveLoading = false,
  isFocusMode = false,
  onToggleFocusMode
}) {
  const adStats = getAdShieldStats();

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <aside 
        className="app-sidebar-panel" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Header */}
        <div className="app-sidebar-header">
          <div className="flex items-center gap-2.5">
            <div className="app-logo-badge">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="app-sidebar-brand">EduBrowse CS</h2>
              <span className="app-sidebar-tagline">Distraction-Free CS Platform</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="app-sidebar-close-btn"
            title="Close Menu"
            aria-label="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="app-sidebar-scrollable">
          {/* Section 1: Main Navigation */}
          <div className="sidebar-group">
            <span className="sidebar-group-title">Navigation</span>
            <div className="sidebar-nav-list">
              <button
                onClick={() => {
                  onNavigateHome();
                  onClose();
                }}
                className={`sidebar-nav-item ${activeTabType === 'home' ? 'active' : ''}`}
              >
                <Home className="w-4 h-4 text-blue-400" />
                <span className="sidebar-nav-label">Home Start Page</span>
              </button>

              <button
                onClick={() => {
                  onNavigateCatalog('all');
                  onClose();
                }}
                className={`sidebar-nav-item ${activeTabType === 'catalog' ? 'active' : ''}`}
              >
                <LayoutGrid className="w-4 h-4 text-emerald-400" />
                <span className="sidebar-nav-label">CS & GATE Catalog</span>
              </button>

              <button
                onClick={() => {
                  onOpenSyllabus();
                  onClose();
                }}
                className={`sidebar-nav-item ${activeTabType === 'syllabus' ? 'active' : ''}`}
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="sidebar-nav-label">GATE CS Syllabus Checklist</span>
              </button>

              <button
                onClick={() => {
                  onOpenBookmarks();
                  onClose();
                }}
                className="sidebar-nav-item"
              >
                <div className="flex items-center gap-2.5 flex-1">
                  <Bookmark className="w-4 h-4 text-cyan-400" />
                  <span className="sidebar-nav-label">Study Library & Saved</span>
                </div>
                {bookmarkCount > 0 && (
                  <span className="sidebar-count-badge">{bookmarkCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: CS Domains & Specializations */}
          <div className="sidebar-group">
            <div className="flex items-center justify-between pb-1 mb-1">
              <span className="sidebar-group-title">CS Domains & Tracks</span>
              <span className="text-[10px] text-slate-400 font-mono">{CS_SUBJECTS.length - 1} Tracks</span>
            </div>
            <div className="sidebar-domain-chips">
              {CS_SUBJECTS.filter(s => s.id !== 'all').map((subject) => {
                const IconComponent = SIDEBAR_ICON_MAP[subject.icon] || LayoutGrid;
                return (
                  <button
                    key={subject.id}
                    onClick={() => {
                      onNavigateCatalog(subject.id);
                      onClose();
                    }}
                    className="sidebar-domain-chip"
                    style={{ '--domain-accent': subject.color }}
                  >
                    <IconComponent className="w-3.5 h-3.5" style={{ color: subject.color }} />
                    <span>{subject.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Feed Stream Mode */}
          <div className="sidebar-group">
            <span className="sidebar-group-title">Catalog Stream Mode</span>
            <div className="sidebar-mode-selector">
              <button
                onClick={() => {
                  onToggleFeedMode('curated');
                  onClose();
                }}
                className={`sidebar-mode-option ${feedMode === 'curated' ? 'active' : ''}`}
              >
                <div className="sidebar-mode-icon-box blue">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div className="sidebar-mode-text">
                  <span className="sidebar-mode-name">Core CS Curriculum</span>
                  <span className="sidebar-mode-desc">Vetted, academic GATE syllabus</span>
                </div>
                {feedMode === 'curated' && <div className="active-dot"></div>}
              </button>

              <button
                onClick={() => {
                  onToggleFeedMode('popular');
                  onClose();
                }}
                className={`sidebar-mode-option ${feedMode === 'popular' ? 'active' : ''}`}
              >
                <div className="sidebar-mode-icon-box amber">
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <div className="sidebar-mode-text">
                  <div className="flex items-center gap-1.5">
                    <span className="sidebar-mode-name">Popular Masterclasses</span>
                    <span className="sidebar-hot-badge">Top Rated</span>
                  </div>
                  <span className="sidebar-mode-desc">High-view viral CS courses</span>
                </div>
                {feedMode === 'popular' && <div className="active-dot"></div>}
              </button>

              <button
                onClick={() => {
                  onToggleFeedMode('live');
                  onClose();
                }}
                className={`sidebar-mode-option ${feedMode === 'live' ? 'active' : ''}`}
              >
                <div className="sidebar-mode-icon-box emerald">
                  <Radio className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="sidebar-mode-text">
                  <div className="flex items-center gap-1.5">
                    <span className="sidebar-mode-name">Live YouTube Stream</span>
                    <span className="live-pulse-dot small"></span>
                  </div>
                  <span className="sidebar-mode-desc">Real-time channel uploads</span>
                </div>
                {feedMode === 'live' && <div className="active-dot"></div>}
              </button>
            </div>
          </div>

          {/* Section 3: Live Sync Controls */}
          <div className="sidebar-group">
            <span className="sidebar-group-title">Live Channel Sync</span>
            <div className="sidebar-sync-box">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${autoUpdateEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Auto-Update Channels</div>
                    <div className="text-[11px] text-slate-400">Syncs uploads every 45s</div>
                  </div>
                </div>

                <label className="sidebar-toggle-switch">
                  <input
                    type="checkbox"
                    checked={autoUpdateEnabled}
                    onChange={onToggleAutoUpdate}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <button
                onClick={onRefreshLive}
                disabled={isLiveLoading}
                className="sidebar-sync-now-btn"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLiveLoading ? 'animate-spin' : ''}`} />
                <span>{isLiveLoading ? 'Syncing Channels...' : 'Sync New Uploads Now'}</span>
              </button>
            </div>
          </div>

          {/* Section 4: AdShield Privacy & Distraction Blocker Status */}
          <div className="sidebar-group">
            <span className="sidebar-group-title">AdShield Protection</span>
            <div className="sidebar-shield-card">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-950/40">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">Sandbox Active</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Strict Mode
                </span>
              </div>

              <div className="sidebar-shield-grid">
                <div className="shield-stat-item">
                  <span className="shield-stat-val text-emerald-400">{adStats.adsBlockedCount || 0}</span>
                  <span className="shield-stat-lbl">Ads Blocked</span>
                </div>
                <div className="shield-stat-item">
                  <span className="shield-stat-val text-amber-400">{adStats.clickbaitFilteredCount || 0}</span>
                  <span className="shield-stat-lbl">Clickbait Filtered</span>
                </div>
                <div className="shield-stat-item">
                  <span className="shield-stat-val text-blue-400">{adStats.trackersBlockedCount || 0}</span>
                  <span className="shield-stat-lbl">Trackers Stopped</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: App Preferences & Settings */}
          <div className="sidebar-group">
            <span className="sidebar-group-title">Preferences</span>
            <div className="sidebar-nav-list">
              <button
                onClick={onToggleFocusMode}
                className={`sidebar-nav-item ${isFocusMode ? 'active' : ''}`}
              >
                {isFocusMode ? (
                  <Minimize2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-slate-400" />
                )}
                <span className="sidebar-nav-label">
                  {isFocusMode ? 'Exit Theater Focus Mode' : 'Theater Focus Mode'}
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenSettings();
                  onClose();
                }}
                className="sidebar-nav-item"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span className="sidebar-nav-label">Settings & API Key</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="app-sidebar-footer">
          <div className="text-[11px] text-slate-500 text-center">
            Ad-Free Computer Science Education • v2.0
          </div>
        </div>
      </aside>
    </div>
  );
}
