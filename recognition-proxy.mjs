// ponytail: minimal proxy to Google Input Tools handwriting endpoint
// Run: node recognition-proxy.mjs
// Then set INK_RECOGNITION_API_URL=http://localhost:8080 in .env

import http from 'node:http';
import https from 'node:https';

const PORT = 8081;
const GOOGLE_URL = 'https://inputtools.google.com/request?itc=en-t-i0-handwrit&app=chromeos';

function googleRequest(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(GOOGLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => chunks += c);
      res.on('end', () => {
        try { resolve(JSON.parse(chunks)); } catch { resolve(chunks); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function convertToGoogleFormat(strokes, width, height) {
  const ink = strokes.map((s) => {
    const xs = s.points.map((p) => p.x);
    const ys = s.points.map((p) => p.y);
    const ts = s.points.map((p) => p.t);
    return [xs, ys, ts];
  });
  return {
    input_type: 0,
    requests: [{
      writing_guide: { writing_area_width: width || 1000, writing_area_height: height || 1000 },
      ink,
      pre_context: '',
      max_num_results: 5,
      max_completions: 0,
    }],
  };
}

function parseGoogleResponse(gResp) {
  // Google returns [status, [requestId, [candidates], ...]]
  if (!Array.isArray(gResp) || gResp[0] !== 'SUCCESS') {
    return { label: '', score: 0, wordGroups: [] };
  }
  const candidates = gResp[1]?.[0]?.[1] || [];
  const bestText = candidates[0] || '';
  return {
    label: bestText,
    score: 1.0,
    wordGroups: bestText ? [{ text: bestText, strokeIndices: [], bbox: null }] : [],
  };
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  if (req.url === '/recognize_google' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => body += c);
    req.on('end', async () => {
      try {
        const { strokes, writingAreaWidth, writingAreaHeight } = JSON.parse(body);
        const gBody = convertToGoogleFormat(strokes, writingAreaWidth, writingAreaHeight);
        const gResp = await googleRequest(gBody);
        const result = parseGoogleResponse(gResp);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => console.log(`Recognition proxy running on http://localhost:${PORT}`));
