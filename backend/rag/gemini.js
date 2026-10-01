// Thin client for the Google Gemini REST API (embeddings + streaming chat).
// Uses Node's built-in fetch, so no SDK dependency is needed.

const BASE_URL = (process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001';
const EMBED_DIMS = Number(process.env.GEMINI_EMBED_DIMS || 768);
// Tried in order: if a model is rate-limited, overloaded or unavailable, the next one answers.
const CHAT_MODELS = (process.env.GEMINI_CHAT_MODELS || 'gemini-3.8-flash,gemini-3.5-flash-lite')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;

class GeminiError extends Error {
  constructor(message, status, retryAfterMs) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function apiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError('GEMINI_API_KEY is not set on the server', 503);
  return key;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseRetryDelay(errorJson) {
  const details = errorJson?.error?.details || [];
  for (const d of details) {
    if (typeof d.retryDelay === 'string') {
      const secs = parseFloat(d.retryDelay);
      if (!Number.isNaN(secs)) return Math.ceil(secs * 1000);
    }
  }
  return undefined;
}

async function toGeminiError(res) {
  let body;
  try {
    body = await res.json();
  } catch {
    body = undefined;
  }
  const message = body?.error?.message || `Gemini API request failed with HTTP ${res.status}`;
  return new GeminiError(message, res.status, parseRetryDelay(body));
}

async function post(path, body, { signal, retries = MAX_RETRIES } = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey() },
      body: JSON.stringify(body),
      signal,
    });
    if (res.ok) return res;

    const err = await toGeminiError(res);
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= retries) throw err;
    const wait = Math.min(err.retryAfterMs ?? 1000 * 2 ** attempt, 30000);
    await sleep(wait);
  }
}

function normalize(values) {
  let sum = 0;
  for (const v of values) sum += v * v;
  const norm = Math.sqrt(sum) || 1;
  return values.map((v) => v / norm);
}

// Embeds many texts. taskType is RETRIEVAL_DOCUMENT for stored chunks and RETRIEVAL_QUERY for searches.
async function embedTexts(texts, taskType = 'RETRIEVAL_DOCUMENT') {
  const supportsTaskType = !EMBED_MODEL.startsWith('gemini-embedding-2');
  const vectors = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const requests = batch.map((text) => ({
      model: `models/${EMBED_MODEL}`,
      content: { parts: [{ text }] },
      outputDimensionality: EMBED_DIMS,
      ...(supportsTaskType ? { taskType } : {}),
    }));
    const res = await post(`/models/${EMBED_MODEL}:batchEmbedContents`, { requests });
    const json = await res.json();
    if (!Array.isArray(json.embeddings) || json.embeddings.length !== batch.length) {
      throw new GeminiError('Unexpected embedding response from Gemini', 502);
    }
    for (const e of json.embeddings) vectors.push(normalize(e.values));
  }
  return vectors;
}

async function embedQuery(text) {
  const [vector] = await embedTexts([text], 'RETRIEVAL_QUERY');
  return vector;
}

// Reads a Server-Sent Events body from Gemini and yields text deltas.
async function* readSse(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newline;
      while ((newline = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        let chunk;
        try {
          chunk = JSON.parse(payload);
        } catch {
          continue;
        }
        if (chunk.error) throw new GeminiError(chunk.error.message || 'Gemini stream error', chunk.error.code || 502);
        if (chunk.promptFeedback?.blockReason) {
          throw new GeminiError(`The request was blocked by Gemini (${chunk.promptFeedback.blockReason})`, 400);
        }
        const parts = chunk.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.text && !part.thought) yield part.text;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function openStream(model, { system, contents, temperature, maxOutputTokens, signal }) {
  const generationConfig = { temperature, maxOutputTokens, thinkingConfig: { thinkingLevel: 'low' } };
  const body = { systemInstruction: { parts: [{ text: system }] }, contents, generationConfig };
  const path = `/models/${model}:streamGenerateContent?alt=sse`;
  try {
    return await post(path, body, { signal, retries: 1 });
  } catch (err) {
    // Older or different models may reject thinkingConfig; retry once without it.
    if (err.status === 400 && /thinking/i.test(err.message)) {
      delete generationConfig.thinkingConfig;
      return post(path, body, { signal, retries: 1 });
    }
    throw err;
  }
}

// Streams an answer, falling back to the next model if one is unavailable before any text is sent.
async function* streamChat({ system, contents, temperature = 0.4, maxOutputTokens = 2048, signal }) {
  let lastError;
  for (const model of CHAT_MODELS) {
    let res;
    try {
      res = await openStream(model, { system, contents, temperature, maxOutputTokens, signal });
    } catch (err) {
      if (signal?.aborted) throw err;
      lastError = err;
      const fallback = err.status === 404 || err.status === 429 || err.status >= 500 || err.status === 403;
      if (fallback) continue;
      throw err;
    }
    yield* readSse(res.body);
    return;
  }
  throw lastError || new GeminiError('No Gemini chat model is configured', 503);
}

module.exports = {
  GeminiError,
  isConfigured,
  embedTexts,
  embedQuery,
  streamChat,
  normalize,
  EMBED_MODEL,
  EMBED_DIMS,
  CHAT_MODELS,
};
