// Educational Related Video Engine
// Forces recommendations to ONLY be strictly relevant Computer Science / GATE lectures
// Strictly blocks algorithm bloat, clickbait, and unrelated content

import { EDUCATIONAL_VIDEOS } from '../data/csCatalog';

/**
 * Computes related educational videos for a target video
 * @param {Object} currentVideo - The currently playing video
 * @param {Array} catalog - The catalog of educational videos (defaults to EDUCATIONAL_VIDEOS)
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Array} List of strictly relevant CS educational videos with relationship badges
 */
export const getStrictRelatedVideos = (currentVideo, catalog = EDUCATIONAL_VIDEOS, limit = 8) => {
  if (!currentVideo) return [];

  const currentId = currentVideo.id;
  const currentSubject = (currentVideo.subject || '').toLowerCase();
  const currentSubtopic = (currentVideo.subtopic || '').toLowerCase();
  const currentTitle = (currentVideo.title || '').toLowerCase();
  const currentTags = Array.isArray(currentVideo.tags)
    ? currentVideo.tags.map(t => t.toLowerCase())
    : [];

  const scoredVideos = catalog
    .filter(video => video && video.id && video.id !== currentId && /^[a-zA-Z0-9_-]{11}$/.test(video.id))
    .map(video => {
      let score = 0;
      let reasons = [];

      const videoSubject = (video.subject || '').toLowerCase();
      const videoSubtopic = (video.subtopic || '').toLowerCase();
      const videoTitle = (video.title || '').toLowerCase();
      const videoTags = Array.isArray(video.tags)
        ? video.tags.map(t => t.toLowerCase())
        : [];

      // 1. Direct Subject Match (Fundamental constraint)
      if (videoSubject && currentSubject && videoSubject === currentSubject) {
        score += 50;
        reasons.push('Same Subject');
      }

      // 2. Specific Subtopic Match
      if (videoSubtopic && currentSubtopic && videoSubtopic === currentSubtopic) {
        score += 40;
        reasons.push('Direct Topic Alignment');
      }

      // 3. Tag overlap
      const sharedTags = videoTags.filter(t => currentTags.includes(t));
      if (sharedTags.length > 0) {
        score += sharedTags.length * 15;
        reasons.push(`${sharedTags.length} Shared Key Concepts`);
      }

      // 4. Keyword tokens in title overlap
      const currentTitleTokens = currentTitle
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(' ')
        .filter(w => w.length > 3 && !['with', 'from', 'this', 'that', 'into', 'part', 'step'].includes(w));
      
      const videoTitleTokens = videoTitle
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(' ');

      const titleMatches = currentTitleTokens.filter(token => videoTitleTokens.includes(token));
      if (titleMatches.length > 0) {
        score += titleMatches.length * 20;
      }

      // 5. Channel continuity (same lecturer continues curriculum)
      if (video.channel && currentVideo.channel && video.channel === currentVideo.channel) {
        score += 15;
      }

      // Assign an educational relationship badge
      let relationshipBadge = 'Related CS Concept';
      if (reasons.includes('Direct Topic Alignment')) {
        relationshipBadge = 'Next in Topic Sequence';
      } else if (video.gateWeightage && video.gateWeightage.includes('Very High')) {
        relationshipBadge = 'High-Yield GATE PYQ';
      } else if (reasons.includes('Same Subject')) {
        relationshipBadge = 'Core Subject Module';
      }

      return {
        ...video,
        relevanceScore: score,
        relationshipBadge,
        sharedTags
      };
    });

  // Filter out any video that doesn't meet minimum CS relevance
  // In our strict browser, we never allow unrelated videos
  const strictlyRelevant = scoredVideos
    .filter(v => v.relevanceScore > 10)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  // If there are fewer than limit matches (e.g. for niche subtopics),
  // backfill ONLY with same-subject or high-yield GATE videos from the catalog
  if (strictlyRelevant.length < limit) {
    const existingIds = new Set(strictlyRelevant.map(v => v.id));
    const fallback = catalog.filter(v => 
      v.id !== currentId && 
      !existingIds.has(v.id) && 
      (v.subject === currentSubject || v.gateWeightage)
    );
    return [...strictlyRelevant, ...fallback].slice(0, limit);
  }

  return strictlyRelevant.slice(0, limit);
};

/**
 * Filter catalog by search query with CS boundary enforcement
 */
export const searchEducationalCatalog = (query, catalog = EDUCATIONAL_VIDEOS) => {
  if (!query || !query.trim()) return catalog;

  const cleanQuery = query.toLowerCase().trim();
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  return catalog.filter(video => {
    const haystack = [
      video.title,
      video.channel,
      video.subject,
      video.subtopic,
      video.description,
      ...(video.tags || []),
      ...(video.keyTakeaways || [])
    ].join(' ').toLowerCase();

    // Must match at least one token
    return tokens.some(token => haystack.includes(token));
  }).sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    const aHasFull = aTitle.includes(cleanQuery);
    const bHasFull = bTitle.includes(cleanQuery);
    if (aHasFull && !bHasFull) return -1;
    if (!aHasFull && bHasFull) return 1;
    return 0;
  });
};
