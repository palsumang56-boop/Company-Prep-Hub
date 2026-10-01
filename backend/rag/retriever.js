// Retrieval step of the RAG pipeline: finds the questions most relevant to the user's message.
const mongoose = require('mongoose');
const Question = require('../Models/Questions');
const { embedQuery } = require('./gemini');
const { questionToChunks } = require('./chunker');
const vectorStore = require('./vectorStore');

const MAX_SOURCES = 5;
const MIN_SCORE = 0.6; // on the 0..1 scale, i.e. cosine similarity >= 0.2
const RELATIVE_WINDOW = 0.12; // keep results within this distance of the best match
const FOCUS_MAX_CHARS = 6000;
const COMPANY_CACHE_MS = 10 * 60 * 1000;

let companyCache = { list: [], at: 0 };

async function knownCompanies() {
  if (Date.now() - companyCache.at < COMPANY_CACHE_MS) return companyCache.list;
  const list = (await Question.distinct('companies')).filter(Boolean);
  companyCache = { list, at: Date.now() };
  return list;
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function detectCompanies(text, companies) {
  return companies.filter((c) => new RegExp(`(^|[^a-z0-9])${escapeRegex(c)}($|[^a-z0-9])`, 'i').test(text));
}

// Short follow-ups ("what about its complexity?") need the previous turn to retrieve well.
function retrievalQuery(message, history = []) {
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  if (!lastUser) return message;
  return `${lastUser.content.slice(0, 500)}\n${message}`;
}

function toSource(id, q, text, score) {
  return {
    id: String(id),
    title: q.title,
    companies: q.companies || [],
    difficulty: q.difficulty,
    topicTags: q.topicTags || [],
    text,
    score: score === undefined ? undefined : Math.round(score * 1000) / 1000,
  };
}

// Groups chunk hits by question, keeping each question's best score and up to two chunks of text.
function groupByQuestion(hits) {
  const byQuestion = new Map();
  for (const hit of hits) {
    const id = String(hit.question);
    const entry = byQuestion.get(id) || { hit, score: hit.score, chunks: new Map() };
    entry.score = Math.max(entry.score, hit.score);
    entry.chunks.set(hit.chunkIndex, hit);
    byQuestion.set(id, entry);
  }
  return [...byQuestion.values()].map((entry) => {
    const chunks = [...entry.chunks.values()].sort((a, b) => b.score - a.score).slice(0, 2);
    chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
    return toSource(entry.hit.question, entry.hit, chunks.map((c) => c.text).join('\n...\n'), entry.score);
  });
}

async function keywordFallback(message, companies) {
  const words = message.split(/\W+/).filter((w) => w.length > 3).slice(0, 6).map(escapeRegex);
  const or = [];
  if (companies.length) or.push({ companies: { $in: companies } });
  if (words.length) or.push({ title: new RegExp(words.join('|'), 'i') });
  if (!or.length) return [];
  const questions = await Question.find({ $or: or }).limit(MAX_SOURCES).lean();
  return questions.map((q) => toSource(q._id, q, questionToChunks(q).map((c) => c.text).join('\n'), undefined));
}

async function retrieve({ message, history = [], questionId }) {
  let focus = null;
  if (questionId && mongoose.isValidObjectId(questionId)) {
    const q = await Question.findById(questionId).lean();
    if (q) {
      const fullText = questionToChunks(q).map((c, i) => (i === 0 ? c.text : c.text.split('\n\n').slice(1).join('\n\n')));
      focus = toSource(q._id, q, fullText.join('\n').slice(0, FOCUS_MAX_CHARS), 1);
    }
  }

  const companies = detectCompanies(message, await knownCompanies());

  let results = [];
  let vectorFailed = false;
  try {
    const vector = await embedQuery(retrievalQuery(message, history));
    const searches = [vectorStore.search(vector, { limit: 12 })];
    if (companies.length) searches.push(vectorStore.search(vector, { limit: 12, filter: { companies } }));
    results = (await Promise.all(searches)).flat();
  } catch (err) {
    // e.g. embedding quota exhausted: still answer, using keyword retrieval instead.
    console.error('[rag] vector retrieval failed, using keyword fallback:', err.message);
    vectorFailed = true;
  }

  // Small boost for questions from a company the user named.
  const lowered = companies.map((c) => c.toLowerCase());
  for (const r of results) {
    if ((r.companies || []).some((c) => lowered.includes(c.toLowerCase()))) r.score += 0.03;
  }

  let sources = groupByQuestion(results).filter((s) => !focus || s.id !== focus.id);
  sources.sort((a, b) => b.score - a.score);
  const best = sources[0]?.score ?? 0;
  sources = sources.filter((s) => s.score >= MIN_SCORE && s.score >= best - RELATIVE_WINDOW).slice(0, MAX_SOURCES);

  let strategy = vectorFailed ? 'keyword' : 'vector';
  if (!sources.length && (!focus || vectorFailed)) {
    const fallback = await keywordFallback(message, companies);
    sources = fallback.filter((s) => !focus || s.id !== focus.id).slice(0, MAX_SOURCES);
    strategy = sources.length ? 'keyword' : focus ? strategy : 'none';
  }

  const ordered = focus ? [{ ...focus, focus: true }, ...sources.slice(0, MAX_SOURCES - 1)] : sources;
  return {
    sources: ordered.map((s, i) => ({ ...s, n: i + 1 })),
    companies,
    strategy,
    searchMode: vectorStore.mode(),
  };
}

module.exports = { retrieve, detectCompanies, retrievalQuery };
