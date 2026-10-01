// Keeps KnowledgeChunk embeddings in sync with the Question collection.
// Only new or changed chunks are sent to Gemini, so re-running it is cheap.
const Question = require('../Models/Questions');
const KnowledgeChunk = require('../Models/KnowledgeChunk');
const { embedTexts, EMBED_MODEL, EMBED_DIMS } = require('./gemini');
const { questionToChunks, hashChunk } = require('./chunker');
const vectorStore = require('./vectorStore');

let running = null;

function chunkDocsFor(question) {
  return questionToChunks(question).map(({ chunkIndex, text }) => ({
    question: question._id,
    chunkIndex,
    text,
    hash: hashChunk(text, EMBED_MODEL, EMBED_DIMS),
    embeddingModel: EMBED_MODEL,
    dims: EMBED_DIMS,
    title: question.title,
    companies: question.companies || [],
    difficulty: question.difficulty,
    topicTags: question.topicTags || [],
  }));
}

async function syncQuestions(questions, { force = false } = {}) {
  const ids = questions.map((q) => q._id);
  const existing = await KnowledgeChunk.find({ question: { $in: ids } }).select('question chunkIndex hash').lean();
  const existingByKey = new Map(existing.map((c) => [`${c.question}:${c.chunkIndex}`, c]));

  const wanted = questions.flatMap(chunkDocsFor);
  const wantedKeys = new Set(wanted.map((c) => `${c.question}:${c.chunkIndex}`));
  const toEmbed = wanted.filter((c) => force || existingByKey.get(`${c.question}:${c.chunkIndex}`)?.hash !== c.hash);
  const stale = existing.filter((c) => !wantedKeys.has(`${c.question}:${c.chunkIndex}`));

  if (toEmbed.length) {
    const vectors = await embedTexts(toEmbed.map((c) => c.text), 'RETRIEVAL_DOCUMENT');
    await KnowledgeChunk.bulkWrite(
      toEmbed.map((c, i) => ({
        updateOne: {
          filter: { question: c.question, chunkIndex: c.chunkIndex },
          update: { $set: { ...c, embedding: vectors[i] } },
          upsert: true,
        },
      }))
    );
  }
  if (stale.length) {
    await KnowledgeChunk.deleteMany({ _id: { $in: stale.map((c) => c._id) } });
  }
  return { embedded: toEmbed.length, removed: stale.length, unchanged: wanted.length - toEmbed.length };
}

// Embeds every question. Runs at most once at a time.
async function indexAll({ force = false } = {}) {
  if (running) return running;
  running = (async () => {
    const started = Date.now();
    const questions = await Question.find({}).lean();
    const stats = { questions: questions.length, embedded: 0, removed: 0, unchanged: 0 };

    const PAGE = 50;
    for (let i = 0; i < questions.length; i += PAGE) {
      const result = await syncQuestions(questions.slice(i, i + PAGE), { force });
      stats.embedded += result.embedded;
      stats.removed += result.removed;
      stats.unchanged += result.unchanged;
    }

    // Chunks whose question was deleted
    const orphaned = await KnowledgeChunk.deleteMany({ question: { $nin: questions.map((q) => q._id) } });
    stats.removed += orphaned.deletedCount || 0;

    if (questions.length) await vectorStore.ensureVectorIndex();
    vectorStore.invalidateCache();
    stats.seconds = Math.round((Date.now() - started) / 100) / 10;
    return stats;
  })();
  try {
    return await running;
  } finally {
    running = null;
  }
}

async function indexQuestion(questionId) {
  const question = await Question.findById(questionId).lean();
  if (!question) {
    await KnowledgeChunk.deleteMany({ question: questionId });
    vectorStore.invalidateCache();
    return { embedded: 0, removed: 0, unchanged: 0 };
  }
  const result = await syncQuestions([question]);
  vectorStore.invalidateCache();
  return result;
}

module.exports = { indexAll, indexQuestion };
