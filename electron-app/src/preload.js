const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('cinematek', {
  // ─── חלון ───────────────────────────────────────────────────────────────────
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  },

  // ─── הגדרות ─────────────────────────────────────────────────────────────────
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (s) => ipcRenderer.invoke('settings:set', s),
    chooseDir: () => ipcRenderer.invoke('settings:chooseDir'),
  },

  // ─── ספריית סרטים ───────────────────────────────────────────────────────────
  movies: {
    list: () => ipcRenderer.invoke('movies:list'),
    add: (movie) => ipcRenderer.invoke('movies:add', movie),
    delete: (id) => ipcRenderer.invoke('movies:delete', id),
    openFolder: (id) => ipcRenderer.invoke('movies:open-folder', id),
    getPath: (id) => ipcRenderer.invoke('file:get-path', id),
  },

  // ─── GitHub CLI ─────────────────────────────────────────────────────────────
  gh: {
    check: () => ipcRenderer.invoke('gh:check'),
    runWorkflow: (opts) => ipcRenderer.invoke('gh:run-workflow', opts),
    runStatus: (opts) => ipcRenderer.invoke('gh:run-status', opts),
    downloadArtifact: (opts) => ipcRenderer.invoke('gh:download-artifact', opts),
    listRuns: (opts) => ipcRenderer.invoke('gh:list-runs', opts),
  },

  // ─── Shell ──────────────────────────────────────────────────────────────────
  shell: {
    open: (path) => ipcRenderer.invoke('shell:open', path),
    openUrl: (url) => ipcRenderer.invoke('shell:open-url', url),
  },
})
