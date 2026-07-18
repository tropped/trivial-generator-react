const fs = require("fs");
const path = require("path");
const YTDlpWrap = require("yt-dlp-wrap").default;

const platform = process.argv[2] || process.platform;
const fileName = platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
const outDir = path.join(__dirname, "..", "resources", "bin", platform);
const outPath = path.join(outDir, fileName);

async function main() {
  if (fs.existsSync(outPath)) {
    console.log(`yt-dlp binary already present at ${outPath}, skipping download`);
    return;
  }

  fs.mkdirSync(outDir, { recursive: true });
  console.log(`Downloading yt-dlp binary for platform "${platform}" to ${outPath}...`);
  await YTDlpWrap.downloadFromGithub(outPath, undefined, platform);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
