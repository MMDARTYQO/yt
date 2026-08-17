# 🎬 סינמטק

אפליקציית Electron להורדת סרטוני YouTube דרך GitHub Actions ולצפייה בהם בממשק קולנועי.

---

## ארכיטקטורה

```
[ממשק Electron] → [gh workflow run] → [GitHub Actions] → [yt-dlp] → [artifact]
                                                                           ↓
                                      [gh run download] ← [polling status]
                                              ↓
                                       [ספרייה מקומית]
```

## דרישות מקדימות

- [Node.js](https://nodejs.org) v18+
- [GitHub CLI](https://cli.github.com) — מחובר לחשבון שלך (`gh auth login`)
- הרשאות על ה-repo `MMDARTYQO/yt`

## התקנה

```bash
cd electron-app
npm install
```

## הפעלה בסביבת פיתוח

```bash
npm run dev
```

> פותח את Vite dev server ואת Electron יחד.

## Build לפרודקשן

```bash
npm run dist
```

## שימוש

1. פתח את האפליקציה
2. לחץ **הורדה חדשה** בסרגל הצד
3. הדבק URL של YouTube
4. בחר איכות (1080p / 720p / 480p / שמע)
5. לחץ **הורד** — ה-workflow ב-GitHub Actions מופעל
6. ברגע שהסרטון מוכן הוא מופיע אוטומטית בספרייה

## מקשי קיצור בנגן

| מקש | פעולה |
|-----|--------|
| `Space` / `K` | השהה/המשך |
| `←` / `→` | חזור/קדם 10 שניות |
| `↑` / `↓` | עצמה |
| `M` | השתק/בטל השתקה |
| `F` | מסך מלא |
| `Esc` | חזור לספרייה |

## מבנה הפרויקט

```
cinematek/
├── .github/
│   └── workflows/
│       └── download.yml        ← GitHub Actions workflow
└── electron-app/
    ├── src/
    │   ├── main.js              ← Electron main process
    │   ├── preload.js           ← IPC bridge
    │   ├── lib/
    │   │   └── github.js        ← עזרי GitHub CLI
    │   └── renderer/
    │       ├── pages/
    │       │   ├── Home.jsx     ← ספריית סרטים
    │       │   ├── Download.jsx ← הורדה חדשה
    │       │   ├── Player.jsx   ← נגן וידאו
    │       │   └── Settings.jsx ← הגדרות
    │       ├── components/
    │       │   ├── TitleBar.jsx
    │       │   ├── Sidebar.jsx
    │       │   ├── MovieCard.jsx
    │       │   ├── StatusBar.jsx
    │       │   └── EmptyState.jsx
    │       └── context/
    │           ├── MoviesContext.jsx
    │           └── DownloadContext.jsx
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```
