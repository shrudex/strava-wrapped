# Strava Wrapped

Upload your Strava export ZIP and get a Wrapped-style report: KPIs, trends, records, GPX splits, badges and share cards. Everything is processed in your browser; nothing is uploaded.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

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

