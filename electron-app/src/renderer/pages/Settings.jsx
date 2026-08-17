import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Github, CheckCircle, XCircle, RefreshCw, Save } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({ moviesDir: '', githubRepo: '' })
  const [ghStatus, setGhStatus] = useState(null) // null | { ok, message }
  const [checkingGh, setCheckingGh] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.cinematek.settings.get().then(setSettings)
  }, [])

  const checkGh = async () => {
    setCheckingGh(true)
    const result = await window.cinematek.gh.check()
    setGhStatus(result)
    setCheckingGh(false)
  }

  const chooseDir = async () => {
    const dir = await window.cinematek.settings.chooseDir()
    if (dir) setSettings((s) => ({ ...s, moviesDir: dir }))
  }

  const save = async () => {
    await window.cinematek.settings.set(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="h-full overflow-y-auto px-8 py-8 scrollbar-thin">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        <h1 className="text-3xl font-bold text-white mb-2">הגדרות</h1>
        <p className="text-cinema-muted text-sm mb-8">הגדר את חיבור GitHub ותיקיית הסרטים</p>

        {/* GitHub */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-cinema-gold uppercase tracking-widest mb-4">
            חיבור GitHub
          </h2>
          <div className="bg-cinema-surface border border-cinema-border rounded-2xl p-6 space-y-5">
            <div>
              <label className="text-sm text-cinema-muted mb-2 block">שם ה-Repository</label>
              <input
                type="text"
                value={settings.githubRepo}
                onChange={(e) => setSettings((s) => ({ ...s, githubRepo: e.target.value }))}
                placeholder="username/repo"
                className="w-full bg-cinema-black border border-cinema-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cinema-gold/50 transition-colors"
                dir="ltr"
              />
              <p className="text-xs text-cinema-muted/60 mt-2">
                לדוגמה: MMDARTYQO/yt
              </p>
            </div>

            {/* בדיקת חיבור */}
            <div>
              <button
                onClick={checkGh}
                disabled={checkingGh}
                className="flex items-center gap-2 px-4 py-2.5 bg-cinema-surface-hover border border-cinema-border rounded-xl text-sm text-white hover:border-cinema-gold/40 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${checkingGh ? 'animate-spin' : ''}`} />
                בדוק חיבור gh CLI
              </button>

              {ghStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 flex items-start gap-3 p-3 rounded-xl text-sm ${
                    ghStatus.ok
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {ghStatus.ok ? (
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <pre className="text-xs whitespace-pre-wrap font-sans">
                    {ghStatus.ok ? 'מחובר בהצלחה!' : ghStatus.message}
                  </pre>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* תיקיית סרטים */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-cinema-gold uppercase tracking-widest mb-4">
            ספריית סרטים
          </h2>
          <div className="bg-cinema-surface border border-cinema-border rounded-2xl p-6">
            <label className="text-sm text-cinema-muted mb-2 block">תיקיית שמירה</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={settings.moviesDir}
                readOnly
                className="flex-1 bg-cinema-black border border-cinema-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none cursor-default"
                dir="ltr"
              />
              <button
                onClick={chooseDir}
                className="flex items-center gap-2 px-4 py-3 bg-cinema-surface-hover border border-cinema-border rounded-xl text-sm text-white hover:border-cinema-gold/40 transition-all flex-shrink-0"
              >
                <FolderOpen className="w-4 h-4" />
                עיון
              </button>
            </div>
          </div>
        </section>

        {/* שמור */}
        <button
          onClick={save}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-cinema-gold text-cinema-black hover:bg-cinema-gold/90'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              נשמר!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              שמור הגדרות
            </>
          )}
        </button>
      </motion.div>
    </div>
  )
}
