import React from 'react'
import { Minus, Square, X, Clapperboard } from 'lucide-react'

export default function TitleBar() {
  return (
    <div
      className="h-10 flex items-center justify-between flex-shrink-0 bg-cinema-black/90 border-b border-cinema-border/50 px-4"
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* לוגו */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
        <Clapperboard className="w-4 h-4 text-cinema-gold" />
        <span className="text-sm font-bold text-white tracking-wide">סינמטק</span>
      </div>

      {/* כפתורי חלון */}
      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <button
          onClick={() => window.cinematek.window.minimize()}
          className="w-8 h-6 flex items-center justify-center rounded hover:bg-white/10 text-cinema-muted hover:text-white transition-colors"
          title="מזעור"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          onClick={() => window.cinematek.window.maximize()}
          className="w-8 h-6 flex items-center justify-center rounded hover:bg-white/10 text-cinema-muted hover:text-white transition-colors"
          title="הגדלה"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={() => window.cinematek.window.close()}
          className="w-8 h-6 flex items-center justify-center rounded hover:bg-red-500 text-cinema-muted hover:text-white transition-colors"
          title="סגור"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
