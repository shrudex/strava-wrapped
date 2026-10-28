// Single source of truth for the home-page intro + FAQ. Used by the React home page
// and injected into the static HTML (and FAQPage JSON-LD) at build time by vite.config.js.
export const INTRO = {
  h: 'What is Strava Wrapped?',
  p: [
    'Strava Wrapped turns your Strava data export into a Wrapped-style running recap. Upload the ZIP you get from Strava and see your total distance, run count, active days, monthly and weekly volume, km splits, best efforts, streaks, a calendar heatmap and an elevation profile.',
    'It is built for runners who want more than a one-line yearly summary. Pick a year, a single month or any custom date range, then share a ready-made card on WhatsApp, X or LinkedIn, or save the whole report as a PDF.',
    'It is free, needs no login, and your file is processed in your browser, so your routes and activity history are never uploaded.',
  ],
};

export const FAQ = [
  { q: 'What is Strava Wrapped?', a: 'A free tool that turns your Strava export ZIP into a Wrapped-style running recap with stats, charts, badges and shareable cards.' },
  { q: 'How do I export my Strava data?', a: 'In Strava, open Settings, then My Account, then Download or Delete Your Account, and request your archive. Strava emails you a link to a ZIP file. Upload that ZIP to Strava Wrapped without unzipping it.' },
  { q: 'Is Strava Wrapped free and private?', a: 'Yes. It is free and needs no login. Your ZIP is read inside your browser and is not uploaded to a server. The optional AI summary sends only totals such as distance and run count, never routes, names or single-run dates.' },
  { q: 'Which files does it use?', a: 'Only activities.csv and the GPS files for your runs. It reads GPX, TCX and FIT files, including gzipped versions. Runs without a readable GPS file still count using the CSV data.' },
  { q: 'Can I see a single month or custom dates?', a: 'Yes. Choose a calendar year, a month within a year, or any custom start and end date. Dates use your local time zone.' },
  { q: 'Does it work for cycling, hiking or swimming?', a: 'Not yet. This version analyses runs only, meaning activities with the type Run. Other activity types in your export are ignored.' },
  { q: 'What stats do I get?', a: 'Distance, moving time, elevation, active days, runs per week, longest run, streaks, longest gap, a calendar heatmap, km splits, best 400 m to 5 km efforts, first versus second half pacing, an elevation profile, and badges such as Early bird or Weekend warrior.' },
  { q: 'Why do my numbers differ from Strava?', a: 'Best efforts and splits are estimated from raw GPS points, so they can differ by a few seconds. Elevation uses GPS altitude, which can differ from Strava’s corrected elevation. Missing values are shown as unavailable, never as zero.' },
  { q: 'Is Strava Wrapped affiliated with Strava?', a: 'No. It is an independent project and is not affiliated with or endorsed by Strava.' },
];
