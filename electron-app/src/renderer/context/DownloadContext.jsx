import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useMovies } from './MoviesContext'

const DownloadContext = createContext(null)

export const DOWNLOAD_STATUS = {
  IDLE: 'idle',
  QUEUED: 'queued',
  RUNNING: 'running',
  DOWNLOADING: 'downloading',
  DONE: 'done',
  ERROR: 'error',
}

export function DownloadProvider({ children }) {
  const [queue, setQueue] = useState([]) // { id, url, title, format, runId, status, progress, error }
  const [settings, setSettings] = useState(null)
  const pollingRefs = useRef({})
  const { addMovie } = useMovies()

  // טעינת הגדרות בהתחלה
  React.useEffect(() => {
    window.cinematek.settings.get().then(setSettings)
  }, [])

  const updateItem = useCallback((id, patch) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  }, [])

  const startPolling = useCallback(
    (downloadId, runId, repo) => {
      if (pollingRefs.current[downloadId]) return

      const interval = setInterval(async () => {
        try {
          const status = await window.cinematek.gh.runStatus({ repo, runId })

          if (status.status === 'completed') {
            clearInterval(interval)
            delete pollingRefs.current[downloadId]

            if (status.conclusion === 'success') {
              updateItem(downloadId, { status: DOWNLOAD_STATUS.DOWNLOADING, progress: 90 })

              try {
                const fileInfo = await window.cinematek.gh.downloadArtifact({ repo, runId })
                const movie = {
                  id: `movie_${Date.now()}`,
                  ...fileInfo,
                  addedAt: new Date().toISOString(),
                  runId,
                }
                await addMovie(movie)
                updateItem(downloadId, { status: DOWNLOAD_STATUS.DONE, progress: 100, movieId: movie.id })
              } catch (err) {
                updateItem(downloadId, { status: DOWNLOAD_STATUS.ERROR, error: err.message })
              }
            } else {
              updateItem(downloadId, {
                status: DOWNLOAD_STATUS.ERROR,
                error: `ה-workflow נכשל: ${status.conclusion}`,
              })
            }
          } else if (status.status === 'in_progress') {
            updateItem(downloadId, { status: DOWNLOAD_STATUS.RUNNING, progress: 50 })
          }
        } catch (err) {
          // המשך לנסות
        }
      }, 5000)

      pollingRefs.current[downloadId] = interval
    },
    [updateItem, addMovie]
  )

  const startDownload = useCallback(
    async ({ url, format, title }) => {
      if (!settings) return

      const downloadId = `dl_${Date.now()}`
      const repo = settings.githubRepo

      const newItem = {
        id: downloadId,
        url,
        format,
        title: title || '',
        runId: null,
        status: DOWNLOAD_STATUS.QUEUED,
        progress: 10,
        error: null,
        startedAt: new Date().toISOString(),
      }

      setQueue((prev) => [newItem, ...prev])

      try {
        const { runId } = await window.cinematek.gh.runWorkflow({ repo, url, format, title })
        updateItem(downloadId, { runId, status: DOWNLOAD_STATUS.RUNNING, progress: 20 })
        startPolling(downloadId, runId, repo)
      } catch (err) {
        updateItem(downloadId, { status: DOWNLOAD_STATUS.ERROR, error: err.message })
      }
    },
    [settings, updateItem, startPolling]
  )

  const removeFromQueue = useCallback((id) => {
    if (pollingRefs.current[id]) {
      clearInterval(pollingRefs.current[id])
      delete pollingRefs.current[id]
    }
    setQueue((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const activeDownloads = queue.filter(
    (d) => d.status === DOWNLOAD_STATUS.QUEUED || d.status === DOWNLOAD_STATUS.RUNNING || d.status === DOWNLOAD_STATUS.DOWNLOADING
  )

  return (
    <DownloadContext.Provider value={{ queue, activeDownloads, startDownload, removeFromQueue, updateItem }}>
      {children}
    </DownloadContext.Provider>
  )
}

export function useDownload() {
  const ctx = useContext(DownloadContext)
  if (!ctx) throw new Error('useDownload must be inside DownloadProvider')
  return ctx
}
