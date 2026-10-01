import { API_URL } from '../config';

export async function getAIStatus(signal) {
  const res = await fetch(`${API_URL}/api/ai/status`, { signal });
  if (!res.ok) throw new Error(`Status request failed (${res.status})`);
  return res.json();
}

// Sends a chat message and reads the Server-Sent Events stream from the backend.
// Calls onSources once (retrieved questions), then onToken for each piece of the answer.
export async function streamChat({ message, history, questionId, mode, signal, onSources, onToken }) {
  const res = await fetch(`${API_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, questionId, mode }),
    signal,
  });

  if (!res.ok) {
    let text = `The server returned an error (${res.status}).`;
    try {
      const body = await res.json();
      if (body?.message) text = body.message;
    } catch {
      /* not JSON */
    }
    throw new Error(text);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finished = false;

  const handle = (block) => {
    let event = 'message';
    let data = '';
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data += line.slice(5).trim();
    }
    if (!data) return;
    const payload = JSON.parse(data);
    if (event === 'sources') onSources?.(payload);
    else if (event === 'token') onToken?.(payload.t);
    else if (event === 'error') throw new Error(payload.message || 'The AI could not answer.');
    else if (event === 'done') finished = true;
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let split;
    while ((split = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, split);
      buffer = buffer.slice(split + 2);
      handle(block);
    }
  }
  if (buffer.trim()) handle(buffer);
  if (!finished) throw new Error('The connection closed before the answer finished. Please try again.');
}
