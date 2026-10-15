import { existsSync } from "node:fs";
import { isAbsolute } from "node:path";
import bundledFFmpeg from "ffmpeg-static";

export const ffmpegPath = () =>
  process.env.FFMPEG_PATH ||
  (bundledFFmpeg && existsSync(bundledFFmpeg) ? bundledFFmpeg : "ffmpeg");

export const mediaFormat = (quality) =>
  `bestvideo[ext=mp4][height<=${quality}]+bestaudio[ext=m4a]/best[ext=mp4][height<=${quality}]/bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]`;

// A bare "ffmpeg" location makes yt-dlp look for a relative file instead of
// searching PATH, which can leave audio and video unmerged.
export const ffmpegLocationArgs = () =>
  isAbsolute(ffmpegPath()) ? ["--ffmpeg-location", ffmpegPath()] : [];
