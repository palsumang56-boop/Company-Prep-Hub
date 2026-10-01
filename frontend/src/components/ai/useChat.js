import { useCallback, useEffect, useRef, useState } from 'react';
import { getAIStatus, streamChat } from '../../lib/aiClient';

let nextId = 0;
const uid = () => `m${Date.now()}-${nextId++}`;

// Chat state for one conversation with the AI coach.
export function useChat({ questionId } = {}) {
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [waking, setWaking] = useState(false);
  // A mock interview keeps going until the user ends it or picks another action.
  const [sticky, setSticky] = useState(null);
  const stickyRef = useRef(null);
  const abortRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const patch = (id, update) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...(typeof update === 'function' ? update(m) : update) } : m)));

  const send = useCallback(
    async (text, { mode: chosenMode } = {}) => {
      const message = text.trim();
      if (!message || abortRef.current) return;
      if (chosenMode) {
        stickyRef.current = chosenMode === 'interview' ? 'interview' : null;
        setSticky(stickyRef.current);
      }
      const mode = chosenMode || stickyRef.current || 'chat';

      const history = messagesRef.current
        .filter((m) => m.status === 'done' || m.role === 'user')
        .map(({ role, content }) => ({ role, content }));
      const userMsg = { id: uid(), role: 'user', content: message, mode };
      const botMsg = { id: uid(), role: 'assistant', content: '', retrieval: null, status: 'streaming', request: { text: message, mode } };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;
      // Free Render instances sleep when idle; tell the user if the first byte is slow.
      const wakeTimer = setTimeout(() => setWaking(true), 5000);
      const stopWaking = () => {
        clearTimeout(wakeTimer);
        setWaking(false);
      };

      try {
        await streamChat({
          message,
          history,
          questionId,
          mode,
          signal: controller.signal,
          onSources: (retrieval) => {
            stopWaking();
            patch(botMsg.id, { retrieval });
          },
          onToken: (t) => patch(botMsg.id, (m) => ({ content: m.content + t })),
        });
        patch(botMsg.id, { status: 'done' });
      } catch (err) {
        if (controller.signal.aborted) patch(botMsg.id, (m) => ({ status: m.content ? 'done' : 'stopped' }));
        else patch(botMsg.id, { status: 'error', error: err.message || 'Something went wrong.' });
      } finally {
        stopWaking();
        abortRef.current = null;
        setBusy(false);
      }
    },
    [questionId]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const retry = useCallback(
    (botId) => {
      const failed = messagesRef.current.find((m) => m.id === botId);
      if (!failed?.request) return;
      // Remove the failed exchange, then send it again.
      setMessages((prev) => {
        const i = prev.findIndex((m) => m.id === botId);
        return prev.slice(0, Math.max(0, i - 1));
      });
      setTimeout(() => send(failed.request.text, { mode: failed.request.mode }), 0);
    },
    [send]
  );

  const endMode = useCallback(() => {
    stickyRef.current = null;
    setSticky(null);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    stickyRef.current = null;
    setSticky(null);
    setMessages([]);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { messages, busy, waking, sticky, send, stop, retry, reset, endMode };
}

// Loads /api/ai/status once per page load and shares it between components.
let statusPromise = null;
export function useAIStatus(enabled = true) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    if (!statusPromise) {
      statusPromise = getAIStatus().catch((err) => {
        statusPromise = null;
        throw err;
      });
    }
    statusPromise.then(
      (s) => alive && setStatus(s),
      () => alive && setError(true)
    );
    return () => {
      alive = false;
    };
  }, [enabled]);
  return { status, error };
}
