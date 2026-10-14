// YouTube Service: URL parsing, oEmbed resolution, Live YouTube RSS feeds & Search, and Storage
import { EDUCATIONAL_VIDEOS, CS_SUBJECTS, POPULAR_CS_VIDEOS } from '../data/csCatalog';

const RECENT_HISTORY_KEY = 'edubrowse_history';
const BOOKMARKS_KEY = 'edubrowse_bookmarks';
const API_KEY_STORAGE = 'edubrowse_yt_api_key';
const LIVE_FEED_CACHE_KEY = 'edubrowse_live_feed_cache';

// Top verified Computer Science & Engineering channels on YouTube
export const CS_CHANNELS = [
  { id: 'UCJihyK0A38SZ6SdJirEdIOw', name: 'Gate Smashers', defaultSubject: 'gate-special' },
  { id: 'UCJskGeByzP79U45LgG351Kg', name: 'take U forward (Striver)', defaultSubject: 'interview-prep' },
  { id: 'UC_mYaQAE6-71LFFNK_3RjfQ', name: 'NeetCode', defaultSubject: 'interview-prep' },
  { id: 'UC8butISFwT-Wl7EV0hUK0BQ', name: 'freeCodeCamp.org', defaultSubject: 'algorithms' },
  { id: 'UCZCFT11CWBi3MHNlGf019nw', name: 'Abdul Bari', defaultSubject: 'algorithms' },
  { id: 'UCEBb1b_L6zDS3xTUrIALZOw', name: 'MIT OpenCourseWare', defaultSubject: 'algorithms' },
  { id: 'UCRPMAqdtS77LYZJtmpAgU-w', name: 'Gaurav Sen', defaultSubject: 'system-design' },
  { id: 'UC9-y-6csu5WGm29I7JiwpnA', name: 'Computerphile', defaultSubject: 'algorithms' }
];

/**
 * Extracts YouTube Video ID from any URL format or raw ID
 */
export const extractYouTubeVideoId = (input) => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // If already standard 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Resolves external YouTube video metadata using public oEmbed
 * Works out-of-the-box without requiring any API keys
 */
export const fetchVideoMetadataFromOEmbed = async (videoId) => {
  try {
    const url = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Failed to fetch oembed');
    const data = await response.json();

    if (data.error || !data.title) {
      throw new Error(data.error || 'Invalid video response');
    }

    const inferred = inferSubjectAndTags(data.title, data.author_name);

    return {
      id: videoId,
      title: data.title,
      channel: data.author_name || 'YouTube Educator',
      subject: inferred.subject,
      subtopic: inferred.subtopic,
      duration: 'Lecture',
      level: 'Educational Video',
      views: 'Active',
      year: new Date().getFullYear().toString(),
      thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      gateWeightage: inferred.isGate ? 'GATE Related Topic' : 'Computer Science',
      description: `Curated lecture by ${data.author_name}. Streamed in distraction-free AdShield environment.`,
      keyTakeaways: [
        'Ad-free focused educational playback',
        'Strict related CS suggestions only',
        'Active notes taking enabled'
      ],
      tags: inferred.tags
    };
  } catch (err) {
    console.warn('oEmbed fetch failed, using fallback item:', err);
    return {
      id: videoId,
      title: `CS Video Lecture (${videoId})`,
      channel: 'Educational Stream',
      subject: 'algorithms',
      subtopic: 'Computer Science',
      duration: 'Lecture',
      level: 'AdShield Protected',
      views: 'Active',
      year: new Date().getFullYear().toString(),
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      gateWeightage: 'CS Educational Resource',
      description: 'Streamed in distraction-free AdShield environment.',
      keyTakeaways: ['Distraction-free environment active'],
      tags: ['computer science', 'lecture', 'cs']
    };
  }
};

/**
 * Analyzes video title and author to map to CS syllabus and new categories
 */
export const inferSubjectAndTags = (title = '', author = '') => {
  const text = (title + ' ' + author).toLowerCase();
  const isGate = text.includes('gate') || text.includes('pyq') || text.includes('gate smashers') || text.includes('sanchit sir');

  // 1. Soft Skills & Communication
  if (text.includes('communication') || text.includes('soft skill') || text.includes('star method') || 
      text.includes('presentation') || text.includes('public speak') || text.includes('code review') || text.includes('behavioral')) {
    return { 
      subject: 'soft-skills', 
      subtopic: 'Technical Communication & Soft Skills', 
      isGate: false, 
      tags: ['soft skills', 'communication', 'behavioral', 'career'] 
    };
  }

  // 2. Motivation & Engineering Mindset
  if (text.includes('motivation') || text.includes('discipline') || text.includes('burnout') || 
      text.includes('consistency') || text.includes('deep work') || text.includes('habit') || text.includes('imposter')) {
    return { 
      subject: 'motivation', 
      subtopic: 'Mindset & Discipline', 
      isGate: isGate, 
      tags: ['motivation', 'discipline', 'mindset', 'productivity'] 
    };
  }

  // 3. Interview Preparation & DSA Sheets
  if (text.includes('interview') || text.includes('sde sheet') || text.includes('leetcode') || 
      text.includes('neetcode') || text.includes('mock interview') || text.includes('blind 75') || text.includes('coding round')) {
    return { 
      subject: 'interview-prep', 
      subtopic: 'Coding Interviews & SDE Prep', 
      isGate: false, 
      tags: ['interview prep', 'dsa', 'leetcode', 'faang', 'coding'] 
    };
  }

  // 4. Computer Organization & Architecture (COA)
  if (text.includes('coa') || text.includes('organization') || text.includes('architecture') || 
      text.includes('cache') || text.includes('pipeline') || text.includes('pipelining') || 
      text.includes('addressing mode') || text.includes('microarchitecture') || text.includes('hazard') || 
      text.includes('cpu work') || text.includes('breadboard') || text.includes('alu') || text.includes('booth')) {
    return { 
      subject: 'coa', 
      subtopic: 'Computer Organization & Architecture', 
      isGate: isGate, 
      tags: ['coa', 'computer organization', 'architecture', 'hardware', isGate ? 'gate' : 'cs'] 
    };
  }

  // 5. Compiler Design
  if (text.includes('compiler') || text.includes('parser') || text.includes('parsing') || 
      text.includes('ll(1)') || text.includes('lr(') || text.includes('first follow') || 
      text.includes('lexical') || text.includes('syntax') || text.includes('sdt')) {
    return { 
      subject: 'compiler', 
      subtopic: 'Compiler Design', 
      isGate: isGate, 
      tags: ['compiler', 'parsing', 'grammar', isGate ? 'gate' : 'cs'] 
    };
  }

  // 6. Digital Logic Design
  if (text.includes('digital logic') || text.includes('boolean algebra') || text.includes('k-map') || 
      text.includes('karnaugh') || text.includes('multiplexer') || text.includes('demux') || 
      text.includes('decoder') || text.includes('flip-flop') || text.includes('latch') || 
      text.includes('counter') || text.includes('logic gate') || text.includes('half adder') || text.includes('full adder')) {
    return { 
      subject: 'digital-logic', 
      subtopic: 'Digital Logic Design', 
      isGate: isGate, 
      tags: ['digital logic', 'boolean', 'circuits', isGate ? 'gate' : 'hardware'] 
    };
  }

  // 7. Operating Systems
  if (text.includes('operating system') || text.includes(' os ') || text.startsWith('os ') || text.includes('process') || 
      text.includes('page') || text.includes('paging') || text.includes('semaphore') || 
      text.includes('deadlock') || text.includes('scheduling') || text.includes('virtual memory')) {
    return { 
      subject: 'os', 
      subtopic: 'Operating Systems', 
      isGate: isGate, 
      tags: ['operating systems', 'os', 'processes', isGate ? 'gate' : 'cs'] 
    };
  }

  // 8. Database Management Systems (DBMS)
  if (text.includes('dbms') || text.includes('database') || text.includes('sql') || 
      text.includes('normal') || text.includes('bcnf') || text.includes('transaction') || 
      text.includes('acid') || text.includes('serializability') || text.includes('b+ tree')) {
    return { 
      subject: 'dbms', 
      subtopic: 'Database Systems', 
      isGate: isGate, 
      tags: ['dbms', 'databases', 'sql', isGate ? 'gate' : 'cs'] 
    };
  }

  // 9. Computer Networks
  if (text.includes('network') || text.includes('tcp') || text.includes('subnet') || 
      text.includes('osi') || text.includes('sliding window') || text.includes('routing') || 
      text.includes('congestion') || text.includes('ip address')) {
    return { 
      subject: 'networks', 
      subtopic: 'Computer Networks', 
      isGate: isGate, 
      tags: ['networks', 'tcp/ip', 'networking', isGate ? 'gate' : 'cs'] 
    };
  }

  // 10. Theory of Computation (TOC / Automata)
  if (text.includes('toc') || text.includes('automata') || text.includes('dfa') || 
      text.includes('nfa') || text.includes('turing') || text.includes('pumping lemma') || 
      text.includes('context free') || text.includes('cfg') || text.includes('decidability')) {
    return { 
      subject: 'toc', 
      subtopic: 'Theory of Computation', 
      isGate: isGate, 
      tags: ['toc', 'automata', 'turing machine', isGate ? 'gate' : 'cs'] 
    };
  }

  // 11. Discrete Mathematics & Engineering Math
  if (text.includes('linear algebra') || text.includes('discrete math') || text.includes('probability') || 
      text.includes('combinatorics') || text.includes('eigen') || text.includes('matrix') || 
      text.includes('propositional logic') || text.includes('vectors')) {
    return { 
      subject: 'discrete-math', 
      subtopic: 'Discrete & Engineering Math', 
      isGate: isGate, 
      tags: ['math', 'discrete math', 'linear algebra', isGate ? 'gate' : 'cs'] 
    };
  }

  // 12. System Design & Architecture
  if (text.includes('system design') || text.includes('distributed') || text.includes('microservice') || 
      text.includes('load balancer') || text.includes('sharding') || text.includes('scalability')) {
    return { 
      subject: 'system-design', 
      subtopic: 'System Architecture', 
      isGate: false, 
      tags: ['system design', 'architecture', 'distributed'] 
    };
  }

  // 13. Algorithms & Data Structures
  if (text.includes('graph') || text.includes('tree') || text.includes('dijkstra') || 
      text.includes('dynamic programming') || text.includes('algo') || text.includes('dsa') || 
      text.includes('sort') || text.includes('binary search') || text.includes('recursion') || text.includes('heap')) {
    return { 
      subject: 'algorithms', 
      subtopic: 'Data Structures & Algorithms', 
      isGate: isGate, 
      tags: ['algorithms', 'dsa', 'data structures', isGate ? 'gate' : 'cs'] 
    };
  }

  if (isGate) {
    return { subject: 'gate-special', subtopic: 'GATE CS Prep', isGate: true, tags: ['gate', 'cs core'] };
  }

  return { subject: 'algorithms', subtopic: 'Computer Science', isGate: false, tags: ['cs', 'lecture'] };
};

/**
 * Fetches real-time live uploads from top CS channels via RSS feeds
 * Works automatically for current and all future uploads!
 */
export const fetchLiveCSChannelUploads = async () => {
  const cached = getCachedLiveFeed();
  const fetchPromises = CS_CHANNELS.map(async (channel) => {
    try {
      // First try local Vite proxy /api/yt-rss, fallback to allorigins proxy
      const primaryUrl = `/api/yt-rss/feeds/videos.xml?channel_id=${channel.id}`;
      const fallbackUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`)}`;

      let xml = '';
      try {
        const res = await fetch(primaryUrl, { signal: AbortSignal.timeout(4000) });
        if (res.ok) xml = await res.text();
      } catch (e) {
        // Fallback
        const res2 = await fetch(fallbackUrl, { signal: AbortSignal.timeout(5000) });
        if (res2.ok) xml = await res2.text();
      }

      if (!xml) return [];

      const entryMatches = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
      return entryMatches.map(m => {
        const content = m[1];
        const idMatch = content.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        const pubMatch = content.match(/<published>(.*?)<\/published>/);
        const authorMatch = content.match(/<author>[\s\S]*?<name>(.*?)<\/name>/);

        const videoId = idMatch ? idMatch[1] : null;
        const rawTitle = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'") : '';
        const authorName = authorMatch ? authorMatch[1] : channel.name;
        const publishedDate = pubMatch ? pubMatch[1] : '';

        if (!videoId || !rawTitle) return null;

        const inferred = inferSubjectAndTags(rawTitle, authorName);

        return {
          id: videoId,
          title: rawTitle,
          channel: authorName,
          subject: inferred.subject || channel.defaultSubject,
          subtopic: inferred.subtopic || 'Latest CS Stream',
          duration: 'New Upload',
          level: 'Latest Stream',
          views: 'Fresh',
          year: new Date(publishedDate || Date.now()).getFullYear().toString(),
          publishedAt: publishedDate,
          gateWeightage: inferred.isGate ? 'GATE CS High-Yield' : 'Live CS Channel',
          description: `Recent upload from ${authorName}. Verified educational stream with AdShield privacy protection.`,
          keyTakeaways: [
            'Latest upload from verified CS educator',
            'Ad-free uninterrupted playback',
            'Syllabus & notes integration enabled'
          ],
          tags: [...inferred.tags, 'new-upload', 'live-feed']
        };
      }).filter(Boolean);
    } catch (err) {
      console.warn(`Failed to fetch RSS for ${channel.name}:`, err);
      return [];
    }
  });

  try {
    const results = await Promise.allSettled(fetchPromises);
    const flattened = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    if (flattened.length > 0) {
      // Sort newest first
      const sorted = flattened.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
      // Deduplicate by ID
      const seen = new Set();
      const unique = sorted.filter(v => {
        if (seen.has(v.id)) return false;
        seen.add(v.id);
        return true;
      });

      cacheLiveFeed(unique);
      return unique;
    }
  } catch (err) {
    console.error('Error in fetchLiveCSChannelUploads', err);
  }

  return cached.length > 0 ? cached : [];
};

/**
 * Live search on YouTube with Computer Science educational scoping
 */
export const fetchLiveYouTubeSearch = async (query) => {
  if (!query || !query.trim()) return [];
  const clean = query.trim();

  try {
    // 1. If user supplied custom API Key in Settings, use YouTube Data API v3
    const apiKey = getStoredApiKey();
    if (apiKey) {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(clean + ' computer science')}&type=video&key=${apiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          return data.items.map(item => {
            const inferred = inferSubjectAndTags(item.snippet.title, item.snippet.channelTitle);
            return {
              id: item.id.videoId,
              title: item.snippet.title,
              channel: item.snippet.channelTitle,
              subject: inferred.subject,
              subtopic: inferred.subtopic,
              duration: 'Lecture',
              level: 'YouTube Live Search',
              views: 'Active',
              year: new Date().getFullYear().toString(),
              gateWeightage: inferred.isGate ? 'GATE CS Concept' : 'CS Reference',
              description: item.snippet.description,
              keyTakeaways: ['Dynamic YouTube search result', 'Streamed in AdShield sandbox'],
              tags: inferred.tags
            };
          });
        }
      }
    }

    // 2. Fallback to direct YouTube initialData search scraper via proxy
    const searchUrl = `/api/yt-search/results?search_query=${encodeURIComponent(clean + ' computer science')}`;
    const res = await fetch(searchUrl, {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' }
    });
    
    if (res.ok) {
      const html = await res.text();
      const jsonMatch = html.match(/var ytInitialData = ({.*?});<\/script>/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[1]);
        const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
        const videos = [];

        for (const item of contents) {
          const v = item.videoRenderer;
          if (v && v.videoId && v.title?.runs?.[0]?.text) {
            const rawTitle = v.title.runs[0].text;
            const author = v.ownerText?.runs?.[0]?.text || 'YouTube Creator';
            const inferred = inferSubjectAndTags(rawTitle, author);

            videos.push({
              id: v.videoId,
              title: rawTitle,
              channel: author,
              subject: inferred.subject,
              subtopic: inferred.subtopic,
              duration: v.lengthText?.simpleText || 'Lecture',
              level: 'Live YouTube Search',
              views: v.viewCountText?.simpleText || '',
              year: new Date().getFullYear().toString(),
              gateWeightage: inferred.isGate ? 'GATE Topic' : 'Computer Science',
              description: `Live result for "${clean}". Protected by AdShield.`,
              keyTakeaways: ['Real-time YouTube search result', 'Educational boundary applied'],
              tags: inferred.tags
            });
          }
        }
        if (videos.length > 0) return videos;
      }
    }
  } catch (err) {
    console.warn('Live search fallback to catalog:', err);
  }

  // Fallback to searching our curated catalog if live request fails
  return [];
};

/**
 * Map of CS subjects to optimized educational search terms for YouTube
 */
export const SUBJECT_SEARCH_QUERIES = {
  coa: 'Computer Organization Architecture COA gate lecture',
  compiler: 'Compiler Design parsing lexical gate lecture',
  'digital-logic': 'Digital Logic Design boolean algebra gate',
  os: 'Operating Systems process scheduling memory gate',
  dbms: 'DBMS Database normalization SQL transaction gate',
  networks: 'Computer Networks subnetting TCP IP gate',
  toc: 'Theory of Computation Automata DFA Turing gate',
  'discrete-math': 'Discrete Mathematics Linear Algebra gate',
  'system-design': 'System Design distributed systems interview',
  'interview-prep': 'coding interview preparation leetcode sde sheet',
  'soft-skills': 'communication skills software engineer behavioral interview',
  motivation: 'gate cs motivation engineering consistency study routine',
  'gate-special': 'GATE Computer Science preparation PYQ marathon',
  algorithms: 'Data Structures and Algorithms lecture gate',
  all: 'computer science lecture gate'
};

/**
 * Extracts video items from YouTube search page HTML
 */
export const parseYouTubeSearchHTML = (html, defaultSubject = 'algorithms') => {
  try {
    const jsonMatch = html.match(/var ytInitialData = ({.*?});<\/script>/);
    if (!jsonMatch) return [];
    const data = JSON.parse(jsonMatch[1]);
    const sections = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const videos = [];

    for (const sec of sections) {
      const items = sec.itemSectionRenderer?.contents || [];
      for (const item of items) {
        const v = item.videoRenderer;
        if (v && v.videoId && v.title?.runs?.[0]?.text) {
          const rawTitle = v.title.runs[0].text;
          const author = v.ownerText?.runs?.[0]?.text || 'YouTube Educator';
          const inferred = inferSubjectAndTags(rawTitle, author);

          videos.push({
            id: v.videoId,
            title: rawTitle,
            channel: author,
            subject: defaultSubject !== 'all' ? defaultSubject : (inferred.subject || 'algorithms'),
            subtopic: inferred.subtopic || 'Computer Science Stream',
            duration: v.lengthText?.simpleText || 'Lecture',
            level: 'YouTube Educational Stream',
            views: v.viewCountText?.simpleText || 'Popular',
            year: new Date().getFullYear().toString(),
            gateWeightage: inferred.isGate ? 'GATE CS High-Yield' : 'CS Reference Lecture',
            description: `Live video from ${author}. Streamed in distraction-free AdShield environment.`,
            keyTakeaways: [
              'AdShield distraction-free playback active',
              'Subject-specific educational indexing applied',
              'Instant notes taking and bookmarking supported'
            ],
            tags: [...inferred.tags, 'live-stream', defaultSubject]
          });
        }
      }
    }
    return videos;
  } catch (e) {
    console.warn('Error parsing YouTube HTML:', e);
    return [];
  }
};

/**
 * Fetches real-time YouTube videos dynamically targeted to a specific subject
 * Eliminates the empty 0-lectures state!
 */
export const fetchYouTubeVideosBySubject = async (subjectId = 'coa', page = 1) => {
  const query = SUBJECT_SEARCH_QUERIES[subjectId] || `${subjectId} computer science lecture`;
  const pagedQuery = page > 1 ? `${query} part ${page}` : query;

  try {
    const searchUrl = `/api/yt-search/results?search_query=${encodeURIComponent(pagedQuery)}`;
    let html = '';

    try {
      const res = await fetch(searchUrl, {
        headers: { 'Accept-Language': 'en-US,en;q=0.9' },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) html = await res.text();
    } catch (e) {
      // Fallback proxy
      const fallbackUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.youtube.com/results?search_query=${encodeURIComponent(pagedQuery)}`)}`;
      const res2 = await fetch(fallbackUrl, { signal: AbortSignal.timeout(6000) });
      if (res2.ok) html = await res2.text();
    }

    if (html) {
      const parsed = parseYouTubeSearchHTML(html, subjectId);
      if (parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn(`Failed to dynamically fetch videos for ${subjectId}:`, err);
  }

  // Fallback to core educational videos for this subject
  if (subjectId === 'all') return EDUCATIONAL_VIDEOS;
  return EDUCATIONAL_VIDEOS.filter(v => v.subject === subjectId);
};

/**
 * Fetches popular, iconic CS masterclasses with pagination/continue update
 */
export const fetchPopularCSVideos = async (page = 1) => {
  if (page === 1) {
    return POPULAR_CS_VIDEOS;
  }

  // On page > 1, fetch additional popular/top-rated CS masterclasses from YouTube
  try {
    const pagedQuery = `computer science full course masterclass lecture episode ${page}`;
    const searchUrl = `/api/yt-search/results?search_query=${encodeURIComponent(pagedQuery)}`;
    const res = await fetch(searchUrl, {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const html = await res.text();
      const parsed = parseYouTubeSearchHTML(html, 'algorithms');
      if (parsed.length > 0) {
        return parsed.map(v => ({ ...v, level: 'Popular Stream', tags: [...v.tags, 'popular'] }));
      }
    }
  } catch (err) {
    console.warn('Failed to fetch additional popular videos:', err);
  }

  return [];
};

/**
 * Checks for newly uploaded videos across channels that are not yet in knownVideoIds
 */
export const checkForNewChannelUploads = async (knownVideoIds = new Set()) => {
  const fresh = await fetchLiveCSChannelUploads();
  if (!fresh || fresh.length === 0) return [];
  return fresh.filter(v => !knownVideoIds.has(v.id));
};

/**
 * Caching for Live Feeds
 */
export const getCachedLiveFeed = () => {
  try {
    const raw = localStorage.getItem(LIVE_FEED_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const cacheLiveFeed = (videos) => {
  try {
    localStorage.setItem(LIVE_FEED_CACHE_KEY, JSON.stringify(videos.slice(0, 50)));
  } catch (e) {}
};

/**
 * Educational query validation & boundary enforcement
 */
export const checkEducationalScope = (query) => {
  if (!query) return { isEducational: true, normalizedQuery: '' };
  const lower = query.toLowerCase().trim();

  // Detect clear entertainment/distraction queries
  const nonEducationalPatterns = [
    'funny', 'comedy', 'prank', 'trailer', 'song', 'music', 'gaming', 'vlog',
    'gameplay', 'highlights', 'dance', 'movie', 'reaction', 'tiktok', 'reels', 'drama'
  ];

  const matchedFlag = nonEducationalPatterns.find(p => lower.includes(p));
  if (matchedFlag) {
    return {
      isEducational: false,
      flaggedKeyword: matchedFlag,
      suggestedRedirect: `Computer Science: ${query.replace(new RegExp(matchedFlag, 'gi'), '').trim()} Fundamentals`,
      message: `Distraction Blocker: Filtered non-educational search "${matchedFlag}". Scoped to CS & GATE education.`
    };
  }

  return {
    isEducational: true,
    normalizedQuery: query
  };
};

/**
 * Watch History Management
 */
export const getWatchHistory = () => {
  try {
    const raw = localStorage.getItem(RECENT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addToWatchHistory = (video) => {
  if (!video || !video.id) return;
  const history = getWatchHistory().filter(item => item.id !== video.id);
  const updated = [
    {
      ...video,
      watchedAt: new Date().toISOString()
    },
    ...history
  ].slice(0, 30);
  try {
    localStorage.setItem(RECENT_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving history', e);
  }
  return updated;
};

/**
 * Bookmarks Management
 */
export const getBookmarks = () => {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const toggleBookmark = (video) => {
  if (!video || !video.id) return [];
  const bookmarks = getBookmarks();
  const exists = bookmarks.some(b => b.id === video.id);
  let updated;
  if (exists) {
    updated = bookmarks.filter(b => b.id !== video.id);
  } else {
    updated = [{ ...video, bookmarkedAt: new Date().toISOString() }, ...bookmarks];
  }
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving bookmarks', e);
  }
  return updated;
};

/**
 * YouTube API Key Settings
 */
export const getStoredApiKey = () => {
  return localStorage.getItem(API_KEY_STORAGE) || '';
};

export const saveStoredApiKey = (key) => {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
  }
};
