import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser=await chromium.launch({channel:"chrome",headless:true});
await mkdir("docs/screenshots",{recursive:true});
try {
  for(const [name,width,height]of[["desktop",1440,1000],["mobile",390,844]]){
    const page=await browser.newPage({viewport:{width,height},isMobile:name==="mobile",hasTouch:name==="mobile"});
    await page.route("**/api/**",route=>route.fulfill({json:{items:[],downloads:{available:true},tutor:{configured:true}}}));
    await page.goto("http://127.0.0.1:5173/#/lesson/hashing?tab=practice");
    await page.locator('[data-question-id="hashing-exam-1"]').waitFor();
    const offenders=await page.evaluate(()=>[...document.querySelectorAll("main *")].flatMap(element=>{const r=element.getBoundingClientRect();return r.width>0&&r.right>innerWidth+1?[{tag:element.tagName,cls:element.className,width:r.width,right:r.right,text:element.textContent.slice(0,55)}]:[];}).slice(0,20));
    console.log(JSON.stringify({name,documentWidth:await page.evaluate(()=>document.documentElement.scrollWidth),viewportWidth:width,offenders}));
    await page.screenshot({path:"docs/screenshots/"+name+"-pyq-practice.png"});
    await page.goto("http://127.0.0.1:5173/#/mocks");
    await page.locator(".mock-card").first().waitFor();
    await page.screenshot({path:"docs/screenshots/"+name+"-mocks.png"});
    await page.goto("http://127.0.0.1:5173/#/mock/2026-cs2");
    await page.getByRole("button",{name:"Begin timed exam"}).click();
    await page.getByLabel("Time remaining").waitFor();
    await page.screenshot({path:"docs/screenshots/"+name+"-timed-exam.png"});
    await page.close();
  }
} finally {await browser.close();}
