import {app, BrowserWindow, screen, ipcMain, dialog, net, session} from 'electron'
import {fileURLToPath} from 'node:url'
import path from "path"
import * as fs from 'fs'
import getFirstImageURL from "first-image-search-load"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

const readDirContents = (rootDir: any) => {
  const result = {}

  const gameDirs = fs.readdirSync(rootDir, {withFileTypes: true})
      .filter(dir => dir.isDirectory())

  for (const dir of gameDirs) {
    const gameDirPath = path.join(rootDir, dir.name)
    result[dir.name] = fs.readdirSync(gameDirPath, {withFileTypes: true})
  }
  return result
}

// dir-dialog will open dialog specifically for uploading directory (shadowplay); eventually, add file-dialog for changing poster
ipcMain.handle("root-dir-dialog", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (canceled || filePaths.length === 0) {
    return null
  } else {
    return filePaths[0]
  }
})

ipcMain.handle("get-sub-dirs", async (event: any, rootPath) => {
  try {
    const contents = readDirContents(rootPath)
    return {success: true, contents}
  }
  catch (e: any) {
    return {success: false, error: e.message}
  }
})

ipcMain.handle("upload-poster", async () => {
  try {
    const {canceled, filePaths} = await dialog.showOpenDialog({
      title: "Select Game Poster Image",
      buttonLabel: "Choose Image",
      properties: ['openFile'],
      filters: [{name: "Images", extensions: ["jpg", "png", "webp", "gif", "jpeg"]}] // Fixed: filters should be an array
    })
    if (canceled || filePaths.length === 0) {
      return null
    }
    return filePaths[0]
  }
  catch (e) {
    console.error(e)
    return null
  }
})

ipcMain.handle("save-game-poster", async (event, gameName, sourcePath) => {
  try {
    if (!gameName || !sourcePath) {
      return { success: false, error: 'Missing game name or image path' };
    }

    // Create a directory to store game posters if it doesn't exist
    const posterDir = path.join(app.getPath('userData'), 'game-posters');
    if (!fs.existsSync(posterDir)) {
      fs.mkdirSync(posterDir, { recursive: true });
    }

    // Create a safe filename based on the game name
    const safeGameName = gameName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const imageExt = path.extname(sourcePath);
    const destPath = path.join(posterDir, `${safeGameName}${imageExt}`);

    // Copy the selected image to our app's storage location
    fs.copyFileSync(sourcePath, destPath);

    // Read the file and convert to data URL to avoid file:// restrictions
    const imageBuffer = fs.readFileSync(destPath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imageExt.toLowerCase() === '.png' ? 'image/png' :
        imageExt.toLowerCase() === '.gif' ? 'image/gif' :
            imageExt.toLowerCase() === '.webp' ? 'image/webp' : 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    return {
      success: true,
      imagePath: destPath,
      dataUrl: dataUrl // Return the data URL for direct use in img src
    };
  } catch (error) {
    console.error('Error saving image:', error);
    return {
      success: false,
      error: error.message
    };
  }
})

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(MAIN_DIST, 'preload.mjs'),
    },
    autoHideMenuBar: true,
  })


  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
})