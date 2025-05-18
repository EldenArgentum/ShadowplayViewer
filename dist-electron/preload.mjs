"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  // You can expose other APTs you need here.
  rootDirDialog: () => electron.ipcRenderer.invoke("root-dir-dialog"),
  getSubDirs: (rootDir) => electron.ipcRenderer.invoke("get-sub-dirs", rootDir),
  uploadPoster: () => electron.ipcRenderer.invoke("upload-poster"),
  saveGamePoster: (gameName, imagePath) => electron.ipcRenderer.invoke("save-game-poster", gameName, imagePath)
});
