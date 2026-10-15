import { durationSeconds } from "./video.js";

export const SELF_IMPROVEMENT_QUERY = "Lifestyle and self-improvement";
export const MIN_SELF_IMPROVEMENT_SECONDS = 300;
// Identities verified from the original channels, not names in search results.
// A source qualifies the publisher; individual talks still need a relevant topic.
export const SELF_IMPROVEMENT_SOURCES = [
  {
    id: "UCAuUUnT6oDeKwE6v1NGQxug",
    name: "TED",
    query: "habits",
    reference:
      "https://www.ted.com/about/our-organization/our-policies-terms/ted-talks-usage-policy",
  },
  {
    id: "UC4EY_qnSeAP1xGsh61eOoJA",
    name: "YaleCourses",
    query: "happiness",
    reference:
      "https://news.yale.edu/2011/04/15/yale-adds-10-new-open-yale-courses",
  },
  {
    id: "UCYeF244yNGuFefuFKqxIAXw",
    name: "The Royal Institution",
    query: "sleep",
    reference: "https://www.rigb.org/about-us/what-we-do",
  },
];
export const SELF_IMPROVEMENT_TOPICS = [
  "Habits",
  "Focus",
  "Learning",
  "Sleep",
  "Stress",
  "Happiness",
];

const topic =
  /\b(self.improvement|self.control|self.discipline|self.compassion|habits?|procrastinat\w*|focus|attention|concentration|learning|memory|sleep|body clock|circadian|stress|burnout|resilience|mindfulness|meditation|happiness|well.being|wellness|good life|time management|decision.making|emotional regulation|healthy (?:living|lifestyle|relationships)|life satisfaction|behavio[u]?r change|growth mindset)\b/i;
const lowQuality =
  /#\s*(?:shorts?|reels?)\b|\b(?:shorts?|reels?|tiktok|compilation|mashup|status video|sigma|grindset|no pain no gain|motivational edit)\b/i;

export function isSelfImprovementTopic(title) {
  return typeof title === "string" && topic.test(title.normalize("NFKC"));
}

export function isTrustedSelfImprovement(video) {
  return (
    SELF_IMPROVEMENT_SOURCES.some((source) => source.id === video?.channelId) &&
    durationSeconds(video?.duration) >= MIN_SELF_IMPROVEMENT_SECONDS &&
    !video?.isShort &&
    !video?.isLive &&
    !lowQuality.test(video?.title || "") &&
    isSelfImprovementTopic(video?.title)
  );
}
