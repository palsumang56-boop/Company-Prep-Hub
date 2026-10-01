require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const User = require('./Models/User');
const Question = require('./Models/Questions');
const aiRoutes = require('./routes/ai');
const indexer = require('./rag/indexer');
const gemini = require('./rag/gemini');
const { seedIfEmpty } = require('./data/seed');

const app = express();
app.set('trust proxy', 1); // Render/Vercel sit behind a proxy; needed for per-IP rate limiting

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));
app.use(express.json({ limit: '200kb' }));

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

app.get('/', (req, res) => res.json({ name: 'Company Prep Hub API', status: 'ok' }));
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: db.readyState === 1 ? 'connected' : 'disconnected', ai: gemini.isConfigured() });
});

app.post('/api/signup', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const response = await newUser.save();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    if (error.code === 11000) return res.status(409).json({ error: 'An account with this email already exists' });
    if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: String(emailId || '').toLowerCase() });

    if (!user || !(await user.isPasswordCorrect(password, user.password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'internal server error' });
  }
});

// GET /api/questions?search=amazon  (prefix search on title or company, case-insensitive)
app.get('/api/questions', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      // $regex ignores collation, so case-insensitivity comes from the 'i' flag.
      // User input is escaped so characters like "C++" or "(" can't break the pattern.
      const searchRegex = new RegExp(`^${escapeRegex(String(search))}`, 'i');
      query = {
        $or: [{ title: { $regex: searchRegex } }, { companies: { $in: [searchRegex] } }],
      };
    }

    const questions = await Question.find(query);
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

app.get('/api/questions/company/:companyName', async (req, res) => {
  try {
    const questions = await Question.find({ companies: req.params.companyName }).collation({ locale: 'en', strength: 2 });
    if (questions.length === 0) {
      return res.status(404).json({ success: false, message: `No questions found for company: ${req.params.companyName}` });
    }
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, message: 'Server Error while fetching data' });
  }
});

app.get('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (question) res.status(200).json(question);
    else res.status(404).json({ message: 'Question not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/questions/add', async (req, res) => {
  try {
    const { title, companies, difficulty, problemStatement, inputFormat, outputFormat, constraints, examples, topicTags } =
      req.body;

    const savedQuestion = await new Question({
      title,
      companies, // e.g. ["BNY Mellon", "Amazon"]
      difficulty,
      problemStatement,
      inputFormat,
      outputFormat,
      constraints,
      examples,
      topicTags,
    }).save();

    // Make the new question searchable by the AI assistant (runs in the background).
    if (gemini.isConfigured()) {
      indexer.indexQuestion(savedQuestion._id).catch((err) => console.error('[rag] indexing new question failed:', err.message));
    }

    res.status(201).json({ success: true, message: 'Question added successfully!', data: savedQuestion });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ success: false, message: 'Server Error while adding question', error: error.message });
  }
});

app.use('/api/ai', aiRoutes);

// Shortly after startup: load sample questions into an empty database, then embed any
// new or changed questions, so the site and the AI are ready without a manual step.
db.once('connected', () => {
  setTimeout(async () => {
    try {
      const added = await seedIfEmpty();
      if (added) console.log(`[seed] Database was empty: added ${added} sample questions`);
    } catch (err) {
      console.error('[seed] failed:', err.message);
    }
    if (!gemini.isConfigured() || process.env.AUTO_INDEX === 'false') return;
    try {
      console.log('[rag] index sync complete:', await indexer.indexAll());
    } catch (err) {
      console.error('[rag] index sync failed:', err.message);
    }
  }, 2000);
});

const port = process.env.PORT || 4000;
// On Vercel the app is exported as a serverless function; everywhere else (Render, local) it listens.
if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Server is running on port ${port}`));
}

module.exports = app;
