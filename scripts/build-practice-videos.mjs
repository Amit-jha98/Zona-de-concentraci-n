// Live YouTube metadata only. This script never imports Gemini.
import { readFile,writeFile } from "node:fs/promises";
import { EXAM_LESSONS } from "../src/data/gate/index.js";
import depth from "./depth/index.mjs";
import { searchVideos } from "../server/youtube.mjs";
const destination="public/gate-topic-practice-videos.json";
let previous={lessons:{}};
try {previous=JSON.parse(await readFile(destination,"utf8"));}catch{/* first build */}
const limit=Number(process.argv.find(arg=>arg.startsWith("--limit="))?.split("=")[1]||150);
const selected=process.argv.find(arg=>arg.startsWith("--topics="))?.split("=")[1]?.split(",");
const queue=EXAM_LESSONS.filter(l=>(!selected||selected.includes(l.id))&&!previous.lessons[l.id]?.items?.length).slice(0,limit);
const output={...previous,source:"Live YouTube metadata, title/description relevance and short duration; full lecture contents have not been editorially reviewed.",lessons:previous.lessons};
const academic=/Gate Smashers|Neso Academy|Amit Khurana|GO Classes|Knowledge Gate|Ravindrababu|NPTEL|GATE Wallah|Unacademy|Jenny|Abdul Bari|GATE Academy|GeeksforGeeks|Last moment tuitions|GATE Overflow|Made Easy|Easy Engineering|CareerRide|Feel Free to Learn|GATE CSE|TalentSprint|Freshersworld|Adda247|Ekeeda|Exergic/i;
const aptitudeQueries={"ga-quantitative":"percentages quantitative aptitude GATE","ga-reasoning":"syllogism logical reasoning GATE","ga-spatial":"spatial aptitude GATE Exergic"};
const aptitudeMatches={"ga-quantitative":/percent|ratio|mixture|data interpretation|time.and.work/i,"ga-reasoning":/syllogism|logical reasoning|seating|arrangement/i,"ga-spatial":/cube|dice|spatial|paper.fold|mirror.image/i};
let completed=0;
let saving=Promise.resolve();
async function worker(){
  while(queue.length){
    const l=queue.shift();
    const focus=process.argv.includes("--fallback")?l.videoQuery:process.argv.includes("--broad")?depth[l.id].videoFocus.split(" ").slice(0,3).join(" "):depth[l.id].videoFocus;
    const query=aptitudeQueries[l.id]||focus+" GATE solved questions";
    try {
      const result=await searchVideos({query,duration:"concept"});
      if(process.argv.includes("--inspect"))console.log(JSON.stringify({topic:l.id,candidates:result.items.map(v=>({id:v.id,title:v.title,channel:v.channel,duration:v.duration}))}));
      const words=depth[l.id].videoFocus.toLowerCase().match(/[a-z0-9]{3,}/g).filter(w=>!["the","and","gate","questions","solved"].includes(w));
      const items=result.items.map(v=>({...v,score:words.filter(w=>v.title.toLowerCase().includes(w)).length}))
        .filter(v=>v.duration>=120&&v.duration<=1800&&(aptitudeMatches[l.id]?.test(v.title)||v.score>=2)&&academic.test(v.channel)&&!/marathon|one shot|complete (?:course|syllabus)/i.test(v.title))
        .sort((a,b)=>Number(/solved|numerical|question|problem|pyq/i.test(b.title))-Number(/solved|numerical|question|problem|pyq/i.test(a.title))||b.score-a.score)
        .slice(0,3).map(({score:_score,...v})=>v);
      output.lessons[l.id]={query,checkedAt:result.fetchedAt,items};
    }catch(error){output.lessons[l.id]={query,items:[],error:error.code||"LOOKUP_FAILED"};}
    completed++;
    output.checkedAt=new Date().toISOString();
    await (saving=saving.then(()=>writeFile(destination,JSON.stringify(output))));
    if(completed%5===0||!queue.length)console.log(JSON.stringify({completed,remaining:queue.length,resolved:Object.values(output.lessons).filter(v=>v.items.length).length}));
  }
}
await Promise.all([worker(),worker(),worker()]);
