import {ipcRenderer, contextBridge, IpcRenderer} from 'electron'

declare global {
  interface Window {
    ipcRenderer: {
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      send: (channel: string, ...args: any[]) => void
      invoke: (channel: string, ...args: any[]) => Promise<any>
      on: (channel: string, ...args: any[]) => IpcRenderer
      off: (channel: string, ...args: any[]) => IpcRenderer
      rootDirDialog: () => Promise<any>
      getSubDirs: (rootDir: unknown) => Promise<any>
      uploadPoster: () => Promise<any>
      saveGamePoster: (gameName: unknown, imagePath: unknown) => Promise<any>

    }
  }
}


// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  rootDirDialog: () => ipcRenderer.invoke('root-dir-dialog'),
  getSubDirs: (rootDir: unknown) => ipcRenderer.invoke('get-sub-dirs', rootDir),
  uploadPoster: () => ipcRenderer.invoke('upload-poster'),
  saveGamePoster: (gameName: unknown, imagePath: unknown) => ipcRenderer.invoke('save-game-poster', gameName, imagePath),
})