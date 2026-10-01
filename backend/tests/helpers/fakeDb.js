// Test helper: replaces the Mongoose model methods the app uses with an in-memory store,
// because a real MongoDB server isn't available in the test environment.
const mongoose = require('mongoose');

function get(doc, path) {
  return path.split('.').reduce((v, k) => (v == null ? v : v[k]), doc);
}

function eq(a, b) {
  if (a instanceof mongoose.Types.ObjectId || b instanceof mongoose.Types.ObjectId) return String(a) === String(b);
  return a === b;
}

function matchValue(value, cond) {
  const values = Array.isArray(value) ? value : [value];
  if (cond instanceof RegExp) return values.some((v) => typeof v === 'string' && cond.test(v));
  if (cond && typeof cond === 'object' && !(cond instanceof mongoose.Types.ObjectId)) {
    if ('$in' in cond) return values.some((v) => cond.$in.some((c) => (c instanceof RegExp ? c.test(v) : eq(v, c))));
    if ('$nin' in cond) return !values.some((v) => cond.$nin.some((c) => eq(v, c)));
    if ('$eq' in cond) return values.some((v) => eq(v, cond.$eq));
    if ('$regex' in cond) return values.some((v) => cond.$regex.test(v));
  }
  return values.some((v) => eq(v, cond));
}

function matches(doc, filter = {}) {
  return Object.entries(filter).every(([key, cond]) => {
    if (key === '$or') return cond.some((f) => matches(doc, f));
    return matchValue(get(doc, key), cond);
  });
}

function query(run) {
  let limit = Infinity;
  let includeHidden = false;
  const q = {
    select(s) {
      if (typeof s === 'string' && s.includes('+embedding')) includeHidden = true;
      return q;
    },
    lean: () => q,
    collation: () => q,
    sort: () => q,
    limit(n) {
      limit = n;
      return q;
    },
    then(resolve, reject) {
      return Promise.resolve()
        .then(() => run({ limit, includeHidden }))
        .then(resolve, reject);
    },
  };
  return q;
}

function install({ Question, KnowledgeChunk }) {
  const store = { questions: [], chunks: [] };
  const clone = (d) => JSON.parse(JSON.stringify(d), (k, v) => v);
  const strip = (c, includeHidden) => {
    if (includeHidden) return { ...c };
    const { embedding, ...rest } = c;
    return rest;
  };

  Question.find = (filter = {}) =>
    query(({ limit }) => store.questions.filter((q) => matches(q, filter)).slice(0, limit).map((q) => ({ ...q })));
  Question.findById = (id) => query(() => store.questions.find((q) => String(q._id) === String(id)) || null);
  Question.distinct = async (field) => [...new Set(store.questions.flatMap((q) => q[field] || []))];
  Question.estimatedDocumentCount = async () => store.questions.length;
  Question.aggregate = async () => {
    const counts = {};
    store.questions.forEach((q) => (q.companies || []).forEach((c) => (counts[c] = (counts[c] || 0) + 1)));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([_id, count]) => ({ _id, count }));
  };

  KnowledgeChunk.find = (filter = {}) =>
    query(({ limit, includeHidden }) =>
      store.chunks.filter((c) => matches(c, filter)).slice(0, limit).map((c) => strip(c, includeHidden))
    );
  KnowledgeChunk.countDocuments = async (filter = {}) => store.chunks.filter((c) => matches(c, filter)).length;
  KnowledgeChunk.aggregate = async () => {
    throw new Error('$vectorSearch is not supported by this deployment');
  };
  KnowledgeChunk.deleteMany = async (filter = {}) => {
    const before = store.chunks.length;
    store.chunks = store.chunks.filter((c) => !matches(c, filter));
    return { deletedCount: before - store.chunks.length };
  };
  KnowledgeChunk.bulkWrite = async (ops) => {
    for (const { updateOne } of ops) {
      const existing = store.chunks.find((c) => matches(c, updateOne.filter));
      if (existing) Object.assign(existing, updateOne.update.$set);
      else store.chunks.push({ _id: new mongoose.Types.ObjectId(), ...updateOne.update.$set });
    }
    return { ok: 1 };
  };

  return {
    store,
    addQuestion(q) {
      const doc = { _id: new mongoose.Types.ObjectId(), companies: [], topicTags: [], examples: [], ...clone(q) };
      store.questions.push(doc);
      return doc;
    },
  };
}

module.exports = { install, matches };
