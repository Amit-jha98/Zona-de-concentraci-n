import { SELF_IMPROVEMENT_QUERY } from "../../shared/selfImprovement.js";

export const CATEGORIES = [
  {
    id: "all",
    name: "All",
    query: "computer science algorithms programming tutorial",
  },
  {
    id: "music",
    name: "Music & songs",
    query: "Hindi English songs official music audio",
    scope: "music",
  },
  {
    id: "self-improvement",
    name: "Lifestyle & self-improvement",
    query: SELF_IMPROVEMENT_QUERY,
    scope: "self-improvement",
  },
  {
    id: "algorithms",
    name: "Data structures & algorithms",
    query: "data structures algorithms tutorial",
  },
  {
    id: "gate",
    name: "GATE CS",
    query: "GATE computer science concept lecture",
  },
  {
    id: "web",
    name: "Development",
    query: "web development programming tutorial",
  },
  {
    id: "ai",
    name: "AI & machine learning",
    query: "machine learning artificial intelligence computer science lecture",
  },
  {
    id: "os",
    name: "Operating systems",
    query: "operating system computer science tutorial",
  },
  { id: "dbms", name: "Databases", query: "database SQL DBMS tutorial" },
  { id: "networks", name: "Networks", query: "computer networks tutorial" },
  {
    id: "system-design",
    name: "System design",
    query: "software system design architecture interview",
  },
  {
    id: "interview",
    name: "Interview preparation",
    query: "software engineer coding behavioral interview preparation",
  },
  {
    id: "soft-skills",
    name: "Communication & soft skills",
    query: "communication skills workplace behavioral interview STAR",
    scope: "soft-skills",
  },
  {
    id: "security",
    name: "Security",
    query: "computer cybersecurity network security tutorial",
  },
  {
    id: "cloud",
    name: "Cloud & DevOps",
    query: "cloud computing docker kubernetes devops tutorial",
  },
];

export function getCategory(id) {
  const canonical = id === "motivation" ? "self-improvement" : id;
  return CATEGORIES.find((category) => category.id === canonical);
}

// Starter references only. Live search is separate and never relabels these as new uploads.
// No invented view counts, publication dates or durations.
export const STARTER_VIDEOS = [
  ["XB4MIexjvY0", "Dijkstra’s algorithm", "Abdul Bari", "algorithms"],
  ["0IAPZzGSbME", "Introduction to algorithms", "Abdul Bari", "algorithms"],
  [
    "RBSGKlAvoiM",
    "Data structures: an introduction",
    "freeCodeCamp.org",
    "algorithms",
  ],
  [
    "8hly31xKli0",
    "Algorithms and data structures",
    "freeCodeCamp.org",
    "algorithms",
  ],
  ["rfscVS0vtbw", "Learn Python", "freeCodeCamp.org", "web"],
  ["PkZNo7MFNFg", "Learn JavaScript", "freeCodeCamp.org", "web"],
  ["HXV3zeQKqGY", "SQL tutorial", "freeCodeCamp.org", "dbms"],
  ["aircAruvnKk", "But what is a neural network?", "3Blue1Brown", "ai"],
  [
    "IHZwWFHWa-w",
    "Gradient descent, how neural networks learn",
    "3Blue1Brown",
    "ai",
  ],
  ["8JJ101D3knE", "Git tutorial for beginners", "Programming with Mosh", "web"],
  ["IPvYjXCsTg8", "Computer networking", "Kunal Kushwaha", "networks"],
].map(([id, title, channel, subject]) => ({
  id,
  title,
  channel,
  subject,
  source: "starter",
  thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
}));

export const CHANNELS = [
  { id: "UCJihyK0A38SZ6SdJirEdIOw", name: "Gate Smashers", subject: "gate" },
  {
    id: "UCJskGeByzRRSvmOyZOz61ig",
    name: "take U forward",
    subject: "interview",
  },
  { id: "UC_mYaQAE6-71rjSN6CeCA-g", name: "NeetCode", subject: "interview" },
  { id: "UC8butISFwT-Wl7EV0hUK0BQ", name: "freeCodeCamp.org", subject: "web" },
  { id: "UCZCFT11CWBi3MHNlGf019nw", name: "Abdul Bari", subject: "algorithms" },
  {
    id: "UCEBb1b_L6zDS3xTUrIALZOw",
    name: "MIT OpenCourseWare",
    subject: "all",
  },
];
