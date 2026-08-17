import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Volume2, VolumeX, Volume1,
  Maximize, Minimize, ArrowRight, SkipBack, SkipForward,
  Settings, ChevronLeft, ChevronRight, Film
} from 'lucide-react'
import { useMovies } from '../context/MoviesContext'

// ── פורמט זמן ────────────────────────────────────────────────────────────────
function fmtTime(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

// ── Seek bar ──────────────────────────────────────────────────────────────────
function SeekBar({ current, duration, onSeek }) {
  const barRef = useRef(null)
  const [hovering, setHovering] = useState(false)
  const [hoverX, setHoverX] = useState(0)
  const [hoverTime, setHoverTime] = useState(0)
  const [dragging, setDragging] = useState(false)

  const pct = duration ? (current / duration) * 100 : 0

  const calcTime = (clientX) => {
    const rect = barRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return ratio * duration
  }

  const handleMouseMove = (e) => {
    setHoverX(e.clientX - barRef.current.getBoundingClientRect().left)
    setHoverTime(calcTime(e.clientX))
    if (dragging) onSeek(calcTime(e.clientX))
  }

  const handleMouseDown = (e) => {
    setDragging(true)
    onSeek(calcTime(e.clientX))
  }

  useEffect(() => {
    const up = () => setDragging(false)
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  return (
    <div
      ref={barRef}
      className="relative h-1 group/seek cursor-pointer"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
    >
      {/* track */}
      <div className="absolute inset-0 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-cinema-gold rounded-full transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-cinema-gold rounded-full shadow -translate-x-1/2 opacity-0 group-hover/seek:opacity-100 transition-opacity"
        style={{ left: `${pct}%` }}
      />

      {/* tooltip */}
      <AnimatePresence>
        {hovering && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-8 bg-cinema-black/90 text-white text-xs px-2 py-1 rounded-lg pointer-events-none -translate-x-1/2"
            style={{ left: hoverX }}
          >
            {fmtTime(hoverTime)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Volume ────────────────────────────────────────────────────────────────────
function VolumeControl({ volume, muted, onVolume, onToggleMute }) {
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div className="flex items-center gap-2 group/vol">
      <button onClick={onToggleMute} className="text-white hover:text-cinema-gold transition-colors">
        <VolumeIcon className="w-5 h-5" />
      </button>
      <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={muted ? 0 : volume}
          onChange={(e) => onVolume(parseFloat(e.target.value))}
          className="w-20 h-1 accent-cinema-gold cursor-pointer"
        />
      </div>
    </div>
  )
}

// ── Main Player ───────────────────────────────────────────────────────────────
export default function Player() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getMovie, movies } = useMovies()

  const movie = getMovie(id)
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const hideControlsTimer = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [buffered, setBuffered] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showRateMenu, setShowRateMenu] = useState(false)
  const [ended, setEnded] = useState(false)

  // מציאת הסרטון הקודם/הבא בספרייה
  const currentIndex = movies.findIndex((m) => m.id === id)
  const prevMovie = currentIndex > 0 ? movies[currentIndex - 1] : null
  const nextMovie = currentIndex < movies.length - 1 ? movies[currentIndex + 1] : null

  // ── הסתרת פקדים ──────────────────────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    clearTimeout(hideControlsTimer.current)
    if (playing) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [playing])

  useEffect(() => {
    resetHideTimer()
    return () => clearTimeout(hideControlsTimer.current)
  }, [playing, resetHideTimer])

  // ── Video events ──────────────────────────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onTimeUpdate = () => setCurrent(v.currentTime)
    const onDuration = () => setDuration(v.duration)
    const onPlay = () => { setPlaying(true); setEnded(false) }
    const onPause = () => setPlaying(false)
    const onEnded = () => { setPlaying(false); setEnded(true) }
    const onProgress = () => {
      if (v.buffered.length > 0) {
        setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100)
      }
    }

    v.addEventListener('timeupdate', onTimeUpdate)
    v.addEventListener('loadedmetadata', onDuration)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('ended', onEnded)
    v.addEventListener('progress', onProgress)

    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate)
      v.removeEventListener('loadedmetadata', onDuration)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('ended', onEnded)
      v.removeEventListener('progress', onProgress)
    }
  }, [movie])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handle = (e) => {
      if (e.target.tagName === 'INPUT') return
      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          seek(-10)
          break
        case 'ArrowRight':
          seek(10)
          break
        case 'ArrowUp':
          e.preventDefault()
          changeVolume(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          changeVolume(Math.max(0, volume - 0.1))
          break
        case 'KeyM':
          setMuted((m) => !m)
          break
        case 'KeyF':
          toggleFullscreen()
          break
        case 'Escape':
          if (!fullscreen) navigate(-1)
          break
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [playing, volume, fullscreen])

  // ── Fullscreen ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Film className="w-16 h-16 text-cinema-muted/30 mx-auto mb-4" />
          <p className="text-cinema-muted">הסרטון לא נמצא</p>
          <button onClick={() => navigate('/')} className="mt-4 text-cinema-gold text-sm hover:underline">
            חזרה לספרייה
          </button>
        </div>
      </div>
    )
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    playing ? v.pause() : v.play()
    resetHideTimer()
  }

  const seek = (delta) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(duration, v.currentTime + delta))
    resetHideTimer()
  }

  const handleSeek = (time) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = time
  }

  const changeVolume = (val) => {
    setVolume(val)
    if (videoRef.current) videoRef.current.volume = val
    if (val > 0) setMuted(false)
  }

  const toggleMute = () => {
    setMuted((m) => {
      if (videoRef.current) videoRef.current.muted = !m
      return !m
    })
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const setRate = (rate) => {
    setPlaybackRate(rate)
    if (videoRef.current) videoRef.current.playbackRate = rate
    setShowRateMenu(false)
  }

  const RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden"
      onMouseMove={resetHideTimer}
      onClick={togglePlay}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      {/* וידאו */}
      <video
        ref={videoRef}
        src={`file://${movie.filePath}`}
        className="w-full h-full object-contain"
        volume={volume}
        muted={muted}
        autoPlay
        onClick={(e) => e.stopPropagation()}
      />

      {/* Overlay: כפתור play גדול */}
      <AnimatePresence>
        {!playing && !ended && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Play className="w-8 h-8 text-white mr-[-2px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ended overlay */}
      <AnimatePresence>
        {ended && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-xl font-semibold">הסרטון הסתיים</p>
            <div className="flex gap-4">
              <button
                onClick={() => { videoRef.current.currentTime = 0; videoRef.current.play() }}
                className="flex items-center gap-2 px-5 py-2.5 bg-cinema-gold text-cinema-black font-semibold rounded-xl text-sm hover:bg-cinema-gold/90"
              >
                <SkipBack className="w-4 h-4" />
                נגן מחדש
              </button>
              {nextMovie && (
                <button
                  onClick={() => navigate(`/player/${nextMovie.id}`)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl text-sm hover:bg-white/20"
                >
                  הבא
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-sm hover:bg-white/20"
              >
                ספרייה
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* פקדים */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col justify-between pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="flex items-center gap-3 px-5 pt-5 bg-gradient-to-b from-black/70 to-transparent pointer-events-auto">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{movie.title}</p>
                {movie.uploader && (
                  <p className="text-white/60 text-xs">{movie.uploader}</p>
                )}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="px-5 pb-5 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
              {/* seek */}
              <div className="mb-3 px-1">
                <SeekBar current={current} duration={duration} onSeek={handleSeek} />
              </div>

              <div className="flex items-center gap-3">
                {/* prev */}
                <button
                  onClick={() => prevMovie && navigate(`/player/${prevMovie.id}`)}
                  disabled={!prevMovie}
                  className="text-white/70 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* play/pause */}
                <button onClick={togglePlay} className="text-white hover:text-cinema-gold transition-colors">
                  {playing
                    ? <Pause className="w-6 h-6" />
                    : <Play className="w-6 h-6" />
                  }
                </button>

                {/* next */}
                <button
                  onClick={() => nextMovie && navigate(`/player/${nextMovie.id}`)}
                  disabled={!nextMovie}
                  className="text-white/70 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* volume */}
                <VolumeControl
                  volume={volume}
                  muted={muted}
                  onVolume={changeVolume}
                  onToggleMute={toggleMute}
                />

                {/* זמן */}
                <span className="text-white/70 text-sm tabular-nums">
                  {fmtTime(current)} / {fmtTime(duration)}
                </span>

                <div className="flex-1" />

                {/* מהירות */}
                <div className="relative">
                  <button
                    onClick={() => setShowRateMenu((v) => !v)}
                    className="text-white/70 hover:text-white text-sm transition-colors px-2 py-1 rounded hover:bg-white/10"
                  >
                    {playbackRate}x
                  </button>
                  <AnimatePresence>
                    {showRateMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-cinema-surface border border-cinema-border rounded-xl overflow-hidden shadow-2xl"
                      >
                        {RATES.map((r) => (
                          <button
                            key={r}
                            onClick={() => setRate(r)}
                            className={`block w-full px-5 py-2 text-sm text-right transition-colors hover:bg-white/10 ${
                              r === playbackRate ? 'text-cinema-gold font-semibold' : 'text-white'
                            }`}
                          >
                            {r}x
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* fullscreen */}
                <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors">
                  {fullscreen
                    ? <Minimize className="w-5 h-5" />
                    : <Maximize className="w-5 h-5" />
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
