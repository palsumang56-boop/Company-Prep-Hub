// Vector search over KnowledgeChunk documents.
// Uses MongoDB Atlas Vector Search when available, and falls back to an in-memory
// cosine-similarity scan (fine for a few thousand chunks) on any other MongoDB.
const mongoose = require('mongoose');
const KnowledgeChunk = require('../Models/KnowledgeChunk');
const { EMBED_MODEL, EMBED_DIMS } = require('./gemini');

const INDEX_NAME = process.env.VECTOR_INDEX_NAME || 'vector_index';
const CACHE_TTL_MS = 5 * 60 * 1000;

const state = {
  atlas: null, // null = unknown yet, true = $vectorSearch works, false = not available
  cache: null,
  cacheLoadedAt: 0,
};

function invalidateCache() {
  state.cache = null;
}

function nativeCollection() {
  return mongoose.connection.db.collection(KnowledgeChunk.collection.collectionName);
}

function indexDefinition() {
  return {
    fields: [
      { type: 'vector', path: 'embedding', numDimensions: EMBED_DIMS, similarity: 'cosine' },
      { type: 'filter', path: 'question' },
      { type: 'filter', path: 'companies' },
      { type: 'filter', path: 'difficulty' },
      { type: 'filter', path: 'embeddingModel' },
    ],
  };
}

// Creates (or updates) the Atlas Vector Search index. Safe to call repeatedly.
async function ensureVectorIndex() {
  try {
    const coll = nativeCollection();
    const existing = await coll.listSearchIndexes(INDEX_NAME).toArray();
    const current = existing[0];
    if (!current) {
      await coll.createSearchIndex({ name: INDEX_NAME, type: 'vectorSearch', definition: indexDefinition() });
      console.log(`[rag] Created Atlas vector search index "${INDEX_NAME}" (it takes about a minute to build)`);
    } else {
      const dims = current.latestDefinition?.fields?.find((f) => f.type === 'vector')?.numDimensions;
      if (dims && dims !== EMBED_DIMS) {
        await coll.updateSearchIndex(INDEX_NAME, indexDefinition());
        console.log(`[rag] Updated vector index "${INDEX_NAME}" to ${EMBED_DIMS} dimensions`);
      }
    }
    return true;
  } catch (err) {
    console.log(`[rag] Atlas Vector Search not available, using in-memory search (${err.message})`);
    state.atlas = false;
    return false;
  }
}

async function loadCache() {
  const docs = await KnowledgeChunk.find({ embeddingModel: EMBED_MODEL, dims: EMBED_DIMS })
    .select('+embedding')
    .lean();
  state.cache = docs
    .filter((d) => Array.isArray(d.embedding) && d.embedding.length === EMBED_DIMS)
    .map((d) => ({ ...d, embedding: Float32Array.from(d.embedding) }));
  state.cacheLoadedAt = Date.now();
  return state.cache;
}

function matchesFilter(doc, filter = {}) {
  if (filter.question && String(doc.question) !== String(filter.question)) return false;
  if (filter.companies?.length) {
    const wanted = filter.companies.map((c) => c.toLowerCase());
    if (!(doc.companies || []).some((c) => wanted.includes(c.toLowerCase()))) return false;
  }
  if (filter.difficulty && doc.difficulty !== filter.difficulty) return false;
  return true;
}

async function memorySearch(queryVector, { limit, filter }) {
  const fresh = state.cache && Date.now() - state.cacheLoadedAt < CACHE_TTL_MS;
  const docs = fresh ? state.cache : await loadCache();
  const q = Float32Array.from(queryVector);
  const scored = [];
  for (const doc of docs) {
    if (!matchesFilter(doc, filter)) continue;
    let dot = 0;
    for (let i = 0; i < q.length; i++) dot += q[i] * doc.embedding[i];
    // Same 0..1 scale as Atlas cosine scores: (1 + cosine) / 2
    scored.push({ doc, score: (1 + dot) / 2 });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ doc, score }) => {
    const { embedding, ...rest } = doc;
    return { ...rest, score };
  });
}

function atlasFilter(filter = {}) {
  const f = { embeddingModel: { $eq: EMBED_MODEL } };
  if (filter.question) f.question = { $eq: new mongoose.Types.ObjectId(String(filter.question)) };
  if (filter.companies?.length) f.companies = { $in: filter.companies };
  if (filter.difficulty) f.difficulty = { $eq: filter.difficulty };
  return f;
}

async function atlasSearch(queryVector, { limit, filter }) {
  return KnowledgeChunk.aggregate([
    {
      $vectorSearch: {
        index: INDEX_NAME,
        path: 'embedding',
        queryVector,
        numCandidates: Math.max(limit * 20, 100),
        limit,
        filter: atlasFilter(filter),
      },
    },
    {
      $project: {
        question: 1,
        chunkIndex: 1,
        text: 1,
        title: 1,
        companies: 1,
        difficulty: 1,
        topicTags: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);
}

// Returns the `limit` most similar chunks, each with a 0..1 `score`.
async function search(queryVector, { limit = 10, filter = {} } = {}) {
  if (state.atlas !== false) {
    try {
      const results = await atlasSearch(queryVector, { limit, filter });
      if (results.length > 0) {
        state.atlas = true;
        return results;
      }
      // Empty results can mean the index is still building, so check memory too.
    } catch (err) {
      if (state.atlas !== true) {
        console.log(`[rag] $vectorSearch failed, switching to in-memory search (${err.message})`);
        state.atlas = false;
      } else {
        console.error('[rag] $vectorSearch error:', err.message);
      }
    }
  }
  return memorySearch(queryVector, { limit, filter });
}

function mode() {
  if (state.atlas === true) return 'atlas-vector-search';
  if (state.atlas === false) return 'in-memory-cosine';
  return 'auto';
}

module.exports = { search, ensureVectorIndex, invalidateCache, mode, INDEX_NAME };
