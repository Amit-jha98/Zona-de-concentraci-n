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
    assert.equal(value.examGuide.length,3);
    assert.ok(value.examGuide.every(section=>typeof section.body==="string"&&section.body.length>80&&!/TODO|coming soon/i.test(section.body)),lesson.id);
    assert.equal(value.advancedQuiz.length,1);
    assert.equal(value.advancedQuiz[0].source,"original");
    assert.equal(gradeQuestion(value.advancedQuiz[0],String(value.advancedQuiz[0].accepted.ranges[0][0])).correct,true);
    assert.deepEqual(value.pyqIds,bank.questions.filter(q=>q.lessonIds.includes(lesson.id)).map(q=>q.id));
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
