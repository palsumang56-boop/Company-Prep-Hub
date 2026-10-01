// Turns a Question document into plain-text chunks that can be embedded.
const crypto = require('crypto');

const MAX_CHARS = 1800;
const OVERLAP_CHARS = 200;

const ENTITIES = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&nbsp;': ' ', '&quot;': '"', '&#39;': "'", '&apos;': "'" };

function stripHtml(html = '') {
  return String(html)
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|pre|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(lt|gt|amp|nbsp|quot|#39|apos);/g, (m) => ENTITIES[m] || m)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

function header(q) {
  const lines = [`Title: ${q.title}`];
  if (q.companies?.length) lines.push(`Companies: ${q.companies.join(', ')}`);
  if (q.difficulty) lines.push(`Difficulty: ${q.difficulty}`);
  if (q.topicTags?.length) lines.push(`Topics: ${q.topicTags.join(', ')}`);
  return lines.join('\n');
}

function body(q) {
  const parts = [];
  const statement = stripHtml(q.problemStatement || q.description || '');
  if (statement) parts.push(`Problem:\n${statement}`);
  if (q.inputFormat) parts.push(`Input format: ${stripHtml(q.inputFormat)}`);
  if (q.outputFormat) parts.push(`Output format: ${stripHtml(q.outputFormat)}`);
  const constraints = Array.isArray(q.constraints) ? q.constraints : q.constraints ? [q.constraints] : [];
  if (constraints.length) parts.push(`Constraints:\n${constraints.map((c) => `- ${stripHtml(c)}`).join('\n')}`);
  (q.examples || []).forEach((ex, i) => {
    const lines = [`Example ${i + 1}:`];
    if (ex.input) lines.push(`Input: ${ex.input}`);
    if (ex.output) lines.push(`Output: ${ex.output}`);
    if (ex.explanation) lines.push(`Explanation: ${stripHtml(ex.explanation)}`);
    parts.push(lines.join('\n'));
  });
  return parts.join('\n\n');
}

// Splits long text on paragraph and line boundaries, keeping a small overlap between chunks.
function splitText(text, maxChars = MAX_CHARS, overlap = OVERLAP_CHARS) {
  if (text.length <= maxChars) return [text];

  // Break the text into units that each fit in a chunk (lines, or slices of very long lines).
  const step = Math.max(1, maxChars - overlap);
  const units = [];
  for (const line of text.split('\n')) {
    if (line.length <= maxChars) units.push(line);
    else for (let i = 0; i < line.length; i += step) units.push(line.slice(i, i + step));
  }

  const chunks = [];
  let current = '';
  for (const unit of units) {
    const candidate = current ? `${current}\n${unit}` : unit;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) chunks.push(current);
    const tail = current.slice(-overlap);
    current = tail && tail.length + 1 + unit.length <= maxChars ? `${tail}\n${unit}` : unit;
  }
  if (current.trim()) chunks.push(current);
  return chunks.map((c) => c.trim()).filter(Boolean);
}

// Every chunk starts with the question's title/company/difficulty header,
// so each one still makes sense on its own when retrieved.
function questionToChunks(q) {
  const head = header(q);
  const text = body(q);
  const room = Math.max(400, MAX_CHARS - head.length - 2);
  const bodies = text ? splitText(text, room) : [''];
  return bodies.map((b, chunkIndex) => ({
    chunkIndex,
    text: b ? `${head}\n\n${b}` : head,
  }));
}

function hashChunk(text, model, dims) {
  return crypto.createHash('sha256').update(`${model}|${dims}|${text}`).digest('hex');
}

module.exports = { stripHtml, questionToChunks, splitText, hashChunk };
