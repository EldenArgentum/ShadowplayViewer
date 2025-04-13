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
  if (canceled) {
    return null;
  } else {
    console.log(filePaths);
    return filePaths[0];
  }
});
ipcMain.handle("get-sub-dirs", async (event, rootPath) => {
  try {
    const contents = readDirContents(rootPath);
    return { success: true, contents };
  } catch (e) {
    return { success: false, error: e.message };
  }
});
const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width,
    height,
    webPreferences: {
      preload: path.join(MAIN_DIST, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
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
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
