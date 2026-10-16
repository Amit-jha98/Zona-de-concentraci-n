import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const bank=JSON.parse(readFileSync(new URL("../../public/gate-pyq-bank.json",import.meta.url)));
test.beforeEach(async({page})=>{
  await page.route("**/api/**",async route=>{
    const path=new URL(route.request().url()).pathname;
    await route.fulfill({json:path==="/api/tutor"?{answer:"Use the stated assumptions, then substitute one value at a time.",lessonId:route.request().postDataJSON().lessonId}:path==="/api/health"?{ok:true,tutor:{configured:true},downloads:{available:true,storage:"cloudinary"}}:{items:[],channelsAvailable:6,channelsTotal:6}});
  });
});
const begin=async page=>{
  await page.goto("/#/mock/2023-cs");
  await page.getByRole("button",{name:"Begin timed exam"}).click();
  await expect(page.getByLabel("Time remaining")).toBeVisible();
};
const submit=async page=>{
  await page.getByRole("button",{name:"Submit exam",exact:true}).click();
  await page.getByRole("button",{name:"Submit and review"}).click();
  await expect(page.locator(".exam-scoreboard")).toBeVisible();
};
test("all complete and mixed mocks are available and fit the viewport",async({page})=>{
  await page.goto("/#/mocks");
  await expect(page.getByRole("heading",{name:"GATE CS mock exams",exact:true})).toBeVisible();
  await expect(page.locator(".mock-card")).toHaveCount(10);
  await expect(page.locator(".mock-card").first()).toContainText("65 questions");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test("answers and the original deadline survive reload; solutions wait for submission",async({page})=>{
  await begin(page);
  await page.locator(".exam-question").getByRole("radio").nth(1).check();
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem("edubrowse_v3_exams"))[0]);
  await expect(page.getByText("Official answer:",{exact:false})).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Ask about this topic",exact:true})).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".exam-question").getByRole("radio").nth(1)).toBeChecked();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("edubrowse_v3_exams"))[0].deadline)).toBe(before.deadline);
  await submit(page);
  await expect(page.locator(".exam-scoreboard")).toContainText("2.00");
  await expect(page.getByText("Official answer: B",{exact:false})).toBeVisible();
  await expect(page.getByRole("button",{name:"Ask about this topic",exact:true})).toBeVisible();
});
test("MSQ and numerical responses can be flagged, cleared and scored with source images",async({page})=>{
  await begin(page);
  await page.getByRole("button",{name:"Question 22, unanswered",exact:true}).click();
  for(const index of [1,2,3])await page.locator(".exam-question").getByRole("checkbox").nth(index).check();
  await page.getByRole("button",{name:"Flag for review",exact:true}).click();
  await expect(page.getByRole("button",{name:"Unflag question",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Question 32, unanswered",exact:true}).click();
  await page.getByLabel("Your numerical answer",{exact:true}).fill("110");
  await page.getByRole("button",{name:"Clear response",exact:true}).click();
  await expect(page.getByLabel("Your numerical answer",{exact:true})).toHaveValue("");
  await page.getByLabel("Your numerical answer",{exact:true}).fill("110");
  if(!await page.locator(".exam-question details.question-source").evaluate(element=>element.open))await page.locator(".exam-question .question-source > summary").click();
  await page.getByRole("button",{name:/Enlarge original question 32/}).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button",{name:"Close dialog",exact:true}).click();
  await submit(page);
  await expect(page.locator(".exam-scoreboard")).toContainText("3.00");
  await page.getByRole("button",{name:"Flagged",exact:true}).click();
  await expect(page.getByText("Question 22 of 65",{exact:true})).toBeVisible();
});
test("expired saved attempts submit automatically on return without resetting the timer",async({page})=>{
  const now=Date.now();
  const attempt={id:"00000000-0000-4000-8000-000000000001",examId:"2023-cs",questionIds:bank.exams[0].questionIds,startedAt:now-10805000,deadline:now-5000,submittedAt:null,answers:{"2023-cs-q1":[1]},flagged:[],currentIndex:0};
  await page.addInitScript(value=>localStorage.setItem("edubrowse_v3_exams",JSON.stringify([value])),attempt);
  await page.goto(`/#/mock/2023-cs?attempt=${attempt.id}`);
  await expect(page.locator(".exam-scoreboard")).toContainText("2.00");
  await expect(page.getByText(/Time expired; your saved responses/)).toBeVisible();
  await expect(page.locator(".exam-question").getByRole("radio").nth(1)).toBeDisabled();
});
test("expanded topic notes and extra original practice load without a tutor request",async({page})=>{
  let requests=0;
  page.on("request",request=>{if(new URL(request.url()).pathname==="/api/tutor")requests++;});
  await page.goto("/#/lesson/hashing");
  await expect(page.getByRole("heading",{name:"Approach the exam question",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Ask about this topic",exact:true}).click();
  await page.getByRole("button",{name:"Clarify the key assumption",exact:true}).click();
  await expect(page.getByRole("textbox",{name:/Your question about/})).toHaveValue("Clarify the key assumption");
  expect(requests).toBe(0);
  await page.getByRole("button",{name:"Send question",exact:true}).click();
  await expect(page.getByText("Use the stated assumptions, then substitute one value at a time.",{exact:true})).toBeVisible();
  expect(requests).toBe(1);
  await page.getByRole("tab",{name:"Practice",exact:true}).click();
  await expect(page.locator('[data-question-id="hashing-exam-1"]')).toBeVisible();
  expect(await page.locator(".pyq-card").count()).toBeGreaterThan(2);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test("a lesson without a directly mapped PYQ still has complete original practice",async({page})=>{
  await page.goto("/#/lesson/tabular-minimization?tab=practice");
  await expect(page.locator('[data-question-id="tabular-minimization-exam-1"]')).toBeVisible();
  await expect(page.getByText(/No question in the supplied/)).toBeVisible();
});
