import { app } from "electron";
import fs from "fs";
import path from "path";

export function logToFile(message: string) {
  const logPath = path.join(app.getPath("userData"), "yt-dlp-debug.log");
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logPath, line);
}
