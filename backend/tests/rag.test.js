// End-to-end tests for the RAG pipeline: chunking, indexing, retrieval and the streaming chat API.
// Run with: npm test
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

let gemini;
let server;
let base;
let db;
const seeded = {};

function parseSse(text) {
  return text
    .split('\n\n')
    .filter((block) => block.startsWith('event:'))
    .map((block) => {
      const [eventLine, dataLine] = block.split('\n');
      return { event: eventLine.slice(7), data: JSON.parse(dataLine.slice(6)) };
    });
}

async function chat(body) {
  const res = await fetch(`${base}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, events: res.ok ? parseSse(await res.text()) : [], json: res.ok ? null : await res.json() };
}

before(async () => {
  gemini = await require('./helpers/mockGemini').start();
  Object.assign(process.env, {
    GEMINI_BASE_URL: gemini.url,
    GEMINI_API_KEY: 'test-key',
    GEMINI_CHAT_MODELS: 'busy-model,good-model',
    SKIP_DB_CONNECT: 'true',
    ADMIN_KEY: 'admin-secret',
    AI_RATE_LIMIT: '1000',
    VERCEL: '1', // stop server.js from calling listen(); the test listens itself
  });

  const fake = require('./helpers/fakeDb').install({
    Question: require('../Models/Questions'),
    KnowledgeChunk: require('../Models/KnowledgeChunk'),
  });
  db = fake;
  seeded.twoSum = fake.addQuestion({
    title: 'Two Sum Pairs',
    companies: ['Amazon', 'BNY Mellon'],
    difficulty: 'Easy',
    topicTags: ['Array', 'Hashing'],
    problemStatement: '<p>Given an array of integers and a target, return indices of the two numbers that add up to the target.</p>',
    constraints: ['2 &lt;= n &lt;= 10^5'],
    examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }],
  });
  seeded.islands = fake.addQuestion({
    title: 'Number of Islands',
    companies: ['Google'],
    difficulty: 'Medium',
    topicTags: ['Graph', 'BFS'],
    problemStatement: '<p>Given a 2D grid of land and water, count the number of islands using BFS or DFS traversal.</p>',
  });
  seeded.lru = fake.addQuestion({
    title: 'LRU Cache Design',
    companies: ['Microsoft', 'Amazon'],
    difficulty: 'Hard',
    topicTags: ['Design', 'Linked List'],
    problemStatement: '<p>Design a least recently used cache with get and put in O(1) time.</p>',
  });

  const app = require('../server');
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  gemini?.close();
  await require('mongoose').disconnect();
});

test('chunker strips HTML and keeps the question header on every chunk', () => {
  const { questionToChunks, stripHtml, splitText } = require('../rag/chunker');
  assert.equal(stripHtml('<p>a &lt; b</p><ul><li>x</li></ul>'), 'a < b\n- x');
  const long = { title: 'Long One', companies: ['Acme'], difficulty: 'Hard', problemStatement: 'word '.repeat(2000) };
  const chunks = questionToChunks(long);
  assert.ok(chunks.length > 1, 'long statements are split');
  for (const c of chunks) {
    assert.ok(c.text.startsWith('Title: Long One\nCompanies: Acme'), 'each chunk carries the header');
    assert.ok(c.text.length <= 1800, `chunk too long: ${c.text.length}`);
  }
  for (const piece of splitText('a\n'.repeat(3000), 500, 50)) assert.ok(piece.length <= 500);
});

test('reindex is admin-only and embeds every question once', async () => {
  const denied = await fetch(`${base}/api/ai/reindex`, { method: 'POST' });
  assert.equal(denied.status, 401);

  const res = await fetch(`${base}/api/ai/reindex`, { method: 'POST', headers: { 'x-admin-key': 'admin-secret' } });
  const stats = await res.json();
  assert.equal(res.status, 200, JSON.stringify(stats));
  assert.equal(stats.questions, 3);
  assert.equal(stats.embedded, 3);
  assert.equal(db.store.chunks.length, 3);
  assert.equal(db.store.chunks[0].embedding.length, 768);
  assert.equal(gemini.calls.embed.at(-1).requests[0].taskType, 'RETRIEVAL_DOCUMENT');

  const again = await (await fetch(`${base}/api/ai/reindex`, { method: 'POST', headers: { 'x-admin-key': 'admin-secret' } })).json();
  assert.equal(again.embedded, 0, 'unchanged questions are not re-embedded');
  assert.equal(again.unchanged, 3);
});

test('status reports the index and falls back to in-memory search without Atlas', async () => {
  const status = await (await fetch(`${base}/api/ai/status`)).json();
  assert.equal(status.configured, true);
  assert.equal(status.questions, 3);
  assert.equal(status.indexedChunks, 3);
  assert.equal(status.searchMode, 'in-memory-cosine');
  assert.deepEqual(status.topCompanies[0], 'Amazon');
});

test('chat retrieves the relevant question and streams a grounded answer', async () => {
  const { status, events } = await chat({ message: 'How do I count islands in a grid with BFS?' });
  assert.equal(status, 200);
  const sources = events.find((e) => e.event === 'sources').data;
  assert.equal(sources.sources[0].title, 'Number of Islands');
  assert.equal(sources.sources[0].n, 1);
  assert.equal(sources.sources[0].text, undefined, 'raw chunk text is not sent to the browser');

  const answer = events.filter((e) => e.event === 'token').map((e) => e.data.t).join('');
  assert.equal(answer, 'Here is what the question bank says: see [1] for details.');
  assert.ok(!answer.includes('secret thoughts'), 'thought parts are filtered out');
  assert.equal(events.at(-1).event, 'done');

  // Fallback order: busy-model (429) -> good-model, retried without thinkingConfig after a 400.
  const models = gemini.calls.chat.slice(-4).map((c) => c.model);
  assert.deepEqual(models, ['busy-model', 'busy-model', 'good-model', 'good-model']);
  const prompt = gemini.calls.chat.at(-1).body;
  assert.match(prompt.systemInstruction.parts[0].text, /PrepPilot/);
  assert.match(prompt.contents.at(-1).parts[0].text, /\[1\] Number of Islands/);
});

test('company names in the question narrow retrieval to that company', async () => {
  const { events } = await chat({ message: 'What did Microsoft ask?' });
  const { sources, companies } = events.find((e) => e.event === 'sources').data;
  assert.deepEqual(companies, ['Microsoft']);
  assert.equal(sources[0].title, 'LRU Cache Design');
});

test('question-scoped modes put the viewed question first and send the mode instruction', async () => {
  const { events } = await chat({ message: 'Give me a hint', questionId: String(seeded.twoSum._id), mode: 'hint' });
  const { sources } = events.find((e) => e.event === 'sources').data;
  assert.equal(sources[0].id, String(seeded.twoSum._id));
  assert.equal(sources[0].focus, true);
  const turn = gemini.calls.chat.at(-1).body.contents.at(-1).parts[0].text;
  assert.match(turn, /TASK MODE: Give exactly ONE progressive hint/);
  assert.match(turn, /\(the question the user is currently viewing\)/);
});

test('conversation history is passed to the model with correct roles', async () => {
  await chat({
    message: 'And its complexity?',
    history: [
      { role: 'assistant', content: 'Hi! Ask me anything.' },
      { role: 'user', content: 'Explain the LRU cache question' },
      { role: 'assistant', content: 'It uses a hash map plus a doubly linked list.' },
    ],
  });
  const contents = gemini.calls.chat.at(-1).body.contents;
  assert.deepEqual(
    contents.map((c) => c.role),
    ['user', 'model', 'user'],
    'leading assistant greeting is dropped and roles alternate'
  );
  // Follow-up retrieval uses the previous user turn, so the LRU question is found.
  assert.match(contents.at(-1).parts[0].text, /LRU Cache Design/);
});

test('invalid input is rejected before calling the AI', async () => {
  assert.equal((await chat({ message: '' })).status, 400);
  assert.equal((await chat({ message: 'hi', mode: 'nope' })).status, 400);
  assert.equal((await chat({ message: 'hi', questionId: 'not-an-id' })).status, 400);
  assert.equal((await chat({ message: 'x'.repeat(2001) })).status, 400);
});

test('existing question search no longer crashes on regex characters', async () => {
  const Question = require('../Models/Questions');
  let captured;
  const original = Question.find;
  Question.find = (filter) => {
    captured = filter;
    return original({});
  };
  const res = await fetch(`${base}/api/questions?search=${encodeURIComponent('C++ (hard')}`);
  Question.find = original;
  assert.equal(res.status, 200);
  assert.equal(captured.$or[0].title.$regex.source, '^C\\+\\+ \\(hard');
});

test('user JSON never includes the password hash', () => {
  const User = require('../Models/User');
  const user = new User({ emailId: 'A@B.com', password: 'hashed-value' });
  const json = JSON.parse(JSON.stringify(user));
  assert.equal(json.password, undefined);
  assert.equal(json.emailId, 'a@b.com');
});
