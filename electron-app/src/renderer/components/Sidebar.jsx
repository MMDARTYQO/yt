import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Library, Download, Settings, Loader2,
  CheckCircle, AlertCircle, Plus
} from 'lucide-react'
import { useDownload, DOWNLOAD_STATUS } from '../context/DownloadContext'
import { useMovies } from '../context/MoviesContext'

const NAV_ITEMS = [
  { to: '/', icon: Library, label: 'ספרייה' },
  { to: '/download', icon: Download, label: 'הורדה חדשה' },
  { to: '/settings', icon: Settings, label: 'הגדרות' },
]

function ActiveDot() {
  return (
    <motion.div
      layoutId="nav-active"
      className="absolute inset-0 bg-cinema-gold/10 rounded-xl border border-cinema-gold/20"
      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
    />
  )
}

function DownloadBadge({ count }) {
  if (!count) return null
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="ml-auto text-[10px] font-bold bg-cinema-gold text-cinema-black rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0"
    >
      {count > 9 ? '9+' : count}
    </motion.span>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { activeDownloads, queue } = useDownload()
  const { movies } = useMovies()

  const activeCount = activeDownloads.length
  const doneRecent = queue.filter(
    (d) => d.status === DOWNLOAD_STATUS.DONE &&
    (Date.now() - new Date(d.startedAt).getTime()) < 30000
  ).length
  const errorCount = queue.filter((d) => d.status === DOWNLOAD_STATUS.ERROR).length

  return (
    <aside className="w-56 flex flex-col bg-cinema-surface border-l border-cinema-border flex-shrink-0">

      {/* ניווט ראשי */}
      <nav className="flex-1 p-3 space-y-1 pt-4">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <div className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group">
                {isActive && <ActiveDot />}
                <Icon
                  className={`w-4 h-4 relative z-10 transition-colors ${
                    isActive ? 'text-cinema-gold' : 'text-cinema-muted group-hover:text-white'
                  }`}
                />
                <span
                  className={`text-sm font-medium relative z-10 transition-colors ${
                    isActive ? 'text-white' : 'text-cinema-muted group-hover:text-white'
                  }`}
                >
                  {label}
                </span>

                {/* badge הורדות */}
                {to === '/download' && <DownloadBadge count={activeCount} />}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* סטטוס הורדות */}
      <AnimatePresence>
        {queue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-3 mb-3 p-3 bg-cinema-black/40 rounded-xl border border-cinema-border/50 space-y-2">
              <p className="text-[10px] font-semibold text-cinema-muted uppercase tracking-widest mb-2">
                הורדות
              </p>

              {activeCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-blue-400">
                  <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
                  <span>{activeCount} פעיל</span>
                </div>
              )}
              {doneRecent > 0 && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{doneRecent} הושלם</span>
                </div>
              )}
              {errorCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errorCount} שגיאה</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ספירת סרטים */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs text-cinema-muted/50">
          <span>{movies.length} סרטונים</span>
        </div>
      </div>

      {/* כפתור הורדה מהיר */}
      <div className="p-3 border-t border-cinema-border">
        <button
          onClick={() => navigate('/download')}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-cinema-gold/10 hover:bg-cinema-gold/20 border border-cinema-gold/20 hover:border-cinema-gold/40 rounded-xl text-cinema-gold text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          הוסף סרטון
        </button>
      </div>
    </aside>
  )
}
