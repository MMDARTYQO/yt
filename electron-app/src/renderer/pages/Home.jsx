import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Film, SortAsc, Grid3X3, List, Trash2, FolderOpen, Play } from 'lucide-react'
import { useMovies } from '../context/MoviesContext'
import MovieCard from '../components/MovieCard'
import EmptyState from '../components/EmptyState'

const SORT_OPTIONS = [
  { value: 'newest', label: 'חדש ביותר' },
  { value: 'oldest', label: 'ישן ביותר' },
  { value: 'name', label: 'לפי שם' },
  { value: 'duration', label: 'לפי משך' },
]

export default function Home() {
  const { movies, loading, deleteMovie } = useMovies()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [view, setView] = useState('grid') // 'grid' | 'list'
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    let list = [...movies]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.uploader?.toLowerCase().includes(q)
      )
    }

    switch (sort) {
      case 'oldest':
        list.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt))
        break
      case 'name':
        list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'he'))
        break
      case 'duration':
        list.sort((a, b) => (b.duration || 0) - (a.duration || 0))
        break
      default: // newest
        list.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    }

    return list
  }, [movies, search, sort])

  const handlePlay = (movie) => navigate(`/player/${movie.id}`)

  const handleDelete = async (e, movie) => {
    e.stopPropagation()
    if (confirm(`למחוק את "${movie.title}"?`)) {
      await deleteMovie(movie.id)
    }
  }

  const handleOpenFolder = (e, movie) => {
    e.stopPropagation()
    window.cinematek.movies.openFolder(movie.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-cinema-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-cinema-muted text-sm">טוען ספרייה...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* כותרת + חיפוש */}
      <div className="px-8 pt-8 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">הספרייה שלי</h1>
            <p className="text-cinema-muted text-sm mt-1">
              {movies.length} {movies.length === 1 ? 'סרטון' : 'סרטונים'}
            </p>
          </div>

          {/* כלי ניהול */}
          <div className="flex items-center gap-3">
            {/* חיפוש */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-muted" />
              <input
                type="text"
                placeholder="חפש..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-cinema-surface border border-cinema-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-cinema-muted focus:outline-none focus:border-cinema-gold/50 w-52 transition-all"
              />
            </div>

            {/* מיון */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-cinema-surface border border-cinema-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cinema-gold/50 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* תצוגה */}
            <div className="flex bg-cinema-surface border border-cinema-border rounded-xl overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`p-2.5 transition-colors ${view === 'grid' ? 'bg-cinema-gold/20 text-cinema-gold' : 'text-cinema-muted hover:text-white'}`}
                title="תצוגת רשת"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2.5 transition-colors ${view === 'list' ? 'bg-cinema-gold/20 text-cinema-gold' : 'text-cinema-muted hover:text-white'}`}
                title="תצוגת רשימה"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* תוכן */}
      <div className="flex-1 overflow-y-auto px-8 pb-6 scrollbar-thin">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={<Film className="w-16 h-16 text-cinema-muted/40" />}
                title={search ? 'אין תוצאות' : 'הספרייה ריקה'}
                subtitle={
                  search
                    ? `לא נמצאו סרטונים עבור "${search}"`
                    : 'לחץ על הורדה חדשה כדי להתחיל'
                }
              />
            </motion.div>
          ) : view === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
            >
              {filtered.map((movie, i) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <MovieCard
                    movie={movie}
                    onPlay={() => handlePlay(movie)}
                    onDelete={(e) => handleDelete(e, movie)}
                    onOpenFolder={(e) => handleOpenFolder(e, movie)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2"
            >
              {filtered.map((movie, i) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handlePlay(movie)}
                  className="flex items-center gap-4 p-4 bg-cinema-surface border border-cinema-border rounded-xl cursor-pointer hover:border-cinema-gold/30 hover:bg-cinema-surface-hover transition-all group"
                >
                  {/* thumbnail */}
                  <div className="w-28 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-cinema-black">
                    {movie.thumbnail ? (
                      <img
                        src={`file://${movie.thumbnail}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-6 h-6 text-cinema-muted/40" />
                      </div>
                    )}
                  </div>

                  {/* מידע */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{movie.title}</p>
                    <p className="text-cinema-muted text-sm mt-0.5">{movie.uploader}</p>
                  </div>

                  {/* משך */}
                  <span className="text-cinema-muted text-sm flex-shrink-0">
                    {movie.durationString || '—'}
                  </span>

                  {/* כפתורים */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePlay(movie) }}
                      className="p-2 rounded-lg bg-cinema-gold/20 text-cinema-gold hover:bg-cinema-gold/30 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleOpenFolder(e, movie)}
                      className="p-2 rounded-lg bg-white/5 text-cinema-muted hover:text-white transition-colors"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, movie)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
