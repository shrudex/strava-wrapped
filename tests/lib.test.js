import { describe, it, expect } from 'vitest';
import { parseCSV, pd, analyzeTrack } from '../src/lib/parse.js';
import { rng, prv, stats } from '../src/lib/stats.js';
import { fK, fT, fP } from '../src/lib/format.js';

const DAY = 864e5;
const run = (iso, dist = 5000, mt = 1500) => ({ t: Date.parse(iso), dist, mt, elev: null });

describe('parseCSV', () => {
  it('handles quotes, commas and CRLF', () => {
    expect(parseCSV('a,b\r\n"x, y","say ""hi"""\r\n')).toEqual([['a', 'b'], ['x, y', 'say "hi"']]);
  });
});

describe('pd (Strava dates)', () => {
  it('parses 12-hour UTC timestamps', () => {
    expect(pd('Jan 5, 2025, 6:30:12 AM')).toBe(Date.UTC(2025, 0, 5, 6, 30, 12));
    expect(pd('Dec 31, 2025, 11:59:59 PM')).toBe(Date.UTC(2025, 11, 31, 23, 59, 59));
    expect(pd('Mar 3, 2025, 12:05:00 AM')).toBe(Date.UTC(2025, 2, 3, 0, 5, 0));
  });
  it('returns null for junk', () => expect(pd('not a date')).toBeNull());
});

describe('period ranges', () => {
  it('year and month boundaries are inclusive and exact', () => {
    expect(rng({ mode: 'year', y: 2025 })).toEqual([Date.UTC(2025, 0, 1), Date.UTC(2026, 0, 1) - 1]);
    expect(rng({ mode: 'month', y: 2024, m: 1 })[1]).toBe(Date.UTC(2024, 2, 1) - 1); // leap Feb
  });
  it('previous equivalent period', () => {
    expect(prv({ mode: 'year', y: 2025 })).toEqual(rng({ mode: 'year', y: 2024 }));
    expect(prv({ mode: 'month', y: 2025, m: 0 })).toEqual(rng({ mode: 'month', y: 2024, m: 11 }));
    const [a, b] = rng({ mode: 'custom', s: '2025-03-01', e: '2025-03-10' });
    const [pa, pb] = prv({ mode: 'custom' }, a, b);
    expect(pb).toBe(a - 1);
    expect(pb - pa).toBe(b - a);
  });
  it('rejects an end date before the start date', () => {
    expect(rng({ mode: 'custom', s: '2025-03-10', e: '2025-03-01' })).toEqual([0, -1]);
  });
});

describe('stats', () => {
  const [a, b] = rng({ mode: 'year', y: 2024 });
  const S = [run('2024-01-01T08:00:00Z'), run('2024-01-02T08:00:00Z', 10000), run('2024-01-03T08:00:00Z'), run('2024-01-20T08:00:00Z')];
  const st = stats(S, a, b);
  it('totals', () => {
    expect(st.n).toBe(4);
    expect(st.dist).toBe(25000);
    expect(st.longest.dist).toBe(10000);
    expect(st.days).toBe(4);
  });
  it('streak and gap', () => {
    expect(st.streak).toBe(3);
    expect(st.gap).toBe(16);
  });
  it('never treats missing distance as zero', () => {
    const none = stats([{ t: Date.UTC(2024, 5, 1), dist: null, mt: null, elev: null }], a, b);
    expect(none.dist).toBeNull();
    expect(none.avg).toBeNull();
  });
  it('monthly buckets cover the whole year', () => expect(st.bars.length).toBeLessThanOrEqual(12));
});

describe('analyzeTrack', () => {
  // constant 3 m/s northward: one point every 10 m / 3.333 s
  const M = 111194.9; // metres per degree of latitude
  const pts = Array.from({ length: 1201 }, (_, i) => [(i * 10) / M, 0, 1_700_000_000 + (i * 10) / 3]);
  const r = analyzeTrack(pts);
  it('computes km splits', () => {
    expect(r.splits.length).toBe(12);
    r.splits.forEach(s => expect(s).toBeCloseTo(1000 / 3, 0));
  });
  it('computes best efforts at the right pace', () => {
    expect(r.best[1000]).toBeCloseTo(1000 / 3, 0);
    expect(r.best[5000]).toBeCloseTo(5000 / 3, 0);
    expect(r.best[400]).toBeCloseTo(400 / 3, 0);
  });
  it('even halves', () => expect(r.h1 / r.h2).toBeCloseTo(1, 1));
  it('rejects too-short or invalid tracks', () => {
    expect(analyzeTrack(pts.slice(0, 5))).toBeNull();
    expect(analyzeTrack(pts.map(p => [p[0], p[1], NaN]))).toBeNull();
  });
  it('drops impossible GPS jumps', () => {
    const j = pts.map(p => [...p]);
    j[600][0] += 1; // ~111 km teleport
    expect(analyzeTrack(j).tot).toBeLessThan(13000);
  });
});

describe('format', () => {
  it('formats units and missing values', () => {
    expect(fK(10050)).toBe('10.1');
    expect(fK(null)).toBe('—');
    expect(fT(3725)).toBe('1h 2m');
    expect(fP(333.4)).toBe('5:33');
    expect(fP(null)).toBe('—');
  });
});
