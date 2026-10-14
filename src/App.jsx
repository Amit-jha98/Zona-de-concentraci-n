import React, { useState, useEffect, useMemo, useCallback } from 'react';
import BrowserChrome from './components/BrowserChrome';
import TabNav from './components/TabNav';
import VideoPlayer from './components/VideoPlayer';
import RelatedEducationalVideos from './components/RelatedEducationalVideos';
import VideoGrid from './components/VideoGrid';
import StudyNotes from './components/StudyNotes';
import GateSyllabusTracker from './components/GateSyllabusTracker';
import BookmarksDrawer from './components/BookmarksDrawer';
import SettingsModal from './components/SettingsModal';
import './App.css';

import { EDUCATIONAL_VIDEOS, CS_SUBJECTS, POPULAR_CS_VIDEOS } from './data/csCatalog';
import { 
  searchEducationalCatalog, 
  getStrictRelatedVideos 
} from './services/recommendationEngine';
import { 
  fetchVideoMetadataFromOEmbed, 
  extractYouTubeVideoId,
  getWatchHistory,
  addToWatchHistory,
  getBookmarks,
  toggleBookmark,
  checkEducationalScope,
  fetchLiveCSChannelUploads,
  fetchLiveYouTubeSearch,
  getCachedLiveFeed,
  fetchPopularCSVideos,
  fetchYouTubeVideosBySubject,
  checkForNewChannelUploads
} from './services/youtubeService';
import { incrementAdShieldStat } from './services/adBlockerService';

export default function App() {
  // Browser Tabs State
  const [tabs, setTabs] = useState([
    {
      id: 'tab-1',
      title: "Dijkstra's Algorithm - Single Source Shortest Path",
      type: 'player',
      videoId: 'XB4MIexjvY0'
    },
    {
      id: 'tab-catalog',
      title: 'CS & GATE Catalog',
      type: 'catalog',
      subject: 'all',
      searchQuery: ''
    },
    {
      id: 'tab-syllabus',
      title: 'GATE CS Syllabus Matrix',
      type: 'syllabus'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  // Video State cache
  const [videoCache, setVideoCache] = useState(() => {
    const map = {};
    EDUCATIONAL_VIDEOS.forEach(v => {
      map[v.id] = v;
    });
    return map;
  });

  // Feed Mode: 'curated' | 'popular' | 'live'
  const [feedMode, setFeedMode] = useState('curated');
  const [liveVideos, setLiveVideos] = useState(getCachedLiveFeed());
  const [popularVideos, setPopularVideos] = useState(POPULAR_CS_VIDEOS);
  const [subjectVideosCache, setSubjectVideosCache] = useState({});
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [isSubjectLoading, setIsSubjectLoading] = useState(false);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState([]);
  
  // Continuous Update & Auto-Sync state
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [streamPage, setStreamPage] = useState(1);
  const [isContinueLoading, setIsContinueLoading] = useState(false);
  const [updateNotification, setUpdateNotification] = useState(null);

  // UI state
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Bookmarks & History
  const [bookmarks, setBookmarks] = useState(getBookmarks());
  const [history, setHistory] = useState(getWatchHistory());

  // Active Tab reference
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Resolve current active video if in player tab
  const activeVideo = useMemo(() => {
    if (activeTab?.type === 'player' && activeTab.videoId) {
      return videoCache[activeTab.videoId] || null;
    }
    return null;
  }, [activeTab, videoCache]);

  // Load video metadata if not in cache (e.g. user pasted custom URL)
  useEffect(() => {
    if (activeTab?.type === 'player' && activeTab.videoId && !videoCache[activeTab.videoId]) {
      fetchVideoMetadataFromOEmbed(activeTab.videoId).then(meta => {
        setVideoCache(prev => ({ ...prev, [meta.id]: meta }));
        setTabs(prev => prev.map(t => t.id === activeTab.id ? { ...t, title: meta.title } : t));
      });
    }
  }, [activeTab, videoCache]);

  // Record watch history when active video changes
  useEffect(() => {
    if (activeVideo) {
      const updatedHistory = addToWatchHistory(activeVideo);
      if (updatedHistory) setHistory(updatedHistory);
      incrementAdShieldStat('clickbaitFilteredCount', 4);
    }
  }, [activeVideo?.id]);

  // Function to fetch / refresh live YouTube channel uploads
  const handleRefreshLiveFeed = useCallback(async () => {
    setIsLiveLoading(true);
    try {
      const fresh = await fetchLiveCSChannelUploads();
      if (fresh && fresh.length > 0) {
        setLiveVideos(fresh);
        // Also add fresh videos to video cache
        setVideoCache(prev => {
          const updated = { ...prev };
          fresh.forEach(v => {
            updated[v.id] = v;
          });
          return updated;
        });
        setUpdateNotification(`⚡ Live Feed Refreshed: ${fresh.length} uploads synchronized`);
        setTimeout(() => setUpdateNotification(null), 4000);
      }
    } finally {
      setIsLiveLoading(false);
    }
  }, []);

  // Pre-load live feed in the background if empty or when switching to live mode
  useEffect(() => {
    if (feedMode === 'live' && liveVideos.length === 0) {
      handleRefreshLiveFeed();
    }
  }, [feedMode, liveVideos.length, handleRefreshLiveFeed]);

  // Continuous Auto-Update Heartbeat: checks channels every 45s
  useEffect(() => {
    if (!autoUpdateEnabled) return;

    const interval = setInterval(async () => {
      try {
        const knownIds = new Set(liveVideos.map(v => v.id));
        const newUploads = await checkForNewChannelUploads(knownIds);
        if (newUploads && newUploads.length > 0) {
          setLiveVideos(prev => {
            const seen = new Set(prev.map(v => v.id));
            const freshFiltered = newUploads.filter(v => !seen.has(v.id));
            return [...freshFiltered, ...prev];
          });
          setVideoCache(prev => {
            const updated = { ...prev };
            newUploads.forEach(v => { updated[v.id] = v; });
            return updated;
          });
          setUpdateNotification(`⚡ ${newUploads.length} New CS Upload${newUploads.length > 1 ? 's' : ''} Just In!`);
          setTimeout(() => setUpdateNotification(null), 5000);
        }
      } catch (err) {
        // silent background error handling
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [autoUpdateEnabled, liveVideos]);

  // Handle live YouTube search when enabled
  useEffect(() => {
    if (isSearchingLive && activeTab?.searchQuery) {
      let isMounted = true;
      fetchLiveYouTubeSearch(activeTab.searchQuery).then(results => {
        if (isMounted) {
          setLiveSearchResults(results);
          setVideoCache(prev => {
            const updated = { ...prev };
            results.forEach(v => {
              updated[v.id] = v;
            });
            return updated;
          });
        }
      });
      return () => { isMounted = false; };
    }
  }, [isSearchingLive, activeTab?.searchQuery]);

  // Omnibox URL generation
  const omniboxUrl = useMemo(() => {
    if (!activeTab) return 'edu://cs';
    if (activeTab.type === 'player' && activeTab.videoId) {
      return `https://youtube.com/watch?v=${activeTab.videoId}`;
    }
    if (activeTab.type === 'syllabus') {
      return 'edu://cs/gate-syllabus';
    }
    if (activeTab.type === 'catalog') {
      if (activeTab.searchQuery) {
        return `edu://cs/search?q=${encodeURIComponent(activeTab.searchQuery)}`;
      }
      return `edu://cs/subject/${activeTab.subject || 'all'}`;
    }
    return 'edu://cs';
  }, [activeTab]);

  // Handlers for Tabs
  const handleSelectTab = (id) => {
    setActiveTabId(id);
  };

  const handleCloseTab = (id) => {
    if (tabs.length <= 1) return;
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      title: 'New CS Session',
      type: 'catalog',
      subject: 'all',
      searchQuery: ''
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  // Video selection handler (opens video in current or active player tab)
  const handleSelectVideo = useCallback((video) => {
    if (!video || !video.id) return;
    setVideoCache(prev => ({ ...prev, [video.id]: video }));

    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        return {
          ...t,
          type: 'player',
          videoId: video.id,
          title: video.title
        };
      }
      return t;
    }));
  }, [activeTabId]);

  // Navigation from Omnibox
  const handleNavigate = ({ type, value }) => {
    if (type === 'video_id') {
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          return {
            ...t,
            type: 'player',
            videoId: value,
            title: `Loading Lecture (${value})...`
          };
        }
        return t;
      }));
    } else if (type === 'search') {
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          return {
            ...t,
            type: 'catalog',
            searchQuery: value,
            title: `Search: ${value}`
          };
        }
        return t;
      }));
    }
  };

  const handleHome = () => {
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        return {
          ...t,
          type: 'catalog',
          subject: 'all',
          searchQuery: '',
          title: 'CS & GATE Catalog'
        };
      }
      return t;
    }));
  };

  const handleOpenSyllabus = () => {
    const existing = tabs.find(t => t.type === 'syllabus');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const newId = `tab-syllabus-${Date.now()}`;
      setTabs([...tabs, { id: newId, title: 'GATE CS Syllabus', type: 'syllabus' }]);
      setActiveTabId(newId);
    }
  };

  const handleToggleBookmark = (video) => {
    const updated = toggleBookmark(video);
    setBookmarks(updated);
  };

  // Filter videos for catalog tab
  const catalogVideos = useMemo(() => {
    if (activeTab?.type !== 'catalog') return EDUCATIONAL_VIDEOS;

    // 1. Live search mode
    if (isSearchingLive && activeTab.searchQuery && liveSearchResults.length > 0) {
      return liveSearchResults;
    }

    const currentSubject = activeTab.subject || 'all';

    // 2. Base list selection based on active feed mode
    let baseList = [];
    if (feedMode === 'popular') {
      baseList = popularVideos;
    } else if (feedMode === 'live') {
      baseList = liveVideos.length > 0 ? liveVideos : EDUCATIONAL_VIDEOS;
    } else {
      baseList = EDUCATIONAL_VIDEOS;
    }

    // 3. Subject filter
    let list = baseList;
    if (currentSubject !== 'all') {
      if (currentSubject === 'gate-special') {
        list = baseList.filter(v => v.gateWeightage && v.gateWeightage.includes('High'));
      } else {
        list = baseList.filter(v => v.subject === currentSubject);
      }

      // Merge dynamically fetched videos for this subject if present
      if (subjectVideosCache[currentSubject] && subjectVideosCache[currentSubject].length > 0) {
        const dynamicItems = subjectVideosCache[currentSubject];
        const existingIds = new Set(list.map(v => v.id));
        const nonDuplicateDynamic = dynamicItems.filter(v => !existingIds.has(v.id));
        list = [...list, ...nonDuplicateDynamic];
      }

      // Safe Fallback: If current feed has no items for this subject (e.g. recent RSS didn't have COA),
      // seamlessly blend with verified curated lectures so user NEVER encounters an empty 0-lectures state!
      if (list.length === 0) {
        list = EDUCATIONAL_VIDEOS.filter(v => v.subject === currentSubject);
      }
    }

    // 4. Query search filter
    if (activeTab.searchQuery) {
      list = searchEducationalCatalog(activeTab.searchQuery, list);
    }

    return list;
  }, [activeTab, feedMode, liveVideos, popularVideos, subjectVideosCache, isSearchingLive, liveSearchResults]);

  // Subject selection with auto-fetch & tab title synchronization
  const handleSelectSubject = useCallback(async (subjId) => {
    const subjectObj = CS_SUBJECTS.find(s => s.id === subjId);
    const subjectName = subjectObj ? subjectObj.shortName : 'CS';

    setTabs(prev => prev.map(t => t.id === activeTabId ? {
      ...t,
      subject: subjId,
      searchQuery: '',
      title: `${subjectName} • CS Catalog`
    } : t));

    // If subject lectures aren't cached yet, fetch fresh YouTube videos for this subject in the background!
    if (subjId !== 'all' && !subjectVideosCache[subjId]) {
      setIsSubjectLoading(true);
      try {
        const dynamicVideos = await fetchYouTubeVideosBySubject(subjId, 1);
        if (dynamicVideos && dynamicVideos.length > 0) {
          setSubjectVideosCache(prev => ({
            ...prev,
            [subjId]: dynamicVideos
          }));
          setVideoCache(prev => {
            const updated = { ...prev };
            dynamicVideos.forEach(v => { updated[v.id] = v; });
            return updated;
          });
        }
      } finally {
        setIsSubjectLoading(false);
      }
    }
  }, [activeTabId, subjectVideosCache]);

  // Handler for Continuous Update / Load More CS Videos stream
  const handleContinueUpdate = useCallback(async () => {
    setIsContinueLoading(true);
    const nextPage = streamPage + 1;
    setStreamPage(nextPage);

    try {
      const currentSubject = activeTab?.subject || 'all';

      if (feedMode === 'popular') {
        const morePopular = await fetchPopularCSVideos(nextPage);
        if (morePopular && morePopular.length > 0) {
          setPopularVideos(prev => {
            const existingIds = new Set(prev.map(v => v.id));
            const newItems = morePopular.filter(v => !existingIds.has(v.id));
            return [...prev, ...newItems];
          });
          setVideoCache(prev => {
            const updated = { ...prev };
            morePopular.forEach(v => { updated[v.id] = v; });
            return updated;
          });
          setUpdateNotification(`⚡ Stream Updated: Added ${morePopular.length} popular CS masterclasses`);
        }
      } else if (feedMode === 'live' || currentSubject !== 'all') {
        const moreSubjectVideos = await fetchYouTubeVideosBySubject(currentSubject, nextPage);
        if (moreSubjectVideos && moreSubjectVideos.length > 0) {
          setSubjectVideosCache(prev => ({
            ...prev,
            [currentSubject]: [...(prev[currentSubject] || []), ...moreSubjectVideos]
          }));
          setVideoCache(prev => {
            const updated = { ...prev };
            moreSubjectVideos.forEach(v => { updated[v.id] = v; });
            return updated;
          });
          setUpdateNotification(`⚡ Stream Updated: Added ${moreSubjectVideos.length} more live lectures`);
        }
      } else {
        const moreVideos = await fetchYouTubeVideosBySubject('all', nextPage);
        if (moreVideos && moreVideos.length > 0) {
          setPopularVideos(prev => [...prev, ...moreVideos]);
          setVideoCache(prev => {
            const updated = { ...prev };
            moreVideos.forEach(v => { updated[v.id] = v; });
            return updated;
          });
          setUpdateNotification(`⚡ Stream Updated: Added ${moreVideos.length} CS lectures`);
        }
      }
    } catch (e) {
      console.warn('Error in continuous stream update:', e);
    } finally {
      setIsContinueLoading(false);
      setTimeout(() => setUpdateNotification(null), 4000);
    }
  }, [streamPage, activeTab?.subject, feedMode]);

  return (
    <div className={`edubrowse-app ${isFocusMode ? 'theater-active' : ''}`}>
      {/* Top Browser Chrome Bar */}
      <BrowserChrome
        currentUrl={omniboxUrl}
        canGoBack={true}
        canGoForward={false}
        onBack={() => {}}
        onForward={() => {}}
        onReload={() => {
          if (feedMode === 'live') handleRefreshLiveFeed();
          else handleContinueUpdate();
        }}
        onHome={handleHome}
        onNavigate={handleNavigate}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        onOpenSyllabus={handleOpenSyllabus}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        bookmarkCount={bookmarks.length}
      />

      {/* Browser Tab Strip */}
      <TabNav
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
      />

      {/* Main Viewport Content */}
      <main className="browser-viewport">
        {activeTab?.type === 'player' ? (
          <div className="player-layout">
            <div className="player-main-col">
              <VideoPlayer
                video={activeVideo}
                isBookmarked={bookmarks.some(b => b.id === activeVideo?.id)}
                onToggleBookmark={handleToggleBookmark}
                onOpenNotes={() => setIsNotesOpen(true)}
                isFocusMode={isFocusMode}
              />
            </div>

            {/* Strict Related CS Educational Videos Sidebar */}
            <div className="player-sidebar-col">
              <RelatedEducationalVideos
                currentVideo={activeVideo}
                onSelectVideo={handleSelectVideo}
              />
            </div>
          </div>
        ) : activeTab?.type === 'syllabus' ? (
          <GateSyllabusTracker
            onSelectVideo={handleSelectVideo}
            onSelectSubject={(subjectId) => {
              setTabs(prev => prev.map(t => t.id === activeTabId ? {
                ...t,
                type: 'catalog',
                subject: subjectId,
                title: `${subjectId.toUpperCase()} • CS Catalog`
              } : t));
            }}
          />
        ) : (
          <VideoGrid
            videos={catalogVideos}
            selectedSubject={activeTab?.subject || 'all'}
            onSelectSubject={handleSelectSubject}
            searchQuery={activeTab?.searchQuery || ''}
            onClearSearch={() => {
              setTabs(prev => prev.map(t => t.id === activeTabId ? {
                ...t,
                searchQuery: ''
              } : t));
            }}
            onSelectVideo={handleSelectVideo}
            onOpenSyllabus={handleOpenSyllabus}
            feedMode={feedMode}
            onToggleFeedMode={(mode) => {
              setFeedMode(mode);
              if (mode === 'live' && liveVideos.length === 0) {
                handleRefreshLiveFeed();
              }
            }}
            isLiveLoading={isLiveLoading}
            isSubjectLoading={isSubjectLoading}
            onRefreshLive={handleRefreshLiveFeed}
            isSearchingLive={isSearchingLive}
            onToggleSearchLive={() => setIsSearchingLive(!isSearchingLive)}
            autoUpdateEnabled={autoUpdateEnabled}
            onToggleAutoUpdate={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
            updateNotification={updateNotification}
            onContinueUpdate={handleContinueUpdate}
            isContinueLoading={isContinueLoading}
            streamPage={streamPage}
          />
        )}
      </main>

      {/* Timestamped Lecture Notes Drawer */}
      <StudyNotes
        video={activeVideo}
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
      />

      {/* Bookmarks & History Library Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        history={history}
        onSelectVideo={handleSelectVideo}
        onRemoveBookmark={handleToggleBookmark}
      />

      {/* Browser Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
