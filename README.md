# Strava Wrapped

Upload your Strava export ZIP and get a Wrapped-style **running** report: KPIs, trends, records, km splits, elevation profile, calendar heatmap, best efforts, badges, share cards and a PDF. Only activities with type "Run" are analysed; everything else is ignored. All processing happens in your browser; nothing is uploaded.

GPS tracks: `.gpx`, `.tcx` and `.fit`, each optionally gzipped (`.gz`). Runs without a readable track still count using CSV data.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (Vitest)
npm run build      # production build in dist/
```

## Sharing and SEO

Share cards, the PDF and pre-written WhatsApp and X messages all link to `https://strava-wrapped.vercel.app/` (set in `src/lib/constants.js`; also update `index.html`, `public/sitemap.xml` and `public/robots.txt` if the domain changes). Add the site in Google Search Console and submit the sitemap.

## PDF export

"Download PDF" opens the browser print dialog with a print stylesheet; choose **Save as PDF**. Page numbers appear in Chrome and Edge; Safari and Firefox show the branding footer without page numbers.

## Structure

```
src/
  main.jsx               entry
  App.js                 upload, validation, import summary
  html.js                htm + React.createElement helper
  components/Report.js   report dashboard
  components/Widgets.js  Bars, Kpi, Route, share cards
  lib/parse.js           CSV parsing, GPX/TCX/FIT(.gz) reading, track analysis
  lib/stats.js           period ranges and metrics
  lib/format.js          formatters
  lib/constants.js
tests/lib.test.js        unit tests for parsing, periods, stats, tracks, formatting
```

Notes: dates are treated as UTC as exported. Missing values show as unavailable, never zero. Independent project, not affiliated with Strava.

