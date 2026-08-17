import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'

export default function EmptyState({ icon, title, subtitle, showAction = true }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-5 opacity-40">{icon}</div>
      <h2 className="text-lg font-semibold text-white/80 mb-2">{title}</h2>
      <p className="text-cinema-muted text-sm mb-8 max-w-xs">{subtitle}</p>
      {showAction && (
        <button
          onClick={() => navigate('/download')}
          className="flex items-center gap-2 px-5 py-2.5 bg-cinema-gold/10 hover:bg-cinema-gold/20 border border-cinema-gold/20 hover:border-cinema-gold/40 rounded-xl text-cinema-gold text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          הורד סרטון ראשון
        </button>
      )}
    </motion.div>
  )
}
