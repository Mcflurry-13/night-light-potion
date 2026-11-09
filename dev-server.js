// Local preview with Granny Fern's live chat.
// Run: node --env-file=.env.local dev-server.js   (Node 20.6 or newer)
// .env.local holds one line: ANTHROPIC_API_KEY=your-key
// Then open http://localhost:3000

const http = require('http');
const fs = require('fs');
const path = require('path');
const fern = require('./api/fern.js');

const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json'
};

function notFound(res) {
  res.statusCode = 404;
  res.end('Not found');
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/fern') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 100000) req.destroy();
    });
    req.on('end', () => {
      try { req.body = body ? JSON.parse(body) : {}; } catch (e) { req.body = {}; }
      res.status = code => { res.statusCode = code; return res; };
      res.json = obj => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(obj));
      };
      fern(req, res);
    });
    return;
  }

  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(root, path.normalize(rel));
  const inside = file.startsWith(root + path.sep);
  const hidden = /[\\/](api|\.git)[\\/]|[\\/]\.env/.test(file) || file.endsWith('dev-server.js');
  if (!inside || hidden) return notFound(res);

  fs.readFile(file, (err, data) => {
    if (err) return notFound(res);
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
}).listen(port, () => {
  const key = process.env.ANTHROPIC_API_KEY ? 'live chat on' : 'no ANTHROPIC_API_KEY, prewritten replies only';
  console.log(`Night Light Potion: http://localhost:${port} (${key})`);
});
