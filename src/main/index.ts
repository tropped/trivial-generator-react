import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

import { renderTemplate } from "./trivial-generator/template-render";
import { downloadAudio } from "./trivial-generator/youtube-downloader";
import { importYoutubePlaylist } from "./youtube/playlist-importer";

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      webSecurity: false
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on("ping", () => console.log("pongo"));

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on("dialog:openDirectory", async (event) => {
  {
    const mainWindow = BrowserWindow.fromWebContents(event.sender)!;
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"]
    });
    if (!canceled) {
      mainWindow.webContents.send("dialog:outputDirectory", { path: filePaths[0] });
    }
  }
});

ipcMain.on("dialog:saveAs", async (event) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender)!;

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    filters: [
      {
        name: "JSON (*.json)",
        extensions: ["json"]
      }
    ]
  });

  if (!canceled) {
    mainWindow.webContents.send("dialog:listTargetPath", { path: filePath });
  }
});

export interface BaseSong {
  id: string;
  name: string;
  difficulty: "easy" | "normal" | "hard";
}

export interface AnimeSong extends BaseSong {
  anime: string;
  oped: "Opening" | "Ending" | "OST";
  band: string;
}

export interface GameSong extends BaseSong {
  game: string;
  saga: string;
}

export interface NormieSong extends BaseSong {
  band: string;
}

export type Song = AnimeSong | GameSong | NormieSong;

export type GenerateTrivialBody = {
  unembeddableIds: Array<string>;
  failedIds: Array<string>;
  author: string;
  songs: AnimeSong[];
  outputDir: string;
  trivialType: "anime" | "normie" | "game";
};

ipcMain.on("generate:trivial", async (event, body: GenerateTrivialBody) => {
  console.log("Starting trivial generation backend");
  const mainWindow = BrowserWindow.fromWebContents(event.sender)!;

  const { outputDir, unembeddableIds, failedIds, author, songs, trivialType } = body;

  await renderTemplate({
    songs,
    author,
    outputDir,
    unembeddableIds,
    failedIds,
    trivialType
  });

  mainWindow.webContents.send("generate:trivial:completed");
});

export type GenerateDownloadBody = {
  songId: string;
  outputDir: string;
};

ipcMain.on("generate:download", async (event, body: GenerateDownloadBody) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender)!;

  const { outputDir, songId } = body;
  const isDownloaded = await downloadAudio({ outputDir, songId }).catch(() => false);

  mainWindow.webContents.send("generate:onDownloadCompleted", { songId, isDownloaded });
});

export type ImportPlaylistBody = {
  playlistId: string;
};

ipcMain.on("youtube:import", async (event, body: ImportPlaylistBody) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender)!;

  const { playlistId } = body;

  let listSongs: Awaited<ReturnType<typeof importYoutubePlaylist>> = [];
  let error: string | null = null;

  try {
    listSongs = await importYoutubePlaylist(playlistId);
  } catch (err) {
    console.error(err);
    error = err instanceof Error ? err.message : "Failed to import playlist";
  }

  mainWindow.webContents.send("youtube:import:completed", { listSongs, error });
});
