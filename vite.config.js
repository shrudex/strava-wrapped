import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { INTRO, FAQ } from './src/content/faq.js';

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Puts real, crawlable text in the HTML before JavaScript runs.
const seoContent = () => ({
  name: 'seo-content',
  transformIndexHtml(html) {
    const body = '<main style="font-family:system-ui,sans-serif;max-width:680px;margin:6vh auto;padding:16px;line-height:1.5">' +
      '<h1>Strava Wrapped: your running year in review</h1>' +
      '<h2>' + esc(INTRO.h) + '</h2>' + INTRO.p.map(p => '<p>' + esc(p) + '</p>').join('') +
      '<h2>Frequently asked questions</h2>' + FAQ.map(f => '<h3>' + esc(f.q) + '</h3><p>' + esc(f.a) + '</p>').join('') +
      '<noscript><p>Please enable JavaScript to use Strava Wrapped.</p></noscript></main>';
    const ld = '<script type="application/ld+json">' + JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    }) + '</script>';
    return html.replace('<!--SEO_CONTENT-->', body).replace('<!--FAQ_JSONLD-->', ld);
  },
});

export default defineConfig({ plugins: [react(), seoContent()] });
