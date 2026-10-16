import test from "node:test";
import assert from "node:assert/strict";
import { officialAnswer, gradeQuestion, scoreExam, answerLabel } from "../shared/exam.js";
import { examAttemptsValid, startExamAttempt } from "../src/services/examState.js";
import { progressValid } from "../src/services/stateValidation.js";

const q = (type, key, marks = 2) => ({ id: "2023-cs-q11", type, marks, officialKey: key, accepted: officialAnswer(type, key) });
test("MCQ scoring applies exactly one-third negative marks and ignores blank responses", () => {
  const question = q("MCQ", "B");
  assert.equal(gradeQuestion(question, [1]).marks, 2);
  assert.equal(gradeQuestion(question, [0]).marks, -2 / 3);
  assert.equal(gradeQuestion(question, []).marks, 0);
  assert.equal(gradeQuestion(question, [0, 1]).correct, false);
  assert.equal(gradeQuestion(question, undefined).attempted, false);
});
test("MSQ requires an exact set and supports multiple officially accepted combinations", () => {
  const question = q("MSQ", "A, C, D or C, D");
  assert.equal(gradeQuestion(question, [2, 0, 3]).correct, true);
  assert.equal(gradeQuestion(question, [3, 2]).correct, true);
  assert.equal(gradeQuestion(question, [0, 2]).marks, 0);
  assert.equal(gradeQuestion(question, [0, 1, 2, 3]).marks, 0);
  assert.equal(gradeQuestion(question, ["0", 2, 3]).correct, false);
});
test("NAT accepts inclusive official ranges, alternative ranges and signed decimals", () => {
  const question = q("NAT", "-2.60 to -2.50 OR 4 to 4");
  for (const answer of ["-2.6", "-2.55", " -2.50 ", "4.000"]) assert.equal(gradeQuestion(question, answer).correct, true, answer);
  for (const answer of ["-2.61", "NaN", "Infinity", "0x4", "4 units", "1e3"]) assert.equal(gradeQuestion(question, answer).correct, false, answer);
  assert.equal(gradeQuestion(question, "").attempted, false);
  assert.equal(gradeQuestion(q("NAT", "- 60.25 to   - 60.25"), "-60.25").correct, true);
  assert.equal(gradeQuestion(q("NAT", "- 60.25 to   - 60.25"), "60.25").correct, false);
});
test("marks-to-all applies even without an answer, and total marks avoid floating point drift", () => {
  const questions = [q("MCQ", "A", 1), { ...q("MCQ", "C", 1), id: "2023-cs-q12" }, { ...q("MCQ", "MTA", 1), id: "2023-cs-q13" }];
  const result = scoreExam(questions, { "2023-cs-q11": [1], "2023-cs-q12": [1] });
  assert.equal(result.marks, 0.333333);
  assert.equal(result.attempted, 2);
  assert.equal(result.results[2].status, "awarded");
  assert.equal(answerLabel(questions[2]), "Marks to all (official key)");
});
test("attempts preserve their original deadline and validate restored answer types", () => {
  const exam = { id: "2023-cs", durationMinutes: 180, questionIds: ["2023-cs-q11", "2023-cs-q12"] };
  const attempt = startExamAttempt(exam, 100000);
  assert.equal(attempt.deadline, 100000 + 180 * 60000);
  assert.equal(examAttemptsValid([attempt]), true);
  assert.equal(examAttemptsValid([{ ...attempt, answers: { unknown: [1] } }]), false);
  assert.equal(examAttemptsValid([{ ...attempt, answers: { "2023-cs-q11": { nested: true } } }]), false);
  assert.equal(examAttemptsValid([{ ...attempt, currentIndex: 2 }]), false);
  assert.equal(examAttemptsValid([{ ...attempt, deadline: attempt.startedAt }]), false);
  assert.equal(examAttemptsValid([{ ...attempt, submittedAt: attempt.startedAt - 1 }]), false);
});
test("topic PYQ progress validates independently of the old concept-check answers", () => {
  assert.equal(progressValid({ sets: { pyqAnswers: { q1: { response: [0, 2], correct: true } } } }), true);
  assert.equal(progressValid({ sets: { pyqAnswers: { q1: { response: "-2.55", correct: false } } } }), true);
  assert.equal(progressValid({ sets: { pyqAnswers: { q1: { response: { invalid: true }, correct: true } } } }), false);
  assert.equal(progressValid({ sets: { pyqAnswers: [] } }), false);
});
