import { app } from "electron";
import fs from "fs";
import path from "path";
import type YtDlpWrapType from "yt-dlp-wrap";

import { logToFile } from "./debug-log";

// electron-vite externalizes this CJS package. Its ESM-interop transform for
// `import`/`import * as` both mangle the default export in different ways
// (confirmed by inspecting the bundled output), so bypass that transform
// entirely with a literal `require()`, which is left untouched.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ytDlpWrapRaw = require("yt-dlp-wrap");
const YTDlpWrap: typeof YtDlpWrapType = ytDlpWrapRaw.default ?? ytDlpWrapRaw;

let ytDlpWrapPromise: Promise<InstanceType<typeof YTDlpWrap>> | null = null;

function getFileName(): string {
  return process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
}

function getBundledBinaryPath(): string {
  return path.join(process.resourcesPath, "bin", getFileName());
}

function getFallbackBinaryPath(): string {
  return path.join(app.getPath("userData"), getFileName());
}

export function getYtDlpWrap(): Promise<InstanceType<typeof YTDlpWrap>> {
  if (!ytDlpWrapPromise) {
    ytDlpWrapPromise = (async () => {
      const bundledPath = getBundledBinaryPath();
      if (fs.existsSync(bundledPath)) {
        return new YTDlpWrap(bundledPath);
      }

      // Not bundled (e.g. running unpackaged in dev) — fall back to
      // downloading it once into userData.
      const binaryPath = getFallbackBinaryPath();
      if (!fs.existsSync(binaryPath)) {
        logToFile(`Downloading yt-dlp binary to ${binaryPath}`);
        await YTDlpWrap.downloadFromGithub(binaryPath);
        logToFile(`yt-dlp binary downloaded successfully`);
      }
      return new YTDlpWrap(binaryPath);
    })().catch((err) => {
      // Don't cache a failed attempt: a transient failure (e.g. network hiccup
      // downloading the binary) would otherwise permanently break every future
      // download for the rest of the app's lifetime.
      ytDlpWrapPromise = null;
      logToFile(
        `Failed to set up yt-dlp: ${err instanceof Error ? (err.stack ?? err.message) : err}`
      );
      throw err;
    });
  }
  return ytDlpWrapPromise;
}
