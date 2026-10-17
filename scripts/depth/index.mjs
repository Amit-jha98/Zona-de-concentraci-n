import mathematics from "./mathematics.mjs";
import hardware from "./hardware.mjs";
import algorithms from "./algorithms.mjs";
import theory from "./theory.mjs";
import systems from "./systems.mjs";
import networks from "./networks.mjs";
import reviews from "./practice-reviews.mjs";
const content={ ...mathematics, ...hardware, ...algorithms, ...theory, ...systems, ...networks };
for(const [id,[changes,answer,solution]] of Object.entries(reviews)){
  const question=content[id].questions.find(q=>q.type==="MSQ");
  for(const [index,text]of Object.entries(changes))question.options[Number(index)]=text;
  question.answer=answer;question.solution=solution;
}
export default content;
export const prerequisites = {
  "first-order-logic":"propositional-logic",relations:"sets",functions:"relations","partial-orders":"relations",lattices:"partial-orders",monoids:"sets",groups:"monoids",
  "graph-connectivity":"sets","graph-matching":"graph-connectivity","graph-colouring":"graph-connectivity",counting:"sets",recurrences:"counting","generating-functions":"recurrences",
  determinants:"matrices","linear-equations":"matrices",eigenvalues:"determinants","lu-decomposition":"linear-equations",limits:"functions",
  "continuity-differentiability":"limits","maxima-minima":"continuity-differentiability","mean-value-theorem":"continuity-differentiability",integration:"continuity-differentiability",
  "conditional-bayes":"counting","random-variables":"conditional-bayes","mean-variance":"random-variables","median-mode":"mean-variance",
  "uniform-distribution":"random-variables integration","normal-distribution":"mean-variance integration","exponential-distribution":"random-variables integration",
  "poisson-distribution":"random-variables counting","binomial-distribution":"random-variables counting",
  "algebraic-minimization":"boolean-algebra","karnaugh-maps":"algebraic-minimization","tabular-minimization":"algebraic-minimization",adders:"boolean-algebra",
  "multiplexers-decoders":"boolean-algebra","latches-flipflops":"boolean-algebra","fsm-design":"latches-flipflops","counters-registers":"latches-flipflops",
  "fixed-point":"number-systems","floating-point":"number-systems","instruction-set":"number-systems","addressing-modes":"instruction-set",
  "alu-design":"adders fixed-point","hardwired-control":"fsm-design alu-design","microprogrammed-control":"hardwired-control","memory-interfacing":"number-systems",
  "memory-hierarchy":"memory-interfacing","cache-mapping":"memory-hierarchy","cache-policies":"cache-mapping","interrupts-dma":"instruction-set",
  "instruction-pipelining":"instruction-set","pipeline-hazards":"instruction-pipelining",
  "c-pointers":"c-types-control","c-memory":"c-pointers",recursion:"c-memory",arrays:"c-pointers",stacks:"arrays",queues:"arrays","linked-lists":"c-pointers",
  "trees-traversals":"recursion","binary-search-trees":"trees-traversals","binary-heaps":"trees-traversals","graph-representations":"arrays linked-lists",
  "asymptotic-analysis":"c-types-control","algorithm-recurrences":"asymptotic-analysis recursion",searching:"arrays asymptotic-analysis",
  "comparison-sorting":"asymptotic-analysis","quicksort":"comparison-sorting recursion","noncomparison-sorting":"comparison-sorting",
  hashing:"arrays asymptotic-analysis","divide-conquer":"algorithm-recurrences",greedy:"asymptotic-analysis","dynamic-programming":"recursion asymptotic-analysis",
  "graph-traversals":"graph-representations queues stacks","minimum-spanning-trees":"graph-traversals greedy","shortest-paths":"graph-traversals dynamic-programming",
  dfa:"sets",nfa:"dfa","regular-expressions":"dfa","dfa-minimization":"dfa","pumping-regular":"regular-expressions",
  "context-free-grammars":"regular-expressions","pushdown-automata":"context-free-grammars stacks","cfl-pumping-closure":"pushdown-automata pumping-regular",
  "turing-machines":"dfa","undecidability":"turing-machines","lexical-analysis":"regular-expressions","first-follow":"context-free-grammars",
  "ll-parsing":"first-follow","lr-parsing":"first-follow","syntax-directed-translation":"context-free-grammars","runtime-environments":"recursion",
  "intermediate-code":"syntax-directed-translation","basic-blocks":"intermediate-code","constant-propagation":"basic-blocks",
  "liveness-analysis":"basic-blocks","common-subexpressions":"basic-blocks",
  processes:"system-calls",threads:"processes",ipc:"processes","race-conditions":"threads",semaphores:"race-conditions",deadlocks:"semaphores",
  "cpu-scheduling":"processes","io-scheduling":"system-calls",paging:"memory-hierarchy","virtual-memory":"paging","file-systems":"paging",
  "relational-model":"sets","relational-algebra":"relational-model","tuple-calculus":"relational-algebra first-order-logic",
  "sql-joins":"relational-algebra","sql-grouping":"sql-joins","functional-dependencies":"relational-model","normal-forms":"functional-dependencies",
  decomposition:"normal-forms","file-organization":"relational-model","b-plus-trees":"file-organization trees-traversals",transactions:"relational-model",
  serializability:"transactions","concurrency-recovery":"serializability semaphores",
  "network-switching":"network-layering","network-performance":"network-switching","error-detection":"number-systems",
  "flow-control-arq":"network-performance","medium-access":"network-performance",ethernet:"medium-access",routing:"shortest-paths",
  "ipv4-cidr":"number-systems network-layering","ipv4-fragmentation":"ipv4-cidr",nat:"ipv4-cidr","tcp-flow-control":"flow-control-arq",
  "tcp-congestion":"tcp-flow-control","socket-api":"tcp-flow-control",dns:"network-layering",http:"dns tcp-flow-control",
};
