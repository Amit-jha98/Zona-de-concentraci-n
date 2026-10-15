// One policy for discovery, saved items, playback and downloads. A search query,
// channel name, description or client-supplied label never approves a video.
import { isTrustedSelfImprovement } from "./selfImprovement.js";

export const CONTENT_POLICY_VERSION = 2;
export const normalizeContentScope = (scope) =>
  scope === "motivation" ? "self-improvement" : scope;
export const CONTENT_SCOPES = [
  "all",
  "cs",
  "exam",
  "self-improvement",
  "soft-skills",
  "music",
];
export const CONTENT_SCOPE_MESSAGE =
  "EduBrowse supports computer science, exam preparation, lifestyle and self-improvement, soft skills and music. Self-improvement talks must come from an approved original channel and last at least 5 minutes.";

const cs =
  /\b(computer science|computing|programming|coding|software|algorithms?|dijkstra|data structures?|leetcode|codeforces|competitive programming|python|javascript|typescript|java|c\+\+|c#|sql|dbms|databases?|operating systems?|computer network(?:ing|s)?|network protocols?|tcp|udp|ipv[46]|subnetting|osi model|deadlocks?|semaphores?|paging|virtual memory|compilers?|automata|turing|formal languages?|machine learning|deep learning|neural networks?|artificial intelligence|gradient descent|backpropagation|cybersecurity|cyber security|cryptography|cloud computing|devops|kubernetes|docker|linux|git|github|react|angular|node\.?js|next\.?js|html|css|web development|web design|app development|game development|system design|digital logic|boolean algebra|logic gates?|computer architecture|computer organization|microprocessors?|assembly language|discrete math(?:ematics)?|linear algebra|calculus|probability|combinatorics|graph theory|number theory|matrices|matrix|eigenvalues?|vector spaces?|lu decomposition|numerical methods|finite (?:state|automata)|regular expressions?|context.free grammars?|normalization|relational algebra|transactions?|acid properties|b trees?|binary (?:search|trees?|heaps?)|hashing|recursion|dynamic programming|linked lists?|stacks? and queues?|c (?:language|programming)|pointers?|memory management|distributed systems?|load balanc(?:ing|er)|rest api|apis?|object.oriented|oop|design patterns?|cache (?:memory|coherence)|instruction (?:sets?|pipeline)|database management|data science)\b/i;
// Syllabus concepts often appear without "computer science" in their title.
const foundations =
  /\b(first.order logic|propositional logic|set theory|sets? and relations|relations and functions|discrete (?:maths|structures?)|engineering mathematics|equivalence classes|semigroups?|monoids?|group theory|algebraic structures|lattices|poset|bipartite|graph (?:matching|connectivity|traversals?|traversing)|graphs?\s*[-:]?\s*connectivity|inclusion.exclusion|recurrence|recurrences|differentiability|mean value theorem|rolle['’]?s theorem|real analysis|definite integration|indefinite integration|integration solved problem|mathematical expectation|standard deviation|random variables?|(?:normal|exponential|poisson|binomial) distribution|digital electronics|karnaugh|k.map|quine.mccluskey|sop and pos|canonical sum of product|adders?|multiplexers?|flip.?flops?|sequential circuits|ripple counters|computer organisation|computer system|instruction formats?|addressing modes?|arithmetic logic unit|microprogrammed|memory interfacing|address decoding|memory hierarchy|cache (?:mapping|replacement|updation)|write (?:through|back) cache|fixed.{0,12}floating point|floating.point|ieee 754|number systems?|hexadecimal|instruction pipelining|pipeline conflicts|pipelining|data types|operator precedence|dynamic memory allocation|malloc|calloc|realloc|[23]d arrays|infix|postfix|circular queue|heaps?|time (?:and|&) space complexity|time complexity|master(?:s)? (?:theorem|method)|divide and conquer|quicksort|merge ?sort|radix sort|counting sort|sorting concept|bfs|dfs|breadth first search|depth first search|nfa|dfa|theory of computation|regular languages|pumping lemma|context free languages|undecidability|decidability|syntax analysis|parsing|parsers?|syntax directed translation|intermediate code|code (?:generation|optimization)|liveness analysis|dataflow analysis|control flow graph|basic blocks|constant folding|constant propagation|loop jamming|strength reduction|subexpression elimination|system calls|processes and threads|inter.?process communication|problems of synchronization|cpu scheduling|file (?:systems?|allocation|organization)|relational model|entity relationship|attribute closure|functional dependenc(?:y|ies)|normal forms|lossless.join|dependency preserving|network (?:performance|layer|address|socket)|networking basics|routing protocols?|packet switching|error detection|cyclic redundancy|data link layer|media access control|ethernet|cidr|ip fragmentation|dns|http|stateful and stateless protocols)\b|\bc\+\+(?=\W|$)/i;
const exams =
  /\b(gate(?:\s*(?:cs|cse|20\d\d|exam|preparation|aptitude))?|exam(?:ination)?(?:s)?|exam prep|test prep|competitive exams?|entrance (?:test|exam)|jee|neet|upsc|ssc|bank(?:ing)? (?:exam|po)|cat (?:exam|preparation|quant)|gre|gmat|sat prep|ugc net|csir net|previous year (?:questions?|papers?)|pyqs?|mock tests?|quantitative aptitude|logical reasoning|numerical aptitude|verbal aptitude)\b/i;
const motivationalHype =
  /\b(motivational (?:speech|video|compilation|edit)|powerful motivation|motivation for (?:study|students|success|exams)|sigma|grindset)\b/i;
const softSkills =
  /\b(soft skills?|communication skills?|effective communication|public speaking|interpersonal skills?|active listening|emotional intelligence|conflict resolution|teamwork|team building|leadership skills?|workplace|professional etiquette|business (?:communication|english)|spoken english|english speaking|speak (?:english|confidently)|presentation skills?|negotiation skills?|behavioral interview|behavioural interview|job interview|interview (?:preparation|questions?|tips|skills|practice)|mock interview|resume|curriculum vitae|cover letter|tell me about yourself|star (?:method|interview|technique)|salary negotiation|career (?:advice|development|guidance)|assertiveness|self.confidence)\b/i;
const music =
  /\b(songs?|music|lyrics?|lyrical|soundtrack|instrumental|lo[ -]?fi|(?:rap|trap|chill|study|hip.hop) beats?|jukebox|melody|melodies|piano cover|guitar cover|acoustic cover|official (?:audio|visualizer)|audio (?:track|jukebox)|bhajan|qawwali|ghazal|sangeet|gaana|gana)\b|गीत|संगीत|गाना|भजन|गाने/i;
const unrelated =
  /\b(gameplay|playthrough|walkthrough|let['’]?s play|gaming stream|gaming live|free fire|pubg|bgmi|fortnite|minecraft|gta\s*[v56]|roblox|cricket|football|soccer|ipl|nba|wwe|sports? highlights?|match highlights?|world cup|movie(?:s)?|film(?:s)?|web series|episode|trailer|teaser|reality show|bigg boss|celebrity|gossip|pranks?|comedy|funny|memes?|vlogs?|daily routine|cooking|recipes?|makeup|beauty tips|fashion|unboxing|travel vlog|political|politics|breaking news|astrology|horoscope|weight loss|workout|bodybuilding|yoga)\b/i;
// Explicit crossover contexts: building a game or a movie app is still CS;
// a film's song is still music. Generic keyword stuffing does not qualify.
const softwareCrossover =
  /\b(?:build(?:ing)?|cod(?:e|ing)|develop(?:ment|ing)?|implement(?:ing)?|programming)\b.{0,60}\b(?:game|movie|netflix|youtube|app|website|software|clone)\b|\bgame development\b/i;
const songCrossover =
  /\b(?:song|lyrics|lyrical|soundtrack|official music video|official audio|music video)\b|गीत|गाना|भजन/i;
const hardExclude =
  /\b(pranks?|gossip|gameplay|playthrough|funny moments|match highlights?|reaction video|movie review|film review|music video reaction|song reaction)\b/i;
const ambiguousNonCS =
  /\b(?:python|pythons)\b.{0,45}\b(?:snake|eats?|eating|feeding|reptile|deer)|\b(?:snake|reptile|feeding)\b.{0,45}\bpython\b|\breact(?:ing|ion)?\b.{0,40}\b(?:song|music|trailer|movie|meme)|\bjava\b.{0,30}\b(?:island|tourism|vacation)\b/i;

function textOf(value) {
  return typeof value === "string"
    ? value.normalize("NFKC").replace(/[_|]/g, " ").trim()
    : "";
}

export function contentDomains(video) {
  const title = textOf(video?.title);
  if (
    !title ||
    ((hardExclude.test(title) || ambiguousNonCS.test(title)) &&
      !softwareCrossover.test(title))
  )
    return [];
  const domains = [];
  const isSelfImprovement = isTrustedSelfImprovement(video);
  if (motivationalHype.test(title) && !isSelfImprovement) return [];
  const isCS = cs.test(title) || foundations.test(title);
  const isMusic =
    (!isCS && music.test(title)) ||
    String(video?.categoryId) === "10" ||
    (Array.isArray(video?.categories) &&
      video.categories.some((c) => /^music$/i.test(c)));
  const isExam = exams.test(title);
  const isSoftSkills = softSkills.test(title);
  if (
    unrelated.test(title) &&
    !softwareCrossover.test(title) &&
    !(isMusic && songCrossover.test(title)) &&
    !isExam &&
    !isSelfImprovement
  )
    return [];
  if (isCS) domains.push("cs");
  if (isExam) domains.push("exam");
  if (isSelfImprovement) domains.push("self-improvement");
  if (isSoftSkills) domains.push("soft-skills");
  if (isMusic) domains.push("music");
  return domains;
}

export function isAllowedVideo(video, scope = "all") {
  scope = normalizeContentScope(scope);
  const domains = contentDomains(video);
  return (
    CONTENT_SCOPES.includes(scope) &&
    (scope === "all" ? domains.length > 0 : domains.includes(scope))
  );
}

export function allowedVideos(videos, scope = "all") {
  return (Array.isArray(videos) ? videos : []).filter((video) =>
    isAllowedVideo(video, scope),
  );
}

// Ambiguous queries (e.g. an artist's name) may search; each returned item must
// independently qualify. Explicitly unrelated searches stop before upstream I/O.
export function isAllowedQuery(query) {
  const title = textOf(query);
  return (
    !!title &&
    ((!unrelated.test(title) && !hardExclude.test(title)) ||
      contentDomains({ title }).length > 0)
  );
}
