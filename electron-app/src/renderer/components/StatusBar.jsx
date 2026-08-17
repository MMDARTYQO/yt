import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, Github } from 'lucide-react'
import { useDownload, DOWNLOAD_STATUS } from '../context/DownloadContext'

export default function StatusBar() {
  const { queue, activeDownloads } = useDownload()

  const active = activeDownloads[0] // ההורדה הפעילה הראשונה
  const recentDone = queue.find(
    (d) =>
      d.status === DOWNLOAD_STATUS.DONE &&
      Date.now() - new Date(d.startedAt).getTime() < 15000
  )
  const recentError = queue.find(
    (d) =>
      d.status === DOWNLOAD_STATUS.ERROR &&
      Date.now() - new Date(d.startedAt).getTime() < 15000
  )

  const shown = active || recentDone || recentError

  return (
    <div className="h-7 flex items-center px-4 bg-cinema-black/80 border-t border-cinema-border/30 flex-shrink-0">
      <AnimatePresence mode="wait">
        {shown ? (
          <motion.div
            key={shown.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            {active && (
              <>
                <Loader2 className="w-3 h-3 text-cinema-gold animate-spin flex-shrink-0" />
                <span className="text-xs text-cinema-muted truncate">
                  מוריד: {active.title || active.url}
                </span>
                {/* progress mini */}
                <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden flex-shrink-0">
                  <motion.div
                    className="h-full bg-cinema-gold rounded-full"
                    animate={{ width: `${active.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-[10px] text-cinema-muted/60">{active.progress}%</span>
              </>
            )}

            {!active && recentDone && (
              <>
                <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                <span className="text-xs text-green-400/80 truncate">
                  הורד בהצלחה: {recentDone.title || recentDone.url}
                </span>
              </>
            )}

            {!active && !recentDone && recentError && (
              <>
                <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400/80 truncate">
                  שגיאה: {recentError.error}
                </span>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
            <span className="text-[10px] text-cinema-muted/40">מוכן</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GitHub repo */}
      <div className="mr-auto flex items-center gap-1.5 text-[10px] text-cinema-muted/30 flex-shrink-0">
        <Github className="w-3 h-3" />
        <span>MMDARTYQO/yt</span>
      </div>
    </div>
  )
}
