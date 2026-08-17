const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } = require('electron')
const path = require('path')
const fs = require('fs')
const { execFile, exec } = require('child_process')
const Store = require('electron-store')

// הגדרות שמירה
const store = new Store({
  defaults: {
    moviesDir: path.join(app.getPath('videos'), 'סינמטק'),
    githubRepo: 'MMDARTYQO/yt',
    windowBounds: { width: 1280, height: 800 },
    movies: [],
  },
})

// תמיד מצב כהה
nativeTheme.themeSource = 'dark'

let mainWindow

function createWindow() {
  const { width, height } = store.get('windowBounds')

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 1000,
    minHeight: 650,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  })

  // dev: Vite dev server | prod: קובץ built
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // שמירת גודל חלון
  mainWindow.on('resize', () => {
    store.set('windowBounds', mainWindow.getBounds())
  })

  // אפשר לפתוח קישורים חיצוניים בדפדפן
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()

  // וודא שתיקיית הסרטים קיימת
  const moviesDir = store.get('moviesDir')
  if (!fs.existsSync(moviesDir)) {
    fs.mkdirSync(moviesDir, { recursive: true })
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ─── IPC Handlers ────────────────────────────────────────────────────────────

// חלון - כפתורי שורת כותרת
ipcMain.on('window:minimize', () => mainWindow.minimize())
ipcMain.on('window:maximize', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
})
ipcMain.on('window:close', () => mainWindow.close())

// הגדרות
ipcMain.handle('settings:get', () => ({
  moviesDir: store.get('moviesDir'),
  githubRepo: store.get('githubRepo'),
}))

ipcMain.handle('settings:set', (_, settings) => {
  if (settings.moviesDir) store.set('moviesDir', settings.moviesDir)
  if (settings.githubRepo) store.set('githubRepo', settings.githubRepo)
  return true
})

ipcMain.handle('settings:chooseDir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'בחר תיקיית סרטים',
  })
  if (!result.canceled) {
    store.set('moviesDir', result.filePaths[0])
    return result.filePaths[0]
  }
  return null
})

// ספריית סרטים
ipcMain.handle('movies:list', () => {
  return store.get('movies', [])
})

ipcMain.handle('movies:add', (_, movie) => {
  const movies = store.get('movies', [])
  const existing = movies.findIndex((m) => m.id === movie.id)
  if (existing >= 0) {
    movies[existing] = movie
  } else {
    movies.unshift(movie)
  }
  store.set('movies', movies)
  return movies
})

ipcMain.handle('movies:delete', (_, movieId) => {
  const movies = store.get('movies', [])
  const movie = movies.find((m) => m.id === movieId)
  if (movie && movie.filePath && fs.existsSync(movie.filePath)) {
    fs.unlinkSync(movie.filePath)
  }
  if (movie && movie.thumbnail && fs.existsSync(movie.thumbnail)) {
    fs.unlinkSync(movie.thumbnail)
  }
  const updated = movies.filter((m) => m.id !== movieId)
  store.set('movies', updated)
  return updated
})

ipcMain.handle('movies:open-folder', (_, movieId) => {
  const movies = store.get('movies', [])
  const movie = movies.find((m) => m.id === movieId)
  if (movie && movie.filePath) {
    shell.showItemInFolder(movie.filePath)
  }
})

// GitHub CLI
ipcMain.handle('gh:check', () => {
  return new Promise((resolve) => {
    exec('gh auth status', (error, stdout, stderr) => {
      if (error) {
        resolve({ ok: false, message: stderr || 'gh CLI לא מחובר' })
      } else {
        resolve({ ok: true, message: stdout })
      }
    })
  })
})

ipcMain.handle('gh:run-workflow', (_, { repo, url, format, title }) => {
  return new Promise((resolve, reject) => {
    const args = [
      'workflow', 'run', 'download.yml',
      '--repo', repo,
      '-f', `url=${url}`,
      '-f', `format=${format}`,
    ]
    if (title) args.push('-f', `title=${title}`)

    execFile('gh', args, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message))
      } else {
        // מחזיר את ה-run ID
        setTimeout(() => {
          exec(`gh run list --repo ${repo} --workflow download.yml --limit 1 --json databaseId,status,createdAt`, (err, out) => {
            if (err) {
              resolve({ runId: null })
            } else {
              try {
                const runs = JSON.parse(out)
                resolve({ runId: runs[0]?.databaseId?.toString() || null })
              } catch {
                resolve({ runId: null })
              }
            }
          })
        }, 2000)
      }
    })
  })
})

ipcMain.handle('gh:run-status', (_, { repo, runId }) => {
  return new Promise((resolve, reject) => {
    exec(
      `gh run view ${runId} --repo ${repo} --json status,conclusion,jobs`,
      (error, stdout) => {
        if (error) {
          reject(new Error(error.message))
        } else {
          try {
            resolve(JSON.parse(stdout))
          } catch {
            reject(new Error('שגיאה בפענוח תשובה'))
          }
        }
      }
    )
  })
})

ipcMain.handle('gh:download-artifact', (_, { repo, runId }) => {
  return new Promise((resolve, reject) => {
    const moviesDir = store.get('moviesDir')
    const downloadDir = path.join(moviesDir, `run_${runId}`)

    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true })
    }

    exec(
      `gh run download ${runId} --repo ${repo} --name video-download --dir "${downloadDir}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message))
          return
        }

        // מצא את קובץ הוידאו שהורד
        const files = fs.readdirSync(downloadDir)
        const videoFile = files.find((f) =>
          /\.(mp4|mkv|webm|mov|avi|mp3|m4a)$/i.test(f)
        )
        const thumbFile = files.find((f) =>
          /\.(jpg|jpeg|png|webp)$/i.test(f)
        )
        const infoFile = files.find((f) => f.endsWith('.info.json'))

        if (!videoFile) {
          reject(new Error('לא נמצא קובץ וידאו'))
          return
        }

        const videoPath = path.join(downloadDir, videoFile)
        const thumbPath = thumbFile ? path.join(downloadDir, thumbFile) : null

        let info = {}
        if (infoFile) {
          try {
            info = JSON.parse(fs.readFileSync(path.join(downloadDir, infoFile), 'utf8'))
          } catch {}
        }

        resolve({
          filePath: videoPath,
          thumbnail: thumbPath,
          title: info.title || path.basename(videoFile, path.extname(videoFile)),
          duration: info.duration || 0,
          durationString: info.duration_string || '',
          uploader: info.uploader || '',
          uploadDate: info.upload_date || '',
          viewCount: info.view_count || 0,
          description: info.description || '',
        })
      }
    )
  })
})

ipcMain.handle('gh:list-runs', (_, { repo }) => {
  return new Promise((resolve) => {
    exec(
      `gh run list --repo ${repo} --workflow download.yml --limit 10 --json databaseId,status,conclusion,createdAt,displayTitle`,
      (error, stdout) => {
        if (error) {
          resolve([])
        } else {
          try {
            resolve(JSON.parse(stdout))
          } catch {
            resolve([])
          }
        }
      }
    )
  })
})

// פתיחת קובץ בנגן חיצוני
ipcMain.handle('shell:open', (_, filePath) => {
  shell.openPath(filePath)
})

ipcMain.handle('shell:open-url', (_, url) => {
  shell.openExternal(url)
})

// קריאת קובץ וידאו כ-URL מקומי
ipcMain.handle('file:get-path', (_, movieId) => {
  const movies = store.get('movies', [])
  const movie = movies.find((m) => m.id === movieId)
  return movie?.filePath || null
})
