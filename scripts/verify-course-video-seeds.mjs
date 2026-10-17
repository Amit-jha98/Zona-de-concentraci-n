import {readFile,writeFile} from "node:fs/promises";
import {videoMetadata,runTool} from "../server/youtube.mjs";
const path="public/gate-topic-practice-videos.json";
const catalog=JSON.parse(await readFile(path,"utf8"));
for(const [lesson,ids]of Object.entries({"ga-quantitative":["5BCbXXtSw3Y","sUN95mhYjMU"],"ga-reasoning":["Arb8GeVpLuY"],"cache-mapping":["F_gOWc50MtI"]})){
  for(const id of ids){
    try {
      const video=await videoMetadata(id);
      const raw=JSON.parse(await runTool(["--dump-single-json","--flat-playlist","--playlist-end","5","--","ytsearch5:"+id],{timeout:30000}));
      const metadata=raw.entries?.find(item=>item.id===id);
      video.duration=metadata?.duration;
      video.channelId=metadata?.channel_id;
      if(!Number.isFinite(video.duration)||video.duration<120||video.duration>1800)throw new Error("No verified short-lecture duration");
      const record=catalog.lessons[lesson];
      record.items=[video,...record.items.filter(v=>v.id!==id)].slice(0,3);
      record.checkedAt=new Date().toISOString();
      console.log(JSON.stringify({lesson,id,title:video.title,duration:video.duration,verified:true}));
    }catch(error){
      catalog.lessons[lesson].items=catalog.lessons[lesson].items.filter(v=>v.id!==id||Number.isFinite(v.duration));
      console.log(JSON.stringify({lesson,id,verified:false,code:error.code||"LOOKUP_FAILED"}));
    }
  }
}
catalog.checkedAt=new Date().toISOString();
await writeFile(path,JSON.stringify(catalog));
