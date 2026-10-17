import { chromium } from "@playwright/test";
import {mkdir} from "node:fs/promises";
const browser=await chromium.launch({channel:"chrome",headless:true});
await mkdir("docs/screenshots",{recursive:true});
try{
  for(const [name,width,height]of [["desktop",1440,1000],["mobile",390,844]]){
    const page=await browser.newPage({viewport:{width,height},isMobile:name==="mobile",hasTouch:name==="mobile"});
    await page.route("**/api/**",route=>route.fulfill({json:{items:[],downloads:{available:true},tutor:{configured:true}}}));
    await page.goto("http://127.0.0.1:5173/#/gate");
    const evidence=page.getByRole("region",{name:"PYQ priorities",exact:true});
    await evidence.getByRole("table").waitFor();
    await evidence.scrollIntoViewIfNeeded();
    await page.screenshot({path:"docs/screenshots/"+name+"-course-priorities.png"});
    console.log(JSON.stringify({name,route:"gate",viewport:width,width:await page.evaluate(()=>document.documentElement.scrollWidth)}));
    await page.goto("http://127.0.0.1:5173/#/lesson/paging");
    await page.getByRole("heading",{name:"Mental model and derivation",exact:true}).waitFor();
    await page.getByRole("heading",{name:"Mental model and derivation",exact:true}).scrollIntoViewIfNeeded();
    await page.screenshot({path:"docs/screenshots/"+name+"-course-notes.png"});
    await page.goto("http://127.0.0.1:5173/#/lesson/cache-mapping?tab=videos");
    await page.getByRole("button",{name:"Solve GATE problems",exact:true}).click();
    await page.getByRole("region",{name:"Video study plan"}).waitFor();
    await page.screenshot({path:"docs/screenshots/"+name+"-course-videos.png"});
    console.log(JSON.stringify({name,route:"lesson",viewport:width,width:await page.evaluate(()=>document.documentElement.scrollWidth)}));
    await page.close();
  }
}finally{await browser.close();}
