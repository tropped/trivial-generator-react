import { app } from "electron";
import fs from "fs";
import path from "path";

// Only builds that opt in via MAIN_VITE_ENABLE_DEBUG_LOG write this file --
// it's meant for the developer's own troubleshooting builds, not ones handed
// out to other people, so it defaults to off.
const DEBUG_LOG_ENABLED = import.meta.env.MAIN_VITE_ENABLE_DEBUG_LOG === "true";

export function logToFile(message: string) {
  if (!DEBUG_LOG_ENABLED) return;

  const logPath = path.join(app.getPath("userData"), "yt-dlp-debug.log");
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logPath, line);
}
