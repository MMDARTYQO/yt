import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import TitleBar from './components/TitleBar'
import StatusBar from './components/StatusBar'
import Home from './pages/Home'
import Download from './pages/Download'
import Player from './pages/Player'
import Settings from './pages/Settings'
import { MoviesProvider } from './context/MoviesContext'
import { DownloadProvider } from './context/DownloadContext'

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
}

export default function App() {
  const location = useLocation()
  const isPlayer = location.pathname.startsWith('/player')

  return (
    <MoviesProvider>
      <DownloadProvider>
        <div className="flex flex-col h-screen bg-cinema-black overflow-hidden select-none">
          {/* שורת כותרת מותאמת */}
          <TitleBar />

          <div className="flex flex-1 overflow-hidden">
            {/* סרגל צד - מוסתר בנגן */}
            {!isPlayer && <Sidebar />}

            {/* תוכן ראשי */}
            <main className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                  className="absolute inset-0"
                >
                  <Routes location={location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/download" element={<Download />} />
                    <Route path="/player/:id" element={<Player />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          {/* שורת סטטוס תחתית */}
          {!isPlayer && <StatusBar />}
        </div>
      </DownloadProvider>
    </MoviesProvider>
  )
}
