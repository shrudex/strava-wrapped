// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../src/App.js';
import { Report } from '../src/components/Report.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// jsdom has no canvas: stub the 2D context used by the share-card renderer
const ctx = new Proxy({}, { get: () => () => ({ addColorStop() {} }), set: () => true });
HTMLCanvasElement.prototype.getContext = () => ctx;
HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,AA==';
const mount = async el => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(el));
  return host;
};

describe('UI smoke tests', () => {
  it('renders the home page with upload, intro and FAQ', async () => {
    const host = await mount(React.createElement(App));
    expect(host.textContent).toContain('Choose your Strava ZIP');
    expect(host.textContent).toContain('What is Strava Wrapped?');
    expect(host.querySelectorAll('details.faq').length).toBeGreaterThanOrEqual(9);
    expect(host.querySelector('a[href="https://x.com/shrudex"]')).toBeTruthy();
  });

  it('renders a report from synthetic runs without errors', async () => {
    const acts = Array.from({ length: 12 }, (_, i) => ({
      id: 'r' + i, t: Date.UTC(2025, i % 12, 3 + i, 5, 30), name: 'Run', type: 'Run', k: 'run',
      dist: 5000 + i * 400, mt: 1500 + i * 30, et: 1600, elev: 20 + i, hr: null, file: null, gps: 'none',
    }));
    const host = await mount(React.createElement(Report, { D: { acts }, zip: { file: () => null }, onBack() {} }));
    const t = host.textContent;
    ['The vibe check', 'At a glance', 'Run calendar', 'Share cards', 'Run log', 'Early bird'].forEach(s => expect(t).toContain(s));
    expect(t).not.toContain('{per}');
    expect(t).toContain('2025');
    expect(host.querySelector('a[href="https://strava-wrapped.vercel.app/"]')).toBeTruthy();
  });
});
