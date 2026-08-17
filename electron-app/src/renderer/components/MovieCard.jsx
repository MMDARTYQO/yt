import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Trash2, FolderOpen, Film, Clock } from 'lucide-react'

function formatDuration(str, sec) {
  if (str) return str
  if (!sec) return null
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MovieCard({ movie, onPlay, onDelete, onOpenFolder }) {
  const [imgError, setImgError] = useState(false)
  const [hovering, setHovering] = useState(false)

  const duration = formatDuration(movie.durationString, movie.duration)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative bg-cinema-surface border border-cinema-border rounded-2xl overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={onPlay}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-cinema-black overflow-hidden">
        {movie.thumbnail && !imgError ? (
          <img
            src={`file://${movie.thumbnail}`}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-10 h-10 text-cinema-muted/30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Play button on hover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: hovering ? 1 : 0, scale: hovering ? 1 : 0.8 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-full bg-cinema-gold/90 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <Play className="w-6 h-6 text-cinema-black mr-[-2px]" />
          </div>
        </motion.div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <Clock className="w-2.5 h-2.5 text-white/60" />
            <span className="text-white text-[11px] font-medium tabular-nums">{duration}</span>
          </div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovering ? 1 : 0 }}
          className="absolute top-2 left-2 flex gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onOpenFolder}
            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
            title="פתח בתיקייה"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-black/80 transition-colors"
            title="מחק"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>

      {/* מידע */}
      <div className="p-3">
        <h3
          className="text-white text-sm font-semibold leading-tight line-clamp-2 mb-1 group-hover:text-cinema-gold transition-colors"
          title={movie.title}
        >
          {movie.title || 'ללא שם'}
        </h3>
        {movie.uploader && (
          <p className="text-cinema-muted text-xs truncate">{movie.uploader}</p>
        )}
        {movie.addedAt && (
          <p className="text-cinema-muted/50 text-[10px] mt-1.5">
            {new Date(movie.addedAt).toLocaleDateString('he-IL', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    </motion.div>
  )
}
