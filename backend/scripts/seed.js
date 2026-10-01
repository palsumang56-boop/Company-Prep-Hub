// Adds the sample questions (npm run seed) or removes them (npm run seed -- --remove).
require('dotenv').config();
const db = require('../db');
const { seedSamples, removeSamples } = require('../data/seed');

const remove = process.argv.includes('--remove');
db.once('connected', async () => {
  try {
    if (remove) console.log(`Removed ${await removeSamples()} sample questions.`);
    else console.log(`Added ${await seedSamples()} sample questions. Run "npm run index" to embed them.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
});
