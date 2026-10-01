// Loads the sample questions into the database.
const Question = require('../Models/Questions');
const samples = require('./sampleQuestions');

// Inserts any sample question whose title isn't in the database yet. Returns how many were added.
async function seedSamples() {
  const ops = samples.map(({ title, ...rest }) => ({
    updateOne: { filter: { title }, update: { $setOnInsert: rest }, upsert: true },
  }));
  const result = await Question.bulkWrite(ops, { ordered: false });
  return result.upsertedCount || 0;
}

// Seeds only while the collection holds nothing but sample questions (or nothing at all), so real
// data is never mixed with samples, and samples added to sampleQuestions.js appear on the next start.
async function seedIfOnlySamples() {
  if (process.env.SEED_SAMPLE_DATA === 'false') return 0;
  const hasRealQuestions = await Question.exists({ title: { $nin: samples.map((s) => s.title) } });
  if (hasRealQuestions) return 0;
  return seedSamples();
}

async function removeSamples() {
  const result = await Question.deleteMany({ title: { $in: samples.map((s) => s.title) } });
  return result.deletedCount || 0;
}

module.exports = { seedSamples, seedIfOnlySamples, removeSamples, count: samples.length };
