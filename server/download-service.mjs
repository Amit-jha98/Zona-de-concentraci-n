import * as local from "./downloads.mjs";
import { cloudDownloads } from "./cloud-downloads.mjs";

const localDownloads = {
  status: local.downloadStatus,
  create: local.createDownload,
  get: local.getDownload,
  file: local.getDownloadFile,
  cancel: local.cancelDownload,
};
export const downloadService = () =>
  process.env.VERCEL === "1" ? cloudDownloads : localDownloads;
