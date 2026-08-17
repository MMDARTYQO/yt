import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Download, Link2, Film, Music, Sparkles, CheckCircle,
  XCircle, Loader2, Trash2, ExternalLink, Clock, ChevronDown,
  AlertCircle, Play
} from 'lucide-react'
import { useDownload, DOWNLOAD_STATUS } from '../context/DownloadContext'
import { useMovies } from '../context/MoviesContext'

const FORMAT_OPTIONS = [
  {
    id: 'best',
    label: 'איכות מקסימלית',
    sub: 'הכי טוב שיש',
    icon: <Sparkles className="w-5 h-5" />,
    value: 'bestvideo+bestaudio/best',
    color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
    activeColor: 'from-yellow-500/30 to-amber-500/20 border-yellow-400',
  },
  {
    id: '1080p',
    label: '1080p Full HD',
    sub: 'מומלץ',
    icon: <Film className="w-5 h-5" />,
    value: 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30',
    activeColor: 'from-blue-500/30 to-indigo-500/20 border-blue-400',
  },
  {
    id: '720p',
    label: '720p HD',
    sub: 'קל יותר',
    icon: <Film className="w-5 h-5" />,
    value: 'bestvideo[height<=720]+bestaudio/best[height<=720]',
    color: 'from-purple-500/20 to-violet-500/10 border-purple-500/30',
    activeColor: 'from-purple-500/30 to-violet-500/20 border-purple-400',
  },
  {
    id: '480p',
    label: '480p SD',
    sub: 'חיסכון בנפח',
    icon: <Film className="w-5 h-5" />,
    value: 'bestvideo[height<=480]+bestaudio/best[height<=480]',
    color: 'from-green-500/20 to-emerald-500/10 border-green-500/30',
    activeColor: 'from-green-500/30 to-emerald-500/20 border-green-400',
  },
  {
    id: 'audio',
    label: 'שמע בלבד',
    sub: 'MP3 / M4A',
    icon: <Music className="w-5 h-5" />,
    value: 'bestaudio/best',
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30',
    activeColor: 'from-rose-500/30 to-pink-500/20 border-rose-400',
  },
]

const STATUS_LABELS = {
  [DOWNLOAD_STATUS.QUEUED]: 'ממתין...',
  [DOWNLOAD_STATUS.RUNNING]: 'מוריד ב-GitHub Actions',
  [DOWNLOAD_STATUS.DOWNLOADING]: 'מעביר לספרייה',
  [DOWNLOAD_STATUS.DONE]: 'הורד בהצלחה',
  [DOWNLOAD_STATUS.ERROR]: 'שגיאה',
}

const STATUS_COLORS = {
  [DOWNLOAD_STATUS.QUEUED]: 'text-yellow-400',
  [DOWNLOAD_STATUS.RUNNING]: 'text-blue-400',
  [DOWNLOAD_STATUS.DOWNLOADING]: 'text-cyan-400',
  [DOWNLOAD_STATUS.DONE]: 'text-green-400',
  [DOWNLOAD_STATUS.ERROR]: 'text-red-400',
}

function ProgressBar({ status, progress }) {
  const isActive = [DOWNLOAD_STATUS.QUEUED, DOWNLOAD_STATUS.RUNNING, DOWNLOAD_STATUS.DOWNLOADING].includes(status)
  const isDone = status === DOWNLOAD_STATUS.DONE
  const isError = status === DOWNLOAD_STATUS.ERROR

  return (
    <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${
          isDone ? 'bg-green-500' : isError ? 'bg-red-500' : 'bg-cinema-gold'
        }`}
        initial={{ width: 0 }}
        animate={{
          width: isDone ? '100%' : isError ? `${progress}%` : `${progress}%`,
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}

function QueueItem({ item, onRemove, onPlay }) {
  const isActive = [DOWNLOAD_STATUS.QUEUED, DOWNLOAD_STATUS.RUNNING, DOWNLOAD_STATUS.DOWNLOADING].includes(item.status)
  const isDone = item.status === DOWNLOAD_STATUS.DONE
  const isError = item.status === DOWNLOAD_STATUS.ERROR

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-4 rounded-xl border transition-colors ${
        isDone
          ? 'bg-green-500/5 border-green-500/20'
          : isError
          ? 'bg-red-500/5 border-red-500/20'
          : 'bg-cinema-surface border-cinema-border'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* URL */}
          <p className="text-white text-sm font-medium truncate" dir="ltr">
            {item.title || item.url}
          </p>

          {/* סטטוס */}
          <div className="flex items-center gap-2 mt-1">
            {isActive && (
              <Loader2 className="w-3 h-3 text-cinema-gold animate-spin flex-shrink-0" />
            )}
            {isDone && <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />}
            {isError && <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />}

            <span className={`text-xs ${STATUS_COLORS[item.status]}`}>
              {item.error || STATUS_LABELS[item.status]}
            </span>

            {item.runId && (
              <button
                onClick={() =>
                  window.cinematek.shell.openUrl(
                    `https://github.com/${item.repo}/actions/runs/${item.runId}`
                  )
                }
                className="text-xs text-cinema-muted hover:text-cinema-gold transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                GitHub
              </button>
            )}
          </div>

          {/* progress bar */}
          <ProgressBar status={item.status} progress={item.progress} />
        </div>

        {/* כפתורים */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isDone && item.movieId && (
            <button
              onClick={() => onPlay(item.movieId)}
              className="p-2 rounded-lg bg-cinema-gold/20 text-cinema-gold hover:bg-cinema-gold/30 transition-colors"
              title="הפעל"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 rounded-lg bg-white/5 text-cinema-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="הסר"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function DownloadPage() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [format, setFormat] = useState(FORMAT_OPTIONS[1]) // 1080p default
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const { queue, startDownload, removeFromQueue } = useDownload()

  const isValidUrl = (u) => {
    try {
      const parsed = new URL(u)
      return (
        parsed.hostname.includes('youtube.com') ||
        parsed.hostname.includes('youtu.be') ||
        parsed.hostname.includes('yt.be')
      )
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('הכנס כתובת YouTube')
      inputRef.current?.focus()
      return
    }

    if (!isValidUrl(url.trim())) {
      setError('הכתובת אינה נראית כתובת YouTube תקינה')
      return
    }

    setSubmitting(true)
    try {
      await startDownload({ url: url.trim(), format: format.value, title: title.trim() })
      setUrl('')
      setTitle('')
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setUrl(text.trim())
    } catch {}
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="px-8 py-8 max-w-3xl mx-auto">

        {/* כותרת */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-1">הורדה חדשה</h1>
          <p className="text-cinema-muted text-sm">
            הדבק קישור YouTube וה-workflow יטפל בכל השאר
          </p>
        </motion.div>

        {/* טופס */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-cinema-surface border border-cinema-border rounded-2xl p-6 mb-6"
        >
          {/* שדה URL */}
          <div className="mb-5">
            <label className="text-sm text-cinema-muted block mb-2">כתובת הסרטון</label>
            <div className="relative">
              <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-muted" />
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError('') }}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-cinema-black border border-cinema-border rounded-xl pr-11 pl-24 py-3.5 text-white text-sm placeholder-cinema-muted/50 focus:outline-none focus:border-cinema-gold/50 transition-colors"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs text-cinema-muted hover:text-cinema-gold bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                הדבק
              </button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs mt-2 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* בחירת פורמט */}
          <div className="mb-5">
            <label className="text-sm text-cinema-muted block mb-3">איכות הורדה</label>
            <div className="grid grid-cols-5 gap-2">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormat(opt)}
                  className={`relative p-3 rounded-xl border bg-gradient-to-b text-right transition-all ${
                    format.id === opt.id ? opt.activeColor : opt.color
                  } hover:scale-[1.02]`}
                >
                  <div className={`mb-1.5 ${format.id === opt.id ? 'text-white' : 'text-cinema-muted'}`}>
                    {opt.icon}
                  </div>
                  <p className={`text-xs font-semibold leading-tight ${format.id === opt.id ? 'text-white' : 'text-cinema-muted'}`}>
                    {opt.label}
                  </p>
                  <p className="text-[10px] text-cinema-muted/70 mt-0.5">{opt.sub}</p>
                  {format.id === opt.id && (
                    <div className="absolute top-2 left-2">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* הגדרות מתקדמות */}
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm text-cinema-muted hover:text-white transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              הגדרות מתקדמות
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4">
                    <label className="text-sm text-cinema-muted block mb-2">
                      שם מותאם אישית <span className="text-cinema-muted/50">(אופציונלי)</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="השאר ריק כדי להשתמש בשם המקורי"
                      className="w-full bg-cinema-black border border-cinema-border rounded-xl px-4 py-3 text-white text-sm placeholder-cinema-muted/50 focus:outline-none focus:border-cinema-gold/50 transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* כפתור הורדה */}
          <button
            type="submit"
            disabled={submitting || !url.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-cinema-gold text-cinema-black font-bold rounded-xl hover:bg-cinema-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                שולח ל-GitHub Actions...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                הורד
              </>
            )}
          </button>
        </motion.form>

        {/* תור הורדות */}
        <AnimatePresence>
          {queue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-cinema-muted uppercase tracking-widest">
                  תור הורדות
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-cinema-muted">
                  <Clock className="w-3.5 h-3.5" />
                  {queue.filter(d => d.status !== DOWNLOAD_STATUS.DONE && d.status !== DOWNLOAD_STATUS.ERROR).length} פעיל
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {queue.map((item) => (
                    <QueueItem
                      key={item.id}
                      item={item}
                      onRemove={removeFromQueue}
                      onPlay={(movieId) => navigate(`/player/${movieId}`)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
