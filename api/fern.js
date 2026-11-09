// Granny Fern's free-text replies for hosts outside claude.ai (for example Vercel).
// Needs the environment variable ANTHROPIC_API_KEY. ANTHROPIC_MODEL is optional.
// The persona and notes live here on the server, so the page cannot turn this
// endpoint into a general chat: it only sends the round number and the chat so far.

const NOTES = require('./_fern-notes.js');

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
const MAX_TURNS = 30;        // messages kept from the chat
const MAX_CHARS = 300;       // per message
const MAX_TOKENS = 220;      // per reply
const WINDOW_MS = 60 * 1000; // simple per-visitor limit, best effort
const PER_WINDOW = 20;
const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > PER_WINDOW;
}

function cleanHistory(history) {
  const out = [];
  for (const m of Array.isArray(history) ? history.slice(-MAX_TURNS) : []) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue;
    const text = String(m.text || '').trim().slice(0, MAX_CHARS);
    if (!text) continue;
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += '\n' + text;
    else out.push({ role: m.role, content: text });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const key = process.env.ANTHROPIC_API_KEY;

  if (req.method === 'GET') {
    return res.status(200).json({ ready: Boolean(key) });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST.' });
  }
  if (!key) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY is not set.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) {
    return res.status(429).json({ error: 'Too many messages. Wait a minute.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const round = Number(body && body.round);
  const R = NOTES.rounds[round];
  if (!R) {
    return res.status(400).json({ error: 'Unknown round.' });
  }
  const messages = cleanHistory(body.history);
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'The last message must come from the child.' });
  }

  const system = [
    NOTES.persona,
    'WHAT YOU ARE TEACHING NOW\nThe recipe needs: ' + R.need,
    'YOUR NOTES (your only knowledge about this ingredient)\n' + R.notes,
    'You already greeted the child with: "' + R.opening + '"',
    "Write Fern's next reply only, with no name label."
  ].join('\n\n');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system, messages })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('Anthropic API error', r.status, data && data.error);
      return res.status(502).json({ error: 'The model did not answer.' });
    }
    const text = (data.content || [])
      .filter(c => c && c.type === 'text')
      .map(c => c.text)
      .join(' ')
      .trim();
    return res.status(200).json({ text });
  } catch (e) {
    console.error('Request failed', e);
    return res.status(502).json({ error: 'The model did not answer.' });
  }
};
