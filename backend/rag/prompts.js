// Prompt construction for the generation step of the RAG pipeline.

const SYSTEM_PROMPT = `You are PrepPilot, the AI interview-preparation coach inside Company Prep Hub, a platform that collects real online-assessment (OA) and interview questions asked by companies.

How to answer:
- The CONTEXT block holds questions retrieved from the platform's question bank. When the user asks what a company asks, about a specific problem, or for practice material, base your answer on the CONTEXT and cite it inline with its number, like [1] or [2].
- Never invent questions, companies, or facts about what a company asked. If the CONTEXT does not cover it, say the question bank doesn't have it yet, then help with general guidance.
- For general DSA, CS fundamentals, and interview strategy you may use your own knowledge. Keep it accurate.
- Use Markdown: short paragraphs, bullet lists, and fenced code blocks with a language tag. Use the programming language the user asks for; if none is given, use C++.
- Be concise, practical and encouraging, like a senior engineer mentoring a student for placements.`;

const MODES = {
  chat: '',
  hint: 'Give exactly ONE progressive hint for the focused question. Do not reveal the full solution or any code. End by asking the user what they think the next step is.',
  approach:
    'Explain the optimal solution for the focused question: the key insight, the algorithm step by step, a short dry run on one example, time and space complexity, and clean commented code. Mention the brute-force approach briefly first.',
  followups:
    'List 4 to 6 follow-up questions an interviewer at the listed companies is likely to ask about the focused question (edge cases, constraints changes, optimisations, variants). Give a one-line pointer to the answer for each.',
  interview:
    'Act as a technical interviewer for the focused question. Ask ONE question at a time, evaluate the candidate\'s previous reply honestly, probe edge cases and complexity, and only reveal the solution if the candidate explicitly gives up. Start by asking them to explain their initial approach if they have not yet.',
};

function formatSource(s) {
  const meta = [
    s.companies?.length ? `Companies: ${s.companies.join(', ')}` : null,
    s.difficulty ? `Difficulty: ${s.difficulty}` : null,
  ]
    .filter(Boolean)
    .join(' | ');
  const label = s.focus ? ' (the question the user is currently viewing)' : '';
  return `[${s.n}] ${s.title}${label}\n${meta}\n${s.text}`;
}

function buildUserTurn({ message, sources, mode }) {
  const context = sources.length
    ? sources.map(formatSource).join('\n\n---\n\n')
    : 'No matching questions were found in the question bank for this message.';
  const instruction = MODES[mode] ? `\n\nTASK MODE: ${MODES[mode]}` : '';
  return `<context>\n${context}\n</context>${instruction}\n\nUser message:\n${message}`;
}

// Converts chat history to Gemini "contents", merging consecutive turns from the same role.
function buildContents({ history = [], message, sources, mode }) {
  const turns = history
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.content }));
  while (turns.length && turns[0].role !== 'user') turns.shift();

  turns.push({ role: 'user', text: buildUserTurn({ message, sources, mode }) });

  const contents = [];
  for (const t of turns) {
    const last = contents[contents.length - 1];
    if (last && last.role === t.role) last.parts[0].text += `\n\n${t.text}`;
    else contents.push({ role: t.role, parts: [{ text: t.text }] });
  }
  return contents;
}

module.exports = { SYSTEM_PROMPT, MODES, buildContents, buildUserTurn };
