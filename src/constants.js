export const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const DAY = 864e5;
export const SITE_URL = 'https://strava-wrapped.vercel.app/';
export const X_URL = 'https://x.com/shrudex';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/codeshubh/';
/** Current time shifted to the viewer's local clock (matches localized activity times). */
export const nowLocal = () => Date.now() - new Date().getTimezoneOffset() * 6e4;
