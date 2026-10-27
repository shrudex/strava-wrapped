import { isGrounded } from '../src/lib/aiCheck.js';

const hits = new Map(); // best-effort per-instance rate limit

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: 'not_configured' });

  const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0];
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 60000);
  if (recent.length >= 6) return res.status(429).json({ ok: false, error: 'rate_limited' });
  hits.set(ip, [...recent, now]);

  const facts = req.body && req.body.facts;
  if (!Array.isArray(facts) || facts.length < 1 || facts.length > 30 || facts.some(f => typeof f !== 'string' || f.length > 140)) {
    return res.status(400).json({ ok: false, error: 'bad_request' });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  const prompt = 'Write a short, upbeat, lightly witty recap (2-3 sentences, max 80 words) of a runner\'s period. ' +
    'Use ONLY the facts below and copy any numbers exactly as written. Do not invent numbers, names, places or causes, and give no medical advice.\n\nFACTS:\n' +
    facts.map(f => '- ' + f).join('\n');
  const generationConfig = { maxOutputTokens: 1024, temperature: 0.8 };
  if (model.includes('2.5')) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig }),
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: 'upstream' });
    const j = await r.json();
    const text = ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).map(p => p.text || '').join('').trim();
    if (!text || !isGrounded(text, facts)) return res.status(200).json({ ok: false, error: 'rejected' });
    return res.status(200).json({ ok: true, text });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'upstream' });
  }
}
