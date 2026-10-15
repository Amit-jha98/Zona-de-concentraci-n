import { CHANNELS } from "../src/data/library.js";
for (const channel of CHANNELS) {
  try {
    const response = await fetch(
      "https://www.youtube.com/feeds/videos.xml?channel_id=" + channel.id,
      { signal: AbortSignal.timeout(15000) },
    );
    const xml = await response.text();
    console.log(
      JSON.stringify({
        expected: channel.name,
        id: channel.id,
        status: response.status,
        actual: xml.match(/<title>([^<]*)<\/title>/)?.[1],
      }),
    );
  } catch (e) {
    console.log(channel.name, e.message);
  }
}
for (const handle of ["@mitocw", "@takeUforward", "@NeetCode"]) {
  try {
    const response = await fetch("https://www.youtube.com/" + handle, {
      signal: AbortSignal.timeout(15000),
    });
    const html = await response.text();
    const metadata = html.match(
      /"channelMetadataRenderer":\{(.{0,10000}?)/,
    )?.[0];
    console.log(
      JSON.stringify({
        handle,
        metadata,
        id: html.match(/"externalId":"(UC[^"]+)"/)?.[1],
      }),
    );
  } catch (e) {
    console.log(handle, e.message);
  }
}
