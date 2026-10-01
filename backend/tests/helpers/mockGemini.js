// Test helper: a local stand-in for the Gemini REST API.
// Embeddings are bag-of-words hashes, so texts sharing words are similar, like real embeddings.
const http = require('http');
const crypto = require('crypto');

function fakeEmbedding(text, dims) {
  const v = new Array(dims).fill(0);
  const words = text.toLowerCase().match(/[a-z0-9+#]+/g) || [];
  for (const w of words) {
    const h = crypto.createHash('md5').update(w).digest();
    v[h.readUInt32BE(0) % dims] += 1;
  }
  return v;
}

function start({ dims = 768 } = {}) {
  const calls = { embed: [], chat: [] };
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const body = raw ? JSON.parse(raw) : {};
      if (req.headers['x-goog-api-key'] !== 'test-key') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: { code: 403, message: 'API key not valid' } }));
      }

      const embed = req.url.match(/\/models\/([^:]+):batchEmbedContents/);
      if (embed) {
        calls.embed.push(body);
        const embeddings = body.requests.map((r) => ({ values: fakeEmbedding(r.content.parts[0].text, r.outputDimensionality || dims) }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ embeddings }));
      }

      const chat = req.url.match(/\/models\/([^:]+):streamGenerateContent/);
      if (chat) {
        const model = chat[1];
        calls.chat.push({ model, body });
        if (model === 'busy-model') {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          return res.end(
            JSON.stringify({ error: { code: 429, message: 'Quota exceeded', details: [{ retryDelay: '0.05s' }] } })
          );
        }
        if (body.generationConfig?.thinkingConfig) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: { code: 400, message: 'Thinking level is not supported for this model.' } }));
        }
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        const parts = ['Here is what the question bank says: ', 'see [1]', ' for details.'];
        for (const text of parts) {
          res.write(`data: ${JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text }] } }] })}\r\n\r\n`);
        }
        res.write(`data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: 'secret thoughts', thought: true }] } }] })}\n\n`);
        return res.end();
      }

      res.writeHead(404);
      res.end('{}');
    });
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${server.address().port}`, calls, close: () => server.close() }));
  });
}

module.exports = { start, fakeEmbedding };
