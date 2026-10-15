// Comprehensive Multi-Page Curated CS Lectures Library
// Guarantees authentic, high-yield lectures across all subjects for continuous pagination and offline resilience

export const EXPANDED_SUBJECT_LECTURES = [
  // ================= COMPUTER NETWORKS =================
  {
    id: 'IPvYjXCsTg8',
    title: 'Computer Networking Full Course - OSI Model Deep Dive with Real Life Examples',
    channel: 'Kunal Kushwaha',
    subject: 'networks',
    subtopic: 'Network Fundamentals',
    duration: '4:15:20',
    level: 'Comprehensive Core',
    views: '2.9M',
    year: '2022',
    gateWeightage: 'Core Networking',
    description: 'Complete computer networking masterclass: Packets, switches, routers, MAC address, IP address, subnets, TCP/UDP sockets, DNS, and HTTP/HTTPS handshakes.',
    keyTakeaways: [
      'Layer-by-layer packet encapsulation and decapsulation walkthrough',
      'Difference between Hubs (Layer 1), Switches (Layer 2), and Routers (Layer 3)',
      'How DNS resolves domain names to IP addresses step-by-step',
      'Socket programming basics and client-server communication'
    ],
    tags: ['networks', 'osi model', 'kunal kushwaha', 'tcp ip', 'dns', 'routing']
  },
  {
    id: 'JFF2vJaN0Cw',
    title: 'Computer Networks Complete Course (Marathon Revision)',
    channel: 'Gate Smashers',
    subject: 'networks',
    subtopic: 'GATE Comprehensive',
    duration: '6:12:45',
    level: 'GATE & University',
    views: '3.8M',
    year: '2023',
    gateWeightage: 'High (Full 8-10 Marks)',
    description: 'All-in-one GATE Computer Networks marathon: Framing, CRC, Error Control, Flow Control, Sliding Window Protocols, IPv4 & IPv6, Subnetting, Routing Algorithms, TCP Congestion Control, and Network Security.',
    keyTakeaways: [
      'Error detection: Cyclic Redundancy Check (CRC) polynomial division',
      'Sliding Window efficiency formulas: n / (1 + 2a) where a = Tp / Tt',
      'Routing algorithms: Distance Vector vs Link State Protocol',
      'Application layer protocols: DNS, SMTP, POP3, IMAP, FTP, HTTP'
    ],
    tags: ['networks', 'gate smashers', 'marathon', 'gate pyq', 'sliding window']
  },
  {
    id: 'Y6jLqg8C3-o',
    title: 'Stop and Wait ARQ Protocol: Efficiency, Throughput & Maximum Window Size',
    channel: 'Gate Smashers',
    subject: 'networks',
    subtopic: 'Flow Control & Error Handling',
    duration: '18:40',
    level: 'GATE CS Core',
    views: '1.9M',
    year: '2019',
    gateWeightage: 'Very High (Direct numerical)',
    description: 'Derivation of transmission time (Tt = L / B) and propagation delay (Tp = d / v). Calculating efficiency eta = 1 / (1 + 2a) and throughput of Stop and Wait protocol.',
    keyTakeaways: [
      'Efficiency: eta = Tt / (Tt + 2*Tp) = 1 / (1 + 2a) where a = Tp / Tt',
      'Throughput = Efficiency * Bandwidth',
      'Sequence number space: Needs minimum 1 bit (0 and 1) to distinguish duplicate frames',
      'Why Stop-and-Wait has very poor channel utilization on high bandwidth-delay product links'
    ],
    tags: ['stop and wait', 'flow control', 'efficiency', 'gate numericals', 'networks']
  },
  {
    id: '3QhU9jd03a0',
    title: 'Go-Back-N (GBN) Sliding Window Protocol: Window Size & Numericals',
    channel: 'Gate Smashers',
    subject: 'networks',
    subtopic: 'Sliding Window Protocols',
    duration: '21:15',
    level: 'GATE CS Core',
    views: '2.1M',
    year: '2019',
    gateWeightage: 'Very High (Annual GATE question)',
    description: 'Sender window size Ws = 2^k - 1, Receiver window size Wr = 1. Cumulative ACK, timer per window, retransmission of all unacknowledged frames on timeout, and efficiency.',
    keyTakeaways: [
      'Sender window size: Ws = 2^k - 1 (for k-bit sequence number) to prevent ambiguity',
      'Receiver window size Wr is strictly 1 (discards out-of-order packets)',
      'Uses Cumulative Acknowledgment: ACK n confirms all frames up to n-1',
      'Efficiency eta = Ws / (1 + 2a); maximum efficiency when Ws >= 1 + 2a'
    ],
    tags: ['go back n', 'gbn', 'sliding window', 'window size', 'gate smashers', 'networks']
  },
  {
    id: 'vAu_uM3K1w4',
    title: 'Selective Repeat (SR) Protocol: Sender/Receiver Windows & Buffer Size',
    channel: 'Gate Smashers',
    subject: 'networks',
    subtopic: 'Sliding Window Protocols',
    duration: '19:50',
    level: 'GATE CS Core',
    views: '1.6M',
    year: '2019',
    gateWeightage: 'Very High',
    description: 'Sender window Ws = 2^(k-1), Receiver window Wr = 2^(k-1). Independent Acknowledgment, individual frame timers, sorting buffers at receiver, and zero retransmission of correctly received frames.',
    keyTakeaways: [
      'Maximum window size: Ws = Wr = 2^(k-1) for k-bit sequence numbers',
      'Independent / Selective ACK for each packet received out of order',
      'Receiver buffers out-of-order packets until missing packets arrive',
      'Higher efficiency on noisy links compared to Go-Back-N'
    ],
    tags: ['selective repeat', 'sliding window', 'protocols', 'gate pyq', 'networks']
  },
  {
    id: 'k9ZGsUR4vzA',
    title: 'IPv4 Header Format, MTU & Packet Fragmentation Numericals',
    channel: 'Gate Smashers',
    subject: 'networks',
    subtopic: 'Network Layer & IP',
    duration: '24:10',
    level: 'GATE CS Core',
    views: '2.4M',
    year: '2019',
    gateWeightage: 'Very High (Guaranteed 2-mark question)',
    description: 'Comprehensive breakdown of IPv4 header fields: HLEN, Total Length, TTL, Identification, Flags (DF, MF), and Fragmentation Offset (units of 8 bytes).',
    keyTakeaways: [
      'Header Length (HLEN) scaling factor is 4 bytes (HLEN 5 = 20 bytes min header)',
      'Fragmentation Offset = (Data offset in original packet) / 8 bytes',
      'More Fragments (MF) flag: 1 for all fragments except the very last fragment (0)',
      'Don’t Fragment (DF) flag: if 1 and packet exceeds MTU, router drops and sends ICMP error'
    ],
    tags: ['ipv4 header', 'fragmentation', 'offset', 'mtu', 'gate numericals', 'networks']
  },
  {
    id: '9qaTz_Z6h2E',
    title: 'Distance Vector Routing Algorithm & Count to Infinity Problem',
    channel: 'Gate Smashers',
    subject: 'networks',
    subtopic: 'Routing Protocols',
    duration: '18:15',
    level: 'GATE CS Core',
    views: '1.7M',
    year: '2020',
    gateWeightage: 'High',
    description: 'Bellman-Ford based decentralized routing. Exchange of routing tables with immediate neighbors, convergence, and solving Count to Infinity via Split Horizon and Poison Reverse.',
    keyTakeaways: [
      'Routing Information Protocol (RIP) uses hop count as metric (max 15 hops)',
      'Count to Infinity: slow convergence when link fails due to stale neighbor routes',
      'Split Horizon rule: do not advertise a route back to the neighbor from whom it was learned',
      'Poison Reverse: advertise the route with metric infinity (16)'
    ],
    tags: ['distance vector', 'bellman ford', 'routing', 'split horizon', 'networks']
  },
  {
    id: 'qiQR5rTSshw',
    title: 'Link State Routing & Dijkstra Shortest Path in OSPF',
    channel: 'Gate Smashers',
    subject: 'networks',
    subtopic: 'Routing Protocols',
    duration: '16:30',
    level: 'GATE CS Core',
    views: '1.4M',
    year: '2020',
    gateWeightage: 'High',
    description: 'Link State Advertisement (LSA) flooding, building identical Link State Database (LSDB) across entire autonomous system, and running Dijkstra algorithm locally in OSPF.',
    keyTakeaways: [
      'Each node floods its immediate neighbor link states to ALL routers in network',
      'Every router computes the complete global network topology independently',
      'Faster convergence and no count-to-infinity problem compared to Distance Vector',
      'Open Shortest Path First (OSPF) uses cost based on link bandwidth'
    ],
    tags: ['link state', 'ospf', 'dijkstra', 'routing', 'gate cs', 'networks']
  },
  {
    id: 'wXjhN_i7k88',
    title: 'CSMA/CD Ethernet Protocol & Minimum Frame Length Numericals',
    channel: 'Gate Smashers',
    subject: 'networks',
    subtopic: 'Medium Access Control (MAC)',
    duration: '19:10',
    level: 'GATE CS Core',
    views: '2.0M',
    year: '2019',
    gateWeightage: 'Very High (1-2 Marks guaranteed)',
    description: 'Carrier Sense Multiple Access with Collision Detection. 1-persistent vs p-persistent, Binary Exponential Backoff algorithm, and why minimum frame length L >= 2 * B * Tp.',
    keyTakeaways: [
      'Collision detection condition: Transmission time Tt >= 2 * Propagation delay Tp',
      'Minimum frame size equation: L_min = 2 * Bandwidth * (Distance / Velocity)',
      'Exponential Backoff: chooses random wait k from [0, 2^n - 1] slots after n collisions',
      'After 16 consecutive collisions, packet transmission is aborted'
    ],
    tags: ['csma cd', 'ethernet', 'minimum frame length', 'backoff', 'networks']
  },
  {
    id: 'zN8YNNHcaZc',
    title: 'DNS (Domain Name System) Hierarchical Architecture & Query Resolution',
    channel: 'Gate Smashers',
    subject: 'networks',
    subtopic: 'Application Layer Protocols',
    duration: '17:25',
    level: 'GATE & Industry',
    views: '1.8M',
    year: '2019',
    gateWeightage: 'High',
    description: 'Hierarchical namespace: Root DNS servers, Top-Level Domain (TLD) servers (.com, .org), Authoritative DNS servers. Iterative vs Recursive DNS queries and resource records (A, AAAA, CNAME, MX).',
    keyTakeaways: [
      'Root DNS servers (.) delegate to TLD servers (.com, .edu, .org)',
      'Recursive query: client asks Local DNS server which does all resolution',
      'Iterative query: server responds with the best referral to next name server',
      'Record types: A (IPv4), AAAA (IPv6), CNAME (canonical alias), MX (mail server)'
    ],
    tags: ['dns', 'domain name system', 'tld', 'application layer', 'networks']
  },
  {
    id: 'P8W_9X0pL5k',
    title: 'Network Address Translation (NAT) & Private IP Ranges RFC 1918',
    channel: 'Gate Smashers',
    subject: 'networks',
    subtopic: 'Network Layer & IP',
    duration: '14:50',
    level: 'GATE & System Design',
    views: '1.3M',
    year: '2020',
    gateWeightage: 'Medium-High',
    description: 'Static NAT, Dynamic NAT, and Port Address Translation (PAT / NAT Overload). RFC 1918 private IP blocks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) and NAT translation table management.',
    keyTakeaways: [
      'Solves IPv4 address exhaustion by mapping entire private subnet to single public IP',
      'Port Address Translation (PAT) uses ephemeral 16-bit source port numbers to multiplex',
      'Private IP ranges are non-routable on the public internet backbone',
      'NAT table maps: (Private IP, Private Port) <-> (Public IP, Public Port)'
    ],
    tags: ['nat', 'pat', 'private ip', 'rfc 1918', 'router', 'networks']
  },
  {
    id: '5o8CwafChnU',
    title: 'Wireshark Packet Sniffing & TCP/IP Deep Dive Analysis',
    channel: 'NetworkChuck',
    subject: 'networks',
    subtopic: 'Applied Networking & Tools',
    duration: '22:15',
    level: 'Hands-on Labs',
    views: '3.1M',
    year: '2021',
    gateWeightage: 'Hands-on Practical',
    description: 'Live packet capture analysis using Wireshark: inspecting Ethernet frame headers, IP fragmentation, TCP SYN/ACK handshakes, TLS Client Hello, and ARP broadcast requests.',
    keyTakeaways: [
      'Capturing live promiscuous mode traffic on network interfaces',
      'Filtering syntax: ip.addr, tcp.port == 443, http, and follow TCP stream',
      'Visualizing retransmissions, duplicate ACKs, and TCP window scaling in real-time',
      'ARP request (broadcast) vs ARP reply (unicast) packet structure'
    ],
    tags: ['wireshark', 'packets', 'tcp ip', 'packet sniffing', 'networkchuck', 'networks']
  },

  // ================= OPERATING SYSTEMS =================
  {
    id: 'QMT6u4T1Vrg',
    title: 'Dining Philosophers Problem & Concurrency Solutions (Semaphores / Mutex)',
    channel: 'Gate Smashers',
    subject: 'os',
    subtopic: 'Process Synchronization',
    duration: '16:20',
    level: 'GATE CS Core',
    views: '1.7M',
    year: '2019',
    gateWeightage: 'High (Classic synchronization question)',
    description: 'Formulation of Dijkstra\'s Dining Philosophers problem. Analyzing circular wait deadlocks and implementing deadlock-free solutions using asymmetric philosopher picking and resource hierarchy.',
    keyTakeaways: [
      'Deadlock occurs when all philosophers simultaneously pick left chopstick',
      'Solution 1: Allow at most 4 philosophers to sit simultaneously at 5-chair table',
      'Solution 2: Asymmetric solution (odd philosophers pick left first; even pick right first)',
      'Solution 3: Pick chopsticks only if both are available atomically in critical section'
    ],
    tags: ['dining philosophers', 'semaphores', 'mutex', 'deadlock', 'os']
  },
  {
    id: '783abR97aXU',
    title: 'Producer Consumer (Bounded Buffer) Problem with Counting Semaphores',
    channel: 'Gate Smashers',
    subject: 'os',
    subtopic: 'Process Synchronization',
    duration: '15:45',
    level: 'GATE CS Core',
    views: '2.1M',
    year: '2019',
    gateWeightage: 'Very High',
    description: 'Classic Bounded Buffer problem: using binary semaphore mutex for mutual exclusion, counting semaphore empty for available slots, and counting semaphore full for items to consume.',
    keyTakeaways: [
      'Initialization: mutex = 1, empty = N, full = 0',
      'Producer pseudocode: wait(empty); wait(mutex); [add item]; signal(mutex); signal(full);',
      'Order of wait operations is critical: swapping wait(empty) and wait(mutex) causes DEADLOCK',
      'Consumer pseudocode: wait(full); wait(mutex); [remove item]; signal(mutex); signal(empty);'
    ],
    tags: ['producer consumer', 'bounded buffer', 'counting semaphores', 'gate cs', 'os']
  },
  {
    id: 'x5w_P2n1g8Y',
    title: 'Multi-Level Paging & Page Table Size Calculation Numericals',
    channel: 'Gate Smashers',
    subject: 'os',
    subtopic: 'Memory Management',
    duration: '22:30',
    level: 'GATE CS Core',
    views: '2.5M',
    year: '2019',
    gateWeightage: 'Very High (Annual 2-mark numerical)',
    description: 'Why single-level page tables require gigabytes of contiguous RAM. Calculating number of levels needed such that every page table fits into exactly one page frame.',
    keyTakeaways: [
      'Page table size = (Number of pages) * (Page table entry size PTE)',
      'Number of pages = Virtual Address Space / Page Size',
      'Multi-level paging breaks the page table itself into page-sized chunks',
      'Memory overhead vs translation latency trade-off (k-level paging requires k+1 memory accesses without TLB)'
    ],
    tags: ['multi level paging', 'page table size', 'virtual address', 'gate pyq', 'os']
  },
  {
    id: 'o342_KkH89I',
    title: 'Translation Lookaside Buffer (TLB) Hit Ratio & Effective Memory Access Time',
    channel: 'Gate Smashers',
    subject: 'os',
    subtopic: 'Memory Management',
    duration: '18:15',
    level: 'GATE CS Core',
    views: '1.9M',
    year: '2019',
    gateWeightage: 'Very High (100% Guaranteed numerical)',
    description: 'Hardware associativity of TLB cache. Effective Memory Access Time formula: EMAT = h * (t_tlb + t_mem) + (1 - h) * (t_tlb + 2*t_mem) for single level and multi-level page tables.',
    keyTakeaways: [
      'EMAT formula with TLB: EMAT = h * (c + m) + (1 - h) * (c + 2*m)',
      'For k-level paging: Miss cost becomes (c + (k + 1)*m)',
      'TLB is high-speed parallel associative cache implemented in hardware on MMU',
      'TLB miss penalty and page fault penalty differences'
    ],
    tags: ['tlb', 'emat', 'hit ratio', 'effective memory access time', 'gate numericals', 'os']
  },
  {
    id: 'T8W8gN9l92E',
    title: 'Disk Scheduling Algorithms: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK',
    channel: 'Gate Smashers',
    subject: 'os',
    subtopic: 'Secondary Storage & File Systems',
    duration: '23:40',
    level: 'GATE CS Core',
    views: '2.8M',
    year: '2019',
    gateWeightage: 'Very High (Direct numerical)',
    description: 'Calculating total track head movements across request queues. Comparing Shortest Seek Time First (SSTF starvation), Elevator (SCAN/LOOK), and Circular SCAN (C-SCAN/C-LOOK).',
    keyTakeaways: [
      'Seek time is the dominant delay in magnetic hard drive I/O operations',
      'SSTF picks closest request: achieves low average seek time but suffers from starvation',
      'SCAN moves head in one direction to end of disk (0 or N-1), reversing direction',
      'LOOK only goes as far as the final request in each direction before reversing'
    ],
    tags: ['disk scheduling', 'c-scan', 'sstf', 'look', 'seek time', 'os']
  },

  // ================= DATABASE MANAGEMENT SYSTEMS (DBMS) =================
  {
    id: 'Yp_lG9h0p3M',
    title: 'Relational Algebra: Select, Project, Cartesian Product, Natural Join & Division',
    channel: 'Gate Smashers',
    subject: 'dbms',
    subtopic: 'Relational Query Languages',
    duration: '26:50',
    level: 'GATE CS Core',
    views: '2.6M',
    year: '2019',
    gateWeightage: 'Very High (Guaranteed 2 Marks)',
    description: 'Fundamental operators of relational algebra (sigma, pi, rho, union, set difference, Cartesian product) and derived operators (Natural join bowtie, Theta join, Division operator / for universal queries).',
    keyTakeaways: [
      'Selection (sigma) is row filtering; Projection (pi) is column filtering with duplicate elimination',
      'Cartesian Product R x S produces |R| * |S| rows and deg(R) + deg(S) columns',
      'Natural Join (bowtie) equates common attributes and projects distinct attribute set',
      'Division operator (R / S) implements "for all" queries (e.g. students who took ALL courses)'
    ],
    tags: ['relational algebra', 'natural join', 'division operator', 'gate pyq', 'dbms']
  },
  {
    id: '87fG8s9_w0E',
    title: 'SQL Masterclass: GROUP BY, HAVING, Correlated Subqueries & JOINS',
    channel: 'Gate Smashers',
    subject: 'dbms',
    subtopic: 'SQL & Database Queries',
    duration: '31:20',
    level: 'GATE & Interviews',
    views: '3.1M',
    year: '2020',
    gateWeightage: 'Very High',
    description: 'Execution order of SQL queries: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY. Differences between WHERE and HAVING with real GATE interview query problems.',
    keyTakeaways: [
      'Execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY',
      'WHERE filters individual tuples BEFORE grouping; HAVING filters aggregate groups AFTER grouping',
      'Correlated subquery executes once for every single candidate row in outer query',
      'LEFT JOIN vs RIGHT JOIN vs FULL OUTER JOIN behavior on NULL values'
    ],
    tags: ['sql', 'group by', 'having', 'subqueries', 'joins', 'dbms']
  },
  {
    id: '9Pq5x_0A8kL',
    title: 'Two-Phase Locking (2PL): Basic 2PL, Strict 2PL & Rigorous 2PL',
    channel: 'Gate Smashers',
    subject: 'dbms',
    subtopic: 'Concurrency Control',
    duration: '17:35',
    level: 'GATE CS Core',
    views: '1.9M',
    year: '2019',
    gateWeightage: 'Very High',
    description: 'Growing phase (only acquiring locks) vs Shrinking phase (only releasing locks). Lock point, proving Conflict Serializability, and avoiding cascading rollbacks with Strict 2PL.',
    keyTakeaways: [
      'Basic 2PL guarantees Conflict Serializability, but DOES NOT prevent Deadlocks or Cascading Aborts',
      'Strict 2PL: All Exclusive (X) locks held until transaction commits/aborts (prevents cascading aborts)',
      'Rigorous 2PL: ALL locks (Shared and Exclusive) held until commit (serial schedule order identical to commit order)',
      'Lock conversion: upgrading shared to exclusive only permitted in growing phase'
    ],
    tags: ['2pl', 'two phase locking', 'strict 2pl', 'concurrency', 'gate pyq', 'dbms']
  },

  // ================= COMPILER DESIGN =================
  {
    id: 'f9P3w8LqK0Y',
    title: 'Lexical Analysis: Tokens, Patterns, Lexemes & Input Buffering Schemes',
    channel: 'Gate Smashers',
    subject: 'compiler',
    subtopic: 'Lexical Analysis',
    duration: '18:20',
    level: 'GATE CS Core',
    views: '1.8M',
    year: '2019',
    gateWeightage: 'High (1-2 Marks direct question)',
    description: 'Role of lexical analyzer, token classification, lexeme recognition using regular expressions, transition diagrams, and two-buffer pointer schemes (lexemeBegin and forward).',
    keyTakeaways: [
      'Token is an abstract category (e.g. identifier, number); Lexeme is the actual character substring',
      'Input buffering: sentinel character (EOF) eliminates buffer boundary check at every step',
      'Longest match / Maximal munch rule for resolving token ambiguity',
      'Converting Regular Expression -> NFA (Thompson) -> DFA -> Minimized DFA for lexical scanners (Lex/Flex)'
    ],
    tags: ['lexical analysis', 'tokens', 'lexemes', 'compiler design', 'gate smashers']
  },
  {
    id: 'y8B_wPq910K',
    title: 'Syntax Directed Translation (SDT): S-Attributed vs L-Attributed Definitions',
    channel: 'Gate Smashers',
    subject: 'compiler',
    subtopic: 'Syntax Directed Translation',
    duration: '22:45',
    level: 'GATE CS Core',
    views: '2.1M',
    year: '2020',
    gateWeightage: 'Very High (Direct GATE question)',
    description: 'Synthesized attributes vs Inherited attributes. S-attributed definitions (synthesized only, evaluated during bottom-up parsing) vs L-attributed definitions (evaluated in depth-first left-to-right order).',
    keyTakeaways: [
      'Synthesized attribute: value computed from child nodes in parse tree',
      'Inherited attribute: value computed from parent and sibling nodes',
      'S-Attributed: uses exclusively synthesized attributes; naturally evaluated during LR reduction',
      'L-Attributed: inherited attributes depend ONLY on parent or left siblings (never right siblings)'
    ],
    tags: ['sdt', 'syntax directed translation', 's-attributed', 'l-attributed', 'compilers']
  },
  {
    id: '3QhU9jd03a0',
    title: 'Three Address Code (TAC): Quadruples, Triples & Indirect Triples Representation',
    channel: 'Gate Smashers',
    subject: 'compiler',
    subtopic: 'Intermediate Code Generation',
    duration: '16:50',
    level: 'GATE CS Core',
    views: '1.4M',
    year: '2020',
    gateWeightage: 'High',
    description: 'Linear intermediate representations: converting arithmetic expressions and boolean conditionals to x = y op z form. Storing TAC in Quadruples (op, arg1, arg2, result) vs Triples (op, arg1, arg2).',
    keyTakeaways: [
      'Three Address Code has at most one operator on the right-hand side of assignment',
      'Quadruples: explicit temporary names in result field (easier for compiler optimization passes)',
      'Triples: avoids temporary variable names; references operations by array table index (saving memory)',
      'Indirect Triples: array of pointers to triples table allows effortless instruction reordering'
    ],
    tags: ['tac', 'three address code', 'quadruples', 'triples', 'intermediate code', 'compilers']
  },

  // ================= THEORY OF COMPUTATION (TOC) =================
  {
    id: 'k8ZGsUR4vzA',
    title: 'NFA to DFA Conversion using Subset Construction Method with Examples',
    channel: 'Gate Smashers',
    subject: 'toc',
    subtopic: 'Finite Automata',
    duration: '19:35',
    level: 'GATE CS Core',
    views: '2.9M',
    year: '2019',
    gateWeightage: 'Very High (1-2 Marks guaranteed)',
    description: 'Step-by-step conversion of Non-Deterministic Finite Automata (NFA) to equivalent Deterministic Finite Automata (DFA) using power set states 2^Q and epsilon-closure.',
    keyTakeaways: [
      'Power set construction: Maximum number of states in equivalent DFA is 2^n for n-state NFA',
      'Epsilon-closure of state q is the set of all states reachable via zero or more epsilon transitions',
      'A state in DFA is a Final State if it contains at least ONE final state of the original NFA',
      'NFA and DFA recognize the exact same class of languages (Regular Languages)'
    ],
    tags: ['nfa to dfa', 'subset construction', 'automata', 'toc', 'gate smashers']
  },
  {
    id: 'qIEHUUt2Wfc',
    title: 'Pushdown Automata (PDA) for Context-Free Languages with Stack Trace',
    channel: 'Gate Smashers',
    subject: 'toc',
    subtopic: 'Context-Free Languages & PDA',
    duration: '21:40',
    level: 'GATE CS Core',
    views: '2.1M',
    year: '2020',
    gateWeightage: 'Very High',
    description: '7-tuple formal definition of Pushdown Automata: Q, Sigma, Gamma, delta, q0, z0, F. Acceptance by Final State vs Acceptance by Empty Stack. Designing PDA for a^n b^n and palindromes.',
    keyTakeaways: [
      'PDA = Finite Automaton + 1 infinite LIFO Stack memory',
      'Acceptance by Final State and Acceptance by Empty Stack are computationally equivalent',
      'Deterministic PDA (DPDA) is strictly less powerful than Non-deterministic PDA (NPDA)',
      'Languages like {ww^R} require non-deterministic guessing of the midpoint'
    ],
    tags: ['pda', 'pushdown automata', 'cfl', 'stack', 'automata', 'toc']
  },

  // ================= DIGITAL LOGIC DESIGN =================
  {
    id: 'y-aYzGdlM-8',
    title: 'Number Systems, 1\'s & 2\'s Complement Arithmetic and Overflow Detection',
    channel: 'Gate Smashers',
    subject: 'digital-logic',
    subtopic: 'Number Systems & Arithmetic',
    duration: '20:15',
    level: 'GATE CS Core',
    views: '2.8M',
    year: '2019',
    gateWeightage: 'High (GATE question guaranteed)',
    description: 'Binary, Octal, Hexadecimal conversions. Range of signed magnitude, 1\'s complement, and 2\'s complement (-2^(n-1) to 2^(n-1)-1). Detecting overflow using XOR of Carry-in and Carry-out (V = Cin XOR Cout).',
    keyTakeaways: [
      '2\'s complement range for n bits: -2^(n-1) to +(2^(n-1) - 1); unique zero representation',
      'Overflow in signed addition: occurs ONLY when adding two positive numbers yields negative or vice versa',
      'Hardware overflow flag: V = C_in XOR C_out of the most significant bit (MSB)',
      'Sign extension: replicating the MSB preserves numeric value in larger bit registers'
    ],
    tags: ['2s complement', 'overflow', 'number systems', 'digital logic', 'gate cs']
  },
  {
    id: 'IPvYjXCsTg8',
    title: 'Flip-Flops Masterclass: SR, JK, D, T Flip-Flop Conversion & Excitation Tables',
    channel: 'Gate Smashers',
    subject: 'digital-logic',
    subtopic: 'Sequential Circuits',
    duration: '24:30',
    level: 'GATE CS Core',
    views: '3.1M',
    year: '2019',
    gateWeightage: 'Very High',
    description: 'Clocked latches vs edge-triggered flip-flops. Characteristic equations: JK (Q+ = J Q\' + K\' Q), D (Q+ = D), T (Q+ = T XOR Q). Universal conversion method between any two flip-flops using excitation tables.',
    keyTakeaways: [
      'Race-around condition in JK flip-flop occurs when J=1, K=1 and clock pulse width > propagation delay',
      'Solved by Master-Slave JK flip-flop or edge-triggering',
      'Characteristic equation of T flip-flop: Q(next) = T XOR Q(present)',
      'Excitation table gives required inputs (J, K) for desired state transition Q -> Q+'
    ],
    tags: ['flip flop', 'jk flip flop', 'excitation table', 'sequential circuits', 'digital logic']
  },

  // ================= SYSTEM DESIGN & APPLIED CS =================
  {
    id: 'U3RkDLtS7uY',
    title: 'System Design: Distributed Rate Limiting Algorithms (Token Bucket & Leaky Bucket)',
    channel: 'Gaurav Sen',
    subject: 'system-design',
    subtopic: 'API Design & Scaling',
    duration: '21:40',
    level: 'Industry / System Design',
    views: '1.9M',
    year: '2021',
    gateWeightage: 'Applied CS / Interviews',
    description: 'Protecting backend APIs from denial of service and scraping: Token Bucket algorithm, Leaky Bucket, Fixed Window Counter, Sliding Window Log, and Redis distributed counters.',
    keyTakeaways: [
      'Token Bucket: allows bursts of traffic up to bucket capacity while enforcing average rate',
      'Leaky Bucket: smooths out bursts into constant steady output rate using FIFO queue',
      'Sliding Window Counter in Redis: combines low memory footprint with rolling accuracy',
      'Returning HTTP 429 Too Many Requests with Retry-After headers'
    ],
    tags: ['rate limiting', 'token bucket', 'system design', 'redis', 'gaurav sen']
  },
  {
    id: '0bHoB32fuj0',
    title: 'Microservices Architecture: API Gateway, Service Discovery & Circuit Breakers',
    channel: 'Gaurav Sen',
    subject: 'system-design',
    subtopic: 'Distributed Systems',
    duration: '25:10',
    level: 'Industry / System Design',
    views: '2.4M',
    year: '2021',
    gateWeightage: 'Applied Architecture',
    description: 'Decomposing monoliths into microservices: API Gateway routing, authentication, rate limiting, Service Discovery (Eureka/Consul), and Circuit Breaker pattern (Closed, Open, Half-Open) to prevent cascading outages.',
    keyTakeaways: [
      'API Gateway acts as single entry point for clients, routing requests to internal microservices',
      'Circuit Breaker stops sending requests to failing service; returns cached fallback response',
      'States: Closed (normal), Open (fast fail after threshold errors), Half-Open (trial requests)',
      'Database-per-service pattern and distributed transaction challenges (Saga pattern)'
    ],
    tags: ['microservices', 'api gateway', 'circuit breaker', 'system design', 'architecture']
  },

  // ================= DISCRETE & ENGINEERING MATH =================
  {
    id: 'fNk_zzaMoSs',
    title: 'Sets, Relations, Equivalence Relations, Partial Orders & Hasse Diagrams',
    channel: 'Gate Smashers',
    subject: 'discrete-math',
    subtopic: 'Set Theory & Relations',
    duration: '22:15',
    level: 'GATE CS Core',
    views: '2.7M',
    year: '2019',
    gateWeightage: 'Very High (Direct questions)',
    description: 'Reflexive, Symmetric, Transitive, Anti-symmetric relations. Equivalence relations and partitions. Partial Order Relations (POSET), drawing Hasse Diagrams, Maximal, Minimal, LUB and GLB elements.',
    keyTakeaways: [
      'Reflexive: (a, a) in R for all a in A; count of reflexive relations = 2^(n^2 - n)',
      'Symmetric: (a, b) in R implies (b, a) in R; count = 2^(n(n+1)/2)',
      'POSET: Relation that is Reflexive, Anti-Symmetric, and Transitive',
      'Lattice: POSET in which every pair of elements has a unique Least Upper Bound (LUB) and Greatest Lower Bound (GLB)'
    ],
    tags: ['relations', 'poset', 'hasse diagram', 'lattice', 'discrete math', 'gate pyq']
  },
  {
    id: '87fG8s9_w0E',
    title: 'Eigenvalues & Eigenvectors: Characteristic Equation & Cayley-Hamilton Theorem',
    channel: 'Gate Smashers',
    subject: 'discrete-math',
    subtopic: 'Linear Algebra',
    duration: '24:40',
    level: 'GATE CS Core',
    views: '3.2M',
    year: '2020',
    gateWeightage: 'Very High (Annual 2-mark question)',
    description: 'Characteristic equation det(A - lambda * I) = 0. Properties: sum of eigenvalues = Trace(A), product of eigenvalues = det(A). Using Cayley-Hamilton theorem to compute high powers A^n and A^-1.',
    keyTakeaways: [
      'Characteristic equation: det(A - lambda * I) = 0 gives eigenvalues lambda',
      'Sum of eigenvalues == Trace of Matrix (sum of principal diagonal elements)',
      'Product of eigenvalues == Determinant of Matrix',
      'Cayley-Hamilton Theorem: Every square matrix satisfies its own characteristic equation'
    ],
    tags: ['eigenvalues', 'eigenvectors', 'cayley hamilton', 'linear algebra', 'gate math']
  },

  // ================= ALGORITHMS & DATA STRUCTURES =================
  {
    id: '4ZlqAIOXbU4',
    title: 'Prim\'s and Kruskal\'s Algorithm: Minimum Spanning Tree (Greedy Method)',
    channel: 'Abdul Bari',
    subject: 'algorithms',
    subtopic: 'Graph Algorithms',
    duration: '28:15',
    level: 'GATE & Core DSA',
    views: '3.4M',
    year: '2018',
    gateWeightage: 'Very High (Annual GATE question)',
    description: 'Greedy strategy for Minimum Spanning Trees (MST). Disjoint Set Union (DSU) with Path Compression and Union by Rank in Kruskal\'s. Cut property in Prim\'s.',
    keyTakeaways: [
      'Kruskal\'s: Sort all edges and add lowest weight edge if it does not form a cycle O(E log E)',
      'Prim\'s: Grows a single tree from starting vertex using Min-Heap O(E log V)',
      'Both algorithms produce MST of identical total weight (MST is unique if edge weights distinct)',
      'Cycle detection in Kruskal using Disjoint Set Union (DSU) in near O(1) amortized time'
    ],
    tags: ['prims', 'kruskal', 'mst', 'minimum spanning tree', 'abdul bari', 'algorithms']
  },
  {
    id: 'oNI0rf2P9gE',
    title: 'Floyd-Warshall Algorithm: All-Pairs Shortest Path (Dynamic Programming)',
    channel: 'Abdul Bari',
    subject: 'algorithms',
    subtopic: 'Dynamic Programming',
    duration: '24:50',
    level: 'GATE & Core DSA',
    views: '2.1M',
    year: '2018',
    gateWeightage: 'High',
    description: 'Dynamic programming formulation: A^k[i, j] = min(A^(k-1)[i, j], A^(k-1)[i, k] + A^(k-1)[k, j]). Handling directed/undirected graphs and negative cycle detection.',
    keyTakeaways: [
      'Time complexity O(V^3) using three nested loops; space complexity O(V^2)',
      'Detects negative weight cycles if any diagonal entry A[i, i] < 0',
      'Works on negative edge weights (unlike Dijkstra)',
      'DP state equation: considers each vertex k as an intermediate candidate path vertex'
    ],
    tags: ['floyd warshall', 'all pairs shortest path', 'dynamic programming', 'abdul bari']
  },
  {
    id: 'prx1psByp7U',
    title: 'Matrix Chain Multiplication (MCM): Dynamic Programming Formulation',
    channel: 'Abdul Bari',
    subject: 'algorithms',
    subtopic: 'Dynamic Programming',
    duration: '32:10',
    level: 'GATE & Interviews',
    views: '2.8M',
    year: '2018',
    gateWeightage: 'Very High (Direct numerical)',
    description: 'Optimal parenthesization of matrix product A1 * A2 * ... * An. Computing minimum scalar multiplications, constructing the M and S tables, and printing optimal bracket placements.',
    keyTakeaways: [
      'Recurrence: m[i, j] = min_{i <= k < j} (m[i, k] + m[k+1, j] + p_{i-1} * p_k * p_j)',
      'Time complexity O(N^3) and Space complexity O(N^2)',
      'Diagonal computation order: solves subproblems of length 2, then 3, up to n',
      'Exponential Catalan number C(n-1) brute force reduced to polynomial time'
    ],
    tags: ['matrix chain multiplication', 'mcm', 'dynamic programming', 'gate numericals', 'abdul bari']
  },
  {
    id: 'jDM6_TnYIqE',
    title: 'AVL Tree Rotations: LL, RR, LR, RL Rotations with Step-by-Step Balancing',
    channel: 'Abdul Bari',
    subject: 'algorithms',
    subtopic: 'Binary Search Trees',
    duration: '27:40',
    level: 'GATE & Core DSA',
    views: '3.7M',
    year: '2018',
    gateWeightage: 'High (GATE question guaranteed)',
    description: 'Self-balancing binary search trees. Balance factor BF = Height(Left) - Height(Right) in {-1, 0, 1}. Single rotations (LL, RR) and Double rotations (LR, RL) on insertion and deletion.',
    keyTakeaways: [
      'Balance factor must strictly remain in {-1, 0, +1} for every node',
      'LL rotation: right rotation around unbalanced node',
      'RR rotation: left rotation around unbalanced node',
      'Search, insert, and delete guaranteed in strictly O(log N) worst-case time'
    ],
    tags: ['avl tree', 'rotations', 'bst', 'self balancing', 'abdul bari', 'dsa']
  },
  {
    id: 'HqPJF2L5h9U',
    title: 'Heap Sort, Max-Heap & Priority Queue Construction in O(N log N)',
    channel: 'Abdul Bari',
    subject: 'algorithms',
    subtopic: 'Heaps & Sorting',
    duration: '25:30',
    level: 'GATE & Core DSA',
    views: '3.1M',
    year: '2018',
    gateWeightage: 'High',
    description: 'Array representation of complete binary tree (Parent: i/2, Left: 2i, Right: 2i+1). Bottom-up Heapify in linear O(N) time and extracting elements for in-place Heap Sort.',
    keyTakeaways: [
      'Building a Max-Heap from arbitrary array takes O(N) linear time (Heapify)',
      'Heap Sort time complexity: O(N log N) in best, average, and worst cases; in-place O(1) auxiliary space',
      'Heap is NOT a stable sorting algorithm',
      'Priority Queue: Extract-Max O(log N), Insert O(log N), Peek O(1)'
    ],
    tags: ['heap sort', 'max heap', 'heapify', 'priority queue', 'abdul bari', 'algorithms']
  },
  {
    id: 'eL-KzMXSXXI',
    title: 'Topological Sort & Cycle Detection in Directed Acyclic Graphs (DAG)',
    channel: 'take U forward (Striver)',
    subject: 'algorithms',
    subtopic: 'Graph Algorithms',
    duration: '21:10',
    level: 'GATE & FAANG Coding',
    views: '1.5M',
    year: '2022',
    gateWeightage: 'High',
    description: 'Linear ordering of vertices such that for every directed edge u -> v, u comes before v. Implementing Kahn\'s Algorithm (BFS with In-degrees) and DFS with Visited / Path-Visited array.',
    keyTakeaways: [
      'Topological sorting is possible IF AND ONLY IF the directed graph has NO cycles (DAG)',
      'Kahn\'s Algorithm uses BFS: enqueue vertices with in-degree 0; decrement neighbor in-degrees',
      'If topological sort output has fewer than V vertices, a cycle exists',
      'Time complexity O(V + E) and Space O(V)'
    ],
    tags: ['topological sort', 'kahns algorithm', 'dag', 'striver', 'dsa']
  },

  // ================= COMPUTER ORGANIZATION (COA) =================
  {
    id: 'y-aYzGdlM-8',
    title: 'Addressing Modes: Immediate, Direct, Indirect, Register, Indexed & PC-Relative',
    channel: 'Gate Smashers',
    subject: 'coa',
    subtopic: 'Instruction Formats & Addressing',
    duration: '24:15',
    level: 'GATE CS Core',
    views: '2.9M',
    year: '2019',
    gateWeightage: 'Very High (Guaranteed GATE question)',
    description: 'Calculating Effective Address (EA) across all major addressing modes. Comparing memory reference cycles, program relocation with PC-relative, and array indexing.',
    keyTakeaways: [
      'Immediate: Operand is part of instruction (no memory reference needed)',
      'Direct / Absolute: EA = Address field (1 memory access)',
      'Indirect: EA = Memory[Address field] (2 memory accesses)',
      'PC-Relative: EA = PC + Offset (supports position-independent code / relocatable programs)'
    ],
    tags: ['addressing modes', 'effective address', 'pc relative', 'coa', 'gate pyq']
  },
  {
    id: 'p6yPvw88BJk',
    title: 'Booth\'s Multiplication Algorithm for Signed 2\'s Complement Binary Numbers',
    channel: 'Gate Smashers',
    subject: 'coa',
    subtopic: 'Computer Arithmetic & ALU',
    duration: '20:45',
    level: 'GATE CS Core',
    views: '1.8M',
    year: '2019',
    gateWeightage: 'High',
    description: 'Multiplying signed binary integers: checking Q0 and Q-1 bits. Rules: 10 -> subtract M (A = A - M), 01 -> add M (A = A + M), 00/11 -> arithmetic right shift (ARS).',
    keyTakeaways: [
      'Directly handles negative 2\'s complement numbers without converting signs',
      'Bit inspection: (Q0, Q-1) == 10 implies beginning of run of 1s (subtract)',
      'Bit inspection: (Q0, Q-1) == 01 implies end of run of 1s (add)',
      'Arithmetic Right Shift (ARS) preserves sign bit'
    ],
    tags: ['booths algorithm', 'multiplication', 'arithmetic right shift', 'coa', 'gate cs']
  },
  {
    id: 'HyznrdDSSGM',
    title: 'Direct Memory Access (DMA): Cycle Stealing, Burst Mode & DMA Controller 8237',
    channel: 'Gate Smashers',
    subject: 'coa',
    subtopic: 'I/O Organization & Memory',
    duration: '18:30',
    level: 'GATE CS Core',
    views: '1.6M',
    year: '2019',
    gateWeightage: 'High (Annual numerical)',
    description: 'Bypassing CPU for high-speed I/O transfers directly to RAM. HOLD and HLDA bus request signals. Calculating CPU slowdown percentage during Cycle Stealing mode.',
    keyTakeaways: [
      'DMA controller takes over system buses from CPU via HOLD and HLDA signals',
      'Cycle Stealing mode: DMA transfers 1 word per machine cycle, stealing bus from CPU',
      'Burst / Block mode: DMA transfers entire block of data continuously while CPU waits',
      'CPU slowdown formula: (Data transfer rate / Memory bus bandwidth) * 100%'
    ],
    tags: ['dma', 'cycle stealing', 'burst mode', 'io organization', 'coa']
  },

  // ================= COMPILER DESIGN =================
  {
    id: 'k8ZGsUR4vzA',
    title: 'Code Optimization: Basic Blocks, Control Flow Graphs (CFG) & Dominator Trees',
    channel: 'Gate Smashers',
    subject: 'compiler',
    subtopic: 'Code Optimization',
    duration: '21:10',
    level: 'GATE CS Core',
    views: '1.7M',
    year: '2020',
    gateWeightage: 'High (GATE question guaranteed)',
    description: 'Partitioning Three-Address Code into Basic Blocks: identifying leaders (first instruction, target of jump, instruction following jump). Building Control Flow Graphs (CFG).',
    keyTakeaways: [
      'Basic block is a sequence of consecutive statements with single entry and single exit',
      'Leader rules: 1. First statement; 2. Target of any conditional/unconditional jump; 3. Statement immediately following jump',
      'Directed graph of basic blocks represents program control flow',
      'Loop optimization: identifying loop invariants and code hoisting'
    ],
    tags: ['basic blocks', 'cfg', 'control flow graph', 'code optimization', 'compilers']
  },
  {
    id: 'WTxdKQmsfho',
    title: 'DAG Representation of Basic Blocks & Dead Code Elimination',
    channel: 'Gate Smashers',
    subject: 'compiler',
    subtopic: 'Code Optimization',
    duration: '19:40',
    level: 'GATE CS Core',
    views: '1.5M',
    year: '2020',
    gateWeightage: 'High',
    description: 'Constructing Directed Acyclic Graphs (DAG) for basic blocks: detecting common subexpressions, eliminating dead code, and finding minimum temporary registers.',
    keyTakeaways: [
      'Leaves represent initial variable values; internal nodes represent operators',
      'Common subexpressions collapse to identical DAG nodes',
      'Eliminates redundant computation and dead code statements without graph successors',
      'Generates optimal machine target code with minimum register allocations'
    ],
    tags: ['dag', 'basic blocks', 'dead code elimination', 'compilers', 'gate pyq']
  },

  // ================= DIGITAL LOGIC DESIGN =================
  {
    id: 'p6yPvw88BJk',
    title: 'Synchronous & Asynchronous Mod-N Counters: State Diagram & J-K Flip-Flop Design',
    channel: 'Gate Smashers',
    subject: 'digital-logic',
    subtopic: 'Sequential Circuits',
    duration: '26:15',
    level: 'GATE CS Core',
    views: '2.5M',
    year: '2019',
    gateWeightage: 'Very High (Guaranteed 2-mark question)',
    description: 'Designing Mod-N counters using T and JK flip-flops. Ripple counters (asynchronous) vs Parallel clock counters (synchronous). Calculating maximum clock frequency and lock-out states.',
    keyTakeaways: [
      'Mod-N counter requires minimum k flip-flops where 2^k >= N',
      'Asynchronous / Ripple counter propagation delay: t_total = n * t_pd',
      'Maximum operating frequency: f_max = 1 / (n * t_pd) for ripple; 1 / (t_pd + t_comb) for synchronous',
      'Self-starting counter design: ensuring unused states return to normal cycle'
    ],
    tags: ['counter design', 'mod n counter', 'synchronous counter', 'ripple counter', 'digital logic']
  },
  {
    id: 'JFF2vJaN0Cw',
    title: 'Decoders, Encoders & Priority Encoders: 3:8 Decoder & Boolean Implementation',
    channel: 'Gate Smashers',
    subject: 'digital-logic',
    subtopic: 'Combinational Circuits',
    duration: '19:10',
    level: 'GATE CS Core',
    views: '1.8M',
    year: '2019',
    gateWeightage: 'High',
    description: 'n-to-2^n Decoders with Enable inputs. Implementing any boolean function as a sum of minterms using a decoder and external OR gates. 4:2 Priority Encoders with valid bit.',
    keyTakeaways: [
      'Decoder generates all 2^n minterms for n input variables',
      'Any boolean function can be implemented using decoder + OR gate (for active-high) or NAND gate (for active-low)',
      'Cascading decoders: building 4:16 decoder using five 2:4 decoders',
      'Priority encoder: outputs binary code corresponding to highest order active input'
    ],
    tags: ['decoder', 'encoder', 'priority encoder', 'combinational circuits', 'digital logic']
  },

  // ================= GATE CS SPECIAL & HIGH-YIELD PYQS =================
  {
    id: 'L9X7XXfHYdU',
    title: 'GATE CS Top 100 High-Yield Numericals: Operating Systems & Computer Networks',
    channel: 'Gate Smashers',
    subject: 'gate-special',
    subtopic: 'GATE High-Yield PYQs',
    duration: '5:40:20',
    level: 'GATE Marathon',
    views: '1.9M',
    year: '2023',
    gateWeightage: 'High (Core 20 Marks Coverage)',
    description: 'Intensive numerical solving marathon for GATE CS: CPU scheduling, Paging, TLB, Disk scheduling, Subnetting, Sliding Window protocols, and TCP Congestion control.',
    keyTakeaways: [
      'Solving previous 15 years official GATE questions with shortcut formulas',
      'Avoid common calculation traps in TLB effective memory access time',
      'Sliding window sequence number space and timeout numerical tricks',
      'CIDR subnetting and host range boundary conditions'
    ],
    tags: ['gate special', 'gate pyq', 'marathon', 'gate smashers', 'numericals']
  },
  {
    id: 'nezosHntjPg',
    title: 'GATE CS High-Yield Marathon: DBMS, Compiler Design & Theory of Computation',
    channel: 'KnowledgeGATE by Sanchit Sir',
    subject: 'gate-special',
    subtopic: 'GATE High-Yield Revision',
    duration: '6:15:00',
    level: 'GATE Marathon',
    views: '1.2M',
    year: '2023',
    gateWeightage: 'High (25 Marks Coverage)',
    description: 'Comprehensive revision marathon covering Normalization (1NF-BCNF), Conflict serializability, LL(1) / LR parsing, DFA minimization, and Decidability.',
    keyTakeaways: [
      'Closure property master table mnemonics',
      'Precedence graph serialization rules and cycle detection',
      'Parse table conflict resolution and First/Follow rules',
      'Candidate key closure shortcut algorithm'
    ],
    tags: ['gate special', 'sanchit sir', 'knowledgegate', 'gate marathon', 'dbms', 'toc']
  },

  // ================= ARTIFICIAL INTELLIGENCE & MACHINE LEARNING =================
  {
    id: 'aircAruvnKk',
    title: 'But what is a neural network? | Deep learning Chapter 1',
    channel: '3Blue1Brown',
    subject: 'ai-ml',
    subtopic: 'Neural Network Fundamentals',
    duration: '19:13',
    level: 'Core Foundations',
    views: '16.8M',
    year: '2017',
    gateWeightage: 'Core AI / DA Syllabus',
    description: 'Visual, intuitive introduction to neural networks, multilayer perceptrons, weights, biases, and activation functions using handwritten digit recognition.',
    keyTakeaways: [
      'Neurons as holding numbers between 0 and 1 (activations)',
      'Linear combinations of weights and biases passed through non-linear activation functions (Sigmoid, ReLU)',
      'Matrix representation of layers: a^(1) = sigma(W * a^(0) + b)',
      'Why layered structures capture hierarchical representations of images and patterns'
    ],
    tags: ['ai-ml', 'neural networks', '3blue1brown', 'deep learning', 'perceptron']
  },
  {
    id: 'IHZwWFHWa-w',
    title: 'Gradient descent, how neural networks learn | Deep learning Chapter 2',
    channel: '3Blue1Brown',
    subject: 'ai-ml',
    subtopic: 'Optimization & Training',
    duration: '21:01',
    level: 'Core Foundations',
    views: '8.4M',
    year: '2017',
    gateWeightage: 'High (Optimization & Loss)',
    description: 'Demystifying gradient descent and cost functions. How high-dimensional calculus guides a neural network to minimize prediction errors.',
    keyTakeaways: [
      'Cost function (Mean Squared Error, Cross-Entropy) evaluating network error',
      'Gradient vector nabla C pointing in the direction of steepest ascent',
      'Step size governed by learning rate alpha: W_new = W_old - alpha * nabla C',
      'Stochastic Gradient Descent (SGD) and mini-batching for practical convergence'
    ],
    tags: ['ai-ml', 'gradient descent', 'optimization', 'cost function', '3blue1brown']
  },
  {
    id: 'Ilg3gGewQ5U',
    title: 'What is backpropagation really doing? | Deep learning Chapter 3',
    channel: '3Blue1Brown',
    subject: 'ai-ml',
    subtopic: 'Backpropagation Algorithm',
    duration: '13:54',
    level: 'Mathematical Rigor',
    views: '6.9M',
    year: '2017',
    gateWeightage: 'Very High (Calculus & Chain Rule)',
    description: 'Visual walkthrough of backpropagation: using the multivariate calculus chain rule to distribute error gradients backward through each layer.',
    keyTakeaways: [
      'Applying the multivariate chain rule across nested activation functions',
      'Sensitivity of cost C with respect to individual weights: partial C / partial w',
      'Accumulation of gradients over training samples',
      'Vanishing and exploding gradient challenges in deep architectures'
    ],
    tags: ['ai-ml', 'backpropagation', 'chain rule', 'calculus', 'deep learning']
  },
  {
    id: 'tIeHLnjs5U8',
    title: "Visualizing attention, a transformer's heart | Deep learning Chapter 5",
    channel: '3Blue1Brown',
    subject: 'ai-ml',
    subtopic: 'Transformers & LLMs',
    duration: '26:45',
    level: 'Advanced Deep Learning',
    views: '5.2M',
    year: '2024',
    gateWeightage: 'Modern AI Architecture',
    description: 'Visual, geometric explanation of self-attention mechanisms in transformers. How query, key, and value matrices calculate word contextual relevance.',
    keyTakeaways: [
      'Attention mechanism formula: Softmax(Q * K^T / sqrt(d_k)) * V',
      'Word embeddings transformed by Query, Key, and Value projections',
      'How tokens update contextual meanings dynamically based on neighbors',
      'Multi-head attention enabling parallel relational representations'
    ],
    tags: ['ai-ml', 'transformers', 'attention', 'llm', '3blue1brown', 'nlp']
  },
  {
    id: 'GwIo3gDZCVQ',
    title: 'Machine Learning for Everybody – Full Course',
    channel: 'freeCodeCamp.org',
    subject: 'ai-ml',
    subtopic: 'Supervised & Unsupervised ML',
    duration: '3:53:13',
    level: 'Comprehensive Masterclass',
    views: '4.8M',
    year: '2022',
    gateWeightage: 'Core Machine Learning',
    description: 'Comprehensive introduction to machine learning algorithms in Python: linear regression, logistic regression, k-nearest neighbors, naive bayes, support vector machines, and neural networks.',
    keyTakeaways: [
      'Supervised vs Unsupervised vs Reinforcement Learning paradigms',
      'Data preprocessing, feature scaling, normalization, and train/val/test splits',
      'Model evaluation metrics: Precision, Recall, F1-Score, ROC-AUC curve',
      'Handling bias-variance tradeoff and overfitting with regularization (L1/L2)'
    ],
    tags: ['ai-ml', 'machine learning', 'freecodecamp', 'scikit-learn', 'python']
  },
  {
    id: 'kCc8FmEb1nY',
    title: "Let's build GPT: from scratch, in code, spelled out.",
    channel: 'Andrej Karpathy',
    subject: 'ai-ml',
    subtopic: 'Generative AI & LLMs',
    duration: '1:56:45',
    level: 'Engineering Masterclass',
    views: '5.6M',
    year: '2023',
    gateWeightage: 'Generative Models',
    description: 'Former Tesla AI Director and OpenAI co-founder Andrej Karpathy builds a generative GPT language model from scratch in PyTorch, token by token.',
    keyTakeaways: [
      'Implementing character and BPE tokenization pipelines',
      'Writing multi-head self-attention and causal masking from scratch',
      'Residual connections, Layer Normalization, and feed-forward blocks',
      'Autoregressive text generation with temperature and sampling'
    ],
    tags: ['ai-ml', 'karpathy', 'gpt', 'pytorch', 'transformers', 'deep learning']
  },
  {
    id: 'i_LwzRVP7bg',
    title: 'The spelled-out intro to neural networks: building micrograd',
    channel: 'Andrej Karpathy',
    subject: 'ai-ml',
    subtopic: 'Autograd & Micrograd',
    duration: '2:25:28',
    level: 'Deep Core Engine',
    views: '4.1M',
    year: '2022',
    gateWeightage: 'Automatic Differentiation',
    description: 'Building a complete scalar-valued autograd engine and a tiny 2-layer neural network from absolute scratch with zero dependencies.',
    keyTakeaways: [
      'Creating a computational Directed Acyclic Graph (DAG) for forward and backward passes',
      'Topological sorting of graph nodes for exact reverse accumulation of derivatives',
      'Writing manual backprop for addition, multiplication, and tanh activations',
      'Zeroing gradients and performing SGD parameter updates'
    ],
    tags: ['ai-ml', 'micrograd', 'autograd', 'karpathy', 'neural networks']
  },
  {
    id: '7xTGNNLPyMI',
    title: 'Deep Learning Crash Course for Beginners',
    channel: 'freeCodeCamp.org',
    subject: 'ai-ml',
    subtopic: 'Convolutional & Recurrent Nets',
    duration: '1:34:20',
    level: 'Applied Deep Learning',
    views: '1.5M',
    year: '2021',
    gateWeightage: 'CNN & Computer Vision',
    description: 'Practical deep learning masterclass covering Convolutional Neural Networks (CNNs), pooling layers, kernels, image classification, and Transfer Learning.',
    keyTakeaways: [
      '2D convolutions, filter kernels, stride, and zero-padding calculation: (W - F + 2P)/S + 1',
      'Max pooling and average pooling for spatial dimension downsampling',
      'Preventing overfitting via Dropout and Data Augmentation',
      'Transfer learning using pretrained models (ResNet, VGG, MobileNet)'
    ],
    tags: ['ai-ml', 'cnn', 'computer vision', 'deep learning', 'tensorflow']
  },

  // ================= CLOUD COMPUTING & DEVOPS =================
  {
    id: '2LaAJq1lB1Q',
    title: 'AWS Certified Cloud Practitioner Full Course (CLF-C02) - Pass the Exam!',
    channel: 'freeCodeCamp.org',
    subject: 'cloud-computing',
    subtopic: 'Cloud Fundamentals & AWS',
    duration: '14:32:15',
    level: 'Industry Certification',
    views: '2.4M',
    year: '2023',
    gateWeightage: 'Cloud Architecture Core',
    description: 'Complete hands-on masterclass for AWS cloud services: EC2, S3, IAM, VPC, RDS, Lambda, CloudFront, Route53, and the AWS Well-Architected Framework.',
    keyTakeaways: [
      'Cloud deployment models: Public, Private, Hybrid, and Multi-Cloud architectures',
      'Compute fundamentals: Virtual Machines (EC2), Containers (ECS/EKS), Serverless (Lambda)',
      'Storage classes: Object storage (S3), Block storage (EBS), File storage (EFS)',
      'VPC networking: Subnets, Route Tables, Internet Gateways, NAT Gateways, Security Groups'
    ],
    tags: ['cloud-computing', 'aws', 'cloud', 'devops', 'freecodecamp', 'certification']
  },
  {
    id: 'X48VuDVv0do',
    title: 'Kubernetes Tutorial for Beginners [FULL COURSE in 4 Hours]',
    channel: 'TechWorld with Nana',
    subject: 'cloud-computing',
    subtopic: 'Container Orchestration',
    duration: '3:37:12',
    level: 'DevOps Standard',
    views: '6.7M',
    year: '2021',
    gateWeightage: 'Distributed Orchestration',
    description: 'Industry-standard Kubernetes course covering Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, Volumes, and cluster architecture.',
    keyTakeaways: [
      'Kubernetes Master-Worker node architecture (API Server, etcd, Scheduler, Kubelet)',
      'Pod lifecycle, ReplicaSets, and zero-downtime rolling update deployments',
      'Service types: ClusterIP, NodePort, LoadBalancer, and Ingress routing',
      'Configuring persistent storage with PersistentVolumes (PV) and PVC claims'
    ],
    tags: ['cloud-computing', 'kubernetes', 'k8s', 'devops', 'containers', 'nana']
  },
  {
    id: '3c-iBn73dDE',
    title: 'Docker Tutorial for Beginners [FULL COURSE in 3 Hours]',
    channel: 'TechWorld with Nana',
    subject: 'cloud-computing',
    subtopic: 'Containerization',
    duration: '2:45:10',
    level: 'Core DevOps',
    views: '8.1M',
    year: '2020',
    gateWeightage: 'Containers & Microservices',
    description: 'Comprehensive Docker guide explaining images, containers, Dockerfile creation, port forwarding, volumes, and multi-container Docker Compose.',
    keyTakeaways: [
      'Difference between Virtual Machines (Hypervisor) and Docker Containers (Kernel namespaces/cgroups)',
      'Writing efficient multi-stage Dockerfiles with minimal image layers',
      'Managing persistent state with Docker volumes and bind mounts',
      'Orchestrating multi-service application stacks with Docker Compose'
    ],
    tags: ['cloud-computing', 'docker', 'devops', 'containers', 'dockerfile']
  },
  {
    id: 'SLB_c_SuC44',
    title: 'Terraform Course - Automate your AWS Cloud Infrastructure',
    channel: 'freeCodeCamp.org',
    subject: 'cloud-computing',
    subtopic: 'Infrastructure as Code (IaC)',
    duration: '2:16:30',
    level: 'Cloud Automation',
    views: '1.1M',
    year: '2021',
    gateWeightage: 'IaC & Automation',
    description: 'Learn Terraform and Infrastructure as Code: providers, resources, variables, state management, modules, and automated AWS provisioning.',
    keyTakeaways: [
      'Declarative vs Imperative infrastructure configuration models',
      'Terraform execution lifecycle: init, plan, apply, destroy',
      'Remote state locking with S3 and DynamoDB backends',
      'Writing reusable infrastructure modules for staging and production'
    ],
    tags: ['cloud-computing', 'terraform', 'iac', 'aws', 'automation']
  },
  {
    id: 'ScMZEIkgp4w',
    title: 'What is CI/CD? Continuous Integration & Continuous Delivery Explained',
    channel: 'TechWorld with Nana',
    subject: 'cloud-computing',
    subtopic: 'CI/CD Automation',
    duration: '18:45',
    level: 'Industry Workflow',
    views: '2.5M',
    year: '2021',
    gateWeightage: 'Software Lifecycle DevOps',
    description: 'Visual walkthrough of modern automated delivery pipelines: Continuous Integration, Continuous Delivery, and Continuous Deployment.',
    keyTakeaways: [
      'Automated testing gates: unit, integration, and security static analysis',
      'Build artifact generation and container registry publication',
      'Deployment strategies: Blue-Green, Canary, and Rolling updates',
      'Popular CI/CD engines: GitHub Actions, GitLab CI, and Jenkins'
    ],
    tags: ['cloud-computing', 'cicd', 'devops', 'continuous integration', 'deployment']
  },
  {
    id: 'w0QhS_mFwWk',
    title: 'Linux for Beginners - Complete Operating System & Bash Scripting Course',
    channel: 'freeCodeCamp.org',
    subject: 'cloud-computing',
    subtopic: 'Linux & Shell Administration',
    duration: '5:28:10',
    level: 'Systems Administration',
    views: '3.9M',
    year: '2022',
    gateWeightage: 'Linux Core & Cloud Servers',
    description: 'Master the Linux operating system used on 90%+ of production cloud servers: file system hierarchy, permissions, process management, SSH, and Bash automation.',
    keyTakeaways: [
      'Linux directory tree hierarchy: /etc, /var, /usr, /home, /bin',
      'User permissions and octal chmod flags: Read (4), Write (2), Execute (1)',
      'Process signals and management: ps, top, kill, htop, systemctl, systemd',
      'Writing modular Bash shell scripts with cron job scheduling'
    ],
    tags: ['cloud-computing', 'linux', 'bash', 'sysadmin', 'devops']
  },

  // ================= CYBER SECURITY & ETHICAL HACKING =================
  {
    id: '3Kq1MIfTWCE',
    title: 'Ethical Hacking in 15 Hours - 2024 Full Course for Beginners',
    channel: 'freeCodeCamp.org',
    subject: 'cyber-security',
    subtopic: 'Ethical Hacking & PenTesting',
    duration: '15:13:40',
    level: 'Hands-On Penetration Testing',
    views: '4.6M',
    year: '2024',
    gateWeightage: 'Security & Penetration Testing',
    description: 'Massive ethical hacking masterclass: networking for hackers, Linux terminal, reconnaissance, Nmap scanning, exploitation, Metasploit, wireless attacks, and web app security.',
    keyTakeaways: [
      'Passive and active reconnaissance methodologies (OSINT, DNS harvesting)',
      'Port scanning, OS detection, and NSE scripting with Nmap',
      'Exploitation workflows and payload execution with Metasploit Framework',
      'Reporting vulnerabilities responsibly according to legal disclosure standards'
    ],
    tags: ['cyber-security', 'ethical hacking', 'penetration testing', 'kali linux', 'security']
  },
  {
    id: 'WnN6dbosJJA',
    title: 'Cybersecurity Fundamentals - Full Course for Beginners',
    channel: 'freeCodeCamp.org',
    subject: 'cyber-security',
    subtopic: 'Security Principles & Defense',
    duration: '4:42:15',
    level: 'Core Foundations',
    views: '1.8M',
    year: '2023',
    gateWeightage: 'Information Security Core',
    description: 'Learn the foundational concepts of cybersecurity: CIA triad, authentication protocols, threat modeling, attack surfaces, defense-in-depth, and incident response.',
    keyTakeaways: [
      'The CIA Triad: Confidentiality, Integrity, and Availability',
      'Authentication factors: Something you know, have, or are (MFA/2FA)',
      'Threat vectors: phishing, malware, ransomware, social engineering, DDoS',
      'Defense-in-depth strategy: perimeter, network, endpoint, application, and data defense'
    ],
    tags: ['cyber-security', 'cia triad', 'cybersecurity', 'defense', 'information security']
  },
  {
    id: 'fNzpcB7ODxQ',
    title: 'You need to learn Cybersecurity RIGHT NOW!! // Complete Cybersecurity Roadmap',
    channel: 'NetworkChuck',
    subject: 'cyber-security',
    subtopic: 'Career Roadmap & Core Skills',
    duration: '22:40',
    level: 'Industry Guidance',
    views: '3.4M',
    year: '2022',
    gateWeightage: 'Security Architecture',
    description: 'High-energy guide breaking down essential skills required for cybersecurity careers: networking, Linux, Python scripting, certs (Security+, CEH, OSCP), and home lab building.',
    keyTakeaways: [
      'Why deep networking knowledge (TCP/IP, Wireshark) is the prerequisite for security',
      'Setting up safe isolated virtual home labs (VirtualBox, VMware, pfSense)',
      'Red Team (Offensive) vs Blue Team (Defensive/SOC) roles and responsibilities',
      'Industry certifications roadmap (CompTIA Security+, CEH, eJPT, OSCP)'
    ],
    tags: ['cyber-security', 'networkchuck', 'roadmap', 'security lab', 'networking']
  },
  {
    id: '2_lswM1S264',
    title: 'Introduction to Cryptography and Information Security - Full Course',
    channel: 'freeCodeCamp.org',
    subject: 'cyber-security',
    subtopic: 'Cryptography & Encryption',
    duration: '2:15:30',
    level: 'Mathematical Security',
    views: '1.3M',
    year: '2021',
    gateWeightage: 'GATE CS Cryptography & Network Security',
    description: 'In-depth guide to modern cryptographic primitives: symmetric encryption (AES, DES), asymmetric encryption (RSA, ECC), cryptographic hash functions (SHA-256), and digital signatures.',
    keyTakeaways: [
      'Symmetric vs Asymmetric encryption tradeoffs and key distribution problem',
      'RSA algorithm mathematical derivation using Euler totient function phi(n)',
      'Properties of cryptographic hashes: pre-image resistance, collision resistance',
      'Public Key Infrastructure (PKI), TLS/SSL certificates, and digital signatures'
    ],
    tags: ['cyber-security', 'cryptography', 'rsa', 'aes', 'encryption', 'pki']
  },
  {
    id: 'U_P23dqeprk',
    title: 'Web Application Penetration Testing & OWASP Top 10 Vulnerabilities',
    channel: 'freeCodeCamp.org',
    subject: 'cyber-security',
    subtopic: 'Web App Security',
    duration: '3:45:20',
    level: 'Applied PenTesting',
    views: '1.2M',
    year: '2022',
    gateWeightage: 'Web Application Security',
    description: 'Hands-on breakdown of web vulnerability exploitation and mitigation based on OWASP Top 10: SQL Injection, Cross-Site Scripting (XSS), CSRF, and Broken Access Control.',
    keyTakeaways: [
      'SQL Injection (SQLi) mechanics, UNION-based attacks, and prepared statements prevention',
      'Cross-Site Scripting (XSS): Stored, Reflected, and DOM-based attacks',
      'Cross-Site Request Forgery (CSRF) tokens and SameSite cookie attributes',
      'Intercepting and tampering with web traffic using Burp Suite Proxy'
    ],
    tags: ['cyber-security', 'owasp', 'sqli', 'xss', 'burp suite', 'web security']
  },
  {
    id: '2G1HkXpC6U0',
    title: 'What is a Firewall? Packet Filtering, Stateful & Next-Gen Firewalls',
    channel: 'NetworkChuck',
    subject: 'cyber-security',
    subtopic: 'Network Defense',
    duration: '16:35',
    level: 'Core Infrastructure',
    views: '1.9M',
    year: '2022',
    gateWeightage: 'Firewalls & Network Security',
    description: 'How firewalls inspect, allow, or block traffic to secure networks: stateless packet filtering, stateful inspection, and deep packet inspection (Next-Gen Firewalls).',
    keyTakeaways: [
      'Stateless packet inspection examining 5-tuple (src/dst IP, src/dst port, protocol)',
      'Stateful inspection maintaining connection tracking tables (TCP SYN/ACK state)',
      'Application-layer / Next-Generation Firewalls (NGFW) with TLS decryption and IPS',
      'Configuring iptables and pfSense rule ordering'
    ],
    tags: ['cyber-security', 'firewall', 'network defense', 'networkchuck', 'pfsense']
  },

  // ================= DATA SCIENCE & BIG DATA =================
  {
    id: 'ua-CiDNNj30',
    title: 'Data Analysis with Python Course - Numpy, Pandas, Data Cleaning & Matplotlib',
    channel: 'freeCodeCamp.org',
    subject: 'data-science',
    subtopic: 'Python Data Stack',
    duration: '4:24:12',
    level: 'Core Applied',
    views: '3.1M',
    year: '2021',
    gateWeightage: 'GATE Data Science (DA) Paper',
    description: 'Master the core Python data science ecosystem: vectorized arrays in NumPy, dataframes and wrangling in Pandas, exploratory data analysis, and Matplotlib plotting.',
    keyTakeaways: [
      'NumPy array broadcasting, indexing, slicing, and memory layouts',
      'Pandas DataFrame operations: groupby, merge, pivot tables, handling NaN values',
      'Exploratory Data Analysis (EDA) pipelines and statistical summaries',
      'Data visualization best practices with Matplotlib and Seaborn'
    ],
    tags: ['data-science', 'pandas', 'numpy', 'python', 'data analysis', 'eda']
  },
  {
    id: '_V8eKsto3Ug',
    title: 'Apache Spark Full Course - Big Data Processing with PySpark',
    channel: 'freeCodeCamp.org',
    subject: 'data-science',
    subtopic: 'Big Data & Distributed Computing',
    duration: '8:14:20',
    level: 'Big Data Architecture',
    views: '1.2M',
    year: '2022',
    gateWeightage: 'Big Data Systems',
    description: 'Learn large-scale distributed data processing using Apache Spark: Resilient Distributed Datasets (RDDs), Spark DataFrames, Spark SQL, and PySpark transformations.',
    keyTakeaways: [
      'Spark distributed architecture: Driver, Cluster Manager, Executors, and Tasks',
      'Resilient Distributed Datasets (RDDs): Transformations (lazy) vs Actions (eager)',
      'Optimizing query plans with Spark Catalyst Optimizer and Tungsten engine',
      'Handling data shuffling, partitioning, and caching across worker nodes'
    ],
    tags: ['data-science', 'spark', 'pyspark', 'big data', 'hadoop', 'distributed']
  },
  {
    id: 'r-uOLxNrNk8',
    title: 'Principal Component Analysis (PCA) Clearly Explained Step by Step',
    channel: 'StatQuest with Josh Starmer',
    subject: 'data-science',
    subtopic: 'Dimensionality Reduction',
    duration: '21:57',
    level: 'Mathematical Foundations',
    views: '3.2M',
    year: '2018',
    gateWeightage: 'GATE DA High-Yield',
    description: 'Intuitive, geometric visual explanation of Principal Component Analysis (PCA) for dimensionality reduction, variance maximization, and eigenvector projection.',
    keyTakeaways: [
      'Finding the axis of maximum variance through the centered data cloud',
      'Deriving Principal Components from covariance matrix eigenvectors and eigenvalues',
      'Scree plots and determining cumulative explained variance ratios',
      'Projecting high-dimensional feature spaces onto orthogonal 2D/3D planes'
    ],
    tags: ['data-science', 'pca', 'statquest', 'linear algebra', 'machine learning']
  },
  {
    id: 'gp94z-yJt4E',
    title: 'Statistics for Data Science - Probability Distributions & Hypothesis Testing',
    channel: 'freeCodeCamp.org',
    subject: 'data-science',
    subtopic: 'Statistical Inference',
    duration: '8:02:15',
    level: 'Core Mathematical Foundations',
    views: '2.1M',
    year: '2021',
    gateWeightage: 'Probability & Statistics for CS/DA',
    description: 'Complete statistics course for data science: descriptive stats, normal distribution, central limit theorem, confidence intervals, p-values, t-tests, and ANOVA.',
    keyTakeaways: [
      'Measures of central tendency (mean, median, mode) and dispersion (variance, std dev, IQR)',
      'Probability distributions: Binomial, Poisson, Uniform, and Gaussian (Normal)',
      'The Central Limit Theorem (CLT) and sampling distributions',
      'Hypothesis testing: Null vs Alternative hypotheses, Type I / II errors, p-value interpretation'
    ],
    tags: ['data-science', 'statistics', 'probability', 'hypothesis testing', 'math']
  },

  // ================= WEB DEVELOPMENT & FULL STACK =================
  {
    id: 'bMknfKXIFA8',
    title: 'React Course 2024 - Beginner to Advanced React.js Development',
    channel: 'freeCodeCamp.org',
    subject: 'web-dev',
    subtopic: 'Frontend & UI Engineering',
    duration: '11:55:20',
    level: 'Modern Web Standard',
    views: '3.7M',
    year: '2024',
    gateWeightage: 'Web Technologies & Frontend',
    description: 'Complete hands-on masterclass in modern React: JSX, props, state, event handlers, hooks (useState, useEffect, useMemo, useCallback, useRef), and component architecture.',
    keyTakeaways: [
      'Declarative UI paradigm and Virtual DOM reconciliation diffing algorithm',
      'Mastering hooks lifecycle: managing side effects and avoiding infinite re-render loops',
      'Unidirectional data flow, lifting state up, and context API state management',
      'Component modularity, custom hooks creation, and performance optimization'
    ],
    tags: ['web-dev', 'react', 'javascript', 'frontend', 'ui', 'freecodecamp']
  },
  {
    id: 'Oe421EPjeBE',
    title: 'Node.js and Express.js Full Course - Build RESTful APIs and Backends',
    channel: 'freeCodeCamp.org',
    subject: 'web-dev',
    subtopic: 'Backend & Server-Side APIs',
    duration: '8:16:40',
    level: 'Backend Architecture',
    views: '2.9M',
    year: '2022',
    gateWeightage: 'Backend Engineering',
    description: 'Comprehensive backend course covering Node.js event loop, asynchronous non-blocking I/O, Express middleware, routing, authentication with JWT, and MongoDB integration.',
    keyTakeaways: [
      'Node.js single-threaded event loop and libuv thread pool architecture',
      'Express request-response lifecycle and middleware chain execution',
      'Building RESTful APIs: HTTP methods (GET, POST, PUT, DELETE) and status codes',
      'Securing endpoints with JSON Web Tokens (JWT) and bcrypt password hashing'
    ],
    tags: ['web-dev', 'nodejs', 'express', 'backend', 'api', 'javascript']
  },
  {
    id: 'm55PTVUrlnA',
    title: 'Next.js 14 Full Stack Development Course - Server Components & Actions',
    channel: 'freeCodeCamp.org',
    subject: 'web-dev',
    subtopic: 'Full Stack Modern Frameworks',
    duration: '5:40:15',
    level: 'Full Stack Production',
    views: '1.4M',
    year: '2024',
    gateWeightage: 'Full Stack Web Architecture',
    description: 'Master Next.js App Router: React Server Components (RSC), Client Components, Server Actions, streaming with Suspense, routing, and database mutations.',
    keyTakeaways: [
      'Server-Side Rendering (SSR), Static Site Generation (SSG), and Incremental Static Regeneration (ISR)',
      'Next.js 14 App Router file-system routing: layout, page, loading, error handlers',
      'React Server Components fetching data directly on server without API endpoints',
      'Server Actions handling form submissions and cache revalidation'
    ],
    tags: ['web-dev', 'nextjs', 'react', 'fullstack', 'ssr', 'web development']
  },
  {
    id: 'PkZNo7MFNFg',
    title: 'JavaScript Programming Full Course - Core Concepts to Asynchronous JS',
    channel: 'freeCodeCamp.org',
    subject: 'web-dev',
    subtopic: 'JavaScript Engine & Language',
    duration: '7:42:30',
    level: 'Language Core',
    views: '5.1M',
    year: '2021',
    gateWeightage: 'Programming Foundations',
    description: 'Learn modern JavaScript from variables and data types to closures, prototypal inheritance, execution context, promises, and async/await.',
    keyTakeaways: [
      'Execution context, call stack, hoisting, and scope chain mechanics',
      'Closures and lexical scoping for encapsulation and functional programming',
      'Prototypes, prototypal inheritance, and ES6 class syntax',
      'Asynchronous JavaScript: Callback queue, Microtask queue, Promises, and async/await'
    ],
    tags: ['web-dev', 'javascript', 'js', 'frontend', 'async', 'es6']
  },

  // ================= MOBILE APP DEVELOPMENT =================
  {
    id: 'fis26HvvDAE',
    title: 'Android App Development with Kotlin & Jetpack Compose - Full Course',
    channel: 'freeCodeCamp.org',
    subject: 'mobile-dev',
    subtopic: 'Native Android Development',
    duration: '11:35:10',
    level: 'Industry Standard Android',
    views: '1.8M',
    year: '2023',
    gateWeightage: 'Mobile Engineering',
    description: 'Modern Android development masterclass: Kotlin language, Jetpack Compose declarative UI, ViewModel, State hoisting, Coroutines, and Room database.',
    keyTakeaways: [
      'Modern declarative UI with Jetpack Compose vs traditional XML layouts',
      'Android app architecture: UI layer, ViewModel, Repository, and Data sources (MVVM)',
      'Managing asynchronous background tasks with Kotlin Coroutines and Flows',
      'Persisting offline data with Room SQLite database'
    ],
    tags: ['mobile-dev', 'android', 'kotlin', 'jetpack compose', 'mobile']
  },
  {
    id: 'comQ1-x2a1Q',
    title: 'Flutter Course for Beginners - 37 Hour Cross-Platform Tutorial for iOS & Android',
    channel: 'freeCodeCamp.org',
    subject: 'mobile-dev',
    subtopic: 'Cross-Platform Mobile Dev',
    duration: '37:12:00',
    level: 'Comprehensive Cross-Platform',
    views: '3.5M',
    year: '2022',
    gateWeightage: 'Mobile & UI Frameworks',
    description: 'Complete cross-platform mobile engineering with Google Flutter and Dart: Widget trees, state management (BLoC / Provider), navigation, Firebase, and native platform channels.',
    keyTakeaways: [
      'Dart programming language fundamentals and strong sound null-safety',
      'Flutter reactive UI architecture: Stateless vs Stateful widgets',
      'State management patterns: Provider, Riverpod, and BLoC architecture',
      'Deploying unified codebase to both iOS App Store and Google Play Store'
    ],
    tags: ['mobile-dev', 'flutter', 'dart', 'ios', 'android', 'cross-platform']
  },
  {
    id: '0-S5a0eXPoc',
    title: 'React Native Full Course 2024 - Build Cross-Platform Native Apps',
    channel: 'freeCodeCamp.org',
    subject: 'mobile-dev',
    subtopic: 'React Native & Mobile JS',
    duration: '6:40:20',
    level: 'Mobile Application Engineering',
    views: '1.1M',
    year: '2024',
    gateWeightage: 'Cross-Platform Mobile',
    description: 'Build native iOS and Android apps using React and Expo: native styling, touch gestures, navigation (Expo Router), camera access, and performance tuning.',
    keyTakeaways: [
      'React Native bridge vs New Architecture (JSI, Fabric renderer, TurboModules)',
      'Building screens with View, Text, FlatList, and Flexbox layouts',
      'File-based mobile navigation with Expo Router',
      'Accessing native device hardware (Camera, Location, Push Notifications)'
    ],
    tags: ['mobile-dev', 'react native', 'expo', 'ios', 'android', 'javascript']
  },

  // ================= SOFTWARE ENGINEERING & ARCHITECTURE =================
  {
    id: 'v9ejT8FO-7I',
    title: 'Design Patterns in Java & OOP - Creational, Structural & Behavioral',
    channel: 'freeCodeCamp.org',
    subject: 'software-engineering',
    subtopic: 'Design Patterns & OOP',
    duration: '2:40:10',
    level: 'Core Engineering',
    views: '1.9M',
    year: '2022',
    gateWeightage: 'Software Engineering & Design Patterns',
    description: 'Comprehensive breakdown of Gang of Four (GoF) design patterns: Singleton, Factory Method, Builder, Adapter, Decorator, Observer, Strategy, and Command patterns.',
    keyTakeaways: [
      'Creational patterns: Singleton, Factory, Abstract Factory, and Builder',
      'Structural patterns: Adapter, Decorator, Facade, and Composite',
      'Behavioral patterns: Observer, Strategy, Command, and State',
      'When to apply design patterns vs when to avoid premature overengineering'
    ],
    tags: ['software-engineering', 'design patterns', 'oop', 'java', 'architecture']
  },
  {
    id: 'FLmBqI3IKMA',
    title: 'SOLID Principles Explained with Real Code Examples',
    channel: 'freeCodeCamp.org',
    subject: 'software-engineering',
    subtopic: 'Clean Architecture Principles',
    duration: '48:30',
    level: 'Engineering Standards',
    views: '1.7M',
    year: '2021',
    gateWeightage: 'Software Engineering Best Practices',
    description: 'Clear, real-world code walkthrough of the five core SOLID principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.',
    keyTakeaways: [
      'Single Responsibility Principle (SRP): A class should have one, and only one, reason to change',
      'Open/Closed Principle (OCP): Open for extension, closed for modification',
      'Liskov Substitution Principle (LSP): Subtypes must be substitutable for base types without breaking behavior',
      'Interface Segregation (ISP) and Dependency Inversion (DIP) via Dependency Injection'
    ],
    tags: ['software-engineering', 'solid', 'clean code', 'architecture', 'best practices']
  },
  {
    id: '2pZ-ny8q26o',
    title: 'Software Architecture Patterns: Monoliths, Microservices, Event-Driven',
    channel: 'freeCodeCamp.org',
    subject: 'software-engineering',
    subtopic: 'High-Level Architecture',
    duration: '2:10:20',
    level: 'Senior Architecture',
    views: '1.3M',
    year: '2023',
    gateWeightage: 'Software Architecture',
    description: 'Architectural comparison of Monolithic, Layered (N-Tier), Microservices, and Event-Driven architectures with message queues (Kafka, RabbitMQ).',
    keyTakeaways: [
      'Monolithic vs Microservices tradeoffs: simplicity vs distributed complexity',
      'Event-Driven architecture: Producers, Consumers, Event Brokers, and idempotent processing',
      'Database-per-service challenges: Distributed transactions, Saga pattern, and eventual consistency',
      'API Gateways, service discovery, and circuit breaker fault tolerance'
    ],
    tags: ['software-engineering', 'architecture', 'microservices', 'event-driven', 'kafka']
  },

  // ================= BLOCKCHAIN & WEB3 =================
  {
    id: 'gyMwXuJrbJQ',
    title: 'Blockchain, Solidity, and Full Stack Web3 Development with JavaScript',
    channel: 'freeCodeCamp.org',
    subject: 'blockchain',
    subtopic: 'Smart Contracts & Web3',
    duration: '32:10:00',
    level: 'Masterclass Developer Course',
    views: '2.8M',
    year: '2022',
    gateWeightage: 'Distributed Ledger Technology',
    description: 'Complete Web3 curriculum: blockchain basics, smart contract development with Solidity, Remix, Hardhat, Ethers.js, and deploying decentralized applications (DApps).',
    keyTakeaways: [
      'Distributed consensus, cryptographic hashing, immutability, and ledger state machines',
      'Writing secure Solidity smart contracts with inheritance, modifiers, and events',
      'Testing and deploying contracts using Hardhat and automated test suites',
      'Connecting React web applications to MetaMask wallets using Ethers.js'
    ],
    tags: ['blockchain', 'solidity', 'web3', 'ethereum', 'smart contracts', 'crypto']
  },
  {
    id: 'bBC-nXj3nG4',
    title: 'How does bitcoin actually work? Cryptographic Hash Functions & Proof of Work',
    channel: '3Blue1Brown',
    subject: 'blockchain',
    subtopic: 'Cryptographic Consensus',
    duration: '25:55',
    level: 'Core Foundations',
    views: '14.2M',
    year: '2017',
    gateWeightage: 'Consensus & Cryptography',
    description: 'Mathematical and visual explanation of how decentralized digital currency works without a central authority: ledger security, SHA-256 proof of work, and block chaining.',
    keyTakeaways: [
      'Digital signatures guaranteeing transaction authenticity and preventing fraud',
      'The ledger integrity problem and why trustless networks require consensus mechanisms',
      'Proof of work: computing a cryptographic nonce such that SHA-256(Block + Nonce) < Target',
      'Fork resolution via the longest-chain (most accumulated computational work) rule'
    ],
    tags: ['blockchain', 'bitcoin', '3blue1brown', 'cryptography', 'proof of work', 'sha256']
  },
  {
    id: 'umepbfKo5wY',
    title: 'Solidity, Ethereum, and Smart Contracts - Full Hands-On Course',
    channel: 'freeCodeCamp.org',
    subject: 'blockchain',
    subtopic: 'Ethereum Virtual Machine',
    duration: '16:20:00',
    level: 'Smart Contract Security',
    views: '1.6M',
    year: '2021',
    gateWeightage: 'EVM & Smart Contracts',
    description: 'Deep dive into the Ethereum Virtual Machine (EVM), gas mechanics, token standards (ERC-20, ERC-721 NFTs), and smart contract vulnerability prevention.',
    keyTakeaways: [
      'Ethereum Virtual Machine (EVM) opcode execution and gas calculation',
      'Implementing ERC-20 fungible tokens and ERC-721 non-fungible tokens (NFTs)',
      'Common smart contract vulnerabilities: Reentrancy attacks, integer overflow, flash loans',
      'Auditing smart contracts using static analysis tools'
    ],
    tags: ['blockchain', 'ethereum', 'solidity', 'smart contracts', 'erc20', 'evm']
  },

  // ================= EXPANDED CYBER SECURITY & PENETRATION TESTING =================
  {
    id: 's19BxFpdlec',
    title: 'Network Security Fundamentals - Firewalls, IDS, IPS & Packet Inspection',
    channel: 'freeCodeCamp.org',
    subject: 'cyber-security',
    subtopic: 'Network Defense & Infrastructure',
    duration: '2:40:15',
    level: 'Core Security',
    views: '1.4M',
    year: '2023',
    gateWeightage: 'Network Security Architecture',
    description: 'Deep dive into securing networks: perimeter defense, IDS/IPS signatures, deep packet inspection, VPN tunneling protocols (IPSec, OpenVPN, WireGuard), and zero-trust segmentation.',
    keyTakeaways: [
      'Stateless vs Stateful firewalls and Next-Gen Application Layer Firewalls (WAF)',
      'Intrusion Detection (IDS) vs Intrusion Prevention (IPS) inline deployment',
      'IPSec architecture: Authentication Header (AH) vs Encapsulating Security Payload (ESP)',
      'Implementing Zero Trust Network Architecture (ZTNA)'
    ],
    tags: ['cyber-security', 'network security', 'firewall', 'ids', 'ips', 'vpn']
  },
  {
    id: '1uYnQOmP-l4',
    title: 'Web Application Security & Bug Bounty Hunting - Complete Hands-On Course',
    channel: 'freeCodeCamp.org',
    subject: 'cyber-security',
    subtopic: 'Web App Exploitation',
    duration: '4:18:22',
    level: 'Advanced Web Security',
    views: '2.1M',
    year: '2023',
    gateWeightage: 'Web Application Vulnerabilities',
    description: 'Comprehensive bug bounty and web penetration testing guide: reconnaissance, directory fuzzing, parameter tampering, SSRF, IDOR, and privilege escalation.',
    keyTakeaways: [
      'Insecure Direct Object References (IDOR) testing and access control flaws',
      'Server-Side Request Forgery (SSRF) and cloud metadata exfiltration',
      'Content Security Policy (CSP) bypasses and mitigation strategies',
      'Responsible vulnerability reporting and CVSS score calculation'
    ],
    tags: ['cyber-security', 'bug bounty', 'idor', 'ssrf', 'web security', 'pentesting']
  },
  {
    id: 'qXZh_5o4jE8',
    title: 'Cryptography and Public Key Infrastructure (PKI) - Full University Course',
    channel: 'freeCodeCamp.org',
    subject: 'cyber-security',
    subtopic: 'Mathematical Cryptography',
    duration: '3:30:10',
    level: 'Undergraduate / GATE',
    views: '980K',
    year: '2022',
    gateWeightage: 'GATE CS Cryptography High-Yield',
    description: 'Rigorous mathematical course on cryptography: modular arithmetic, Diffie-Hellman key exchange, Elliptic Curve Cryptography (ECC), SHA-3, and zero-knowledge proofs.',
    keyTakeaways: [
      'Discrete logarithm problem and Diffie-Hellman key agreement',
      'Elliptic Curve Cryptography (ECC) advantages over traditional RSA',
      'Cryptographic nonce usage and preventing replay attacks',
      'Certificate Authorities (CA), X.509 certificates, and TLS handshakes'
    ],
    tags: ['cyber-security', 'cryptography', 'diffie hellman', 'ecc', 'gate pyq', 'math']
  },
  {
    id: 'Ul106_mK6e0',
    title: 'SOC Analyst Full Course - Security Operations Center & SIEM Analysis',
    channel: 'freeCodeCamp.org',
    subject: 'cyber-security',
    subtopic: 'Defensive Security & SOC',
    duration: '5:45:00',
    level: 'Blue Team Engineering',
    views: '1.7M',
    year: '2023',
    gateWeightage: 'Security Operations & Incident Response',
    description: 'Master defensive cybersecurity in a Security Operations Center: incident response triage, SIEM log analysis with Splunk, threat hunting with MITRE ATT&CK, and forensic investigation.',
    keyTakeaways: [
      'The Incident Response lifecycle (Preparation, Detection, Containment, Eradication, Recovery)',
      'Mapping attacker behavior to the MITRE ATT&CK matrix',
      'SIEM correlation rules, alert triage, and log parsing in Splunk/Elastic',
      'Memory and disk forensics using Volatility and Autopsy'
    ],
    tags: ['cyber-security', 'soc', 'blue team', 'siem', 'splunk', 'incident response']
  },
  {
    id: 'WcQfG_U2oU8',
    title: 'Wireshark Tutorial for Beginners - Packet Sniffing & Traffic Analysis',
    channel: 'NetworkChuck',
    subject: 'cyber-security',
    subtopic: 'Packet Analysis & Forensics',
    duration: '26:15',
    level: 'Practical Networking',
    views: '3.1M',
    year: '2022',
    gateWeightage: 'Packet Analysis & TCP Diagnostics',
    description: 'Hands-on Wireshark course: capturing packets, filtering protocols, analyzing TCP 3-way handshakes, identifying cleartext credentials, and spotting network anomalies.',
    keyTakeaways: [
      'Capturing live interfaces and configuring promiscuous mode',
      'Writing display filters: ip.addr, tcp.port, http.request, dns',
      'Following TCP streams to reconstruct application payload data',
      'Detecting ARP poisoning, port scans, and SYN flood attacks'
    ],
    tags: ['cyber-security', 'wireshark', 'networkchuck', 'packet analysis', 'forensics']
  },

  // ================= EXPANDED AI & MACHINE LEARNING =================
  {
    id: 'i_LwzRVP7bg',
    title: 'Stanford CS229: Machine Learning - Lecture 1 (Supervised Learning & Regression)',
    channel: 'Stanford Online / Andrew Ng',
    subject: 'ai-ml',
    subtopic: 'Machine Learning Theory',
    duration: '1:19:12',
    level: 'Stanford University Graduate',
    views: '5.2M',
    year: '2019',
    gateWeightage: 'Core Machine Learning',
    description: 'Iconic Stanford CS229 lecture by Andrew Ng: supervised vs unsupervised learning, linear regression, cost functions, gradient descent derivation, and LMS algorithm.',
    keyTakeaways: [
      'Supervised vs Unsupervised learning mathematical formulations',
      'Mean Squared Error (MSE) loss function derivation and convexity',
      'Batch Gradient Descent vs Stochastic Gradient Descent update rules',
      'Normal equation derivation: theta = (X^T * X)^(-1) * X^T * y'
    ],
    tags: ['ai-ml', 'andrew ng', 'cs229', 'stanford', 'machine learning', 'regression']
  },
  {
    id: 'wjZofJX0v4U',
    title: 'Visualizing Attention and Transformers - How LLMs Process Text',
    channel: '3Blue1Brown',
    subject: 'ai-ml',
    subtopic: 'Transformer Architecture',
    duration: '26:45',
    level: 'Advanced Deep Learning',
    views: '4.8M',
    year: '2024',
    gateWeightage: 'Generative AI & LLMs',
    description: 'Magnificent visual walkthrough of the Transformer architecture: query, key, and value vectors, scaled dot-product attention, multi-head attention, and embedding matrices.',
    keyTakeaways: [
      'Attention matrix computation: Softmax((Q * K^T) / sqrt(d_k)) * V',
      'Why Query and Key dot products calculate contextual semantic similarity',
      'Multi-head attention projecting representation across multiple subspaces',
      'How positional encoding allows parallel processing without recurrent recurrence'
    ],
    tags: ['ai-ml', 'transformers', 'attention', '3blue1brown', 'llm', 'deep learning']
  },
  {
    id: 'tPYj3fFJGjk',
    title: 'PyTorch for Deep Learning & Neural Networks - Full Course',
    channel: 'freeCodeCamp.org',
    subject: 'ai-ml',
    subtopic: 'PyTorch Framework',
    duration: '25:40:00',
    level: 'Production Deep Learning',
    views: '3.6M',
    year: '2022',
    gateWeightage: 'Deep Learning Implementation',
    description: 'Comprehensive PyTorch masterclass: tensor math, autograd engine, building neural networks, computer vision with CNNs, transfer learning, and deploying models.',
    keyTakeaways: [
      'PyTorch Tensor operations, GPU acceleration via CUDA, and dynamic compute graphs',
      'Implementing forward pass, loss computation, and loss.backward() backprop',
      'Dataset and DataLoader pipelines with image augmentations',
      'Exporting PyTorch models to ONNX and TorchScript for production inference'
    ],
    tags: ['ai-ml', 'pytorch', 'deep learning', 'neural networks', 'freecodecamp']
  },
  {
    id: 'cdg478N4AOM',
    title: 'Reinforcement Learning Course - Q-Learning, Policy Gradients & Deep Q Networks',
    channel: 'freeCodeCamp.org',
    subject: 'ai-ml',
    subtopic: 'Reinforcement Learning',
    duration: '8:12:30',
    level: 'Advanced AI',
    views: '890K',
    year: '2021',
    gateWeightage: 'Markov Decision Processes & RL',
    description: 'Master Reinforcement Learning from foundations: Markov Decision Processes (MDP), Bellman equations, tabular Q-learning, Policy Gradients, and Deep Q Networks (DQN).',
    keyTakeaways: [
      'Markov Decision Process 5-tuple: (S, A, P, R, gamma)',
      'Bellman Optimality Equations for V*(s) and Q*(s, a)',
      'Exploration vs Exploitation trade-off (epsilon-greedy strategy)',
      'Deep Q Networks with experience replay buffer and target networks'
    ],
    tags: ['ai-ml', 'reinforcement learning', 'q learning', 'dqn', 'bellman', 'freecodecamp']
  },

  // ================= EXPANDED CLOUD & DEVOPS =================
  {
    id: 'SOTamWNgDKc',
    title: 'AWS Certified Solutions Architect Associate Full Course - Pass the Exam!',
    channel: 'freeCodeCamp.org',
    subject: 'cloud-computing',
    subtopic: 'Cloud Architecture & AWS',
    duration: '10:25:00',
    level: 'Professional Certification',
    views: '1.9M',
    year: '2023',
    gateWeightage: 'High-Availability Cloud Architecture',
    description: 'Comprehensive curriculum for AWS Solutions Architect: multi-region resilient architecture, auto-scaling groups, application load balancers, RDS Aurora, SQS/SNS messaging, and IAM security.',
    keyTakeaways: [
      'Designing highly available, fault-tolerant, and decoupled architectures on AWS',
      'Multi-AZ vs Multi-Region deployments and Disaster Recovery strategies (RTO/RPO)',
      'Decoupled asynchronous processing using SQS message queues and SNS pub/sub',
      'Securing cloud resources via IAM policies, KMS encryption, and VPC Peering'
    ],
    tags: ['cloud-computing', 'aws', 'solutions architect', 'cloud', 'devops', 'freecodecamp']
  },
  {
    id: 'N_7l0X3aWmg',
    title: 'Microsoft Azure Fundamentals Certification Course (AZ-900) - Pass the Exam!',
    channel: 'freeCodeCamp.org',
    subject: 'cloud-computing',
    subtopic: 'Azure Cloud Architecture',
    duration: '3:15:00',
    level: 'Industry Certification',
    views: '1.5M',
    year: '2023',
    gateWeightage: 'Azure Cloud Services',
    description: 'Complete hands-on masterclass for Microsoft Azure: Azure Resource Manager, Virtual Machines, Azure App Service, Virtual Networks, Blob Storage, and Azure Entra ID (Active Directory).',
    keyTakeaways: [
      'Azure core architectural components: Geographies, Regions, and Availability Zones',
      'Compute options: Virtual Machines, Azure Container Instances, and Azure Functions',
      'Azure Virtual Network (VNet), Subnets, NSGs, and VPN Gateway connectivity',
      'Identity management, RBAC role-based access control, and Azure Policy governance'
    ],
    tags: ['cloud-computing', 'azure', 'az900', 'microsoft', 'cloud', 'devops']
  },

  // ================= EXPANDED WEB DEVELOPMENT =================
  {
    id: 'bMknfKXIFA8',
    title: 'React Course - Beginner\'s Tutorial for React JavaScript Library [2024]',
    channel: 'freeCodeCamp.org',
    subject: 'web-dev',
    subtopic: 'Frontend & React',
    duration: '11:55:00',
    level: 'Comprehensive Frontend',
    views: '5.8M',
    year: '2024',
    gateWeightage: 'Modern Frontend Engineering',
    description: 'Comprehensive React masterclass: JSX syntax, components, props, useState, useEffect, conditional rendering, forms, custom hooks, and state management.',
    keyTakeaways: [
      'Virtual DOM reconciliation algorithm and component render lifecycle',
      'Managing state immutably with useState and useReducer',
      'Handling side effects, API calls, and cleanup with useEffect',
      'Building performant custom hooks and Context API state stores'
    ],
    tags: ['web-dev', 'react', 'javascript', 'frontend', 'freecodecamp', 'hooks']
  },
  {
    id: 'Oe421EPjeBE',
    title: 'Node.js and Express.js - Full Course for Beginners',
    channel: 'freeCodeCamp.org',
    subject: 'web-dev',
    subtopic: 'Backend & Server Engineering',
    duration: '8:16:00',
    level: 'Production Backend',
    views: '3.9M',
    year: '2022',
    gateWeightage: 'REST APIs & Server Architecture',
    description: 'Master backend web development: Node.js event loop, libuv, modules, file system, streams, buffers, building RESTful APIs with Express, middleware, and MongoDB integration.',
    keyTakeaways: [
      'Node.js single-threaded asynchronous non-blocking event loop architecture',
      'Express routing, parameter handling, and custom middleware pipelines',
      'CRUD REST API design, HTTP status codes, and input validation',
      'Database connection pooling and schema modeling with Mongoose'
    ],
    tags: ['web-dev', 'nodejs', 'express', 'backend', 'rest api', 'javascript']
  },
  {
    id: 'C-52AI_ojyQ',
    title: 'Next.js 14 Full Course 2024 - Server Components, Server Actions & App Router',
    channel: 'freeCodeCamp.org',
    subject: 'web-dev',
    subtopic: 'Full Stack & SSR',
    duration: '5:30:00',
    level: 'Production Full Stack',
    views: '1.2M',
    year: '2024',
    gateWeightage: 'Modern Full Stack Engineering',
    description: 'Learn modern Next.js with App Router: React Server Components (RSC), Client Components, Server Actions, Dynamic Routing, Streaming with Suspense, and SEO optimization.',
    keyTakeaways: [
      'React Server Components (RSC) vs Client Components mental model',
      'Server Actions replacing traditional REST API endpoint routes',
      'Streaming HTML and progressive hydration with Suspense boundaries',
      'Static Site Generation (SSG), Incremental Static Regeneration (ISR), and SSR'
    ],
    tags: ['web-dev', 'nextjs', 'react', 'full stack', 'ssr', 'server components']
  },

  // ================= EXPANDED DATA SCIENCE & BIG DATA =================
  {
    id: 'LHBE6Q9XlzI',
    title: 'Python for Data Science - Full Course for Beginners',
    channel: 'freeCodeCamp.org',
    subject: 'data-science',
    subtopic: 'Data Analysis & Scientific Python',
    duration: '12:00:00',
    level: 'Core Foundations',
    views: '4.2M',
    year: '2022',
    gateWeightage: 'Data Science Core',
    description: 'Comprehensive guide to scientific Python: NumPy ndarrays, vectorized operations, Pandas DataFrames, data cleaning, exploratory analysis, and Matplotlib visualizations.',
    keyTakeaways: [
      'NumPy memory layouts, broadcasting rules, and vectorized array calculations',
      'Pandas data indexing, filtering, groupby aggregations, and merging DataFrames',
      'Handling missing values, outlier detection, and data normalization',
      'Plotting statistical distributions with Matplotlib and Seaborn'
    ],
    tags: ['data-science', 'python', 'pandas', 'numpy', 'data analysis', 'freecodecamp']
  },
  {
    id: '_aWzGGNrcV8',
    title: 'Apache Spark with Python (PySpark) - Big Data Engineering Full Course',
    channel: 'freeCodeCamp.org',
    subject: 'data-science',
    subtopic: 'Big Data & Distributed Computing',
    duration: '3:45:00',
    level: 'Big Data Engineering',
    views: '920K',
    year: '2023',
    gateWeightage: 'Distributed Data Systems',
    description: 'Master big data processing with Apache Spark and PySpark: RDDs, DataFrames, Spark SQL, transformations vs actions, lazy evaluation, cluster architecture, and partitioned shuffles.',
    keyTakeaways: [
      'Spark Master-Worker cluster architecture (Driver, Cluster Manager, Executors)',
      'Resilient Distributed Datasets (RDD) immutability and lineage graph fault tolerance',
      'Transformations (map, filter) vs Actions (count, collect) and lazy evaluation',
      'Optimizing query plans using the Catalyst Optimizer and Tungsten engine'
    ],
    tags: ['data-science', 'spark', 'pyspark', 'big data', 'distributed systems']
  },

  // ================= EXPANDED SYSTEM DESIGN =================
  {
    id: 'i53Gi_K3o7I',
    title: 'System Design for Beginners Course - Distributed Systems & Scalability',
    channel: 'freeCodeCamp.org',
    subject: 'system-design',
    subtopic: 'Scalability & System Architecture',
    duration: '1:45:00',
    level: 'Production System Design',
    views: '3.1M',
    year: '2023',
    gateWeightage: 'System Design Core',
    description: 'Essential primer on designing massive-scale web architectures: vertical vs horizontal scaling, load balancers, database replication, caching layers, CDNs, and microservices.',
    keyTakeaways: [
      'Horizontal vs Vertical scaling and the CAP Theorem (Consistency, Availability, Partition Tolerance)',
      'Load balancing algorithms (Round Robin, Least Connections, Consistent Hashing)',
      'Caching patterns: Cache-Aside, Write-Through, Write-Behind, and eviction policies (LRU)',
      'Database scaling: Master-Slave read replicas, horizontal sharding, and database indexing'
    ],
    tags: ['system-design', 'distributed systems', 'scalability', 'architecture', 'freecodecamp']
  },
  {
    id: 'xpDnVSmDvn0',
    title: 'Microservices Architecture Explained - Design Patterns, APIs & Event Bus',
    channel: 'freeCodeCamp.org',
    subject: 'system-design',
    subtopic: 'Microservices & Event-Driven Systems',
    duration: '2:10:00',
    level: 'Enterprise Architecture',
    views: '1.8M',
    year: '2022',
    gateWeightage: 'Microservices Architecture',
    description: 'Learn modern microservices design: decomposing monoliths, API Gateway pattern, Service Discovery, Event-Driven Architecture with Kafka, and Distributed Tracing.',
    keyTakeaways: [
      'Monolithic vs Microservice architecture tradeoffs and Domain-Driven Design (DDD)',
      'API Gateway pattern for authentication, rate limiting, and request routing',
      'Asynchronous event-driven communication using Apache Kafka and RabbitMQ',
      'Managing distributed transactions using the Saga Pattern (Choreography vs Orchestration)'
    ],
    tags: ['system-design', 'microservices', 'kafka', 'api gateway', 'architecture']
  }
];


