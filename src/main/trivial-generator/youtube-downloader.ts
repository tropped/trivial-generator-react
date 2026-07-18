import fs from "fs";
import path from "path";

import { logToFile } from "./debug-log";
import { getYtDlpWrap } from "./yt-dlp-manager";

type DownloadAudioParams = {
  outputDir: string;
  songId: string;
};

export async function downloadAudio({ outputDir, songId }: DownloadAudioParams) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const offlineFolder = path.join(outputDir, "offline");
  if (!fs.existsSync(offlineFolder)) fs.mkdirSync(offlineFolder);

  const fullPath = path.join(offlineFolder, `${songId}.mp3`);

  if (fs.existsSync(fullPath)) {
    const sizeInBytes = fs.statSync(fullPath).size;

    if (sizeInBytes > 0) return true;
    else return false;
  }

  try {
    const ytDlpWrap = await getYtDlpWrap();

    // Electron's own binary satisfies yt-dlp's Node>=22 requirement when run
    // with ELECTRON_RUN_AS_NODE, so no separate JS runtime needs to be bundled.
    await ytDlpWrap.execPromise(
      [
        `https://youtu.be/${songId}`,
        "-f",
        "bestaudio",
        "-o",
        fullPath,
        "--no-playlist",
        "--js-runtimes",
        `node:${process.execPath}`
      ],
      { env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" } }
    );

    console.log(`${songId} downloaded`);
    return true;
  } catch (err) {
    const message = err instanceof Error ? (err.stack ?? err.message) : String(err);
    console.error(`Error downloading ${songId} -- ${message}`);
    logToFile(`Error downloading ${songId} -- ${message}`);
    return false;
  }
}
