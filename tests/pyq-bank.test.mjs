import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { EXAM_LESSONS } from "../src/data/gate/index.js";
import { officialAnswer, scoreExam, gradeQuestion } from "../shared/exam.js";
const bank = JSON.parse(await readFile(new URL("../public/gate-pyq-bank.json", import.meta.url)));
const registry = new Set(EXAM_LESSONS.map((lesson) => lesson.id));
test("all seven complete source papers retain their official questions, marks and source images", async () => {
  const source = JSON.parse(await readFile(new URL("../docs/PYQ/extracted/catalog.json", import.meta.url)));
  assert.equal(bank.questions.length, 455);
  assert.equal(new Set(bank.questions.map((q) => q.id)).size, 455);
  for (const paper of source) {
    const questions = bank.questions.filter((q) => q.paperId === paper.id);
    assert.equal(questions.length, 65);
    assert.equal(questions.reduce((n,q) => n+q.marks,0), 100);
    for (const original of paper.questions) {
      const q = questions.find((q) => q.id === original.id);
      for (const field of ["type","marks","number","officialKey"]) assert.equal(q[field], original[field], `${q.id} ${field}`);
      assert.deepEqual(q.accepted, officialAnswer(original.type, original.officialKey));
      assert.ok(q.solution.length >= 100 && !q.solution.includes("undefined"), q.id);
      assert.equal(q.reviewStatus, "authored");
      assert.ok(q.lessonIds.length && q.lessonIds.every((id) => registry.has(id)), q.id);
      if (q.number <= 10) assert.match(q.lessonIds[0], /^ga-/);
      assert.equal(gradeQuestion(q,q.solvedAnswer).correct,true,q.id);
      assert.ok(q.images.length > 0);
      for (const image of q.images) await access(new URL(`../public${image.src}`, import.meta.url));
    }
  }
});
test("ten mocks preserve full-paper scoring and mixed mocks have no overlapping source questions", () => {
  assert.equal(bank.exams.length,10);
  const seen = new Set();
  for (const exam of bank.exams) {
    assert.equal(exam.durationMinutes,180);
    assert.equal(new Set(exam.questionIds).size,65);
    const questions=exam.questionIds.map((id)=>bank.questions.find((q)=>q.id===id));
    assert.equal(questions.length,65);
    assert.equal(questions.filter(q=>q.number<=10).length,10);
    assert.equal(questions.filter(q=>q.number<=10).reduce((sum,q)=>sum+q.marks,0),15);
    assert.equal(questions.filter(q=>q.marks===1).length,30);
    assert.equal(scoreExam(questions,Object.fromEntries(questions.map(q=>[q.id,q.solvedAnswer]))).marks,100);
    if(exam.kind==="mixed") for(const id of exam.questionIds) {assert.equal(seen.has(id),false,id);seen.add(id);}
  }
});
test("every one of the 150 exam lessons has expanded notes, a valid original drill and exact PYQ links",async()=>{
  for(const lesson of EXAM_LESSONS){
    const value=JSON.parse(await readFile(new URL(`../public/gate-exam-notes/${lesson.id}.json`,import.meta.url)));
    assert.equal(value.lessonId,lesson.id);
    assert.ok(value.examGuide.length>=6);
    assert.ok(value.examGuide.every(section=>typeof section.body==="string"&&section.body.length>30&&!/TODO|coming soon/i.test(section.body)),lesson.id);
    assert.ok(value.advancedQuiz.length>=4);
    assert.equal(value.advancedQuiz[0].source,"original");
    assert.equal(gradeQuestion(value.advancedQuiz[0],String(value.advancedQuiz[0].accepted.ranges[0][0])).correct,true);
    assert.deepEqual(value.pyqIds,bank.questions.filter(q=>q.lessonIds.includes(lesson.id)).map(q=>q.id));
  }
});

test("PYQ priorities account for all questions once and balance years with unequal paper counts",async()=>{
  const report=JSON.parse(await readFile(new URL("../public/gate-pyq-analysis.json",import.meta.url)));
  assert.equal(report.questionAnalysis.length,455);
  assert.equal(report.topics.reduce((s,t)=>s+t.primaryMarks,0),700);
  assert.equal(report.topics.reduce((s,t)=>s+t.primaryCount,0),455);
  assert.ok(Math.abs(report.topics.reduce((s,t)=>s+t.meanMarks,0)-100)<1e-9);
  for(const topic of report.topics){
    const qs=bank.questions.filter(q=>q.lessonIds[0]===topic.id);
    const mean=report.years.reduce((sum,year)=>sum+qs.filter(q=>q.year===year).reduce((s,q)=>s+q.marks,0)/report.papers.filter(p=>p.year===year).length,0)/4;
    assert.equal(topic.meanMarks,mean,topic.id);
    assert.equal(topic.priority==="vvi",topic.years.length>=3&&qs.length>=4,topic.id);
  }
});

test("all topics have varied practice and prerequisites form a valid acyclic learning graph",async()=>{
  const notes=new Map();
  for(const l of EXAM_LESSONS)notes.set(l.id,JSON.parse(await readFile(new URL("../public/gate-exam-notes/"+l.id+".json",import.meta.url))));
  let questions=0;
  const positions=new Set(),cardinalities=new Set();
  for(const [id,n]of notes){
    const newDrills=n.advancedQuiz.slice(1);
    for(const type of ["MCQ","MSQ","NAT"])assert.ok(newDrills.some(q=>q.type===type),id+" "+type);
    assert.equal(new Set(n.advancedQuiz.map(q=>q.prompt)).size,n.advancedQuiz.length,id);
    for(const q of newDrills){
      assert.equal(gradeQuestion(q,q.solvedAnswer).correct,true,q.id);
      assert.equal(q.source,"original");
      if(q.type==="MCQ")positions.add(q.accepted.alternatives[0][0]);
      if(q.type==="MSQ")cardinalities.add(q.accepted.alternatives[0].length);
    }
    if(n.pyqAnalysis.priority==="vvi")assert.ok(newDrills.some(q=>q.difficulty==="transfer"),id);
    assert.ok(n.videoPlan.practiceQuery.includes("GATE"));
    assert.ok(n.videoPlan.checkpoints.length>=3);
    questions+=n.advancedQuiz.length;
    const walk=(current,path)=>{
      assert.ok(notes.has(current),current);
      assert.equal(path.has(current),false,"prerequisite cycle: "+[...path,current].join("→"));
      for(const next of notes.get(current).prerequisites)walk(next,new Set([...path,current]));
    };
    walk(id,new Set());
  }
  assert.equal(questions,644);
  assert.equal(positions.size,4);
  assert.deepEqual([...cardinalities].sort(),[1,2,3,4]);
});

test("transfer-question numerical answers agree with independent small-instance calculations",async()=>{
  const answer=async id=>{
    const n=JSON.parse(await readFile(new URL("../public/gate-exam-notes/"+id+".json",import.meta.url)));
    return Number(n.advancedQuiz.find(q=>q.difficulty==="transfer").solvedAnswer);
  };
  let relations=0;
  for(let mask=0;mask<512;mask++){
    const rows=[0,1,2].every(r=>[0,1,2].some(c=>mask&(1<<(3*r+c))));
    const cols=[0,1,2].every(c=>[0,1,2].some(r=>mask&(1<<(3*r+c))));
    if(rows&&cols)relations++;
  }
  assert.equal(await answer("first-order-logic"),relations);
  let colourings=0;
  for(let code=0;code<3**5;code++){
    let k=code;const colours=Array.from({length:5},()=>{const c=k%3;k=Math.floor(k/3);return c;});
    if(colours.every((c,i)=>c!==colours[(i+1)%5]))colourings++;
  }
  assert.equal(await answer("graph-colouring"),colourings);
  let loops=0;for(let i=1;i<=8;i++)for(let j=1;j<=i;j*=2)loops++;
  assert.equal(await answer("asymptotic-analysis"),loops);
  const cases={"eigenvalues":244,"integration":-0.25,"floating-point":1/64,"instruction-set":96,"cache-mapping":9,"instruction-pipelining":92,"c-pointers":12,"c-memory":9,"recursion":63,"binary-search-trees":80,"binary-heaps":80,"algorithm-recurrences":256,"minimum-spanning-trees":16,"regular-expressions":11,"context-free-grammars":9,"processes":6,"paging":98,"network-layering":790,"ipv4-cidr":22,"tcp-flow-control":20,"ga-quantitative":30.4,"ga-reasoning":6,"ga-spatial":24};
  for(const [id,expected]of Object.entries(cases))assert.equal(await answer(id),expected,id);
});

test("every syllabus and aptitude concept retains a short verified video candidate",async()=>{
  const concepts=JSON.parse(await readFile(new URL("../public/gate-topic-videos.json",import.meta.url)));
  const practice=JSON.parse(await readFile(new URL("../public/gate-topic-practice-videos.json",import.meta.url)));
  for(const l of EXAM_LESSONS){
    const clips=[...(concepts.lessons[l.id]?.items||[]),...(practice.lessons[l.id]?.items||[])];
    assert.ok(clips.some(v=>/^[A-Za-z0-9_-]{11}$/.test(v.id)&&v.duration>=120&&v.duration<=1800),l.id);
  }
  for(const entry of Object.values(practice.lessons))for(const clip of entry.items){
    assert.ok(Number.isFinite(clip.duration)&&clip.duration>=120&&clip.duration<=1800,clip.id);
    assert.ok(clip.title&&clip.channel);
  }
});
test("known numerical and diagram corrections preserve actual mathematical results",()=>{
  const question=id=>bank.questions.find(q=>q.id===id);
  assert.equal(gradeQuestion(question("2026-cs2-q34"),"-60.25").correct,true);
  assert.equal(gradeQuestion(question("2026-cs2-q34"),"60.25").correct,false);
  assert.equal(gradeQuestion(question("2023-cs-q30"),"2").correct,true);
  assert.equal(gradeQuestion(question("2023-cs-q30"),"4").correct,true);
  assert.match(question("2023-cs-q38").solution,/stale write/);
  assert.match(question("2023-cs-q39").solution,/regular nonempty language/);
  let bits="110001011000".split("").map(Number);
  for(let i=0;i<bits.length-3;i++)if(bits[i])for(let j=0;j<4;j++)bits[i+j]^=[1,0,0,1][j];
  assert.equal(bits.slice(-3).join(""),"100");
  assert.match(question("2026-cs2-q43").solution,/100/);
});
