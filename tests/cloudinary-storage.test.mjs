import test from "node:test";
import assert from "node:assert/strict";
import { Writable, Readable } from "node:stream";
import { createCloudinaryStorage } from "../server/cloudinary-storage.mjs";

test("Cloudinary chunk acknowledgements do not publish an unfinished upload", async () => {
  const previous=process.env.CLOUDINARY_URL;
  process.env.CLOUDINARY_URL="cloudinary://fixture-key:fixture-secret@fixture-cloud";
  try {
    let finishUpload,config,settled=false;
    const client={uploader:{upload_chunked_stream(options,callback){config=options;return new Writable({write(_chunk,_encoding,done){done();},final(done){callback(null,{done:false,bytes:3});finishUpload=()=>callback(null,{done:true,bytes:9,public_id:options.public_id});done();}});}}};
    const storage=createCloudinaryStorage({client});
    const pending=storage.put("edubrowse-downloads/fixture.mp4",Readable.from(["media"])).then(value=>{settled=true;return value;});
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(settled,false);
    assert.equal(config.type,"authenticated");
    assert.equal(config.resource_type,"video");
    assert.equal(config.overwrite,false);
    finishUpload();
    assert.deepEqual(await pending,{pathname:"edubrowse-downloads/fixture.mp4",size:9});
  } finally {if(previous===undefined)delete process.env.CLOUDINARY_URL;else process.env.CLOUDINARY_URL=previous;}
});
test("Cloudinary signing rejects expired or mismatched requests and stays within app-owned assets",async()=>{
  const previous=process.env.CLOUDINARY_URL;
  process.env.CLOUDINARY_URL="cloudinary://fixture-key:fixture-secret@fixture-cloud";
  try {
    let signature;
    const storage=createCloudinaryStorage({client:{utils:{private_download_url(id,format,options){signature={id,format,options};return "https://fixture.example/signed";}}}});
    const pathname="edubrowse-downloads/fixture.mp4";
    await assert.rejects(()=>storage.put("other-app/file.mp4",Readable.from(["x"])));
    await assert.rejects(()=>storage.presignUrl({pathname,validUntil:Date.now()-1},{pathname}));
    await assert.rejects(()=>storage.presignUrl({pathname,validUntil:Date.now()+10000},{pathname:"edubrowse-downloads/another.mp4"}));
    const signed=await storage.presignUrl({pathname,validUntil:Date.now()+10000},{pathname});
    assert.equal(signed.presignedUrl,"https://fixture.example/signed");
    assert.equal(signature.options.attachment,true);
    assert.equal(signature.options.type,"authenticated");
    assert.equal(signature.id,"edubrowse-downloads/fixture");
  }finally {if(previous===undefined)delete process.env.CLOUDINARY_URL;else process.env.CLOUDINARY_URL=previous;}
});
