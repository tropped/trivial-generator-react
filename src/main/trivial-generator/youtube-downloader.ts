import fs from "fs";
import path from "path";

import { logToFile } from "./debug-log";
import { getYtDlpWrap } from "./yt-dlp-manager";

type DownloadAudioParams = {
  outputDir: string;
  songId: string;
};

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  const ytDlpWrap = await getYtDlpWrap();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
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
      const attemptLabel = `attempt ${attempt}/${MAX_ATTEMPTS}`;
      console.error(`Error downloading ${songId} (${attemptLabel}) -- ${message}`);
      logToFile(`Error downloading ${songId} (${attemptLabel}) -- ${message}`);

      // yt-dlp can fail after partially writing the output file; clear it so
      // the next attempt (or the existsSync check on a future run) doesn't
      // mistake a partial/empty file for a completed download.
      if (fs.existsSync(fullPath)) fs.rmSync(fullPath);

      if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS);
    }
  }

  return false;
}
