/**
 * github.js — שכבת עזר לתקשורת עם GitHub CLI
 * הפונקציות האלו רצות בתהליך הראשי של Electron דרך IPC.
 * קובץ זה מיועד לשימוש עתידי אם רוצים להוציא את הלוגיקה מ-main.js.
 */

/**
 * מחזיר את סטטוס ה-run כ-string קריא
 * @param {'queued'|'in_progress'|'completed'} status
 * @param {'success'|'failure'|'cancelled'|null} conclusion
 */
export function interpretRunStatus(status, conclusion) {
  if (status === 'queued') return 'ממתין בתור'
  if (status === 'in_progress') return 'מוריד...'
  if (status === 'completed') {
    switch (conclusion) {
      case 'success': return 'הושלם בהצלחה'
      case 'failure': return 'נכשל'
      case 'cancelled': return 'בוטל'
      case 'timed_out': return 'פג זמן'
      default: return 'הסתיים'
    }
  }
  return status
}

/**
 * בונה URL לדף ה-run ב-GitHub
 * @param {string} repo  - "owner/repo"
 * @param {string} runId
 */
export function buildRunUrl(repo, runId) {
  return `https://github.com/${repo}/actions/runs/${runId}`
}

/**
 * ממיר תאריך GitHub (YYYY-MM-DD) לפורמט עברי
 * @param {string} dateStr
 */
export function formatUploadDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return ''
  const y = dateStr.slice(0, 4)
  const m = dateStr.slice(4, 6)
  const d = dateStr.slice(6, 8)
  return new Date(`${y}-${m}-${d}`).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * בודק אם URL הוא של YouTube
 * @param {string} url
 */
export function isYouTubeUrl(url) {
  try {
    const { hostname } = new URL(url)
    return (
      hostname === 'www.youtube.com' ||
      hostname === 'youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'm.youtube.com'
    )
  } catch {
    return false
  }
}

/**
 * מחלץ את ה-video ID מ-URL של YouTube
 * @param {string} url
 * @returns {string|null}
 */
export function extractVideoId(url) {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
    return u.searchParams.get('v')
  } catch {
    return null
  }
}

/**
 * מחזיר URL לתמונה ממוזערת של YouTube לפי video ID
 * (שימושי להצגה לפני ההורדה)
 * @param {string} videoId
 */
export function getYouTubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}
