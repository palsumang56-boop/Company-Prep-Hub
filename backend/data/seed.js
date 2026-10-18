// Loads the sample questions into the database.
const Question = require('../Models/Questions');
const samples = require('./sampleQuestions');

// Inserts any sample question whose title isn't in the database yet. Existing questions, real or
// sample, are never changed. Returns how many were added.
async function seedSamples() {
  const ops = samples.map(({ title, ...rest }) => ({
    updateOne: { filter: { title }, update: { $setOnInsert: rest }, upsert: true },
  }));
  let result;
  try {
    result = await Question.bulkWrite(ops, { ordered: false });
  } catch (err) {
    // A real question whose title differs from a sample only in letter case trips the
    // case-insensitive unique index. That one is skipped; the other inserts still go through.
    if (!err.result) throw err;
    result = err.result;
  }
  return result.upsertedCount ?? result.nUpserted ?? 0;
}

// Runs on server start: adds any sample question that's missing, so every company in the samples
// has questions even when the database already holds real ones. Set SEED_SAMPLE_DATA=false to skip.
async function seedMissingSamples() {
  if (process.env.SEED_SAMPLE_DATA === 'false') return 0;
  return seedSamples();
}

async function removeSamples() {
  const result = await Question.deleteMany({ title: { $in: samples.map((s) => s.title) } });
  return result.deletedCount || 0;
}

module.exports = { seedSamples, seedMissingSamples, removeSamples, count: samples.length };
