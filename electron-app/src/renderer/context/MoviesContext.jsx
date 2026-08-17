import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const MoviesContext = createContext(null)

export function MoviesProvider({ children }) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const list = await window.cinematek.movies.list()
      setMovies(list)
    } catch (err) {
      console.error('שגיאה בטעינת סרטים:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addMovie = useCallback(async (movie) => {
    const updated = await window.cinematek.movies.add(movie)
    setMovies(updated)
  }, [])

  const deleteMovie = useCallback(async (id) => {
    const updated = await window.cinematek.movies.delete(id)
    setMovies(updated)
  }, [])

  const getMovie = useCallback(
    (id) => movies.find((m) => m.id === id),
    [movies]
  )

  return (
    <MoviesContext.Provider value={{ movies, loading, refresh, addMovie, deleteMovie, getMovie }}>
      {children}
    </MoviesContext.Provider>
  )
}

export function useMovies() {
  const ctx = useContext(MoviesContext)
  if (!ctx) throw new Error('useMovies must be inside MoviesProvider')
  return ctx
}
