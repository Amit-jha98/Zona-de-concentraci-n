import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Search, 
  Lock, 
  BookOpen, 
  Bookmark, 
  Maximize2, 
  Minimize2, 
  Settings, 
  AlertCircle,
  X
} from 'lucide-react';
import AdShieldBadge from './AdShieldBadge';
import { checkEducationalScope, extractYouTubeVideoId } from '../services/youtubeService';

export default function BrowserChrome({
  currentUrl,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onReload,
  onHome,
  onNavigate,
  isFocusMode,
  onToggleFocusMode,
  onOpenSyllabus,
  onOpenBookmarks,
  onOpenSettings,
  bookmarkCount = 0
}) {
  const [inputValue, setInputValue] = useState(currentUrl || '');
  const [warningMessage, setWarningMessage] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(currentUrl || '');
  }, [currentUrl]);

  // Global hotkey support (Ctrl+K or Cmd+K to focus omnibox)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Check if input is a direct YouTube link or video ID
    const extractedId = extractYouTubeVideoId(inputValue);
    if (extractedId) {
      setWarningMessage(null);
      onNavigate({ type: 'video_id', value: extractedId });
      return;
    }

    // Validate educational boundary
    const scopeCheck = checkEducationalScope(inputValue);
    if (!scopeCheck.isEducational) {
      setWarningMessage(scopeCheck.message);
      // Auto-normalize to educational query after warning
      setTimeout(() => {
        onNavigate({ type: 'search', value: scopeCheck.suggestedRedirect });
      }, 1400);
      return;
    }

    setWarningMessage(null);
    onNavigate({ type: 'search', value: inputValue.trim() });
  };

  return (
    <header className="browser-chrome">
      {/* OS-Style Window Dots */}
      <div className="window-dots" aria-hidden="true">
        <span className="dot dot-close"></span>
        <span className="dot dot-minimize"></span>
        <span className="dot dot-maximize"></span>
      </div>

      {/* History & Navigation Controls */}
      <div className="nav-controls">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="nav-btn"
          title="Back (Alt+Left)"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onForward}
          disabled={!canGoForward}
          className="nav-btn"
          title="Forward (Alt+Right)"
          aria-label="Forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onReload}
          className="nav-btn"
          title="Reload Page (Ctrl+R)"
          aria-label="Reload"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onHome}
          className="nav-btn"
          title="Home - CS & GATE Catalog"
          aria-label="Home"
        >
          <Home className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Smart Omnibox (Address & CS Search Bar) */}
      <form onSubmit={handleSubmit} className="omnibox-form">
        <div className="omnibox-container">
          <div className="omnibox-protocol">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="protocol-badge">edu://cs</span>
          </div>

          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search CS concepts (e.g. Dijkstra, B+ Trees, Paging) or paste YouTube URL..."
            className="omnibox-input"
            spellCheck="false"
            autoComplete="off"
          />

          <kbd className="omnibox-shortcut">Ctrl K</kbd>

          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                inputRef.current?.focus();
              }}
              className="omnibox-clear"
              aria-label="Clear input"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </form>

      {/* Right Controls: AdShield, Syllabus Tracker, Focus Mode, Bookmarks, Settings */}
      <div className="browser-actions">
        <AdShieldBadge />

        <button
          onClick={onOpenSyllabus}
          className="action-btn desktop-only"
          title="GATE CS Syllabus Checklist"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="action-btn-text">GATE Syllabus</span>
        </button>

        <button
          onClick={onOpenBookmarks}
          className="action-btn desktop-only"
          title="Saved Lectures"
        >
          <Bookmark className="w-4 h-4 text-blue-400" />
          {bookmarkCount > 0 && <span className="action-badge">{bookmarkCount}</span>}
        </button>

        <button
          onClick={onToggleFocusMode}
          className={`action-btn desktop-only ${isFocusMode ? 'active' : ''}`}
          title={isFocusMode ? 'Exit Theater Focus Mode' : 'Enter Theater Focus Mode'}
        >
          {isFocusMode ? (
            <Minimize2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Maximize2 className="w-4 h-4 text-slate-300" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="action-btn icon-only"
          title="Settings & API Key"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Floating Non-Educational Boundary Alert if triggered */}
      {warningMessage && (
        <div className="boundary-warning-toast">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1 text-xs">
            <strong>AdShield Guard:</strong> {warningMessage}
          </div>
          <button 
            onClick={() => setWarningMessage(null)}
            className="toast-close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </header>
  );
}
