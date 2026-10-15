import React from 'react';
import { Home, LayoutGrid, PlayCircle, BookOpen, Bookmark } from 'lucide-react';

export default function MobileBottomNav({
  activeTabType,
  hasActiveVideo,
  onOpenHome,
  onOpenCatalog,
  onOpenPlayer,
  onOpenSyllabus,
  onOpenBookmarks,
  bookmarkCount = 0
}) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <button
        onClick={onOpenHome}
        className={`mobile-nav-item ${activeTabType === 'home' ? 'active' : ''}`}
        aria-label="Home Start Page"
      >
        <Home className="w-5 h-5 mobile-nav-icon" />
        <span className="mobile-nav-label">Home</span>
      </button>

      <button
        onClick={onOpenCatalog}
        className={`mobile-nav-item ${activeTabType === 'catalog' ? 'active' : ''}`}
        aria-label="Lectures Catalog"
      >
        <LayoutGrid className="w-5 h-5 mobile-nav-icon" />
        <span className="mobile-nav-label">Catalog</span>
      </button>

      <button
        onClick={onOpenPlayer}
        disabled={!hasActiveVideo}
        className={`mobile-nav-item ${activeTabType === 'player' ? 'active' : ''} ${!hasActiveVideo ? 'disabled' : ''}`}
        aria-label="Now Playing"
      >
        <PlayCircle className="w-5 h-5 mobile-nav-icon" />
        <span className="mobile-nav-label">Player</span>
      </button>

      <button
        onClick={onOpenSyllabus}
        className={`mobile-nav-item ${activeTabType === 'syllabus' ? 'active' : ''}`}
        aria-label="GATE Syllabus Tracker"
      >
        <BookOpen className="w-5 h-5 mobile-nav-icon" />
        <span className="mobile-nav-label">Syllabus</span>
      </button>

      <button
        onClick={onOpenBookmarks}
        className="mobile-nav-item"
        aria-label="Saved Lectures"
      >
        <div className="relative inline-flex">
          <Bookmark className="w-5 h-5 mobile-nav-icon" />
          {bookmarkCount > 0 && (
            <span className="mobile-nav-badge">{bookmarkCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">Saved</span>
      </button>
    </nav>
  );
}
