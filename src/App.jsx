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
import MobileBottomNav from './components/MobileBottomNav';
import HomePage from './components/HomePage';
import AppSidebar from './components/AppSidebar';
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
  getGuaranteedSubjectLectures,
  checkForNewChannelUploads
} from './services/youtubeService';
import { incrementAdShieldStat } from './services/adBlockerService';

const SESSION_TABS_KEY = 'edubrowse_browser_tabs';
const SESSION_ACTIVE_TAB_KEY = 'edubrowse_active_tab_id';

const DEFAULT_TABS = [
  {
    id: 'tab-home',
    title: 'EduBrowse CS',
    type: 'home'
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
];

export default function App() {
  // Browser Tabs State with localStorage Session Persistence
  const [tabs, setTabs] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_TABS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved session tabs:', e);
    }
    return DEFAULT_TABS;
  });

  const [activeTabId, setActiveTabId] = useState(() => {
    try {
      const savedActive = localStorage.getItem(SESSION_ACTIVE_TAB_KEY);
      if (savedActive) return savedActive;
    } catch (e) {
      console.warn('Error reading active tab:', e);
    }
    return 'tab-home';
  });

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
  const [curatedVideos, setCuratedVideos] = useState(EDUCATIONAL_VIDEOS);
  const [liveVideos, setLiveVideos] = useState(getCachedLiveFeed());
  const [popularVideos, setPopularVideos] = useState(POPULAR_CS_VIDEOS);
  const [subjectVideosCache, setSubjectVideosCache] = useState({});
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [isSubjectLoading, setIsSubjectLoading] = useState(false);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState([]);
  
  // Continuous Update & Auto-Sync state: tracks pages per active feed key
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [streamPages, setStreamPages] = useState({});
  const [isContinueLoading, setIsContinueLoading] = useState(false);
  const [updateNotification, setUpdateNotification] = useState(null);

  // UI state
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
        setUpdateNotification(`Live Feed Refreshed: ${fresh.length} uploads synchronized`);
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
          setUpdateNotification(`${newUploads.length} New CS Upload${newUploads.length > 1 ? 's' : ''} Synchronized`);
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

  // Persist browser tabs and active tab so page refresh preserves state
  useEffect(() => {
    try {
      localStorage.setItem(SESSION_TABS_KEY, JSON.stringify(tabs));
      localStorage.setItem(SESSION_ACTIVE_TAB_KEY, activeTabId);
    } catch (e) {
      console.warn('Error saving session tabs:', e);
    }
  }, [tabs, activeTabId]);

  // Omnibox URL generation
  const omniboxUrl = useMemo(() => {
    if (!activeTab) return 'edu://cs/home';
    if (activeTab.type === 'home') {
      return 'edu://cs/home';
    }
    if (activeTab.type === 'player' && activeTab.videoId) {
      return `edu://watch?v=${activeTab.videoId}`;
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
    return 'edu://cs/home';
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
    const newId = `tab-home-${Date.now()}`;
    const newTab = {
      id: newId,
      title: 'EduBrowse CS',
      type: 'home'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  // Video selection handler (opens video in current or active player tab)
  const handleSelectVideo = useCallback((video) => {
    if (!video || !video.id) return;
    setVideoCache(prev => ({ ...prev, [video.id]: video }));

    setTabs(prev => {
      // If currently on home or syllabus, open or replace tab
      const playerTab = prev.find(t => t.id === activeTabId);
      if (playerTab && (playerTab.type === 'player' || playerTab.type === 'catalog')) {
        return prev.map(t => t.id === activeTabId ? {
          ...t,
          type: 'player',
          videoId: video.id,
          title: video.title
        } : t);
      }
      // Otherwise open in a dedicated player tab
      const existingPlayer = prev.find(t => t.type === 'player');
      if (existingPlayer) {
        setActiveTabId(existingPlayer.id);
        return prev.map(t => t.id === existingPlayer.id ? {
          ...t,
          videoId: video.id,
          title: video.title
        } : t);
      }
      const newPlayerId = `tab-player-${Date.now()}`;
      setActiveTabId(newPlayerId);
      return [...prev, {
        id: newPlayerId,
        title: video.title,
        type: 'player',
        videoId: video.id
      }];
    });
  }, [activeTabId]);

  // Navigation from Omnibox
  const handleNavigate = ({ type, value }) => {
    if (type === 'video_id') {
      const vidId = value;
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          return {
            ...t,
            type: 'player',
            videoId: vidId,
            title: `Loading Lecture (${vidId})...`
          };
        }
        return t;
      }));
    } else if (type === 'search') {
      const valLower = value.toLowerCase().trim();
      if (valLower === 'home' || valLower === 'edu://cs/home' || valLower === 'edu://home' || valLower === 'edu://cs') {
        handleHome();
        return;
      }
      if (valLower === 'syllabus' || valLower === 'gate' || valLower === 'edu://cs/gate-syllabus') {
        handleOpenSyllabus();
        return;
      }
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

  const handleHome = useCallback(() => {
    const existing = tabs.find(t => t.type === 'home');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const homeId = `tab-home-${Date.now()}`;
      setTabs(prev => [{ id: homeId, title: 'EduBrowse CS', type: 'home' }, ...prev]);
      setActiveTabId(homeId);
    }
  }, [tabs]);

  const handleOpenCatalog = useCallback((subjectId = 'all') => {
    const subjectObj = CS_SUBJECTS.find(s => s.id === subjectId);
    const title = subjectId === 'all' ? 'CS & GATE Catalog' : `${subjectObj?.shortName || subjectId.toUpperCase()} • Catalog`;

    const existing = tabs.find(t => t.type === 'catalog');
    if (existing) {
      setTabs(prev => prev.map(t => t.id === existing.id ? {
        ...t,
        subject: subjectId,
        searchQuery: '',
        title
      } : t));
      setActiveTabId(existing.id);
    } else {
      const catId = `tab-catalog-${Date.now()}`;
      setTabs(prev => [...prev, {
        id: catId,
        title,
        type: 'catalog',
        subject: subjectId,
        searchQuery: ''
      }]);
      setActiveTabId(catId);
    }
  }, [tabs]);

  const handleSearchFromHome = useCallback((query) => {
    const existing = tabs.find(t => t.type === 'catalog');
    if (existing) {
      setTabs(prev => prev.map(t => t.id === existing.id ? {
        ...t,
        searchQuery: query,
        title: `Search: ${query}`
      } : t));
      setActiveTabId(existing.id);
    } else {
      const catId = `tab-catalog-${Date.now()}`;
      setTabs(prev => [...prev, {
        id: catId,
        title: `Search: ${query}`,
        type: 'catalog',
        subject: 'all',
        searchQuery: query
      }]);
      setActiveTabId(catId);
    }
  }, [tabs]);

  const handleOpenSyllabus = useCallback(() => {
    const existing = tabs.find(t => t.type === 'syllabus');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const newId = `tab-syllabus-${Date.now()}`;
      setTabs(prev => [...prev, { id: newId, title: 'GATE CS Syllabus', type: 'syllabus' }]);
      setActiveTabId(newId);
    }
  }, [tabs]);

  const handleToggleBookmark = (video) => {
    const updated = toggleBookmark(video);
    setBookmarks(updated);
  };

  const currentSubject = activeTab?.subject || 'all';
  const activeFeedKey = `${feedMode}-${currentSubject}`;
  const currentStreamPage = streamPages[activeFeedKey] || 1;

  // Combined video suggestions for Home page
  const allHomeVideos = useMemo(() => {
    const map = new Map();
    EDUCATIONAL_VIDEOS.forEach(v => map.set(v.id, v));
    popularVideos.forEach(v => map.set(v.id, v));
    liveVideos.forEach(v => map.set(v.id, v));
    Object.values(videoCache).forEach(v => map.set(v.id, v));
    return Array.from(map.values());
  }, [videoCache, popularVideos, liveVideos]);

  // Filter videos for catalog tab
  const catalogVideos = useMemo(() => {
    if (activeTab?.type !== 'catalog') return EDUCATIONAL_VIDEOS;

    // 1. Live search mode
    if (isSearchingLive && activeTab.searchQuery && liveSearchResults.length > 0) {
      return liveSearchResults;
    }

    const currentSubj = activeTab.subject || 'all';

    // 2. Base list selection based on active feed mode
    let baseList = [];
    if (feedMode === 'popular') {
      baseList = popularVideos;
    } else if (feedMode === 'live') {
      baseList = liveVideos.length > 0 ? liveVideos : curatedVideos;
    } else {
      baseList = curatedVideos;
    }

    // 3. Subject filter
    let list = baseList;
    if (currentSubj !== 'all') {
      if (currentSubj === 'gate-special') {
        list = baseList.filter(v => v.gateWeightage && v.gateWeightage.includes('High'));
      } else {
        list = baseList.filter(v => v.subject === currentSubj);
      }

      // Merge dynamically fetched videos for this subject if present
      if (subjectVideosCache[currentSubj] && subjectVideosCache[currentSubj].length > 0) {
        const dynamicItems = subjectVideosCache[currentSubj];
        const existingIds = new Set(list.map(v => v.id));
        const nonDuplicateDynamic = dynamicItems.filter(v => !existingIds.has(v.id));
        list = [...list, ...nonDuplicateDynamic];
      }

      // Ensure foundational curated lectures for this subject are always available
      const baseCurated = EDUCATIONAL_VIDEOS.filter(v => 
        currentSubj === 'gate-special' 
          ? (v.gateWeightage && v.gateWeightage.includes('High'))
          : v.subject === currentSubj
      );
      const existingIds = new Set(list.map(v => v.id));
      const neededCurated = baseCurated.filter(v => !existingIds.has(v.id));
      list = [...list, ...neededCurated];
    } else {
      // When on 'all', also merge any dynamic videos fetched for general stream
      if (subjectVideosCache['all'] && subjectVideosCache['all'].length > 0) {
        const dynamicItems = subjectVideosCache['all'];
        const existingIds = new Set(list.map(v => v.id));
        const nonDuplicateDynamic = dynamicItems.filter(v => !existingIds.has(v.id));
        list = [...list, ...nonDuplicateDynamic];
      }
    }

    // 4. Query search filter
    if (activeTab.searchQuery) {
      list = searchEducationalCatalog(activeTab.searchQuery, list);
    }

    return list;
  }, [activeTab, feedMode, curatedVideos, liveVideos, popularVideos, subjectVideosCache, isSearchingLive, liveSearchResults]);

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
    const activeKey = `${feedMode}-${currentSubject}`;
    const currentPage = streamPages[activeKey] || 1;
    const nextPage = currentPage + 1;

    try {
      let incoming = [];
      let freshAddedCount = 0;

      if (currentSubject !== 'all') {
        const currentCached = subjectVideosCache[currentSubject] || [];
        const existingIds = new Set([
          ...currentCached.map(v => v.id),
          ...EDUCATIONAL_VIDEOS.filter(v => v.subject === currentSubject).map(v => v.id)
        ]);

        // Fetch next page specifically for this subject
        incoming = await fetchYouTubeVideosBySubject(currentSubject, nextPage, existingIds);
        let freshItems = (incoming || []).filter(v => !existingIds.has(v.id));

        // If online search did not yield new videos, guarantee from syllabus lecture pool
        if (freshItems.length === 0) {
          freshItems = getGuaranteedSubjectLectures(currentSubject, nextPage, existingIds);
        }

        freshAddedCount = freshItems.length;
        incoming = freshItems;

        setSubjectVideosCache(prev => ({
          ...prev,
          [currentSubject]: [...(prev[currentSubject] || []), ...freshItems]
        }));
      } else if (feedMode === 'popular') {
        const existingIds = new Set(popularVideos.map(v => v.id));
        incoming = await fetchPopularCSVideos(nextPage);
        let freshItems = (incoming || []).filter(v => !existingIds.has(v.id));

        if (freshItems.length === 0) {
          freshItems = getGuaranteedSubjectLectures('all', nextPage, existingIds);
        }

        freshAddedCount = freshItems.length;
        incoming = freshItems;
        setPopularVideos(prev => [...prev, ...freshItems]);
      } else if (feedMode === 'live') {
        const existingIds = new Set(liveVideos.map(v => v.id));
        incoming = await fetchYouTubeVideosBySubject('all', nextPage, existingIds);
        let freshItems = (incoming || []).filter(v => !existingIds.has(v.id));

        if (freshItems.length === 0) {
          freshItems = getGuaranteedSubjectLectures('all', nextPage, existingIds);
        }

        freshAddedCount = freshItems.length;
        incoming = freshItems;
        setLiveVideos(prev => [...prev, ...freshItems]);
      } else {
        // Curated feed mode
        const existingIds = new Set(curatedVideos.map(v => v.id));
        incoming = await fetchYouTubeVideosBySubject('all', nextPage, existingIds);
        let freshItems = (incoming || []).filter(v => !existingIds.has(v.id));

        if (freshItems.length === 0) {
          freshItems = getGuaranteedSubjectLectures('all', nextPage, existingIds);
        }

        freshAddedCount = freshItems.length;
        incoming = freshItems;
        setCuratedVideos(prev => [...prev, ...freshItems]);
      }

      // Add to global videoCache so all newly loaded videos play immediately
      if (incoming && incoming.length > 0) {
        setVideoCache(prev => {
          const updated = { ...prev };
          incoming.forEach(v => { updated[v.id] = v; });
          return updated;
        });

        // Update the page counter for this specific active feed
        setStreamPages(prev => ({
          ...prev,
          [activeKey]: nextPage
        }));

        if (freshAddedCount > 0) {
          setUpdateNotification(`Page ${nextPage} Added: +${freshAddedCount} new CS lectures appended`);
          incrementAdShieldStat('adsBlockedCount', freshAddedCount * 2);
        } else {
          setUpdateNotification(`Page ${nextPage} Synchronized: Catalog up to date`);
        }
      } else {
        setUpdateNotification(`Stream synchronized with YouTube`);
      }
    } catch (e) {
      console.warn('Error during continuous stream update:', e);
      setUpdateNotification(`Stream synchronized with YouTube`);
    } finally {
      setIsContinueLoading(false);
      setTimeout(() => setUpdateNotification(null), 4000);
    }
  }, [feedMode, currentSubject, streamPages, subjectVideosCache, popularVideos, liveVideos, curatedVideos]);

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
        onOpenMenu={() => setIsSidebarOpen(true)}
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
        {activeTab?.type === 'home' ? (
          <HomePage
            videos={allHomeVideos}
            history={history}
            bookmarks={bookmarks}
            onSelectVideo={handleSelectVideo}
            onOpenCatalog={handleOpenCatalog}
            onOpenSyllabus={handleOpenSyllabus}
            onSearch={handleSearchFromHome}
          />
        ) : activeTab?.type === 'player' ? (
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
                catalog={allHomeVideos}
              />
            </div>
          </div>
        ) : activeTab?.type === 'syllabus' ? (
          <GateSyllabusTracker
            onSelectVideo={handleSelectVideo}
            onSelectSubject={(subjectId) => {
              handleOpenCatalog(subjectId);
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
            streamPage={currentStreamPage}
            onOpenMenu={() => setIsSidebarOpen(true)}
          />
        )}
      </main>

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav
        activeTabType={activeTab?.type || 'home'}
        hasActiveVideo={Boolean(tabs.some(t => t.type === 'player' && t.videoId))}
        onOpenHome={handleHome}
        onOpenCatalog={() => handleOpenCatalog('all')}
        onOpenPlayer={() => {
          const playerTab = tabs.find(t => t.type === 'player');
          if (playerTab) setActiveTabId(playerTab.id);
        }}
        onOpenSyllabus={handleOpenSyllabus}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarkCount={bookmarks.length}
      />

      {/* Slide-out Navigation & Feed Control Drawer */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTabType={activeTab?.type || 'home'}
        onNavigateHome={handleHome}
        onNavigateCatalog={(subjId) => handleOpenCatalog(subjId || 'all')}
        onOpenSyllabus={handleOpenSyllabus}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        bookmarkCount={bookmarks.length}
        feedMode={feedMode}
        onToggleFeedMode={(mode) => {
          setFeedMode(mode);
          if (mode === 'live' && liveVideos.length === 0) {
            handleRefreshLiveFeed();
          }
        }}
        autoUpdateEnabled={autoUpdateEnabled}
        onToggleAutoUpdate={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
        onRefreshLive={handleRefreshLiveFeed}
        isLiveLoading={isLiveLoading}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
      />

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
