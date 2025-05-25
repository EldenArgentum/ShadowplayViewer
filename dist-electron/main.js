import { ipcMain, dialog, app, BrowserWindow, screen } from "electron";
import { fileURLToPath } from "node:url";
import path from "path";
import * as fs from "fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
const readDirContents = (rootDir) => {
  const result = {};
  const gameDirs = fs.readdirSync(rootDir, { withFileTypes: true }).filter((dir) => dir.isDirectory());
  for (const dir of gameDirs) {
    const gameDirPath = path.join(rootDir, dir.name);
    result[dir.name] = fs.readdirSync(gameDirPath, { withFileTypes: true });
  }
  return result;
};
ipcMain.handle("root-dir-dialog", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"]
  });
  if (canceled || filePaths.length === 0) {
    return null;
  } else {
    return filePaths[0];
  }
});
ipcMain.handle("get-sub-dirs", async (_event, rootPath) => {
  try {
    const contents = readDirContents(rootPath);
    return { success: true, contents };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : e };
  }
});
ipcMain.handle("upload-poster", async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: "Select Game Poster Image",
      buttonLabel: "Choose Image",
      properties: ["openFile"],
      filters: [
        { name: "Images", extensions: ["jpg", "png", "webp", "gif", "jpeg"] }
      ]
    });
    if (canceled || filePaths.length === 0) {
      return null;
    }
    return filePaths[0];
  } catch (e) {
    console.error(e);
    return null;
  }
});
ipcMain.handle("save-game-poster", async (_event, gameName, sourcePath) => {
  try {
    if (!gameName || !sourcePath) {
      return { success: false, error: "Missing game name or image path" };
    }
    const posterDir = path.join(app.getPath("userData"), "game-posters");
    if (!fs.existsSync(posterDir)) {
      fs.mkdirSync(posterDir, { recursive: true });
    }
    const safeGameName = gameName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const imageExt = path.extname(sourcePath);
    const destPath = path.join(posterDir, `${safeGameName}${imageExt}`);
    fs.copyFileSync(sourcePath, destPath);
    const imageBuffer = fs.readFileSync(destPath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = imageExt.toLowerCase() === ".png" ? "image/png" : imageExt.toLowerCase() === ".gif" ? "image/gif" : imageExt.toLowerCase() === ".webp" ? "image/webp" : "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    return {
      success: true,
      imagePath: destPath,
      dataUrl
      // Return the data URL for direct use in img src
    };
  } catch (e) {
    console.error("Error saving image:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : e
    };
  }
});
const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC ?? "", "electron-vite.svg"),
    width,
    height,
    webPreferences: {
      preload: path.join(MAIN_DIST, "preload.mjs")
    },
    autoHideMenuBar: true
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    void win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    void win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
};
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
