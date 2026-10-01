// AI endpoints: status, streaming RAG chat, and (admin-only) re-indexing.
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const gemini = require('../rag/gemini');
const { retrieve } = require('../rag/retriever');
const { SYSTEM_PROMPT, MODES, buildContents } = require('../rag/prompts');
const indexer = require('../rag/indexer');
const vectorStore = require('../rag/vectorStore');
const rateLimit = require('../rag/rateLimit');
const KnowledgeChunk = require('../Models/KnowledgeChunk');
const Question = require('../Models/Questions');

const router = express.Router();

const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY = 10;

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AI_RATE_LIMIT || 30),
  message: 'You have sent a lot of AI requests. Please wait a few minutes and try again.',
});

function friendlyError(err) {
  if (err?.status === 429) return 'The AI is getting too many requests right now. Please try again in a minute.';
  if (err?.status === 401 || err?.status === 403 || /api key/i.test(err?.message || '')) {
    return 'The server\'s Gemini API key was rejected. Check GEMINI_API_KEY in the backend settings.';
  }
  if (err?.status === 503 && /GEMINI_API_KEY/.test(err.message)) return err.message;
  return 'The AI service had a problem answering. Please try again.';
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

router.get('/status', async (req, res) => {
  try {
    const [indexedChunks, questions, topCompanies] = await Promise.all([
      KnowledgeChunk.countDocuments({ embeddingModel: gemini.EMBED_MODEL }),
      Question.estimatedDocumentCount(),
      Question.aggregate([
        { $unwind: '$companies' },
        { $group: { _id: '$companies', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);
    res.json({
      configured: gemini.isConfigured(),
      questions,
      indexedChunks,
      searchMode: vectorStore.mode(),
      embedModel: gemini.EMBED_MODEL,
      chatModels: gemini.CHAT_MODELS,
      topCompanies: topCompanies.map((c) => c._id),
    });
  } catch (err) {
    console.error('[ai] status error:', err.message);
    res.status(500).json({ message: 'Could not read AI status' });
  }
});

router.post('/chat', chatLimiter, async (req, res) => {
  const { message, history = [], questionId, mode = 'chat' } = req.body || {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'Please type a message.' });
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return res.status(400).json({ message: `Messages can be at most ${MAX_MESSAGE_CHARS} characters.` });
  }
  if (!Array.isArray(history)) return res.status(400).json({ message: 'history must be an array.' });
  if (!Object.prototype.hasOwnProperty.call(MODES, mode)) return res.status(400).json({ message: 'Unknown mode.' });
  if (questionId && !mongoose.isValidObjectId(questionId)) return res.status(400).json({ message: 'Invalid questionId.' });
  if (!gemini.isConfigured()) {
    return res.status(503).json({ message: 'The AI assistant is not set up yet: GEMINI_API_KEY is missing on the server.' });
  }

  const cleanHistory = history
    .slice(-MAX_HISTORY)
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.slice(0, 4000) }));

  let retrieval;
  try {
    retrieval = await retrieve({ message: message.trim(), history: cleanHistory, questionId });
  } catch (err) {
    console.error('[ai] retrieval error:', err);
    return res.status(500).json({ message: 'Could not search the question bank. Please try again.' });
  }

  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) controller.abort();
  });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  send('sources', {
    sources: retrieval.sources.map(({ text, ...s }) => s),
    strategy: retrieval.strategy,
    searchMode: retrieval.searchMode,
    companies: retrieval.companies,
  });

  try {
    const contents = buildContents({ history: cleanHistory, message: message.trim(), sources: retrieval.sources, mode });
    for await (const delta of gemini.streamChat({ system: SYSTEM_PROMPT, contents, signal: controller.signal })) {
      send('token', { t: delta });
    }
    send('done', {});
  } catch (err) {
    if (!controller.signal.aborted) {
      console.error('[ai] generation error:', err.status, err.message);
      send('error', { message: friendlyError(err) });
    }
  }
  res.end();
});

router.post('/reindex', async (req, res) => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || !safeEqual(req.get('x-admin-key') || '', adminKey)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!gemini.isConfigured()) return res.status(503).json({ message: 'GEMINI_API_KEY is missing on the server.' });
  try {
    const stats = await indexer.indexAll({ force: req.body?.force === true });
    res.json({ success: true, ...stats, searchMode: vectorStore.mode() });
  } catch (err) {
    console.error('[ai] reindex error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
