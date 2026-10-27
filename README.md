# Strava Wrapped

Upload your Strava export ZIP and get a Wrapped-style report: KPIs, trends, records, GPX splits, badges and share cards. Everything is processed in your browser; nothing is uploaded.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Deploy to Vercel with git

```bash
git init
git add .
git commit -m "Strava Wrapped"
git branch -M main
git remote add origin https://github.com/<you>/strava-wrapped.git
git push -u origin main
```

Then on vercel.com choose **Add New > Project**, import the repo, and keep the detected settings (Framework: Vite, Build: `npm run build`, Output: `dist`). Every push to `main` redeploys.

## Structure

```
src/
  main.jsx               entry
  App.js                 upload, validation, import summary
  html.js                htm + React.createElement helper
  components/Report.js   report dashboard
  components/Widgets.js  Bars, Kpi, Route, share cards
  lib/parse.js           CSV and GPX parsing
  lib/stats.js           period ranges and metrics
  lib/format.js          formatters
  lib/constants.js
```

Notes: dates are treated as UTC as exported. Missing values show as unavailable, never zero. Independent project, not affiliated with Strava.
