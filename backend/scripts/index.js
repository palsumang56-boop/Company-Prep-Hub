// Embeds all questions into the RAG knowledge base.
// Usage: npm run index            (only new/changed questions)
//        npm run index -- --force (re-embed everything)
require('dotenv').config();
const db = require('../db');
const indexer = require('../rag/indexer');
const { isConfigured } = require('../rag/gemini');

if (!isConfigured()) {
  console.error('GEMINI_API_KEY is not set. Add it to backend/.env first.');
  process.exit(1);
}

const force = process.argv.includes('--force');
db.once('connected', async () => {
  try {
    console.log(`Indexing questions${force ? ' (force re-embed)' : ''}...`);
    const stats = await indexer.indexAll({ force });
    console.log('Done:', stats);
    process.exit(0);
  } catch (err) {
    console.error('Indexing failed:', err);
    process.exit(1);
  }
});
